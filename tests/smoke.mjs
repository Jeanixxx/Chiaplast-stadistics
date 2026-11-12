// Prueba de humo end-to-end sobre dist/ (requiere `npm run build` y Playwright instalado).
// Uso: npm test   (si Playwright no está disponible, la prueba se omite con aviso).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = resolve('dist');
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

let chromium;
try {
  const spec = process.env.PLAYWRIGHT_MODULE || 'playwright';
  const mod = await import(isAbsolute(spec) ? pathToFileURL(spec).href : spec);
  chromium = mod.chromium ?? mod.default?.chromium;
} catch {
  console.log('[smoke] Playwright no disponible: prueba omitida. Instálalo o define PLAYWRIGHT_MODULE.');
  process.exit(0);
}

const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const body = await readFile(join(DIST, path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); };

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(8000);
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(e.message));
page.on('dialog', d => d.dismiss().catch(() => {}));
// Sin red en CI de pruebas: se bloquean los servicios externos (Supabase); las librerías ya van empaquetadas.
await page.route(/supabase\.co/, r => r.abort());
await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => !!window.__chiaplastState, null, { timeout: 15000 });

// 1) Todas las vistas se renderizan sin errores.
const views = await page.$$eval('.nav button[data-view]', bs => bs.map(b => b.dataset.view));
check(views.length >= 20, `navegación con ${views.length} vistas`);
for (const v of views) {
  await page.evaluate(v => document.querySelector(`.nav button[data-view="${v}"]`)?.click(), v);
  await page.waitForTimeout(80);
}
check(pageErrors.length === 0, `sin errores al recorrer las vistas${pageErrors.length ? ': ' + pageErrors.slice(0, 3).join(' | ') : ''}`);

// 2) Los handlers usados por el HTML están expuestos en window.
// Solo llamadas a funciones sueltas (no métodos ni palabras clave).
const handlerNames = await page.$$eval('[onclick],[onchange],[oninput]', els => [...new Set(els.flatMap(el =>
  ['onclick', 'onchange', 'oninput'].map(a => el.getAttribute(a) || '').join(' ').match(/(?<![.\w$])[A-Za-z_$][\w$]*(?=\()/g) || []))].filter(n => n !== 'if'));
const missing = await page.evaluate(names => names.filter(n => typeof window[n] !== 'function'), handlerNames);
check(handlerNames.length > 20 && missing.length === 0, `handlers HTML expuestos (${handlerNames.length})${missing.length ? ', faltan: ' + missing.join(', ') : ''}`);

// 3) Interacción real: agregar una tarea Kanban y comprobar que llega al estado y se guarda.
await page.evaluate(() => document.querySelector('.nav button[data-view="mtKanban"]')?.click());
const before = await page.evaluate(() => window.__chiaplastState.db.kanban.length);
// El overlay de acceso (sin sesión de Supabase) bloquea clics de usuario; la prueba dispara los mismos eventos vía DOM.
await page.evaluate(() => { const i = document.getElementById('mtTaskTitle'); i.value = 'Prueba de humo'; });
await page.evaluate(() => document.querySelector('#mtKanban button.btn.primary').click());
const after = await page.evaluate(() => window.__chiaplastState.db.kanban.length);
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('SL_CMMS_DB_v2') || '{}').kanban?.some(t => t.title === 'Prueba de humo'));
check(after === before + 1 && stored, 'agregar tarea Kanban actualiza el estado y localStorage');

// 4) Modo oscuro (función global expuesta).
const darkBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));
await page.evaluate(() => window.toggleDarkMode());
const darkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
check(darkBefore !== darkAfter, 'toggleDarkMode cambia la clase dark');

await browser.close();
server.close();
if (failures.length) { console.error(`\n${failures.length} prueba(s) fallida(s)`); process.exit(1); }
console.log('\nSmoke test OK');

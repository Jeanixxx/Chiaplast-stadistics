// Construye la app web/PWA en dist/: empaqueta src/ con esbuild (sin CDN) y genera el service worker.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, rm, copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';

const root = resolve('.');
const dist = resolve('dist');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'icons'), { recursive: true });

// 1) JavaScript: un solo bundle IIFE (funciona con file:// en Electron y en el WebView de Android).
await build({
  entryPoints: [join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  outfile: join(dist, 'app.js'),
  legalComments: 'none',
  logLevel: 'warning',
});

// 2) Estáticos.
for (const file of ['index.html', 'manifest.webmanifest']) {
  await copyFile(join(root, file), join(dist, file));
}
await copyFile(join(root, 'src/styles/styles.css'), join(dist, 'styles.css'));
await copyFile(join(root, 'icons/chiaplast.svg'), join(dist, 'icons/chiaplast.svg'));

// 3) Service worker: lista de precarga = archivos reales de dist; versión = hash del contenido.
async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full));
    else out.push(full);
  }
  return out;
}
const assets = (await listFiles(dist)).map(f => relative(dist, f).split('\\').join('/')).sort();
const hash = createHash('sha256');
for (const a of assets) hash.update(await readFile(join(dist, a)));
const version = hash.digest('hex').slice(0, 12);
const shell = ['./', ...assets.map(a => './' + a)];
const template = await readFile(join(root, 'pwa/sw.template.js'), 'utf8');
const sw = template
  .replace('const CACHE_NAME = CACHE_PREFIX + "__CACHE_VERSION__";', `const CACHE_NAME = CACHE_PREFIX + "${version}";`)
  .replace('const SHELL = __SHELL__;', `const SHELL = ${JSON.stringify(shell, null, 2)};`);
if (sw.includes('__CACHE_VERSION__') || sw.includes('__SHELL__')) throw new Error('Plantilla de service worker sin sustituir');
await writeFile(join(dist, 'sw.js'), sw);

console.log(`Web/PWA app built in ${dist} (${assets.length} archivos, cache ${version})`);

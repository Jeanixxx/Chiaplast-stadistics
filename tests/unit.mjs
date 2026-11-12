// Pruebas unitarias de lógica pura. Empaqueta el módulo con esbuild y lo ejecuta en Node.
import { build } from 'esbuild';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const dir = await mkdtemp(join(tmpdir(), 'chiaplast-unit-'));
const out = join(dir, 'proxima-falla.mjs');
await build({ entryPoints: [resolve('src/domain/proxima-falla.js')], bundle: true, format: 'esm', outfile: out, logLevel: 'silent' });
const { calcularProximaFalla } = await import(out + '?' + Date.now());

const d = (y, m, day) => new Date(y, m - 1, day);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok   ' + name); };

test('menos de 3 fallas devuelve null', () => {
  assert.equal(calcularProximaFalla([d(2026, 1, 1), d(2026, 1, 10)]), null);
});

test('intervalo medio y próxima falla con fechas ordenadas', () => {
  const r = calcularProximaFalla([d(2026, 1, 1), d(2026, 1, 11), d(2026, 1, 31)]); // intervalos 10 y 20 -> media 15
  assert.equal(r.n, 3);
  assert.equal(r.promedioDias, 15);
  assert.equal(r.ultima.getTime(), d(2026, 1, 31).getTime());
  assert.equal(r.proxima.getTime(), d(2026, 1, 31).getTime() + 15 * 86400000);
});

test('ordena fechas desordenadas y descarta inválidas', () => {
  const r = calcularProximaFalla([d(2026, 1, 31), new Date('x'), d(2026, 1, 1), d(2026, 1, 11)]);
  assert.equal(r.n, 3);
  assert.equal(r.ultima.getTime(), d(2026, 1, 31).getTime());
});

console.log(`\n${passed} pruebas unitarias OK`);

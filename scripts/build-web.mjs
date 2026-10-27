import { mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('dist');
const webFiles = [
  'index.html',
  'maintenance-tools.js',
  'app.js',
  'styles.css',
  'supabase-sync.js',
  'manifest.webmanifest',
  'sw.js'
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await mkdir(resolve(outputDirectory, 'icons'), { recursive: true });

for (const file of webFiles) {
  await copyFile(resolve(file), resolve(outputDirectory, file));
}
await copyFile(resolve('icons/chiaplast.svg'), resolve(outputDirectory, 'icons/chiaplast.svg'));

console.log(`Web/PWA app built in ${outputDirectory}`);

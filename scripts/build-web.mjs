import { mkdir, rm, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('dist');
const webFiles = ['index.html', 'app.js', 'styles.css'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of webFiles) {
  await copyFile(resolve(file), resolve(outputDirectory, file));
}

console.log(`Web app built in ${outputDirectory}`);

import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const publicDirectory = 'public';
const buildDirectory = join(publicDirectory, 'build');
const outputDirectory = 'vercel-output';
const outputBuildDirectory = join(outputDirectory, 'build');

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });

cpSync(buildDirectory, outputBuildDirectory, { recursive: true });

for (const file of readdirSync(publicDirectory)) {
    const source = join(publicDirectory, file);

    if (file === 'index.php' || file === 'build' || ! lstatSync(source).isFile()) {
        continue;
    }

    cpSync(source, join(outputDirectory, file));
}

if (! existsSync(join(outputDirectory, 'favicon.ico'))) {
    console.warn('Vercel output was created without favicon.ico.');
}

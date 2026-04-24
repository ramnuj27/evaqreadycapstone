import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const publicDirectory = 'public';
const buildDirectory = join(publicDirectory, 'build');
const outputDirectory = 'vercel-output';
const outputBuildDirectory = join(outputDirectory, 'build');
const outputAssetDirectory = join(outputBuildDirectory, 'assets');

rmSync(outputDirectory, { force: true, recursive: true });
mkdirSync(outputDirectory, { recursive: true });

cpSync(buildDirectory, outputBuildDirectory, { recursive: true });

const appStylesheet = readdirSync(outputAssetDirectory)
    .find((file) => /^app-.*\.css$/.test(file));

if (appStylesheet) {
    cpSync(
        join(outputAssetDirectory, appStylesheet),
        join(outputAssetDirectory, 'app-DwL8tcUk.css'),
    );
}

for (const file of readdirSync(publicDirectory)) {
    const source = join(publicDirectory, file);

    if (file === 'index.php' || file === 'build' || ! statSync(source).isFile()) {
        continue;
    }

    cpSync(source, join(outputDirectory, file));
}

if (! existsSync(join(outputDirectory, 'favicon.ico'))) {
    console.warn('Vercel output was created without favicon.ico.');
}

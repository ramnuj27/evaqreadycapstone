<?php

test('vercel entrypoint delegates to the laravel public front controller', function () {
    $entrypoint = file_get_contents(base_path('api/index.php'));

    expect($entrypoint)
        ->not->toBeFalse()
        ->and($entrypoint)
        ->toContain('/tmp/bootstrap/cache')
        ->toContain('/tmp/storage/framework/views')
        ->toContain("require __DIR__.'/../public/index.php';");
});

test('vercel deployment config targets the php runtime and builds frontend assets', function () {
    $vercelConfig = json_decode(
        (string) file_get_contents(base_path('vercel.json')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );
    $composerConfig = json_decode(
        (string) file_get_contents(base_path('composer.json')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($vercelConfig['functions']['api/index.php']['runtime'])
        ->toBe('vercel-php@0.9.0');

    expect($vercelConfig['framework'])
        ->toBeNull();

    expect($vercelConfig['buildCommand'])
        ->toContain('npm run build')
        ->toContain('cp public/build/assets/app-*.css')
        ->toContain('app-DwL8tcUk.css')
        ->toContain("! -name 'index.php'");

    expect($vercelConfig['outputDirectory'])
        ->toBe('vercel-output');

    expect($vercelConfig['rewrites'][0]['destination'])
        ->toBe('/$1');

    expect($vercelConfig['rewrites'][2]['destination'])
        ->toBe('/api/index.php');

    expect($vercelConfig['env']['LOG_CHANNEL'])
        ->toBe('stderr');

    expect($vercelConfig['env']['VIEW_COMPILED_PATH'])
        ->toBe('/tmp/storage/framework/views');

    expect($vercelConfig['env'])
        ->not->toHaveKeys([
            'APP_CONFIG_CACHE',
            'APP_EVENTS_CACHE',
            'APP_PACKAGES_CACHE',
            'APP_ROUTES_CACHE',
            'APP_SERVICES_CACHE',
        ]);

    expect($composerConfig['scripts'])
        ->toHaveKey('vercel');

    expect($composerConfig['scripts']['vercel'])
        ->toContain(
            '@php artisan config:clear --ansi',
            'npm ci --include=dev',
            'npm run build',
        );
});

test('vite build config does not depend on the wayfinder vite plugin', function () {
    $viteConfig = file_get_contents(base_path('vite.config.ts'));
    $packageConfig = json_decode(
        (string) file_get_contents(base_path('package.json')),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($viteConfig)
        ->not->toBeFalse()
        ->and($viteConfig)
        ->not->toContain('@laravel/vite-plugin-wayfinder')
        ->not->toContain('wayfinder({');

    expect($packageConfig['devDependencies'] ?? [])
        ->not->toHaveKey('@laravel/vite-plugin-wayfinder');
});

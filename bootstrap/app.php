<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\EnsureCdrrmoAdmin;
use App\Http\Middleware\EnsureConsoleAdmin;
use App\Http\Middleware\EnsureConsoleUser;
use App\Http\Middleware\EnsureOperator;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'cdrrmo.admin' => EnsureCdrrmoAdmin::class,
            'console.admin' => EnsureConsoleAdmin::class,
            'console.user' => EnsureConsoleUser::class,
            'operator' => EnsureOperator::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

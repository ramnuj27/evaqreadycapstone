<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('console evacuation ar route is not registered anymore', function () {
    expect(Route::has('evacuation-ar'))->toBeFalse();
});

test('console map monitoring page no longer contains an ar guide entry point', function () {
    $page = file_get_contents(resource_path('js/pages/map-monitoring.tsx'));

    expect($page)
        ->not->toBeFalse()
        ->and($page)
        ->not->toContain(
            'evacuationArRoute',
            'Open Barangay AR Guide',
            'Open AR Guide',
        );
});

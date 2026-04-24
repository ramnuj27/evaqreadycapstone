<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('system settings page is displayed inside the settings section', function () {
    $user = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $this->actingAs($user)
        ->get(route('system-settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/system')
            ->where('settings.general.systemName', 'EvaQReady')
            ->where('settings.general.defaultLocation', 'Mati City')
            ->where('settings.general.defaultLanguage', 'English')
            ->where('settings.general.timeFormat', '12-hour')
            ->where('settings.backup.lastBackupDate', 'January 15, 2026'),
        );
});

test('barangay committee users cannot access the system settings page', function () {
    $user = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $this->actingAs($user)
        ->get(route('system-settings'))
        ->assertForbidden();
});

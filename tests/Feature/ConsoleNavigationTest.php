<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

dataset('console-navigation-pages', [
    ['dashboard', 'dashboard', true],
    ['evacuation-monitoring', 'evacuation-monitoring', true],
    ['map-monitoring', 'map-monitoring', true],
    ['household-management', 'household-management', true],
    ['barangay-management', 'barangay-management', true],
    ['evacuation-centers', 'evacuation-centers', true],
    ['reports-analytics', 'reports-analytics', true],
    ['alerts-notifications', 'alerts-notifications', true],
]);

dataset('console-page-route-names', [
    ['evacuation-monitoring'],
    ['map-monitoring'],
    ['household-management'],
    ['barangay-management'],
    ['evacuation-centers'],
    ['reports-analytics'],
    ['alerts-notifications'],
]);

test('resident users opening the console dashboard are sent to their resident dashboard', function () {
    $user = User::factory()->create([
        'role' => 'Resident',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('resident.dashboard'));
});

test('console users can visit console navigation pages', function (
    string $routeName,
    string $component,
    bool $expectsDashboardData,
) {
    $user = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $this->actingAs($user);

    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(function (Assert $page) use (
            $component,
            $expectsDashboardData,
        ) {
            $page->component($component);

            if ($expectsDashboardData) {
                $page->has('dashboard.overview')
                    ->has('dashboard.command')
                    ->has('dashboard.alerts');
            }
        });
})->with('console-navigation-pages');

dataset('cdrrmo-only-pages', [
    ['user-management'],
    ['system-settings'],
]);

dataset('legacy-cdrrmo-roles', [
    ['main_admin'],
    ['admin'],
]);

test('barangay committee users cannot visit cdrrmo only pages', function (
    string $routeName,
) {
    $user = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertForbidden();
})->with('cdrrmo-only-pages');

test('operators cannot visit admin console pages', function (
    string $routeName,
) {
    $user = User::factory()->create([
        'role' => 'Operator',
    ]);

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertForbidden();
})->with('cdrrmo-only-pages');

test('resident users cannot visit console pages', function (
    string $routeName,
) {
    $user = User::factory()->create([
        'role' => 'Resident',
    ]);

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertForbidden();
})->with('console-page-route-names');

test('legacy cdrrmo admin roles can visit admin console pages and receive normalized auth role', function (
    string $legacyRole,
    string $routeName,
) {
    $user = User::factory()->create([
        'role' => $legacyRole,
    ]);

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.role', 'CDRRMO Admin'));
})->with('legacy-cdrrmo-roles')->with('cdrrmo-only-pages');

<?php

use App\Models\EvacuationCenter;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\MatiCityAddressOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('authenticated users can view the evacuation centers page', function () {
    $admin = User::factory()->create();

    $head = User::factory()->create([
        'name' => 'Juan Dela Cruz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $head->id,
    ]);

    HouseholdMember::factory()->count(2)->create([
        'household_id' => $household->id,
    ]);

    $this->actingAs($admin);

    $this->get(route('evacuation-centers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-centers')
            ->where('dashboard.evacuationCenters.prototype', true)
            ->where('dashboard.evacuationCenters.actions.canManageCenters', false)
            ->where('dashboard.evacuationCenters.summary.active', 3)
            ->where('dashboard.evacuationCenters.summary.total', 4)
            ->has('dashboard.evacuationCenters.centers', 4)
            ->has('dashboard.evacuationMonitoring.rows', 3));
});

test('evacuation centers page uses live center records when available', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);

    $center = EvacuationCenter::factory()->create([
        'barangay' => 'Central',
        'capacity' => 120,
        'detail' => 'Open for families from coastal zones.',
        'is_active' => true,
        'name' => 'Central Command Center',
    ]);

    $this->actingAs($admin)
        ->get(route('evacuation-centers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-centers')
            ->where('dashboard.evacuationCenters.prototype', false)
            ->where('dashboard.evacuationCenters.actions.canManageCenters', true)
            ->where('dashboard.evacuationCenters.summary.total', 1)
            ->where('dashboard.evacuationCenters.centers.0.id', $center->id)
            ->where('dashboard.evacuationCenters.centers.0.name', 'Central Command Center')
            ->where('dashboard.evacuationCenters.centers.0.status', 'Available'));
});

test('admin can create update and delete evacuation centers', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);

    $this->actingAs($admin)
        ->from(route('evacuation-centers'))
        ->post(route('evacuation-centers.store'), [
            'barangay' => 'Central',
            'capacity' => 150,
            'detail' => 'Primary city command shelter.',
            'is_active' => true,
            'name' => 'Central City Center',
        ])
        ->assertRedirect(route('evacuation-centers'));

    $center = EvacuationCenter::query()
        ->where('name', 'Central City Center')
        ->firstOrFail();

    expect($center)
        ->barangay->toBe('Central')
        ->capacity->toBe(150)
        ->is_active->toBeTrue();

    $this->actingAs($admin)
        ->from(route('evacuation-centers'))
        ->put(route('evacuation-centers.update', $center), [
            'barangay' => 'Dahican',
            'capacity' => 210,
            'detail' => 'Updated seaside shelter note.',
            'is_active' => false,
            'name' => 'Dahican City Center',
        ])
        ->assertRedirect(route('evacuation-centers'));

    expect($center->refresh())
        ->barangay->toBe('Dahican')
        ->capacity->toBe(210)
        ->detail->toBe('Updated seaside shelter note.')
        ->is_active->toBeFalse()
        ->name->toBe('Dahican City Center');

    $this->actingAs($admin)
        ->from(route('evacuation-centers'))
        ->delete(route('evacuation-centers.destroy', $center))
        ->assertRedirect(route('evacuation-centers'));

    $this->assertDatabaseMissing('evacuation_centers', [
        'id' => $center->id,
    ]);
});

test('barangay committee can only manage assigned evacuation centers', function () {
    $committee = User::factory()->create([
        'barangay' => 'Dahican',
        'role' => ConsoleRole::BARANGAY_COMMITTEE,
    ]);
    $ownCenter = EvacuationCenter::factory()->create([
        'barangay' => 'Dahican',
    ]);
    $otherCenter = EvacuationCenter::factory()->create([
        'barangay' => 'Central',
    ]);

    $this->actingAs($committee)
        ->from(route('evacuation-centers'))
        ->put(route('evacuation-centers.update', $ownCenter), [
            'barangay' => 'Dahican',
            'capacity' => 90,
            'detail' => 'Barangay-owned center.',
            'is_active' => true,
            'name' => 'Dahican Committee Center',
        ])
        ->assertRedirect(route('evacuation-centers'));

    expect($ownCenter->refresh()->name)->toBe('Dahican Committee Center');

    $this->actingAs($committee)
        ->put(route('evacuation-centers.update', $otherCenter), [
            'barangay' => 'Central',
            'capacity' => 90,
            'detail' => 'Should not update.',
            'is_active' => true,
            'name' => 'Central Committee Center',
        ])
        ->assertForbidden();
});

test('evacuation centers page keeps the final table-first decision layout', function () {
    $pageFile = file_get_contents(
        resource_path('js/pages/evacuation-centers.tsx'),
    );

    expect($pageFile)
        ->not->toBeFalse()
        ->and($pageFile)
        ->toContain(
            'Search center...',
            'Add Center',
            'Total Centers',
            'Near Full',
            'Current Evacuees',
            'Available Slots',
            'Capacity Bar',
            'Evacuees',
            'View',
            'Delete',
        );
});

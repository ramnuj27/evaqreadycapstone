<?php

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('authenticated users can visit evacuation monitoring with resident records', function () {
    $admin = User::factory()->create();

    $centralHead = User::factory()->create([
        'name' => 'Lina Flores',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subDays(2),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
        'household_code' => 'EVQ-CENTRAL-001',
        'name' => 'Flores Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Rico Flores',
        'household_id' => $centralHousehold->id,
        'sort_order' => 1,
    ]);

    $dahicanHead = User::factory()->create([
        'name' => 'Mara Santos',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subHour(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
        'household_code' => 'EVQ-DAHICAN-002',
        'name' => 'Santos Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Ella Santos',
        'household_id' => $dahicanHousehold->id,
        'sort_order' => 1,
    ]);

    $badasHead = User::factory()->create([
        'name' => 'Tomas Cruz',
    ]);

    $badasHousehold = Household::factory()->create([
        'barangay' => 'Badas',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subDays(3),
        'hazard_zone' => 'landslide',
        'head_user_id' => $badasHead->id,
        'household_code' => 'EVQ-BADAS-003',
        'name' => 'Cruz Household',
    ]);

    HouseholdMember::factory()->count(29)->create([
        'household_id' => $badasHousehold->id,
    ]);

    $this->actingAs($admin);

    $this->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.evacuationMonitoring.meta.offlineMode', true)
            ->where('dashboard.evacuationMonitoring.meta.scannerConnected', false)
            ->where('dashboard.evacuationMonitoring.summary.evacuated', 0)
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 4)
            ->where('dashboard.evacuationMonitoring.summary.missing', 30)
            ->where('dashboard.evacuationMonitoring.filters.statuses.0', 'Evacuated')
            ->where('dashboard.evacuationMonitoring.filters.statuses.1', 'Not Yet Evacuated')
            ->where('dashboard.evacuationMonitoring.filters.statuses.2', 'Missing')
            ->has('dashboard.evacuationMonitoring.filters.barangays', 3)
            ->has('dashboard.evacuationMonitoring.filters.centers', 2)
            ->has('dashboard.evacuationMonitoring.rows', 34),
        );
});

test('barangay committee evacuation monitoring is scoped to the assigned barangay', function () {
    $committee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $centralHead = User::factory()->create([
        'name' => 'Ana Central',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
        'household_code' => 'EVQ-CENTRAL-010',
        'name' => 'Central Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Mika Central',
        'household_id' => $centralHousehold->id,
        'sort_order' => 1,
    ]);

    $otherHead = User::factory()->create([
        'name' => 'Rico Dahican',
    ]);

    $otherHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $otherHead->id,
        'household_code' => 'EVQ-DAHICAN-011',
        'name' => 'Dahican Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Ella Dahican',
        'household_id' => $otherHousehold->id,
        'sort_order' => 1,
    ]);

    $this->actingAs($committee)
        ->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.command.status', 'Central barangay monitoring is active.')
            ->has('dashboard.evacuationMonitoring.filters.barangays', 1)
            ->where('dashboard.evacuationMonitoring.filters.barangays.0', 'Central')
            ->has('dashboard.evacuationMonitoring.filters.centers', 1)
            ->where('dashboard.evacuationMonitoring.filters.centers.0', 'Central Evacuation Center')
            ->has('dashboard.evacuationMonitoring.rows', 2)
            ->where('dashboard.evacuationMonitoring.rows.0.barangay', 'Central')
            ->where('dashboard.evacuationMonitoring.rows.1.barangay', 'Central'));
});

test('console evacuation monitoring does not expose scanner controls', function () {
    $page = file_get_contents(resource_path('js/pages/evacuation-monitoring.tsx'));

    expect($page)
        ->not->toBeFalse()
        ->and($page)
        ->not->toContain(
            'Open QR Scanner',
            'scannerDialogOpen',
            '<DialogTitle>QR Scanner</DialogTitle>',
        )
        ->toContain('Operator Scan Feed');
});

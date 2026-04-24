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

test('authenticated users can view the barangay management page', function () {
    $admin = User::factory()->create();

    $dahicanHead = User::factory()->create([
        'name' => 'Juan Dela Cruz',
    ]);

    $mayoHead = User::factory()->create([
        'name' => 'Maria Santos',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
    ]);

    HouseholdMember::factory()->count(2)->create([
        'household_id' => $dahicanHousehold->id,
    ]);

    Household::factory()->create([
        'barangay' => 'Mayo',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'safe-zone',
        'head_user_id' => $mayoHead->id,
    ]);

    $this->actingAs($admin);

    $this->get(route('barangay-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('barangay-management')
            ->has('dashboard.barangayMonitoring', count(MatiCityAddressOptions::barangays()))
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 3)
            ->where('dashboard.evacuationMonitoring.summary.missing', 0)
            ->where('dashboard.evacuationCenters.summary.total', 4));
});

test('barangay management page keeps the simplified table-first layout', function () {
    $pageFile = file_get_contents(resource_path('js/pages/barangay-management.tsx'));

    expect($pageFile)
        ->not->toBeFalse()
        ->and($pageFile)
        ->toContain(
            'Search barangay...',
            'Total Barangays',
            'Total Households',
            'Total Evacuees',
            'Main Barangay Table',
            'Evacuation Centers',
            'View Details',
            'Critical',
            'Warning',
            'Safe',
        );
});

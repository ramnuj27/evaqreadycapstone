<?php

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

dataset('operator-pages', [
    ['operator-dashboard', 'operator-dashboard'],
    ['operator-qr-scanner', 'operator-qr-scanner'],
    ['operator-scan-history', 'operator-scan-history'],
    ['operator-offline-sync', 'operator-offline-sync'],
]);

test('operator pages are scoped to the assigned barangay roster', function (
    string $routeName,
    string $component,
) {
    $headAge = Carbon::parse('1989-03-14')->age;
    $memberAge = Carbon::parse('2014-09-01')->age;
    $operator = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $centralHead = User::factory()->create([
        'birthdate' => '1989-03-14',
        'gender' => 'female',
        'name' => 'Nora Diaz',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
        'street_address' => 'Purok 3 Riverside',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2014-09-01',
        'category' => 'Child',
        'full_name' => 'Lia Diaz',
        'gender' => 'male',
        'household_id' => $centralHousehold->id,
    ]);

    $dahicanHead = User::factory()->create([
        'name' => 'Ariel Lim',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Mara Lim',
        'household_id' => $dahicanHousehold->id,
    ]);

    $this->actingAs($operator)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('operatorModule.command.assignmentLabel', 'Central field assignment')
            ->where('operatorModule.summary.rosterTotal', 1)
            ->where('operatorModule.summary.trackedHouseholds', 1)
            ->where('operatorModule.summary.activeCenters', 1)
            ->where('operatorModule.centers.0.name', 'Central Evacuation Center')
            ->where('operatorModule.roster.0.address', 'Purok 3 Riverside')
            ->where('operatorModule.roster.0.barangay', 'Central')
            ->where('operatorModule.roster.0.householdCode', $centralHousehold->household_code)
            ->where('operatorModule.roster.0.members.0.age', $headAge)
            ->where('operatorModule.roster.0.members.0.gender', 'female')
            ->where('operatorModule.roster.0.members.0.qrReference', "{$centralHousehold->household_code}-HEAD")
            ->where('operatorModule.roster.0.members.0.role', 'Head of Family')
            ->where('operatorModule.roster.0.members.1.age', $memberAge)
            ->where('operatorModule.roster.0.members.1.gender', 'male')
            ->where('operatorModule.roster.0.members.1.qrReference', "{$centralHousehold->household_code}-M01")
            ->where('operatorModule.roster.0.members.1.role', 'Child')
            ->where('operatorModule.roster.0.qrReference', $centralHousehold->household_code)
            ->where('operatorModule.roster.0.role', 'Household QR')
            ->has('operatorModule.roster', 1)
            ->has('operatorModule.centers', 1));
})->with('operator-pages');

test('safe zone households stay available in the operator scanner roster', function () {
    $operator = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'name' => 'Mila Torres',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'safe-zone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-SAFE',
        'name' => 'Torres Household',
    ]);

    $this->actingAs($operator)
        ->get(route('operator-qr-scanner'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('operator-qr-scanner')
            ->where('operatorModule.summary.rosterTotal', 1)
            ->where('operatorModule.summary.trackedHouseholds', 1)
            ->where('operatorModule.roster.0.householdCode', $household->household_code)
            ->where('operatorModule.roster.0.qrReference', $household->household_code)
            ->where('operatorModule.roster.0.name', 'Mila Torres')
            ->where('operatorModule.roster.0.status', 'Registered'));
});

test('operator scanner exposes evacuation center choices for cross-barangay arrivals', function () {
    $operator = User::factory()->create([
        'barangay' => 'Sainz',
        'role' => 'Operator',
    ]);

    $this->actingAs($operator)
        ->get(route('operator-qr-scanner'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('operator-qr-scanner')
            ->where(
                'operatorModule.meta.defaultEvacuationCenter',
                'Sainz Evacuation Center',
            )
            ->where(
                'operatorModule.scanCenters',
                MatiCityAddressOptions::evacuationCenters(),
            ));
});

test('non-operator users cannot access operator module pages', function (
    string $routeName,
) {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $resident = User::factory()->create([
        'role' => 'Resident',
    ]);

    $this->actingAs($admin)
        ->get(route($routeName))
        ->assertForbidden();

    $this->actingAs($resident)
        ->get(route($routeName))
        ->assertForbidden();
})->with('operator-pages');

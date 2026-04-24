<?php

use App\Models\EvacuationScan;
use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\ConsoleRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('household management page renders household rows and member details', function () {
    $admin = User::factory()->create();
    $headOfFamily = User::factory()->create([
        'birthdate' => '1986-02-14',
        'contact_number' => '09123456789',
        'gender' => 'male',
        'name' => 'Juan Dela Cruz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'head_user_id' => $headOfFamily->id,
        'household_code' => 'HH-001',
        'status' => 'Active',
        'street_address' => 'Purok 1',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1988-04-02',
        'category' => 'Adult',
        'full_name' => 'Ana Dela Cruz',
        'gender' => 'female',
        'household_id' => $household->id,
        'is_pregnant' => false,
        'is_pwd' => false,
        'sort_order' => 1,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1958-01-10',
        'category' => 'Senior',
        'full_name' => 'Pedro Dela Cruz',
        'gender' => 'male',
        'household_id' => $household->id,
        'is_pregnant' => false,
        'is_pwd' => true,
        'sort_order' => 2,
    ]);

    $this->actingAs($admin);

    $this->get(route('household-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('household-management')
            ->where('householdManagement.summary.totalHouseholds', 1)
            ->where('householdManagement.summary.totalRegisteredMembers', 3)
            ->where('householdManagement.table.pagination.total', 1)
            ->where('householdManagement.table.rows.0.householdCode', 'HH-001')
            ->where('householdManagement.table.rows.0.headOfFamily', 'Juan Dela Cruz')
            ->where('householdManagement.table.rows.0.barangay', 'Dahican')
            ->where('householdManagement.table.rows.0.totalMembers', 3)
            ->where('householdManagement.table.rows.0.contactNumber', '09123456789')
            ->where('householdManagement.table.rows.0.status', 'Active')
            ->where(
                'householdManagement.table.rows.0.fullAddress',
                'Purok 1, Dahican, Mati City',
            )
            ->where(
                'householdManagement.table.rows.0.members.0.relation',
                'Head of Household',
            )
            ->where(
                'householdManagement.table.rows.0.members.1.name',
                'Ana Dela Cruz',
            )
            ->where(
                'householdManagement.table.rows.0.members.2.isPwd',
                true,
            ));
});

test('household management exposes admin mutation options', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);
    $operator = User::factory()->create([
        'role' => ConsoleRole::OPERATOR,
    ]);
    $headOfFamily = User::factory()->create();

    Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'head_user_id' => $headOfFamily->id,
        'status' => 'Active',
    ]);

    $this->actingAs($admin)
        ->get(route('household-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('householdManagement.actions', [
                'canManageHouseholds' => true,
            ])
            ->where('householdManagement.options.hazardZones.0', 'flood-prone')
            ->where('householdManagement.options.pwdTypes.0', 'visual-impairment'));

    $this->actingAs($operator)
        ->get(route('household-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('householdManagement.actions', [
                'canManageHouseholds' => false,
            ]));
});

test('admin can update a household and head of family details', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);
    $headOfFamily = User::factory()->create([
        'birthdate' => '1986-02-14',
        'contact_number' => '09123456789',
        'gender' => 'male',
        'is_pregnant' => false,
        'name' => 'Juan Dela Cruz',
    ]);
    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'head_user_id' => $headOfFamily->id,
        'name' => 'Old Household',
        'status' => 'Active',
        'street_address' => 'Purok 1',
    ]);

    $this->actingAs($admin)
        ->from(route('household-management'))
        ->put(route('household-management.update', $household), [
            'barangay' => 'Central',
            'birthdate' => '1992-07-20',
            'city' => 'Mati City',
            'contact_number' => '09170000000',
            'gender' => 'female',
            'hazard_zone' => 'coastal',
            'head_name' => 'Maria Dela Cruz',
            'household_name' => 'Dela Cruz Household',
            'is_pregnant' => true,
            'status' => 'Relocated',
            'street_address' => 'Purok 9',
        ])
        ->assertRedirect(route('household-management'));

    expect($household->refresh())
        ->barangay->toBe('Central')
        ->city->toBe('Mati City')
        ->contact_number->toBe('09170000000')
        ->hazard_zone->toBe('coastal')
        ->name->toBe('Dela Cruz Household')
        ->status->toBe('Relocated')
        ->street_address->toBe('Purok 9');

    $headOfFamily->refresh();

    expect($headOfFamily->birthdate->toDateString())->toBe('1992-07-20');
    expect($headOfFamily)
        ->contact_number->toBe('09170000000')
        ->gender->toBe('female')
        ->is_pregnant->toBeTrue()
        ->name->toBe('Maria Dela Cruz');
});

test('admin can delete a household record with related members and scans', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);
    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'status' => 'Active',
    ]);
    $member = HouseholdMember::factory()->create([
        'household_id' => $household->id,
    ]);
    $scan = EvacuationScan::factory()->create([
        'household_id' => $household->id,
    ]);

    $this->actingAs($admin)
        ->from(route('household-management'))
        ->delete(route('household-management.destroy', $household))
        ->assertRedirect(route('household-management'));

    $this->assertDatabaseMissing('households', [
        'id' => $household->id,
    ]);
    $this->assertDatabaseMissing('household_members', [
        'id' => $member->id,
    ]);
    $this->assertDatabaseMissing('evacuation_scans', [
        'id' => $scan->id,
    ]);
});

test('admin can add update and remove managed household members', function () {
    $admin = User::factory()->create([
        'role' => ConsoleRole::CDRRMO_ADMIN,
    ]);
    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
    ]);

    $this->actingAs($admin)
        ->from(route('household-management'))
        ->post(route('household-management.members.store', $household), [
            'birthdate' => '2016-05-04',
            'category' => 'Child',
            'full_name' => 'Lina Dela Cruz',
            'gender' => 'female',
            'is_pregnant' => false,
            'is_pwd' => true,
            'pwd_type' => 'hearing-impairment',
            'pwd_type_other' => null,
        ])
        ->assertRedirect(route('household-management'));

    $member = HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('full_name', 'Lina Dela Cruz')
        ->firstOrFail();

    expect($member)
        ->is_pwd->toBeTrue()
        ->pwd_type->toBe('hearing-impairment');

    $this->actingAs($admin)
        ->from(route('household-management'))
        ->put(route('household-management.members.update', $member), [
            'birthdate' => '1994-11-12',
            'category' => 'Adult',
            'full_name' => 'Leo Dela Cruz',
            'gender' => 'male',
            'is_pregnant' => false,
            'is_pwd' => false,
            'pwd_type' => null,
            'pwd_type_other' => null,
        ])
        ->assertRedirect(route('household-management'));

    $member->refresh();

    expect($member->birthdate->toDateString())->toBe('1994-11-12');
    expect($member)
        ->category->toBe('Adult')
        ->full_name->toBe('Leo Dela Cruz')
        ->gender->toBe('male')
        ->is_pwd->toBeFalse()
        ->pwd_type->toBeNull();

    $this->actingAs($admin)
        ->from(route('household-management'))
        ->delete(route('household-management.members.destroy', $member))
        ->assertRedirect(route('household-management'));

    $this->assertDatabaseMissing('household_members', [
        'id' => $member->id,
    ]);
});

test('operator cannot mutate household management records', function () {
    $operator = User::factory()->create([
        'role' => ConsoleRole::OPERATOR,
    ]);
    $household = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'status' => 'Active',
    ]);

    $this->actingAs($operator)
        ->delete(route('household-management.destroy', $household))
        ->assertForbidden();

    $this->assertDatabaseHas('households', [
        'id' => $household->id,
        'status' => 'Active',
    ]);
});

test('barangay committee can only manage households in the assigned barangay', function () {
    $committee = User::factory()->create([
        'barangay' => 'Dahican',
        'role' => ConsoleRole::BARANGAY_COMMITTEE,
    ]);
    $ownHead = User::factory()->create();
    $otherHead = User::factory()->create();
    $ownHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => 'Mati City',
        'head_user_id' => $ownHead->id,
        'status' => 'Active',
    ]);
    $otherHousehold = Household::factory()->create([
        'barangay' => 'Mayo',
        'city' => 'Mati City',
        'head_user_id' => $otherHead->id,
        'status' => 'Active',
    ]);

    $payload = [
        'barangay' => 'Dahican',
        'birthdate' => '1988-03-10',
        'city' => 'Mati City',
        'contact_number' => '09180000000',
        'gender' => 'male',
        'hazard_zone' => 'safe-zone',
        'head_name' => 'Scoped Resident',
        'household_name' => 'Scoped Household',
        'is_pregnant' => false,
        'status' => 'Active',
        'street_address' => 'Purok Scoped',
    ];

    $this->actingAs($committee)
        ->from(route('household-management'))
        ->put(route('household-management.update', $ownHousehold), $payload)
        ->assertRedirect(route('household-management'));

    expect($ownHousehold->refresh()->street_address)->toBe('Purok Scoped');

    $this->actingAs($committee)
        ->put(route('household-management.update', $otherHousehold), [
            ...$payload,
            'barangay' => 'Mayo',
        ])
        ->assertForbidden();

    expect($otherHousehold->refresh()->street_address)->not->toBe('Purok Scoped');
});

test('household management page filters by search and status', function () {
    $admin = User::factory()->create();
    $activeHead = User::factory()->create([
        'contact_number' => '09110000001',
        'name' => 'Maria Santos',
    ]);
    $inactiveHead = User::factory()->create([
        'contact_number' => '09110000002',
        'name' => 'Pedro Reyes',
    ]);

    Household::factory()->create([
        'barangay' => 'Mayo',
        'city' => 'Mati City',
        'head_user_id' => $activeHead->id,
        'household_code' => 'HH-100',
        'status' => 'Active',
        'street_address' => 'Purok 2',
    ]);

    Household::factory()->create([
        'barangay' => 'Badas',
        'city' => 'Mati City',
        'head_user_id' => $inactiveHead->id,
        'household_code' => 'HH-200',
        'status' => 'Inactive',
        'street_address' => 'Purok 3',
    ]);

    $this->actingAs($admin);

    $this->get(route('household-management', [
        'search' => 'Pedro',
        'status' => 'Inactive',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('household-management')
            ->where('householdManagement.filters.search', 'Pedro')
            ->where('householdManagement.filters.status', 'Inactive')
            ->has('householdManagement.table.rows', 1)
            ->where('householdManagement.table.rows.0.headOfFamily', 'Pedro Reyes')
            ->where('householdManagement.table.rows.0.householdCode', 'HH-200')
            ->where('householdManagement.table.rows.0.status', 'Inactive'));
});

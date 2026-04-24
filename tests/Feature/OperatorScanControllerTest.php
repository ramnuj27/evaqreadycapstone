<?php

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\EvacuationScan;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('operator scan endpoint rejects duplicate time-in requests for the same household', function () {
    $operator = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'name' => 'Dina Cruz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-222',
        'name' => 'Cruz Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Ben Cruz',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'evacuation_center_name' => 'Central Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-222',
            'type' => 'IN',
        ])
        ->assertOk();

    $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'evacuation_center_name' => 'Central Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-222',
            'type' => 'IN',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['payload'])
        ->assertJsonPath(
            'errors.payload.0',
            'Duplicate scan. This evacuee already has an active Time-In record.',
        );

    $this->assertDatabaseCount('evacuation_scans', 1);
});

test('operator scan responses expose household address and member demographics', function () {
    $headAge = Carbon::parse('1989-03-14')->age;
    $childAge = Carbon::parse('2012-04-03')->age;
    $adultAge = Carbon::parse('1997-08-20')->age;
    $operator = User::factory()->create([
        'barangay' => 'Sainz',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'birthdate' => '1989-03-14',
        'gender' => 'female',
        'name' => 'Nora Diaz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-111',
        'name' => 'Diaz Household',
        'street_address' => 'Purok 7 Riverside',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2012-04-03',
        'category' => 'Child',
        'full_name' => 'Abe Diaz',
        'gender' => 'male',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1997-08-20',
        'category' => 'Adult',
        'full_name' => 'Lia Diaz',
        'gender' => 'female',
        'household_id' => $household->id,
        'sort_order' => 2,
    ]);

    $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'attendee_refs' => [
                'EVQ-CENTRAL-111-HEAD',
                'EVQ-CENTRAL-111-M02',
            ],
            'evacuation_center_name' => 'Sainz Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-111',
            'scanned_at' => now()->subMinutes(5)->startOfSecond()->toIso8601String(),
            'type' => 'IN',
        ])
        ->assertOk()
        ->assertJsonPath('record.address', 'Purok 7 Riverside')
        ->assertJsonPath('record.barangay', 'Central')
        ->assertJsonPath('record.household_code', 'EVQ-CENTRAL-111')
        ->assertJsonPath('record.household_members.0.age', $headAge)
        ->assertJsonPath('record.household_members.0.gender', 'female')
        ->assertJsonPath('record.household_members.0.role', 'Head of Family')
        ->assertJsonPath('record.household_members.1.age', $childAge)
        ->assertJsonPath('record.household_members.1.gender', 'male')
        ->assertJsonPath('record.household_members.1.role', 'Child')
        ->assertJsonPath('record.household_members.2.age', $adultAge)
        ->assertJsonPath('record.household_members.2.gender', 'female')
        ->assertJsonPath('record.household_members.2.role', 'Family Member');
});

test('operator qr scans can tag households into a different evacuation center', function () {
    $headAge = Carbon::parse('1989-03-14')->age;
    $firstMemberAge = Carbon::parse('2010-05-01')->age;
    $secondMemberAge = Carbon::parse('1998-08-20')->age;
    $operator = User::factory()->create([
        'barangay' => 'Sainz',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'birthdate' => '1989-03-14',
        'gender' => 'female',
        'name' => 'Nora Diaz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-001',
        'name' => 'Diaz Household',
        'street_address' => 'Purok 7 Riverside',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2010-05-01',
        'category' => 'Child',
        'full_name' => 'Abe Diaz',
        'gender' => 'male',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    HouseholdMember::factory()->create([
        'category' => 'Adult',
        'birthdate' => '1998-08-20',
        'full_name' => 'Lia Diaz',
        'gender' => 'female',
        'household_id' => $household->id,
        'sort_order' => 2,
    ]);

    $scannedAt = now()->subMinutes(5)->startOfSecond();

    $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'attendee_refs' => [
                'EVQ-CENTRAL-001-HEAD',
                'EVQ-CENTRAL-001-M02',
            ],
            'evacuation_center_name' => 'Sainz Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-001',
            'scanned_at' => $scannedAt->toIso8601String(),
            'type' => 'IN',
        ])
        ->assertOk()
        ->assertJsonPath('record.address', 'Purok 7 Riverside')
        ->assertJsonPath('record.attendee_refs.0', 'EVQ-CENTRAL-001-HEAD')
        ->assertJsonPath('record.attendee_refs.1', 'EVQ-CENTRAL-001-M02')
        ->assertJsonPath('record.barangay', 'Central')
        ->assertJsonPath('record.evacuation_center_name', 'Sainz Evacuation Center')
        ->assertJsonPath('record.household_code', 'EVQ-CENTRAL-001')
        ->assertJsonPath('record.household_members.0.age', $headAge)
        ->assertJsonPath('record.household_members.0.gender', 'female')
        ->assertJsonPath('record.household_members.0.qrReference', 'EVQ-CENTRAL-001-HEAD')
        ->assertJsonPath('record.household_members.0.role', 'Head of Family')
        ->assertJsonPath('record.household_members.1.age', $firstMemberAge)
        ->assertJsonPath('record.household_members.1.gender', 'male')
        ->assertJsonPath('record.household_members.1.qrReference', 'EVQ-CENTRAL-001-M01')
        ->assertJsonPath('record.household_members.1.role', 'Child')
        ->assertJsonPath('record.household_members.2.age', $secondMemberAge)
        ->assertJsonPath('record.household_members.2.gender', 'female')
        ->assertJsonPath('record.household_members.2.qrReference', 'EVQ-CENTRAL-001-M02')
        ->assertJsonPath('record.household_members.2.role', 'Family Member')
        ->assertJsonPath('record.household_name', 'Diaz Household')
        ->assertJsonPath('record.name', 'Nora Diaz')
        ->assertJsonPath('record.payload', 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-001')
        ->assertJsonPath('record.type', 'IN')
        ->assertJsonPath('synced_at', fn (mixed $value): bool => is_string($value) && $value !== '');

    $scan = EvacuationScan::query()->firstOrFail();

    expect($scan->attendee_refs)->toBe([
        'EVQ-CENTRAL-001-HEAD',
        'EVQ-CENTRAL-001-M02',
    ]);

    $this->assertDatabaseHas('evacuation_scans', [
        'evacuation_center_name' => 'Sainz Evacuation Center',
        'household_id' => $household->id,
        'operator_user_id' => $operator->id,
        'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-001',
        'type' => 'IN',
    ]);

    $this->assertDatabaseHas('households', [
        'id' => $household->id,
        'evacuation_status' => 'evacuated',
    ]);

    $this->actingAs($operator)
        ->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.evacuationMonitoring.meta.scannerConnected', true)
            ->where('dashboard.evacuationMonitoring.summary.evacuated', 2)
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 0)
            ->where('dashboard.evacuationMonitoring.summary.missing', 1)
            ->where('dashboard.evacuationMonitoring.rows.0.evacuationCenter', null)
            ->where(
                'dashboard.evacuationMonitoring.rows.0.name',
                'Abe Diaz',
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.0.status',
                'Missing',
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.1.evacuationCenter',
                'Sainz Evacuation Center',
            )
            ->where('dashboard.evacuationMonitoring.rows.1.name', 'Lia Diaz')
            ->where('dashboard.evacuationMonitoring.rows.1.status', 'Evacuated')
            ->where(
                'dashboard.evacuationMonitoring.rows.1.timeIn',
                $scannedAt->toIso8601String(),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.1.lastScan',
                $scannedAt->toIso8601String(),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.2.name',
                'Nora Diaz',
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.2.timeIn',
                $scannedAt->toIso8601String(),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.2.lastScan',
                $scannedAt->toIso8601String(),
            ));
});

test('operator can update the latest scan attendance after tagging missing members', function () {
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
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-020',
        'name' => 'Torres Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Lia Torres',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'evacuation_center_name' => 'Central Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-020',
            'type' => 'IN',
        ])
        ->assertOk();

    $scanId = $response->json('id');

    $this->actingAs($operator)
        ->patchJson(route('operator-scans.update', $scanId), [
            'attendee_refs' => [
                'EVQ-CENTRAL-020-HEAD',
            ],
        ])
        ->assertOk()
        ->assertJsonPath('record.attendee_refs.0', 'EVQ-CENTRAL-020-HEAD');

    $scan = EvacuationScan::query()->findOrFail($scanId);

    expect($scan->attendee_refs)->toBe([
        'EVQ-CENTRAL-020-HEAD',
    ]);

    $this->actingAs($operator)
        ->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.evacuationMonitoring.summary.evacuated', 1)
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 0)
            ->where('dashboard.evacuationMonitoring.summary.missing', 1)
            ->where('dashboard.evacuationMonitoring.rows.0.name', 'Lia Torres')
            ->where('dashboard.evacuationMonitoring.rows.0.status', 'Missing')
            ->where('dashboard.evacuationMonitoring.rows.1.name', 'Mila Torres')
            ->where('dashboard.evacuationMonitoring.rows.1.status', 'Evacuated'));
});

test('operator can mark every household member missing by clearing scan attendance', function () {
    $operator = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'name' => 'Rosa Cruz',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-030',
        'name' => 'Cruz Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Ben Cruz',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    $scanId = $this->actingAs($operator)
        ->postJson(route('operator-scans.store'), [
            'evacuation_center_name' => 'Central Evacuation Center',
            'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-030',
            'type' => 'IN',
        ])
        ->assertOk()
        ->json('id');

    $this->actingAs($operator)
        ->patchJson(route('operator-scans.update', $scanId), [
            'attendee_refs' => [],
        ])
        ->assertOk()
        ->assertJsonPath('record.attendee_refs', []);

    $this->actingAs($operator)
        ->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.evacuationMonitoring.summary.evacuated', 0)
            ->where('dashboard.evacuationMonitoring.summary.missing', 2)
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 0)
            ->where('dashboard.evacuationMonitoring.rows.0.name', 'Ben Cruz')
            ->where('dashboard.evacuationMonitoring.rows.0.status', 'Missing')
            ->where('dashboard.evacuationMonitoring.rows.1.name', 'Rosa Cruz')
            ->where('dashboard.evacuationMonitoring.rows.1.status', 'Missing'));
});

test('operator sync endpoint replays pending records in chronological order with member tagging', function () {
    $operator = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $head = User::factory()->create([
        'name' => 'Marco Reyes',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $head->id,
        'household_code' => 'EVQ-CENTRAL-010',
        'name' => 'Reyes Household',
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Nina Reyes',
        'household_id' => $household->id,
        'sort_order' => 1,
    ]);

    HouseholdMember::factory()->create([
        'full_name' => 'Owen Reyes',
        'household_id' => $household->id,
        'sort_order' => 2,
    ]);

    $timeIn = Carbon::parse('2026-04-22 08:15:00', 'Asia/Manila');
    $timeOut = Carbon::parse('2026-04-22 08:45:00', 'Asia/Manila');

    $this->actingAs($operator)
        ->postJson(route('operator-scans.sync'), [
            'records' => [
                [
                    'attendee_refs' => [
                        'EVQ-CENTRAL-010-HEAD',
                        'EVQ-CENTRAL-010-M01',
                        'EVQ-CENTRAL-010-M02',
                    ],
                    'evacuation_center_name' => 'Central Evacuation Center',
                    'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-010',
                    'scanned_at' => $timeIn->toIso8601String(),
                    'type' => 'IN',
                ],
                [
                    'attendee_refs' => [
                        'EVQ-CENTRAL-010-M02',
                    ],
                    'evacuation_center_name' => 'Central Evacuation Center',
                    'payload' => 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-010',
                    'scanned_at' => $timeOut->toIso8601String(),
                    'type' => 'OUT',
                ],
            ],
        ])
        ->assertOk()
        ->assertJsonPath('count', 2);

    $this->assertDatabaseCount('evacuation_scans', 2);
    $this->assertDatabaseHas('households', [
        'id' => $household->id,
        'evacuation_status' => 'evacuated',
    ]);

    $this->actingAs($operator)
        ->get(route('evacuation-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('evacuation-monitoring')
            ->where('dashboard.evacuationMonitoring.meta.scannerConnected', true)
            ->where('dashboard.evacuationMonitoring.summary.evacuated', 2)
            ->where('dashboard.evacuationMonitoring.summary.notYetEvacuated', 1)
            ->where('dashboard.evacuationMonitoring.summary.missing', 0)
            ->where('dashboard.evacuationMonitoring.rows.0.name', 'Owen Reyes')
            ->where(
                'dashboard.evacuationMonitoring.rows.0.timeIn',
                fn (mixed $value): bool => is_string($value) && str_contains($value, '2026-04-22T08:15:00'),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.0.timeOut',
                fn (mixed $value): bool => is_string($value) && str_contains($value, '2026-04-22T08:45:00'),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.0.lastScan',
                fn (mixed $value): bool => is_string($value) && str_contains($value, '2026-04-22T08:45:00'),
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.1.status',
                'Evacuated',
            )
            ->where(
                'dashboard.evacuationMonitoring.rows.2.status',
                'Evacuated',
            ));
});

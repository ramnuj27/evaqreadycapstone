<?php

use App\Models\Household;
use App\Models\HouseholdMember;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $admin = User::factory()->create([
        'name' => 'CDRRMO Admin',
        'role' => 'CDRRMO Admin',
    ]);
    $olderRegistrationTime = now()->subMinutes(20);
    $latestRegistrationTime = now()->subMinutes(5);

    $floodHead = User::factory()->create([
        'birthdate' => now()->subYears(35)->toDateString(),
        'gender' => 'female',
        'is_pregnant' => true,
        'name' => 'Maria Santos',
    ]);

    $coastalHead = User::factory()->create([
        'birthdate' => now()->subYears(64)->toDateString(),
        'gender' => 'male',
        'is_pregnant' => false,
        'name' => 'Antonio Cruz',
    ]);

    $floodHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => $olderRegistrationTime,
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $floodHead->id,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => now()->subYears(33)->toDateString(),
        'category' => 'Adult',
        'full_name' => 'Noel Santos',
        'gender' => 'male',
        'household_id' => $floodHousehold->id,
        'is_pwd' => true,
        'is_pregnant' => false,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => now()->subYears(30)->toDateString(),
        'category' => 'Adult',
        'full_name' => 'Rosa Santos',
        'gender' => 'female',
        'household_id' => $floodHousehold->id,
        'is_pwd' => true,
        'is_pregnant' => false,
    ]);

    $coastalHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => $latestRegistrationTime,
        'hazard_zone' => 'coastal',
        'head_user_id' => $coastalHead->id,
    ]);
    HouseholdMember::factory()->create([
        'birthdate' => now()->subYears(68)->toDateString(),
        'household_id' => $coastalHousehold->id,
        'category' => 'Senior',
        'full_name' => 'Luz Cruz',
        'gender' => 'female',
        'is_pwd' => false,
        'is_pregnant' => false,
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('dashboard.command.adminName', 'CDRRMO Admin')
        ->where('dashboard.command.dateLabel', now('Asia/Manila')->format('F j, Y'))
        ->where('dashboard.command.registrationsToday', 2)
        ->where('dashboard.command.status', 'CDRRMO command monitoring is active.')
        ->where('dashboard.overview.registeredResidents', 5)
        ->where('dashboard.overview.checkedInEvacuees', 0)
        ->where('dashboard.summary.evacuatedSafe.total', 0)
        ->where('dashboard.summary.notYetEvacuated.total', 5)
        ->where('dashboard.summary.missingUnaccounted.total', 0)
        ->where('dashboard.summary.activeCenters.total', 3)
        ->where('dashboard.overview.coverage.coveredBarangays', 2)
        ->where('dashboard.overview.coverage.totalBarangays', count(MatiCityAddressOptions::barangays()))
        ->where('dashboard.analytics.gender.0.total', 2)
        ->where('dashboard.analytics.gender.1.total', 3)
        ->where('dashboard.analytics.ageGroups.0.total', 0)
        ->where('dashboard.analytics.ageGroups.1.total', 3)
        ->where('dashboard.analytics.ageGroups.2.total', 2)
        ->where('dashboard.analytics.vulnerableGroups.0.total', 2)
        ->where('dashboard.analytics.vulnerableGroups.1.total', 1)
        ->where('dashboard.userSummary.totalUsers', 3)
        ->where('dashboard.userSummary.rolesConfigured', true)
        ->where('dashboard.userSummary.roles.0.total', 1)
        ->where('dashboard.userSummary.roles.1.total', 0)
        ->where('dashboard.userSummary.roles.2.total', 0)
        ->where('dashboard.userSummary.roles.3.total', 2)
        ->where('dashboard.latestAlert.label', 'Vulnerable Groups')
        ->where('dashboard.latestAlert.affectedBarangay', 'City-wide')
        ->where('dashboard.latestAlert.severity', 'Critical')
        ->where('dashboard.evacuationCenters.summary.total', 4)
        ->where('dashboard.mapPanel.prototype', true)
        ->has('dashboard.hazardBreakdown', 4)
        ->has('dashboard.alerts', 3)
        ->has('dashboard.latestAlert.reportedAt')
        ->has('dashboard.liveActivity', 4)
        ->where('dashboard.liveActivity.0.type', 'Scanned Evacuee')
        ->where('dashboard.liveActivity.1.type', 'New Registration')
        ->where('dashboard.liveActivity.2.type', 'Center Update')
        ->where('dashboard.liveActivity.3.type', 'Alert Issued')
        ->has('dashboard.recentHouseholds', 2)
        ->where('dashboard.recentHouseholds.0.head_name', 'Antonio Cruz')
        ->has('dashboard.barangayMonitoring', count(MatiCityAddressOptions::barangays())),
    );
});

test('dashboard counts registrations today using Mati City local time', function () {
    Carbon::setTestNow(Carbon::parse('2026-04-22 15:00:00', 'UTC'));

    try {
        $admin = User::factory()->create([
            'name' => 'CDRRMO Admin',
            'role' => 'CDRRMO Admin',
        ]);

        $head = User::factory()->create([
            'birthdate' => '1992-04-14',
            'gender' => 'female',
            'name' => 'Late-Night Registration',
        ]);

        Household::factory()->create([
            'barangay' => 'Central',
            'city' => MatiCityAddressOptions::city(),
            'created_at' => Carbon::parse('2026-04-21 16:30:00', 'UTC'),
            'hazard_zone' => 'safe-zone',
            'head_user_id' => $head->id,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('dashboard.command.registrationsToday', 1));
    } finally {
        Carbon::setTestNow();
    }
});

test('barangay committee dashboard is scoped to the assigned barangay', function () {
    $committee = User::factory()->create([
        'barangay' => 'Central',
        'name' => 'Central Committee',
        'role' => 'Barangay Committee',
    ]);

    $centralHead = User::factory()->create([
        'birthdate' => now()->subYears(42)->toDateString(),
        'gender' => 'female',
        'name' => 'Ana Central',
    ]);

    $otherHead = User::factory()->create([
        'birthdate' => now()->subYears(36)->toDateString(),
        'gender' => 'male',
        'name' => 'Rico Dahican',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
    ]);

    HouseholdMember::factory()->create([
        'category' => 'Adult',
        'full_name' => 'Central Member',
        'gender' => 'female',
        'household_id' => $centralHousehold->id,
    ]);

    $otherHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'coastal',
        'head_user_id' => $otherHead->id,
    ]);

    HouseholdMember::factory()->create([
        'category' => 'Adult',
        'full_name' => 'Dahican Member',
        'gender' => 'male',
        'household_id' => $otherHousehold->id,
    ]);

    $this->actingAs($committee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.command.adminName', 'Central Committee')
            ->where('dashboard.command.status', 'Central barangay monitoring is active.')
            ->where('dashboard.overview.registeredResidents', 2)
            ->where('dashboard.overview.coverage.coveredBarangays', 1)
            ->where('dashboard.overview.coverage.totalBarangays', 1)
            ->where('dashboard.barangayMonitoring.0.name', 'Central')
            ->has('dashboard.barangayMonitoring', 1)
            ->where('dashboard.evacuationCenters.summary.total', 1)
            ->where('dashboard.recentHouseholds.0.barangay', 'Central'),
        );
});

test('dashboard derives resident age groups from birthdates instead of stale category labels', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $head = User::factory()->create([
        'birthdate' => '1991-05-20',
        'gender' => 'female',
        'name' => 'Aira Lopez',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'safe-zone',
        'head_user_id' => $head->id,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2018-09-10',
        'category' => 'Adult',
        'full_name' => 'Mika Lopez',
        'gender' => 'male',
        'household_id' => $household->id,
        'is_pwd' => false,
        'is_pregnant' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.overview.registeredResidents', 2)
            ->where('dashboard.analytics.ageGroups.0.total', 1)
            ->where('dashboard.analytics.ageGroups.1.total', 1)
            ->where('dashboard.analytics.ageGroups.2.total', 0));
});

test('dashboard page shows the restored static map preview', function () {
    $page = file_get_contents(resource_path('js/pages/dashboard.tsx'));

    expect($page)
        ->toContain('Live center snapshot')
        ->toContain('Map Snapshot')
        ->toContain('MapboxStaticMap')
        ->toContain('Open Monitoring Page')
        ->not->toContain('Mini Map Preview')
        ->not->toContain('Interactive center preview')
        ->not->toContain('View Full Map')
        ->not->toContain('selectedCenterId')
        ->not->toContain('markerDotClassNames');
});

test('dashboard page keeps the compact sidebar actions and evacuation status panels', function () {
    $page = file_get_contents(resource_path('js/pages/dashboard.tsx'));

    expect($page)
        ->toContain('function SidebarSection')
        ->toContain('Registered Today')
        ->toContain('Fast links for the command tools used most.')
        ->toContain('Compact view of resident accountability across the city.')
        ->toContain('Residents being monitored right now.')
        ->not->toContain('Evacuation Status Distribution');
});

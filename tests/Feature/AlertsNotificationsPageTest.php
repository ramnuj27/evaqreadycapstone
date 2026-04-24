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

test('authenticated users can view the alerts and announcements page', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

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

    $this->get(route('alerts-notifications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('alerts-notifications')
            ->where('alertsCenter.canManageBroadcasts', true)
            ->where('dashboard.command.status', 'CDRRMO command monitoring is active.')
            ->has('dashboard.alerts')
            ->has('alertsCenter.alerts')
            ->has('dashboard.latestAlert')
            ->has('dashboard.barangayMonitoring', count(MatiCityAddressOptions::barangays()))
            ->has('dashboard.evacuationCenters.centers'));
});

test('alerts and announcements page keeps the final broadcast layout', function () {
    $pageFile = file_get_contents(
        resource_path('js/pages/alerts-notifications.tsx'),
    );

    expect($pageFile)
        ->not->toBeFalse()
        ->and($pageFile)
        ->toContain(
            'Alerts & Announcements',
            'Search alerts...',
            'New Alert',
            'Active Alerts',
            'Announcements',
            'High Priority',
            'Play Audio',
            'Generate Voice',
            'Send Now',
            'Schedule',
            'Delete',
        );
});

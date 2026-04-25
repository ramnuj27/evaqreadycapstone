<?php

use App\Models\AlertBroadcast;
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

function residentAccountContext(): array
{
    $resident = User::factory()->create([
        'birthdate' => '1989-03-14',
        'contact_number' => '09171234567',
        'email' => 'resident@example.com',
        'email_verified_at' => now(),
        'gender' => 'female',
        'is_pregnant' => true,
        'name' => 'Maria Dela Cruz',
        'role' => 'Resident',
    ]);

    $household = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'evacuation_status' => 'evacuated',
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $resident->id,
        'household_code' => 'EVQ-CENTRAL-001',
        'is_pwd' => true,
        'name' => 'Dela Cruz Household',
        'pwd_type' => 'physical-disability',
        'pwd_type_other' => null,
        'street_address' => 'Purok 3, Riverside',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2014-09-01',
        'category' => 'Child',
        'full_name' => 'Lia Dela Cruz',
        'gender' => 'female',
        'household_id' => $household->id,
        'is_pregnant' => false,
        'is_pwd' => false,
        'sort_order' => 0,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1956-02-12',
        'category' => 'Senior',
        'full_name' => 'Lolo Pedro',
        'gender' => 'male',
        'household_id' => $household->id,
        'is_pregnant' => false,
        'is_pwd' => true,
        'pwd_type' => 'hearing-impairment',
        'sort_order' => 1,
    ]);

    AlertBroadcast::query()->create([
        'audio_enabled' => true,
        'audio_url' => 'https://example.test/audio/flood.mp3',
        'created_by_user_id' => null,
        'issued_at' => now()->subMinutes(10),
        'message' => 'Prepare for possible evacuation in low-lying areas.',
        'severity' => 'High',
        'status' => 'Active',
        'target_barangay' => 'Central',
        'title' => 'Flood Warning',
        'type' => 'Warning',
    ]);

    AlertBroadcast::query()->create([
        'audio_enabled' => false,
        'audio_url' => null,
        'created_by_user_id' => null,
        'issued_at' => now()->subMinutes(40),
        'message' => 'Keep emergency supplies ready and monitor advisories.',
        'severity' => 'Medium',
        'status' => 'Active',
        'target_barangay' => null,
        'title' => 'Community Advisory',
        'type' => 'Announcement',
    ]);

    AlertBroadcast::query()->create([
        'audio_enabled' => false,
        'audio_url' => null,
        'created_by_user_id' => null,
        'issued_at' => now()->subMinutes(5),
        'message' => 'This should not be visible to the Central resident.',
        'severity' => 'High',
        'status' => 'Active',
        'target_barangay' => 'Dahican',
        'title' => 'Other Barangay Alert',
        'type' => 'Warning',
    ]);

    return [$resident, $household];
}

test('resident pages render household specific data', function () {
    [$resident, $household] = residentAccountContext();

    $this->actingAs($resident);

    $this->get(route('resident.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-dashboard')
            ->where('residentDashboard.householdCode', $household->household_code)
            ->where('residentDashboard.qrStatus', 'Ready')
            ->where('residentDashboard.evacuationStatus.label', 'Evacuated')
            ->where('residentDashboard.latestAlert.title', 'Flood Warning')
            ->where('residentDashboard.nearestCenter.name', 'Central Evacuation Center'));

    $this->get(route('resident.profile'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-profile')
            ->where('profile.name', 'Maria Dela Cruz')
            ->where('profile.email', 'resident@example.com')
            ->where('profile.barangay', 'Central')
            ->where('profile.isPwd', true)
            ->where('profile.isPregnant', true));

    $this->get(route('resident.household'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-household')
            ->where('household.householdCode', 'EVQ-CENTRAL-001')
            ->where('household.head.name', 'Maria Dela Cruz')
            ->where('household.address', 'Purok 3, Riverside, Central, Mati City')
            ->has('household.members', 2)
            ->where('household.members.0.fullName', 'Lia Dela Cruz')
            ->where('household.members.1.isPwd', true));

    $this->get(route('resident.qr-code'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-qr-code')
            ->where('qrCode.householdCode', 'EVQ-CENTRAL-001')
            ->where('qrCode.payload', 'EVAQREADY-HOUSEHOLD:EVQ-CENTRAL-001')
            ->where('qrCode.svg', fn ($svg) => is_string($svg) && str_contains($svg, '<svg')));

    $this->get(route('resident.alerts'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-alerts')
            ->has('alerts', 2)
            ->where('alerts.0.title', 'Flood Warning')
            ->where('alerts.1.title', 'Community Advisory'));

    $this->get(route('resident.evacuation-centers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-evacuation-centers')
            ->has('centers', 3)
            ->where('centers.0.name', 'Central Evacuation Center')
            ->where('centers.0.isNearest', true));

    $this->get(route('resident.map'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-map')
            ->where('mapData.centers.0.barangay', 'Central')
            ->where('mapData.currentLocation.barangay', 'Central')
            ->where('mapData.hazardZone', 'Flood Prone')
            ->where('mapData.nearestCenter.name', 'Central Evacuation Center')
            ->where('mapData.route.travelTime', '12 min'));

    $this->get(route('resident.evacuation-ar'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-evacuation-ar')
            ->where('arGuide.hazardZone', 'Flood Prone')
            ->where('arGuide.nearestCenter.name', 'Central Evacuation Center')
            ->where('arGuide.currentLocation.label', 'You are here')
            ->has('arGuide.centers', 3));

    $this->get(route('resident.disaster-info'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident-disaster-info'));
});

test('resident can update their profile and household details', function () {
    [$resident, $household] = residentAccountContext();

    $this->actingAs($resident)
        ->put(route('resident.profile.update'), [
            'barangay' => 'Dahican',
            'birthdate' => '1990-05-20',
            'contact_number' => '09179998888',
            'email' => 'updated.resident@example.com',
            'gender' => 'female',
            'is_pregnant' => true,
            'is_pwd' => true,
            'name' => 'Maria Santos Dela Cruz',
            'pwd_type' => 'other',
            'pwd_type_other' => 'Mobility support',
            'street_address' => 'Purok 5, Seaside',
        ])
        ->assertRedirect(route('resident.profile'));

    $resident->refresh();
    $household->refresh();

    expect($resident->name)->toBe('Maria Santos Dela Cruz');
    expect($resident->email)->toBe('updated.resident@example.com');
    expect($resident->contact_number)->toBe('09179998888');
    expect($resident->gender)->toBe('female');
    expect($resident->is_pregnant)->toBeTrue();
    expect($resident->email_verified_at)->toBeNull();

    expect($household->barangay)->toBe('Dahican');
    expect($household->street_address)->toBe('Purok 5, Seaside');
    expect($household->is_pwd)->toBeTrue();
    expect($household->pwd_type)->toBe('other');
    expect($household->pwd_type_other)->toBe('Mobility support');
});

test('resident can manage household members', function () {
    [$resident, $household] = residentAccountContext();

    $this->actingAs($resident)
        ->post(route('resident.household.members.store'), [
            'birthdate' => '2016-08-15',
            'category' => 'Child',
            'full_name' => 'Paolo Dela Cruz',
            'gender' => 'male',
            'is_pregnant' => false,
            'is_pwd' => true,
            'pwd_type' => 'speech-impairment',
            'pwd_type_other' => null,
        ])
        ->assertRedirect(route('resident.household'));

    $member = HouseholdMember::query()
        ->where('household_id', $household->id)
        ->where('full_name', 'Paolo Dela Cruz')
        ->firstOrFail();

    expect($member->category)->toBe('Child');
    expect($member->is_pwd)->toBeTrue();
    expect($member->pwd_type)->toBe('speech-impairment');

    $this->actingAs($resident)
        ->put(route('resident.household.members.update', $member), [
            'birthdate' => '2016-08-15',
            'category' => 'Child',
            'full_name' => 'Paolo S. Dela Cruz',
            'gender' => 'male',
            'is_pregnant' => false,
            'is_pwd' => false,
            'pwd_type' => null,
            'pwd_type_other' => null,
        ])
        ->assertRedirect(route('resident.household'));

    $member->refresh();

    expect($member->full_name)->toBe('Paolo S. Dela Cruz');
    expect($member->is_pwd)->toBeFalse();
    expect($member->pwd_type)->toBeNull();

    $this->actingAs($resident)
        ->delete(route('resident.household.members.destroy', $member))
        ->assertRedirect(route('resident.household'));

    $this->assertDatabaseMissing('household_members', [
        'id' => $member->id,
    ]);
});

test('resident map page restores the interactive map preview', function () {
    $pageFile = file_get_contents(resource_path('js/pages/resident-map.tsx'));

    expect($pageFile)
        ->not->toBeFalse()
        ->and($pageFile)
        ->toContain(
            'Map Preview',
            'InteractiveMapboxStaticMap',
            'Household Route',
            'Start AR Guide',
        )
        ->not->toContain(
            'Expand Map',
            'Reset View',
            'residentMapViewport',
            'object-contain',
            'MapboxStaticMap',
            'toggleMapFullscreen',
            'changeMapZoom',
            'resetMapView',
            'handleMapPointerDown',
            'handleMapPointerMove',
            'handleMapPointerEnd',
        );
});

test('resident ar page uses a workspace style guidance layout', function () {
    $pageFile = file_get_contents(
        resource_path('js/pages/resident-evacuation-ar.tsx'),
    );

    expect($pageFile)
        ->not->toBeFalse()
        ->and($pageFile)
        ->toContain(
            'Guide Workspace',
            'Field Controls',
            'My location',
            'System Status',
            'Live Guidance Stage',
            'Live View',
            'Continue this way',
            'Be alert while walking',
            'mini-map',
            'tile.openstreetmap.org',
            'Route overview',
            'Dahican Road',
            'Mayo Bay',
            'You are here',
            'AR destination',
            'ChevronRight',
            '3D AR depth overlay',
            'Rear camera active',
            'Fallback camera active',
            'Allow motion access',
            'Tilt unavailable',
            'Destination beacon',
            '3D Depth',
            'Destination Brief',
            'Routing Snapshot',
        )
        ->not->toContain(
            'Resident AR Guidance',
            'Nearest Destination',
        );
});

test('resident console shell uses a modern integrated sidebar style', function () {
    $appCssFile = file_get_contents(resource_path('css/app.css'));
    $sidebarShellFile = file_get_contents(
        resource_path('js/components/ui/sidebar.tsx'),
    );
    $appShellFile = file_get_contents(resource_path('js/components/app-shell.tsx'));
    $appContentFile = file_get_contents(
        resource_path('js/components/app-content.tsx'),
    );
    $appSidebarFile = file_get_contents(
        resource_path('js/components/app-sidebar.tsx'),
    );
    $navMainFile = file_get_contents(resource_path('js/components/nav-main.tsx'));
    $accountPanelFile = file_get_contents(
        resource_path('js/components/sidebar-account-panel.tsx'),
    );

    expect($appCssFile)
        ->not->toBeFalse()
        ->and($appCssFile)
        ->toContain(
            '--console-shell-panel-strong',
            '.console-shell {',
            '.console-sidebar-panel,',
            '.console-shell-panel-soft',
        );

    expect($sidebarShellFile)
        ->not->toBeFalse()
        ->and($sidebarShellFile)
        ->toContain(
            'const SIDEBAR_WIDTH_ICON = "4.5rem"',
            'console-sidebar-panel',
            'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1.25rem)]',
            'console-shell-panel-soft absolute top-1/2',
        );

    expect($appShellFile)
        ->not->toBeFalse()
        ->and($appShellFile)
        ->toContain(
            "className={cn('console-shell relative overflow-hidden')}",
            "'--sidebar-width-icon'",
            ": '4.5rem'",
        );

    expect($appContentFile)
        ->not->toBeFalse()
        ->and($appContentFile)
        ->toContain('console-shell-panel-strong overflow-hidden');

    expect($appSidebarFile)
        ->not->toBeFalse()
        ->and($appSidebarFile)
        ->toContain(
            'console-shell-panel-soft relative shrink-0 rounded-[30px] p-4',
            'console-shell-panel-soft h-auto rounded-[32px]',
            'group-data-[collapsible=icon]:size-16',
            'group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0',
        );
    expect($appSidebarFile)->not->toContain('SidebarRail');

    expect($navMainFile)
        ->not->toBeFalse()
        ->and($navMainFile)
        ->toContain(
            "const isCollapsed = state === 'collapsed';",
            'console-shell-panel-soft h-14 rounded-[26px]',
            'flex w-full justify-center',
            'mx-auto size-12',
            'console-shell-panel-soft size-12 rounded-[22px]',
        );

    expect($accountPanelFile)
        ->not->toBeFalse()
        ->and($accountPanelFile)
        ->toContain(
            'console-shell-panel-soft h-14 rounded-[28px]',
            'flex w-full justify-center',
            'mx-auto size-12',
            'bg-rose-500/10',
            'size-12 rounded-[22px]',
        );
});

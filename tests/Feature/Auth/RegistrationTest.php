<?php

use App\Models\Household;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'barangay' => MatiCityAddressOptions::barangays()[0],
        'birthdate' => '1995-05-10',
        'city' => MatiCityAddressOptions::city(),
        'contact_number' => '09123456789',
        'name' => 'Test User',
        'email' => 'test@example.com',
        'gender' => 'female',
        'hazard_zone' => 'safe-zone',
        'household_name' => 'Test Household',
        'is_pregnant' => false,
        'members' => [],
        'password' => 'password',
        'password_confirmation' => 'password',
        'street_address' => 'Purok 1',
    ]);

    $user = User::query()->where('email', 'test@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user?->role)->toBe('Resident');
    expect(Household::query()->where('head_user_id', $user?->id)->exists())->toBeTrue();

    $this->assertGuest();
    $response->assertRedirect(route('register.success', absolute: false));
});

test('new users always see the qr success page after registration', function () {
    $response = $this
        ->withSession(['url.intended' => route('login')])
        ->post(route('register.store'), [
            'barangay' => MatiCityAddressOptions::barangays()[0],
            'birthdate' => '1995-05-10',
            'city' => MatiCityAddressOptions::city(),
            'contact_number' => '09123456789',
            'name' => 'QR Success User',
            'email' => 'qr-success@example.com',
            'gender' => 'female',
            'hazard_zone' => 'safe-zone',
            'household_name' => 'QR Success Household',
            'is_pregnant' => false,
            'members' => [],
            'password' => 'password',
            'password_confirmation' => 'password',
            'street_address' => 'Purok 1',
        ]);

    $this->assertGuest();
    $response->assertRedirect(route('register.success', absolute: false));
    $response->assertSessionHas('registration_success_household_id');
});

test('new registrations feed dashboard and reports vulnerability counts', function () {
    $admin = User::factory()->create([
        'name' => 'Command Admin',
        'role' => 'CDRRMO Admin',
    ]);

    $response = $this->post(route('register.store'), [
        'barangay' => MatiCityAddressOptions::barangays()[0],
        'birthdate' => '1994-05-10',
        'city' => MatiCityAddressOptions::city(),
        'contact_number' => '09123456789',
        'name' => 'Registry Resident',
        'email' => 'registry-resident@example.com',
        'gender' => 'female',
        'hazard_zone' => 'safe-zone',
        'household_name' => 'Registry Household',
        'is_pregnant' => true,
        'is_pwd' => true,
        'members' => [
            [
                'birthdate' => '1996-08-14',
                'category' => 'Adult',
                'full_name' => 'PWD Member',
                'gender' => 'male',
                'is_pregnant' => false,
                'is_pwd' => true,
                'pwd_type' => 'physical-disability',
                'pwd_type_other' => '',
            ],
        ],
        'password' => 'password',
        'password_confirmation' => 'password',
        'pwd_type' => 'physical-disability',
        'pwd_type_other' => '',
        'street_address' => 'Purok 1',
    ]);

    $household = Household::query()
        ->whereHas('headUser', fn ($query) => $query->where('email', 'registry-resident@example.com'))
        ->firstOrFail();

    $this->assertGuest();
    $response->assertRedirect(route('register.success', absolute: false));

    expect($household->is_pwd)->toBeTrue();
    expect($household->pwd_type)->toBe('physical-disability');

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.command.registrationsToday', 1)
            ->where('dashboard.overview.registeredResidents', 2)
            ->where('dashboard.analytics.vulnerableGroups.0.total', 2)
            ->where('dashboard.analytics.vulnerableGroups.1.total', 1));

    $this->actingAs($admin)
        ->get(route('reports-analytics'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports-analytics')
            ->where('reportsAnalytics.summary.totalEvacuees', 2)
            ->where('reportsAnalytics.meta.recordCount', 2)
            ->where('reportsAnalytics.populationBreakdown.categories.1.total', 2)
            ->where('reportsAnalytics.populationBreakdown.categories.3.total', 2)
            ->where('reportsAnalytics.populationBreakdown.categories.4.total', 1)
            ->has('reportsAnalytics.table.rows', 2));
});

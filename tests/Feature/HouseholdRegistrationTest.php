<?php

use App\Models\Household;
use App\Support\MatiCityAddressOptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

function householdRegistrationPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'name' => 'Maria Dela Cruz',
        'email' => 'maria@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'contact_number' => '09171234567',
        'gender' => 'female',
        'birthdate' => '1988-05-10',
        'is_pregnant' => true,
        'is_pwd' => true,
        'pwd_type' => 'physical-disability',
        'pwd_type_other' => '',
        'street_address' => 'Purok 3, Riverside',
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'hazard_zone' => 'flood-prone',
        'household_name' => 'Dela Cruz Household',
        'members' => [
            [
                'full_name' => 'Jose Dela Cruz',
                'gender' => 'male',
                'birthdate' => '1984-04-18',
                'category' => 'Adult',
                'is_pwd' => true,
                'pwd_type' => 'physical-disability',
                'pwd_type_other' => '',
                'is_pregnant' => false,
            ],
            [
                'full_name' => 'Lia Dela Cruz',
                'gender' => 'female',
                'birthdate' => '2014-11-02',
                'category' => 'Child',
                'is_pwd' => true,
                'pwd_type' => 'other',
                'pwd_type_other' => 'Chronic neurological condition',
                'is_pregnant' => false,
            ],
        ],
    ], $overrides);
}

test('head of household can register a household and see the qr success page', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->post(route('register.store'), householdRegistrationPayload());

    $response->assertRedirect(route('register.success'));
    $response->assertSessionHas('registration_success_household_id');
    $this->assertGuest();

    $this->assertDatabaseHas('users', [
        'email' => 'maria@example.com',
        'name' => 'Maria Dela Cruz',
        'contact_number' => '09171234567',
        'gender' => 'female',
        'is_pregnant' => true,
    ]);

    $this->assertDatabaseHas('household_members', [
        'full_name' => 'Jose Dela Cruz',
        'category' => 'Adult',
        'is_pwd' => true,
        'pwd_type' => 'physical-disability',
        'pwd_type_other' => null,
    ]);

    $this->assertDatabaseHas('household_members', [
        'full_name' => 'Lia Dela Cruz',
        'category' => 'Child',
        'is_pwd' => true,
        'pwd_type' => 'other',
        'pwd_type_other' => 'Chronic neurological condition',
    ]);

    $household = Household::query()->with(['headUser', 'members'])->firstOrFail();

    expect($household->household_code)->toStartWith('EVQ-');
    expect($household->is_pwd)->toBeTrue();
    expect($household->pwd_type)->toBe('physical-disability');
    expect($household->members)->toHaveCount(2);

    $successPage = $this->get(route('register.success'));

    $successPage->assertOk();
    $successPage->assertInertia(fn (Assert $page) => $page
        ->component('auth/register-success')
        ->where('registration.household_name', 'Dela Cruz Household')
        ->where('registration.head.name', 'Maria Dela Cruz')
        ->where('registration.total_members', 3)
        ->has('registration.members', 2)
        ->where('registration.qr_payload', 'EVAQREADY-HOUSEHOLD:'.$household->household_code)
        ->where('registration.qr_svg', fn ($svg) => is_string($svg) && str_contains($svg, '<svg')),
    );
});

test('register page exposes mati city and its barangay dropdown options', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->get(route('register'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/register')
        ->where('availableCity', MatiCityAddressOptions::city())
        ->has('availableBarangays', count(MatiCityAddressOptions::barangays()))
        ->where('availableBarangays.0', MatiCityAddressOptions::barangays()[0])
        ->where('availableBarangays.4', 'Central'),
    );
});

test('male head of household cannot be marked as pregnant during registration', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->from(route('register'))->post(route('register.store'), householdRegistrationPayload([
        'gender' => 'male',
        'is_pregnant' => true,
    ]));

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['is_pregnant']);
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('households', 0);
    $this->assertDatabaseCount('household_members', 0);
});

test('registration only accepts mati city barangays', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->from(route('register'))->post(route('register.store'), householdRegistrationPayload([
        'barangay' => 'Barangay San Isidro',
        'city' => 'Tacloban City',
    ]));

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['barangay', 'city']);
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('households', 0);
    $this->assertDatabaseCount('household_members', 0);
});

test('male members cannot be marked as pregnant during registration', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->from(route('register'))->post(route('register.store'), householdRegistrationPayload([
        'members' => [
            [
                'full_name' => 'Mark Dela Cruz',
                'gender' => 'male',
                'birthdate' => '1995-08-20',
                'category' => 'Adult',
                'is_pwd' => false,
                'pwd_type' => '',
                'pwd_type_other' => '',
                'is_pregnant' => true,
            ],
        ],
    ]));

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['members.0.is_pregnant']);
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('households', 0);
    $this->assertDatabaseCount('household_members', 0);
});

test('pwd type is required when a member is marked as pwd', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->from(route('register'))->post(route('register.store'), householdRegistrationPayload([
        'members' => [
            [
                'full_name' => 'Lolo Pedro',
                'gender' => 'male',
                'birthdate' => '1950-02-12',
                'category' => 'Senior',
                'is_pwd' => true,
                'pwd_type' => '',
                'pwd_type_other' => '',
                'is_pregnant' => false,
            ],
        ],
    ]));

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['members.0.pwd_type']);
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('households', 0);
    $this->assertDatabaseCount('household_members', 0);
});

test('custom pwd description is required when other pwd type is selected', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $response = $this->from(route('register'))->post(route('register.store'), householdRegistrationPayload([
        'members' => [
            [
                'full_name' => 'Ana Dela Cruz',
                'gender' => 'female',
                'birthdate' => '2002-06-01',
                'category' => 'Adult',
                'is_pwd' => true,
                'pwd_type' => 'other',
                'pwd_type_other' => '',
                'is_pregnant' => false,
            ],
        ],
    ]));

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['members.0.pwd_type_other']);
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('households', 0);
    $this->assertDatabaseCount('household_members', 0);
});

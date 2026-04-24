<?php

use App\Models\User;
use App\Models\Household;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('cdrrmo admin can view persisted account statuses on user management', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    User::factory()->create([
        'barangay' => 'Central',
        'name' => 'Central Committee',
        'role' => 'Barangay Committee',
        'status' => 'Inactive',
    ]);

    $this->actingAs($admin)
        ->get(route('user-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user-management')
            ->where('users', fn (Collection $users): bool => $users->contains(
                fn (array $user): bool => $user['name'] === 'Central Committee'
                    && $user['barangay'] === 'Central'
                    && $user['status'] === 'Inactive',
            )));
});

test('cdrrmo admin can toggle an account status', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $managedUser = User::factory()->create([
        'status' => 'Inactive',
    ]);

    $this->actingAs($admin)
        ->put("/user-management/{$managedUser->id}/toggle-status")
        ->assertRedirect(route('user-management'));

    expect($managedUser->refresh()->status)->toBe('Active');
});

test('barangay committee accounts must be assigned to a barangay when created', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Committee User',
            'email' => 'committee@example.com',
            'password' => 'password123',
            'contact_number' => '09123456789',
            'role' => 'Barangay Committee',
            'barangay' => '',
        ])
        ->assertSessionHasErrors('barangay');
});

test('barangay committee users cannot access or manage user accounts', function () {
    $committee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $managedUser = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Operator',
    ]);

    $this->actingAs($committee)
        ->get(route('user-management'))
        ->assertForbidden();

    $this->actingAs($committee)
        ->post(route('users.store'), [
            'name' => 'Local Operator',
            'email' => 'local-operator@example.com',
            'password' => 'password123',
            'contact_number' => '09123456789',
            'role' => 'Operator',
            'barangay' => 'Central',
        ])
        ->assertForbidden();

    $this->actingAs($committee)
        ->put("/user-management/{$managedUser->id}/toggle-status")
        ->assertForbidden();
});

test('resident household accounts are excluded from user management listings', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $resident = User::factory()->create([
        'email' => 'resident@example.com',
        'name' => 'Resident Account',
        'role' => 'Resident',
    ]);

    Household::factory()->create([
        'head_user_id' => $resident->id,
    ]);

    $this->actingAs($admin)
        ->get(route('user-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user-management')
            ->where('users', fn (Collection $users): bool => ! $users->contains(
                fn (array $user): bool => $user['email'] === 'resident@example.com',
            )));
});

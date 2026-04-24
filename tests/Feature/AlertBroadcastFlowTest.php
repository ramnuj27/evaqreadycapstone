<?php

use App\Models\AlertBroadcast;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->withoutVite();
});

test('cdrrmo admin can create a targeted alert broadcast and the assigned committee receives it', function () {
    $admin = User::factory()->create([
        'name' => 'CDRRMO Admin User',
        'role' => 'CDRRMO Admin',
    ]);

    $centralCommittee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $otherCommittee = User::factory()->create([
        'barangay' => 'Dahican',
        'role' => 'Barangay Committee',
    ]);

    $this->actingAs($admin)
        ->post(route('alert-broadcasts.store'), [
            'audio_enabled' => true,
            'dispatch_action' => 'send_now',
            'message' => 'Prepare the Central evacuation team for rising water levels.',
            'severity' => 'High',
            'target' => 'Central',
            'title' => 'Flood Warning',
            'type' => 'Alert',
        ])
        ->assertRedirect(route('alerts-notifications'));

    $this->assertDatabaseHas('alert_broadcasts', [
        'status' => 'Active',
        'target_barangay' => 'Central',
        'title' => 'Flood Warning',
    ]);

    $this->actingAs($centralCommittee)
        ->get(route('alerts-notifications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('alerts-notifications')
            ->where('alertsCenter.canManageBroadcasts', false)
            ->where('alertsCenter.alerts.0.title', 'Flood Warning')
            ->where('alertsCenter.alerts.0.target', 'Central')
            ->where('alertsCenter.alerts.0.senderName', 'CDRRMO Admin User')
            ->where('alertsCenter.alerts.0.senderRole', 'CDRRMO Admin'));

    $this->actingAs($otherCommittee)
        ->get(route('alerts-notifications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('alerts-notifications')
            ->where('alertsCenter.alerts', []));
});

test('barangay committee users cannot create alert broadcasts', function () {
    $committee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $this->actingAs($committee)
        ->post(route('alert-broadcasts.store'), [
            'audio_enabled' => true,
            'dispatch_action' => 'send_now',
            'message' => 'Test alert',
            'severity' => 'Medium',
            'target' => 'Central',
            'title' => 'Test',
            'type' => 'Alert',
        ])
        ->assertForbidden();
});

test('cdrrmo admin can permanently delete an alert broadcast', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $broadcast = AlertBroadcast::query()->create([
        'audio_enabled' => true,
        'created_by_user_id' => $admin->id,
        'issued_at' => now(),
        'message' => 'This broadcast should be removed from the command page.',
        'severity' => 'Medium',
        'status' => 'Active',
        'target_barangay' => null,
        'title' => 'Delete Me',
        'type' => 'Announcement',
    ]);

    $this->actingAs($admin)
        ->delete(route('alert-broadcasts.destroy', $broadcast))
        ->assertRedirect(route('alerts-notifications'));

    $this->assertDatabaseMissing('alert_broadcasts', [
        'id' => $broadcast->id,
    ]);
});

test('scheduled broadcasts are activated once their schedule is due and appear on the committee dashboard', function () {
    $admin = User::factory()->create([
        'role' => 'CDRRMO Admin',
    ]);

    $committee = User::factory()->create([
        'barangay' => 'Central',
        'role' => 'Barangay Committee',
    ]);

    $broadcast = AlertBroadcast::query()->create([
        'audio_enabled' => true,
        'created_by_user_id' => $admin->id,
        'message' => 'Proceed to your barangay command post.',
        'scheduled_for' => now()->subMinute(),
        'severity' => 'High',
        'status' => 'Scheduled',
        'target_barangay' => 'Central',
        'title' => 'Storm Surge Advisory',
        'type' => 'Alert',
    ]);

    $this->actingAs($committee)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.alerts.0.label', 'Storm Surge Advisory'));

    expect($broadcast->refresh()->status)->toBe('Active');
    expect($broadcast->issued_at)->not->toBeNull();
});

<?php

use App\Http\Controllers\AlertBroadcastController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperatorScanController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegistrationSuccessController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

$publicAuthProps = [
    'canRegister' => Features::enabled(Features::registration()),
    'canResetPassword' => Features::enabled(Features::resetPasswords()),
];

Route::inertia('/', 'welcome', [
    ...$publicAuthProps,
    'heroImageUrl' => asset('mati-evacuation-cover.png'),
])->name('home');

Route::inertia('/features', 'features', [...$publicAuthProps])
    ->name('features');

Route::inertia('/how-it-works', 'how-it-works', [...$publicAuthProps])
    ->name('how-it-works');

Route::inertia('/contact', 'contact', [...$publicAuthProps])
    ->name('contact');

Route::inertia('/disaster-information', 'disaster-information', [
    ...$publicAuthProps,
    'pageMode' => 'hub',
])->name('disaster-information');

Route::inertia('/disaster-information/flood', 'disaster-information', [
    ...$publicAuthProps,
    'initialDisasterId' => 'flood',
    'pageMode' => 'detail',
])->name('disaster-information-flood');

Route::inertia('/disaster-information/tsunami', 'disaster-information', [
    ...$publicAuthProps,
    'initialDisasterId' => 'tsunami',
    'pageMode' => 'detail',
])->name('disaster-information-tsunami');

Route::inertia('/disaster-information/earthquake', 'disaster-information', [
    ...$publicAuthProps,
    'initialDisasterId' => 'earthquake',
    'pageMode' => 'detail',
])->name('disaster-information-earthquake');

Route::inertia('/disaster-information/typhoon', 'disaster-information', [
    ...$publicAuthProps,
    'initialDisasterId' => 'typhoon',
    'pageMode' => 'detail',
])->name('disaster-information-typhoon');

Route::get('/register/success', RegistrationSuccessController::class)
    ->name('register.success');

Route::middleware(['auth', 'verified'])->group(function () {
    // Resident Routes
    Route::get('resident/dashboard', [ResidentController::class, 'dashboard'])->name('resident.dashboard');
    Route::get('resident/profile', [ResidentController::class, 'profile'])->name('resident.profile');
    Route::put('resident/profile', [ResidentController::class, 'updateProfile'])->name('resident.profile.update');
    Route::get('resident/household', [ResidentController::class, 'household'])->name('resident.household');
    Route::post('resident/household/members', [ResidentController::class, 'storeHouseholdMember'])->name('resident.household.members.store');
    Route::get('resident/qr-code', [ResidentController::class, 'qrCode'])->name('resident.qr-code');
    Route::get('resident/alerts', [ResidentController::class, 'alerts'])->name('resident.alerts');
    Route::get('resident/evacuation-centers', [ResidentController::class, 'evacuationCenters'])->name('resident.evacuation-centers');
    Route::get('resident/map', [ResidentController::class, 'map'])->name('resident.map');
    Route::get('resident/evacuation-ar', [ResidentController::class, 'evacuationAr'])->name('resident.evacuation-ar');
    Route::get('resident/disaster-info', [ResidentController::class, 'disasterInfo'])->name('resident.disaster-info');
    Route::put('resident/household/members/{member}', [ResidentController::class, 'updateHouseholdMember'])->name('resident.household.members.update');
    Route::delete('resident/household/members/{member}', [ResidentController::class, 'destroyHouseholdMember'])->name('resident.household.members.destroy');
});

Route::middleware(['auth', 'verified', 'console.user'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('evacuation-monitoring', [DashboardController::class, 'evacuationMonitoring'])->name('evacuation-monitoring');
    Route::get('map-monitoring', [DashboardController::class, 'mapMonitoring'])->name('map-monitoring');
    Route::get('household-management', [DashboardController::class, 'householdManagement'])->name('household-management');
    Route::put('household-management/{household}', [DashboardController::class, 'updateHousehold'])->name('household-management.update');
    Route::delete('household-management/{household}', [DashboardController::class, 'destroyHousehold'])->name('household-management.destroy');
    Route::post('household-management/{household}/members', [DashboardController::class, 'storeManagedHouseholdMember'])->name('household-management.members.store');
    Route::put('household-management/members/{member}', [DashboardController::class, 'updateManagedHouseholdMember'])->name('household-management.members.update');
    Route::delete('household-management/members/{member}', [DashboardController::class, 'destroyManagedHouseholdMember'])->name('household-management.members.destroy');
    Route::get('barangay-management', [DashboardController::class, 'barangayManagement'])->name('barangay-management');
    Route::get('evacuation-centers', [DashboardController::class, 'evacuationCenters'])->name('evacuation-centers');
    Route::post('evacuation-centers', [DashboardController::class, 'storeEvacuationCenter'])->name('evacuation-centers.store');
    Route::put('evacuation-centers/{evacuationCenter}', [DashboardController::class, 'updateEvacuationCenter'])->name('evacuation-centers.update');
    Route::delete('evacuation-centers/{evacuationCenter}', [DashboardController::class, 'destroyEvacuationCenter'])->name('evacuation-centers.destroy');
    Route::get('reports-analytics', [DashboardController::class, 'reportsAnalytics'])->name('reports-analytics');
    Route::get('alerts-notifications', [DashboardController::class, 'alertsNotifications'])->name('alerts-notifications');

    Route::middleware('operator')->group(function () {
        Route::get('operator-dashboard', [DashboardController::class, 'operatorDashboard'])
            ->name('operator-dashboard');
        Route::get('operator-qr-scanner', [DashboardController::class, 'operatorQrScanner'])
            ->name('operator-qr-scanner');
        Route::get('operator-scan-history', [DashboardController::class, 'operatorScanHistory'])
            ->name('operator-scan-history');
        Route::get('operator-offline-sync', [DashboardController::class, 'operatorOfflineSync'])
            ->name('operator-offline-sync');
        Route::post('operator-scans', [OperatorScanController::class, 'store'])
            ->name('operator-scans.store');
        Route::post('operator-scans/sync', [OperatorScanController::class, 'sync'])
            ->name('operator-scans.sync');
        Route::patch('operator-scans/{evacuationScan}', [OperatorScanController::class, 'update'])
            ->name('operator-scans.update');
    });

    Route::middleware('cdrrmo.admin')->group(function () {
        Route::post('alert-broadcasts', [AlertBroadcastController::class, 'store'])
            ->name('alert-broadcasts.store');
        Route::put('alert-broadcasts/{alertBroadcast}', [AlertBroadcastController::class, 'update'])
            ->name('alert-broadcasts.update');
        Route::delete('alert-broadcasts/{alertBroadcast}', [AlertBroadcastController::class, 'destroy'])
            ->name('alert-broadcasts.destroy');
        Route::get('user-management', [DashboardController::class, 'userManagement'])->name('user-management');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::put('user-management/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::get('system-settings', [DashboardController::class, 'systemSettings'])->name('system-settings');
    });
});

require __DIR__.'/settings.php';

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

function seedReportsAnalyticsRecords(): array
{
    $centralHead = User::factory()->create([
        'birthdate' => '1985-03-01',
        'gender' => 'male',
        'name' => 'Lino Flores',
    ]);

    $centralHousehold = Household::factory()->create([
        'barangay' => 'Central',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subDays(3),
        'hazard_zone' => 'flood-prone',
        'head_user_id' => $centralHead->id,
        'household_code' => 'EVQ-CENTRAL-001',
        'name' => 'Flores Household',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1992-04-10',
        'category' => 'Adult',
        'full_name' => 'Ana Flores',
        'gender' => 'female',
        'household_id' => $centralHousehold->id,
        'is_pregnant' => true,
        'is_pwd' => false,
        'sort_order' => 1,
    ]);

    $dahicanHead = User::factory()->create([
        'birthdate' => '1994-02-14',
        'gender' => 'female',
        'is_pregnant' => true,
        'name' => 'Mara Santos',
    ]);

    $dahicanHousehold = Household::factory()->create([
        'barangay' => 'Dahican',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subDays(2),
        'hazard_zone' => 'coastal',
        'head_user_id' => $dahicanHead->id,
        'household_code' => 'EVQ-DAHICAN-002',
        'name' => 'Santos Household',
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '2010-06-12',
        'category' => 'Child',
        'full_name' => 'Ella Santos',
        'gender' => 'female',
        'household_id' => $dahicanHousehold->id,
        'is_pregnant' => false,
        'is_pwd' => false,
        'sort_order' => 1,
    ]);

    $badasHead = User::factory()->create([
        'birthdate' => '1950-07-22',
        'gender' => 'male',
        'name' => 'Tomas Cruz',
    ]);

    $badasHousehold = Household::factory()->create([
        'barangay' => 'Badas',
        'city' => MatiCityAddressOptions::city(),
        'created_at' => now()->subDay(),
        'hazard_zone' => 'landslide',
        'head_user_id' => $badasHead->id,
        'household_code' => 'EVQ-BADAS-003',
        'name' => 'Cruz Household',
    ]);

    HouseholdMember::factory()->count(28)->create([
        'birthdate' => '1990-01-05',
        'category' => 'Adult',
        'gender' => 'male',
        'household_id' => $badasHousehold->id,
        'is_pregnant' => false,
        'is_pwd' => false,
    ]);

    HouseholdMember::factory()->create([
        'birthdate' => '1988-11-21',
        'category' => 'Adult',
        'full_name' => 'Mario Cruz',
        'gender' => 'male',
        'household_id' => $badasHousehold->id,
        'is_pregnant' => false,
        'is_pwd' => true,
        'sort_order' => 29,
    ]);

    return [
        'dahican_center' => 'Dahican Evacuation Center',
        'dahican_date' => $dahicanHousehold->created_at?->toDateString(),
    ];
}

test('reports analytics page renders formal report data and charts', function () {
    $admin = User::factory()->create();

    seedReportsAnalyticsRecords();

    $this->actingAs($admin);

    $this->get(route('reports-analytics'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports-analytics')
            ->where('reportsAnalytics.header.title', 'Evacuation Report - Mati City')
            ->where('reportsAnalytics.header.barangayLabel', 'All Barangays')
            ->where('reportsAnalytics.header.centerLabel', 'All Centers')
            ->where('reportsAnalytics.summary.totalEvacuees', 34)
            ->where('reportsAnalytics.summary.evacuated', 0)
            ->where('reportsAnalytics.summary.notYet', 4)
            ->where('reportsAnalytics.summary.missing', 30)
            ->where('reportsAnalytics.meta.recordCount', 34)
            ->has('reportsAnalytics.populationBreakdown.categories', 5)
            ->where('reportsAnalytics.populationBreakdown.categories.0.total', 1)
            ->where('reportsAnalytics.populationBreakdown.categories.1.total', 32)
            ->where('reportsAnalytics.populationBreakdown.categories.2.total', 1)
            ->where('reportsAnalytics.populationBreakdown.categories.3.total', 1)
            ->where('reportsAnalytics.populationBreakdown.categories.4.total', 2)
            ->has('reportsAnalytics.charts.genderDistribution', 2)
            ->where('reportsAnalytics.charts.genderDistribution.0.total', 31)
            ->where('reportsAnalytics.charts.genderDistribution.1.total', 3)
            ->has('reportsAnalytics.charts.evacuationStatus', 3)
            ->where('reportsAnalytics.charts.barangayDistribution.0.name', 'Badas')
            ->where('reportsAnalytics.charts.barangayDistribution.0.total', 30)
            ->has('reportsAnalytics.table.rows', 34)
            ->where('reportsAnalytics.table.rows.0.barangay', 'Badas'));
});

test('reports analytics page filters by date, barangay, and evacuation center', function () {
    $admin = User::factory()->create();
    $records = seedReportsAnalyticsRecords();

    $this->actingAs($admin);

    $this->get(route('reports-analytics', [
        'barangay' => 'Dahican',
        'center' => $records['dahican_center'],
        'date_from' => $records['dahican_date'],
        'date_to' => $records['dahican_date'],
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports-analytics')
            ->where('reportsAnalytics.filters.applied.barangay', 'Dahican')
            ->where('reportsAnalytics.filters.applied.center', $records['dahican_center'])
            ->where('reportsAnalytics.filters.applied.dateFrom', $records['dahican_date'])
            ->where('reportsAnalytics.filters.applied.dateTo', $records['dahican_date'])
            ->where('reportsAnalytics.header.barangayLabel', 'Dahican')
            ->where('reportsAnalytics.header.centerLabel', $records['dahican_center'])
            ->where('reportsAnalytics.summary.totalEvacuees', 2)
            ->where('reportsAnalytics.summary.notYet', 2)
            ->where('reportsAnalytics.summary.missing', 0)
            ->where('reportsAnalytics.populationBreakdown.categories.0.total', 1)
            ->where('reportsAnalytics.populationBreakdown.categories.1.total', 1)
            ->where('reportsAnalytics.populationBreakdown.categories.2.total', 0)
            ->where('reportsAnalytics.populationBreakdown.categories.3.total', 0)
            ->where('reportsAnalytics.populationBreakdown.categories.4.total', 1)
            ->where('reportsAnalytics.charts.genderDistribution.0.total', 0)
            ->where('reportsAnalytics.charts.genderDistribution.1.total', 2)
            ->has('reportsAnalytics.table.rows', 2)
            ->where('reportsAnalytics.table.rows.0.barangay', 'Dahican')
            ->where('reportsAnalytics.charts.barangayDistribution.0.name', 'Dahican'));
});

test('reports analytics page keeps the new chart-focused visual layout', function () {
    $page = file_get_contents(resource_path('js/pages/reports-analytics.tsx'));

    expect($page)
        ->toContain('function DonutChart')
        ->toContain('Gender Split')
        ->toContain('Status Share')
        ->toContain('Leading Barangay')
        ->toContain('Pie-style chart based on the sex field recorded in the filtered report.');
});

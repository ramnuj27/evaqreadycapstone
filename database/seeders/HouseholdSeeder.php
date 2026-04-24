<?php

namespace Database\Seeders;

use App\Models\Household;
use App\Models\HouseholdMember;
use Illuminate\Database\Seeder;

class HouseholdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Household::factory()
            ->count(3)
            ->create()
            ->each(function (Household $household): void {
                HouseholdMember::factory()
                    ->count(fake()->numberBetween(1, 4))
                    ->sequence(fn ($sequence) => [
                        'household_id' => $household->id,
                        'sort_order' => $sequence->index,
                    ])
                    ->create();
            });
    }
}

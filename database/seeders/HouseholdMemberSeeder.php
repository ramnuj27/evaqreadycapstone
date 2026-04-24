<?php

namespace Database\Seeders;

use App\Models\Household;
use App\Models\HouseholdMember;
use Illuminate\Database\Seeder;

class HouseholdMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $households = Household::query()->get();

        if ($households->isEmpty()) {
            $households = Household::factory()->count(2)->create();
        }

        $households->each(function (Household $household): void {
            if ($household->members()->exists()) {
                return;
            }

            HouseholdMember::factory()
                ->count(fake()->numberBetween(2, 5))
                ->sequence(fn ($sequence) => [
                    'household_id' => $household->id,
                    'sort_order' => $sequence->index,
                ])
                ->create();
        });
    }
}

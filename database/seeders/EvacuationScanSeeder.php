<?php

namespace Database\Seeders;

use App\Models\EvacuationScan;
use App\Models\Household;
use App\Models\User;
use App\Support\ConsoleRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvacuationScanSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $operator = User::query()
            ->where('role', ConsoleRole::OPERATOR)
            ->first();

        if ($operator === null || Household::query()->doesntExist()) {
            return;
        }

        Household::query()
            ->take(5)
            ->get()
            ->each(function (Household $household) use ($operator): void {
                EvacuationScan::factory()->create([
                    'household_id' => $household->id,
                    'operator_user_id' => $operator->id,
                    'payload' => "EVAQREADY-HOUSEHOLD:{$household->household_code}",
                    'type' => 'IN',
                ]);
            });
    }
}

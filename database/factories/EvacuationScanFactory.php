<?php

namespace Database\Factories;

use App\Models\EvacuationScan;
use App\Models\Household;
use App\Models\User;
use App\Support\MatiCityAddressOptions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvacuationScan>
 */
class EvacuationScanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $householdCode = 'EVQ-'.fake()->unique()->regexify('[A-Z0-9]{10}');

        return [
            'attendee_refs' => null,
            'evacuation_center_name' => fake()->randomElement(
                MatiCityAddressOptions::evacuationCenters(),
            ),
            'household_id' => Household::factory(),
            'operator_user_id' => User::factory(),
            'payload' => "EVAQREADY-HOUSEHOLD:{$householdCode}",
            'scanned_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'type' => fake()->randomElement(['IN', 'OUT']),
        ];
    }
}

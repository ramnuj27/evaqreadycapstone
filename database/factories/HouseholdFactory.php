<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Household>
 */
class HouseholdFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'barangay' => 'Barangay '.fake()->randomElement(['San Isidro', 'Malinao', 'Poblacion', 'Bagong Silang']),
            'city' => fake()->city(),
            'hazard_zone' => fake()->randomElement(['flood-prone', 'coastal', 'landslide', 'safe-zone']),
            'head_user_id' => User::factory(),
            'household_code' => 'EVQ-'.fake()->unique()->regexify('[A-Z0-9]{10}'),
            'name' => fake()->lastName().' Household',
            'status' => 'Active',
            'street_address' => fake()->buildingNumber().' '.fake()->streetName(),
        ];
    }
}

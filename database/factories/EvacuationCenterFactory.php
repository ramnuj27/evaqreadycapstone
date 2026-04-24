<?php

namespace Database\Factories;

use App\Models\EvacuationCenter;
use App\Support\MatiCityAddressOptions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvacuationCenter>
 */
class EvacuationCenterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $barangay = fake()->randomElement(MatiCityAddressOptions::barangays());

        return [
            'barangay' => $barangay,
            'capacity' => fake()->numberBetween(80, 300),
            'detail' => fake()->sentence(),
            'is_active' => true,
            'name' => "{$barangay} Evacuation Center ".fake()->unique()->randomNumber(3),
        ];
    }
}

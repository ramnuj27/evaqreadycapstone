<?php

namespace Database\Factories;

use App\Models\Household;
use App\Models\HouseholdMember;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseholdMember>
 */
class HouseholdMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $birthdate = CarbonImmutable::instance(
            fake()->dateTimeBetween('-80 years', '-1 year'),
        );
        $age = $birthdate->age;
        $gender = fake()->randomElement(['male', 'female']);
        $isPwd = fake()->boolean(12);
        $pwdType = $isPwd
            ? fake()->randomElement([
                'visual-impairment',
                'hearing-impairment',
                'speech-impairment',
                'physical-disability',
                'intellectual-disability',
                'psychosocial-disability',
                'multiple-disabilities',
                'other',
            ])
            : null;

        return [
            'birthdate' => $birthdate->toDateString(),
            'category' => $age < 18 ? 'Child' : ($age < 60 ? 'Adult' : 'Senior'),
            'full_name' => fake()->name(),
            'gender' => $gender,
            'household_id' => Household::factory(),
            'is_pregnant' => $gender === 'female' && $age >= 18 && $age < 50
                ? fake()->boolean(15)
                : false,
            'is_pwd' => $isPwd,
            'pwd_type' => $pwdType,
            'pwd_type_other' => $pwdType === 'other' ? fake()->words(2, true) : null,
            'sort_order' => 0,
        ];
    }
}

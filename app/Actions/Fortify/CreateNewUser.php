<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Household;
use App\Models\User;
use App\Support\ConsoleRole;
use App\Support\MatiCityAddressOptions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'birthdate' => ['required', 'date', 'before_or_equal:today'],
            'barangay' => ['required', 'string', 'max:255', Rule::in(MatiCityAddressOptions::barangays())],
            'city' => ['required', 'string', 'max:255', Rule::in([MatiCityAddressOptions::city()])],
            'contact_number' => ['required', 'string', 'max:24', 'regex:/^[0-9+\-\s()]{7,24}$/'],
            'gender' => ['required', Rule::in($this->genders())],
            'hazard_zone' => ['required', Rule::in($this->hazardZones())],
            'household_name' => ['required', 'string', 'max:255'],
            'is_pregnant' => ['nullable', 'boolean'],
            'is_pwd' => ['nullable', 'boolean'],
            'members' => ['nullable', 'array'],
            'members.*.birthdate' => ['required', 'date', 'before_or_equal:today'],
            'members.*.category' => ['required', Rule::in($this->memberCategories())],
            'members.*.full_name' => ['required', 'string', 'max:255'],
            'members.*.gender' => ['required', Rule::in($this->genders())],
            'members.*.is_pregnant' => ['nullable', 'boolean'],
            'members.*.is_pwd' => ['nullable', 'boolean'],
            'pwd_type' => ['nullable', Rule::in($this->pwdTypes())],
            'pwd_type_other' => ['nullable', 'string', 'max:255'],
            'members.*.pwd_type' => ['nullable', Rule::in($this->pwdTypes())],
            'members.*.pwd_type_other' => ['nullable', 'string', 'max:255'],
            'password' => $this->passwordRules(),
            'street_address' => ['required', 'string', 'max:255'],
        ]);

        $validator->after(function ($validator) use ($input) {
            if (
                ($input['gender'] ?? null) !== 'female'
                && (bool) ($input['is_pregnant'] ?? false)
            ) {
                $validator->errors()->add(
                    'is_pregnant',
                    'Pregnant can only be enabled for a female head of household.',
                );
            }

            if ((bool) ($input['is_pwd'] ?? false) && blank($input['pwd_type'] ?? null)) {
                $validator->errors()->add(
                    'pwd_type',
                    'Select the PWD type when the head of household is marked as PWD.',
                );
            }

            if (
                (bool) ($input['is_pwd'] ?? false)
                && ($input['pwd_type'] ?? null) === 'other'
                && blank($input['pwd_type_other'] ?? null)
            ) {
                $validator->errors()->add(
                    'pwd_type_other',
                    'Specify the PWD type when "Other" is selected for the head of household.',
                );
            }

            foreach ($input['members'] ?? [] as $index => $member) {
                if (
                    ($member['gender'] ?? null) !== 'female'
                    && (bool) ($member['is_pregnant'] ?? false)
                ) {
                    $validator->errors()->add(
                        "members.{$index}.is_pregnant",
                        'Pregnant can only be enabled for female household members.',
                    );
                }

                if ((bool) ($member['is_pwd'] ?? false) && blank($member['pwd_type'] ?? null)) {
                    $validator->errors()->add(
                        "members.{$index}.pwd_type",
                        'Select the PWD type when a household member is marked as PWD.',
                    );
                }

                if (
                    (bool) ($member['is_pwd'] ?? false)
                    &&
                    ($member['pwd_type'] ?? null) === 'other'
                    && blank($member['pwd_type_other'] ?? null)
                ) {
                    $validator->errors()->add(
                        "members.{$index}.pwd_type_other",
                        'Specify the PWD type when "Other" is selected.',
                    );
                }
            }
        });

        $validated = $validator->validate();

        return DB::transaction(function () use ($validated): User {
            $user = User::create([
                'birthdate' => $validated['birthdate'],
                'contact_number' => $validated['contact_number'],
                'email' => $validated['email'],
                'gender' => $validated['gender'],
                'is_pregnant' => $validated['gender'] === 'female'
                    && (bool) ($validated['is_pregnant'] ?? false),
                'name' => $validated['name'],
                'password' => $validated['password'],
                'role' => ConsoleRole::RESIDENT,
            ]);

            $household = $user->household()->create([
                'barangay' => $validated['barangay'],
                'city' => $validated['city'],
                'hazard_zone' => $validated['hazard_zone'],
                'household_code' => $this->nextHouseholdCode(),
                'is_pwd' => (bool) ($validated['is_pwd'] ?? false),
                'name' => $validated['household_name'],
                'pwd_type' => (bool) ($validated['is_pwd'] ?? false)
                    ? ($validated['pwd_type'] ?? null)
                    : null,
                'pwd_type_other' => (bool) ($validated['is_pwd'] ?? false)
                    && ($validated['pwd_type'] ?? null) === 'other'
                    ? ($validated['pwd_type_other'] ?? null)
                    : null,
                'street_address' => $validated['street_address'],
            ]);

            $household->members()->createMany(
                collect($validated['members'] ?? [])
                    ->values()
                    ->map(function (array $member, int $index): array {
                        $isPwd = (bool) ($member['is_pwd'] ?? false);

                        return [
                            'birthdate' => $member['birthdate'],
                            'category' => $member['category'],
                            'full_name' => $member['full_name'],
                            'gender' => $member['gender'],
                            'is_pregnant' => $member['gender'] === 'female'
                                && (bool) ($member['is_pregnant'] ?? false),
                            'is_pwd' => $isPwd,
                            'pwd_type' => $isPwd ? $member['pwd_type'] : null,
                            'pwd_type_other' => $isPwd && ($member['pwd_type'] ?? null) === 'other'
                                ? $member['pwd_type_other']
                                : null,
                            'sort_order' => $index,
                        ];
                    })
                    ->all(),
            );

            return $user->load('household.members');
        });
    }

    /**
     * @return array<int, string>
     */
    private function genders(): array
    {
        return ['male', 'female'];
    }

    /**
     * @return array<int, string>
     */
    private function hazardZones(): array
    {
        return ['flood-prone', 'coastal', 'landslide', 'safe-zone'];
    }

    /**
     * @return array<int, string>
     */
    private function memberCategories(): array
    {
        return ['Child', 'Adult', 'Senior'];
    }

    /**
     * @return array<int, string>
     */
    private function pwdTypes(): array
    {
        return [
            'visual-impairment',
            'hearing-impairment',
            'speech-impairment',
            'physical-disability',
            'intellectual-disability',
            'psychosocial-disability',
            'multiple-disabilities',
            'other',
        ];
    }

    private function nextHouseholdCode(): string
    {
        do {
            $householdCode = 'EVQ-'.Str::upper(Str::random(10));
        } while (Household::query()->where('household_code', $householdCode)->exists());

        return $householdCode;
    }
}

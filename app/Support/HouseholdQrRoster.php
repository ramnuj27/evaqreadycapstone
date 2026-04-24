<?php

namespace App\Support;

use App\Models\Household;
use App\Models\HouseholdMember;
use Carbon\CarbonInterface;

final class HouseholdQrRoster
{
    /**
     * @return array<int, array{
     *     age: int|null,
     *     gender: string|null,
     *     id: string,
     *     name: string,
     *     qrReference: string,
     *     role: string
     * }>
     */
    public static function members(Household $household): array
    {
        $household->loadMissing([
            'headUser:id,name,gender,birthdate',
            'members:id,household_id,full_name,sort_order,gender,birthdate,category',
        ]);

        $members = [[
            'age' => self::ageForBirthdate($household->headUser?->birthdate),
            'gender' => self::normalizedGender($household->headUser?->gender),
            'id' => "household-{$household->id}-head",
            'name' => $household->headUser?->name ?? $household->name,
            'qrReference' => "{$household->household_code}-HEAD",
            'role' => 'Head of Family',
        ]];

        $memberRows = $household->members
            ->values()
            ->map(function (HouseholdMember $member, int $index) use (
                $household,
            ): array {
                $sequence = max((int) $member->sort_order, $index + 1);

                return [
                    'age' => self::ageForBirthdate($member->birthdate),
                    'gender' => self::normalizedGender($member->gender),
                    'id' => "member-{$member->id}",
                    'name' => $member->full_name,
                    'qrReference' => sprintf(
                        '%s-M%02d',
                        $household->household_code,
                        $sequence,
                    ),
                    'role' => self::memberRoleLabel($member),
                ];
            })
            ->all();

        return [...$members, ...$memberRows];
    }

    /**
     * @return array<int, string>
     */
    public static function qrReferences(Household $household): array
    {
        return collect(self::members($household))
            ->pluck('qrReference')
            ->values()
            ->all();
    }

    private static function ageForBirthdate(mixed $birthdate): ?int
    {
        if (! $birthdate instanceof CarbonInterface) {
            return null;
        }

        return $birthdate->age;
    }

    private static function normalizedGender(mixed $gender): ?string
    {
        if (! is_string($gender)) {
            return null;
        }

        $normalizedGender = strtolower(trim($gender));

        return $normalizedGender === '' ? null : $normalizedGender;
    }

    private static function memberRoleLabel(HouseholdMember $member): string
    {
        return match (self::populationCategory($member)) {
            'Child' => 'Child',
            'Senior' => 'Senior Family Member',
            default => 'Family Member',
        };
    }

    private static function populationCategory(HouseholdMember $member): string
    {
        if ($member->birthdate instanceof CarbonInterface) {
            return match (true) {
                $member->birthdate->age >= 60 => 'Senior',
                $member->birthdate->age >= 18 => 'Adult',
                default => 'Child',
            };
        }

        return match ($member->category) {
            'Child' => 'Child',
            'Senior' => 'Senior',
            default => 'Adult',
        };
    }
}

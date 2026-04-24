<?php

namespace App\Support;

class ConsoleRole
{
    public const CDRRMO_ADMIN = 'CDRRMO Admin';

    public const BARANGAY_COMMITTEE = 'Barangay Committee';

    public const OPERATOR = 'Operator';

    public const RESIDENT = 'Resident';

    /**
     * @var array<string, string>
     */
    private const ROLE_ALIASES = [
        'CDRRMO Admin' => self::CDRRMO_ADMIN,
        'cdrrmo admin' => self::CDRRMO_ADMIN,
        'admin' => self::CDRRMO_ADMIN,
        'main_admin' => self::CDRRMO_ADMIN,
        'Barangay Committee' => self::BARANGAY_COMMITTEE,
        'barangay committee' => self::BARANGAY_COMMITTEE,
        'barangay_admin' => self::BARANGAY_COMMITTEE,
        'Operator' => self::OPERATOR,
        'operator' => self::OPERATOR,
        'responder' => self::OPERATOR,
        'Resident' => self::RESIDENT,
        'resident' => self::RESIDENT,
    ];

    public static function label(?string $role, string $fallback = self::RESIDENT): string
    {
        $normalizedRole = self::normalize($role);

        if ($normalizedRole !== null) {
            return $normalizedRole;
        }

        if (! is_string($role) || trim($role) === '') {
            return $fallback;
        }

        return str($role)->replace(['_', '-'], ' ')->title()->toString();
    }

    public static function normalize(?string $role): ?string
    {
        if (! is_string($role) || trim($role) === '') {
            return null;
        }

        $normalizedRole = trim($role);

        return self::ROLE_ALIASES[$normalizedRole]
            ?? self::ROLE_ALIASES[str($normalizedRole)->lower()->toString()]
            ?? null;
    }

    public static function isCdrrmoAdmin(?string $role): bool
    {
        return self::normalize($role) === self::CDRRMO_ADMIN;
    }

    public static function isBarangayCommittee(?string $role): bool
    {
        return self::normalize($role) === self::BARANGAY_COMMITTEE;
    }

    public static function isOperator(?string $role): bool
    {
        return self::normalize($role) === self::OPERATOR;
    }

    public static function isResident(?string $role): bool
    {
        return self::normalize($role) === self::RESIDENT;
    }

    public static function isConsoleAdmin(?string $role): bool
    {
        return self::isCdrrmoAdmin($role) || self::isBarangayCommittee($role);
    }

    public static function isConsoleUser(?string $role): bool
    {
        return in_array(self::normalize($role), self::consoleRoles(), true);
    }

    /**
     * @return array<int, string>
     */
    public static function consoleRoleValues(): array
    {
        return [
            self::CDRRMO_ADMIN,
            'admin',
            'main_admin',
            self::BARANGAY_COMMITTEE,
            'barangay_admin',
            self::OPERATOR,
            'responder',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function consoleRoles(): array
    {
        return [
            self::CDRRMO_ADMIN,
            self::BARANGAY_COMMITTEE,
            self::OPERATOR,
        ];
    }
}

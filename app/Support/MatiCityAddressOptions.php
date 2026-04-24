<?php

namespace App\Support;

final class MatiCityAddressOptions
{
    /**
     * @return array<int, string>
     */
    public static function barangays(): array
    {
        return [
            'Badas',
            'Bobon',
            'Buso',
            'Cabuaya',
            'Central',
            'Culian',
            'Dahican',
            'Danao',
            'Dawan',
            'Don Enrique Lopez',
            'Don Martin Marundan',
            'Don Salvador Lopez, Sr.',
            'Langka',
            'Lawigan',
            'Libudon',
            'Luban',
            'Macambol',
            'Mamali',
            'Matiao',
            'Mayo',
            'Sainz',
            'Sanghay',
            'Tagabakid',
            'Tagbinonga',
            'Taguibo',
            'Tamisan',
        ];
    }

    public static function city(): string
    {
        return 'Mati City';
    }

    /**
     * @return array<int, string>
     */
    public static function evacuationCenters(): array
    {
        return collect(self::barangays())
            ->map(fn (string $barangay): string => self::evacuationCenterName($barangay))
            ->all();
    }

    public static function evacuationCenterName(string $barangay): string
    {
        return "{$barangay} Evacuation Center";
    }
}

<?php

namespace Database\Seeders\Pages;

/** Reads database/data/demo-places.json for the Stays and Adventures seeders. Not a seeder itself (the name does not end in Seeder). */
class DemoPlaces
{
    private const REGIONS = [
        'Srinagar' => 'Jammu & Kashmir', 'Gulmarg' => 'Jammu & Kashmir', 'Pahalgam' => 'Jammu & Kashmir', 'Sonamarg' => 'Jammu & Kashmir', 'Jammu' => 'Jammu & Kashmir',
        'Manali' => 'Himachal Pradesh', 'Goa' => 'Goa', 'Kerala' => 'Kerala', 'Rishikesh' => 'Uttarakhand', 'Haridwar' => 'Uttarakhand',
        'Udaipur' => 'Rajasthan', 'Bali' => 'Indonesia', 'Pune' => 'Maharashtra', 'Mahabaleshwar' => 'Maharashtra', 'Mumbai' => 'Maharashtra',
    ];

    /** @return array<int, array<string, mixed>> the places of one type ('hotel' or 'activity') */
    public static function of(string $type): array
    {
        $file = database_path('data/demo-places.json');
        $all = is_file($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];

        return array_values(array_filter($all, fn ($p) => ($p['type'] ?? '') === $type));
    }

    public static function region(?string $city): ?string
    {
        return self::REGIONS[$city] ?? null;
    }

    /** A stable pseudo-random number from a key, so re-seeding gives the same demo figures. */
    public static function pick(string $key, int $min, int $max): int
    {
        return $min + (crc32($key) % ($max - $min + 1));
    }
}

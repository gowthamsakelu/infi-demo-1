<?php

namespace Database\Seeders\Pages;

use App\Models\SavedActivity;
use Illuminate\Database\Seeder;

/**
 * Adventures share `saved_activities` with the itinerary builder's activity search. The demo activities from
 * database/data/demo-places.json get a tag, rating, duration and pricing tiers. Running it again updates the same rows.
 */
class AdventureSeeder extends Seeder
{
    private const DIFFICULTY = ['adventure' => 'Moderate', 'water' => 'Easy', 'sightseeing' => 'Easy', 'culture' => 'Easy', 'nature' => 'Easy', 'food' => 'Easy'];

    public function run(): void
    {
        // The one in the design first; every demo place follows.
        $this->save('page-gulmarg-gondola', [
            'name' => 'Gulmarg Gondola, Phase 1 and 2', 'location' => 'Gulmarg', 'category' => 'sightseeing', 'rating' => 4.7, 'price' => 1800, 'duration' => 180,
            'description' => 'Cable car to Kongdoori and Apharwat Peak with views over the Pir Panjal.',
        ], ['best_time' => 'Dec - Feb (snow), Apr - Jun', 'meeting_point' => 'Gondola base station', 'min_age' => '3 years', 'partner' => 'Gulmarg Ropeway Ltd.', 'difficulty' => 'Easy', 'group' => 9000]);

        foreach (DemoPlaces::of('activity') as $p) {
            $this->save($p['id'], $p, []);
        }
    }

    private function save(string $key, array $p, array $x): void
    {
        $tag = $p['category'] ?? 'adventure';
        $adult = (int) ($p['price'] ?? 0);
        $city = $p['location'] ?: null;
        SavedActivity::updateOrCreate(['demo_key' => substr($key, 0, 120)], [
            'name' => $p['name'], 'city' => $city, 'region' => DemoPlaces::region($city), 'address' => $p['area'] ?? null,
            'meeting_point' => $x['meeting_point'] ?? ($p['area'] ?? null), 'tag' => $tag, 'status' => DemoPlaces::pick($key, 0, 11) === 0 ? 'inactive' : 'active',
            'rating' => $p['rating'] ?? null, 'reviews' => $p['reviews'] ?? 0, 'duration_minutes' => $p['duration'] ?? null,
            'price_adult' => $adult ?: null, 'price_child' => $adult ? (int) (round($adult * 0.7 / 50) * 50) : null,
            'price_group' => $adult ? ($x['group'] ?? (int) (round($adult * 5 / 100) * 100)) : null, 'group_size' => $adult ? 6 : null,
            'difficulty' => $x['difficulty'] ?? (self::DIFFICULTY[$tag] ?? 'Easy'), 'best_time' => $x['best_time'] ?? 'Oct - Mar',
            'min_age' => $x['min_age'] ?? ($tag === 'adventure' ? '8 years' : 'All ages'), 'partner' => $x['partner'] ?? ($city ? "{$city} Local Guides" : null),
            'description' => $p['description'] ?? null, 'bookings_count' => DemoPlaces::pick($key.'b', 3, 40),
        ]);
    }
}

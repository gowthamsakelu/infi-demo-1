<?php

namespace Database\Seeders\Pages;

use App\Models\SavedHotel;
use App\Models\StayRoom;
use Illuminate\Database\Seeder;

/**
 * Stays share `saved_hotels` with the itinerary builder's hotel search. The demo hotels from database/data/demo-places.json
 * become stays with a tag, a rating, rooms and a rate per meal plan. Running it again updates the same rows.
 */
class StaySeeder extends Seeder
{
    public function run(): void
    {
        // Hand-written stays first so the top of the list matches what the team knows: name, city, tag, rating, reviews, rooms, per-night price, phone
        $named = [
            ['Hotel Lake View', 'Srinagar', 'hotel', 4.5, 312, 24, 4200, '+91 194 250 1234'],
            ['Calangute Beach Villa', 'Goa', 'villa', 4.6, 188, 5, 9500, '+91 832 227 6655'],
            ['Snow Peak Resort', 'Manali', 'resort', 4.4, 241, 42, 5600, '+91 1902 252 120'],
            ['Backwater Haven', 'Kerala', 'resort', 4.7, 156, 18, 7200, '+91 477 223 4411'],
            ['Ganga View Hotel', 'Rishikesh', 'hotel', 4.2, 97, 20, 2900, '+91 135 243 0088'],
            ['Lake Pichola Villa', 'Udaipur', 'villa', 4.8, 205, 6, 12000, '+91 294 242 2200'],
        ];
        foreach ($named as [$name, $city, $tag, $rating, $reviews, $rooms, $price, $phone]) {
            $this->stay("page-{$name}", $name, $city, $tag, $rating, $reviews, $rooms, $price, $phone, null);
        }

        foreach (DemoPlaces::of('hotel') as $p) {
            $lower = strtolower($p['name']);
            $tag = str_contains($lower, 'villa') || str_contains($lower, 'houseboat') || str_contains($lower, 'homestay') ? 'villa' : (str_contains($lower, 'resort') ? 'resort' : 'hotel');
            $this->stay($p['id'], $p['name'], $p['location'] ?: null, $tag, $p['rating'] ?? null, $p['reviews'] ?? 0, DemoPlaces::pick($p['id'], 5, 40), (int) ($p['price'] ?? 0), null, $p['description'] ?? null, $p['area'] ?? null);
        }
    }

    private function stay(string $key, string $name, ?string $city, string $tag, ?float $rating, int $reviews, int $roomsCount, int $price, ?string $phone, ?string $description, ?string $area = null): void
    {
        $slug = str($name)->slug('')->toString();
        $stay = SavedHotel::updateOrCreate(['demo_key' => substr($key, 0, 120)], [
            'name' => $name, 'city' => $city, 'region' => DemoPlaces::region($city), 'address' => $area ? trim("$area, $city", ', ') : null,
            'phone' => $phone ?? '+91 9'.DemoPlaces::pick($key, 100000000, 899999999),
            'email' => "stay@{$slug}.example.com", 'tag' => $tag, 'status' => DemoPlaces::pick($key, 0, 9) === 0 ? 'inactive' : 'active',
            'rating' => $rating, 'reviews' => $reviews, 'rooms_count' => $roomsCount, 'price_from' => $price ?: null,
            'description' => $description ?: "{$name} in ".($city ?: 'the region').'. Rates below are per room per night.',
            'amenities' => ['Wi-Fi', 'Heater', 'Restaurant', 'Airport pickup', $tag === 'resort' ? 'Pool' : 'Room service'],
            'bookings_count' => $bookings = DemoPlaces::pick($key.'b', 2, 30), 'revenue' => $bookings * max($price, 3000) * 2,
        ]);

        if (! $price) {
            return;
        }
        $stay->rooms()->delete();
        // room type, occupancy, multiplier on the "from" price
        foreach ([['Standard', '2 adults', 0.8], ['Deluxe', '2 adults + 1 child', 1.0], ['Premium room', '2 adults + 1 child', 1.35], ['Suite', '3 adults', 1.85]] as $i => [$room, $who, $m]) {
            $base = (int) (round($price * $m / 100) * 100);
            StayRoom::create([
                'saved_hotel_id' => $stay->id, 'name' => $room, 'occupancy' => $who, 'sort' => $i,
                'rate_stay' => $base, 'rate_breakfast' => $base + 500, 'rate_map' => $base + 1200, 'rate_all' => $base + 1800,
            ]);
        }
    }
}

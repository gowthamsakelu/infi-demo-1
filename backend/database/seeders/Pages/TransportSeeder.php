<?php

namespace Database\Seeders\Pages;

use App\Models\VehicleType;
use Database\Seeders\VehicleTypeSeeder;
use Illuminate\Database\Seeder;

/**
 * Transport reads the itinerary builder's own `vehicle_types`. This makes sure they exist (VehicleTypeSeeder is idempotent and
 * would otherwise run after the page seeders) and fills the extra columns the page shows: a description, a rate card, trips.
 */
class TransportSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(VehicleTypeSeeder::class);

        // key => [description, trips this year, average days per trip, most popular]
        // Matched to verified production fleet: Toyota Innova Crysta, Maruti Suzuki Ertiga & Swift Dzire, Tata Winger / Bus
        $extra = [
            'sedan_ac' => ['Maruti Suzuki Swift Dzire (AC, 4-Seater)', 58, 3.2, true],
            'suv_ac' => ['Toyota Innova Crysta / Maruti Ertiga (AC, 6-7 Seater)', 41, 4.1, true],
            'tempo_traveller' => ['Tata Winger / Tempo Traveller (Push-back AC)', 26, 4.6, true],
            'black_premium' => ['Toyota Fortuner / Premium Sedan', 9, 2.8, false],
            'sedan_nonac' => ['Maruti Swift Dzire (Non-AC Budget)', 12, 3.0, false],
            'suv_nonac' => ['Mahindra Scorpio / Bolero (Non-AC)', 8, 3.6, false],
            'mini_bus' => ['Tata Bus / Coach (20+ Seats)', 5, 2.4, false],
            'scooter_bike' => ['Honda Activa / Royal Enfield Bullet 350', 17, 2.0, false],
            'self_drive' => ['Self-drive Mahindra Thar / Ertiga', 7, 3.5, false],
            'boat' => ['Dal Lake Shikara / Luxury Houseboat', 6, 1.5, false],
            'bus' => ['Ticketed, arranged by the customer', 0, null, false],
            'train' => ['Ticketed, arranged by the customer', 0, null, false],
            'flight' => ['Ticketed, arranged by the customer', 0, null, false],
        ];

        foreach (VehicleType::query()->get() as $v) {
            [$description, $trips, $avg, $popular] = $extra[$v->key] ?? [null, 0, null, false];
            $base = $v->base_rate;
            $v->update([
                'description' => $description, 'trips_count' => $trips, 'avg_days' => $avg, 'most_popular' => $popular, 'show_in_builder' => true,
                'rate_card' => $base === null ? [] : [
                    ['label' => 'Base rate', 'note' => '8 hours, 80 km per day', 'amount' => $base, 'unit' => 'day'],
                    ['label' => 'Extra distance', 'note' => 'After 80 km per day', 'amount' => (int) round($base / 250), 'unit' => 'km'],
                    ['label' => 'Night halt', 'note' => 'Driver allowance', 'amount' => 500, 'unit' => 'night'],
                    ['label' => 'Airport transfer', 'note' => 'One way, within city', 'amount' => (int) round($base * 0.34 / 100) * 100, 'unit' => null],
                ],
            ]);
        }
    }
}

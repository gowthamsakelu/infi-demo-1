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
        $extra = [
            'sedan_ac' => ['Dzire, Etios or similar', 58, 3.2, true],
            'suv_ac' => ['Innova, Ertiga or similar', 41, 4.1, true],
            'tempo_traveller' => ['AC, push-back seats', 26, 4.6, true],
            'black_premium' => ['Luxury sedan', 9, 2.8, false],
            'sedan_nonac' => ['Budget option', 12, 3.0, false],
            'suv_nonac' => ['Budget SUV for hill roads', 8, 3.6, false],
            'mini_bus' => ['Group travel, 20 seats', 5, 2.4, false],
            'scooter_bike' => ['Self ride, helmet included', 17, 2.0, false],
            'self_drive' => ['Self-drive, fuel extra', 7, 3.5, false],
            'boat' => ['Per night, meals optional', 6, 1.5, false],
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

<?php

namespace Database\Seeders;

use App\Models\VehicleType;
use Illuminate\Database\Seeder;

/** Placeholder daily rates (INR) so the transport form has something to show; staff set the real ones. */
class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        // key, name, icon, seats, ac, category, base_rate (null = the customer arranges it), rank
        $rows = [
            ['sedan_ac', 'Sedan 4-seater AC', 'car', 4, true, 'car', 3500, 1],
            ['suv_ac', 'SUV 6-seater AC', 'suv', 6, true, 'car', 4800, 2],
            ['tempo_traveller', 'Tempo Traveller 12-seater', 'van', 12, true, 'van', 7500, 3],
            ['black_premium', 'Black premium car', 'car', 4, true, 'car', 6500, 4],
            ['sedan_nonac', 'Non-AC sedan', 'car', 4, false, 'car', 2800, 5],
            ['suv_nonac', 'Non-AC SUV', 'suv', 6, false, 'car', 3800, 6],
            ['mini_bus', 'Mini bus', 'bus', 20, true, 'bus', 11000, 7],
            ['scooter_bike', 'Scooter / Bike rental', 'bike', 2, false, 'bike', 600, 8],
            ['self_drive', 'Self-drive rental', 'car', 5, true, 'car', 2200, 9],
            ['boat', 'Cruise / Houseboat / Boat', 'boat', null, true, 'boat', 9000, 10],
            ['bus', 'Bus', 'bus', null, true, 'public', null, 11],
            ['train', 'Train', 'train', null, true, 'public', null, 12],
            ['flight', 'Flight', 'plane', null, true, 'public', null, 13],
        ];

        foreach ($rows as [$key, $name, $icon, $seats, $ac, $category, $rate, $rank]) {
            VehicleType::updateOrCreate(['key' => $key], [
                'name' => $name, 'icon' => $icon, 'seats' => $seats, 'ac' => $ac, 'category' => $category,
                'base_rate' => $rate, 'rate_unit' => $rate === null ? null : 'per_day', 'popularity_rank' => $rank, 'active' => true,
            ]);
        }
    }
}

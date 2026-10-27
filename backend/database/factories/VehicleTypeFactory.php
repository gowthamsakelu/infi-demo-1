<?php

namespace Database\Factories;

use App\Models\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VehicleType> */
class VehicleTypeFactory extends Factory
{
    protected $model = VehicleType::class;

    public function definition(): array
    {
        return [
            'key' => fake()->unique()->slug(2),
            'name' => fake()->unique()->words(2, true),
            'icon' => 'car',
            'seats' => 4,
            'ac' => true,
            'category' => 'car',
            'base_rate' => 3500,
            'rate_unit' => 'per_day',
            'popularity_rank' => fake()->numberBetween(1, 99),
            'active' => true,
        ];
    }
}

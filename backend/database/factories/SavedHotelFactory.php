<?php

namespace Database\Factories;

use App\Models\SavedHotel;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SavedHotel> */
class SavedHotelFactory extends Factory
{
    protected $model = SavedHotel::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Hotel',
            'city' => fake()->city(),
            'region' => fake()->state(),
            'tag' => 'hotel',
            'status' => 'active',
            'rating' => 4.2,
            'reviews' => 120,
            'rooms_count' => 20,
            'price_from' => 4000,
            'uses' => 1,
        ];
    }
}

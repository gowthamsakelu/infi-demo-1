<?php

namespace Database\Factories;

use App\Models\SavedActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SavedActivity> */
class SavedActivityFactory extends Factory
{
    protected $model = SavedActivity::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'city' => fake()->city(),
            'region' => fake()->state(),
            'tag' => 'adventure',
            'status' => 'active',
            'rating' => 4.5,
            'duration_minutes' => 120,
            'price_adult' => 1500,
            'uses' => 1,
        ];
    }
}

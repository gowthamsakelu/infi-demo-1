<?php

namespace Database\Factories;

use App\Models\TourPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourPackage> */
class TourPackageFactory extends Factory
{
    protected $model = TourPackage::class;

    public function definition(): array
    {
        $days = fake()->numberBetween(2, 7);

        return [
            'destination_id' => null,
            'name' => fake()->unique()->words(3, true).' tour',
            'tag' => 'tour',
            'status' => 'published',
            'seasonal' => false,
            'days' => $days,
            'nights' => $days - 1,
            'price_from' => fake()->numberBetween(4, 30) * 1000,
            'description' => fake()->sentence(),
            'price_tiers' => [],
            'inclusions' => ['Hotel stay', 'Daily breakfast'],
            'exclusions' => ['Flights'],
            'bookings_count' => 0,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }
}

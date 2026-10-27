<?php

namespace Database\Factories;

use App\Models\Destination;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Destination> */
class DestinationFactory extends Factory
{
    protected $model = Destination::class;

    public function definition(): array
    {
        $name = fake()->unique()->city();

        return [
            'slug' => str($name)->slug()->toString(),
            'name' => $name,
            'region' => fake()->state().', India',
            'status' => 'active',
            'popular' => false,
            'keywords' => [],
            'best_season' => 'Oct - Mar',
            'avg_days' => 4,
            'avg_nights' => 3,
            'ideal_duration' => '3 to 5 day trips',
            'nearest_airport' => fake()->city().' ('.strtoupper(fake()->lexify('???')).')',
            'description' => fake()->sentence(),
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft']);
    }
}

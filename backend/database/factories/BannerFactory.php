<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Banner> */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'headline' => fake()->sentence(3),
            'cta' => 'From ₹'.fake()->numberBetween(4, 30).',000',
            'image' => 'goa.jpg',
            'tone' => 'blue',
            'placement' => 'Home hero',
            'slot' => 1,
            'position' => fake()->unique()->numberBetween(1, 10000),
            'is_active' => true,
            'clicks' => 0, 'leads' => 0, 'converted' => 0,
        ];
    }

    public function draft(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function scheduled(): static
    {
        return $this->state(['is_active' => true, 'starts_at' => today()->addDays(5)->toDateString()]);
    }
}

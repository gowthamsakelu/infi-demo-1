<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<User> */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => str()->random(40),
            'role' => 'sales',
            'title' => 'Sales Executive',
            'status' => 'active',
            'last_active_at' => now()->subHours(2),
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin', 'title' => 'Owner']);
    }

    public function operations(): static
    {
        return $this->state(['role' => 'operations', 'title' => 'Operations Executive']);
    }

    public function status(string $status): static
    {
        return $this->state(['status' => $status]);
    }
}

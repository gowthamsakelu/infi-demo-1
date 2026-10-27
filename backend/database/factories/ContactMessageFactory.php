<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ContactMessage> */
class ContactMessageFactory extends Factory
{
    protected $model = ContactMessage::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => '+91 98200 '.fake()->numerify('#####'),
            'subject' => 'Kashmir trip for 4',
            'message' => 'Hi, we would like a package for four people. Could you share the approximate cost?',
            'source' => 'Website form',
            'destination' => 'Kashmir',
            'travel_start' => '2026-12-20', 'travel_end' => '2026-12-26',
            'adults' => 2, 'children' => 2,
            'interests' => 'Houseboat, Gulmarg',
            'existing_customer' => false,
            'status' => 'new',
            'read_at' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(['read_at' => now()]);
    }

    public function spam(): static
    {
        return $this->state(['status' => 'spam', 'subject' => 'Boost your website ranking now']);
    }
}

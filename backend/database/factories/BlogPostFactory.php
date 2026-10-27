<?php

namespace Database\Factories;

use App\Models\BlogPost;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<BlogPost> */
class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'author' => 'Riya Sharma',
            'category' => 'guide',
            'status' => 'published',
            'published_at' => now()->subDays(10),
            'views' => 100, 'leads' => 2, 'converted' => 1,
        ];
    }

    public function draft(): static
    {
        return $this->state(['status' => 'draft', 'published_at' => null, 'views' => 0, 'leads' => 0, 'converted' => 0]);
    }

    public function scheduled(): static
    {
        return $this->state(['status' => 'scheduled', 'published_at' => now()->addDays(4), 'views' => 0, 'leads' => 0, 'converted' => 0]);
    }
}

<?php

namespace Database\Seeders\Pages;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // title, author, category, status, published, views (30 days), leads, converted
        $rows = [
            ['Top 10 places to visit in Kashmir in winter', 'Riya Sharma', 'guide', 'published', $now->copy()->subDays(14), 2140, 11, 3],
            ['5 day Kashmir itinerary for first-time visitors', 'Karan Sapalia', 'itinerary', 'published', $now->copy()->subDays(28), 1860, 9, 2],
            ['Goa on a budget: villas vs hotels', 'Aman Joshi', 'guide', 'published', $now->copy()->subDays(41), 1230, 6, 1],
            ['What to pack for a Manali snow trip', 'Riya Sharma', 'tips', 'published', $now->copy()->subDays(54), 980, 4, 1],
            ['Rishikesh rafting: safety and best season', 'Aman Joshi', 'tips', 'published', $now->copy()->subDays(67), 870, 5, 1],
            ['Kerala backwaters: houseboat guide', 'Karan Sapalia', 'guide', 'published', $now->copy()->subDays(80), 760, 2, 1],
            ['Diwali holiday destinations 2026', 'Riya Sharma', 'guide', 'scheduled', $now->copy()->addDays(6), 0, 0, 0],
            ['Bali in a week: a relaxed itinerary', 'Karan Sapalia', 'itinerary', 'scheduled', $now->copy()->addDays(12), 0, 0, 0],
            ['Spiti Valley road trip checklist', 'Aman Joshi', 'tips', 'draft', null, 0, 0, 0],
            ['Paragliding in Bir: what first-timers should know', 'Aman Joshi', 'tips', 'draft', null, 0, 0, 0],
        ];

        foreach ($rows as [$title, $author, $category, $status, $published, $views, $leads, $converted]) {
            BlogPost::updateOrCreate(['slug' => str($title)->slug()->toString()], [
                'title' => $title, 'author' => $author, 'category' => $category, 'status' => $status,
                'published_at' => $published, 'views' => $views, 'leads' => $leads, 'converted' => $converted,
            ]);
        }
    }
}

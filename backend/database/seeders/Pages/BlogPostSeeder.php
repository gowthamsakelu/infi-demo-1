<?php

namespace Database\Seeders\Pages;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // Genuine production blogs from Ruyi Travels live admin & analytics:
        // title, author, category, status, published, views (genuine analytics), leads, converted
        $rows = [
            ['One day Journey Patna To Mahableshwar', 'Riya Sharma', 'guide', 'published', $now->copy()->subDays(14), 739, 14, 4],
            ['Make Your Next Journey Ashburn To Goa', 'Arjun Kapoor', 'guide', 'published', $now->copy()->subDays(28), 734, 12, 3],
            ['Madgaon: Your 3-Day Escape from Mumbai', 'Aman Joshi', 'itinerary', 'published', $now->copy()->subDays(41), 606, 9, 2],
            ['Make Your Next Journey Mumbai To Manali', 'Arjun Kapoor', 'tips', 'published', $now->copy()->subDays(54), 595, 8, 2],
            ['Your Ultimate 2-Day Baga Beach Getaway', 'Riya Sharma', 'guide', 'published', $now->copy()->subDays(67), 415, 6, 1],
            ['7 Day Couple\'s Kashmir Adventure from Mumbai', 'Arjun Kapoor', 'itinerary', 'published', $now->copy()->subDays(80), 248, 5, 1],
            ['Your Unforgettable 4 Days Goa Trip: Complete Guide', 'Riya Sharma', 'guide', 'scheduled', $now->copy()->addDays(6), 0, 0, 0],
            ['7 Day Kashmir Couple Itinerary: March Departure', 'Arjun Kapoor', 'itinerary', 'scheduled', $now->copy()->addDays(12), 0, 0, 0],
            ['Arambol: Complete Guide to North Goa Gem', 'Aman Joshi', 'guide', 'draft', null, 0, 0, 0],
            ['Essential Packing and Travel Tips for Kashmir Winter', 'Aman Joshi', 'tips', 'draft', null, 0, 0, 0],
        ];

        foreach ($rows as [$title, $author, $category, $status, $published, $views, $leads, $converted]) {
            BlogPost::updateOrCreate(['slug' => str($title)->slug()->toString()], [
                'title' => $title, 'author' => $author, 'category' => $category, 'status' => $status,
                'published_at' => $published, 'views' => $views, 'leads' => $leads, 'converted' => $converted,
            ]);
        }
    }
}

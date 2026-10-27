<?php

namespace Database\Seeders\Pages;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $year = now()->year;
        // name, headline, cta, image, tone, placement, slot, active, starts, ends, clicks, leads, converted
        $rows = [
            ['Kashmir Winter Special', 'Kashmir in snow', 'Book from ₹15,000', 'kedarnath.jpg', 'blue', 'Home hero', 1, true, "$year-01-01", "$year-12-28", 1240, 14, 3],
            ['Goa Beach Villas', 'Beach villas in Goa', 'From ₹11,000', 'goa_beach_villa_1792398351292.jpg', 'teal', 'Home hero', 2, true, null, null, 860, 9, 2],
            ['Manali Snow Escape', 'Snow in Manali', '6 days, 5 nights', 'manali.jpg', 'indigo', 'Destinations page', null, true, "$year-01-01", "$year-12-31", 540, 6, 1],
            ['Rishikesh Rafting', 'Rafting weekend', 'From ₹4,500', 'rishikesh_rafting_1792398369106.jpg', 'amber', 'Adventures page', null, true, null, null, 410, 7, 2],
            ['Bir Paragliding', 'Fly over the Himalaya', 'Flights from ₹3,200', 'paragliding_bir_1792398411958.jpg', 'sky', 'Adventures page', null, true, null, null, 320, 5, 1],
            ['Diwali Offer', 'Festive travel sale', 'Flat 10 percent off', 'manali_resort_1792398389178.jpg', 'rose', 'Home hero', 3, true, now()->addDays(10)->toDateString(), now()->addDays(40)->toDateString(), 0, 0, 0],
            ['Kerala Backwaters', 'Backwater escape', 'From ₹21,000', null, 'green', 'Not placed yet', null, false, null, null, 0, 0, 0],
            ['Bali Honeymoon', 'Bali for two', 'Packages from ₹68,000', null, 'violet', 'Not placed yet', null, false, null, null, 0, 0, 0],
        ];

        foreach ($rows as $i => [$name, $headline, $cta, $image, $tone, $placement, $slot, $active, $starts, $ends, $clicks, $leads, $converted]) {
            Banner::updateOrCreate(['name' => $name], [
                'headline' => $headline, 'cta' => $cta, 'image' => $image, 'tone' => $tone, 'placement' => $placement, 'slot' => $slot,
                'position' => $i + 1, 'is_active' => $active, 'starts_at' => $starts, 'ends_at' => $ends,
                'clicks' => $clicks, 'leads' => $leads, 'converted' => $converted,
            ]);
        }
    }
}

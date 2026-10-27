<?php

namespace Database\Seeders\Pages;

use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        // name, region, status, popular, keywords, best season, days, nights, ideal duration, nearest airport, image
        $rows = [
            ['Kashmir', 'Jammu & Kashmir, India', 'active', true, ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'], 'Mar - Jun, Dec - Feb', 5, 4, '5 to 7 day trips', 'Srinagar (SXR)', null],
            ['Goa', 'Goa, India', 'active', true, ['Candolim', 'Calangute', 'Baga'], 'Nov - Feb', 4, 3, '3 to 5 day trips', 'Dabolim (GOI)', 'goa.jpg'],
            ['Manali', 'Himachal Pradesh, India', 'active', true, ['Solang', 'Rohtang', 'Kullu'], 'Mar - Jun, Dec - Jan', 5, 4, '4 to 6 day trips', 'Bhuntar (KUU)', 'manali.jpg'],
            ['Kerala', 'Kerala, India', 'active', true, ['Munnar', 'Alleppey', 'Kochi', 'Thekkady', 'Kumarakom'], 'Sep - Mar', 6, 5, '5 to 7 day trips', 'Kochi (COK)', null],
            ['Bali', 'Indonesia', 'active', true, ['Ubud', 'Seminyak', 'Nusa'], 'Apr - Oct', 6, 5, '5 to 7 day trips', 'Denpasar (DPS)', null],
            ['Rishikesh', 'Uttarakhand, India', 'active', false, ['Haridwar', 'Laxman Jhula'], 'Sep - Nov, Feb - Apr', 3, 2, '2 to 4 day trips', 'Dehradun (DED)', 'paragliding.jpg'],
            ['Udaipur', 'Rajasthan, India', 'active', false, ['Pichola', 'Kumbhalgarh'], 'Oct - Mar', 4, 3, '3 to 5 day trips', 'Udaipur (UDR)', null],
            ['Jaipur', 'Rajasthan, India', 'active', false, ['Amer', 'Pink City'], 'Oct - Mar', 3, 2, '2 to 4 day trips', 'Jaipur (JAI)', null],
            ['Ladakh', 'Ladakh, India', 'active', false, ['Leh', 'Nubra', 'Pangong'], 'Jun - Sep', 7, 6, '6 to 8 day trips', 'Leh (IXL)', null],
            ['Andaman', 'Andaman & Nicobar, India', 'active', false, ['Havelock', 'Port Blair', 'Neil'], 'Oct - May', 5, 4, '4 to 6 day trips', 'Port Blair (IXZ)', null],
            ['Darjeeling', 'West Bengal, India', 'active', false, ['Gangtok', 'Kalimpong'], 'Mar - May, Oct - Nov', 4, 3, '3 to 5 day trips', 'Bagdogra (IXB)', null],
            ['Shimla', 'Himachal Pradesh, India', 'active', false, ['Kufri', 'Kasauli'], 'Mar - Jun, Dec - Jan', 4, 3, '3 to 5 day trips', 'Shimla (SLV)', null],
            ['Haridwar', 'Uttarakhand, India', 'active', false, ['Har Ki Pauri'], 'Feb - Apr, Sep - Nov', 2, 1, '1 to 3 day trips', 'Dehradun (DED)', null],
            ['Mumbai', 'Maharashtra, India', 'active', false, ['Colaba', 'Elephanta'], 'Nov - Feb', 3, 2, '2 to 4 day trips', 'Mumbai (BOM)', null],
            ['Spiti Valley', 'Himachal Pradesh, India', 'draft', false, ['Kaza', 'Kibber'], 'May - Oct', 7, 6, '6 to 8 day trips', 'Bhuntar (KUU)', null],
            ['Sikkim', 'Sikkim, India', 'draft', false, ['Gangtok', 'Lachung'], 'Mar - Jun, Oct - Dec', 6, 5, '5 to 7 day trips', 'Bagdogra (IXB)', null],
            ['Coorg', 'Karnataka, India', 'draft', false, ['Madikeri'], 'Oct - Mar', 3, 2, '2 to 4 day trips', 'Mangaluru (IXE)', null],
            ['Varanasi', 'Uttar Pradesh, India', 'draft', false, ['Kashi', 'Banaras'], 'Oct - Mar', 3, 2, '2 to 4 day trips', 'Varanasi (VNS)', null],
            ['Pune', 'Maharashtra, India', 'draft', false, [], 'Jun - Feb', 2, 1, '1 to 3 day trips', 'Pune (PNQ)', null],
            ['Mahabaleshwar', 'Maharashtra, India', 'draft', false, ['Panchgani'], 'Oct - Jun', 3, 2, '2 to 3 day trips', 'Pune (PNQ)', null],
        ];

        foreach ($rows as [$name, $region, $status, $popular, $keywords, $season, $days, $nights, $ideal, $airport, $image]) {
            Destination::updateOrCreate(['slug' => str($name)->slug()->toString()], [
                'name' => $name, 'region' => $region, 'status' => $status, 'popular' => $popular, 'keywords' => $keywords,
                'best_season' => $season, 'avg_days' => $days, 'avg_nights' => $nights, 'ideal_duration' => $ideal,
                'nearest_airport' => $airport, 'image' => $image,
                'description' => "{$name} is one of our most requested trips. Plan {$ideal} around {$season}.",
            ]);
        }
    }
}

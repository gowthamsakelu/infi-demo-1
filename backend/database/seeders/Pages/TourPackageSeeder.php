<?php

namespace Database\Seeders\Pages;

use App\Models\Destination;
use App\Models\PackageDay;
use App\Models\TourPackage;
use Illuminate\Database\Seeder;

/**
 * Sample tour packages linked to destinations (DestinationSeeder runs before this one). Each day is stored the way the itinerary
 * builder saves it, so "Use as itinerary for an inquiry" can prefill the builder. Running it again updates the same rows.
 */
class TourPackageSeeder extends Seeder
{
    public function run(): void
    {
        // name, destination slug, tag, status, seasonal, days, nights, price per person, bookings, day plans
        // a day plan is [title, place, [[kind, title, time, detail], ...]]; kinds: t transport, h hotel check-in, a activity, m meal, n note
        $rows = [
            ['Kashmir Valley & Gulmarg Tour', 'kashmir', 'tour', 'published', false, 5, 4, 15000, 14, [
                ['Arrival in Srinagar', 'Srinagar', [['t', 'Airport pickup to Srinagar hotel', '11:30', 'Private cab'], ['h', 'Hotel Lake View', '14:00', 'bb'], ['a', 'Shikara ride on Dal Lake', '16:30', '90 min']]],
                ['Gulmarg day trip', 'Gulmarg', [['t', 'Srinagar to Gulmarg drive', '08:30', 'SUV'], ['a', 'Gulmarg Gondola Phase 1 and 2', '09:00', '3 hrs'], ['m', 'Lunch at Gulmarg', '13:00', 'Kashmiri wazwan']]],
                ['Pahalgam', 'Pahalgam', [['t', 'Srinagar to Pahalgam', '09:00', 'SUV'], ['a', 'Betaab Valley and Aru Valley', '12:00', '4 hrs'], ['m', 'Dinner at hotel', '20:00', 'Veg and non-veg']]],
                ['Sonamarg excursion', 'Sonamarg', [['t', 'Pahalgam to Sonamarg', '08:00', 'SUV'], ['a', 'Thajiwas Glacier pony ride', '11:30', '2 hrs'], ['n', 'Carry warm clothes; the road closes at dusk.']]],
                ['Departure', 'Srinagar', [['m', 'Breakfast at hotel', '08:00', ''], ['t', 'Hotel to Srinagar airport', '11:00', 'Private cab']]],
            ]],
            ['Srinagar Houseboat Escape', 'kashmir', 'tour', 'published', false, 4, 3, 12500, 11, [
                ['Houseboat check-in', 'Srinagar', [['t', 'Airport pickup', '12:00', 'Sedan'], ['h', 'Houseboat Golden Crown', '14:00', 'map'], ['a', 'Sunset shikara ride', '17:00', '90 min']]],
                ['Mughal gardens', 'Srinagar', [['a', 'Mughal Gardens tour', '10:00', '3 hrs'], ['a', 'Shankaracharya Temple visit', '15:00', '2 hrs']]],
                ['Old city walk', 'Srinagar', [['a', 'Old City heritage walk', '09:30', '150 min'], ['m', 'Wazwan dinner', '20:00', 'Traditional feast']]],
            ]],
            ['Goa Beach Villa Getaway', 'goa', 'villa', 'published', false, 3, 2, 11000, 9, [
                ['Arrive and settle in', 'Calangute', [['t', 'Dabolim airport to villa', '12:00', 'Sedan'], ['h', 'Calangute Beach Villa', '14:00', 'bb'], ['a', 'Sunset at Baga beach', '17:30', '2 hrs']]],
                ['North Goa', 'North Goa', [['a', 'Fort Aguada and Chapora', '10:00', '4 hrs'], ['m', 'Lunch at a beach shack', '13:30', 'Goan thali']]],
                ['Departure', 'Goa', [['m', 'Breakfast at the villa', '08:30', ''], ['t', 'Villa to Dabolim airport', '11:00', 'Sedan']]],
            ]],
            ['Manali Snow Escape', 'manali', 'tour', 'published', true, 6, 5, 18500, 7, [
                ['Delhi to Manali', 'Manali', [['t', 'Overnight Volvo to Manali', '19:00', 'Volvo'], ['n', 'Pick-up from Kashmere Gate.']]],
                ['Manali sightseeing', 'Manali', [['h', 'Snow Peak Resort', '10:00', 'bb'], ['a', 'Hadimba Temple and Old Manali', '14:00', '3 hrs']]],
                ['Solang Valley', 'Solang', [['a', 'Solang Valley snow activities', '10:00', '4 hrs'], ['m', 'Lunch at Solang', '14:00', 'Veg thali']]],
                ['Rohtang or Atal Tunnel', 'Sissu', [['t', 'Manali to Atal Tunnel and Sissu', '09:00', 'SUV'], ['a', 'Snow point', '11:30', '2 hrs']]],
                ['Kullu and rafting', 'Kullu', [['a', 'River rafting at Kullu', '11:00', '90 min'], ['a', 'Shawl factory visit', '15:00', '1 hr']]],
                ['Departure', 'Manali', [['t', 'Manali to Delhi Volvo', '17:00', 'Volvo']]],
            ]],
            ['Kerala Backwaters', 'kerala', 'tour', 'published', false, 6, 5, 21000, 5, [
                ['Kochi arrival', 'Kochi', [['t', 'Airport pickup', '12:00', 'Sedan'], ['h', 'Fort Kochi Heritage Hotel', '14:00', 'bb'], ['a', 'Chinese fishing nets and Fort Kochi walk', '16:00', '2 hrs']]],
                ['Munnar', 'Munnar', [['t', 'Kochi to Munnar', '08:30', 'SUV'], ['h', 'Munnar Tea Valley Resort', '14:00', 'map'], ['a', 'Tea estate visit', '16:00', '90 min']]],
                ['Munnar sightseeing', 'Munnar', [['a', 'Eravikulam National Park', '09:00', '3 hrs'], ['m', 'Lunch with a view', '13:00', 'Kerala meals']]],
                ['Thekkady', 'Thekkady', [['t', 'Munnar to Thekkady', '09:00', 'SUV'], ['a', 'Periyar boat ride', '16:00', '1 hr']]],
                ['Alleppey houseboat', 'Alleppey', [['t', 'Thekkady to Alleppey', '09:00', 'SUV'], ['h', 'Alleppey houseboat', '12:30', 'all'], ['a', 'Backwater cruise', '13:00', '24 hrs']]],
                ['Departure', 'Kochi', [['t', 'Alleppey to Kochi airport', '10:00', 'Sedan']]],
            ]],
            ['Rishikesh Rafting Weekend', 'rishikesh', 'activity', 'published', false, 2, 1, 4500, 12, [
                ['Arrive and Ganga aarti', 'Rishikesh', [['t', 'Dehradun airport to Rishikesh', '11:00', 'Sedan'], ['h', 'Ganga View Hotel', '13:00', 'bb'], ['a', 'Triveni Ghat Ganga aarti', '18:00', '90 min']]],
                ['River rafting', 'Shivpuri', [['a', 'River rafting, Shivpuri', '09:00', '3 hrs'], ['m', 'Riverside lunch', '13:00', 'Veg thali'], ['t', 'Rishikesh to Dehradun airport', '16:00', 'Sedan']]],
            ]],
            ['Spiti Valley Road Trip', 'spiti-valley', 'tour', 'draft', true, 8, 7, 26000, 0, [
                ['Shimla to Kalpa', 'Kalpa', [['t', 'Shimla to Kalpa', '07:00', 'Tempo Traveller']]],
                ['Kalpa to Kaza', 'Kaza', [['t', 'Kalpa to Kaza via Nako', '07:30', 'Tempo Traveller'], ['a', 'Nako Lake', '11:00', '1 hr']]],
            ]],
            ['Bali Escape', 'bali', 'tour', 'published', false, 6, 5, 48000, 3, [
                ['Arrive in Denpasar', 'Seminyak', [['t', 'Airport transfer', '13:00', 'Private car'], ['h', 'Seminyak Beach Resort', '15:00', 'bb'], ['a', 'Sunset at Seminyak beach', '17:30', '2 hrs']]],
                ['Ubud', 'Ubud', [['a', 'Tegallalang rice terraces', '09:00', '2 hrs'], ['a', 'Ubud monkey forest', '12:00', '90 min']]],
                ['Nusa Penida', 'Nusa Penida', [['t', 'Fast boat to Nusa Penida', '08:00', 'Boat'], ['a', 'Kelingking beach', '11:00', '3 hrs']]],
            ]],
            ['Kashmir Winter Special', 'kashmir', 'tour', 'published', true, 6, 5, 22000, 6, [
                ['Arrival in Srinagar', 'Srinagar', [['t', 'Airport pickup', '11:00', 'SUV'], ['h', 'Hotel Lalit Grand Palace', '14:00', 'map']]],
                ['Gulmarg snow day', 'Gulmarg', [['a', 'Gulmarg Gondola Phase 1 and 2', '09:00', '3 hrs'], ['a', 'Skiing lesson', '13:00', '2 hrs']]],
            ]],
            ['Goa Beaches and Nightlife', 'goa', 'tour', 'draft', false, 4, 3, 9500, 0, [
                ['Arrival', 'Calangute', [['t', 'Airport pickup', '12:00', 'Sedan'], ['h', 'Candolim Beach Hotel', '14:00', 'bb']]],
            ]],
        ];

        $destinations = Destination::query()->pluck('id', 'slug');
        $inclusions = [
            'tour' => ['Hotel stay with daily breakfast', 'Airport pickup and drop', 'Private AC cab for sightseeing', 'Sightseeing and entry tickets as listed', 'Driver allowance, tolls and parking'],
            'villa' => ['Villa stay with daily breakfast', 'Airport pickup and drop', 'Welcome drink on arrival', 'Local sightseeing by cab', 'Driver allowance, tolls and parking'],
            'activity' => ['Hotel stay with breakfast', 'Activity fees and safety gear', 'Trained guides', 'Local transfers', 'First-aid support'],
        ];
        $exclusions = ['Flights and train tickets', 'Lunch and dinner unless listed', 'Personal expenses and tips', 'Anything not listed under Inclusions', 'GST as applicable'];

        foreach ($rows as [$name, $slug, $tag, $status, $seasonal, $days, $nights, $price, $bookings, $plans]) {
            $dest = Destination::query()->where('slug', $slug)->first();
            $package = TourPackage::updateOrCreate(['name' => $name], [
                'destination_id' => $destinations[$slug] ?? null,
                'tag' => $tag, 'status' => $status, 'seasonal' => $seasonal, 'days' => $days, 'nights' => $nights,
                'price_from' => $price, 'bookings_count' => $bookings,
                'description' => "{$days} days and {$nights} nights in ".($dest?->name ?? 'the region').'. Hotels, transfers and sightseeing are planned day by day and can be edited for each inquiry.',
                'inclusions' => $inclusions[$tag], 'exclusions' => $exclusions,
                'price_tiers' => [
                    ['label' => 'Solo traveller', 'note' => 'Per person, single room', 'price' => (int) round($price * 1.25 / 100) * 100],
                    ['label' => 'Couple', 'note' => 'Per person, 2 travellers', 'price' => $price],
                    ['label' => 'Family of 4', 'note' => 'Per person', 'price' => (int) round($price * 0.92 / 100) * 100],
                    ['label' => 'Group of 6 or more', 'note' => 'Per person', 'price' => (int) round($price * 0.85 / 100) * 100],
                ],
            ]);

            foreach (range(1, $days) as $n) {
                [$title, $place, $items] = $plans[$n - 1] ?? ["Day $n in ".($dest?->name ?? 'the region'), $dest?->name, [['a', 'Local sightseeing', '10:00', '4 hrs'], ['m', 'Dinner at the hotel', '20:00', '']]];
                PackageDay::updateOrCreate(['tour_package_id' => $package->id, 'day_number' => $n], [
                    'title' => $title, 'location' => $place, 'location_mode' => 'same',
                    'items' => $this->items("PKG{$package->id}-D{$n}", $items, $place),
                ]);
            }
            PackageDay::where('tour_package_id', $package->id)->where('day_number', '>', $days)->delete();
        }
    }

    /** Events in the builder's saved shape (details.b carries the fields the builder edits). */
    private function items(string $prefix, array $rows, ?string $place): array
    {
        $out = [];
        foreach ($rows as $k => $r) {
            $id = "{$prefix}-".($k + 1);
            $kind = $r[0];
            $title = $r[1];
            $time = $r[2] ?? null;
            $detail = $r[3] ?? '';
            $at = $time ? date('h:i A', strtotime($time)) : null;
            $out[] = match ($kind) {
                't' => ['id' => $id, 'type' => 'transport', 'icon' => 'bus', 'title' => $title, 'subtitle' => trim("$at • $detail", ' •'), 'time' => $at, 'inclusion' => 'included',
                    'details' => ['b' => ['role' => 'transport', 'title' => $title, 'mode' => 'Cab', 'vehicle' => $detail, 'dep' => $time, 'days' => 1, 'arrangedBy' => 'agency']]],
                'h' => ['id' => $id, 'type' => 'stay', 'icon' => 'bed', 'title' => "Check-in: $title", 'subtitle' => trim("$at • $place", ' •'), 'time' => $at, 'location' => $place, 'inclusion' => 'included',
                    'details' => ['b' => ['role' => 'check_in', 'name' => $title, 'city' => $place, 'checkInTime' => $time, 'checkOutTime' => '11:00', 'plan' => $detail ?: 'bb', 'rooms' => 1, 'inclusion' => 'included']]],
                'a' => ['id' => $id, 'type' => 'activity', 'icon' => 'camera', 'title' => $title, 'subtitle' => trim("$at • $place • $detail", ' •'), 'time' => $at, 'location' => $place, 'inclusion' => 'included',
                    'details' => ['b' => ['role' => 'activity', 'title' => $title, 'time' => $time, 'place' => $place, 'duration' => $detail, 'inclusion' => 'included', 'tickets' => 1]]],
                'm' => ['id' => $id, 'type' => 'meal', 'icon' => 'restaurant', 'title' => $title, 'subtitle' => trim("$at • $detail", ' •'), 'time' => $at, 'inclusion' => 'included',
                    'details' => ['b' => ['role' => 'meal', 'kind' => str_contains(strtolower($title), 'breakfast') ? 'Breakfast' : (str_contains(strtolower($title), 'lunch') ? 'Lunch' : 'Dinner'), 'time' => $time, 'place' => $place, 'diet' => $detail, 'inclusion' => 'included']]],
                default => ['id' => $id, 'type' => 'note', 'icon' => 'note', 'title' => 'Note', 'subtitle' => $title, 'visibleToCustomer' => true,
                    'details' => ['b' => ['role' => 'note', 'text' => $title, 'visible' => true]]],
            };
        }

        return $out;
    }
}

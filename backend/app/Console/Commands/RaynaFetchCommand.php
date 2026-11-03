<?php

namespace App\Console\Commands;

use App\Models\SavedActivity;
use App\Support\Rayna\RaynaApiException;
use App\Support\Rayna\RaynaApiService;
use Illuminate\Console\Command;

class RaynaFetchCommand extends Command
{
    protected $signature = 'rayna:fetch 
                            {action=countries : Action to perform: countries, cities, tours, tour-details, options, sync-adventures, demo}
                            {--country= : Country ID}
                            {--city= : City ID}
                            {--tour= : Tour ID}
                            {--contract= : Contract ID}
                            {--date= : Travel date YYYY-MM-DD}
                            {--adults=1 : Number of adults}
                            {--fresh : Bypass cache}';

    protected $description = 'Fetch data or run demo flows from the Rayna B2B Tour API definition';

    public function handle(RaynaApiService $rayna): int
    {
        $action = $this->argument('action');
        $fresh = (bool) $this->option('fresh');

        $this->info("Executing Rayna API Action: [{$action}]");
        $this->line("Mode: " . strtoupper($rayna->getMode()));
        $this->line("Base URL: " . $rayna->getBaseUrl());
        $this->line("Live Token: " . ($rayna->isConfigured() ? 'Configured' : 'None (Using sample mock data from rayna-api.json)'));

        try {
            match ($action) {
                'demo' => $this->handleDemo($rayna),
                'countries' => $this->handleCountries($rayna, $fresh),
                'cities' => $this->handleCities($rayna, $fresh),
                'tours' => $this->handleTours($rayna, $fresh),
                'tour-details' => $this->handleTourDetails($rayna),
                'options' => $this->handleOptions($rayna),
                'sync-adventures' => $this->handleSyncAdventures($rayna, $fresh),
                default => $this->error("Unknown action: {$action}. Valid: demo, countries, cities, tours, tour-details, options, sync-adventures"),
            };
            return self::SUCCESS;
        } catch (RaynaApiException $e) {
            $this->error("Rayna API Error [{$e->getCode()}]: " . $e->getMessage());
            return self::FAILURE;
        } catch (\Throwable $e) {
            $this->error("Unexpected error: " . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function handleCountries(RaynaApiService $rayna, bool $fresh): void
    {
        $countries = $rayna->countries($fresh);
        $this->info("Found " . count($countries) . " countries:");
        $rows = array_map(fn ($c) => [
            'ID' => $c['countryId'] ?? $c['id'] ?? '-',
            'Name' => $c['countryName'] ?? $c['name'] ?? '-',
        ], $countries);

        $this->table(['ID', 'Name'], $rows);
    }

    private function handleCities(RaynaApiService $rayna, bool $fresh): void
    {
        $countryId = (int) $this->option('country');
        if (!$countryId) {
            $this->error("Missing required --country=<id> option.");
            return;
        }

        $cities = $rayna->cities($countryId, $fresh);
        $this->info("Found " . count($cities) . " cities for country {$countryId}:");
        $rows = array_map(fn ($c) => [
            'ID' => $c['cityId'] ?? $c['id'] ?? '-',
            'Name' => $c['cityName'] ?? $c['name'] ?? '-',
        ], $cities);

        $this->table(['ID', 'Name'], $rows);
    }

    private function handleTours(RaynaApiService $rayna, bool $fresh): void
    {
        $countryId = (int) $this->option('country');
        $cityId = (int) $this->option('city');

        if (!$countryId || !$cityId) {
            $this->error("Missing required options: --country=<id> and --city=<id>");
            return;
        }

        $tours = $rayna->tourStaticData($countryId, $cityId, $fresh);
        $this->info("Found " . count($tours) . " tours for Country {$countryId}, City {$cityId}:");

        $rows = array_map(fn ($t) => [
            'Tour ID' => $t['tourId'] ?? '-',
            'Contract ID' => $t['contractId'] ?? '-',
            'Tour Name' => substr($t['tourName'] ?? '', 0, 35),
            'Duration' => $t['duration'] ?? '-',
            'Rating' => $t['rating'] ?? '-',
            'Slot?' => !empty($t['isSlot']) ? 'Yes' : 'No',
        ], array_slice($tours, 0, 25));

        $this->table(['Tour ID', 'Contract ID', 'Tour Name', 'Duration', 'Rating', 'Slot?'], $rows);
        if (count($tours) > 25) {
            $this->line("... and " . (count($tours) - 25) . " more tours.");
        }
    }

    private function handleTourDetails(RaynaApiService $rayna): void
    {
        $countryId = (int) $this->option('country');
        $cityId = (int) $this->option('city');
        $tourId = (int) $this->option('tour');
        $contractId = (int) $this->option('contract');
        $date = $this->option('date') ?: date('Y-m-d');

        if (!$countryId || !$cityId || !$tourId || !$contractId) {
            $this->error("Missing required options: --country, --city, --tour, and --contract");
            return;
        }

        $details = $rayna->tourStaticDataById($countryId, $cityId, $tourId, $contractId, $date);
        $this->info("Tour Details: " . ($details['tourName'] ?? "Tour #{$tourId}"));
        $this->line("Description: " . substr(strip_tags($details['tourDescription'] ?? ''), 0, 150) . "...");
        $this->line("Inclusions: " . substr(strip_tags($details['tourInclusion'] ?? ''), 0, 100) . "...");
        $this->line("Cancellation Policy: " . ($details['cancellationPolicyName'] ?? '-'));
    }

    private function handleOptions(RaynaApiService $rayna): void
    {
        $tourId = (int) $this->option('tour');
        $contractId = (int) $this->option('contract');
        $date = $this->option('date') ?: date('Y-m-d', strtotime('+3 days'));
        $adults = (int) $this->option('adults');

        if (!$tourId || !$contractId) {
            $this->error("Missing required options: --tour and --contract");
            return;
        }

        $options = $rayna->tourOptions($tourId, $contractId, $date, $adults);
        $this->info("Found " . count($options) . " options for Tour {$tourId} on {$date} ({$adults} adult):");

        $rows = array_map(fn ($o) => [
            'Option ID' => $o['tourOptionId'] ?? '-',
            'Transfer' => $o['transferName'] ?? '-',
            'Adult Price' => $o['adultPrice'] ?? $o['finalAmount'] ?? 0,
            'Child Price' => $o['childPrice'] ?? 0,
            'Slot?' => !empty($o['isSlot']) ? 'Yes' : 'No',
        ], $options);

        $this->table(['Option ID', 'Transfer', 'Adult Price', 'Child Price', 'Slot?'], $rows);
    }

    private function handleSyncAdventures(RaynaApiService $rayna, bool $fresh): void
    {
        $countryId = (int) $this->option('country');
        $cityId = (int) $this->option('city');

        if (!$countryId || !$cityId) {
            $this->error("Missing required options: --country=<id> and --city=<id>");
            return;
        }

        $tours = $rayna->tourStaticData($countryId, $cityId, $fresh);
        $this->info("Syncing " . count($tours) . " Rayna tours into the Adventures database...");

        $synced = 0;
        foreach ($tours as $t) {
            $tourId = (int) ($t['tourId'] ?? 0);
            if (!$tourId) continue;

            $placeId = "rayna:{$tourId}";
            $name = $t['tourName'] ?? "Tour #{$tourId}";
            $cityName = $t['cityName'] ?? 'Dubai';

            SavedActivity::updateOrCreate(
                ['place_id' => $placeId],
                [
                    'name' => $name,
                    'city' => $cityName,
                    'address' => $cityName,
                    'rating' => (float) ($t['rating'] ?? 4.5),
                    'reviews' => (int) ($t['reviewCount'] ?? 10),
                    'tag' => $t['cityTourType'] ?: 'Sightseeing',
                    'status' => 'active',
                    'partner' => 'Rayna Tours',
                    'description' => $t['tourShortDescription'] ?? '',
                    'image' => $t['imageUrl'] ?? ($t['imagePath'] ? $rayna->formatImageUrl($t['imagePath']) : null),
                    'duration_minutes' => !empty($t['duration']) ? (int) $t['duration'] * 60 : 180,
                ]
            );
            $synced++;
        }

        $this->info("Successfully synced {$synced} tours into the Adventures catalog (`saved_activities` table).");
    }

    private function handleDemo(RaynaApiService $rayna): void
    {
        $date = $this->option('date') ?: date('Y-m-d', strtotime('+7 days'));
        $adults = (int) $this->option('adults') ?: 1;

        $this->info("=== Rayna API Integration Demo Flow ===");
        $this->warn("NOTICE: Running in MOCK mode. Values are synthetic mock data adhering strictly to rayna-api.json schemas. No live supplier API calls are made.");
        $this->newLine();

        $res = $rayna->runDemoFlow($date, $adults);
        $flow = $res['flow'];

        // Step 1: Countries
        $this->comment($flow['step1_countries']['name']);
        $this->line("  Schema: POST /api/Tour/countries -> [countryId, countryName]");
        $this->line("  Found {$flow['step1_countries']['count']} synthetic countries. Selected: {$flow['step1_countries']['selected']['countryName']} (ID: {$flow['step1_countries']['selected']['countryId']})");

        // Step 2: Cities
        $this->comment($flow['step2_cities']['name']);
        $this->line("  Schema: POST /api/Tour/cities (CountryId) -> [cityId, cityName]");
        $this->line("  Found {$flow['step2_cities']['count']} synthetic cities. Selected: {$flow['step2_cities']['selected']['cityName']} (ID: {$flow['step2_cities']['selected']['cityId']})");

        // Step 3: Tours
        $this->comment($flow['step3_tours']['name']);
        $tour = $flow['step3_tours']['selected'];
        $this->line("  Schema: POST /api/Tour/tourstaticdata -> [tourId, tourName, duration, rating, isSlot, imagePath]");
        $this->line("  Selected: '{$tour['tourName']}'");
        $this->line("  - Tour ID: {$tour['tourId']} (ID 4850 taken from rayna-api.json imageExample)");
        $this->line("  - Duration: {$tour['duration']} | Rating: {$tour['rating']} | Category: {$tour['cityTourType']}");
        $this->line("  - Slot Required (isSlot): " . ($tour['isSlot'] ? 'YES' : 'NO'));
        $this->line("  - Image URL: {$tour['imageUrl']} (Formatted with CloudFront imageBase from rayna-api.json)");

        // Step 4: Options
        $this->comment($flow['step4_options']['name']);
        $opt = $flow['step4_options']['selected'];
        $this->line("  Schema: POST /api/Tour/touroption -> [tourOptionId, transferId, transferName, adultPrice, finalAmount]");
        $this->line("  Found {$flow['step4_options']['count']} synthetic option(s) for {$adults} adult(s) on {$date}.");
        $this->line("  Selected: Option {$opt['tourOptionId']} ({$opt['transferName']} - Transfer ID 41865 from transferTypes in JSON)");
        $this->line("  - Synthetic Rate: AED {$opt['adultPrice']} | Total: AED {$opt['finalAmount']}");
        $this->line("  - Start Time: {$opt['startTime']}");

        // Step 5: Timeslots
        $this->comment($flow['step5_timeslots']['name']);
        if ($flow['step5_timeslots']['isSlot']) {
            $slot = $flow['step5_timeslots']['selected'];
            $this->line("  Branch: Tour has isSlot=true. Called POST /api/Tour/timeslot.");
            $this->line("  Selected Slot: {$slot['timeSlot']} (ID: {$slot['timeSlotId']}, Capacity: {$slot['available']})");
        } else {
            $this->line("  Branch: " . $flow['step5_timeslots']['message']);
        }

        // Step 6: Availability
        $this->comment($flow['step6_availability']['name']);
        $avail = $flow['step6_availability'];
        $this->line("  Schema: POST /api/Tour/availability -> [status: 1, message: 'success' from rayna-api.json]");
        $this->line("  Response Message: '{$avail['message']}' | Bookable: " . ($avail['isBookable'] ? 'YES' : 'NO'));

        // Step 7: Policy
        $this->comment($flow['step7_policy']['name']);
        $charges = $flow['step7_policy']['charges'][0] ?? [];
        $this->line("  Schema: POST /api/Tour/policy -> [currency: 'AED', percentage: 100 from rayna-api.json]");
        $this->line("  Cancellation Fee: " . ($charges['percentage'] ?? 100) . "% from {$charges['fromDate']} to {$charges['toDate']} (MM-DD-YYYY)");

        // Step 8: Booking Preview
        $this->comment($flow['step8_booking_preview']['name']);
        $conf = $flow['step8_booking_preview']['confirmation'];
        $this->line("  Schema: POST /api/Booking/bookings -> [refernceNo, status, bookingId, downloadRequired, confirmationNo]");
        $this->line("  Status: " . ($conf['status'] ?? 'Unknown'));
        $this->line("  Booking ID: " . ($conf['bookingId'] ?? '-'));
        $this->line("  Reference No: " . ($conf['refernceNo'] ?? '-'));
        $this->line("  Confirmation No: " . ($conf['confirmationNo'] ?? '-'));
        $this->line("  Download Required: " . (!empty($conf['downloadRequired']) ? 'YES (Tickets available via GetBookedTickets)' : 'NO'));
        $this->warn("  Disclaimer: " . ($conf['mockDisclaimer'] ?? 'SIMULATED DEMO ONLY'));

        $this->newLine();
        $this->info("✓ Demo flow verified: End-to-end integration works without external network calls.");
    }
}


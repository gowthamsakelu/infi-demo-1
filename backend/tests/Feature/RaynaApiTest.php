<?php

namespace Tests\Feature;

use App\Models\SavedActivity;
use App\Models\User;
use App\Support\Rayna\RaynaApiException;
use App\Support\Rayna\RaynaApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RaynaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.rayna.mode' => 'live',
            'services.rayna.base_url' => 'https://api.raynab2b.com',
            'services.rayna.token' => 'test-bearer-token',
            'services.rayna.image_base' => 'https://d2cazmkfw8kdtj.cloudfront.net',
        ]);

        $this->actingAs(User::demo());
    }

    public function test_rayna_mock_mode_serves_sample_data_without_network_calls(): void
    {
        config(['services.rayna.mode' => 'mock']);
        $service = app(RaynaApiService::class);

        $this->assertTrue($service->isMock());
        $this->assertSame('mock', $service->getMode());

        $countries = $service->countries();
        $this->assertCount(2, $countries);
        $this->assertStringContainsString('United Arab Emirates', $countries[0]['countryName']);

        $cities = $service->cities(1);
        $this->assertCount(2, $cities);
        $this->assertStringContainsString('Dubai', $cities[0]['cityName']);

        $tours = $service->tourStaticData(1, 101);
        $this->assertCount(2, $tours);
        $this->assertSame(4850, $tours[0]['tourId']);
        $this->assertTrue($tours[0]['isSlot']);
    }

    public function test_rayna_demo_flow_executes_all_eight_steps_in_mock_mode(): void
    {
        config(['services.rayna.mode' => 'mock']);
        $service = app(RaynaApiService::class);

        $demo = $service->runDemoFlow('2026-11-15', 2);
        $this->assertSame('success', $demo['status']);
        $this->assertSame('mock', $demo['mode']);

        $flow = $demo['flow'];
        $this->assertArrayHasKey('step1_countries', $flow);
        $this->assertArrayHasKey('step2_cities', $flow);
        $this->assertArrayHasKey('step3_tours', $flow);
        $this->assertArrayHasKey('step4_options', $flow);
        $this->assertArrayHasKey('step5_timeslots', $flow);
        $this->assertArrayHasKey('step6_availability', $flow);
        $this->assertArrayHasKey('step7_policy', $flow);
        $this->assertArrayHasKey('step8_booking_preview', $flow);

        // Verification of slot branching
        $this->assertTrue($flow['step5_timeslots']['isSlot']);
        $this->assertCount(2, $flow['step5_timeslots']['data']);

        // Verification of visibly fake booking confirmation
        $this->assertStringContainsString('SIMULATED DEMO MOCK', $flow['step8_booking_preview']['confirmation']['status']);
        $this->assertStringContainsString('NOT-A-REAL-BOOKING', $flow['step8_booking_preview']['confirmation']['refernceNo']);
        $this->assertFalse($flow['step8_booking_preview']['confirmation']['isRealBooking']);
    }

    public function test_rayna_demo_flow_endpoint_returns_json(): void
    {
        config(['services.rayna.mode' => 'mock']);

        $res = $this->getJson('/api/rayna/demo-flow?travelDate=2026-11-15&adults=2')
            ->assertOk()
            ->json();

        $this->assertSame('success', $res['status']);
        $this->assertArrayHasKey('flow', $res);
        $this->assertArrayHasKey('step8_booking_preview', $res['flow']);
    }

    public function test_rayna_service_fetches_countries(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/countries' => Http::response([
                'statuscode' => 200,
                'error' => null,
                'result' => [
                    ['countryId' => 1, 'countryName' => 'United Arab Emirates'],
                    ['countryId' => 2, 'countryName' => 'Singapore'],
                ],
            ], 200),
        ]);

        $service = app(RaynaApiService::class);
        $countries = $service->countries(true);

        $this->assertCount(2, $countries);
        $this->assertSame('United Arab Emirates', $countries[0]['countryName']);
    }

    public function test_rayna_service_fetches_cities_with_proper_payload(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/cities' => function ($request) {
                $this->assertSame(1, $request['CountryId']);
                return Http::response([
                    'statuscode' => 200,
                    'error' => null,
                    'result' => [
                        ['cityId' => 10, 'cityName' => 'Dubai'],
                        ['cityId' => 11, 'cityName' => 'Abu Dhabi'],
                    ],
                ], 200);
            },
        ]);

        $service = app(RaynaApiService::class);
        $cities = $service->cities(1, true);

        $this->assertCount(2, $cities);
        $this->assertSame('Dubai', $cities[0]['cityName']);
    }

    public function test_rayna_service_formats_image_urls_with_cloudfront(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/tourstaticdata' => Http::response([
                'statuscode' => 200,
                'error' => null,
                'result' => [
                    [
                        'tourId' => 4850,
                        'tourName' => 'Desert Safari with BBQ Dinner',
                        'cityId' => 10,
                        'cityName' => 'Dubai',
                        'countryId' => 1,
                        'imagePath' => 'Tour-Images/false-4850/desert-safari.jpg',
                        'cityTourType' => 'Adventure',
                        'duration' => '6 Hours',
                        'rating' => 4.8,
                        'reviewCount' => 320,
                        'tourShortDescription' => 'Thrilling desert safari with dune bashing.',
                    ],
                ],
            ], 200),
        ]);

        $service = app(RaynaApiService::class);
        $tours = $service->tourStaticData(1, 10, true);

        $this->assertCount(1, $tours);
        $this->assertSame(
            'https://d2cazmkfw8kdtj.cloudfront.net/Tour-Images/false-4850/desert-safari.jpg',
            $tours[0]['imageUrl']
        );
    }

    public function test_rayna_custom_error_codes_are_mapped_to_friendly_exceptions(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/touroption' => Http::response([
                'statuscode' => 200,
                'error' => '100',
                'result' => [],
            ], 200),
        ]);

        $service = app(RaynaApiService::class);

        $this->expectException(RaynaApiException::class);
        $this->expectExceptionMessage('AdultRate or ChildRate is lower than system price');

        $service->tourOptions(4850, 1, '2026-11-10');
    }

    public function test_rayna_fetch_artisan_command_syncs_adventures(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/tourstaticdata' => Http::response([
                'statuscode' => 200,
                'error' => null,
                'result' => [
                    [
                        'tourId' => 9999,
                        'tourName' => 'Burj Khalifa At The Top',
                        'cityId' => 10,
                        'cityName' => 'Dubai',
                        'countryId' => 1,
                        'imagePath' => 'Tour-Images/burj.jpg',
                        'cityTourType' => 'Sightseeing',
                        'duration' => '2',
                        'rating' => 4.9,
                        'reviewCount' => 1200,
                        'tourShortDescription' => 'Observation deck on the 124th and 125th floors.',
                    ],
                ],
            ], 200),
        ]);

        $this->artisan('rayna:fetch sync-adventures --country=1 --city=10 --fresh')
            ->assertSuccessful()
            ->expectsOutputToContain('Successfully synced 1 tours');

        $this->assertDatabaseHas('saved_activities', [
            'place_id' => 'rayna:9999',
            'name' => 'Burj Khalifa At The Top',
            'city' => 'Dubai',
            'partner' => 'Rayna Tours',
        ]);
    }

    public function test_rayna_controller_endpoints(): void
    {
        Http::fake([
            'https://api.raynab2b.com/api/Tour/countries' => Http::response([
                'statuscode' => 200,
                'error' => null,
                'result' => [['countryId' => 1, 'countryName' => 'United Arab Emirates']],
            ], 200),
            'https://api.raynab2b.com/api/Tour/cities' => Http::response([
                'statuscode' => 200,
                'error' => null,
                'result' => [['cityId' => 10, 'cityName' => 'Dubai']],
            ], 200),
        ]);

        // Status check
        $this->getJson('/api/rayna/status')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'configured' => true,
                'baseUrl' => 'https://api.raynab2b.com',
            ]);

        // Countries check
        $this->getJson('/api/rayna/countries')
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('data.0.countryName', 'United Arab Emirates');

        // Cities check
        $this->getJson('/api/rayna/cities?countryId=1')
            ->assertOk()
            ->assertJsonPath('count', 1)
            ->assertJsonPath('data.0.cityName', 'Dubai');
    }
}

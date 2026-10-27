<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\SavedHotel;
use App\Models\User;
use Database\Seeders\Pages\DestinationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DestinationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_is_empty_but_valid_with_no_destinations(): void
    {
        $this->getJson('/api/destinations')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_seeder_creates_twenty_with_fourteen_active_and_five_popular(): void
    {
        $this->seed(DestinationSeeder::class);
        $this->seed(DestinationSeeder::class); // running it again does not duplicate

        $rows = collect($this->getJson('/api/destinations')->assertOk()->json('data'));
        $this->assertCount(20, $rows);
        $this->assertSame(14, $rows->where('status', 'active')->count());
        $this->assertSame(6, $rows->where('status', 'draft')->count());
        $this->assertSame(5, $rows->where('popular', true)->count());
        $this->assertSame(['Kashmir', 'Goa', 'Manali', 'Kerala', 'Bali'], $rows->take(5)->pluck('name')->all());
    }

    public function test_inquiry_counts_come_from_inquiries_that_mention_the_name_or_a_keyword(): void
    {
        Destination::factory()->create(['name' => 'Kashmir', 'slug' => 'kashmir', 'keywords' => ['Srinagar', 'Gulmarg']]);
        Destination::factory()->create(['name' => 'Goa', 'slug' => 'goa', 'keywords' => []]);
        foreach (['Srinagar houseboat', 'Kashmir valley tour', 'GULMARG skiing', 'Goa beach villa'] as $i => $trip) {
            Inquiry::create(['id' => "INQ-T$i", 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => $trip, 'status' => 'new']);
        }

        $rows = collect($this->getJson('/api/destinations')->json('data'))->keyBy('name');
        $this->assertSame(3, $rows['Kashmir']['inquiries']);
        $this->assertSame(1, $rows['Goa']['inquiries']);
    }

    public function test_the_detail_has_stats_about_and_the_linked_records(): void
    {
        $kashmir = Destination::factory()->create(['name' => 'Kashmir', 'slug' => 'kashmir', 'keywords' => ['Srinagar'], 'best_season' => 'Mar - Jun', 'avg_days' => 5, 'avg_nights' => 4, 'nearest_airport' => 'Srinagar (SXR)']);
        Inquiry::create(['id' => 'INQ-1', 'customer_name' => 'Riya Sharma', 'customer_phone' => '1', 'trip' => 'Srinagar & Gulmarg', 'lead_source' => 'Google Search', 'travel_date' => now()->year.'-12-20', 'status' => 'hot']);
        Inquiry::create(['id' => 'INQ-2', 'customer_name' => 'Aman Joshi', 'customer_phone' => '2', 'trip' => 'Kashmir family trip', 'lead_source' => 'Google Search', 'travel_date' => now()->year.'-12-02', 'status' => 'new']);
        Booking::create(['id' => 'BK-1', 'title' => 'Kashmir Valley Tour', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Paid', 'category' => 'New Bookings', 'destination' => 'Srinagar, Gulmarg', 'raw_price' => 45000]);
        Booking::create(['id' => 'BK-2', 'title' => 'Goa', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Paid', 'category' => 'New Bookings', 'destination' => 'Candolim', 'raw_price' => 99999]);
        SavedHotel::create(['name' => 'Houseboat Golden Crown', 'city' => 'Srinagar', 'last_used_at' => now()]);
        SavedHotel::create(['name' => 'Beach Resort', 'city' => 'Goa', 'last_used_at' => now()]);

        $d = $this->getJson("/api/destinations/{$kashmir->id}")->assertOk()->json('data');

        $this->assertSame(['packages' => 0, 'inquiries' => 2, 'bookings' => 1, 'revenue' => 45000], $d['stats']);
        $this->assertSame('Srinagar (SXR)', $d['about']['nearestAirport']);
        $this->assertSame('5 days / 4 nights', $d['about']['averageTrip']);
        $this->assertSame('Google Search', $d['about']['topLeadSource']);
        $this->assertSame('December', $d['about']['peakMonth']);
        $this->assertSame(['Houseboat Golden Crown'], array_column($d['stays'], 'name'), 'only stays in this destination');
        $this->assertEqualsCanonicalizing(['Riya Sharma', 'Aman Joshi'], array_column($d['inquiries'], 'name'));
    }

    public function test_a_guest_cannot_read_the_catalog_api(): void
    {
        auth()->logout();
        $this->getJson('/api/destinations')->assertUnauthorized();
    }

    public function test_an_unknown_destination_is_a_404(): void
    {
        $this->getJson('/api/destinations/999')->assertNotFound();
    }

}

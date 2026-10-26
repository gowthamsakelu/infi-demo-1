<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Itinerary;
use App\Models\ItineraryItem;
use App\Models\Staff;
use App\Models\VehicleType;
use App\Support\ItineraryWriter;
use Database\Seeders\VehicleTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Vehicle catalogue, prices on itinerary events and what the customer may see. */
class TransportPricingTest extends TestCase
{
    use RefreshDatabase;

    private function booking(): Booking
    {
        return Booking::create(['id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Pending', 'category' => 'New Bookings', 'travel_date_full' => '15 Dec - 17 Dec 2026']);
    }

    private function save(array $item, ?array $meta = null): void
    {
        $payload = ['days' => [['day' => 'Day 1', 'isoDate' => '2026-12-15', 'items' => [$item + ['id' => 'T1', 'type' => 'transport', 'title' => 'Delhi to Manali']]]]];
        if ($meta) {
            $payload['meta'] = $meta;
        }
        $this->putJson('/api/bookings/BK-1/itinerary', $payload)->assertOk();
    }

    public function test_the_vehicle_list_is_ordered_by_popularity_with_default_rates(): void
    {
        $this->seed(VehicleTypeSeeder::class);
        VehicleType::where('key', 'bike')->update(['active' => false]);

        $rows = $this->getJson('/api/vehicle-types')->assertOk()->json('data');

        $this->assertSame(['sedan_ac', 'suv_ac', 'tempo_traveller'], array_column(array_slice($rows, 0, 3), 'key'));
        $this->assertSame(3500.0, (float) $rows[0]['baseRate']);
        $this->assertSame(['per_day', 'AC' => true], ['per_day', 'AC' => $rows[0]['ac']]);
        $keys = array_column($rows, 'key');
        foreach (['black_premium', 'sedan_nonac', 'suv_nonac', 'mini_bus', 'scooter_bike', 'self_drive', 'boat', 'bus', 'train', 'flight'] as $k) {
            $this->assertContains($k, $keys);
        }
        $train = collect($rows)->firstWhere('key', 'train');
        $this->assertNull($train['baseRate']); // the customer arranges these, so there is no rate
    }

    public function test_the_total_is_price_times_days_unless_staff_typed_one(): void
    {
        $this->assertSame(7000.0, ItineraryWriter::total(3500, 2));
        $this->assertSame(3500.0, ItineraryWriter::total(3500, 0), 'a quantity below one counts as one');
        $this->assertSame(6500.0, ItineraryWriter::total(3500, 2, 6500));
        $this->assertNull(ItineraryWriter::total(null, 3));
    }

    public function test_a_transport_event_is_saved_with_its_price_vehicle_override_and_assignee(): void
    {
        $this->seed(VehicleTypeSeeder::class);
        $this->booking();
        Staff::create(['id' => 'ST-9', 'name' => 'Asha', 'role' => 'Operations', 'phone' => '1']);
        $suv = VehicleType::where('key', 'suv_ac')->first();

        $this->save(['price' => 4200, 'quantity' => 2, 'priceOverridden' => true, 'vehicleTypeId' => $suv->id, 'assignedStaffId' => 'ST-9', 'assigned' => ['isAssigned' => true, 'name' => 'Asha'], 'inclusion' => 'included']);

        $item = ItineraryItem::first();
        $this->assertEquals(4200, $item->price);
        $this->assertSame(2, $item->quantity);
        $this->assertEquals(8400, $item->total_price);
        $this->assertTrue($item->price_overridden);
        $this->assertSame($suv->id, $item->vehicle_type_id);
        $this->assertSame('ST-9', $item->assigned_staff_id);
        $this->assertSame('INR', $item->currency);
        $this->assertSame('Asha', $item->assigned_to['name']);
        $this->assertEquals(4800, $suv->fresh()->base_rate, 'the override never touches the catalogue rate');
    }

    public function test_a_typed_total_wins_and_an_unknown_staff_member_is_ignored(): void
    {
        $this->booking();
        $this->save(['price' => 3500, 'quantity' => 3, 'totalPrice' => 9000, 'assignedStaffId' => 'ST-NOBODY']);

        $item = ItineraryItem::first();
        $this->assertEquals(9000, $item->total_price);
        $this->assertNull($item->assigned_staff_id);
    }

    public function test_bad_prices_are_refused(): void
    {
        $this->booking();
        $day = fn (array $x) => ['days' => [['day' => 'Day 1', 'items' => [['id' => 'T1', 'title' => 'x', 'type' => 'transport'] + $x]]]];

        $this->putJson('/api/bookings/BK-1/itinerary', $day(['price' => -5]))->assertStatus(422);
        $this->putJson('/api/bookings/BK-1/itinerary', $day(['quantity' => 0]))->assertStatus(422);
        $this->putJson('/api/bookings/BK-1/itinerary', $day(['vehicleTypeId' => 999]))->assertStatus(422);
    }

    public function test_prices_come_back_on_the_staff_timeline(): void
    {
        $this->booking();
        $this->save(['price' => 3500, 'quantity' => 2]);

        $row = $this->getJson('/api/bookings/BK-1/itinerary')->assertOk()->json('data.0.items.0');
        $this->assertEquals(3500, $row['price']);
        $this->assertEquals(7000, $row['totalPrice']);
    }

    public function test_prices_are_withheld_from_the_customer_unless_the_setting_is_on(): void
    {
        $this->booking();
        $this->save(['price' => 3500, 'quantity' => 2, 'details' => ['b' => ['role' => 'transport', 'price' => 3500, 'totalPrice' => 7000, 'vehicle' => 'Sedan']]]);

        $item = ItineraryItem::first();
        $this->assertFalse((bool) Itinerary::first()->show_prices_to_customer, 'off by default');

        $hidden = $item->toCustomerTimeline(false);
        $this->assertArrayNotHasKey('price', $hidden);
        $this->assertArrayNotHasKey('totalPrice', $hidden);
        $this->assertSame(['role' => 'transport', 'vehicle' => 'Sedan'], $hidden['details']['b']);

        $this->assertEquals(3500, $item->toCustomerTimeline(true)['price']);

        $this->save(['price' => 3500], ['origin' => 'A', 'destination' => 'B', 'stops' => [], 'startDate' => '2026-12-15', 'endDate' => '2026-12-15', 'showPrices' => true]);
        $this->assertTrue((bool) Itinerary::first()->show_prices_to_customer);
        $this->getJson('/api/bookings/BK-1/itinerary')->assertJsonPath('meta.showPrices', true);
    }

    public function test_hotel_and_activity_prices_use_the_same_columns(): void
    {
        $this->booking();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [['day' => 'Day 1', 'items' => [
            ['id' => 'H1', 'type' => 'stay', 'title' => 'Check-in: Ganga View', 'price' => 2500, 'quantity' => 4, 'placeId' => 'ChIJhotel00001', 'inclusion' => 'paid_extra'],
            ['id' => 'A1', 'type' => 'activity', 'title' => 'Rafting', 'price' => 1200, 'quantity' => 3],
        ]]]])->assertOk();

        $hotel = ItineraryItem::where('uid', 'H1')->first();
        $this->assertEquals(10000, $hotel->total_price);
        $this->assertSame('ChIJhotel00001', $hotel->place_id);
        $this->assertSame('paid_extra', $hotel->inclusion);
        $this->assertEquals(3600, ItineraryItem::where('uid', 'A1')->value('total_price'));
    }
}

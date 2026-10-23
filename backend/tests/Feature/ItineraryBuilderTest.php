<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\ItineraryDay;
use App\Models\ItineraryItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The itinerary builder saves its whole plan through the same endpoint the Day-wise Schedule uses. */
class ItineraryBuilderTest extends TestCase
{
    use RefreshDatabase;

    private function booking(): Booking
    {
        return Booking::create(['id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Pending', 'category' => 'New Bookings', 'travel_date_full' => '15 Dec - 17 Dec 2026']);
    }

    private function meta(string $start = '2026-12-15', string $end = '2026-12-17'): array
    {
        return ['origin' => 'Mumbai', 'destination' => 'Manali', 'stops' => ['Delhi', 'Chandigarh'], 'startDate' => $start, 'endDate' => $end];
    }

    private function day(int $n, array $items = [], array $extra = []): array
    {
        return array_merge(['day' => "Day $n", 'date' => "1$n Dec", 'items' => $items], $extra);
    }

    private function item(string $id, string $type, string $title, array $extra = []): array
    {
        return array_merge(['id' => $id, 'type' => $type, 'title' => $title], $extra);
    }

    public function test_the_whole_plan_is_saved_and_returned_with_its_route(): void
    {
        $this->booking();
        $days = [
            $this->day(1, [
                $this->item('H1', 'stay', 'Check-in: Hotel Snow Valley', ['icon' => 'bed', 'time' => '02:00 PM', 'mealPlan' => 'MAP', 'details' => ['b' => ['role' => 'check_in', 'nights' => 2]]]),
                $this->item('T1', 'transport', 'Mumbai to Manali', ['icon' => 'bus', 'inclusion' => 'not_included', 'details' => ['b' => ['role' => 'transport', 'plusDay' => 1]]]),
                $this->item('N1', 'note', 'Note', ['subtitle' => 'Collect permits', 'visibleToCustomer' => false]),
            ], ['locationMode' => 'transit', 'location' => 'Delhi']),
            $this->day(2),
        ];

        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $days, 'meta' => $this->meta()])
            ->assertOk()
            ->assertJsonPath('meta.origin', 'Mumbai')
            ->assertJsonPath('meta.stops.1', 'Chandigarh')
            ->assertJsonPath('data.0.locationMode', 'transit')
            ->assertJsonPath('data.0.items.0.mealPlan', 'MAP')
            ->assertJsonPath('data.0.items.1.inclusion', 'not_included')
            ->assertJsonPath('data.0.items.2.visibleToCustomer', false);

        $this->assertSame(2, ItineraryDay::count());
        $this->assertSame(3, ItineraryItem::count());

        $read = $this->getJson('/api/bookings/BK-1/itinerary')->assertOk();
        $read->assertJsonPath('data.0.items.0.details.b.nights', 2);
        $read->assertJsonPath('meta.startDate', '2026-12-15');
        $this->assertSame('2026-12-15', ItineraryDay::orderBy('day_number')->first()->date->toDateString());
    }

    public function test_changing_the_dates_adds_and_removes_days_in_one_save(): void
    {
        $this->booking();
        $three = [$this->day(1, [$this->item('A', 'activity', 'Walk')]), $this->day(2, [$this->item('B', 'activity', 'Hike')]), $this->day(3)];
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $three, 'meta' => $this->meta()])->assertOk();
        $this->assertSame(3, ItineraryDay::count());

        // Shorter trip: the last two days (and Hike with them) are gone.
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$three[0]], 'meta' => $this->meta('2026-12-15', '2026-12-15')])->assertOk();
        $this->assertSame(1, ItineraryDay::count());
        $this->assertSame(['Walk'], ItineraryItem::pluck('title')->all());

        // Longer trip: new empty days are added after the existing one.
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$three[0], $this->day(2), $this->day(3), $this->day(4)], 'meta' => $this->meta('2026-12-15', '2026-12-18')])->assertOk();
        $this->assertSame([1, 2, 3, 4], ItineraryDay::orderBy('day_number')->pluck('day_number')->all());
        $this->assertSame('2026-12-18', ItineraryDay::orderByDesc('day_number')->first()->date->toDateString());
    }

    public function test_older_event_types_keep_their_look_when_saved(): void
    {
        $this->booking();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$this->day(1, [
            $this->item('S', 'sightseeing', 'Fort visit', ['subtitle' => '10:30 AM • Old fort']),
            $this->item('F', 'food', 'Lunch'),
        ])]])->assertOk()
            ->assertJsonPath('data.0.items.0.type', 'activity')
            ->assertJsonPath('data.0.items.0.icon', 'camera')
            ->assertJsonPath('data.0.items.0.time', '10:30 AM')
            ->assertJsonPath('data.0.items.1.type', 'meal');
    }

    public function test_inquiries_use_the_same_endpoint_and_tables(): void
    {
        Inquiry::create(['id' => 'INQ-1', 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'T', 'category' => 'TOUR', 'status' => 'new', 'travel_date' => '2026-12-15']);

        $this->putJson('/api/inquiries/INQ-1/itinerary', ['days' => [$this->day(1, [$this->item('A', 'meal', 'Dinner')])], 'meta' => $this->meta()])->assertOk();

        $this->assertDatabaseHas('itineraries', ['itineraryable_type' => 'inquiry', 'itineraryable_id' => 'INQ-1', 'origin' => 'Mumbai']);
        $this->getJson('/api/inquiries/INQ-1/itinerary')->assertJsonPath('data.0.items.0.title', 'Dinner');
    }

    public function test_a_single_event_can_be_changed_or_removed(): void
    {
        $this->booking();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$this->day(1, [$this->item('A', 'activity', 'Walk'), $this->item('B', 'activity', 'Hike')])]])->assertOk();

        $this->patchJson('/api/bookings/BK-1/itinerary/items/A', ['title' => 'Long walk', 'inclusion' => 'paid_extra', 'completed' => true])
            ->assertOk()->assertJsonPath('data.title', 'Long walk')->assertJsonPath('data.inclusion', 'paid_extra');
        $this->assertDatabaseHas('itinerary_items', ['uid' => 'A', 'title' => 'Long walk', 'completed' => true]);

        $this->deleteJson('/api/bookings/BK-1/itinerary/items/B')->assertOk();
        $this->assertDatabaseMissing('itinerary_items', ['uid' => 'B']);
        $this->deleteJson('/api/bookings/BK-1/itinerary/items/NOPE')->assertNotFound();
    }

    public function test_the_builder_fields_are_validated(): void
    {
        $this->booking();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$this->day(1, [$this->item('A', 'activity', 'x', ['inclusion' => 'maybe'])])]])->assertJsonValidationErrors(['days.0.items.0.inclusion']);
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [], 'meta' => $this->meta('2026-12-17', '2026-12-15')])->assertJsonValidationErrors(['meta.endDate']);
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [$this->day(1, [$this->item('A', 'activity', 'x')], ['locationMode' => 'sideways'])]])->assertJsonValidationErrors(['days.0.locationMode']);
    }
}

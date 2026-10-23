<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Support\TripDates;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    private function booking(string $id, string $type, string $dates, array $days = []): Booking
    {
        return Booking::create([
            'id' => $id, 'title' => "Trip $id", 'type' => $type, 'type_class' => 'badge-tour', 'pax' => 4, 'status' => 'Pending',
            'status_class' => 'status-pending', 'price' => '₹1', 'raw_price' => 1, 'category' => 'New Bookings', 'destination' => 'Goa',
            'travel_date_full' => $dates, 'itinerary_days' => $days,
            'customer' => ['name' => 'Asha Rao', 'phone' => '+91 99999 11111'],
        ]);
    }

    public function test_trip_dates_are_read_from_the_travel_dates_text(): void
    {
        [$a, $b] = TripDates::parse('15 Jan - 20 Jan 2025 (5D / 4N)');
        $this->assertSame(['2025-01-15', '2025-01-20'], [$a->toDateString(), $b->toDateString()]);
        [$a, $b] = TripDates::parse('28 Dec - 2 Jan 2025');
        $this->assertSame(['2024-12-28', '2025-01-02'], [$a->toDateString(), $b->toDateString()]);
        [$a, $b] = TripDates::parse('18 Nov 2024 (Full Day)');
        $this->assertSame('2024-11-18', $a->toDateString());
        $this->assertSame('2024-11-18', $b->toDateString());
        $this->assertNull(TripDates::parse('soon'));
    }

    public function test_events_cover_trip_start_end_and_itinerary_items_in_range(): void
    {
        $this->booking('BK-1', 'TOUR', '10 Nov - 12 Nov 2024 (3D / 2N)', [
            ['day' => 'Day 1', 'date' => '10 Nov', 'items' => [['id' => 'a', 'type' => 'transport', 'title' => 'Pickup', 'subtitle' => '06:00 AM • Delhi airport']]],
            ['day' => 'Day 2', 'date' => '11 Nov', 'items' => [['id' => 'b', 'type' => 'activity', 'title' => 'Rafting', 'subtitle' => '10:30 AM']]],
        ]);
        $this->booking('BK-2', 'VILLA', '11 Nov - 13 Nov 2024');

        $events = $this->getJson('/api/calendar/events?from=2024-11-10&to=2024-11-30')->assertOk()->json('data.events');

        $this->assertSame(
            ['2024-11-10 Pickup', '2024-11-10 Trip BK-1', '2024-11-11 Rafting', '2024-11-11 Trip BK-2', '2024-11-12 Trip ends: Trip BK-1', '2024-11-13 Check-out: Trip BK-2'],
            array_map(fn ($e) => "{$e['date']} {$e['title']}", $events)
        );
        $this->assertSame(['transport', 'tours', 'activities', 'hotel', 'tours', 'hotel'], array_column($events, 'category'));
        $this->assertSame('10:30 AM', $events[2]['time']);
        $this->assertSame('Delhi airport • 4 pax', $events[0]['subtitle']);
        $this->assertSame('Asha Rao', $events[0]['customer']);
    }

    public function test_range_and_category_filters_and_validation(): void
    {
        $this->booking('BK-1', 'TOUR', '10 Nov - 12 Nov 2024', [
            ['day' => 'Day 1', 'date' => '10 Nov', 'items' => [['id' => 'a', 'type' => 'transport', 'title' => 'Pickup', 'subtitle' => '06:00 AM • Delhi airport']]],
        ]);
        $this->booking('BK-2', 'VILLA', '11 Nov - 13 Nov 2024');

        $day = $this->getJson('/api/calendar/events?from=2024-11-10&to=2024-11-10')->assertOk()->json('data.events');
        $this->assertSame(['Pickup', 'Trip BK-1'], array_column($day, 'title'));
        $this->assertSame('06:00 AM', $day[0]['time']);
        $this->assertSame('transport', $day[0]['category']);
        $this->assertNull($day[1]['time']);

        $hotel = $this->getJson('/api/calendar/events?from=2024-11-01&to=2024-11-30&category=hotel')->assertOk()->json('data.events');
        $this->assertSame(['hotel', 'hotel'], array_column($hotel, 'category'));
        $this->assertSame(['Check-in • 4 pax', 'Check-out: Trip BK-2'], [$hotel[0]['subtitle'], $hotel[1]['title']]);

        $this->getJson('/api/calendar/events?from=2025-01-01&to=2025-01-31')->assertOk()->assertJsonPath('data.events', []);
        $this->getJson('/api/calendar/events?from=2024-11-10')->assertStatus(422);
        $this->getJson('/api/calendar/events?from=2024-01-01&to=2024-12-31')->assertStatus(422);
        $this->getJson('/api/calendar/events?from=2024-11-10&to=2024-11-11&category=food')->assertStatus(422);
    }

    public function test_calendar_path_opens_the_calendar_page(): void
    {
        $this->get('/calendar')->assertRedirect('/#calendar');
    }
}

<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItineraryTest extends TestCase
{
    use RefreshDatabase;

    private function booking(): Booking
    {
        return Booking::create([
            'id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'type_class' => 'badge-tour', 'pax' => 2,
            'status' => 'Pending', 'status_class' => 'status-pending', 'price' => '₹1', 'raw_price' => 1, 'category' => 'New Bookings',
        ]);
    }

    private function inquiry(): Inquiry
    {
        return Inquiry::create(['id' => 'INQ-1', 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'T', 'category' => 'TOUR', 'status' => 'new']);
    }

    private function days(array $items = []): array
    {
        return [['day' => 'Day 1', 'date' => '18 Nov', 'title' => 'Arrival', 'items' => $items]];
    }

    public function test_a_day_and_an_event_can_be_created_and_are_persisted_for_a_booking(): void
    {
        $this->booking();
        $event = ['id' => 'IT-1', 'type' => 'sightseeing', 'title' => 'Old Fort', 'subtitle' => '10:00 AM', 'completed' => false, 'assigned' => null];

        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $this->days([$event])])
            ->assertOk()->assertJsonPath('data.0.items.0.title', 'Old Fort');

        $this->getJson('/api/bookings/BK-1/itinerary')->assertJsonPath('data.0.day', 'Day 1')->assertJsonPath('data.0.items.0.id', 'IT-1');
        $this->assertSame('Arrival', Booking::find('BK-1')->itinerary_days[0]['title']);
    }

    public function test_inquiries_have_their_own_itinerary(): void
    {
        $this->inquiry();

        $this->putJson('/api/inquiries/INQ-1/itinerary', ['days' => $this->days()])->assertOk();
        $this->getJson('/api/inquiries')->assertJsonPath('data.0.itinerary_days.0.day', 'Day 1');
    }

    public function test_an_itinerary_event_can_be_assigned_and_the_assignment_is_saved(): void
    {
        $this->booking();
        $event = ['id' => 'IT-1', 'type' => 'transport', 'title' => 'Delhi to Haridwar', 'subtitle' => '06:00 AM', 'completed' => false,
            'assigned' => ['isAssigned' => true, 'name' => 'Rahul Mehta', 'avatar' => 'https://x.test/a.jpg']];

        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $this->days([$event])])->assertOk();

        $this->assertSame('Rahul Mehta', Booking::find('BK-1')->itinerary_days[0]['items'][0]['assigned']['name']);
    }

    public function test_validation_and_unknown_records(): void
    {
        $this->booking();

        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [['date' => 'x', 'items' => []]]])->assertJsonValidationErrors(['days.0.day']);
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $this->days([['id' => 'IT-1', 'title' => '', 'type' => 'sightseeing']])])->assertJsonValidationErrors(['days.0.items.0.title']);
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $this->days([['id' => 'IT-1', 'title' => 'x', 'type' => 'nope']])])->assertJsonValidationErrors(['days.0.items.0.type']);
        $this->putJson('/api/bookings/NOPE/itinerary', ['days' => []])->assertNotFound();
        $this->putJson('/api/things/BK-1/itinerary', ['days' => []])->assertNotFound();
    }

    public function test_an_empty_day_can_be_removed_by_saving_without_it(): void
    {
        $this->booking();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => $this->days()])->assertOk();
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => []])->assertOk();

        $this->assertSame([], Booking::find('BK-1')->itinerary_days);
    }

    public function test_a_new_day_is_created_together_with_its_event_in_one_save(): void
    {
        $this->inquiry();
        $event = ['id' => 'IT-2', 'type' => 'food', 'title' => 'Dinner', 'subtitle' => '8 PM', 'completed' => false, 'assigned' => null];
        $days = [
            ['day' => 'Day 1', 'date' => '18 Nov', 'items' => []],
            ['day' => 'Day 2', 'date' => '19 Nov', 'items' => [$event]],
        ];

        $this->putJson('/api/inquiries/INQ-1/itinerary', ['days' => $days])->assertOk();

        $saved = $this->getJson('/api/inquiries/INQ-1/itinerary')->assertOk()->json('data');
        $this->assertCount(2, $saved);
        $this->assertSame('Day 2', $saved[1]['day']);
        $this->assertSame('Dinner', $saved[1]['items'][0]['title']);
    }

    public function test_there_is_no_separate_add_day_endpoint(): void
    {
        $this->booking();

        $this->postJson('/api/bookings/BK-1/itinerary/days', ['title' => 'x'])->assertStatus(404);
        $this->postJson('/api/bookings/BK-1/days', [])->assertStatus(404);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\Itinerary;
use App\Models\ItineraryDay;
use App\Models\ItineraryItem;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddInquiryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Staff::create(['id' => 'ST-05', 'name' => 'Karan Sapalia', 'role' => 'Head of Operations', 'phone' => '+91 98765 00555']);
    }

    private function itinerary(): array
    {
        return [
            'days' => [
                ['day' => 'Day 1', 'date' => '15 Dec', 'isoDate' => '2026-12-15', 'title' => 'Arrival', 'location' => 'Srinagar', 'locationMode' => 'transit', 'items' => [
                    ['id' => 'IT-h1', 'type' => 'stay', 'title' => 'Check-in: Dal View', 'subtitle' => 'Houseboat', 'price' => 4500, 'quantity' => 3, 'totalPrice' => 13500, 'currency' => 'INR'],
                    ['id' => 'IT-t1', 'type' => 'transport', 'title' => 'Airport pickup', 'price' => 2000, 'quantity' => 1],
                ]],
                ['day' => 'Day 2', 'date' => '16 Dec', 'isoDate' => '2026-12-16', 'items' => [
                    ['id' => 'IT-a1', 'type' => 'activity', 'title' => 'Shikara ride', 'price' => 800, 'quantity' => 3],
                ]],
                ['day' => 'Day 3', 'date' => '17 Dec', 'isoDate' => '2026-12-17', 'items' => []],
                ['day' => 'Day 4', 'date' => '18 Dec', 'isoDate' => '2026-12-18', 'items' => []],
            ],
            'meta' => ['origin' => 'Mumbai', 'destination' => 'Kashmir', 'stops' => ['Gulmarg'], 'startDate' => '2026-12-15', 'endDate' => '2026-12-18'],
        ];
    }

    public function test_an_empty_inquiry_can_be_saved(): void
    {
        $this->postJson('/api/inquiries', [])
            ->assertCreated()
            ->assertJsonPath('data.customer_name', null)
            ->assertJsonPath('data.pax', 1)
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.assigned_to_id', 'ST-05')
            ->assertJsonPath('data.assigned_to_name', 'Karan Sapalia')
            ->assertJsonPath('data.nights', null)
            ->assertJsonPath('data.travel_date', null);

        $inquiry = Inquiry::first();
        $this->assertSame('INQ-1001', $inquiry->id);
        $this->assertNull($inquiry->customer_phone);
        $this->assertCount(1, $inquiry->guests);
        $this->assertTrue($inquiry->guests[0]['isPrimary']);
        $this->assertSame(0, Itinerary::count());
    }

    public function test_a_partial_inquiry_keeps_only_what_was_entered(): void
    {
        $this->postJson('/api/inquiries', [
            'name' => '  Arjun <b>Mehra</b> ', 'phone' => '98765 12345', 'destination' => 'Goa', 'budget' => '2,50,000',
            'comment' => 'Wants a beach villa.',
        ])->assertCreated();

        $i = Inquiry::first();
        $this->assertSame('Arjun Mehra', $i->customer_name);
        $this->assertSame('98765 12345', $i->customer_phone);
        $this->assertSame('Goa', $i->trip);
        $this->assertSame(250000.0, $i->budget);
        $this->assertSame('Wants a beach villa.', $i->notes);
        $this->assertNull($i->customer_email);
        $this->assertNull($i->location);
        $this->assertSame(1, $i->pax);
        $this->assertSame('Arjun Mehra', $i->guests[0]['name']); // guest 1 is the customer
    }

    public function test_a_full_inquiry_saves_the_itinerary_and_three_guests(): void
    {
        $res = $this->postJson('/api/inquiries', [
            'name' => 'Arjun Mehra', 'phone' => '98765 12345', 'email' => 'arjun@example.com', 'city' => 'Mumbai',
            'destination' => 'Kashmir', 'budget' => 250000, 'comment' => 'Honeymoon',
            'guests' => [['name' => '', 'age' => 34], ['name' => 'Riya', 'age' => 31], ['name' => '', 'age' => '']],
            'itinerary' => $this->itinerary(),
        ])->assertCreated()
            ->assertJsonPath('data.pax', 3)
            ->assertJsonPath('data.nights', 3)
            ->assertJsonPath('data.travel_date', '2026-12-15')
            ->assertJsonPath('data.itinerary_days.0.items.0.title', 'Check-in: Dal View');

        $i = Inquiry::first();
        $this->assertSame(3, $i->pax);
        $this->assertSame(3, $i->nights);
        $this->assertSame('2026-12-15', $i->travel_date->toDateString());
        $this->assertSame('Mumbai', $i->location);

        // guest 1 follows the customer; the others keep only a name and an age
        $this->assertSame('Arjun Mehra', $i->guests[0]['name']);
        $this->assertSame('98765 12345', $i->guests[0]['phone']);
        $this->assertTrue($i->guests[0]['isPrimary']);
        $this->assertSame(34, $i->guests[0]['age']);
        $this->assertSame('Riya', $i->guests[1]['name']);
        $this->assertNull($i->guests[1]['phone']);
        $this->assertFalse($i->guests[1]['isPrimary']);
        $this->assertNull($i->guests[2]['age']);

        $itinerary = Itinerary::firstOrFail();
        $this->assertSame('inquiry', $itinerary->itineraryable_type);
        $this->assertSame($i->id, $itinerary->itineraryable_id);
        $this->assertSame('Mumbai', $itinerary->origin);
        $this->assertSame(4, ItineraryDay::count());
        $this->assertSame(3, ItineraryItem::count());
        $stay = ItineraryItem::where('uid', 'IT-h1')->first();
        $this->assertSame(13500.0, (float) $stay->total_price);
        $this->assertSame(3, $stay->quantity);
        $this->assertSame(1600.0 + 800.0, (float) ItineraryItem::where('uid', 'IT-a1')->first()->total_price);

        $this->getJson('/api/inquiries/'.$i->id.'/itinerary')->assertOk()->assertJsonPath('meta.destination', 'Kashmir');
    }

    public function test_the_new_inquiry_is_listed_first_with_its_data(): void
    {
        Inquiry::create(['id' => 'INQ-1001', 'customer_name' => 'Old', 'customer_phone' => '1', 'trip' => 'T', 'category' => 'TOUR', 'status' => 'new']);
        \Illuminate\Support\Facades\DB::table('inquiries')->update(['created_at' => now()->subDay()]);
        $this->postJson('/api/inquiries', ['name' => 'New lead'])->assertCreated()->assertJsonPath('data.id', 'INQ-1002');

        $this->getJson('/api/inquiries')->assertOk()
            ->assertJsonPath('data.0.id', 'INQ-1002')
            ->assertJsonPath('data.0.guests.0.name', 'New lead')
            ->assertJsonPath('data.1.id', 'INQ-1001');
    }

    public function test_invalid_data_is_refused_and_nothing_is_saved(): void
    {
        $bad = [
            ['email' => 'not-an-email'],
            ['phone' => 'call me'],
            ['budget' => -5],
            ['budget' => 'lots'],
            ['name' => str_repeat('a', 121)],
            ['guests' => array_fill(0, 31, ['name' => 'x'])],
            ['guests' => [['age' => 'old']]],
            ['guests' => [['age' => 200]]],
            ['itinerary' => ['days' => 'nope']],
            ['itinerary' => ['meta' => ['startDate' => '2026-12-15']]], // days missing
            ['itinerary' => ['days' => [['day' => 'Day 1', 'items' => [['id' => 'x', 'title' => 'y', 'type' => 'spaceship']]]]]],
            ['itinerary' => ['days' => [], 'meta' => ['startDate' => '2026-12-18', 'endDate' => '2026-12-15']]],
            ['itinerary' => ['days' => [], 'meta' => ['startDate' => 'tomorrow']]],
        ];
        foreach ($bad as $payload) {
            $this->postJson('/api/inquiries', $payload)->assertUnprocessable();
        }
        $this->assertSame(0, Inquiry::count());
        $this->assertSame(0, Itinerary::count());
    }

    public function test_an_unknown_staff_member_is_not_allowed_to_add_an_inquiry(): void
    {
        $this->postJson('/api/inquiries', ['name' => 'X', 'created_by' => 'ST-99'])->assertForbidden();
        $this->assertSame(0, Inquiry::count());
    }

    public function test_a_named_staff_member_is_the_assignee(): void
    {
        Staff::create(['id' => 'ST-02', 'name' => 'Priya Sharma', 'role' => 'Trip Coordinator', 'phone' => '1']);

        $this->postJson('/api/inquiries', ['created_by' => 'ST-02'])->assertCreated()
            ->assertJsonPath('data.assigned_to_id', 'ST-02')->assertJsonPath('data.assigned_to_name', 'Priya Sharma');
    }

    public function test_a_failed_itinerary_save_rolls_the_inquiry_back(): void
    {
        // An itinerary day with an item that cannot be stored (title longer than any column allows is refused earlier),
        // so force the failure after validation by pointing an event at a vehicle type that does not exist.
        $itinerary = $this->itinerary();
        $itinerary['days'][0]['items'][1]['vehicleTypeId'] = 9999;

        $this->postJson('/api/inquiries', ['name' => 'X', 'itinerary' => $itinerary])->assertUnprocessable();
        $this->assertSame(0, Inquiry::count());
    }

    public function test_inquiry_can_be_updated(): void
    {
        $inquiry = Inquiry::create([
            'id' => 'INQ-1001',
            'customer_name' => 'Rahul',
            'customer_phone' => '+91 99887 76655',
            'trip' => 'Goa',
            'category' => 'TOUR',
            'status' => 'new',
        ]);

        $this->putJson('/api/inquiries/INQ-1001', [
            'customer_name' => 'Rahul Verma',
            'status' => 'hot',
            'notes' => 'Confirmed booking interest',
        ])->assertOk()->assertJsonPath('success', true);

        $inquiry->refresh();
        $this->assertSame('Rahul Verma', $inquiry->customer_name);
        $this->assertSame('hot', $inquiry->status);
        $this->assertSame('Confirmed booking interest', $inquiry->notes);
    }
}

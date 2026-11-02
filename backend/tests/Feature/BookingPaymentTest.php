<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function booking(): Booking
    {
        return Booking::create([
            'id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'type_class' => 'badge-tour', 'pax' => 2,
            'status' => 'Pending', 'status_class' => 'status-pending', 'price' => '₹1', 'raw_price' => 1, 'category' => 'New Bookings',
        ]);
    }

    public function test_booking_can_be_marked_paid_and_unpaid(): void
    {
        $this->booking();

        $this->patchJson('/api/bookings/BK-1/payment', ['status' => 'Paid'])
            ->assertOk()->assertJsonPath('data.status_class', 'status-paid');
        $this->assertDatabaseHas('bookings', ['id' => 'BK-1', 'status' => 'Paid']);
        $this->getJson('/api/bookings/BK-1')->assertJsonPath('data.status', 'Paid');

        $this->patchJson('/api/bookings/BK-1/payment', ['status' => 'Pending'])->assertOk();
        $this->assertDatabaseHas('bookings', ['id' => 'BK-1', 'status' => 'Pending', 'status_class' => 'status-pending']);
    }

    public function test_bookings_can_be_assigned_to_any_assignee(): void
    {
        $this->booking();

        $this->postJson('/api/bookings/assign', ['ids' => ['BK-1'], 'assignee' => ['id' => 'V-01', 'name' => 'Adventure World', 'type' => 'Vendors']])
            ->assertOk()->assertJsonPath('data.0.assigned_to.name', 'Adventure World');
        $this->assertSame('Assigned', Booking::find('BK-1')->assigned_status);
        $this->postJson('/api/bookings/assign', ['ids' => ['NOPE'], 'assignee' => ['id' => 'x', 'name' => 'y']])->assertJsonValidationErrors(['ids.0']);
    }

    public function test_payment_update_validates_status_and_booking(): void
    {
        $this->booking();

        $this->patchJson('/api/bookings/BK-1/payment', ['status' => 'Refunded'])->assertJsonValidationErrors(['status']);
        $this->patchJson('/api/bookings/NOPE/payment', ['status' => 'Paid'])->assertNotFound();
    }

    public function test_add_guest_and_update_pax(): void
    {
        $this->booking();

        $res = $this->postJson('/api/bookings/BK-1/guests', [
            'name' => 'Amit Sharma',
            'age' => 32,
            'role' => 'Adult',
            'phone' => '+91 98765 43210'
        ])->assertOk();

        $res->assertJsonPath('status', 'success');
        $this->assertSame(1, Booking::find('BK-1')->pax);
        $this->assertSame('Amit Sharma', Booking::find('BK-1')->guests[0]['name']);
    }

    public function test_update_special_requirements(): void
    {
        $this->booking();

        $reqs = [['id' => 'sr-1', 'icon' => 'leaf', 'text' => 'Pure Vegetarian', 'color' => '#10B981']];
        $this->putJson('/api/bookings/BK-1/special-requirements', ['special_requirements' => $reqs])
            ->assertOk()->assertJsonPath('status', 'success');

        $this->assertSame('Pure Vegetarian', Booking::find('BK-1')->special_requirements[0]['text']);
    }

    public function test_update_customer_details_and_status(): void
    {
        $this->booking();

        $this->putJson('/api/bookings/BK-1', [
            'name' => 'Neha Gupta',
            'phone' => '+91 91234 56789',
            'email' => 'neha@example.com',
            'status' => 'Confirmed',
            'notes' => 'VIP customer',
        ])->assertOk()->assertJsonPath('status', 'success');

        $b = Booking::find('BK-1');
        $this->assertSame('Confirmed', $b->status);
        $this->assertSame('status-confirmed', $b->status_class);
        $this->assertSame('Neha Gupta', $b->customer['name']);
        $this->assertSame('VIP customer', $b->notes);
    }
}

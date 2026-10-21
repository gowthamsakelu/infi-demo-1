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

    public function test_payment_update_validates_status_and_booking(): void
    {
        $this->booking();

        $this->patchJson('/api/bookings/BK-1/payment', ['status' => 'Refunded'])->assertJsonValidationErrors(['status']);
        $this->patchJson('/api/bookings/NOPE/payment', ['status' => 'Paid'])->assertNotFound();
    }
}

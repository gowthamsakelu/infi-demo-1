<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The split-list "Assign" sends every selected record in one request. */
class BulkAssignTest extends TestCase
{
    use RefreshDatabase;

    public function test_several_bookings_are_assigned_in_one_request(): void
    {
        foreach (['BK-1', 'BK-2', 'BK-3'] as $id) {
            Booking::create(['id' => $id, 'title' => 'Trip', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Pending', 'category' => 'New Bookings']);
        }

        $this->postJson('/api/bookings/assign', ['ids' => ['BK-1', 'BK-3'], 'assignee' => ['id' => 'ST-02', 'name' => 'Priya Sharma', 'type' => 'Team Members']])
            ->assertOk()->assertJsonCount(2, 'data');

        $this->assertSame('Priya Sharma', Booking::find('BK-1')->assigned_to['name']);
        $this->assertSame('Priya Sharma', Booking::find('BK-3')->assigned_to['name']);
        $this->assertNull(Booking::find('BK-2')->assigned_to);
    }

    public function test_one_unknown_id_rejects_the_whole_bulk_request(): void
    {
        Booking::create(['id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Pending', 'category' => 'New Bookings']);

        $this->postJson('/api/bookings/assign', ['ids' => ['BK-1', 'NOPE'], 'assignee' => ['id' => 'ST-02', 'name' => 'Priya Sharma']])
            ->assertJsonValidationErrors(['ids.1']);

        $this->assertNull(Booking::find('BK-1')->assigned_to);
    }

    public function test_several_inquiries_are_assigned_in_one_request(): void
    {
        foreach (['INQ-1', 'INQ-2', 'INQ-3'] as $id) {
            Inquiry::create(['id' => $id, 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'T', 'category' => 'TOUR', 'status' => 'new']);
        }

        $this->postJson('/api/inquiries/assign', ['ids' => ['INQ-1', 'INQ-2'], 'assignee_id' => 'ST-02', 'assignee_name' => 'Priya Sharma'])
            ->assertOk()->assertJsonCount(2, 'data');

        $this->assertDatabaseHas('inquiries', ['id' => 'INQ-2', 'assigned_to_name' => 'Priya Sharma']);
        $this->assertDatabaseMissing('inquiries', ['id' => 'INQ-3', 'assigned_to_name' => 'Priya Sharma']);
    }
}

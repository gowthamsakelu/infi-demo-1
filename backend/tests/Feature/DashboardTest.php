<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\User;
use Database\Seeders\Pages\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->owner = User::demo();
        $this->actingAs($this->owner);

        // Seed representative test records if empty
        if (Booking::count() === 0) {
            Booking::create([
                'id' => 'BK-TEST-1',
                'title' => 'Goa Beach Tour',
                'type' => 'TOUR',
                'status' => 'Paid',
                'raw_price' => 25000,
                'price' => '₹25,000',
                'pax' => 2,
                'start_date' => '2026-10-25',
                'end_date' => '2026-10-30',
                'destination' => 'Goa',
                'customer' => ['name' => 'Amit Shah', 'phone' => '+91 99999 88888'],
            ]);
            Booking::create([
                'id' => 'BK-TEST-2',
                'title' => 'Manali Snow Adventure',
                'type' => 'ACTIVITY',
                'status' => 'Pending',
                'raw_price' => 15000,
                'price' => '₹15,000',
                'pax' => 4,
                'start_date' => '2026-11-05',
                'end_date' => '2026-11-10',
                'destination' => 'Manali',
                'customer' => ['name' => 'Sneha Patil', 'phone' => '+91 98888 77777'],
            ]);
        }

        if (Inquiry::count() === 0) {
            Inquiry::create([
                'id' => 'INQ-TEST-1',
                'customer_name' => 'Rajesh Sharma',
                'customer_phone' => '+91 98765 43210',
                'customer_email' => 'rajesh@example.com',
                'trip' => 'Kashmir Winter Tour',
                'status' => 'new',
                'pax' => 2,
                'nights' => 4,
                'travel_date' => '2026-12-01',
                'budget' => 45000,
            ]);
            Inquiry::create([
                'id' => 'INQ-TEST-2',
                'customer_name' => 'Kavita Verma',
                'customer_phone' => '+91 98765 11111',
                'customer_email' => 'kavita@example.com',
                'trip' => 'Kerala Backwaters',
                'status' => 'ongoing',
                'assigned_to_name' => 'Rahul Mehta',
                'pax' => 4,
                'nights' => 5,
                'travel_date' => '2026-11-15',
                'budget' => 60000,
            ]);
        }
    }

    public function test_guest_cannot_access_dashboard_endpoint(): void
    {
        auth()->logout();
        $res = $this->getJson('/api/dashboard');
        $res->assertUnauthorized();
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $res = $this->getJson('/api/dashboard');
        $res->assertOk();
        $res->assertJsonPath('success', true);
        $res->assertJsonStructure([
            'success',
            'data' => [
                'admin' => ['name', 'email', 'role', 'title'],
                'current_date',
                'metrics' => [
                    'inquiries' => ['total', 'new', 'ongoing', 'closed', 'warm', 'hot'],
                    'bookings' => ['total', 'upcoming', 'ongoing', 'completed'],
                    'revenue' => ['total', 'total_formatted', 'tour', 'tour_formatted', 'activity', 'activity_formatted', 'other', 'other_formatted'],
                    'team' => ['total', 'new', 'in_progress', 'converted'],
                    'calendar' => ['total', 'tours', 'activities', 'events'],
                    'payments' => ['total_received', 'received_formatted', 'pending', 'pending_formatted', 'refunds', 'refunds_formatted'],
                ],
                'needs_attention' => [
                    'pending_payments_count',
                    'pending_payments_amount',
                    'unassigned_inquiries_count',
                    'active_trips_today',
                ],
                'upcoming_trips',
                'recent_inquiries',
                'recent_activity',
            ],
        ]);
    }

    public function test_metric_values_match_underlying_records(): void
    {
        $res = $this->getJson('/api/dashboard');
        $data = $res->json('data.metrics');

        $this->assertGreaterThan(0, $data['inquiries']['total']);
        $this->assertGreaterThan(0, $data['bookings']['total']);
        $this->assertGreaterThan(0, $data['revenue']['total']);
        $this->assertGreaterThan(0, $data['payments']['total_received']);
    }
}

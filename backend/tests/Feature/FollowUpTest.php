<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowUpTest extends TestCase
{
    use RefreshDatabase;

    private function inquiry(): Inquiry
    {
        Staff::create(['id' => 'ST-05', 'name' => 'Karan Sapalia', 'role' => 'Head of Operations', 'phone' => '+91 98765 00555', 'active_trips' => 0]);

        return Inquiry::create([
            'id' => 'INQ-1', 'customer_name' => 'Rohan Malhotra', 'customer_phone' => '+91 99884 84884',
            'trip' => 'Kashmir', 'pax' => 3, 'nights' => 4, 'status' => 'hot',
        ]);
    }

    public function test_follow_up_is_saved_and_appears_in_the_customer_journey_feed(): void
    {
        $inq = $this->inquiry();

        $this->postJson("/api/inquiries/{$inq->id}/follow-ups", [
            'type' => 'follow_up', 'date' => '2026-12-01', 'time' => '10:30', 'comment' => 'Send itinerary',
        ])->assertCreated()->assertJsonPath('data.created_by_name', 'Karan Sapalia');

        $this->assertDatabaseHas('follow_ups', ['inquiry_id' => 'INQ-1', 'customer_phone' => '9988484884', 'type' => 'follow_up']);

        // The journey reads follow-ups by the customer's phone (any formatting).
        $this->getJson('/api/follow-ups?phone=9988484884')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.comment', 'Send itinerary')
            ->assertJsonPath('data.0.scheduled_at', '2026-12-01T10:30:00');
    }

    public function test_journey_feed_is_newest_first(): void
    {
        $inq = $this->inquiry();
        foreach (['2026-12-01', '2026-12-05', '2026-12-03'] as $d) {
            $this->postJson("/api/inquiries/{$inq->id}/follow-ups", ['type' => 'cc', 'date' => $d, 'time' => '09:00']);
        }

        $dates = collect($this->getJson('/api/follow-ups?phone=%2B91%2099884%2084884')->json('data'))->pluck('scheduled_at')->all();
        $this->assertSame(['2026-12-05T09:00:00', '2026-12-03T09:00:00', '2026-12-01T09:00:00'], $dates);
    }

    public function test_validation_rules(): void
    {
        $inq = $this->inquiry();
        $url = "/api/inquiries/{$inq->id}/follow-ups";

        $this->postJson($url, ['type' => 'follow_up'])->assertJsonValidationErrors(['date', 'time']);
        $this->postJson($url, ['type' => 'follow_up', 'date' => '2026-12-01', 'time' => '10:30', 'comment' => str_repeat('a', 501)])
            ->assertJsonValidationErrors(['comment']);
        $this->postJson($url, ['type' => 'called', 'date' => '2026-12-01', 'time' => '10:30'])
            ->assertJsonValidationErrors(['call_outcome']);
        $this->postJson($url, ['type' => 'nope', 'date' => '2026-12-01', 'time' => '10:30'])
            ->assertJsonValidationErrors(['type']);
    }

    public function test_unknown_inquiry_and_unknown_user_are_rejected(): void
    {
        $inq = $this->inquiry();
        $body = ['type' => 'follow_up', 'date' => '2026-12-01', 'time' => '10:30'];

        $this->postJson('/api/inquiries/INQ-404/follow-ups', $body)->assertNotFound();
        $this->postJson("/api/inquiries/{$inq->id}/follow-ups", $body + ['created_by' => 'ST-999'])->assertForbidden();
    }

    public function test_bulk_assign_updates_inquiries(): void
    {
        $inq = $this->inquiry();

        $this->postJson('/api/inquiries/assign', ['ids' => [$inq->id], 'staff_id' => 'ST-05'])
            ->assertOk()->assertJsonPath('data.0.assigned_to_name', 'Karan Sapalia');
        $this->assertDatabaseHas('inquiries', ['id' => 'INQ-1', 'assigned_to_id' => 'ST-05']);
        $this->postJson('/api/inquiries/assign', ['ids' => ['nope'], 'staff_id' => 'ST-05'])->assertJsonValidationErrors(['ids.0']);
    }

    public function test_quick_note_is_saved_and_appears_in_the_journey_feed(): void
    {
        $inq = $this->inquiry();

        $this->postJson("/api/inquiries/{$inq->id}/notes", ['comment' => ' Prefers morning calls '])
            ->assertCreated()->assertJsonPath('data.type', 'note')->assertJsonPath('data.comment', 'Prefers morning calls');
        $this->getJson('/api/follow-ups?phone=9988484884')->assertJsonPath('data.0.type', 'note')->assertJsonPath('data.0.created_by_name', 'Karan Sapalia');

        $this->postJson("/api/inquiries/{$inq->id}/notes", ['comment' => ''])->assertJsonValidationErrors(['comment']);
        $this->postJson("/api/inquiries/{$inq->id}/notes", ['comment' => str_repeat('a', 501)])->assertJsonValidationErrors(['comment']);
        $this->postJson("/api/inquiries/{$inq->id}/notes", ['comment' => 'x', 'created_by' => 'ST-999'])->assertForbidden();
    }

    public function test_inquiries_can_be_filtered_by_category(): void
    {
        $this->inquiry();
        Inquiry::create(['id' => 'INQ-2', 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'Villa', 'category' => 'VILLA', 'status' => 'new']);

        $this->getJson('/api/inquiries?category=villa')->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', 'INQ-2');
    }

    public function test_old_enquiries_url_redirects_to_inquiries(): void
    {
        $this->get('/enquiries')->assertRedirect('/inquiries')->assertStatus(301);
    }
}

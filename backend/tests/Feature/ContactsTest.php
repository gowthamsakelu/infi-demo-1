<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\Inquiry;
use App\Models\User;
use Database\Seeders\Pages\ContactMessageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ContactsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    private function badge(): int
    {
        return $this->getJson('/api/nav/counts')->assertOk()->json('data.contacts');
    }

    public function test_an_empty_inbox_is_valid_and_the_badge_is_zero(): void
    {
        $this->getJson('/api/contact-messages')->assertOk()->assertJson(['success' => true, 'data' => []]);
        $this->assertSame(0, $this->badge());
    }

    public function test_the_list_carries_what_the_page_needs_newest_first(): void
    {
        ContactMessage::factory()->create(['name' => 'Older', 'created_at' => now()->subDays(3)]);
        ContactMessage::factory()->create(['name' => 'Priya Mehta', 'created_at' => now()->subMinute()]);

        $rows = $this->getJson('/api/contact-messages')->assertOk()->json('data');
        $this->assertSame(['Priya Mehta', 'Older'], array_column($rows, 'name'));
        $this->assertSame('Kashmir', $rows[0]['destination']);
        $this->assertSame('2026-12-20', $rows[0]['travelStart']);
        $this->assertTrue($rows[0]['unread']);
        $this->assertNull($rows[0]['package'], 'no tour_packages table in the test database: no match, no error');
    }

    public function test_the_seeder_is_repeatable_and_leaves_three_unread(): void
    {
        $this->seed(ContactMessageSeeder::class);
        $this->seed(ContactMessageSeeder::class);

        $rows = collect($this->getJson('/api/contact-messages')->json('data'));
        $this->assertCount(10, $rows);
        $this->assertSame(3, $rows->where('unread', true)->count());
        $this->assertSame(3, $this->badge());
        $this->assertSame(1, $rows->where('status', 'spam')->count());
        $this->assertSame(2, $rows->where('status', 'converted')->count());
    }

    public function test_marking_read_changes_the_nav_count(): void
    {
        $a = ContactMessage::factory()->create();
        ContactMessage::factory()->create();
        $this->assertSame(2, $this->badge());

        $this->patchJson("/api/contact-messages/{$a->id}", ['read' => true])->assertOk()->assertJsonPath('data.unread', false);
        $this->assertSame(1, $this->badge());
        $this->assertNotNull($a->fresh()->read_at);

        $this->patchJson("/api/contact-messages/{$a->id}", ['read' => false])->assertOk();
        $this->assertSame(2, $this->badge());
    }

    public function test_spam_never_counts_toward_the_badge_and_spam_can_be_undone(): void
    {
        $m = ContactMessage::factory()->create();
        ContactMessage::factory()->spam()->create();
        $this->assertSame(1, $this->badge());

        $this->patchJson("/api/contact-messages/{$m->id}", ['status' => 'spam'])->assertOk()->assertJsonPath('data.unread', false);
        $this->assertSame(0, $this->badge());

        $this->patchJson("/api/contact-messages/{$m->id}", ['status' => 'new'])->assertOk()->assertJsonPath('data.unread', true);
        $this->assertSame(1, $this->badge());
        $this->patchJson("/api/contact-messages/{$m->id}", ['status' => 'bogus'])->assertStatus(422);
    }

    public function test_mark_all_read_clears_the_badge_but_not_spam(): void
    {
        ContactMessage::factory()->count(3)->create();
        $spam = ContactMessage::factory()->spam()->create();

        $this->postJson('/api/contact-messages/read-all')->assertOk();
        $this->assertSame(0, $this->badge());
        $this->assertNull($spam->fresh()->read_at);
    }

    public function test_the_assignee_can_be_saved(): void
    {
        $m = ContactMessage::factory()->create();
        $this->patchJson("/api/contact-messages/{$m->id}", ['assigned_to_name' => 'Riya Sharma'])->assertOk()->assertJsonPath('data.assignedTo', 'Riya Sharma');
        $this->assertSame('Riya Sharma', $m->fresh()->assigned_to_name);
    }

    public function test_convert_creates_exactly_one_inquiry_and_links_it(): void
    {
        $m = ContactMessage::factory()->create(['name' => 'Priya Mehta', 'phone' => '+91 98200 11234', 'assigned_to_name' => 'Riya Sharma']);
        $before = Inquiry::count();

        $res = $this->postJson("/api/contact-messages/{$m->id}/convert")->assertCreated()
            ->assertJsonPath('created', true)->assertJsonPath('data.status', 'converted');
        $id = $res->json('inquiry.id');

        $this->assertSame($before + 1, Inquiry::count());
        $inquiry = Inquiry::findOrFail($id);
        $this->assertSame('INQ-1001', $id);
        $this->assertSame('Priya Mehta', $inquiry->customer_name);
        $this->assertSame('Kashmir', $inquiry->trip);
        $this->assertSame(4, $inquiry->pax);
        $this->assertSame(6, $inquiry->nights);
        $this->assertSame('2026-12-20', $inquiry->travel_date->toDateString());
        $this->assertSame('new', $inquiry->status);
        $this->assertSame('Website form', $inquiry->lead_source);
        $this->assertSame('Riya Sharma', $inquiry->assigned_to_name);
        $this->assertSame('Priya Mehta', $inquiry->guests[0]['name']);
        $this->assertCount(4, $inquiry->guests);

        $fresh = $m->fresh();
        $this->assertSame($id, $fresh->inquiry_id);
        $this->assertSame('converted', $fresh->status);
        $this->assertNotNull($fresh->read_at);
        $this->assertSame(0, $this->badge());

        // the Inquiries API lists it
        $this->assertContains($id, array_column($this->getJson('/api/inquiries')->json('data'), 'id'));
    }

    public function test_converting_twice_is_safe(): void
    {
        $m = ContactMessage::factory()->create();
        $first = $this->postJson("/api/contact-messages/{$m->id}/convert")->assertCreated()->json('inquiry.id');
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertOk()->assertJsonPath('created', false)->assertJsonPath('inquiry.id', $first);

        $this->assertSame(1, Inquiry::count());
    }

    public function test_the_next_inquiry_id_follows_the_existing_ones(): void
    {
        Inquiry::create(['id' => 'INQ-1050', 'customer_name' => 'X', 'customer_phone' => '1', 'trip' => 'Goa', 'status' => 'new']);
        $m = ContactMessage::factory()->create();
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertCreated()->assertJsonPath('inquiry.id', 'INQ-1051');
    }

    public function test_spam_cannot_be_converted(): void
    {
        $m = ContactMessage::factory()->spam()->create();
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertStatus(422);
        $this->assertSame(0, Inquiry::count());
    }

    public function test_a_message_with_little_detail_still_converts(): void
    {
        $m = ContactMessage::factory()->create(['destination' => null, 'travel_start' => null, 'travel_end' => null, 'adults' => null, 'children' => null, 'phone' => null, 'subject' => 'Hello']);
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertCreated();
        $i = Inquiry::firstOrFail();
        $this->assertSame('Hello', $i->trip);
        $this->assertSame(1, $i->pax);
    }

    public function test_a_converted_message_cannot_be_moved_back_by_status(): void
    {
        $m = ContactMessage::factory()->create();
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertCreated();
        $this->patchJson("/api/contact-messages/{$m->id}", ['status' => 'new'])->assertOk()->assertJsonPath('data.status', 'converted');
    }

    public function test_the_matching_package_prefers_a_published_tour_package(): void
    {
        DB::table('tour_packages')->insert([
            ['name' => 'Kashmir Draft Idea', 'days' => 3, 'nights' => 2, 'status' => 'draft'],
            ['name' => 'Kashmir Paradise', 'days' => 7, 'nights' => 6, 'status' => 'published'],
        ]);
        ContactMessage::factory()->create();

        $row = $this->getJson('/api/contact-messages')->assertOk()->json('data.0');
        $this->assertSame(['name' => 'Kashmir Paradise', 'days' => 7, 'nights' => 6], $row['package']);
    }

    public function test_a_guest_cannot_use_the_contact_api(): void
    {
        $m = ContactMessage::factory()->create();
        auth()->logout();
        $this->getJson('/api/contact-messages')->assertUnauthorized();
        $this->patchJson("/api/contact-messages/{$m->id}", ['read' => true])->assertUnauthorized();
        $this->postJson("/api/contact-messages/{$m->id}/convert")->assertUnauthorized();
        $this->assertSame(0, Inquiry::count());
    }
}

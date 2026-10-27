<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\User;
use Database\Seeders\Pages\BannerSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BannersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_an_empty_list_is_valid(): void
    {
        $this->getJson('/api/banners')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_seeder_gives_eight_banners_five_live_one_scheduled_two_draft_and_is_repeatable(): void
    {
        $this->seed(BannerSeeder::class);
        $this->seed(BannerSeeder::class);

        $rows = collect($this->getJson('/api/banners')->assertOk()->json('data'));
        $this->assertCount(8, $rows);
        $this->assertSame(5, $rows->where('status', 'active')->count());
        $this->assertSame(1, $rows->where('status', 'scheduled')->count());
        $this->assertSame(2, $rows->where('status', 'draft')->count());
        $this->assertSame('Kashmir Winter Special', $rows->first()['name']);
    }

    public function test_images_that_exist_are_sent_and_missing_files_become_null(): void
    {
        Banner::factory()->create(['name' => 'Has file', 'image' => 'goa.jpg', 'position' => 1]);
        Banner::factory()->create(['name' => 'Missing file', 'image' => 'not-here.jpg', 'position' => 2]);
        Banner::factory()->create(['name' => 'No file', 'image' => null, 'position' => 3]);

        $rows = collect($this->getJson('/api/banners')->json('data'))->keyBy('name');
        $this->assertSame('/images/goa.jpg', $rows['Has file']['image']);
        $this->assertNull($rows['Missing file']['image']);
        $this->assertNull($rows['No file']['image']);
        $this->assertFileExists(public_path('images/goa.jpg'));
    }

    public function test_status_follows_the_switch_and_the_start_date(): void
    {
        $live = Banner::factory()->create(['position' => 1]);
        $soon = Banner::factory()->scheduled()->create(['position' => 2]);
        $off = Banner::factory()->draft()->create(['position' => 3]);

        $rows = collect($this->getJson('/api/banners')->json('data'))->keyBy('id');
        $this->assertSame('active', $rows[$live->id]['status']);
        $this->assertSame('scheduled', $rows[$soon->id]['status']);
        $this->assertSame('draft', $rows[$off->id]['status']);
    }

    public function test_the_switch_saves_with_patch(): void
    {
        $b = Banner::factory()->create();

        $this->patchJson("/api/banners/{$b->id}", ['is_active' => false])->assertOk()->assertJsonPath('data.status', 'draft')->assertJsonPath('data.active', false);
        $this->assertFalse($b->fresh()->is_active);

        $this->patchJson("/api/banners/{$b->id}", ['is_active' => true])->assertOk()->assertJsonPath('data.status', 'active');
        $this->assertTrue($b->fresh()->is_active);
    }

    public function test_the_switch_needs_a_valid_value(): void
    {
        $b = Banner::factory()->create();
        $this->patchJson("/api/banners/{$b->id}", ['is_active' => 'maybe'])->assertStatus(422)->assertJsonValidationErrors('is_active');
        $this->patchJson('/api/banners/9999', ['is_active' => true])->assertNotFound();
    }

    public function test_the_order_can_be_changed_and_ids_left_out_keep_their_place_after(): void
    {
        $a = Banner::factory()->create(['name' => 'A', 'position' => 1]);
        $b = Banner::factory()->create(['name' => 'B', 'position' => 2]);
        $c = Banner::factory()->create(['name' => 'C', 'position' => 3]);

        $this->postJson('/api/banners/reorder', ['ids' => [$c->id, $a->id]])->assertOk()
            ->assertJsonPath('data.0.name', 'C')->assertJsonPath('data.1.name', 'A')->assertJsonPath('data.2.name', 'B');
        $this->assertSame([1, 2, 3], [$c->fresh()->position, $a->fresh()->position, $b->fresh()->position]);

        $this->postJson('/api/banners/reorder', ['ids' => [999]])->assertStatus(422);
    }

    public function test_a_guest_cannot_use_the_banner_api(): void
    {
        auth()->logout();
        $b = Banner::factory()->create();
        $this->getJson('/api/banners')->assertUnauthorized();
        $this->patchJson("/api/banners/{$b->id}", ['is_active' => false])->assertUnauthorized();
        $this->postJson('/api/banners/reorder', ['ids' => [$b->id]])->assertUnauthorized();
        $this->assertTrue($b->fresh()->is_active);
    }
}

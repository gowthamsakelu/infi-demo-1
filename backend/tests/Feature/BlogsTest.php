<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use Database\Seeders\Pages\BlogPostSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_an_empty_list_has_zero_stats(): void
    {
        $this->getJson('/api/blogs')->assertOk()
            ->assertJsonPath('data.stats', ['total' => 0, 'views' => 0, 'leads' => 0, 'converted' => 0])
            ->assertJsonPath('data.posts', []);
    }

    public function test_the_stats_are_real_sums_over_the_articles(): void
    {
        BlogPost::factory()->create(['views' => 2140, 'leads' => 11, 'converted' => 3]);
        BlogPost::factory()->create(['views' => 860, 'leads' => 4, 'converted' => 1]);
        BlogPost::factory()->draft()->create();
        BlogPost::factory()->scheduled()->create();

        $d = $this->getJson('/api/blogs')->assertOk()->json('data');
        $this->assertSame(['total' => 4, 'views' => 3000, 'leads' => 15, 'converted' => 4], $d['stats']);
        $this->assertCount(4, $d['posts']);
    }

    public function test_the_seeder_is_repeatable_and_has_every_status_and_category(): void
    {
        $this->seed(BlogPostSeeder::class);
        $this->seed(BlogPostSeeder::class);

        $posts = collect($this->getJson('/api/blogs')->json('data.posts'));
        $this->assertCount(10, $posts);
        $this->assertSame(6, $posts->where('status', 'published')->count());
        $this->assertSame(2, $posts->where('status', 'draft')->count());
        $this->assertSame(2, $posts->where('status', 'scheduled')->count());
        $this->assertEqualsCanonicalizing(['guide', 'itinerary', 'tips'], $posts->pluck('category')->unique()->values()->all());
        $this->assertContains('Arjun Kapoor', $posts->pluck('author')->all());
    }

    public function test_publishing_and_moving_back_to_draft_save_with_patch(): void
    {
        $p = BlogPost::factory()->draft()->create();

        $this->patchJson("/api/blogs/{$p->id}", ['status' => 'published'])->assertOk()->assertJsonPath('data.status', 'published');
        $this->assertNotNull($p->fresh()->published_at);
        $this->assertTrue($p->fresh()->published_at->isPast() || $p->fresh()->published_at->isToday());

        $this->patchJson("/api/blogs/{$p->id}", ['status' => 'draft'])->assertOk()->assertJsonPath('data.status', 'draft');
        $this->patchJson("/api/blogs/{$p->id}", ['status' => 'nonsense'])->assertStatus(422);
        $this->patchJson('/api/blogs/9999', ['status' => 'draft'])->assertNotFound();
    }

    public function test_a_guest_cannot_use_the_blog_api(): void
    {
        auth()->logout();
        $p = BlogPost::factory()->create();
        $this->getJson('/api/blogs')->assertUnauthorized();
        $this->patchJson("/api/blogs/{$p->id}", ['status' => 'draft'])->assertUnauthorized();
        $this->assertSame('published', $p->fresh()->status);
    }
}

<?php

namespace Tests\Feature;

use App\Models\SavedActivity;
use App\Models\User;
use Database\Seeders\Pages\AdventureSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdventuresTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_is_empty_but_valid_with_no_adventures(): void
    {
        $this->getJson('/api/adventures')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_seeder_adds_the_gondola_and_the_demo_activities_once(): void
    {
        $this->seed(AdventureSeeder::class);
        $count = SavedActivity::count();
        $this->seed(AdventureSeeder::class);

        $this->assertSame($count, SavedActivity::count(), 'running it again does not duplicate');
        $rows = collect($this->getJson('/api/adventures')->assertOk()->json('data'));
        $demo = collect(json_decode(file_get_contents(database_path('data/demo-places.json')), true))->where('type', 'activity')->count();
        $this->assertSame(1 + $demo, $rows->count());
        $gondola = $rows->first();
        $this->assertSame('Gulmarg Gondola, Phase 1 and 2', $gondola['name']);
        $this->assertSame('sightseeing', $gondola['tag']);
        $this->assertSame(180, $gondola['minutes']);
        $this->assertSame([1800.0, 9000.0], [(float) $gondola['price'], (float) $gondola['priceGroup']]);
        $this->assertSame('Gulmarg Ropeway Ltd.', $gondola['partner']);
        $this->assertEqualsCanonicalizing(['adventure', 'sightseeing', 'water', 'culture', 'food', 'nature'], $rows->pluck('tag')->unique()->values()->all());
    }

    public function test_pricing_tiers_are_ordered_adult_over_child(): void
    {
        $this->seed(AdventureSeeder::class);

        foreach ($this->getJson('/api/adventures')->json('data') as $a) {
            if ($a['price']) {
                $this->assertLessThan($a['price'], $a['priceChild'], $a['name']);
            }
        }
    }

    public function test_it_shares_the_builders_table_and_the_recently_used_endpoint_still_works(): void
    {
        $this->postJson('/api/saved/activities', ['name' => 'Dal Lake shikara', 'city' => 'Srinagar', 'meetingPoint' => 'Ghat 12'])->assertCreated();

        $row = collect($this->getJson('/api/adventures')->json('data'))->firstWhere('name', 'Dal Lake shikara');
        $this->assertNotNull($row);
        $this->assertSame('Ghat 12', $row['meetingPoint']);
        $this->assertNull($row['price']);
        $this->assertSame(['Dal Lake shikara'], array_column($this->getJson('/api/saved/activities')->json('data'), 'name'));
    }

    public function test_a_guest_cannot_read_adventures(): void
    {
        auth()->logout();
        $this->getJson('/api/adventures')->assertUnauthorized();
    }

    public function test_the_page_has_no_write_routes_yet(): void
    {
        $this->postJson('/api/adventures', ['name' => 'x'])->assertStatus(405);
    }
}

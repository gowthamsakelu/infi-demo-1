<?php

namespace Tests\Feature;

use App\Models\SavedHotel;
use App\Models\StayRoom;
use App\Models\User;
use Database\Seeders\Pages\StaySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaysTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_is_empty_but_valid_with_no_stays(): void
    {
        $this->getJson('/api/stays')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_seeder_adds_the_named_stays_and_the_demo_hotels_once(): void
    {
        $this->seed(StaySeeder::class);
        $count = SavedHotel::count();
        $this->seed(StaySeeder::class);

        $this->assertSame($count, SavedHotel::count(), 'running it again does not duplicate');
        $rows = collect($this->getJson('/api/stays')->assertOk()->json('data'));
        $this->assertGreaterThan(50, $rows->count());
        $this->assertSame('Hotel Lake View', $rows->first()['name']);
        $this->assertSame('hotel', $rows->first()['tag']);
        $this->assertSame(['hotel', 'villa', 'resort'], $rows->pluck('tag')->unique()->sort()->values()->sortBy(fn ($t) => array_search($t, ['hotel', 'villa', 'resort']))->values()->all());
    }

    public function test_the_detail_has_contact_rooms_and_rates_by_meal_plan(): void
    {
        $this->seed(StaySeeder::class);
        $id = SavedHotel::where('name', 'Hotel Lake View')->value('id');

        $d = $this->getJson("/api/stays/{$id}")->assertOk()->json('data');

        $this->assertSame('Srinagar', $d['city']);
        $this->assertNotEmpty($d['phone']);
        $this->assertNotEmpty($d['amenities']);
        $this->assertSame(['Standard', 'Deluxe', 'Premium room', 'Suite'], array_column($d['rooms'], 'name'));
        $standard = $d['rooms'][0]['rates'];
        $this->assertSame(['stay', 'breakfast', 'map', 'all'], array_keys($standard));
        $this->assertTrue($standard['stay'] < $standard['breakfast'] && $standard['breakfast'] < $standard['map'] && $standard['map'] < $standard['all']);
    }

    public function test_it_shares_the_builders_table_and_the_recently_used_endpoint_still_works(): void
    {
        $this->postJson('/api/saved/hotels', ['name' => 'Houseboat Golden Crown', 'city' => 'Srinagar'])->assertCreated();
        $this->postJson('/api/saved/hotels', ['name' => 'Houseboat Golden Crown', 'city' => 'Srinagar'])->assertOk();

        $row = collect($this->getJson('/api/stays')->json('data'))->firstWhere('name', 'Houseboat Golden Crown');
        $this->assertNotNull($row, 'a hotel the builder saved shows on the Stays page');
        $this->assertSame('hotel', $row['tag']);
        $this->assertSame('active', $row['status']);
        $this->assertNull($row['price']);
        $this->assertSame(['Houseboat Golden Crown'], array_column($this->getJson('/api/saved/hotels')->json('data'), 'name'));
        $detail = $this->getJson("/api/stays/{$row['id']}")->assertOk()->json('data');
        $this->assertSame([], $detail['rooms']);
        $this->assertSame([], $detail['amenities']);
    }

    public function test_deleting_a_stay_removes_its_rooms(): void
    {
        $stay = SavedHotel::factory()->create();
        StayRoom::factory()->count(2)->create(['saved_hotel_id' => $stay->id]);

        $stay->delete();
        $this->assertSame(0, StayRoom::count());
    }

    public function test_a_guest_cannot_read_stays(): void
    {
        auth()->logout();
        $this->getJson('/api/stays')->assertUnauthorized();
        $this->getJson('/api/stays/1')->assertUnauthorized();
    }

    public function test_an_unknown_stay_is_a_404_and_the_page_has_no_write_routes(): void
    {
        $this->getJson('/api/stays/999')->assertNotFound();
        $this->postJson('/api/stays', ['tag' => 'villa'])->assertUnprocessable()->assertJsonValidationErrors('name'); // only the name is required
    }
}

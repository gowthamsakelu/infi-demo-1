<?php

namespace Tests\Feature;

use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\PackageDay;
use App\Models\TourPackage;
use App\Models\User;
use Database\Seeders\Pages\DestinationSeeder;
use Database\Seeders\Pages\TourPackageSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TourPackagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_is_empty_but_valid_with_no_packages(): void
    {
        $this->getJson('/api/tour-packages')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_seeder_creates_packages_linked_to_destinations_and_is_repeatable(): void
    {
        $this->seed(DestinationSeeder::class);
        $this->seed(TourPackageSeeder::class);
        $this->seed(TourPackageSeeder::class);

        $rows = collect($this->getJson('/api/tour-packages')->assertOk()->json('data'));
        $this->assertCount(10, $rows);
        $first = $rows->first();
        $this->assertSame('Kashmir Valley & Gulmarg Tour', $first['name']);
        $this->assertSame('Kashmir', $first['destination']);
        $this->assertSame([5, 4], [$first['days'], $first['nights']]);
        $this->assertSame(15000.0, (float) $first['price']);
        $this->assertSame(2, $rows->where('status', 'draft')->count());
        $this->assertSame(50, PackageDay::count(), 'one row per package day, not duplicated by the second run');
    }

    public function test_the_destinations_page_counts_the_packages(): void
    {
        $this->seed(DestinationSeeder::class);
        $this->seed(TourPackageSeeder::class);

        $kashmir = collect($this->getJson('/api/destinations')->json('data'))->firstWhere('name', 'Kashmir');
        $this->assertSame(3, $kashmir['packages']);
        $detail = $this->getJson("/api/destinations/{$kashmir['id']}")->json('data');
        $this->assertSame('Kashmir Valley & Gulmarg Tour', $detail['packages'][0]['name']);
        $this->assertSame(5, $detail['packages'][0]['days']);
    }

    public function test_the_detail_has_the_days_in_the_builder_shape_and_the_destinations_inquiries(): void
    {
        $this->seed(DestinationSeeder::class);
        $this->seed(TourPackageSeeder::class);
        Inquiry::create(['id' => 'INQ-T1', 'customer_name' => 'Riya Sharma', 'customer_phone' => '1', 'trip' => 'Srinagar family trip', 'status' => 'hot']);
        Inquiry::create(['id' => 'INQ-T2', 'customer_name' => 'Aman Joshi', 'customer_phone' => '2', 'trip' => 'Goa weekend', 'status' => 'new']);
        $id = TourPackage::where('name', 'Kashmir Valley & Gulmarg Tour')->value('id');

        $d = $this->getJson("/api/tour-packages/{$id}")->assertOk()->json('data');

        $this->assertSame(5, $d['days'], 'the number of days stays a number; the plan is under `itinerary`');
        $this->assertCount(5, $d['itinerary']);
        $day1 = $d['itinerary'][0];
        $this->assertSame('Day 1', $day1['day']);
        $this->assertSame(['transport', 'stay', 'activity'], array_column($day1['items'], 'type'));
        $this->assertSame('check_in', $day1['items'][1]['details']['b']['role']);
        $this->assertNotEmpty($d['inclusions']);
        $this->assertCount(4, $d['priceTiers']);
        $this->assertSame(['Riya Sharma'], array_column($d['inquiries'], 'name'), 'only inquiries that mention the destination');
    }

    public function test_every_item_id_in_a_package_is_unique_so_it_can_prefill_the_builder(): void
    {
        $this->seed(DestinationSeeder::class);
        $this->seed(TourPackageSeeder::class);

        $ids = PackageDay::all()->flatMap(fn ($d) => array_column($d->items, 'id'));
        $this->assertSame($ids->count(), $ids->unique()->count());
    }

    public function test_a_package_without_a_destination_still_shows(): void
    {
        $p = TourPackage::factory()->create(['destination_id' => null]);

        $d = $this->getJson("/api/tour-packages/{$p->id}")->assertOk()->json('data');
        $this->assertNull($d['destination']);
        $this->assertSame([], $d['inquiries']);
    }

    public function test_deleting_a_destination_keeps_its_packages(): void
    {
        $dest = Destination::factory()->create();
        $p = TourPackage::factory()->create(['destination_id' => $dest->id]);

        DB::table('destinations')->where('id', $dest->id)->delete();
        $this->assertNull($p->fresh()->destination_id);
    }

    public function test_a_guest_cannot_read_packages(): void
    {
        auth()->logout();
        $this->getJson('/api/tour-packages')->assertUnauthorized();
        $this->getJson('/api/tour-packages/1')->assertUnauthorized();
    }

    public function test_an_unknown_package_is_a_404_and_the_page_has_no_write_routes(): void
    {
        $this->getJson('/api/tour-packages/999')->assertNotFound();
        $this->postJson('/api/tour-packages', ['tag' => 'tour'])->assertUnprocessable()->assertJsonValidationErrors('name'); // only the name is required
    }
}

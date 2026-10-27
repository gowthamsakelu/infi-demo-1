<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VehicleType;
use Database\Seeders\Pages\TransportSeeder;
use Database\Seeders\VehicleTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The Transport page works on the itinerary builder's own vehicle_types. (TransportPricingTest covers the catalogue itself.) */
class TransportPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_is_empty_but_valid_with_no_vehicles(): void
    {
        $this->getJson('/api/transport')->assertOk()->assertJson(['success' => true, 'data' => []]);
    }

    public function test_the_list_reads_the_builders_vehicles_with_rates_and_flags(): void
    {
        $this->seed(TransportSeeder::class);
        $this->seed(TransportSeeder::class); // again: no duplicates

        $rows = collect($this->getJson('/api/transport')->assertOk()->json('data'));
        $this->assertSame(VehicleType::count(), $rows->count());
        $this->assertSame(13, $rows->count(), 'the same 13 the builder uses, not a second list');
        $sedan = $rows->first();
        $this->assertSame('sedan_ac', $sedan['key']);
        $this->assertSame(3500.0, (float) $sedan['baseRate']);
        $this->assertTrue($sedan['mostPopular']);
        $this->assertTrue($sedan['showInBuilder']);
        $this->assertCount(4, $sedan['rateCard']);
        $this->assertSame([], $rows->firstWhere('key', 'train')['rateCard'], 'no rate card for a ticketed mode');
    }

    public function test_the_two_switches_are_saved_with_a_patch(): void
    {
        $this->seed(TransportSeeder::class);
        $v = VehicleType::where('key', 'black_premium')->first();

        $this->patchJson("/api/transport/{$v->id}", ['mostPopular' => true])->assertOk()->assertJsonPath('data.mostPopular', true)->assertJsonPath('data.showInBuilder', true);
        $this->patchJson("/api/transport/{$v->id}", ['showInBuilder' => false])->assertOk()->assertJsonPath('data.showInBuilder', false)->assertJsonPath('data.mostPopular', true);
        $this->patchJson("/api/transport/{$v->id}", ['mostPopular' => false, 'showInBuilder' => true])->assertOk();

        $v->refresh();
        $this->assertFalse($v->most_popular);
        $this->assertTrue($v->show_in_builder);
    }

    public function test_the_patch_is_validated(): void
    {
        $this->seed(TransportSeeder::class);
        $id = VehicleType::where('key', 'sedan_ac')->value('id');

        $this->patchJson("/api/transport/{$id}", [])->assertUnprocessable()->assertJsonValidationErrors(['mostPopular', 'showInBuilder']);
        $this->patchJson("/api/transport/{$id}", ['mostPopular' => 'maybe'])->assertUnprocessable()->assertJsonValidationErrors(['mostPopular']);
        $this->patchJson("/api/transport/{$id}", ['base_rate' => 1, 'mostPopular' => true])->assertOk();
        $this->assertSame(3500.0, VehicleType::find($id)->base_rate, 'only the two switches can be changed here');
        $this->patchJson('/api/transport/9999', ['mostPopular' => true])->assertNotFound();
    }

    public function test_hiding_a_vehicle_removes_it_from_the_builders_list_and_nothing_else_changes(): void
    {
        $this->seed(TransportSeeder::class);
        $before = array_column($this->getJson('/api/vehicle-types')->json('data'), 'key');
        $this->assertSame(['sedan_ac', 'suv_ac', 'tempo_traveller'], array_slice($before, 0, 3));

        $suv = VehicleType::where('key', 'suv_ac')->first();
        $this->patchJson("/api/transport/{$suv->id}", ['showInBuilder' => false])->assertOk();

        $after = $this->getJson('/api/vehicle-types')->assertOk()->json('data');
        $this->assertNotContains('suv_ac', array_column($after, 'key'));
        $this->assertSame(array_values(array_diff($before, ['suv_ac'])), array_column($after, 'key'));
        $this->assertSame(['id', 'key', 'name', 'icon', 'seats', 'ac', 'category', 'baseRate', 'rateUnit', 'rank'], array_keys($after[0]), 'the builder payload is unchanged');
        $this->assertTrue(collect($this->getJson('/api/transport')->json('data'))->contains('key', 'suv_ac'), 'the Transport page still lists it');
    }

    public function test_most_popular_vehicles_come_first_in_the_builder_in_rank_order(): void
    {
        $this->seed(VehicleTypeSeeder::class);
        $mini = VehicleType::where('key', 'mini_bus')->first();
        $this->patchJson("/api/transport/{$mini->id}", ['mostPopular' => true])->assertOk();

        $keys = array_column($this->getJson('/api/vehicle-types')->json('data'), 'key');
        $this->assertSame('mini_bus', $keys[0]);
        $this->assertSame('sedan_ac', $keys[1], 'the rest keep their popularity_rank order');
    }

    public function test_an_inactive_vehicle_stays_out_of_the_builder_whatever_the_switch_says(): void
    {
        $this->seed(VehicleTypeSeeder::class);
        VehicleType::where('key', 'bus')->update(['active' => false, 'show_in_builder' => true]);

        $this->assertNotContains('bus', array_column($this->getJson('/api/vehicle-types')->json('data'), 'key'));
    }

    public function test_a_guest_cannot_use_the_page_api(): void
    {
        auth()->logout();
        $this->getJson('/api/transport')->assertUnauthorized();
        $this->patchJson('/api/transport/1', ['mostPopular' => true])->assertUnauthorized();
    }
}

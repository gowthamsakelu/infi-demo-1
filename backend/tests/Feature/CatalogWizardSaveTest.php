<?php

namespace Tests\Feature;

use App\Models\Destination;
use App\Models\SavedActivity;
use App\Models\SavedHotel;
use App\Models\User;
use App\Models\VehicleType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** The Add / Edit wizard's saves on the real tables (USE_DUMMY_DATA off): create, change, validation, and nothing written in dummy mode. */
class CatalogWizardSaveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.use_dummy_data' => false]);
        $this->actingAs(User::demo());
    }

    public function test_a_destination_is_added_and_changed_with_only_its_name_required(): void
    {
        $id = $this->postJson('/api/destinations', ['name' => 'Coorg', 'status' => 'active', 'highlights' => ['Coffee estates']])
            ->assertCreated()->json('data.id');

        $this->assertDatabaseHas('destinations', ['id' => $id, 'name' => 'Coorg', 'slug' => 'coorg', 'status' => 'active']);
        $this->putJson("/api/destinations/{$id}", ['name' => 'Coorg Hills', 'avgDays' => 3])->assertOk();
        $this->assertDatabaseHas('destinations', ['id' => $id, 'name' => 'Coorg Hills', 'avg_days' => 3, 'slug' => 'coorg']);
        $this->postJson('/api/destinations', ['region' => 'x'])->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_a_destination_picture_is_saved_under_public_images(): void
    {
        $png = 'data:image/png;base64,'.base64_encode(str_repeat('a', 64));
        $id = $this->postJson('/api/destinations', ['name' => 'Goa', 'image' => $png])->assertCreated()->json('data.id');

        $image = Destination::query()->find($id)->image;
        $this->assertStringStartsWith('destinations/', $image);
        $this->assertFileExists(public_path('images/'.$image));
        @unlink(public_path('images/'.$image));
    }

    public function test_a_vehicle_is_added_with_a_key_and_a_rate_card(): void
    {
        $id = $this->postJson('/api/transport', ['name' => 'Sedan 4-seater AC', 'category' => 'car', 'seats' => 4, 'ac' => true, 'baseRate' => 3500,
            'rateCard' => [['label' => 'Extra distance', 'amount' => 14, 'unit' => 'km']]])->assertCreated()->json('data.id');

        $vehicle = VehicleType::query()->find($id);
        $this->assertSame('sedan_4_seater_ac', $vehicle->key);
        $this->assertSame('Extra distance', $vehicle->rate_card[0]['label']);
        $this->putJson("/api/transport/{$id}", ['name' => 'Sedan', 'category' => 'car', 'rateCard' => []])->assertOk();
        $this->assertDatabaseHas('vehicle_types', ['id' => $id, 'name' => 'Sedan']);
    }

    public function test_a_stay_and_an_adventure_are_added_and_changed(): void
    {
        $stay = $this->postJson('/api/stays', ['name' => 'Hotel Test', 'tag' => 'villa', 'price' => 4200, 'roomsCount' => 12, 'amenities' => ['Wi-Fi']])
            ->assertCreated()->json('data.id');
        $this->assertDatabaseHas('saved_hotels', ['id' => $stay, 'tag' => 'villa', 'price_from' => 4200, 'rooms_count' => 12]);
        $this->putJson("/api/stays/{$stay}", ['name' => 'Hotel Test 2'])->assertOk();
        $this->assertSame('Hotel Test 2', SavedHotel::query()->find($stay)->name);

        $activity = $this->postJson('/api/adventures', ['name' => 'Gondola', 'minutes' => 180, 'price' => 1800, 'highlights' => ['Views']])
            ->assertCreated()->json('data.id');
        $this->assertDatabaseHas('saved_activities', ['id' => $activity, 'duration_minutes' => 180, 'price_adult' => 1800]);
        $this->putJson("/api/adventures/{$activity}", ['name' => 'Gondola 2'])->assertOk();
        $this->assertSame('Gondola 2', SavedActivity::query()->find($activity)->name);
    }

    public function test_a_banner_gets_the_next_place_and_a_blog_post_a_slug(): void
    {
        $banner = $this->postJson('/api/banners', ['name' => 'Winter', 'tone' => 'blue', 'placement' => 'Home hero', 'slot' => 1, 'active' => true])
            ->assertCreated()->json('data.id');
        $this->assertDatabaseHas('banners', ['id' => $banner, 'name' => 'Winter', 'position' => 1]);
        $this->putJson("/api/banners/{$banner}", ['name' => 'Winter 2', 'endsAt' => '2020-01-01', 'startsAt' => '2021-01-01'])->assertUnprocessable();

        $post = $this->postJson('/api/blogs', ['title' => 'Top 10 places in Kashmir', 'category' => 'guide', 'status' => 'draft'])
            ->assertCreated()->json('data.id');
        $this->assertDatabaseHas('blog_posts', ['id' => $post, 'slug' => 'top-10-places-in-kashmir', 'status' => 'draft', 'published_at' => null]);
    }

    public function test_dummy_mode_writes_nothing(): void
    {
        config(['app.use_dummy_data' => true]);
        $this->postJson('/api/destinations', ['name' => 'Nowhere'])->assertCreated()->assertJson(['dummy' => true, 'data' => null]);
        $this->postJson('/api/stays', ['name' => 'Nowhere'])->assertCreated()->assertJson(['dummy' => true]);
        $this->assertDatabaseMissing('destinations', ['name' => 'Nowhere']);
        $this->assertDatabaseMissing('saved_hotels', ['name' => 'Nowhere']);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\ItineraryItem;
use App\Support\ItineraryWriter;
use App\Support\Places\DemoPlacesProvider;
use App\Support\Places\GooglePlacesProvider;
use App\Support\Places\PlacesProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** Hotel and activity search without a Google key: the demo provider, and how a provider is chosen. */
class DemoPlacesTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_demo_provider_is_used_when_there_is_no_key(): void
    {
        config(['services.google_places.key' => null, 'services.places.provider' => 'auto']);
        $this->assertInstanceOf(DemoPlacesProvider::class, app(PlacesProvider::class));
    }

    public function test_google_is_used_when_a_key_is_set(): void
    {
        config(['services.google_places.key' => 'k', 'services.places.provider' => 'auto']);
        $this->assertInstanceOf(GooglePlacesProvider::class, app(PlacesProvider::class));
    }

    public function test_the_provider_can_be_forced(): void
    {
        config(['services.google_places.key' => 'k', 'services.places.provider' => 'demo']);
        $this->assertInstanceOf(DemoPlacesProvider::class, app(PlacesProvider::class));

        config(['services.google_places.key' => null, 'services.places.provider' => 'google']);
        $this->assertInstanceOf(GooglePlacesProvider::class, app(PlacesProvider::class));
    }

    public function test_search_matches_name_location_area_and_category_in_any_case(): void
    {
        $byName = $this->getJson('/api/places/search?q=GONDOLA&kind=activity')->assertOk()->assertJsonPath('provider', 'demo')->json('data');
        $this->assertContains('Gulmarg Gondola Phase 1', array_column($byName, 'name'));
        $this->assertContains('Gulmarg Gondola Phase 2', array_column($byName, 'name'));

        $this->assertContains('River rafting in Rishikesh', array_column($this->getJson('/api/places/search?q=rishikesh&kind=activity')->json('data'), 'name'), 'by location');
        $this->assertContains('Shikara ride on Dal Lake', array_column($this->getJson('/api/places/search?q=dal%20lake&kind=activity')->json('data'), 'name'), 'by area');
        $this->assertContains('Parasailing at Calangute', array_column($this->getJson('/api/places/search?q=water%20goa&kind=activity')->json('data'), 'name'), 'by category and location together');
        $this->assertSame([], $this->getJson('/api/places/search?q=zzzzqqq&kind=activity')->json('data'));
    }

    public function test_search_only_returns_the_kind_asked_for(): void
    {
        $hotels = $this->getJson('/api/places/search?q=rishikesh&kind=hotel')->assertOk()->json('data');
        $this->assertNotEmpty($hotels);
        $this->assertNotContains('River rafting in Rishikesh', array_column($hotels, 'name'));
    }

    public function test_places_in_the_days_location_rank_first(): void
    {
        $names = array_column($this->getJson('/api/places/search?q=temple&kind=activity&location=Haridwar')->json('data'), 'area');
        $res = $this->getJson('/api/places/search?q=temple&kind=activity&location=Haridwar')->json('data');
        $this->assertStringContainsString('Haridwar', $res[0]['area'], 'a temple in the day location beats a temple elsewhere: '.json_encode($names));

        $other = $this->getJson('/api/places/search?q=temple&kind=activity&location=Jammu')->json('data');
        $this->assertStringContainsString('Jammu', $other[0]['area']);
    }

    public function test_a_day_location_with_several_places_still_matches(): void
    {
        $res = $this->getJson('/api/places/search?q=&kind=activity&location='.urlencode('Srinagar, Gulmarg, Pahalgam'))->json('data');
        $areas = implode('|', array_column($res, 'area'));
        $this->assertMatchesRegularExpression('/Srinagar|Gulmarg|Pahalgam/', $areas);
        $this->assertDoesNotMatchRegularExpression('/Goa|Bali|Mumbai/', $areas);
    }

    public function test_an_empty_query_returns_popular_places_in_the_days_location(): void
    {
        $res = $this->getJson('/api/places/search?kind=activity&location=Goa')->assertOk()->assertJsonPath('popular', true);
        $rows = $res->json('data');
        $this->assertGreaterThanOrEqual(5, count($rows));
        foreach ($rows as $row) {
            $this->assertStringContainsString('Goa', $row['area']);
        }
        $score = fn ($r) => $r['rating'] * log(max(2, $r['ratingCount']));
        $scores = array_map($score, $rows);
        $sorted = $scores;
        rsort($sorted);
        $this->assertSame($sorted, $scores, 'most popular (rating and reviews) first');
    }

    public function test_an_unknown_location_still_gets_popular_suggestions(): void
    {
        $this->assertNotEmpty($this->getJson('/api/places/search?kind=hotel&location=Atlantis')->json('data'));
        $this->assertNotEmpty($this->getJson('/api/places/search?kind=hotel')->json('data'));
    }

    public function test_every_main_location_has_enough_places(): void
    {
        foreach (['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Jammu', 'Pune', 'Mahabaleshwar', 'Manali', 'Goa', 'Rishikesh', 'Kerala', 'Udaipur', 'Haridwar', 'Bali', 'Mumbai'] as $place) {
            $all = array_merge(
                $this->getJson('/api/places/search?kind=activity&location='.$place)->json('data'),
                $this->getJson('/api/places/search?kind=hotel&location='.$place)->json('data'),
            );
            $this->assertGreaterThanOrEqual(8, count($all), "$place has too few demo places");
        }
    }

    public function test_details_have_the_same_shape_as_google_plus_the_demo_defaults(): void
    {
        $id = $this->getJson('/api/places/search?q=gondola%20phase%202&kind=activity')->json('data.0.placeId');
        $d = $this->getJson("/api/places/$id")->assertOk()->assertJsonPath('provider', 'demo')->json('data');

        foreach (['placeId', 'name', 'address', 'city', 'phone', 'rating', 'ratingCount', 'photo', 'photoCredit', 'mapsUri'] as $key) {
            $this->assertArrayHasKey($key, $d);
        }
        $this->assertSame('Gulmarg', $d['city']);
        $this->assertEquals(1000, $d['price']);
        $this->assertSame(90, $d['durationMinutes']);
        $this->assertNull($d['photo']);
        $this->getJson('/api/places/demo-act-nowhere-nothing')->assertNotFound();
    }

    public function test_demo_places_have_no_photo_endpoint(): void
    {
        $this->getJson('/api/places/photo?ref=places/abc/photos/def')->assertNotFound();
    }

    public function test_demo_search_never_calls_google(): void
    {
        Http::fake();
        $this->getJson('/api/places/search?q=gondola&kind=activity')->assertOk();
        Http::assertNothingSent();
    }

    public function test_an_activity_picked_from_demo_data_saves_with_its_price_and_total(): void
    {
        Booking::create(['id' => 'BK-1', 'title' => 'Trip', 'type' => 'TOUR', 'pax' => 4, 'status' => 'Pending', 'category' => 'New Bookings', 'travel_date_full' => '15 Dec - 17 Dec 2026']);
        $place = $this->getJson('/api/places/search?q=gondola%20phase%201&kind=activity')->json('data.0');
        $this->assertEquals(850, $place['price']);

        // what the form sends: the default price (editable), the guests, and the place id
        $this->putJson('/api/bookings/BK-1/itinerary', ['days' => [['day' => 'Day 1', 'items' => [
            ['id' => 'A1', 'type' => 'activity', 'title' => $place['name'], 'price' => $place['price'], 'quantity' => 4, 'placeId' => $place['placeId'], 'inclusion' => 'included'],
            ['id' => 'A2', 'type' => 'activity', 'title' => 'Edited price', 'price' => 900, 'quantity' => 2, 'placeId' => $place['placeId']],
        ]]]])->assertOk();

        $item = ItineraryItem::where('uid', 'A1')->first();
        $this->assertEquals(3400, $item->total_price);
        $this->assertSame($place['placeId'], $item->place_id);
        $this->assertEquals(1800, ItineraryItem::where('uid', 'A2')->value('total_price'));
        $this->assertSame(1800.0, ItineraryWriter::total(900, 2));
    }
}

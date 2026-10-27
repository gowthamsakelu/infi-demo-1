<?php

namespace Tests\Feature;

use App\Models\SavedActivity;
use App\Models\SavedHotel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/** The Google Places proxy (Google itself is always faked) and the "Recently used" lists. */
class PlacesTest extends TestCase
{
    use RefreshDatabase;

    private function withKey(): void
    {
        config(['services.google_places.key' => 'server-side-key', 'services.google_places.base_url' => 'https://places.test']);
    }

    private function fakeGoogle(): void
    {
        Http::fake([
            'places.test/v1/places:searchText' => Http::response(['places' => [['location' => ['latitude' => 30.08, 'longitude' => 78.26]]]]),
            'places.test/v1/places:autocomplete' => Http::response(['suggestions' => [
                ['placePrediction' => ['placeId' => 'ChIJhotel00001', 'text' => ['text' => 'Ganga View, Rishikesh'], 'structuredFormat' => ['mainText' => ['text' => 'Ganga View'], 'secondaryText' => ['text' => 'Tapovan, Rishikesh']]]],
                ['queryPrediction' => ['text' => ['text' => 'ignored']]],
            ]]),
            'places.test/v1/places/ChIJhotel00001/photos/abc/media*' => Http::response('IMG', 200, ['Content-Type' => 'image/jpeg']),
            'places.test/v1/places/ChIJhotel00001*' => Http::response([
                'id' => 'ChIJhotel00001', 'displayName' => ['text' => 'Ganga View'], 'formattedAddress' => 'Tapovan, Rishikesh 249192',
                'addressComponents' => [['longText' => 'Rishikesh', 'types' => ['locality']]], 'nationalPhoneNumber' => '0135 244 0000',
                'rating' => 4.4, 'userRatingCount' => 812, 'googleMapsUri' => 'https://maps.example/x',
                'photos' => [['name' => 'places/ChIJhotel00001/photos/abc', 'authorAttributions' => [['displayName' => 'A. Traveller']]]],
            ]),
        ]);
    }

    public function test_status_names_the_provider_and_never_returns_the_key(): void
    {
        $this->getJson('/api/places/status')->assertOk()->assertExactJson(['enabled' => true, 'provider' => 'demo']);

        $this->withKey();
        $res = $this->getJson('/api/places/status')->assertOk()->assertExactJson(['enabled' => true, 'provider' => 'google']);
        $this->assertStringNotContainsString('server-side-key', $res->getContent());
    }

    public function test_forcing_google_without_a_key_fails_cleanly_and_does_not_call_google(): void
    {
        config(['services.places.provider' => 'google']);
        Http::fake();

        $this->getJson('/api/places/status')->assertExactJson(['enabled' => false, 'provider' => 'google']);
        $this->getJson('/api/places/search?q=ganga&kind=hotel')->assertStatus(503)->assertJson(['success' => false, 'reason' => 'not_configured']);
        Http::assertNothingSent();
    }

    public function test_google_returns_nothing_for_an_empty_box_without_a_billed_call(): void
    {
        $this->withKey();
        Http::fake();

        $this->getJson('/api/places/search?kind=hotel')->assertOk()->assertJsonPath('data', [])->assertJsonPath('popular', true);
        Http::assertNothingSent();
    }

    public function test_search_returns_hotel_suggestions_limited_to_lodging_and_biased_to_the_day_location(): void
    {
        $this->withKey();
        $this->fakeGoogle();

        $res = $this->getJson('/api/places/search?q=ganga&kind=hotel&location=Rishikesh&session=tok_123')->assertOk();
        $res->assertJsonPath('data.0.placeId', 'ChIJhotel00001')->assertJsonPath('data.0.name', 'Ganga View')->assertJsonPath('data.0.area', 'Tapovan, Rishikesh');
        $this->assertCount(1, $res->json('data')); // the non-place suggestion is dropped
        $this->assertStringNotContainsString('server-side-key', $res->getContent());
        $this->assertStringStartsWith('/api/places/photo?', (string) $res->json('data.0.photo')); // photos go through us too

        Http::assertSent(fn ($r) => str_ends_with($r->url(), '/v1/places:autocomplete')
            && $r['includedPrimaryTypes'] === ['lodging']
            && $r['sessionToken'] === 'tok_123'
            && $r['locationBias']['circle']['center']['latitude'] === 30.08
            && $r->header('X-Goog-Api-Key')[0] === 'server-side-key');
    }

    public function test_activity_search_uses_attraction_types(): void
    {
        $this->withKey();
        $this->fakeGoogle();

        $this->getJson('/api/places/search?q=rafting&kind=activity')->assertOk();
        Http::assertSent(fn ($r) => str_ends_with($r->url(), '/v1/places:autocomplete') && in_array('tourist_attraction', $r['includedPrimaryTypes'], true));
    }

    public function test_the_same_search_is_served_from_cache(): void
    {
        $this->withKey();
        $this->fakeGoogle();
        Cache::flush();

        $this->getJson('/api/places/search?q=ganga&kind=hotel')->assertOk();
        $this->getJson('/api/places/search?q=ganga&kind=hotel')->assertOk();

        Http::assertSentCount(2); // one autocomplete and one details lookup for the rating and photo; nothing on the repeat
    }

    public function test_search_validates_its_input(): void
    {
        $this->withKey();
        $this->getJson('/api/places/search?q=a&kind=hotel')->assertStatus(422);
        $this->getJson('/api/places/search?q=ganga&kind=casino')->assertStatus(422);
        $this->getJson('/api/places/search?q=ganga&kind=hotel&session=bad token!')->assertStatus(422);
    }

    public function test_place_details_return_the_fields_the_form_needs(): void
    {
        $this->withKey();
        $this->fakeGoogle();

        $this->getJson('/api/places/ChIJhotel00001?session=tok_123')->assertOk()
            ->assertJsonPath('data.name', 'Ganga View')->assertJsonPath('data.city', 'Rishikesh')->assertJsonPath('data.phone', '0135 244 0000')
            ->assertJsonPath('data.rating', 4.4)->assertJsonPath('data.photoCredit', 'A. Traveller');
        Http::assertSent(fn ($r) => str_contains($r->url(), '/v1/places/ChIJhotel00001') && ($r->data()['sessionToken'] ?? null) === 'tok_123');
    }

    public function test_odd_place_ids_are_rejected_before_google_is_called(): void
    {
        $this->withKey();
        Http::fake();
        $this->getJson('/api/places/short')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_photos_are_streamed_through_the_server(): void
    {
        $this->withKey();
        $this->fakeGoogle();

        $res = $this->get('/api/places/photo?ref=places/ChIJhotel00001/photos/abc&w=96')->assertOk();
        $this->assertSame('IMG', $res->getContent());
        $this->assertStringContainsString('image/jpeg', $res->headers->get('Content-Type'));
        $this->getJson('/api/places/photo?ref=../../etc/passwd')->assertStatus(422);
    }

    public function test_a_quota_error_from_google_becomes_a_friendly_429(): void
    {
        $this->withKey();
        Http::fake(['places.test/*' => Http::response(['error' => ['status' => 'RESOURCE_EXHAUSTED']], 429)]);

        $this->getJson('/api/places/search?q=ganga&kind=hotel')->assertStatus(429)->assertJson(['reason' => 'quota']);
    }

    public function test_google_being_down_becomes_a_503_not_a_crash(): void
    {
        $this->withKey();
        Http::fake(['places.test/*' => Http::response('boom', 500)]);

        $this->getJson('/api/places/search?q=ganga&kind=hotel')->assertStatus(503)->assertJson(['reason' => 'unavailable']);
    }

    public function test_each_visitor_has_a_per_minute_allowance(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $this->getJson('/api/places/status')->assertOk();
        }
        $this->getJson('/api/places/status')->assertStatus(429);
    }

    public function test_saved_hotels_move_to_the_top_when_used_again(): void
    {
        $this->postJson('/api/saved/hotels', ['placeId' => 'ChIJhotel00001', 'name' => 'Ganga View', 'city' => 'Rishikesh', 'address' => 'Tapovan', 'phone' => '0135'])->assertCreated();
        $this->travel(1)->minutes();
        $this->postJson('/api/saved/hotels', ['name' => 'Home Stay', 'city' => 'Manali'])->assertCreated();
        $this->travel(1)->minutes();
        $this->postJson('/api/saved/hotels', ['placeId' => 'ChIJhotel00001', 'name' => 'Ganga View', 'city' => 'Rishikesh'])->assertOk();

        $this->assertSame(2, SavedHotel::count());
        $this->assertSame(2, SavedHotel::where('place_id', 'ChIJhotel00001')->value('uses'));
        $this->getJson('/api/saved/hotels')->assertOk()->assertJsonPath('data.0.name', 'Ganga View')->assertJsonCount(2, 'data');
    }

    public function test_hand_typed_places_are_not_duplicated_and_activities_keep_the_meeting_point(): void
    {
        $this->postJson('/api/saved/activities', ['name' => 'River rafting', 'city' => 'Rishikesh', 'meetingPoint' => 'Shivpuri camp'])->assertCreated();
        $this->postJson('/api/saved/activities', ['name' => 'River rafting', 'city' => 'Rishikesh', 'meetingPoint' => 'Marine Drive'])->assertOk();

        $this->assertSame(1, SavedActivity::count());
        $this->getJson('/api/saved/activities')->assertJsonPath('data.0.meetingPoint', 'Marine Drive');
        $this->postJson('/api/saved/activities', ['city' => 'x'])->assertStatus(422);
        $this->getJson('/api/saved/rooms')->assertNotFound();
    }
}

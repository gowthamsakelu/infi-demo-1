<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Ruyi\RuyiApiException;
use App\Support\Ruyi\RuyiApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RuyiApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.ruyi.base_url' => 'https://ruyitravels.com/api', 'services.ruyi.cache_seconds' => 0]);
        $this->actingAs(User::demo());
    }

    public function test_hotels_are_fetched_with_a_post_and_come_back_in_one_shape(): void
    {
        Http::fake(['ruyitravels.com/api/hotel-list*' => Http::response([[
            'HOTEL_ID' => 'HTL_537', 'TYPE' => 'PG', 'TITLE' => 'Elite Comfort', 'IMAGE' => 'https://ruyitravels.com/public/a.jpg', 'PRICE' => 7500,
            'INCLUSIONS' => 'Wi-Fi, Parking, ', 'LOCALITY' => 'Margao', 'CITY' => '', 'STATE' => '', 'ADDRESS' => 'KTC Bus Stand',
            'LATITUDE' => '', 'LONGITUDE' => '', 'DESTINATION' => 'Goa',
        ]])]);

        $row = $this->getJson('/api/ruyi/hotels?row=0')->assertOk()->assertJson(['success' => true, 'count' => 1])->json('data.0');

        $this->assertSame(['id' => 'HTL_537', 'name' => 'Elite Comfort', 'tag' => 'pg', 'image' => 'https://ruyitravels.com/public/a.jpg', 'price' => 7500,
            'inclusions' => ['Wi-Fi', 'Parking'], 'locality' => 'Margao', 'city' => null, 'state' => null, 'address' => 'KTC Bus Stand',
            'latitude' => null, 'longitude' => null, 'destination' => 'Goa'], $row);
        Http::assertSent(fn (Request $r) => $r->method() === 'POST' && str_starts_with($r->url(), 'https://ruyitravels.com/api/hotel-list?') && str_contains($r->url(), 'row=0'));
    }

    public function test_packages_pass_the_row_and_the_filters_on(): void
    {
        Http::fake(['*' => Http::response([['PACKAGE_ID' => 'PKG_27', 'TITLE' => 'Goa Tour', 'IMAGE' => 'uploads/p.jpg', 'PRICE' => 300, 'DURATION' => 1, 'DESTINATION' => 'Goa']])]);

        $row = $this->getJson('/api/ruyi/packages?row=10&filters='.urlencode('DURATION[]=1&SORT=ASC'))->assertOk()->json('data.0');

        $this->assertSame(['id' => 'PKG_27', 'name' => 'Goa Tour', 'image' => 'https://ruyitravels.com/uploads/p.jpg', 'price' => 300, 'days' => 1, 'destination' => 'Goa'], $row);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'package-list') && str_contains($r->url(), 'row=10') && str_contains($r->url(), 'filters='));
    }

    public function test_transport_drops_embedded_pictures_and_huge_values(): void
    {
        $blob = base64_encode(str_repeat('x', 5000));
        Http::fake(['*' => Http::response([['TRANSPORT_ID' => 'TRN_26', 'DESCRIPTION' => '<p><img src="data:image/webp;base64,'.$blob.'"></p><p>Sedan &amp; SUV, AC</p>', 'TITLE' => 'Sedan', 'EXTRA' => 'data:image/png;base64,'.$blob]])]);

        $row = $this->getJson('/api/ruyi/transport')->assertOk()->json('data.0');

        $this->assertSame('TRN_26', $row['id']);
        $this->assertSame('Sedan & SUV, AC', $row['description']);
        $this->assertSame('Sedan', $row['title']);
        $this->assertArrayNotHasKey('extra', $row);
        $this->assertLessThan(500, strlen(json_encode($row)));
    }

    public function test_blogs_become_a_plain_excerpt_with_an_iso_date(): void
    {
        Http::fake(['*' => Http::response([['BLOG_ID' => 'BLG_22', 'TITLE' => 'Baga Beach', 'DESCRIPTION' => "\r\n<h1>Baga</h1>\r\n<script>alert(1)</script><p>A guide</p>", 'IMAGE' => 'https://images.pexels.com/x.jpeg', 'CREATED_DATE' => ' January 28, 2025', 'DESTINATION' => 'Goa']])]);

        $row = $this->getJson('/api/ruyi/blogs')->assertOk()->json('data.0');

        $this->assertSame('Baga A guide', $row['excerpt']);
        $this->assertSame('2025-01-28', $row['createdAt']);
        $this->assertSame('January 28, 2025', $row['createdDate']);
    }

    public function test_a_site_that_is_down_gives_a_502_not_a_crash(): void
    {
        Http::fake(['*' => Http::response('nope', 500)]);

        $this->getJson('/api/ruyi/activities')->assertStatus(502)->assertJson(['success' => false]);
    }

    public function test_an_answer_that_is_not_a_list_is_refused(): void
    {
        Http::fake(['*' => Http::response('<html>maintenance</html>', 200)]);

        $this->getJson('/api/ruyi/hotels')->assertStatus(502)->assertJson(['success' => false]);
    }

    public function test_row_is_validated(): void
    {
        Http::fake();

        $this->getJson('/api/ruyi/hotels?row=-1')->assertStatus(422);
        Http::assertNothingSent();
    }

    public function test_only_the_five_lists_can_be_called(): void
    {
        $this->expectException(RuyiApiException::class);
        app(RuyiApiService::class)->list('admin/package/add');
    }

    public function test_there_is_no_route_that_writes_or_deletes(): void
    {
        $methods = collect(Route::getRoutes()->getRoutes())->filter(fn ($r) => str_starts_with($r->uri(), 'api/ruyi'))->flatMap(fn ($r) => $r->methods())->unique()->values()->all();

        $this->assertNotEmpty($methods);
        $this->assertEqualsCanonicalizing(['GET', 'HEAD'], $methods);
    }

    public function test_a_guest_cannot_read_the_lists(): void
    {
        auth()->logout();
        Http::fake();

        $this->getJson('/api/ruyi/hotels')->assertUnauthorized();
        Http::assertNothingSent();
    }
}

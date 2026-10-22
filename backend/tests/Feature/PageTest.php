<?php

namespace Tests\Feature;

use Tests\TestCase;

class PageTest extends TestCase
{
    public function test_home_serves_the_shell_with_versioned_assets_and_no_stale_cache(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertHeader('Cache-Control');
        $this->assertStringContainsString('no-cache', $response->headers->get('Cache-Control'));
        $this->assertMatchesRegularExpression('#css/style\.css\?v=[a-f0-9]{10}#', $response->getContent());
        $this->assertMatchesRegularExpression('#js/main\.js\?v=[a-f0-9]{10}#', $response->getContent());
        $this->assertMatchesRegularExpression('#css/fonts\.css\?v=[a-f0-9]{10}#', $response->getContent());
    }

    public function test_inquiries_path_opens_the_inquiries_hash(): void
    {
        $this->get('/inquiries')->assertRedirect('/#inquiries');
    }

    public function test_routes_can_be_cached_for_production(): void
    {
        // `php artisan route:cache` (run on deploy) fails if any app route uses a closure.
        $this->artisan('route:cache')->assertExitCode(0);
        $this->artisan('route:clear')->assertExitCode(0);
    }
}

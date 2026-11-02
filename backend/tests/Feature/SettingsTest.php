<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\Inquiry;
use App\Models\User;
use Database\Seeders\Pages\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::demo());
    }

    public function test_the_list_has_the_eight_sections_in_order(): void
    {
        $rows = $this->getJson('/api/settings')->assertOk()->json('data');
        $this->assertSame(['company', 'lead-sources', 'inquiry-stages', 'bookings-payments', 'message-templates', 'notifications', 'integrations', 'data-backup'], array_column($rows, 'id'));
        $this->assertSame(['Company', 'Lead sources', 'Inquiry stages', 'Bookings and payments', 'Message templates', 'Notifications', 'Integrations', 'Data and backup'], array_column($rows, 'name'));
    }

    public function test_company_has_defaults_before_anything_is_saved(): void
    {
        $d = $this->getJson('/api/settings/company')->assertOk()->json('data');
        $this->assertSame('Ruyi Travels', $d['values']['name']);
        $this->assertSame(['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false], $d['preferences']);
        $this->assertSame(['google-places', 'whatsapp', 'email'], array_column($d['services'], 'key'));
    }

    public function test_company_saves_with_put_and_reads_back(): void
    {
        $body = ['values' => ['name' => 'Ruyi Holidays', 'phone' => '+91 90000 00000', 'email' => 'hi@ruyi.test', 'website' => 'ruyi.test', 'address' => 'Goa'],
            'preferences' => ['autoAssign' => false, 'sendQuoteWhatsapp' => true, 'dailySummary' => false, 'showGst' => true]];
        $this->putJson('/api/settings/company', $body)->assertOk()->assertJsonPath('data.values.name', 'Ruyi Holidays')->assertJsonPath('data.preferences.showGst', true);

        $this->assertSame('Ruyi Holidays', $this->getJson('/api/settings/company')->json('data.values.name'));
        $this->assertSame('Goa', AppSetting::read('company')['address']);
    }

    public function test_writes_are_validated(): void
    {
        $this->putJson('/api/settings/company', [])->assertUnprocessable();
        $this->putJson('/api/settings/company', ['values' => ['name' => '', 'email' => 'not-an-email'], 'preferences' => ['autoAssign' => 'x']])
            ->assertUnprocessable()->assertJsonValidationErrors(['values.name', 'values.email', 'preferences.autoAssign']);
        $this->putJson('/api/settings/bookings-payments', ['values' => ['gstPercent' => 120, 'advancePercent' => 30, 'dueDays' => 15]])->assertUnprocessable()->assertJsonValidationErrors('values.gstPercent');
        $this->putJson('/api/settings/lead-sources', ['sources' => [['name' => 'WhatsApp', 'active' => true], ['name' => 'whatsapp', 'active' => false]]])->assertUnprocessable();
        $this->putJson('/api/settings/lead-sources', ['sources' => []])->assertUnprocessable();
        $this->putJson('/api/settings/notifications', ['types' => ['payment' => true]])->assertUnprocessable();
    }

    public function test_lead_sources_payments_and_alerts_save_and_read_back(): void
    {
        $this->putJson('/api/settings/lead-sources', ['sources' => [['name' => ' WhatsApp ', 'active' => true], ['name' => 'Referral', 'active' => false]]])->assertOk();
        $this->assertSame([['name' => 'WhatsApp', 'active' => true], ['name' => 'Referral', 'active' => false]], $this->getJson('/api/settings/lead-sources')->json('data.sources'));

        $this->putJson('/api/settings/bookings-payments', ['values' => ['gstPercent' => 12, 'advancePercent' => 25.5, 'dueDays' => 7]])->assertOk();
        $this->assertSame(7, $this->getJson('/api/settings/bookings-payments')->json('data.values.dueDays'));

        $this->putJson('/api/settings/notifications', ['types' => ['payment' => true, 'inquiry' => false, 'followup' => true, 'trip' => true]])->assertOk();
        $this->assertFalse($this->getJson('/api/settings/notifications')->json('data.types.inquiry'));
    }

    public function test_inquiry_stages_are_the_real_statuses_with_counts_and_cannot_be_written(): void
    {
        Inquiry::create(['id' => 'INQ-1', 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'T', 'status' => 'hot']);
        Inquiry::create(['id' => 'INQ-2', 'customer_name' => 'B', 'customer_phone' => '1', 'trip' => 'T', 'status' => 'hot']);

        $stages = $this->getJson('/api/settings/inquiry-stages')->assertOk()->json('data.stages');
        $this->assertSame(['new', 'ongoing', 'warm', 'hot'], array_column($stages, 'key'));
        $this->assertSame(2, collect($stages)->firstWhere('key', 'hot')['count']);
        $this->putJson('/api/settings/inquiry-stages', [])->assertNotFound();
        $this->putJson('/api/settings/integrations', [])->assertNotFound();
    }

    public function test_sections_with_nothing_to_configure_say_so(): void
    {
        $this->assertTrue($this->getJson('/api/settings/message-templates')->assertOk()->json('data.empty'));
        $this->assertTrue($this->getJson('/api/settings/data-backup')->json('data.empty'));
        $this->getJson('/api/settings/nope')->assertNotFound();
    }

    public function test_the_places_key_is_never_sent_only_whether_one_is_configured(): void
    {
        config(['services.google_places.key' => 'SECRET-KEY-123', 'services.places.provider' => 'auto']);
        $text = '';
        foreach (['/api/settings', '/api/settings/company', '/api/settings/integrations'] as $url) {
            $text .= $this->getJson($url)->assertOk()->getContent();
        }
        $this->assertStringNotContainsString('SECRET-KEY-123', $text);

        $places = collect($this->getJson('/api/settings/integrations')->json('data.services'))->firstWhere('key', 'google-places');
        $this->assertSame(['mode' => 'auto', 'using' => 'google', 'keyConfigured' => true], $places['details']);
        $this->assertSame('active', $places['status']);

        config(['services.google_places.key' => null]);
        $places = collect($this->getJson('/api/settings/integrations')->json('data.services'))->firstWhere('key', 'google-places');
        $this->assertSame(['mode' => 'auto', 'using' => 'demo', 'keyConfigured' => false], $places['details']);
        $this->assertSame('Demo data', $places['statusLabel']);

        config(['services.places.provider' => 'google']);
        $places = collect($this->getJson('/api/settings/integrations')->json('data.services'))->firstWhere('key', 'google-places');
        $this->assertSame('Needs a key', $places['statusLabel']);
    }

    public function test_integrations_that_do_not_exist_are_not_faked(): void
    {
        $services = collect($this->getJson('/api/settings/integrations')->json('data.services'))->keyBy('key');
        $this->assertSame('Not connected', $services['whatsapp']['statusLabel']);
        $this->assertSame('Not connected', $services['email']['statusLabel'], 'the log mailer is not a connected service');
    }

    public function test_the_seeder_fills_the_company_and_is_repeatable(): void
    {
        $this->seed(SettingSeeder::class);
        $this->seed(SettingSeeder::class);
        $this->assertSame('hello@ruyitravels.com', $this->getJson('/api/settings/company')->json('data.values.email'));
        $this->assertCount(6, $this->getJson('/api/settings/lead-sources')->json('data.sources'));
    }

    public function test_a_guest_and_a_member_without_the_module_are_refused(): void
    {
        $sales = User::factory()->create();
        $this->actingAs($sales);
        $this->getJson('/api/settings')->assertForbidden();
        $this->getJson('/api/settings/company')->assertForbidden();
        $this->putJson('/api/settings/company', [])->assertForbidden();

        auth()->logout();
        $this->getJson('/api/settings')->assertUnauthorized();
    }

    public function test_company_returns_branding_defaults(): void
    {
        $d = $this->getJson('/api/settings/company')->assertOk()->json('data');
        $this->assertArrayHasKey('branding', $d);
        $this->assertNull($d['branding']['logo']);
        $this->assertSame('#2563EB', $d['branding']['color']);
        $this->assertSame('#2563EB', $d['branding']['themeColor']);
        $this->assertNull($d['branding']['detectedColor']);
        $this->assertNull($d['branding']['detectedThemeColor']);
    }

    public function test_company_branding_saves_valid_color_and_logo_and_persists(): void
    {
        $base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        $body = [
            'values' => ['name' => 'Ruyi Travels', 'phone' => '', 'email' => '', 'website' => '', 'address' => ''],
            'preferences' => ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false],
            'branding' => [
                'logo' => $base64Png,
                'color' => '#E11D48',
                'themeColor' => '#4F46E5',
                'detectedColor' => '#E11D48',
                'detectedThemeColor' => '#4F46E5',
            ],
        ];

        $res = $this->putJson('/api/settings/company', $body)->assertOk();
        $branding = $res->json('data.branding');

        $this->assertSame('#E11D48', $branding['color']);
        $this->assertSame('#4F46E5', $branding['themeColor']);
        $this->assertSame('#E11D48', $branding['detectedColor']);
        $this->assertSame('#4F46E5', $branding['detectedThemeColor']);
        $this->assertNotNull($branding['logo']);
        $this->assertStringStartsWith('/images/branding/', $branding['logo']);

        // Verify the file was stored on disk
        $filePath = public_path(ltrim($branding['logo'], '/'));
        $this->assertFileExists($filePath);

        // Verify reading back from GET /api/settings/company
        $getRes = $this->getJson('/api/settings/company')->assertOk()->json('data.branding');
        $this->assertSame('#E11D48', $getRes['color']);
        $this->assertSame('#4F46E5', $getRes['themeColor']);
        $this->assertSame($branding['logo'], $getRes['logo']);

        // Verify reading from GET /api/branding
        $brandRes = $this->getJson('/api/branding')->assertOk()->json('data');
        $this->assertSame('#E11D48', $brandRes['color']);
        $this->assertSame('#4F46E5', $brandRes['themeColor']);
        $this->assertSame($branding['logo'], $brandRes['logo']);

        // Clean up created test image
        if (is_file($filePath)) {
            @unlink($filePath);
        }
    }

    public function test_company_branding_validates_color_hex(): void
    {
        $body = [
            'values' => ['name' => 'Ruyi Travels', 'phone' => '', 'email' => '', 'website' => '', 'address' => ''],
            'preferences' => ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false],
            'branding' => [
                'color' => 'not-a-hex',
                'themeColor' => 'bad-theme',
            ],
        ];

        $this->putJson('/api/settings/company', $body)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['branding.color', 'branding.themeColor']);
    }

    public function test_company_branding_resets_to_default(): void
    {
        // First save custom branding
        AppSetting::write('branding', [
            'logo' => 'branding/test.png',
            'color' => '#E11D48',
            'themeColor' => '#4F46E5',
            'detectedColor' => '#E11D48',
            'detectedThemeColor' => '#4F46E5',
        ]);

        // Reset
        $body = [
            'values' => ['name' => 'Ruyi Travels', 'phone' => '', 'email' => '', 'website' => '', 'address' => ''],
            'preferences' => ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false],
            'branding' => [
                'logo' => null,
                'color' => '#2563EB',
                'themeColor' => '#2563EB',
                'detectedColor' => null,
                'detectedThemeColor' => null,
            ],
        ];

        $res = $this->putJson('/api/settings/company', $body)->assertOk();
        $branding = $res->json('data.branding');

        $this->assertNull($branding['logo']);
        $this->assertSame('#2563EB', $branding['color']);
        $this->assertSame('#2563EB', $branding['themeColor']);
        $this->assertNull($branding['detectedColor']);
    }

    public function test_company_branding_includes_company_name(): void
    {
        $body = [
            'values' => ['name' => 'Acme Holidays', 'phone' => '', 'email' => '', 'website' => '', 'address' => ''],
            'preferences' => ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false],
            'branding' => [
                'logo' => null,
                'color' => '#2563EB',
                'themeColor' => '#2563EB',
            ],
        ];

        $res = $this->putJson('/api/settings/company', $body)->assertOk();
        $this->assertSame('Acme Holidays', $res->json('data.branding.companyName'));

        $brandRes = $this->getJson('/api/branding')->assertOk()->json('data');
        $this->assertSame('Acme Holidays', $brandRes['companyName']);
    }

    public function test_home_serves_injected_branding_style_and_script(): void
    {
        AppSetting::write('company', ['name' => 'Custom Travels']);
        AppSetting::write('branding', [
            'logo' => 'branding/sample.png',
            'color' => '#E11D48',
            'themeColor' => '#4F46E5',
            'detectedColor' => '#E11D48',
        ]);

        $html = $this->get('/')->assertOk()->getContent();
        $this->assertStringContainsString('<title>Custom Travels', $html);
        $this->assertStringContainsString('"companyName":"Custom Travels"', $html);
        $this->assertStringContainsString('--brand-color: #E11D48;', $html);
        $this->assertStringContainsString('--primary: #4F46E5;', $html);
        $this->assertStringContainsString('--primary-gradient: linear-gradient(135deg, #E11D48 0%, #4F46E5 100%);', $html);
        $this->assertStringContainsString('window.__BRANDING__', $html);
        $this->assertStringContainsString('#E11D48', $html);
        $this->assertStringContainsString('#4F46E5', $html);
        $this->assertStringContainsString('.ks-avatar-badge', $html);
        $this->assertStringContainsString('.row-avatar', $html);
        $this->assertStringContainsString('.compact-tab-btn.active', $html);
        $this->assertStringContainsString('.item-icon-box', $html);
        $this->assertStringContainsString('.dd-trigger svg:first-child', $html);
    }
}

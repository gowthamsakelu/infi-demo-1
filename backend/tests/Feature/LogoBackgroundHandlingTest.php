<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoBackgroundHandlingTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(): User
    {
        $user = User::factory()->create([
            'email' => 'admin@ruyitravels.com',
            'role' => 'admin',
        ]);
        $this->actingAs($user);

        return $user;
    }

    /**
     * Transparent 1x1 PNG data URL:
     * Header + IHDR + IDAT (empty/transparent pixel) + IEND
     */
    private function transparentPngDataUrl(): string
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }

    /**
     * Opaque 1x1 red JPEG data URL
     */
    private function opaqueJpgDataUrl(): string
    {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    }

    public function test_transparent_logo_is_saved_without_altering_original_format_or_bytes(): void
    {
        $this->signIn();

        $pngDataUrl = $this->transparentPngDataUrl();

        $response = $this->putJson('/api/settings/company', [
            'values' => [
                'name' => 'Transparent Travel Co',
                'phone' => '+91 99999 88888',
                'email' => 'info@transparent.com',
                'website' => 'https://transparent.com',
                'address' => 'New Delhi, India',
            ],
            'preferences' => [
                'autoAssign' => true,
                'sendQuoteWhatsapp' => true,
                'dailySummary' => true,
                'showGst' => false,
            ],
            'branding' => [
                'logo' => $pngDataUrl,
                'color' => '#903039',
                'themeColor' => '#DABC2F',
            ],
        ]);

        $response->assertOk();
        $savedLogo = AppSetting::read('branding')['logo'];
        $this->assertNotNull($savedLogo);
        $this->assertStringEndsWith('.png', $savedLogo);

        // Verify the file was stored on disk intact as PNG
        $savedPath = public_path('images/'.$savedLogo);
        $this->assertFileExists($savedPath);
        $this->assertEquals('image/png', mime_content_type($savedPath));

        // Original bytes are preserved (starts with PNG signature: \x89PNG\r\n\x1a\n)
        $bytes = file_get_contents($savedPath);
        $this->assertStringStartsWith("\x89PNG\r\n\x1a\n", $bytes);

        // Cleanup
        if (file_exists($savedPath)) {
            @unlink($savedPath);
        }
    }

    public function test_opaque_logo_is_saved_without_altering_original_format_or_bytes(): void
    {
        $this->signIn();

        $jpgDataUrl = $this->opaqueJpgDataUrl();

        $response = $this->putJson('/api/settings/company', [
            'values' => [
                'name' => 'Opaque Travel Co',
                'phone' => '+91 99999 88888',
                'email' => 'info@opaque.com',
                'website' => 'https://opaque.com',
                'address' => 'Mumbai, India',
            ],
            'preferences' => [
                'autoAssign' => true,
                'sendQuoteWhatsapp' => true,
                'dailySummary' => true,
                'showGst' => false,
            ],
            'branding' => [
                'logo' => $jpgDataUrl,
                'color' => '#1E3A8A',
                'themeColor' => '#3B82F6',
            ],
        ]);

        $response->assertOk();
        $savedLogo = AppSetting::read('branding')['logo'];
        $this->assertNotNull($savedLogo);
        $this->assertStringEndsWith('.jpg', $savedLogo);

        $savedPath = public_path('images/'.$savedLogo);
        $this->assertFileExists($savedPath);
        $this->assertEquals('image/jpeg', mime_content_type($savedPath));

        // Original bytes are preserved (starts with JPEG SOI marker: \xFF\xD8)
        $bytes = file_get_contents($savedPath);
        $this->assertStringStartsWith("\xFF\xD8", $bytes);

        // Cleanup
        if (file_exists($savedPath)) {
            @unlink($savedPath);
        }
    }

    public function test_logo_background_color_selection_persists_and_returns(): void
    {
        $this->signIn();

        $pngDataUrl = $this->transparentPngDataUrl();

        // Save with selected Black background for transparent logo and hasTransparency true
        $response = $this->putJson('/api/settings/company', [
            'values' => [
                'name' => 'White Logo Travel Co',
                'phone' => '+91 99999 88888',
                'email' => 'info@whitelogo.com',
                'website' => 'https://whitelogo.com',
                'address' => 'Delhi, India',
            ],
            'preferences' => [
                'autoAssign' => true,
                'sendQuoteWhatsapp' => true,
                'dailySummary' => true,
                'showGst' => false,
            ],
            'branding' => [
                'logo' => $pngDataUrl,
                'color' => '#1E3A8A',
                'themeColor' => '#3B82F6',
                'logoBg' => '#000000',
                'hasTransparency' => true,
            ],
        ]);

        $response->assertOk();
        $this->assertEquals('#000000', $response->json('data.branding.logoBg'));
        $this->assertTrue($response->json('data.branding.hasTransparency'));
        $this->assertEquals('#1E3A8A', $response->json('data.branding.color'));
        $this->assertEquals('#3B82F6', $response->json('data.branding.themeColor'));

        $savedBranding = AppSetting::read('branding');
        $this->assertEquals('#000000', $savedBranding['logoBg']);
        $this->assertTrue($savedBranding['hasTransparency']);
        // Verify logoBg does not alter global theme colors
        $this->assertEquals('#1E3A8A', $savedBranding['color']);
        $this->assertEquals('#3B82F6', $savedBranding['themeColor']);

        // Check that GET /api/settings/company also includes logoBg and hasTransparency
        $getRes = $this->getJson('/api/settings/company')->assertOk();
        $this->assertEquals('#000000', $getRes->json('data.branding.logoBg'));
        $this->assertTrue($getRes->json('data.branding.hasTransparency'));

        // Cleanup
        $savedPath = public_path('images/'.$savedBranding['logo']);
        if (file_exists($savedPath)) {
            @unlink($savedPath);
        }
    }

    public function test_opaque_logo_saves_with_transparency_false_and_transparent_background(): void
    {
        $this->signIn();

        $jpgDataUrl = $this->opaqueJpgDataUrl();

        $response = $this->putJson('/api/settings/company', [
            'values' => [
                'name' => 'Opaque Logo Co',
                'phone' => '+91 99999 88888',
                'email' => 'info@opaquelogo.com',
                'website' => 'https://opaquelogo.com',
                'address' => 'Mumbai, India',
            ],
            'preferences' => [
                'autoAssign' => true,
                'sendQuoteWhatsapp' => true,
                'dailySummary' => true,
                'showGst' => false,
            ],
            'branding' => [
                'logo' => $jpgDataUrl,
                'color' => '#903039',
                'themeColor' => '#DABC2F',
                'logoBg' => 'transparent',
                'hasTransparency' => false,
            ],
        ]);

        $response->assertOk();
        $this->assertEquals('transparent', $response->json('data.branding.logoBg'));
        $this->assertFalse($response->json('data.branding.hasTransparency'));
        // Global theme preserved
        $this->assertEquals('#903039', $response->json('data.branding.color'));
        $this->assertEquals('#DABC2F', $response->json('data.branding.themeColor'));

        $savedBranding = AppSetting::read('branding');
        $this->assertEquals('transparent', $savedBranding['logoBg']);
        $this->assertFalse($savedBranding['hasTransparency']);

        // Cleanup
        $savedPath = public_path('images/'.$savedBranding['logo']);
        if (file_exists($savedPath)) {
            @unlink($savedPath);
        }
    }

    public function test_html_serves_logo_module_and_branding_injections(): void
    {
        $this->signIn();

        $html = $this->get('/')->assertOk()->getContent();

        $this->assertStringContainsString('logo.js', $html);
        $this->assertStringContainsString('branding.js', $html);
        $this->assertStringContainsString('id="app-branding-theme"', $html);
        $this->assertStringContainsString('window.__BRANDING__', $html);
    }
}


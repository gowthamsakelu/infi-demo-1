<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\AppSetting;
use App\Models\Inquiry;
use App\Support\DummyData;
use Illuminate\Http\JsonResponse;

/**
 * Settings: a list of sections (GET /api/settings) and one section's content (GET / PUT /api/settings/{section}).
 * Values live in app_settings. Secrets never do: the Places key stays in .env and only "is it configured" (a boolean) is shown.
 */
class SettingsController extends Controller
{
    /** id => [name, description, icon, editable] */
    private const SECTIONS = [
        'company' => ['Company', 'Name, contact and address', 'briefcase', true],
        'lead-sources' => ['Lead sources', 'Where inquiries come from', 'users', true],
        'inquiry-stages' => ['Inquiry stages', 'How inquiries move along', 'filter', false],
        'bookings-payments' => ['Bookings and payments', 'Instalments, GST, currency', 'rupee', true],
        'message-templates' => ['Message templates', 'WhatsApp and email replies', 'message', false],
        'notifications' => ['Notifications', 'What alerts you receive', 'bell', true],
        'integrations' => ['Integrations', 'Google Places, WhatsApp, email', 'layers', false],
        'data-backup' => ['Data and backup', 'Export, import, backups', 'download', false],
    ];

    private const COMPANY = ['name' => 'Ruyi Travels', 'phone' => '', 'email' => '', 'website' => '', 'address' => ''];
    private const PREFERENCES = ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false];
    private const PAYMENTS = ['gstPercent' => 5, 'advancePercent' => 30, 'dueDays' => 15];
    private const ALERTS = ['payment' => true, 'inquiry' => true, 'followup' => true, 'trip' => true];
    private const SOURCES = ['Website contact form', 'WhatsApp', 'Referral', 'Instagram', 'Google Search', 'Facebook'];

    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('settings')]);
        }

        return response()->json(['success' => true, 'data' => collect(self::SECTIONS)->map(fn (array $s, string $id) => [
            'id' => $id, 'name' => $s[0], 'description' => $s[1], 'icon' => $s[2], 'editable' => $s[3],
        ])->values()]);
    }

    public function show(string $section): JsonResponse
    {
        abort_unless(isset(self::SECTIONS[$section]), 404);

        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::detail('settings', $section) ?? abort(404)]);
        }

        return response()->json(['success' => true, 'data' => $this->payload($section)]);
    }

    public function update(UpdateSettingsRequest $request, string $section): JsonResponse
    {
        abort_unless(isset(self::SECTIONS[$section]) && self::SECTIONS[$section][3], 404);
        $data = $request->validated();

        match ($section) {
            'company' => [AppSetting::write('company', $data['values']), AppSetting::write('preferences', $data['preferences'])],
            'lead-sources' => AppSetting::write('lead_sources', array_map(fn ($s) => ['name' => trim($s['name']), 'active' => (bool) $s['active']], $data['sources'])),
            'bookings-payments' => AppSetting::write('payments', $data['values']),
            'notifications' => AppSetting::write('alert_types', $data['types']),
        };

        return response()->json(['success' => true, 'data' => $this->payload($section)]);
    }

    private function payload(string $section): array
    {
        $base = ['id' => $section, 'name' => self::SECTIONS[$section][0], 'description' => self::SECTIONS[$section][1], 'editable' => self::SECTIONS[$section][3]];

        return $base + match ($section) {
            'company' => [
                'values' => array_merge(self::COMPANY, AppSetting::read('company', [])),
                'preferences' => array_merge(self::PREFERENCES, AppSetting::read('preferences', [])),
                'services' => $this->services(),
            ],
            'lead-sources' => ['sources' => AppSetting::read('lead_sources') ?: array_map(fn ($n) => ['name' => $n, 'active' => true], self::SOURCES)],
            'inquiry-stages' => ['stages' => $this->stages()],
            'bookings-payments' => ['values' => array_merge(self::PAYMENTS, AppSetting::read('payments', []))],
            'notifications' => ['types' => array_merge(self::ALERTS, AppSetting::read('alert_types', []))],
            'integrations' => ['services' => $this->services()],
            default => ['empty' => true],
        };
    }

    /** The real inquiry statuses with how many inquiries sit in each. */
    private function stages(): array
    {
        $counts = Inquiry::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $notes = ['new' => 'Just arrived, nobody has worked it yet', 'ongoing' => 'Being worked: a quote is out or being prepared', 'warm' => 'Interested, talking about the details', 'hot' => 'Ready to book soon'];

        return collect(Inquiry::STATUSES)->map(fn (string $s) => ['key' => $s, 'label' => ucfirst($s), 'description' => $notes[$s], 'count' => (int) ($counts[$s] ?? 0)])->all();
    }

    /** Connected services, read only. Never the key itself: whether one is set is a boolean. */
    private function services(): array
    {
        $mode = (string) config('services.places.provider', 'auto');
        $hasKey = filled(config('services.google_places.key'));
        $usingGoogle = $mode === 'google' || ($mode === 'auto' && $hasKey);
        $placesStatus = !$usingGoogle ? ['demo', 'Demo data'] : ($hasKey ? ['active', 'Active'] : ['inactive', 'Needs a key']);
        $mailReady = !in_array(config('mail.default'), ['log', 'array', null], true);

        return [
            ['key' => 'google-places', 'name' => 'Google Places', 'description' => 'Hotel and activity search in the itinerary builder', 'status' => $placesStatus[0], 'statusLabel' => $placesStatus[1],
                'details' => ['mode' => $mode, 'using' => $usingGoogle ? 'google' : 'demo', 'keyConfigured' => $hasKey]],
            ['key' => 'whatsapp', 'name' => 'WhatsApp', 'description' => 'Send quotes and replies from the CRM', 'status' => 'inactive', 'statusLabel' => 'Not connected', 'details' => null],
            ['key' => 'email', 'name' => 'Email', 'description' => 'Send itineraries and daily summaries', 'status' => $mailReady ? 'active' : 'inactive', 'statusLabel' => $mailReady ? 'Active' : 'Not connected', 'details' => null],
        ];
    }
}

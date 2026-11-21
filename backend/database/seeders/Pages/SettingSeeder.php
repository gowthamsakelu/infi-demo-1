<?php

namespace Database\Seeders\Pages;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

/** Starting values for Settings. Only the company and the lists the team edits: nothing here is a secret. */
class SettingSeeder extends Seeder
{
    public function run(): void
    {
        AppSetting::write('company', [
            'name' => 'INFINITY',
            'legal_name' => 'Infinity Freight Services India Pvt. Ltd.',
            'tagline' => 'infinite freights, infinite ways',
            'about' => 'At Infinity Freight Services India Pvt. Ltd., we go beyond transportation—we deliver reliability, efficiency, and peace of mind. With a strong presence in the logistics and freight forwarding industry, we specialize in providing end-to-end supply chain solutions tailored to meet the evolving needs of businesses across the globe.',
            'email' => 'operations@infinityfreight.in',
            'phone' => '+91 22 6900 4500',
            'website' => 'www.infinityfreight.in',
            'address' => 'Infinity Tower, Logistics Park, Sector 18, Navi Mumbai, MH 400705, India',
            'gst' => '27AAACI4819M1ZL',
            'iec' => '0315082194',
        ]);
        AppSetting::write('preferences', ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false]);
        AppSetting::write('lead_sources', array_map(fn ($n) => ['name' => $n, 'active' => true], ['Website contact form', 'WhatsApp', 'Referral', 'Instagram', 'Google Search', 'Facebook']));
        AppSetting::write('payments', ['gstPercent' => 5, 'advancePercent' => 30, 'dueDays' => 15]);
        AppSetting::write('alert_types', ['payment' => true, 'inquiry' => true, 'followup' => true, 'trip' => true]);
    }
}

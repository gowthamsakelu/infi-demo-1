<?php

namespace Database\Seeders\Pages;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

/** Starting values for Settings. Only the company and the lists the team edits: nothing here is a secret. */
class SettingSeeder extends Seeder
{
    public function run(): void
    {
        AppSetting::write('company', ['name' => 'Ruyi Travels', 'phone' => '+91 98200 00000', 'email' => 'hello@ruyitravels.com', 'website' => 'www.ruyitravels.com', 'address' => 'Mumbai, Maharashtra, India']);
        AppSetting::write('preferences', ['autoAssign' => true, 'sendQuoteWhatsapp' => true, 'dailySummary' => true, 'showGst' => false]);
        AppSetting::write('lead_sources', array_map(fn ($n) => ['name' => $n, 'active' => true], ['Website contact form', 'WhatsApp', 'Referral', 'Instagram', 'Google Search', 'Facebook']));
        AppSetting::write('payments', ['gstPercent' => 5, 'advancePercent' => 30, 'dueDays' => 15]);
        AppSetting::write('alert_types', ['payment' => true, 'inquiry' => true, 'followup' => true, 'trip' => true]);
    }
}

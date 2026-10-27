<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** PUT /api/settings/{section}: the rules depend on the section. Sections that hold nothing to edit are a 404 before they get here. */
class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route's `can:module,system,edit` decides
    }

    public function rules(): array
    {
        return match ($this->route('section')) {
            'company' => [
                'values' => ['required', 'array'],
                'values.name' => ['required', 'string', 'max:120'],
                'values.phone' => ['nullable', 'string', 'max:40'],
                'values.email' => ['nullable', 'email', 'max:120'],
                'values.website' => ['nullable', 'string', 'max:160'],
                'values.address' => ['nullable', 'string', 'max:240'],
                'preferences' => ['required', 'array'],
                'preferences.autoAssign' => ['required', 'boolean'],
                'preferences.sendQuoteWhatsapp' => ['required', 'boolean'],
                'preferences.dailySummary' => ['required', 'boolean'],
                'preferences.showGst' => ['required', 'boolean'],
            ],
            'lead-sources' => [
                'sources' => ['required', 'array', 'min:1', 'max:30'],
                'sources.*.name' => ['required', 'string', 'max:60', 'distinct:ignore_case'],
                'sources.*.active' => ['required', 'boolean'],
            ],
            'bookings-payments' => [
                'values' => ['required', 'array'],
                'values.gstPercent' => ['required', 'numeric', 'between:0,100'],
                'values.advancePercent' => ['required', 'numeric', 'between:0,100'],
                'values.dueDays' => ['required', 'integer', 'between:0,365'],
            ],
            'notifications' => [
                'types' => ['required', 'array'],
                'types.payment' => ['required', 'boolean'],
                'types.inquiry' => ['required', 'boolean'],
                'types.followup' => ['required', 'boolean'],
                'types.trip' => ['required', 'boolean'],
            ],
            default => [],
        };
    }
}

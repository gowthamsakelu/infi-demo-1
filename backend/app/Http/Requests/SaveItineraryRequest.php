<?php

namespace App\Http\Requests;

use App\Support\ItineraryWriter;
use Illuminate\Foundation\Http\FormRequest;

class SaveItineraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // there is no login yet; add the policy check here when there is
    }

    public function rules(): array
    {
        $types = implode(',', ItineraryWriter::knownTypes());

        return [
            'days' => ['present', 'array', 'max:60'],
            'days.*.day' => ['required', 'string', 'max:40'],
            'days.*.date' => ['nullable', 'string', 'max:30'],
            'days.*.isoDate' => ['nullable', 'date_format:Y-m-d'],
            'days.*.title' => ['nullable', 'string', 'max:80'],
            'days.*.location' => ['nullable', 'string', 'max:160'],
            'days.*.locationMode' => ['nullable', 'in:same,transit'],
            'days.*.items' => ['present', 'array', 'max:100'],
            'days.*.items.*.id' => ['required', 'string', 'max:60'],
            'days.*.items.*.title' => ['required', 'string', 'max:120'],
            'days.*.items.*.subtitle' => ['nullable', 'string', 'max:200'],
            'days.*.items.*.type' => ['nullable', 'string', 'in:'.$types],
            'days.*.items.*.icon' => ['nullable', 'string', 'max:20'],
            'days.*.items.*.time' => ['nullable', 'string', 'max:12'],
            'days.*.items.*.endTime' => ['nullable', 'string', 'max:12'],
            'days.*.items.*.location' => ['nullable', 'string', 'max:160'],
            'days.*.items.*.inclusion' => ['nullable', 'in:included,not_included,paid_extra'],
            'days.*.items.*.mealPlan' => ['nullable', 'string', 'max:60'],
            'days.*.items.*.details' => ['nullable', 'array'],
            'days.*.items.*.visibleToCustomer' => ['nullable', 'boolean'],
            'days.*.items.*.completed' => ['nullable', 'boolean'],
            'days.*.items.*.assigned' => ['nullable', 'array'],
            'days.*.items.*.assigned.name' => ['nullable', 'string', 'max:120'],
            'days.*.items.*.assigned.avatar' => ['nullable', 'string', 'max:500'],
            'meta' => ['nullable', 'array'],
            'meta.origin' => ['nullable', 'string', 'max:160'],
            'meta.destination' => ['nullable', 'string', 'max:160'],
            'meta.stops' => ['nullable', 'array', 'max:20'],
            'meta.stops.*' => ['string', 'max:160'],
            'meta.startDate' => ['nullable', 'date_format:Y-m-d'],
            'meta.endDate' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:meta.startDate'],
        ];
    }
}

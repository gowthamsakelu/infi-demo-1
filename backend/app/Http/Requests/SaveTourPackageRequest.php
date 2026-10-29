<?php

namespace App\Http\Requests;

use App\Support\DummyData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Add / Edit Tour Package (the catalog wizard). Only the name is required; everything else is optional. Fields arrive in the page's camelCase. */
class SaveTourPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route is behind `auth` and the catalog permission
    }

    public function rules(): array
    {
        $list = ['nullable', 'array', 'max:50'];

        return [
            'name' => ['required', 'string', 'max:120'],
            'destinationId' => ['nullable', 'integer', DummyData::on() ? 'min:1' : Rule::exists('destinations', 'id')],
            'destination' => ['nullable', 'string', 'max:120'],
            'tag' => ['nullable', Rule::in(['tour', 'group', 'family', 'honeymoon', 'villa', 'activity'])],
            'status' => ['nullable', Rule::in(['published', 'draft', 'seasonal'])],
            'days' => ['nullable', 'integer', 'min:1', 'max:60'],
            'nights' => ['nullable', 'integer', 'min:0', 'max:60'],
            'season' => ['nullable', 'string', 'max:60'],
            'minPax' => ['nullable', 'integer', 'min:1', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'groupPrice' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'itineraryChanged' => ['nullable', 'boolean'],
            'itinerary' => $list,
            'itinerary.*.title' => ['required', 'string', 'max:80'],
            'itinerary.*.description' => ['nullable', 'string', 'max:1000'],
            'inclusions' => $list,
            'inclusions.*' => ['string', 'max:200'],
            'exclusions' => $list,
            'exclusions.*' => ['string', 'max:200'],
            'highlights' => $list,
            'highlights.*' => ['string', 'max:200'],
            'image' => ['nullable', 'string', 'max:7000000'],
        ];
    }

    public function messages(): array
    {
        return ['name.required' => 'Give the package a name.'];
    }
}

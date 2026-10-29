<?php

namespace App\Http\Requests;

/** Add / Edit a vehicle on the Transport page (the catalog wizard). Only the name is required. */
class SaveVehicleRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'category' => ['nullable', 'in:car,van,bus,other'],
            'seats' => ['nullable', 'integer', 'min:1', 'max:60'],
            'ac' => ['nullable', 'boolean'],
            'active' => ['nullable', 'boolean'],
            'mostPopular' => ['nullable', 'boolean'],
            'showInBuilder' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:200'],
            'rateUnit' => ['nullable', 'in:per_day,per_trip'],
            'baseRate' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'rateCard' => $this->listRule(),
            'rateCard.*.label' => ['required', 'string', 'max:80'],
            'rateCard.*.amount' => ['required', 'numeric', 'min:0', 'max:999999'],
            'rateCard.*.note' => ['nullable', 'string', 'max:120'],
            'rateCard.*.unit' => ['nullable', 'in:day,km,night,trip'],
            'overview' => ['nullable', 'string', 'max:2000'],
            'highlights' => $this->listRule(),
            'highlights.*' => ['string', 'max:200'],
            'inclusions' => $this->listRule(),
            'inclusions.*' => ['string', 'max:200'],
            'exclusions' => $this->listRule(),
            'exclusions.*' => ['string', 'max:200'],
            'image' => ['nullable', 'string', 'max:7000000'],
        ];
    }
}

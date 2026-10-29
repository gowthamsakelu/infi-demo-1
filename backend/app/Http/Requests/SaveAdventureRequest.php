<?php

namespace App\Http\Requests;

/** Add / Edit an adventure (the catalog wizard). Only the name is required. */
class SaveAdventureRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'tag' => ['nullable', 'in:adventure,sightseeing,water,culture,food,nature'],
            'status' => ['nullable', 'in:active,inactive'],
            'city' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:80'],
            'minutes' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'difficulty' => ['nullable', 'in:Easy,Moderate,Hard'],
            'bestTime' => ['nullable', 'string', 'max:120'],
            'meetingPoint' => ['nullable', 'string', 'max:160'],
            'minAge' => ['nullable', 'string', 'max:40'],
            'partner' => ['nullable', 'string', 'max:120'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'priceChild' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'priceGroup' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'groupSize' => ['nullable', 'integer', 'min:1', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
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

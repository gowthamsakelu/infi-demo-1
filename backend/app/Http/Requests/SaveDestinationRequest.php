<?php

namespace App\Http\Requests;

/** Add / Edit Destination (the catalog wizard). Only the name is required. */
class SaveDestinationRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:active,draft'],
            'popular' => ['nullable', 'boolean'],
            'bestSeason' => ['nullable', 'string', 'max:120'],
            'avgDays' => ['nullable', 'integer', 'min:1', 'max:60'],
            'avgNights' => ['nullable', 'integer', 'min:0', 'max:60'],
            'idealDuration' => ['nullable', 'string', 'max:120'],
            'nearestAirport' => ['nullable', 'string', 'max:120'],
            'howToReach' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:2000'],
            'highlights' => $this->listRule(),
            'highlights.*' => ['string', 'max:200'],
            'image' => ['nullable', 'string', 'max:4000000'],
        ];
    }
}

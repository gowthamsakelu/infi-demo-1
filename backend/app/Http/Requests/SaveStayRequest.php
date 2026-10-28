<?php

namespace App\Http\Requests;

/** Add / Edit a stay (the catalog wizard). Only the name is required. */
class SaveStayRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'tag' => ['nullable', 'in:hotel,villa,resort'],
            'status' => ['nullable', 'in:active,inactive'],
            'city' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:80'],
            'address' => ['nullable', 'string', 'max:200'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:160'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'roomsCount' => ['nullable', 'integer', 'min:0', 'max:999'],
            'priceNote' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'amenities' => $this->listRule(),
            'amenities.*' => ['string', 'max:200'],
            'inclusions' => $this->listRule(),
            'inclusions.*' => ['string', 'max:200'],
            'exclusions' => $this->listRule(),
            'exclusions.*' => ['string', 'max:200'],
            'extraCharges' => $this->listRule(),
            'extraCharges.*' => ['string', 'max:200'],
        ];
    }
}

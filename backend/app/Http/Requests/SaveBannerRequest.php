<?php

namespace App\Http\Requests;

/** Add / Edit a banner (the catalog wizard). Only the name is required. The picture arrives as a data URL. */
class SaveBannerRequest extends CatalogRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'headline' => ['nullable', 'string', 'max:160'],
            'cta' => ['nullable', 'string', 'max:120'],
            'tone' => ['nullable', 'in:blue,green,amber,indigo,rose,sky,teal,violet'],
            'placement' => ['nullable', 'in:Home hero,Destinations page,Adventures page,Not placed yet'],
            'slot' => ['nullable', 'integer', 'min:1', 'max:9'],
            'startsAt' => ['nullable', 'date'],
            'endsAt' => ['nullable', 'date', 'after_or_equal:startsAt'],
            'active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'string', 'max:4000000'],
        ];
    }
}

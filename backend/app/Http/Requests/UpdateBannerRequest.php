<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** The Banners page switches a banner on or off. */
class UpdateBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route is behind auth; module permissions are applied to every page together later
    }

    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}

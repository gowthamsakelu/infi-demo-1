<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaceSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // there is no login yet; the route is rate limited instead
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'min:2', 'max:100'], // empty = popular places (demo provider)
            'kind' => ['required', 'in:hotel,activity'],
            'location' => ['nullable', 'string', 'max:120'],
            'session' => ['nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/'],
        ];
    }
}

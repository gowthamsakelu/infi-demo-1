<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSavedPlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // there is no login yet; add the policy check here when there is
    }

    public function rules(): array
    {
        return [
            'placeId' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'meetingPoint' => ['nullable', 'string', 'max:160'],
        ];
    }
}

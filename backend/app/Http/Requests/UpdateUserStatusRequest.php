<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** PATCH /api/users/{id}/status: switch a person on or off. (Inviting people comes later.) */
class UpdateUserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route's `can:module,system,edit` decides
    }

    public function rules(): array
    {
        return ['status' => ['required', Rule::in(['active', 'inactive'])]];
    }
}

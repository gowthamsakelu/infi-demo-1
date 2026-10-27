<?php

namespace App\Http\Requests;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

/** PUT /api/users/{id}/permissions: the whole matrix, { permissions: { inquiries: { view, edit, delete }, ... } }. */
class UpdateUserPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route's `can:module,system,edit` decides
    }

    public function rules(): array
    {
        $rules = [
            'permissions' => ['required', 'array'],
            'features' => ['nullable', 'array'],
        ];
        foreach (array_keys(Permissions::MODULES) as $module) {
            $rules["permissions.$module"] = ['required', 'array'];
            foreach (Permissions::ACTIONS as $action) {
                $rules["permissions.$module.$action"] = ['required', 'boolean'];
            }
            $rules["permissions.$module.add"] = ['nullable', 'boolean'];
            $rules["permissions.$module.download"] = ['nullable', 'boolean'];
        }

        return $rules;
    }
}

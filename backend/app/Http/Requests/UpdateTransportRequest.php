<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** The two switches on the Transport page. They arrive as camelCase and are stored in the vehicle_types columns. */
class UpdateTransportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // the route is behind `auth`; module permissions are applied to all pages later
    }

    public function rules(): array
    {
        return [
            'mostPopular' => ['required_without:showInBuilder', 'boolean'],
            'showInBuilder' => ['required_without:mostPopular', 'boolean'],
        ];
    }

    /** @return array<string, bool> */
    public function validated($key = null, $default = null): array
    {
        $v = parent::validated();
        $out = [];
        if (array_key_exists('mostPopular', $v)) {
            $out['most_popular'] = (bool) $v['mostPopular'];
        }
        if (array_key_exists('showInBuilder', $v)) {
            $out['show_in_builder'] = (bool) $v['showInBuilder'];
        }

        return $out;
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** The new order of the banners: every id once, first = top. */
class ReorderBannersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer', 'distinct', 'exists:banners,id']];
    }
}

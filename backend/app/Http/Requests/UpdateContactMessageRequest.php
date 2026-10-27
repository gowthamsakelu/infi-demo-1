<?php

namespace App\Http\Requests;

use App\Models\ContactMessage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Opening a message marks it read; the detail can also set the status (Mark as spam) and the person it is assigned to. */
class UpdateContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('assigned_to_name'))) {
            $this->merge(['assigned_to_name' => trim(strip_tags($this->input('assigned_to_name')))]);
        }
    }

    public function rules(): array
    {
        return [
            'read' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(ContactMessage::STATUSES)],
            'assigned_to_name' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }
}

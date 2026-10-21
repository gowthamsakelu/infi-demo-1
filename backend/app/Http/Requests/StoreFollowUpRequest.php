<?php

namespace App\Http\Requests;

use App\Models\FollowUp;
use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFollowUpRequest extends FormRequest
{
    /**
     * The app has no login yet, so the acting user is the staff member named in the
     * request (default: ST-05, the signed-in profile shown in the sidebar).
     */
    public function actingStaff(): ?Staff
    {
        return Staff::find($this->input('created_by', 'ST-05'));
    }

    public function authorize(): bool
    {
        return $this->actingStaff() !== null;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(FollowUp::TYPES)],
            'call_outcome' => ['nullable', 'required_if:type,called', Rule::in(FollowUp::CALL_OUTCOMES)],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'comment' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'Pick a follow-up date.',
            'time.required' => 'Pick a follow-up time.',
            'comment.max' => 'Comment can be at most 500 characters.',
            'call_outcome.required_if' => 'Choose the call outcome.',
        ];
    }
}

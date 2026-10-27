<?php

namespace App\Http\Requests;

use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;

/**
 * "Add Inquiry" wizard. Staff save whatever the customer has shared so far, so every field is optional;
 * what is sent is cleaned (tags removed, trimmed) and kept within sensible lengths.
 */
class StoreInquiryRequest extends FormRequest
{
    public const MAX_GUESTS = 30;

    /** Text fields that are stripped of markup before they are validated. */
    private const TEXT = ['name', 'phone', 'email', 'city', 'destination', 'comment'];

    private ?Staff $staff = null;

    /**
     * The app has no login yet, so the acting user is the staff member named in the request
     * (default ST-05, the signed-in profile shown in the sidebar), like follow-ups and notes.
     */
    public function actingStaff(): ?Staff
    {
        return $this->staff ??= Staff::find($this->input('created_by', 'ST-05'));
    }

    public function authorize(): bool
    {
        return $this->actingStaff() !== null;
    }

    protected function prepareForValidation(): void
    {
        $clean = [];
        foreach (self::TEXT as $key) {
            if (is_string($this->input($key))) {
                $clean[$key] = trim(strip_tags($this->input($key)));
            }
        }
        if (is_array($this->input('guests'))) {
            $clean['guests'] = array_map(function ($g) {
                if (is_array($g) && is_string($g['name'] ?? null)) {
                    $g['name'] = trim(strip_tags($g['name']));
                }

                return $g;
            }, array_values($this->input('guests')));
        }
        if (is_string($this->input('budget'))) {
            $clean['budget'] = str_replace([',', ' '], '', $this->input('budget'));
        }
        $this->merge($clean);
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-()\s.]*$/'],
            'email' => ['nullable', 'email', 'max:160'],
            'city' => ['nullable', 'string', 'max:120'],
            'destination' => ['nullable', 'string', 'max:160'],
            'budget' => ['nullable', 'numeric', 'min:0', 'max:9999999999'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'guests' => ['nullable', 'array', 'max:'.self::MAX_GUESTS],
            'guests.*' => ['array'],
            'guests.*.name' => ['nullable', 'string', 'max:120'],
            'guests.*.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'created_by' => ['nullable', 'string', 'max:40'],
            'itinerary' => ['nullable', 'array'],
        ];

        // The itinerary is optional; when it is sent it follows exactly the rules of the itinerary API.
        if (is_array($this->input('itinerary'))) {
            $rules += SaveItineraryRequest::itineraryRules('itinerary.');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone can only contain digits, spaces, + and -.',
            'email.email' => 'Enter a valid email address.',
            'budget.numeric' => 'Budget must be a number.',
            'guests.max' => 'An inquiry can have at most '.self::MAX_GUESTS.' guests.',
            'guests.*.age.integer' => 'A guest age must be a whole number.',
        ];
    }
}

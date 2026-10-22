<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Day-wise itinerary for bookings and inquiries. The whole list of days is saved at once, so adding a day,
 * adding or editing an event, assigning an event and removing one all go through the same validated endpoint.
 */
class ItineraryController extends Controller
{
    public const EVENT_TYPES = ['sightseeing', 'hotel', 'transport', 'food', 'activity', 'bus', 'bed', 'camera', 'raft', 'restaurant'];

    public function show(string $kind, string $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->find($kind, $id)->itinerary_days ?? []]);
    }

    public function update(Request $request, string $kind, string $id): JsonResponse
    {
        $record = $this->find($kind, $id);

        $request->validate([
            'days' => ['present', 'array', 'max:60'],
            'days.*.day' => ['required', 'string', 'max:40'],
            'days.*.date' => ['nullable', 'string', 'max:30'],
            'days.*.title' => ['nullable', 'string', 'max:80'],
            'days.*.items' => ['present', 'array', 'max:100'],
            'days.*.items.*.id' => ['required', 'string', 'max:60'],
            'days.*.items.*.title' => ['required', 'string', 'max:120'],
            'days.*.items.*.subtitle' => ['nullable', 'string', 'max:200'],
            'days.*.items.*.type' => ['nullable', 'string', 'in:'.implode(',', self::EVENT_TYPES)],
            'days.*.items.*.completed' => ['nullable', 'boolean'],
            'days.*.items.*.assigned' => ['nullable', 'array'],
            'days.*.items.*.assigned.name' => ['nullable', 'string', 'max:120'],
            'days.*.items.*.assigned.avatar' => ['nullable', 'string', 'max:500'],
        ]);

        // Keep every key the UI uses (icon, details, ...); the rules above guard the ones that matter.
        $days = array_values($request->input('days', []));
        $record->itinerary_days = $days;
        $record->save();

        return response()->json(['success' => true, 'message' => 'Itinerary saved', 'data' => $days]);
    }

    private function find(string $kind, string $id): Booking|Inquiry
    {
        return match ($kind) {
            'bookings' => Booking::findOrFail($id),
            'inquiries' => Inquiry::findOrFail($id),
            default => abort(404),
        };
    }
}

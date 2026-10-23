<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveItineraryRequest;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\ItineraryItem;
use App\Support\ItineraryWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Itinerary of a booking or an inquiry. The builder and the Day-wise Schedule save the whole list of days in one
 * transaction; single events can also be changed or removed on their own.
 */
class ItineraryController extends Controller
{
    public function show(string $kind, string $id): JsonResponse
    {
        return $this->respond($this->find($kind, $id));
    }

    public function update(SaveItineraryRequest $request, string $kind, string $id): JsonResponse
    {
        $record = $this->find($kind, $id);

        ItineraryWriter::write($record->itineraryKind(), $record->getKey(), $request->input('days', []), $request->input('meta'), $record->itineraryTripStart());

        return $this->respond($record->fresh(), 'Itinerary saved');
    }

    public function updateItem(Request $request, string $kind, string $id, string $uid): JsonResponse
    {
        $item = $this->item($kind, $id, $uid);
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:200'],
            'time' => ['nullable', 'string', 'max:12'],
            'inclusion' => ['sometimes', 'in:included,not_included,paid_extra'],
            'completed' => ['sometimes', 'boolean'],
            'visibleToCustomer' => ['sometimes', 'boolean'],
            'assigned' => ['nullable', 'array'],
        ]);

        $item->update(array_filter([
            'title' => $data['title'] ?? null,
            'subtitle' => $data['subtitle'] ?? null,
            'start_time' => $data['time'] ?? null,
            'inclusion' => $data['inclusion'] ?? null,
            'completed' => $data['completed'] ?? null,
            'visible_to_customer' => $data['visibleToCustomer'] ?? null,
            'assigned_to' => $data['assigned'] ?? null,
        ], fn ($v) => $v !== null));

        return response()->json(['success' => true, 'message' => 'Event saved', 'data' => $item->fresh()->toTimeline()]);
    }

    public function destroyItem(string $kind, string $id, string $uid): JsonResponse
    {
        $this->item($kind, $id, $uid)->delete();

        return response()->json(['success' => true, 'message' => 'Event removed']);
    }

    private function respond(Booking|Inquiry $record, string $message = 'Itinerary'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $record->itinerary_days,
            'meta' => $record->itinerary?->meta() ?? ['origin' => null, 'destination' => null, 'stops' => [], 'startDate' => null, 'endDate' => null],
        ]);
    }

    private function item(string $kind, string $id, string $uid): ItineraryItem
    {
        $record = $this->find($kind, $id);

        return ItineraryItem::query()
            ->whereHas('day', fn ($q) => $q->where('itinerary_id', $record->itinerary?->id))
            ->where('uid', $uid)
            ->firstOrFail();
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

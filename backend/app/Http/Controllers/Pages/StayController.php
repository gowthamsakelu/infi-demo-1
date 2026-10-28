<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\SavedHotel;
use App\Support\DummyData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/** Stays page. Reads `saved_hotels`, the table the itinerary builder's hotel search fills, with its rooms and rates. */
class StayController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('stays')]);
        }

        return response()->json(['success' => true, 'data' => Cache::remember('pages.stays.index', 60, fn () => SavedHotel::query()->orderBy('id')->get()->map(fn ($h) => $this->row($h))->values()->all())]);
    }

    public function show(int $id): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::detail('stays', $id) ?? abort(404)]);
        }

        $stay = SavedHotel::query()->findOrFail($id);
        $stay->load('rooms');

        return response()->json(['success' => true, 'data' => $this->row($stay) + [
            'address' => $stay->address,
            'phone' => $stay->phone,
            'email' => $stay->email,
            'description' => $stay->description,
            'amenities' => $stay->amenities ?? [],
            'inclusions' => $stay->inclusions ?? [],
            'exclusions' => $stay->exclusions ?? [],
            'extraCharges' => $stay->extra_charges ?? [],
            'priceNote' => $stay->price_note,
            'revenue' => $stay->revenue,
            'rooms' => $stay->rooms->map(fn ($r) => [
                'id' => $r->id, 'name' => $r->name, 'occupancy' => $r->occupancy,
                'rates' => ['stay' => $r->rate_stay, 'breakfast' => $r->rate_breakfast, 'map' => $r->rate_map, 'all' => $r->rate_all],
            ])->values(),
        ]]);
    }

    private function row(SavedHotel $h): array
    {
        return [
            'id' => $h->id,
            'name' => $h->name,
            'city' => $h->city,
            'region' => $h->region,
            'tag' => $h->tag,
            'status' => $h->status,
            'rating' => $h->rating,
            'reviews' => $h->reviews,
            'roomsCount' => $h->rooms_count,
            'price' => $h->price_from,
            'bookings' => $h->bookings_count,
        ];
    }
}

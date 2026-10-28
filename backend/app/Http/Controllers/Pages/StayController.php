<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\SavedHotel;
use App\Support\DummyData;
use App\Http\Requests\SaveStayRequest;
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

    /** Add a stay from the wizard. With dummy data nothing is written. */
    public function store(SaveStayRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $stay = SavedHotel::query()->create($this->columns($request));
        Cache::forget('pages.stays.index');

        return response()->json(['success' => true, 'data' => ['id' => $stay->id]], 201);
    }

    /** Save the stay the wizard was opened on (the id is a string: with dummy data it can be one the page made this session). */
    public function save(SaveStayRequest $request, string $stay): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $record = SavedHotel::query()->findOrFail((int) $stay);
        $record->update($this->columns($request));
        Cache::forget('pages.stays.index');

        return response()->json(['success' => true, 'data' => ['id' => $record->id]]);
    }

    private function columns(SaveStayRequest $r): array
    {
        return [
            'name' => $r->input('name'), 'tag' => $r->input('tag', 'hotel'), 'status' => $r->input('status', 'active'),
            'city' => $r->input('city'), 'region' => $r->input('region'), 'address' => $r->input('address'), 'phone' => $r->input('phone'), 'email' => $r->input('email'),
            'price_from' => $r->input('price'), 'rooms_count' => $r->input('roomsCount'), 'price_note' => $r->input('priceNote'), 'description' => $r->input('description'),
            'amenities' => array_values($r->input('amenities', [])), 'inclusions' => array_values($r->input('inclusions', [])),
            'exclusions' => array_values($r->input('exclusions', [])), 'extra_charges' => array_values($r->input('extraCharges', [])),
        ];
    }
}

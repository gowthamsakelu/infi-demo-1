<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavedPlaceRequest;
use App\Models\SavedActivity;
use App\Models\SavedHotel;
use Illuminate\Http\JsonResponse;

/** "Recently used" hotels and activities. A place is stored once and moves to the top each time it is used again. */
class SavedPlaceController extends Controller
{
    public function index(string $kind): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->model($kind)::query()->orderByDesc('last_used_at')->limit(8)->get()->map->toApi()]);
    }

    public function store(StoreSavedPlaceRequest $request, string $kind): JsonResponse
    {
        $d = $request->validated();
        $model = $this->model($kind);
        $match = ($d['placeId'] ?? null) ? ['place_id' => $d['placeId']] : ['place_id' => null, 'name' => $d['name'], 'city' => $d['city'] ?? null];

        $row = $model::query()->firstOrNew($match);
        $row->fill([
            'name' => $d['name'], 'city' => $d['city'] ?? null, 'address' => $d['address'] ?? null, 'phone' => $d['phone'] ?? null,
            ...($kind === 'activities' ? ['meeting_point' => $d['meetingPoint'] ?? null] : []),
            'uses' => $row->exists ? $row->uses + 1 : 1, 'last_used_at' => now(),
        ])->save();

        return response()->json(['success' => true, 'data' => $row->toApi()], $row->wasRecentlyCreated ? 201 : 200);
    }

    /** @return class-string<SavedHotel|SavedActivity> */
    private function model(string $kind): string
    {
        return $kind === 'hotels' ? SavedHotel::class : SavedActivity::class;
    }
}

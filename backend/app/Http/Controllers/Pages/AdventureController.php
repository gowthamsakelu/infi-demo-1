<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\SavedActivity;
use App\Support\DummyData;
use App\Http\Requests\SaveAdventureRequest;
use Illuminate\Http\JsonResponse;

/** Adventures page. Reads `saved_activities`, the table the itinerary builder's activity search fills. A record is small, so the list carries all of it. */
class AdventureController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('adventures')]);
        }

        return response()->json(['success' => true, 'data' => SavedActivity::query()->orderBy('id')->get()->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->name,
            'city' => $a->city,
            'region' => $a->region,
            'tag' => $a->tag,
            'status' => $a->status,
            'rating' => $a->rating,
            'reviews' => $a->reviews,
            'minutes' => $a->duration_minutes,
            'price' => $a->price_adult,
            'priceChild' => $a->price_child,
            'priceGroup' => $a->price_group,
            'groupSize' => $a->group_size,
            'difficulty' => $a->difficulty,
            'bestTime' => $a->best_time,
            'minAge' => $a->min_age,
            'partner' => $a->partner,
            'meetingPoint' => $a->meeting_point,
            'description' => $a->description,
            'highlights' => $a->highlights ?? [],
            'inclusions' => $a->inclusions ?? [],
            'exclusions' => $a->exclusions ?? [],
            'bookings' => $a->bookings_count,
        ])->values()]);
    }

    /** Add an adventure from the wizard. With dummy data nothing is written. */
    public function store(SaveAdventureRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $activity = SavedActivity::query()->create($this->columns($request));

        return response()->json(['success' => true, 'data' => ['id' => $activity->id]], 201);
    }

    /** Save the adventure the wizard was opened on (the id is a string: with dummy data it can be one the page made this session). */
    public function save(SaveAdventureRequest $request, string $activity): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $record = SavedActivity::query()->findOrFail((int) $activity);
        $record->update($this->columns($request));

        return response()->json(['success' => true, 'data' => ['id' => $record->id]]);
    }

    private function columns(SaveAdventureRequest $r): array
    {
        return [
            'name' => $r->input('name'), 'tag' => $r->input('tag', 'sightseeing'), 'status' => $r->input('status', 'active'),
            'city' => $r->input('city'), 'region' => $r->input('region'), 'duration_minutes' => $r->input('minutes'), 'difficulty' => $r->input('difficulty'),
            'best_time' => $r->input('bestTime'), 'meeting_point' => $r->input('meetingPoint'), 'min_age' => $r->input('minAge'), 'partner' => $r->input('partner'),
            'price_adult' => $r->input('price'), 'price_child' => $r->input('priceChild'), 'price_group' => $r->input('priceGroup'), 'group_size' => $r->input('groupSize'),
            'description' => $r->input('description'), 'highlights' => array_values($r->input('highlights', [])),
            'inclusions' => array_values($r->input('inclusions', [])), 'exclusions' => array_values($r->input('exclusions', [])),
        ];
    }
}

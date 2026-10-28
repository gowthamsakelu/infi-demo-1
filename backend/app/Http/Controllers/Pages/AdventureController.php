<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\SavedActivity;
use App\Support\DummyData;
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
}

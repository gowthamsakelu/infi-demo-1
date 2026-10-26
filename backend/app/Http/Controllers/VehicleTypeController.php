<?php

namespace App\Http\Controllers;

use App\Models\VehicleType;
use Illuminate\Http\JsonResponse;

class VehicleTypeController extends Controller
{
    /** The active vehicles, most popular first, with their default daily rate. */
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => VehicleType::query()->where('active', true)->orderBy('popularity_rank')->get()->map->toApi()]);
    }
}

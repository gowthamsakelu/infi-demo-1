<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTransportRequest;
use App\Models\VehicleType;
use Illuminate\Http\JsonResponse;

/** Transport page. It reads and edits the itinerary builder's own `vehicle_types`; nothing is copied. */
class TransportController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => VehicleType::query()->orderBy('popularity_rank')->orderBy('id')->get()->map(fn ($v) => $this->row($v))->values()]);
    }

    public function update(UpdateTransportRequest $request, VehicleType $vehicleType): JsonResponse
    {
        $vehicleType->update($request->validated());

        return response()->json(['success' => true, 'data' => $this->row($vehicleType->refresh())]);
    }

    private function row(VehicleType $v): array
    {
        return $v->toApi() + [
            'description' => $v->description,
            'active' => $v->active,
            'mostPopular' => $v->most_popular,
            'showInBuilder' => $v->show_in_builder,
            'rateCard' => $v->rate_card ?? [],
            'trips' => $v->trips_count,
            'avgDays' => $v->avg_days,
        ];
    }
}

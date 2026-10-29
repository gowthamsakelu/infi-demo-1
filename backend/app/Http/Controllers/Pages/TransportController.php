<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTransportRequest;
use App\Models\VehicleType;
use App\Support\DummyData;
use App\Support\DataUrlImage;
use App\Http\Requests\SaveVehicleRequest;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

/** Transport page. It reads and edits the itinerary builder's own `vehicle_types`; nothing is copied. */
class TransportController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('transport')]);
        }

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
            'image' => DataUrlImage::url($v->image),
            'overview' => $v->overview,
            'highlights' => $v->highlights ?? [],
            'inclusions' => $v->inclusions ?? [],
            'exclusions' => $v->exclusions ?? [],
            'active' => $v->active,
            'mostPopular' => $v->most_popular,
            'showInBuilder' => $v->show_in_builder,
            'rateCard' => $v->rate_card ?? [],
            'trips' => $v->trips_count,
            'avgDays' => $v->avg_days,
        ];
    }

    /** Add a vehicle from the wizard. With dummy data nothing is written. */
    public function store(SaveVehicleRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $vehicle = VehicleType::query()->create($this->columns($request) + [
            'key' => $this->uniqueKey((string) $request->input('name')),
            'popularity_rank' => (int) VehicleType::query()->max('popularity_rank') + 1,
        ]);

        return response()->json(['success' => true, 'data' => ['id' => $vehicle->id]], 201);
    }

    /** Save the vehicle the wizard was opened on (the id is a string: with dummy data it can be one the page made this session). */
    public function save(SaveVehicleRequest $request, string $vehicleType): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $vehicle = VehicleType::query()->findOrFail((int) $vehicleType);
        $vehicle->update($this->columns($request));

        return response()->json(['success' => true, 'data' => ['id' => $vehicle->id]]);
    }

    /** The wizard's values in the table's columns. Without a base rate the customer arranges the vehicle. */
    private function columns(SaveVehicleRequest $r): array
    {
        $category = $r->input('category', 'car');

        return DataUrlImage::into([
            'name' => $r->input('name'), 'category' => $category, 'icon' => $category === 'other' ? 'car' : $category,
            'seats' => $r->input('seats'), 'ac' => $r->boolean('ac'), 'active' => $r->boolean('active', true),
            'most_popular' => $r->boolean('mostPopular'), 'show_in_builder' => $r->boolean('showInBuilder', true),
            'description' => $r->input('description'), 'rate_unit' => $r->input('rateUnit', 'per_day'),
            'base_rate' => $r->filled('baseRate') ? (float) $r->input('baseRate') : null,
            'rate_card' => array_values(array_map(fn (array $row) => [
                'label' => $row['label'], 'note' => $row['note'] ?? null, 'amount' => (float) $row['amount'], 'unit' => $row['unit'] ?? 'day',
            ], $r->input('rateCard', []))),
            'overview' => $r->input('overview'),
            'highlights' => array_values($r->input('highlights', [])),
            'inclusions' => array_values($r->input('inclusions', [])),
            'exclusions' => array_values($r->input('exclusions', [])),
        ], $r, 'vehicles');
    }

    private function uniqueKey(string $name): string
    {
        $base = Str::snake(Str::slug($name, '_')) ?: 'vehicle';
        $key = $base;
        for ($n = 2; VehicleType::query()->where('key', $key)->exists(); $n++) {
            $key = $base.'_'.$n;
        }

        return $key;
    }
}

<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\TourPackage;
use Illuminate\Http\JsonResponse;

/** Tour Packages page: the list carries what a row shows; the detail adds the day-wise itinerary (in the itinerary builder shape) and the inquiries. */
class TourPackageController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = TourPackage::query()->with('destination:id,name')->orderBy('id')->get();

        return response()->json(['success' => true, 'data' => $rows->map(fn (TourPackage $p) => $this->row($p))->values()]);
    }

    public function show(TourPackage $tourPackage): JsonResponse
    {
        $tourPackage->load('destination', 'packageDays');
        $inquiries = $tourPackage->destination
            ? $tourPackage->destination->mentioning(Inquiry::query(), 'trip')->latest('created_at')->limit(20)->get(['id', 'customer_name', 'trip', 'status', 'travel_date', 'pax'])
            : collect();

        return response()->json(['success' => true, 'data' => $this->row($tourPackage) + [
            'description' => $tourPackage->description,
            'priceTiers' => $tourPackage->price_tiers ?? [],
            'inclusions' => $tourPackage->inclusions ?? [],
            'exclusions' => $tourPackage->exclusions ?? [],
            'itinerary' => $tourPackage->packageDays->map->toBuilderDay()->values(),
            'inquiries' => $inquiries->map(fn ($i) => [
                'id' => $i->id, 'name' => $i->customer_name ?: 'Unnamed lead', 'trip' => $i->trip, 'status' => $i->status, 'travelDate' => $i->travel_date?->toDateString(), 'pax' => $i->pax,
            ])->values(),
        ]]);
    }

    private function row(TourPackage $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'destinationId' => $p->destination_id,
            'destination' => $p->destination?->name,
            'tag' => $p->tag,
            'status' => $p->status,
            'seasonal' => $p->seasonal,
            'days' => $p->days,
            'nights' => $p->nights,
            'price' => $p->price_from,
            'bookings' => $p->bookings_count,
        ];
    }
}

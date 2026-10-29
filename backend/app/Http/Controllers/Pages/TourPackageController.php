<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveTourPackageRequest;
use App\Models\Inquiry;
use App\Models\TourPackage;
use App\Support\DummyData;
use App\Support\DataUrlImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Tour Packages page: the list carries what a row shows; the detail adds the day-wise itinerary (in the itinerary builder shape) and the inquiries. */
class TourPackageController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('tour-packages')]);
        }

        if (! Schema::hasTable('tour_packages')) { // migrations not run on this database yet: an empty list, not a server error
            return response()->json(['success' => true, 'data' => []]);
        }

        $rows = TourPackage::query()->with('destination:id,name')->orderBy('id')->get();

        return response()->json(['success' => true, 'data' => $rows->map(fn (TourPackage $p) => $this->row($p))->values()]);
    }

    public function show(int $id): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::detail('tour-packages', $id) ?? abort(404)]);
        }

        return response()->json(['success' => true, 'data' => $this->detail(TourPackage::query()->findOrFail($id))]);
    }

    /** Add a package from the wizard. With dummy data on nothing is written: the record is returned for the page to keep in memory. */
    public function store(SaveTourPackageRequest $request): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null], 201);
        }

        $package = DB::transaction(function () use ($request) {
            $package = TourPackage::create($this->columns($request));
            $this->saveDays($package, $request->input('itinerary', []));

            return $package;
        });

        return response()->json(['success' => true, 'data' => $this->detail($package)], 201);
    }

    /** The id is a number on the real tables; with dummy data it can be an id the wizard made this session ("new-..."), kept in memory. */
    public function update(SaveTourPackageRequest $request, string $tourPackage): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'dummy' => true, 'data' => null]);
        }

        $package = TourPackage::query()->findOrFail((int) $tourPackage);
        $columns = $this->columns($request);
        // the rate tiers and the itinerary are rebuilt only when the wizard changed them (an existing package may have richer ones than the wizard edits)
        $group = collect($package->price_tiers ?? [])->firstWhere('label', 'Group')['price'] ?? 0;
        if ((float) $package->price_from === (float) ($columns['price_from'] ?? 0) && (float) $group === (float) $request->input('groupPrice', 0)) {
            unset($columns['price_tiers']);
        }
        DB::transaction(function () use ($request, $package, $columns) {
            $package->update($columns);
            if ($request->boolean('itineraryChanged')) {
                $package->packageDays()->delete();
                $this->saveDays($package, $request->input('itinerary', []));
            }
        });

        return response()->json(['success' => true, 'data' => $this->detail($package->refresh())]);
    }

    /** The request in the table's columns. "Seasonal" is a status in the wizard: it is stored as published + the seasonal flag. */
    private function columns(SaveTourPackageRequest $r): array
    {
        $status = $r->input('status', 'draft');
        $days = (int) $r->input('days', 1);

        return DataUrlImage::into([
            'name' => $r->input('name'),
            'destination_id' => $r->input('destinationId'),
            'tag' => $r->input('tag', 'tour'),
            'status' => $status === 'seasonal' ? 'published' : $status,
            'seasonal' => $status === 'seasonal',
            'season' => $r->input('season'),
            'days' => $days,
            'nights' => (int) $r->input('nights', max(0, $days - 1)),
            'min_pax' => $r->input('minPax'),
            'price_from' => $r->input('price'),
            'price_tiers' => $this->tiers($r),
            'inclusions' => array_values($r->input('inclusions', [])),
            'exclusions' => array_values($r->input('exclusions', [])),
            'highlights' => array_values($r->input('highlights', [])),
        ], $r, 'tour-packages');
    }

    private function tiers(SaveTourPackageRequest $r): array
    {
        return array_values(array_filter([
            $r->filled('price') ? ['label' => 'Per person', 'note' => 'Starting price', 'price' => (float) $r->input('price')] : null,
            $r->filled('groupPrice') ? ['label' => 'Group', 'note' => 'Per person, for groups', 'price' => (float) $r->input('groupPrice')] : null,
        ]));
    }

    /** Each wizard day becomes a day in the itinerary builder's shape: the description is one note event. */
    private function saveDays(TourPackage $package, array $days): void
    {
        foreach (array_values($days) as $i => $day) {
            $n = $i + 1;
            $items = filled($day['description'] ?? null) ? [[
                'id' => "PKG{$package->id}-D{$n}-1", 'type' => 'note', 'icon' => 'note', 'title' => $day['title'], 'subtitle' => $day['description'],
                'details' => ['b' => ['role' => 'note', 'title' => $day['title'], 'note' => $day['description']]],
            ]] : [];
            $package->packageDays()->create(['day_number' => $n, 'title' => $day['title'], 'location' => null, 'location_mode' => 'same', 'items' => $items]);
        }
    }

    /** The detail record without touching the database (dummy mode): what show() would return for the saved values. */
    private function fromRequest(SaveTourPackageRequest $r, string $id): array
    {
        $c = $this->columns($r);

        return [
            'memory' => true, 'id' => $id, 'name' => $c['name'], 'destinationId' => $c['destination_id'], 'destination' => $r->input('destination'),
            'tag' => $c['tag'], 'status' => $c['status'], 'seasonal' => $c['seasonal'], 'season' => $c['season'], 'days' => $c['days'], 'nights' => $c['nights'],
            'price' => $c['price_from'], 'bookings' => 0, 'description' => null, 'minPax' => $c['min_pax'], 'priceTiers' => $c['price_tiers'],
            'inclusions' => $c['inclusions'], 'exclusions' => $c['exclusions'], 'highlights' => $c['highlights'],
            'itinerary' => collect($r->input('itinerary', []))->values()->map(fn ($d, $i) => [
                'day' => 'Day '.($i + 1), 'date' => 'TBD', 'isoDate' => null, 'title' => $d['title'], 'location' => null, 'locationMode' => 'same',
                'items' => filled($d['description'] ?? null) ? [['id' => 'new-D'.($i + 1), 'type' => 'note', 'icon' => 'note', 'title' => $d['title'], 'subtitle' => $d['description'], 'details' => ['b' => ['role' => 'note']]]] : [],
            ])->all(),
            'inquiries' => [],
        ];
    }

    private function detail(TourPackage $tourPackage): array
    {
        $tourPackage->load('destination', 'packageDays');
        $inquiries = $tourPackage->destination
            ? $tourPackage->destination->mentioning(Inquiry::query(), 'trip')->latest('created_at')->limit(20)->get(['id', 'customer_name', 'trip', 'status', 'travel_date', 'pax'])
            : collect();

        return $this->row($tourPackage) + [
            'description' => $tourPackage->description,
            'minPax' => $tourPackage->min_pax,
            'priceTiers' => $tourPackage->price_tiers ?? [],
            'inclusions' => $tourPackage->inclusions ?? [],
            'exclusions' => $tourPackage->exclusions ?? [],
            'highlights' => $tourPackage->highlights ?? [],
            'itinerary' => $tourPackage->packageDays->map->toBuilderDay()->values(),
            'inquiries' => $inquiries->map(fn ($i) => [
                'id' => $i->id, 'name' => $i->customer_name ?: 'Unnamed lead', 'trip' => $i->trip, 'status' => $i->status, 'travelDate' => $i->travel_date?->toDateString(), 'pax' => $i->pax,
            ])->values(),
        ];
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
            'season' => $p->season,
            'image' => DataUrlImage::url($p->image),
            'days' => $p->days,
            'nights' => $p->nights,
            'price' => $p->price_from,
            'bookings' => $p->bookings_count,
        ];
    }
}

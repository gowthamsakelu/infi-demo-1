<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\SavedActivity;
use App\Models\SavedHotel;
use App\Support\DummyData;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Destinations page. The list carries the numbers every row needs (counted for all destinations in a few queries, not one per row);
 * the detail loads the linked packages, stays, activities and inquiries of the one destination that is open.
 */
class DestinationController extends Controller
{
    public function index(): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::list('destinations')]);
        }

        return response()->json(['success' => true, 'data' => Cache::remember('pages.destinations.index', 60, fn () => $this->listRows())]);
    }

    /** The list rows: the numbers every row needs, counted for all destinations in a few queries. */
    private function listRows(): array
    {
        $destinations = Destination::query()->orderBy('id')->get();
        $year = now()->year;
        $inquiries = Inquiry::query()->whereYear('created_at', $year)->pluck('trip');
        $packages = Schema::hasTable('tour_packages')
            ? DB::table('tour_packages')->selectRaw('destination_id, count(*) as n')->groupBy('destination_id')->pluck('n', 'destination_id')
            : collect();

        return $destinations->map(fn (Destination $d) => [
            'id' => $d->id,
            'slug' => $d->slug,
            'name' => $d->name,
            'region' => $d->region,
            'status' => $d->status,
            'popular' => $d->popular,
            'image' => $d->image ? '/images/'.$d->image : null,
            'packages' => (int) ($packages[$d->id] ?? 0),
            'inquiries' => $this->mentions($d, $inquiries),
        ])->values()->all();
    }

    public function show(int $id): JsonResponse
    {
        if (DummyData::on()) {
            return response()->json(['success' => true, 'data' => DummyData::detail('destinations', $id) ?? abort(404)]);
        }

        $destination = Destination::query()->findOrFail($id);
        $year = now()->year;
        $inquiryQuery = fn () => $destination->mentioning(Inquiry::query(), 'trip');
        $thisYear = $inquiryQuery()->whereYear('created_at', $year);
        $bookings = $destination->mentioning(Booking::query(), 'destination')->whereYear('created_at', $year);
        $city = fn ($q, string $col) => $destination->mentioning($q, $col);

        $packages = Schema::hasTable('tour_packages')
            ? DB::table('tour_packages')->where('destination_id', $destination->id)->orderBy('id')->limit(20)->get()->map(fn ($p) => [
                'id' => $p->id, 'name' => $p->name, 'days' => $p->days ?? null, 'nights' => $p->nights ?? null, 'price' => $p->price_from ?? null,
            ])
            : collect();

        $leadSource = (clone $thisYear)->whereNotNull('lead_source')->select('lead_source', DB::raw('count(*) as n'))->groupBy('lead_source')->orderByDesc('n')->value('lead_source');
        $peak = (clone $thisYear)->whereNotNull('travel_date')->pluck('travel_date')->map(fn ($d) => $d->format('F'))->countBy()->sortDesc()->keys()->first();

        return response()->json(['success' => true, 'data' => [
            'id' => $destination->id,
            'name' => $destination->name,
            'region' => $destination->region,
            'status' => $destination->status,
            'description' => $destination->description,
            'about' => [
                'bestSeason' => $destination->best_season,
                'averageTrip' => $destination->avg_days ? "{$destination->avg_days} days / {$destination->avg_nights} nights" : null,
                'idealDuration' => $destination->ideal_duration,
                'nearestAirport' => $destination->nearest_airport,
                'topLeadSource' => $leadSource,
                'peakMonth' => $peak,
            ],
            'year' => $year,
            'stats' => [
                'packages' => $packages->count(),
                'inquiries' => (clone $thisYear)->count(),
                'bookings' => (clone $bookings)->count(),
                'revenue' => (int) (clone $bookings)->sum('raw_price'),
            ],
            'packages' => $packages->values(),
            'stays' => $city(SavedHotel::query(), 'city')->orderByDesc('last_used_at')->limit(20)->get()->map->toApi()->values(),
            'activities' => $city(SavedActivity::query(), 'city')->orderByDesc('last_used_at')->limit(20)->get()->map->toApi()->values(),
            'inquiries' => $inquiryQuery()->latest('created_at')->limit(20)->get(['id', 'customer_name', 'trip', 'status', 'travel_date', 'pax'])->map(fn ($i) => [
                'id' => $i->id, 'name' => $i->customer_name ?: 'Unnamed lead', 'trip' => $i->trip, 'status' => $i->status, 'travelDate' => $i->travel_date?->toDateString(), 'pax' => $i->pax,
            ])->values(),
        ]]);
    }

    /** How many of the given free-text rows mention the destination (its name or any keyword, any case). */
    private function mentions(Destination $d, Collection $texts): int
    {
        $terms = array_map('mb_strtolower', $d->terms());

        return $texts->filter(function ($text) use ($terms) {
            $haystack = mb_strtolower((string) $text);
            foreach ($terms as $term) {
                if ($term !== '' && str_contains($haystack, $term)) {
                    return true;
                }
            }

            return false;
        })->count();
    }
}

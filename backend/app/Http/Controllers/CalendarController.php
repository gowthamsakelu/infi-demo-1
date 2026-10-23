<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    private const MAX_DAYS = 70;

    /** Booking type -> calendar category. */
    private const TYPE_CATEGORY = ['TOUR' => 'tours', 'VILLA' => 'hotel', 'RESORT' => 'hotel', 'ACTIVITY' => 'activities', 'TRANSPORT' => 'transport'];

    /** Itinerary event type -> calendar category (current and older icon-style keys). */
    private const ITEM_CATEGORY = [
        'sightseeing' => 'tours', 'camera' => 'tours', 'food' => 'tours', 'restaurant' => 'tours',
        'activity' => 'activities', 'raft' => 'activities',
        'hotel' => 'hotel', 'bed' => 'hotel',
        'transport' => 'transport', 'bus' => 'transport',
    ];

    /**
     * Everything happening between `from` and `to` (inclusive): the start and end of each booking's trip, plus its
     * itinerary events on their own days. One query: the itinerary and customer are columns of the booking row.
     */
    public function events(Request $request): JsonResponse
    {
        $v = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
            'category' => ['nullable', 'in:tours,activities,hotel,transport'],
        ]);
        $from = CarbonImmutable::parse($v['from'])->startOfDay();
        $to = CarbonImmutable::parse($v['to'])->startOfDay();
        abort_if($from->diffInDays($to) >= self::MAX_DAYS, 422, 'The range is too long.');

        $bookings = Booking::query()
            ->select('id', 'title', 'type', 'pax', 'status', 'destination', 'customer', 'guests', 'itinerary_days', 'start_date', 'end_date')
            ->whereDate('start_date', '<=', $to->toDateString())
            ->whereDate('end_date', '>=', $from->toDateString())
            ->get();

        $events = [];
        foreach ($bookings as $booking) {
            foreach ($this->eventsFor($booking, $from, $to) as $event) {
                if (empty($v['category']) || $event['category'] === $v['category']) {
                    $events[] = $event;
                }
            }
        }
        usort($events, fn ($a, $b) => [$a['date'], $a['sortTime'] ?? 1440, $a['title']] <=> [$b['date'], $b['sortTime'] ?? 1440, $b['title']]);

        return response()->json(['data' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'events' => $events]]);
    }

    private function eventsFor(Booking $b, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $start = CarbonImmutable::parse($b->start_date)->startOfDay();
        $end = CarbonImmutable::parse($b->end_date)->startOfDay();
        $category = self::TYPE_CATEGORY[$b->type] ?? 'tours';
        $stay = $category === 'hotel';
        $where = $b->destination ?: ($b->customer['location'] ?? '');
        $guest = $b->customer['name'] ?? ($b->guests[0]['name'] ?? '');
        $phone = $b->customer['phone'] ?? ($b->guests[0]['phone'] ?? '');
        $pax = "{$b->pax} pax";

        $make = fn (string $kind, string $suffix, CarbonImmutable $date, string $title, string $sub, string $cat, ?string $time) => [
            'id' => "{$b->id}:{$kind}:{$date->toDateString()}:{$suffix}",
            'bookingId' => $b->id,
            'kind' => $kind,
            'title' => $title,
            'subtitle' => $sub,
            'date' => $date->toDateString(),
            'time' => $time ? $this->clock($time) : null,
            'sortTime' => $time ? $this->minutes($time) : null,
            'category' => $cat,
            'status' => $b->status,
            'customer' => $guest,
            'phone' => $phone,
            'destination' => $b->destination,
        ];
        $out = [];

        if ($start->betweenIncluded($from, $to)) {
            $out[] = $make('start', '0', $start, $b->title, $stay ? "Check-in • $pax" : trim("$where • $pax", ' •'), $category, null);
        }
        if (!$end->equalTo($start) && $end->betweenIncluded($from, $to)) {
            $out[] = $make('end', '0', $end, $stay ? "Check-out: {$b->title}" : "Trip ends: {$b->title}", trim("$where • $pax", ' •'), $category, null);
        }
        foreach ($b->itinerary_days ?? [] as $i => $day) {
            $date = $start->addDays($i);
            if ($date->lessThan($from) || $date->greaterThan($to)) {
                continue;
            }
            foreach ($day['items'] ?? [] as $j => $item) {
                $sub = trim((string) ($item['subtitle'] ?? ''));
                $time = preg_match('/^\d{1,2}:\d{2}\s*[AP]M/i', $sub, $m) ? $m[0] : null;
                $rest = $time ? trim(preg_replace('/^\d{1,2}:\d{2}\s*[AP]M\s*[•\-–]?\s*/iu', '', $sub)) : $sub;
                $out[] = $make('item', "$i-$j", $date, (string) ($item['title'] ?? 'Event'), trim(($rest ?: $b->title)." • $pax", ' •'), self::ITEM_CATEGORY[$item['type'] ?? ''] ?? $category, $time);
            }
        }

        return $out;
    }

    private function parseTime(string $time): ?CarbonImmutable
    {
        $clean = strtoupper(preg_replace('/\s+/', ' ', trim($time)));
        $clean = preg_replace('/(\d)([AP]M)$/', '$1 $2', $clean);

        return CarbonImmutable::createFromFormat('g:i A', $clean) ?: null;
    }

    private function minutes(string $time): int
    {
        $t = $this->parseTime($time);

        return $t ? $t->hour * 60 + $t->minute : 0;
    }

    private function clock(string $time): string
    {
        return $this->parseTime($time)?->format('h:i A') ?? $time;
    }
}

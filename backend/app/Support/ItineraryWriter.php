<?php

namespace App\Support;

use App\Models\Itinerary;
use App\Models\ItineraryDay;
use App\Models\ItineraryItem;
use App\Models\Staff;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Saves the itinerary the UI works with (a list of days, each with events) into the itinerary tables,
 * in one transaction. Older event types and icon names are mapped onto the five current types.
 */
class ItineraryWriter
{
    public const TYPES = ['stay', 'transport', 'activity', 'meal', 'note'];

    /** Every event type the UI has ever sent -> [stored type, icon]. */
    private const TYPE_MAP = [
        'stay' => ['stay', 'bed'], 'hotel' => ['stay', 'bed'], 'bed' => ['stay', 'bed'],
        'transport' => ['transport', 'bus'], 'bus' => ['transport', 'bus'],
        'meal' => ['meal', 'restaurant'], 'food' => ['meal', 'restaurant'], 'restaurant' => ['meal', 'restaurant'],
        'activity' => ['activity', 'raft'], 'raft' => ['activity', 'raft'],
        'sightseeing' => ['activity', 'camera'], 'camera' => ['activity', 'camera'],
        'note' => ['note', 'note'],
    ];

    /** Every event type name the API accepts (the five current ones and the older names). */
    public static function knownTypes(): array
    {
        return array_keys(self::TYPE_MAP);
    }

    /** Keys stored in their own columns; anything else an event carries goes into `details`. */
    private const COLUMN_KEYS = ['id', 'type', 'icon', 'title', 'subtitle', 'time', 'endTime', 'location', 'inclusion', 'mealPlan', 'details', 'visibleToCustomer', 'assigned', 'completed',
        'price', 'quantity', 'totalPrice', 'priceOverridden', 'currency', 'vehicleTypeId', 'placeId', 'assignedStaffId'];

    /**
     * @param  string  $type  booking | inquiry
     * @param  array|null  $meta  origin, destination, stops, startDate, endDate (null leaves the saved route as it is)
     */
    public static function write(string $type, string $id, array $days, ?array $meta = null, ?CarbonImmutable $tripStart = null): Itinerary
    {
        return DB::transaction(function () use ($type, $id, $days, $meta, $tripStart) {
            $itinerary = Itinerary::firstOrCreate(['itineraryable_type' => $type, 'itineraryable_id' => $id]);

            if ($meta !== null) {
                $itinerary->fill([
                    'show_prices_to_customer' => (bool) ($meta['showPrices'] ?? $itinerary->show_prices_to_customer),
                    'origin' => $meta['origin'] ?? null,
                    'destination' => $meta['destination'] ?? null,
                    'stops' => array_values($meta['stops'] ?? []),
                    'start_date' => $meta['startDate'] ?? null,
                    'end_date' => $meta['endDate'] ?? null,
                ])->save();
            }
            $start = $itinerary->start_date ? CarbonImmutable::parse($itinerary->start_date) : $tripStart;

            $staffIds = Staff::pluck('id')->flip(); // one query for the whole save, not one per event
            $itinerary->days()->delete(); // items go with their day
            foreach (array_values($days) as $i => $day) {
                $row = $itinerary->days()->create([
                    'day_number' => $i + 1,
                    'date' => self::dayDate($day, $i, $start),
                    'title' => ($day['title'] ?? null) ?: null,
                    'location' => ($day['location'] ?? null) ?: null,
                    'location_mode' => ($day['locationMode'] ?? 'same') === 'transit' ? 'transit' : 'same',
                ]);
                foreach (array_values($day['items'] ?? []) as $j => $item) {
                    self::item($row, $j, $item, $staffIds);
                }
            }
            $itinerary->touch();

            return $itinerary;
        });
    }

    private static function dayDate(array $day, int $index, ?CarbonImmutable $start): ?string
    {
        if (!empty($day['isoDate']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $day['isoDate'])) {
            return $day['isoDate'];
        }

        return $start?->addDays($index)->toDateString();
    }

    /** What an event costs: the price per unit times the quantity, unless staff typed a total of their own. */
    public static function total(?float $price, int $quantity, ?float $typedTotal = null): ?float
    {
        if ($typedTotal !== null) {
            return round($typedTotal, 2);
        }

        return $price === null ? null : round($price * max(1, $quantity), 2);
    }

    private static function number(mixed $v): ?float
    {
        return is_numeric($v) ? (float) $v : null;
    }

    private static function item(ItineraryDay $day, int $position, array $item, \Illuminate\Support\Collection $staffIds): ItineraryItem
    {
        [$type, $defaultIcon] = self::TYPE_MAP[$item['type'] ?? 'activity'] ?? self::TYPE_MAP['activity'];
        $subtitle = trim((string) ($item['subtitle'] ?? ''));
        $time = $item['time'] ?? (preg_match('/^\d{1,2}:\d{2}\s*[AP]M/i', $subtitle, $m) ? $m[0] : null);
        $inclusion = in_array($item['inclusion'] ?? 'included', ['included', 'not_included', 'paid_extra'], true) ? ($item['inclusion'] ?? 'included') : 'included';

        $price = self::number($item['price'] ?? null);
        $quantity = max(1, (int) ($item['quantity'] ?? 1));
        $staffId = $item['assignedStaffId'] ?? null;

        return $day->items()->create([
            'uid' => (string) ($item['id'] ?? uniqid('IT-', true)),
            'position' => $position,
            'type' => $type,
            'icon' => $item['icon'] ?? $defaultIcon,
            'title' => (string) ($item['title'] ?? 'Event'),
            'subtitle' => $subtitle !== '' ? $subtitle : null,
            'start_time' => $time,
            'end_time' => $item['endTime'] ?? null,
            'location' => $item['location'] ?? null,
            'inclusion' => $inclusion,
            'meal_plan' => $item['mealPlan'] ?? null,
            // `details` is kept as the UI sent it; any other key the UI uses travels along under `_extra`.
            'details' => array_filter(['details' => $item['details'] ?? null, '_extra' => array_diff_key($item, array_flip(self::COLUMN_KEYS)) ?: null]) ?: null,
            'visible_to_customer' => (bool) ($item['visibleToCustomer'] ?? true),
            'assigned_to' => $item['assigned'] ?? null,
            'completed' => (bool) ($item['completed'] ?? false),
            'price' => $price,
            'quantity' => $quantity,
            'total_price' => self::total($price, $quantity, self::number($item['totalPrice'] ?? null)),
            'price_overridden' => (bool) ($item['priceOverridden'] ?? false),
            'currency' => strtoupper((string) ($item['currency'] ?? 'INR')),
            'vehicle_type_id' => $item['vehicleTypeId'] ?? null,
            'place_id' => $item['placeId'] ?? null,
            'assigned_staff_id' => $staffId !== null && $staffIds->has($staffId) ? $staffId : null,
        ]);
    }
}

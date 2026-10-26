<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItineraryItem extends Model
{
    protected $fillable = [
        'itinerary_day_id', 'uid', 'position', 'type', 'icon', 'title', 'subtitle', 'start_time', 'end_time', 'location',
        'inclusion', 'meal_plan', 'details', 'visible_to_customer', 'assigned_to', 'completed',
        'price', 'quantity', 'total_price', 'price_overridden', 'currency', 'vehicle_type_id', 'place_id', 'assigned_staff_id',
    ];

    protected $casts = ['details' => 'array', 'assigned_to' => 'array', 'visible_to_customer' => 'boolean', 'completed' => 'boolean',
        'price' => 'float', 'total_price' => 'float', 'quantity' => 'integer', 'price_overridden' => 'boolean', 'vehicle_type_id' => 'integer'];

    /** Fields the builder keeps inside `details.b` that are prices, so they can be withheld from the customer. */
    public const PRICE_KEYS = ['price', 'totalPrice', 'priceOverridden', 'basePrice', 'currency'];

    public function day(): BelongsTo
    {
        return $this->belongsTo(ItineraryDay::class, 'itinerary_day_id');
    }

    /** One event in the shape the timeline and the builder use. */
    public function toTimeline(): array
    {
        return array_filter([
            'id' => $this->uid,
            'type' => $this->type,
            'icon' => $this->icon,
            'title' => $this->title,
            'subtitle' => $this->subtitle ?? '',
            'time' => $this->start_time,
            'endTime' => $this->end_time,
            'location' => $this->location,
            'inclusion' => $this->inclusion,
            'mealPlan' => $this->meal_plan,
            'visibleToCustomer' => $this->visible_to_customer,
            'assigned' => $this->assigned_to,
            'completed' => $this->completed,
            'details' => $this->details['details'] ?? null,
            'price' => $this->price,
            'quantity' => $this->price !== null ? $this->quantity : null,
            'totalPrice' => $this->total_price,
            'priceOverridden' => $this->price !== null ? $this->price_overridden : null,
            'currency' => $this->price !== null ? $this->currency : null,
            'vehicleTypeId' => $this->vehicle_type_id,
            'placeId' => $this->place_id,
            'assignedStaffId' => $this->assigned_staff_id,
        ] + ($this->details['_extra'] ?? []), fn ($v) => $v !== null) + ['assigned' => $this->assigned_to];
    }

    /** The event as the customer may see it: without any price unless the itinerary's "show prices" setting is on. */
    public function toCustomerTimeline(bool $showPrices): array
    {
        $row = $this->toTimeline();
        if ($showPrices) {
            return $row;
        }
        unset($row['price'], $row['quantity'], $row['totalPrice'], $row['priceOverridden'], $row['currency']);
        if (isset($row['details']['b'])) {
            $row['details']['b'] = array_diff_key($row['details']['b'], array_flip(self::PRICE_KEYS));
        }

        return $row;
    }
}

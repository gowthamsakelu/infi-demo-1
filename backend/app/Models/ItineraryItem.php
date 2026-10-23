<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItineraryItem extends Model
{
    protected $fillable = [
        'itinerary_day_id', 'uid', 'position', 'type', 'icon', 'title', 'subtitle', 'start_time', 'end_time', 'location',
        'inclusion', 'meal_plan', 'details', 'visible_to_customer', 'assigned_to', 'completed',
    ];

    protected $casts = ['details' => 'array', 'assigned_to' => 'array', 'visible_to_customer' => 'boolean', 'completed' => 'boolean'];

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
        ] + ($this->details['_extra'] ?? []), fn ($v) => $v !== null) + ['assigned' => $this->assigned_to];
    }
}

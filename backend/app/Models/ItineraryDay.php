<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItineraryDay extends Model
{
    protected $fillable = ['itinerary_id', 'day_number', 'date', 'title', 'location', 'location_mode'];

    protected $casts = ['date' => 'date:Y-m-d'];

    public function itinerary(): BelongsTo
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ItineraryItem::class)->orderBy('position');
    }

    /** One day in the shape the Day-wise Schedule timeline uses. */
    public function toTimeline(): array
    {
        return [
            'day' => "Day {$this->day_number}",
            'date' => $this->date ? $this->date->format('j M') : 'TBD',
            'isoDate' => $this->date?->toDateString(),
            'title' => $this->title,
            'location' => $this->location,
            'locationMode' => $this->location_mode,
            'items' => $this->items->map->toTimeline()->all(),
        ];
    }
}

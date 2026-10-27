<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One day of a package, stored as the itinerary builder saves a day so it can prefill the builder as it is. */
class PackageDay extends Model
{
    protected $fillable = ['tour_package_id', 'day_number', 'title', 'location', 'location_mode', 'items'];

    protected $casts = ['items' => 'array', 'day_number' => 'integer'];

    public function tourPackage(): BelongsTo
    {
        return $this->belongsTo(TourPackage::class);
    }

    /** The day in the builder's saved shape (what `daysOf(parent)` and PUT /api/{kind}/{id}/itinerary use). */
    public function toBuilderDay(): array
    {
        return [
            'day' => 'Day '.$this->day_number,
            'date' => 'TBD',
            'isoDate' => null,
            'title' => $this->title,
            'location' => $this->location,
            'locationMode' => $this->location_mode,
            'items' => $this->items ?? [],
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Itinerary extends Model
{
    protected $fillable = ['itineraryable_type', 'itineraryable_id', 'origin', 'destination', 'stops', 'start_date', 'end_date', 'show_prices_to_customer'];

    protected $casts = ['stops' => 'array', 'start_date' => 'date:Y-m-d', 'end_date' => 'date:Y-m-d', 'show_prices_to_customer' => 'boolean'];

    public function days(): HasMany
    {
        return $this->hasMany(ItineraryDay::class)->orderBy('day_number');
    }

    /** The route and dates the builder works with. */
    public function meta(): array
    {
        return [
            'origin' => $this->origin,
            'destination' => $this->destination,
            'stops' => $this->stops ?? [],
            'startDate' => $this->start_date?->toDateString(),
            'endDate' => $this->end_date?->toDateString(),
            'showPrices' => (bool) $this->show_prices_to_customer,
        ];
    }
}

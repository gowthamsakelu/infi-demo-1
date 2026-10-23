<?php

namespace App\Models;

use App\Models\Concerns\HasItinerary;
use App\Support\TripDates;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasItinerary;

    protected $table = 'bookings';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'type',
        'type_class',
        'image',
        'pax',
        'duration',
        'dates',
        'travel_date_full',
        'status',
        'status_class',
        'price',
        'raw_price',
        'category',
        'destination',
        'booking_type',
        'services',
        'assigned_status',
        'notes',
        'customer',
        'assigned_to',
        'special_requirements',
        'guests',
        'itinerary_days',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'customer' => 'array',
        'assigned_to' => 'array',
        'special_requirements' => 'array',
        'guests' => 'array',
        'raw_price' => 'integer',
        'pax' => 'integer',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function itineraryKind(): string
    {
        return 'booking';
    }

    public function itineraryTripStart(): ?CarbonImmutable
    {
        return $this->start_date ? CarbonImmutable::parse($this->start_date) : null;
    }

    protected static function booted(): void
    {
        // Keep the indexed trip dates in step with the travel dates text (the calendar queries them).
        static::saving(function (self $booking) {
            if ($booking->isDirty('travel_date_full') || !$booking->start_date) {
                $dates = TripDates::parse($booking->travel_date_full);
                $booking->start_date = $dates[0] ?? null;
                $booking->end_date = $dates[1] ?? null;
            }
        });
    }
}

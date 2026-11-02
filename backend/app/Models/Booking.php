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

    protected $appends = [
        'typeClass',
        'statusClass',
        'travelDateFull',
        'rawPrice',
        'assignedStatus',
        'assignedTo',
        'specialRequirements',
        'itineraryDays',
        'guest',
    ];

    public function getTypeClassAttribute(): ?string
    {
        return $this->attributes['type_class'] ?? null;
    }

    public function getStatusClassAttribute(): ?string
    {
        return $this->attributes['status_class'] ?? null;
    }

    public function getTravelDateFullAttribute(): ?string
    {
        return $this->attributes['travel_date_full'] ?? null;
    }

    public function getRawPriceAttribute(): int
    {
        return (int) ($this->attributes['raw_price'] ?? 0);
    }

    public function getAssignedStatusAttribute(): ?string
    {
        return $this->attributes['assigned_status'] ?? null;
    }

    public function getAssignedToAttribute(): ?array
    {
        $val = $this->attributes['assigned_to'] ?? null;
        return is_string($val) ? json_decode($val, true) : $val;
    }

    public function getSpecialRequirementsAttribute(): array
    {
        $val = $this->attributes['special_requirements'] ?? [];
        return is_string($val) ? (json_decode($val, true) ?: []) : ($val ?: []);
    }



    public function getGuestAttribute(): array
    {
        $guests = $this->guests ?? [];
        $primary = collect($guests)->firstWhere('isPrimary', true) ?? ($guests[0] ?? []);
        return [
            'name' => $primary['name'] ?? ($this->customer['name'] ?? 'Guest'),
            'phone' => $primary['phone'] ?? ($this->customer['phone'] ?? ''),
            'email' => $primary['email'] ?? ($this->customer['email'] ?? ''),
            'age' => $primary['age'] ?? 30,
            'isPrimary' => true,
        ];
    }

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

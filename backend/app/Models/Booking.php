<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
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
    ];

    protected $casts = [
        'customer' => 'array',
        'assigned_to' => 'array',
        'special_requirements' => 'array',
        'guests' => 'array',
        'itinerary_days' => 'array',
        'raw_price' => 'integer',
        'pax' => 'integer',
    ];
}

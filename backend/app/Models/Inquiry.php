<?php

namespace App\Models;

use App\Models\Concerns\HasItinerary;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inquiry extends Model
{
    use HasItinerary;

    public const STATUSES = ['new', 'ongoing', 'warm', 'hot'];

    protected $table = 'inquiries';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'location',
        'lead_source',
        'trip',
        'category',
        'pax',
        'nights',
        'travel_date',
        'status',
        'assigned_to_id',
        'assigned_to_name',
        'notes',
        'itinerary_days',
    ];

    protected $casts = [
        'pax' => 'integer',
        'nights' => 'integer',
        'travel_date' => 'date:Y-m-d',
    ];

    public function itineraryKind(): string
    {
        return 'inquiry';
    }

    public function itineraryTripStart(): ?CarbonImmutable
    {
        return $this->travel_date ? CarbonImmutable::parse($this->travel_date) : null;
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class)->latest('scheduled_at');
    }
}

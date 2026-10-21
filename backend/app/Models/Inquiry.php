<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inquiry extends Model
{
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
        'pax',
        'nights',
        'travel_date',
        'status',
        'assigned_to_id',
        'assigned_to_name',
        'notes',
    ];

    protected $casts = [
        'pax' => 'integer',
        'nights' => 'integer',
        'travel_date' => 'date:Y-m-d',
    ];

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class)->latest('scheduled_at');
    }
}

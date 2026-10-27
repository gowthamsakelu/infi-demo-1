<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourPackage extends Model
{
    use HasFactory;

    protected $fillable = ['destination_id', 'name', 'tag', 'status', 'seasonal', 'days', 'nights', 'price_from', 'description', 'price_tiers', 'inclusions', 'exclusions', 'bookings_count'];

    protected $casts = [
        'seasonal' => 'boolean', 'days' => 'integer', 'nights' => 'integer', 'price_from' => 'float', 'bookings_count' => 'integer',
        'price_tiers' => 'array', 'inclusions' => 'array', 'exclusions' => 'array',
    ];

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function packageDays(): HasMany
    {
        return $this->hasMany(PackageDay::class)->orderBy('day_number');
    }
}

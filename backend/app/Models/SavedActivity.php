<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** An activity used before; feeds "Recently used". `city` holds the place it happens in. */
class SavedActivity extends Model
{
    use HasFactory;

    protected $fillable = ['place_id', 'name', 'city', 'address', 'phone', 'meeting_point', 'uses', 'last_used_at',
        'tag', 'status', 'region', 'rating', 'reviews', 'duration_minutes', 'price_adult', 'price_child', 'price_group', 'group_size',
        'difficulty', 'best_time', 'min_age', 'partner', 'description', 'bookings_count', 'demo_key'];

    protected $casts = ['last_used_at' => 'datetime', 'rating' => 'float', 'price_adult' => 'float', 'price_child' => 'float', 'price_group' => 'float'];

    public function toApi(): array
    {
        return ['id' => $this->id, 'placeId' => $this->place_id, 'name' => $this->name, 'city' => $this->city, 'address' => $this->address, 'phone' => $this->phone, 'meetingPoint' => $this->meeting_point];
    }
}

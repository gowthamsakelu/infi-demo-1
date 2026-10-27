<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A hotel used before; feeds "Recently used". Only the place id, name, address and phone are kept from Google. */
class SavedHotel extends Model
{
    use HasFactory;

    protected $fillable = ['place_id', 'name', 'city', 'address', 'phone', 'uses', 'last_used_at',
        'tag', 'status', 'region', 'rating', 'reviews', 'rooms_count', 'price_from', 'email', 'description', 'amenities', 'bookings_count', 'revenue', 'demo_key'];

    protected $casts = ['last_used_at' => 'datetime', 'amenities' => 'array', 'rating' => 'float', 'price_from' => 'float', 'revenue' => 'float'];

    public function rooms(): HasMany
    {
        return $this->hasMany(StayRoom::class)->orderBy('sort')->orderBy('id');
    }

    public function toApi(): array
    {
        return ['id' => $this->id, 'placeId' => $this->place_id, 'name' => $this->name, 'city' => $this->city, 'address' => $this->address, 'phone' => $this->phone];
    }
}

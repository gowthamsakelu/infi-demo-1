<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A hotel used before; feeds "Recently used". Only the place id, name, address and phone are kept from Google. */
class SavedHotel extends Model
{
    protected $fillable = ['place_id', 'name', 'city', 'address', 'phone', 'uses', 'last_used_at'];

    protected $casts = ['last_used_at' => 'datetime'];

    public function toApi(): array
    {
        return ['id' => $this->id, 'placeId' => $this->place_id, 'name' => $this->name, 'city' => $this->city, 'address' => $this->address, 'phone' => $this->phone];
    }
}

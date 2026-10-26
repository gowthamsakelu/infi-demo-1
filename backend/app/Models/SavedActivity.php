<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** An activity used before; feeds "Recently used". `city` holds the place it happens in. */
class SavedActivity extends Model
{
    protected $fillable = ['place_id', 'name', 'city', 'address', 'phone', 'meeting_point', 'uses', 'last_used_at'];

    protected $casts = ['last_used_at' => 'datetime'];

    public function toApi(): array
    {
        return ['id' => $this->id, 'placeId' => $this->place_id, 'name' => $this->name, 'city' => $this->city, 'address' => $this->address, 'phone' => $this->phone, 'meetingPoint' => $this->meeting_point];
    }
}

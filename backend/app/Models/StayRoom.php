<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StayRoom extends Model
{
    use HasFactory;

    protected $fillable = ['saved_hotel_id', 'name', 'occupancy', 'rate_stay', 'rate_breakfast', 'rate_map', 'rate_all', 'sort'];

    protected $casts = ['rate_stay' => 'float', 'rate_breakfast' => 'float', 'rate_map' => 'float', 'rate_all' => 'float'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A vehicle (or ticketed mode) staff can pick on a transport event, with its default daily rate. */
class VehicleType extends Model
{
    protected $fillable = ['key', 'name', 'icon', 'seats', 'ac', 'category', 'base_rate', 'rate_unit', 'popularity_rank', 'active'];

    protected $casts = ['ac' => 'boolean', 'active' => 'boolean', 'base_rate' => 'float', 'seats' => 'integer', 'popularity_rank' => 'integer'];

    public function toApi(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'icon' => $this->icon,
            'seats' => $this->seats,
            'ac' => $this->ac,
            'category' => $this->category,
            'baseRate' => $this->base_rate,
            'rateUnit' => $this->rate_unit,
            'rank' => $this->popularity_rank,
        ];
    }
}

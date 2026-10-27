<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = ['slug', 'name', 'region', 'status', 'popular', 'keywords', 'best_season', 'avg_days', 'avg_nights', 'ideal_duration', 'nearest_airport', 'description', 'image'];

    protected $casts = ['popular' => 'boolean', 'keywords' => 'array', 'avg_days' => 'integer', 'avg_nights' => 'integer'];

    /** The words that mean this destination in free text: its name and its keywords. */
    public function terms(): array
    {
        return array_values(array_unique(array_filter([$this->name, ...($this->keywords ?? [])])));
    }

    /** Narrow a query on another table to rows whose text column mentions this destination (`trip` on inquiries, `destination` on bookings ...). */
    public function mentioning(Builder $query, string $column): Builder
    {
        return $query->where(function (Builder $q) use ($column) {
            foreach ($this->terms() as $term) {
                $q->orWhere($column, 'like', '%'.$term.'%');
            }
        });
    }
}

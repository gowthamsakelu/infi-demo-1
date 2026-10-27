<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'headline', 'cta', 'image', 'tone', 'placement', 'slot', 'position', 'is_active', 'starts_at', 'ends_at', 'clicks', 'leads', 'converted'];

    protected $casts = ['is_active' => 'boolean', 'starts_at' => 'date:Y-m-d', 'ends_at' => 'date:Y-m-d', 'slot' => 'integer', 'position' => 'integer'];

    /** draft = switched off; scheduled = on but not started yet; otherwise active. */
    public function state(): string
    {
        if (! $this->is_active) {
            return 'draft';
        }

        return $this->starts_at && $this->starts_at->isAfter(today()) ? 'scheduled' : 'active';
    }
}

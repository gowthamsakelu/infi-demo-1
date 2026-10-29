<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use HasFactory;

    public const STATUSES = ['published', 'draft', 'scheduled'];
    public const CATEGORIES = ['guide', 'itinerary', 'tips'];

    protected $fillable = ['title', 'slug', 'author', 'category', 'status', 'published_at', 'views', 'leads', 'converted', 'excerpt', 'content', 'cover'];

    protected $casts = ['published_at' => 'datetime', 'views' => 'integer', 'leads' => 'integer', 'converted' => 'integer'];
}

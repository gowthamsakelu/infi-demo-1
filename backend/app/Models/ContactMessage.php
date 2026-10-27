<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** A message from the website contact form (table `contact_messages`; not the `contacts` people table behind Contact). */
class ContactMessage extends Model
{
    use HasFactory;

    public const STATUSES = ['new', 'replied', 'converted', 'spam'];

    protected $fillable = [
        'name', 'email', 'phone', 'subject', 'message', 'source', 'destination', 'travel_start', 'travel_end', 'adults', 'children',
        'interests', 'existing_customer', 'status', 'read_at', 'assigned_to_name', 'inquiry_id',
    ];

    protected $casts = [
        'travel_start' => 'date:Y-m-d', 'travel_end' => 'date:Y-m-d', 'adults' => 'integer', 'children' => 'integer',
        'existing_customer' => 'boolean', 'read_at' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FollowUp extends Model
{
    public const TYPES = ['follow_up', 'called', 'cc', 'note'];
    public const CALL_OUTCOMES = ['Connected', 'No answer', 'Busy', 'Call back later', 'Wrong number'];

    protected $fillable = [
        'inquiry_id',
        'customer_phone',
        'customer_name',
        'type',
        'call_outcome',
        'scheduled_at',
        'comment',
        'created_by',
        'created_by_name',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public static function normalizePhone(?string $phone): string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        return strlen($digits) > 10 ? substr($digits, -10) : $digits;
    }
}

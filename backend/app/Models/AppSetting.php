<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/** One setting per row (key => JSON value). */
class AppSetting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['key', 'value'];
    protected $casts = ['value' => 'array'];

    /** Is the table there? A database that is behind on migrations has no app_settings: reading then gives the defaults, not a 500. */
    private static function ready(): bool
    {
        return Schema::hasTable((new static)->getTable());
    }

    public static function read(string $key, mixed $default = null): mixed
    {
        if (!static::ready()) {
            return $default;
        }

        return static::query()->whereKey($key)->first()?->value ?? $default;
    }

    public static function write(string $key, mixed $value): void
    {
        // Saving needs the table; say so plainly (503) instead of a database error. The real reason goes to the Laravel log.
        if (!static::ready()) {
            Log::error('app_settings table is missing: run php artisan migrate');
            abort(503, 'Settings cannot be saved yet.');
        }

        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}

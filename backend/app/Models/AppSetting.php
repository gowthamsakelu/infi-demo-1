<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One setting per row (key => JSON value). */
class AppSetting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['key', 'value'];
    protected $casts = ['value' => 'array'];

    public static function read(string $key, mixed $default = null): mixed
    {
        return static::query()->whereKey($key)->first()?->value ?? $default;
    }

    public static function write(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}

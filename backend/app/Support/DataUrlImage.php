<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/** Pictures for the catalog pages: the Add/Edit sheet sends a new one as a data URL (jpeg, png or webp, up to 5 MB) and it is saved under public/images/<dir>. */
class DataUrlImage
{
    public const MAX_BYTES = 5 * 1024 * 1024;

    /** The path under public/images (e.g. "destinations/3f2a.jpg"), or null when the value is not a picture we accept. */
    public static function store(?string $dataUrl, string $dir): ?string
    {
        if (! $dataUrl || ! preg_match('#^data:image/(png|jpe?g|webp);base64,#', $dataUrl, $m)) {
            return null;
        }
        $bytes = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);
        if ($bytes === false || strlen($bytes) > self::MAX_BYTES) {
            return null;
        }

        $ext = $m[1] === 'png' ? 'png' : ($m[1] === 'webp' ? 'webp' : 'jpg');
        $name = trim($dir, '/').'/'.Str::uuid().'.'.$ext;
        File::ensureDirectoryExists(dirname(public_path('images/'.$name)));
        File::put(public_path('images/'.$name), $bytes);

        return $name;
    }

    /** A stored path the sheet sent back (not a new picture): the path under public/images, or null when empty. */
    public static function path(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : preg_replace('#^/?images/#', '', $value);
    }

    /** The public URL of a stored picture for the lists and the detail, or null. */
    public static function url(?string $path): ?string
    {
        $path = self::path($path);

        return $path === null ? null : '/images/'.$path;
    }

    /** A picture field from the sheet: a new data URL is saved, a stored path is kept, an empty value clears it. */
    public static function column(?string $value, string $dir): ?string
    {
        if (! $value) {
            return null;
        }

        return self::store($value, $dir) ?? self::path($value);
    }

    /** Adds the picture column when the sheet sent one (a request without it keeps what is stored). */
    public static function into(array $columns, \Illuminate\Http\Request $r, string $dir): array
    {
        if ($r->exists('image')) {
            $columns['image'] = self::column($r->input('image'), $dir);
        }

        return $columns;
    }
}

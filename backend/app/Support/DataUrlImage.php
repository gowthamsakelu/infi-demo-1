<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/** A picture the wizard sends as a data URL (jpeg, png or webp, up to 3 MB), saved under public/images/<dir>. */
class DataUrlImage
{
    /** The path under public/images (e.g. "destinations/3f2a.jpg"), or null when the value is not a picture we accept. */
    public static function store(?string $dataUrl, string $dir): ?string
    {
        if (! $dataUrl || ! preg_match('#^data:image/(png|jpe?g|webp);base64,#', $dataUrl, $m)) {
            return null;
        }
        $bytes = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);
        if ($bytes === false || strlen($bytes) > 3 * 1024 * 1024) {
            return null;
        }

        $ext = $m[1] === 'jpeg' ? 'jpg' : ($m[1] === 'jpg' ? 'jpg' : $m[1]);
        $name = trim($dir, '/').'/'.Str::uuid().'.'.$ext;
        File::ensureDirectoryExists(dirname(public_path('images/'.$name)));
        File::put(public_path('images/'.$name), $bytes);

        return $name;
    }
}

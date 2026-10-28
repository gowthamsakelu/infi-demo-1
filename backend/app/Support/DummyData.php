<?php

namespace App\Support;

/**
 * Dummy data for the catalog pages (Destinations, Tour Packages, Transport, Stays, Adventures, Banners, Blogs, Settings).
 * One switch: USE_DUMMY_DATA (config('app.use_dummy_data'), default true). While it is on, those pages are served from the JSON files
 * in database/dummy (a snapshot of each endpoint's own response, so the shapes are exactly what the screens expect) and the database
 * is not read for them. Set USE_DUMMY_DATA=false and every page goes back to the real tables.
 */
class DummyData
{
    /** @var array<string, array> */
    private static array $files = [];

    public static function on(): bool
    {
        return (bool) config('app.use_dummy_data');
    }

    /** The whole file, decoded once per request. */
    public static function file(string $name): array
    {
        return self::$files[$name] ??= json_decode((string) file_get_contents(database_path("dummy/{$name}.json")), true) ?: [];
    }

    /** The list of a file that has { list, detail }. */
    public static function list(string $name): array
    {
        return self::file($name)['list'] ?? [];
    }

    /** One record's detail (null when there is none). */
    public static function detail(string $name, int|string $id): ?array
    {
        return self::file($name)['detail'][(string) $id] ?? null;
    }
}

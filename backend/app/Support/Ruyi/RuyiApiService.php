<?php

namespace App\Support\Ruyi;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Read-only client for the live Ruyi Travels website API (default https://ruyitravels.com/api).
 *
 * Only the five list endpoints in ENDPOINTS can be called. Nothing here adds, changes or deletes a record on the live site, and there is
 * no way to reach any other path through it. Each list is returned in one shape (camelCase keys, absolute image URLs, plain text instead of HTML).
 */
class RuyiApiService
{
    /** kind => endpoint path on the Ruyi site. The only paths this class will ever call. */
    public const ENDPOINTS = [
        'hotels' => 'hotel-list',
        'packages' => 'package-list',
        'activities' => 'adventure-list',
        'transport' => 'car-list',
        'blogs' => 'blog-list',
    ];

    private string $baseUrl;
    private int $timeout;
    private int $cacheSeconds;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.ruyi.base_url', 'https://ruyitravels.com/api'), '/');
        $this->timeout = (int) config('services.ruyi.timeout', 20);
        $this->cacheSeconds = (int) config('services.ruyi.cache_seconds', 60);
    }

    public function baseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * One page of a list. `$row` is the offset the Ruyi API pages by; `$filters` is the packages filter string
     * (for example "DURATION[]=1&PRICE_RANGE=0;63999&SORT=ASC") and is ignored for the other lists.
     *
     * @return list<array<string, mixed>>
     */
    public function list(string $kind, int $row = 0, ?string $filters = null): array
    {
        if (! isset(self::ENDPOINTS[$kind])) {
            throw new RuyiApiException("Unknown Ruyi list: {$kind}");
        }

        $row = max(0, $row);
        $filters = $kind === 'packages' && $filters !== '' ? $filters : null;

        $raw = $this->cacheSeconds > 0
            ? Cache::remember('ruyi.'.$kind.'.'.$row.'.'.md5((string) $filters), $this->cacheSeconds, fn () => $this->fetch($kind, $row, $filters))
            : $this->fetch($kind, $row, $filters);

        $origin = $this->origin();
        $rows = [];
        foreach ($raw as $item) {
            if (is_array($item)) {
                $rows[] = self::normalize($kind, $item, $origin);
            }
        }

        return $rows;
    }

    /** Ask the Ruyi site for one page. The request is a POST with the page in the query string, exactly like the Postman collection. */
    private function fetch(string $kind, int $row, ?string $filters): array
    {
        $query = ['row' => $row];
        if ($filters !== null) {
            $query['filters'] = $filters;
        }
        $url = $this->baseUrl.'/'.self::ENDPOINTS[$kind].'?'.http_build_query($query);

        try {
            $response = Http::timeout($this->timeout)->post($url);
        } catch (ConnectionException $e) {
            Log::warning('Ruyi API unreachable', ['kind' => $kind, 'error' => $e->getMessage()]);
            throw new RuyiApiException('The Ruyi Travels site could not be reached.', 0, $e);
        }

        if (! $response->successful()) {
            Log::warning('Ruyi API error', ['kind' => $kind, 'status' => $response->status()]);
            throw new RuyiApiException('The Ruyi Travels site returned an error ('.$response->status().').');
        }

        $data = $response->json();
        if (! is_array($data)) {
            Log::warning('Ruyi API answered with something that is not a list', ['kind' => $kind]);
            throw new RuyiApiException('The Ruyi Travels site returned an unexpected answer.');
        }

        return array_is_list($data) ? $data : [];
    }

    private function origin(): string
    {
        $p = parse_url($this->baseUrl);

        return ($p['scheme'] ?? 'https').'://'.($p['host'] ?? 'ruyitravels.com');
    }

    /** One raw Ruyi row in the shape the admin pages use. Pure: no network, no framework. */
    public static function normalize(string $kind, array $r, string $origin = 'https://ruyitravels.com'): array
    {
        $image = self::image($r['IMAGE'] ?? null, $origin);

        return match ($kind) {
            'hotels' => [
                'id' => self::str($r['HOTEL_ID'] ?? null),
                'name' => self::str($r['TITLE'] ?? null),
                'tag' => strtolower(self::str($r['TYPE'] ?? null) ?? ''),
                'image' => $image,
                'price' => self::num($r['PRICE'] ?? null),
                'inclusions' => self::items($r['INCLUSIONS'] ?? null),
                'locality' => self::str($r['LOCALITY'] ?? null),
                'city' => self::str($r['CITY'] ?? null),
                'state' => self::str($r['STATE'] ?? null),
                'address' => self::str($r['ADDRESS'] ?? null),
                'latitude' => self::num($r['LATITUDE'] ?? null),
                'longitude' => self::num($r['LONGITUDE'] ?? null),
                'destination' => self::str($r['DESTINATION'] ?? null),
            ],
            'packages' => [
                'id' => self::str($r['PACKAGE_ID'] ?? null),
                'name' => self::str($r['TITLE'] ?? null),
                'image' => $image,
                'price' => self::num($r['PRICE'] ?? null),
                'days' => self::num($r['DURATION'] ?? null),
                'destination' => self::str($r['DESTINATION'] ?? null),
            ],
            'activities' => [
                'id' => self::str($r['ADVENTURE_ID'] ?? null),
                'name' => self::str($r['TITLE'] ?? null),
                'tag' => self::str($r['TYPE'] ?? null),
                'image' => $image,
                'price' => self::num($r['PRICE'] ?? null),
                'locality' => self::str($r['LOCALITY'] ?? null),
                'capacity' => self::num($r['CAPACITY'] ?? null),
                'address' => self::str($r['ADDRESS'] ?? null),
                'city' => self::str($r['CITY'] ?? null),
                'country' => self::str($r['COUNTRY'] ?? null),
                'destination' => self::str($r['DESTINATION'] ?? null),
            ],
            'blogs' => [
                'id' => self::str($r['BLOG_ID'] ?? null),
                'title' => self::str($r['TITLE'] ?? null),
                'excerpt' => self::text($r['DESCRIPTION'] ?? null, 240),
                'image' => $image,
                'createdDate' => self::str($r['CREATED_DATE'] ?? null),
                'createdAt' => self::isoDate($r['CREATED_DATE'] ?? null),
                'destination' => self::str($r['DESTINATION'] ?? null),
            ],
            'transport' => self::transport($r, $image),
            default => [],
        };
    }

    /**
     * Transport rows carry embedded base64 pictures in DESCRIPTION (tens of KB per row), and their other fields were not visible when this was
     * written, so: the description becomes short plain text, the image stays a URL, and any other short scalar field is passed through in camelCase.
     */
    private static function transport(array $r, ?string $image): array
    {
        $out = ['id' => self::str($r['TRANSPORT_ID'] ?? null), 'description' => self::text($r['DESCRIPTION'] ?? null, 300), 'image' => $image];
        foreach ($r as $key => $value) {
            if (in_array($key, ['TRANSPORT_ID', 'DESCRIPTION', 'IMAGE'], true) || ! is_scalar($value)) {
                continue;
            }
            $value = is_string($value) ? trim($value) : $value;
            if (is_string($value) && (strlen($value) > 300 || str_starts_with($value, 'data:'))) {
                continue;
            }
            $out[lcfirst(str_replace(' ', '', ucwords(strtolower(str_replace('_', ' ', (string) $key)))))] = $value;
        }

        return $out;
    }

    private static function str(mixed $v): ?string
    {
        if (! is_scalar($v)) {
            return null;
        }
        $v = trim((string) $v);

        return $v === '' ? null : $v;
    }

    private static function num(mixed $v): int|float|null
    {
        if (! is_numeric($v)) {
            return null;
        }

        return $v + 0;
    }

    /** "A, B, C" => ['A', 'B', 'C'] */
    private static function items(mixed $v): array
    {
        $s = self::str($v);

        return $s === null ? [] : array_values(array_filter(array_map('trim', explode(',', $s)), fn ($x) => $x !== ''));
    }

    /** An absolute http(s) URL, or null. A relative path is joined to the Ruyi site's address. */
    private static function image(mixed $v, string $origin): ?string
    {
        $s = self::str($v);
        if ($s === null) {
            return null;
        }
        if (preg_match('#^https?://#i', $s)) {
            return $s;
        }

        return str_starts_with($s, 'data:') ? null : rtrim($origin, '/').'/'.ltrim($s, '/');
    }

    /** HTML to short plain text: pictures, scripts and styles are dropped before the tags, so a base64 image never leaks into the text. */
    private static function text(mixed $v, int $max): ?string
    {
        $s = self::str($v);
        if ($s === null) {
            return null;
        }
        $s = preg_replace('#<(script|style)\b.*?</\1>#is', ' ', $s) ?? $s;
        $s = preg_replace('#<img\b[^>]*>#i', ' ', $s) ?? $s;
        $s = html_entity_decode(strip_tags($s), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $s = trim(preg_replace('/\s+/u', ' ', $s) ?? $s);

        return $s === '' ? null : mb_strimwidth($s, 0, $max, '…', 'UTF-8');
    }

    private static function isoDate(mixed $v): ?string
    {
        $s = self::str($v);
        $t = $s === null ? false : strtotime($s);

        return $t === false ? null : date('Y-m-d', $t);
    }
}
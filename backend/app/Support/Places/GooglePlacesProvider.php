<?php

namespace App\Support\Places;

use App\Support\PlacesException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * The Google provider. Google Places API (New): Autocomplete for suggestions, Place Details for the chosen place. This is the only code that
 * knows the API key; the browser talks to our own /api/places endpoints. Results are cached briefly, and only the place id,
 * name, address and phone are ever stored (see SavedPlaceController).
 */
class GooglePlacesProvider implements PlacesProvider
{
    /** Place types Autocomplete is limited to, per kind of place. */
    public const TYPES = [
        'hotel' => ['lodging'],
        'activity' => ['tourist_attraction', 'amusement_park', 'national_park', 'hiking_area', 'zoo'],
    ];

    private const SEARCH_TTL = 300;       // seconds
    private const EXTRAS_TTL = 21600;     // ratings and photos change slowly
    private const GEOCODE_TTL = 604800;
    private const ENRICH_LIMIT = 5;       // suggestions that get a rating and photo

    public function name(): string
    {
        return 'google';
    }

    public function configured(): bool
    {
        return filled(config('services.google_places.key'));
    }

    /** @return list<array{placeId:string,name:string,area:string,rating:?float,ratingCount:?int,photo:?string}> */
    public function search(string $query, string $kind, ?string $location, ?string $session): array
    {
        if (trim($query) === '') {
            return []; // no billed call for an empty box
        }
        $key = 'places:search:'.md5(implode('|', [$kind, mb_strtolower((string) $location), mb_strtolower($query)]));
        $predictions = Cache::remember($key, self::SEARCH_TTL, function () use ($query, $kind, $location, $session) {
            $body = ['input' => $query, 'includedPrimaryTypes' => self::TYPES[$kind], 'languageCode' => 'en'];
            if ($session) {
                $body['sessionToken'] = $session;
            }
            if ($location && ($center = $this->center($location))) {
                $body['locationBias'] = ['circle' => ['center' => $center, 'radius' => 50000.0]];
            }
            $json = $this->check($this->client()->post('/v1/places:autocomplete', $body))->json();

            return collect($json['suggestions'] ?? [])
                ->map(fn ($s) => $s['placePrediction'] ?? null)
                ->filter(fn ($p) => isset($p['placeId']))
                ->take(8)
                ->map(fn ($p) => [
                    'placeId' => $p['placeId'],
                    'name' => $p['structuredFormat']['mainText']['text'] ?? ($p['text']['text'] ?? ''),
                    'area' => $p['structuredFormat']['secondaryText']['text'] ?? '',
                ])->values()->all();
        });

        $extras = $this->extras(array_slice(array_column($predictions, 'placeId'), 0, self::ENRICH_LIMIT));

        return array_map(fn ($p) => $p + ($extras[$p['placeId']] ?? ['rating' => null, 'ratingCount' => null, 'photo' => null]), $predictions);
    }

    /** @return array{placeId:string,name:string,address:string,city:string,phone:string,rating:?float,ratingCount:?int,photo:?string,photoCredit:?string,mapsUri:?string} */
    public function details(string $placeId, ?string $session): array
    {
        $fields = 'id,displayName,formattedAddress,addressComponents,nationalPhoneNumber,internationalPhoneNumber,rating,userRatingCount,photos,googleMapsUri';
        $query = $session ? ['sessionToken' => $session] : [];
        $place = $this->check($this->client($fields)->get('/v1/places/'.rawurlencode($placeId), $query))->json();

        $locality = collect($place['addressComponents'] ?? [])->first(fn ($c) => in_array('locality', $c['types'] ?? [], true));
        $photo = $place['photos'][0] ?? null;

        return [
            'placeId' => $place['id'] ?? $placeId,
            'name' => $place['displayName']['text'] ?? '',
            'address' => $place['formattedAddress'] ?? '',
            'city' => $locality['longText'] ?? '',
            'phone' => $place['nationalPhoneNumber'] ?? ($place['internationalPhoneNumber'] ?? ''),
            'rating' => $place['rating'] ?? null,
            'ratingCount' => $place['userRatingCount'] ?? null,
            'photo' => isset($photo['name']) ? $this->photoUrl($photo['name'], 160) : null,
            'photoCredit' => $photo['authorAttributions'][0]['displayName'] ?? null,
            'mapsUri' => $place['googleMapsUri'] ?? null,
        ];
    }

    /** @return array{0:string,1:string}|null  the image bytes and their content type */
    public function photo(string $ref, int $width): ?array
    {
        $response = $this->client()->get('/v1/'.$ref.'/media', ['maxWidthPx' => max(32, min($width, 800))]);
        if ($response->status() === 404) {
            return null;
        }

        return [$this->check($response)->body(), $response->header('Content-Type') ?: 'image/jpeg'];
    }

    public function photoUrl(string $name, int $width): string
    {
        return '/api/places/photo?'.http_build_query(['ref' => $name, 'w' => $width]);
    }

    /** Ratings and the first photo for a few suggestions, fetched together and cached. */
    private function extras(array $ids): array
    {
        $out = [];
        $missing = [];
        foreach ($ids as $id) {
            $hit = Cache::get('places:extras:'.$id);
            $hit !== null ? $out[$id] = $hit : $missing[] = $id;
        }
        if ($missing) {
            $headers = ['X-Goog-Api-Key' => config('services.google_places.key'), 'X-Goog-FieldMask' => 'rating,userRatingCount,photos.name'];
            $base = rtrim(config('services.google_places.base_url'), '/');
            try {
                $responses = Http::pool(fn (Pool $pool) => array_map(
                    fn ($id) => $pool->as($id)->withHeaders($headers)->timeout(6)->get($base.'/v1/places/'.rawurlencode($id)),
                    $missing
                ));
            } catch (ConnectionException) {
                $responses = [];
            }
            foreach ($missing as $id) {
                $r = $responses[$id] ?? null;
                $ok = $r instanceof Response && $r->successful();
                $json = $ok ? $r->json() : [];
                $photo = $json['photos'][0]['name'] ?? null;
                $out[$id] = [
                    'rating' => $json['rating'] ?? null,
                    'ratingCount' => $json['userRatingCount'] ?? null,
                    'photo' => $photo ? $this->photoUrl($photo, 96) : null,
                ];
                if ($ok) {
                    Cache::put('places:extras:'.$id, $out[$id], self::EXTRAS_TTL);
                }
            }
        }

        return $out;
    }

    /** Where a day's location is, so suggestions can be biased towards it. null when it cannot be worked out. */
    private function center(string $location): ?array
    {
        return Cache::remember('places:geo:'.md5(mb_strtolower($location)), self::GEOCODE_TTL, function () use ($location) {
            try {
                $json = $this->check($this->client('places.location')->post('/v1/places:searchText', ['textQuery' => $location, 'maxResultCount' => 1]))->json();
            } catch (PlacesException) {
                return null; // suggestions still work, just without the bias
            }
            $point = $json['places'][0]['location'] ?? null;

            return $point ? ['latitude' => (float) $point['latitude'], 'longitude' => (float) $point['longitude']] : null;
        });
    }

    private function client(?string $fieldMask = null): PendingRequest
    {
        if (!$this->configured()) {
            throw new PlacesException('not_configured', 'Search is not set up yet.');
        }
        $client = Http::baseUrl(rtrim(config('services.google_places.base_url'), '/'))
            ->withHeaders(['X-Goog-Api-Key' => config('services.google_places.key')])
            ->acceptJson()->asJson()->timeout(6);

        return $fieldMask ? $client->withHeaders(['X-Goog-FieldMask' => $fieldMask]) : $client;
    }

    private function check(Response $response): Response
    {
        if ($response->successful()) {
            return $response;
        }
        $status = $response->json('error.status');
        throw match (true) {
            $response->status() === 429, $status === 'RESOURCE_EXHAUSTED' => new PlacesException('quota', 'Search limit reached. Try again in a minute, or add the place by hand.', 429),
            $response->status() === 404 => new PlacesException('not_found', 'That place could not be found.', 404),
            default => new PlacesException('unavailable', 'Search is not available right now. You can add the place by hand.'),
        };
    }
}

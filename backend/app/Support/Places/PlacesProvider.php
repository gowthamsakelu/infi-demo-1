<?php

namespace App\Support\Places;

/**
 * Where hotel and activity suggestions come from. The controller and the browser do not care which one is behind
 * /api/places: both return the same shape. See AppServiceProvider for how one is chosen (PLACES_PROVIDER).
 */
interface PlacesProvider
{
    /** 'google' or 'demo'. */
    public function name(): string;

    /** False when the provider cannot answer (Google without a key). */
    public function configured(): bool;

    /**
     * @param  string  $kind  hotel | activity
     * @param  string|null  $location  the day's location, used to rank (demo) or bias (Google) the results
     * @return list<array{placeId:string,name:string,area:string,rating:?float,ratingCount:?int,photo:?string}>
     *                                                                                                          An empty $query asks for popular places (demo); Google returns nothing for it.
     */
    public function search(string $query, string $kind, ?string $location, ?string $session): array;

    /** @return array{placeId:string,name:string,address:string,city:string,phone:string,rating:?float,ratingCount:?int,photo:?string,photoCredit:?string,mapsUri:?string} */
    public function details(string $placeId, ?string $session): array;

    /** @return array{0:string,1:string}|null  image bytes and content type, null when there is no photo */
    public function photo(string $ref, int $width): ?array;
}

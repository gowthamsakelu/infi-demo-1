<?php

namespace App\Support\Places;

use App\Support\PlacesException;

/**
 * Hotels and activities from a local file (database/data/demo-places.json), so search works without a Google key.
 * Edit that file to add or change places; nothing here is specific to any of them.
 *
 * Search matches the name, location, area and category (case-insensitive, every word of the query must match somewhere).
 * Places in the day's location rank first, then by how well the name matches, then by rating. An empty query returns the
 * popular places in the day's location (or overall when the location is unknown).
 */
class DemoPlacesProvider implements PlacesProvider
{
    private const LIMIT = 10;

    /** @var list<array<string,mixed>>|null */
    private ?array $items = null;

    public function __construct(private readonly ?string $path = null) {}

    public function name(): string
    {
        return 'demo';
    }

    public function configured(): bool
    {
        return true;
    }

    public function search(string $query, string $kind, ?string $location, ?string $session): array
    {
        $words = $this->words($query);
        $places = $this->locationWords($location);

        $scored = [];
        foreach ($this->items() as $item) {
            if ($item['type'] !== $kind) {
                continue;
            }
            $inDay = $this->inLocation($item, $places);
            if ($words === []) {
                // Popular: the day's location when we know it, otherwise everything.
                if ($places !== [] && !$inDay) {
                    continue;
                }
                $scored[] = [$this->popularity($item), $item];

                continue;
            }
            $score = $this->match($item, $words);
            if ($score === null) {
                continue;
            }
            $scored[] = [($inDay ? 1000 : 0) + $score * 10 + $item['rating'], $item];
        }
        if ($words === [] && $scored === []) { // an unknown location still gets suggestions
            foreach ($this->items() as $item) {
                if ($item['type'] === $kind) {
                    $scored[] = [$this->popularity($item), $item];
                }
            }
        }

        usort($scored, fn ($a, $b) => $b[0] <=> $a[0]);

        return array_map(fn ($row) => $this->row($row[1]), array_slice($scored, 0, self::LIMIT));
    }

    public function details(string $placeId, ?string $session): array
    {
        foreach ($this->items() as $item) {
            if ($item['id'] === $placeId) {
                return $this->row($item) + [
                    'address' => trim($item['area'].', '.$item['location'], ', '),
                    'city' => $item['location'],
                    'phone' => '',
                    'photoCredit' => null,
                    'mapsUri' => sprintf('https://www.google.com/maps?q=%s,%s', $item['lat'], $item['lng']),
                ];
            }
        }

        throw new PlacesException('not_found', 'That place could not be found.', 404);
    }

    public function photo(string $ref, int $width): ?array
    {
        return null; // demo places have no photos; the UI shows its neutral icon
    }

    /** The shape both providers return for a suggestion, plus the demo defaults the form can pre-fill. */
    private function row(array $item): array
    {
        return [
            'placeId' => $item['id'],
            'name' => $item['name'],
            'area' => trim($item['area'].', '.$item['location'], ', '),
            'rating' => $item['rating'],
            'ratingCount' => $item['reviews'],
            'photo' => null,
            'category' => $item['category'],
            'price' => $item['price'],
            'durationMinutes' => $item['duration'] ?? null,
            'description' => $item['description'] ?? '',
            'lat' => $item['lat'],
            'lng' => $item['lng'],
        ];
    }

    /** @return list<string> */
    private function words(?string $text): array
    {
        return array_values(array_filter(preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower((string) $text)) ?: []));
    }

    /** The place names in a day's location such as "Srinagar, Gulmarg, Pahalgam" or "Chandigarh, Punjab". */
    private function locationWords(?string $location): array
    {
        return array_values(array_filter(array_map(fn ($p) => mb_strtolower(trim($p)), preg_split('/[,\/&|→]+|\s-\s/u', (string) $location) ?: [])));
    }

    private function inLocation(array $item, array $places): bool
    {
        $loc = mb_strtolower($item['location']);
        if ($loc === '') {
            return false; // generic places belong to no location
        }
        foreach ($places as $p) {
            if ($p === $loc || str_contains($p, $loc) || str_contains($loc, $p)) {
                return true;
            }
        }

        return false;
    }

    /** null when some word of the query matches nothing; otherwise higher is better (a name hit counts most). */
    private function match(array $item, array $words): ?int
    {
        $name = mb_strtolower($item['name']);
        $rest = mb_strtolower(implode(' ', [$item['location'], $item['area'], $item['category'], $item['description'] ?? '']));
        $score = 0;
        foreach ($words as $w) {
            if (str_contains($name, $w)) {
                $score += str_starts_with($name, $w) ? 5 : 4;
            } elseif (str_contains($rest, $w)) {
                $score += 1;
            } else {
                return null;
            }
        }

        return $score;
    }

    private function popularity(array $item): float
    {
        return $item['rating'] * log(max(2, $item['reviews']));
    }

    /** @return list<array<string,mixed>> */
    private function items(): array
    {
        if ($this->items === null) {
            $file = $this->path ?? config('services.places.demo_file', database_path('data/demo-places.json'));
            $json = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
            $this->items = is_array($json) ? array_values($json) : [];
        }

        return $this->items;
    }
}

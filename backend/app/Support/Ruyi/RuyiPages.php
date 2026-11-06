<?php

namespace App\Support\Ruyi;

/**
 * A normalized Ruyi row (see RuyiApiService::normalize) in the shape each admin page already uses for its own records.
 * The Ruyi lists have no ratings, reviews, bookings, revenue, rooms, itineraries or per-person tiers, so those are left empty rather than invented.
 * Pure: no network, no framework.
 */
class RuyiPages
{
    public static function adventure(array $a): array
    {
        $capacity = $a['capacity'] ?? null;

        return [
            'id' => $a['id'],
            'name' => $a['name'] ?? 'Untitled activity',
            'city' => $a['city'] ?? $a['locality'],
            'region' => $a['destination'],
            'tag' => $a['tag'] ?? 'other',
            'status' => 'active',
            'rating' => null,
            'reviews' => 0,
            'minutes' => null,
            'price' => $a['price'],
            'priceChild' => null,
            'priceGroup' => null,
            'groupSize' => null,
            'difficulty' => null,
            'bestTime' => null,
            'minAge' => null,
            'partner' => null,
            'meetingPoint' => $a['address'] ?? $a['locality'],
            'description' => $capacity ? "Capacity: up to {$capacity} guests." : null,
            'image' => $a['image'],
            'highlights' => [],
            'inclusions' => [],
            'exclusions' => [],
            'bookings' => 0,
        ];
    }

    public static function package(array $p): array
    {
        $days = (int) ($p['days'] ?? 0) ?: 1;

        return [
            'id' => $p['id'],
            'name' => $p['name'] ?? 'Untitled package',
            'destinationId' => null,
            'destination' => $p['destination'],
            'tag' => 'tour',
            'status' => 'published',
            'seasonal' => false,
            'season' => null,
            'image' => $p['image'],
            'days' => $days,
            'nights' => max(0, $days - 1),
            'price' => $p['price'],
            'bookings' => 0,
        ];
    }

    public static function packageDetail(array $p): array
    {
        return self::package($p) + [
            'description' => null,
            'minPax' => null,
            'priceTiers' => $p['price'] !== null ? [['label' => 'Per person', 'note' => 'Starting price', 'price' => $p['price']]] : [],
            'inclusions' => [],
            'exclusions' => [],
            'highlights' => [],
            'itinerary' => [],
            'inquiries' => [],
        ];
    }

    public static function vehicle(array $v, int $rank): array
    {
        $name = trim(($v['makeName'] ?? '').' '.($v['modelName'] ?? ''));
        $image = $v['image'] ?? (isset($v['modelImage']) && preg_match('#^https?://#i', (string) $v['modelImage']) ? $v['modelImage'] : null);
        $text = ($v['description'] ?? '').' '.($v['inclusions'] ?? '');

        return [
            'id' => $v['id'],
            'key' => strtolower((string) $v['id']),
            'name' => $name !== '' ? $name : 'Vehicle '.$v['id'],
            'icon' => 'car',
            'seats' => isset($v['seat']) && is_numeric($v['seat']) ? (int) $v['seat'] : null,
            'ac' => (bool) preg_match('/\bAC\b|air[- ]?conditioned/i', $text),
            'category' => strtolower((string) ($v['type'] ?? '')) ?: 'car',
            'baseRate' => $v['price'] ?? null,
            'rateUnit' => 'per_day',
            'rank' => $rank,
            'description' => $v['description'] ?? null,
            'image' => $image,
            'overview' => $v['description'] ?? null,
            'highlights' => [],
            'inclusions' => self::items($v['inclusions'] ?? null),
            'exclusions' => self::items($v['exclusions'] ?? null),
            'active' => true,
            'mostPopular' => false,
            'showInBuilder' => true,
            'rateCard' => [],
            'trips' => 0,
            'avgDays' => null,
        ];
    }

    public static function blogPost(array $b): array
    {
        $title = $b['title'] ?? 'Untitled article';

        return [
            'id' => $b['id'],
            'title' => $title,
            'slug' => strtolower(trim((string) preg_replace('/[^A-Za-z0-9]+/', '-', $title), '-')),
            'author' => 'Ruyi Travels',
            'excerpt' => $b['excerpt'],
            'content' => $b['content'] ?? $b['excerpt'],
            'cover' => $b['image'],
            'category' => $b['destination'],
            'status' => 'published',
            'publishedAt' => $b['createdAt'],
            'updatedAt' => $b['createdAt'],
            'views' => 0,
            'leads' => 0,
            'converted' => 0,
        ];
    }

    public static function destination(array $d): array
    {
        $packages = (int) ($d['packages'] ?? 0);
        $stays = (int) ($d['stays'] ?? 0);

        return [
            'id' => $d['id'],
            'slug' => str($d['name'] ?? '')->slug()->toString(),
            'name' => $d['name'] ?? 'Untitled destination',
            'region' => 'India',
            'status' => 'active',
            'popular' => ($packages + $stays) > 10,
            'image' => $d['image'],
            'packages' => $packages,
            'inquiries' => 0,
        ];
    }

    /** "A, B, C" => ['A', 'B', 'C'] */
    private static function items(mixed $v): array
    {
        if (! is_string($v) || trim($v) === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $v)), fn ($x) => $x !== ''));
    }
}

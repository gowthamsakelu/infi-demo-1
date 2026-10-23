<?php

namespace App\Support;

use Carbon\CarbonImmutable;

/** Reads the first and last day of a trip from the free-text travel dates, e.g. "15 Jan - 20 Jan 2025 (5D / 4N)". */
class TripDates
{
    private const MONTHS = ['jan' => 1, 'feb' => 2, 'mar' => 3, 'apr' => 4, 'may' => 5, 'jun' => 6, 'jul' => 7, 'aug' => 8, 'sep' => 9, 'oct' => 10, 'nov' => 11, 'dec' => 12];

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable}|null  [start, end] */
    public static function parse(?string $text): ?array
    {
        if (!$text) {
            return null;
        }
        $day = '(\d{1,2})\s+([A-Za-z]{3})';
        if (preg_match("/$day\s*[-–]\s*$day\s+(\d{4})/", $text, $m)) {
            [, $d1, $m1, $d2, $m2, $year] = $m;
            $end = self::make((int) $year, $m2, (int) $d2);
            $start = self::make((int) $year, $m1, (int) $d1);
            if ($start && $end && $start->greaterThan($end)) {
                $start = $start->subYear(); // "28 Dec - 2 Jan 2025"
            }
        } elseif (preg_match("/$day\s+(\d{4})/", $text, $m)) {
            $start = $end = self::make((int) $m[3], $m[2], (int) $m[1]);
        } else {
            return null;
        }

        return $start && $end ? [$start, $end] : null;
    }

    private static function make(int $year, string $month, int $day): ?CarbonImmutable
    {
        $n = self::MONTHS[strtolower($month)] ?? null;

        return $n && checkdate($n, $day, $year) ? CarbonImmutable::create($year, $n, $day)->startOfDay() : null;
    }
}

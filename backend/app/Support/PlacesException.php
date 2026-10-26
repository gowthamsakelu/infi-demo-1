<?php

namespace App\Support;

use RuntimeException;

/** A Places lookup that could not be completed. `reason` is what the UI keys on: not_configured | quota | unavailable | not_found. */
class PlacesException extends RuntimeException
{
    public function __construct(public readonly string $reason, string $message, public readonly int $status = 503)
    {
        parent::__construct($message);
    }
}

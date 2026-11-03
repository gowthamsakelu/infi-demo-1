<?php

namespace App\Support\Rayna;

use Exception;

class RaynaApiException extends Exception
{
    public const ERROR_MESSAGES = [
        '100' => 'AdultRate or ChildRate is lower than system price',
        '101' => 'Insufficient credit limit in Rayna wallet',
        '102' => 'Travel date must not be before current date',
        '103' => 'Adult count must be greater than zero',
        '104' => 'Pickup details compulsory for Private or Sharing transfer',
        '105' => 'Start time is compulsory',
        '106' => 'Pax type missing or invalid',
        '107' => 'Tour is not available for booking',
        '108' => 'Event id / start date and time incorrect',
        '109' => 'Wrong city id provided',
        '110' => 'Tour not available for this city',
        '111' => 'Travel date is compulsory',
        '112' => 'Travel date format must be MM-DD-YYYY',
        '113' => 'Invalid transfer type selected',
    ];

    public function __construct(string $message, int $code = 0, ?Exception $previous = null)
    {
        $resolvedMessage = self::ERROR_MESSAGES[(string) $code] ?? $message;
        parent::__construct($resolvedMessage, $code, $previous);
    }
}


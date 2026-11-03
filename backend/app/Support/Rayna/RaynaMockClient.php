<?php

namespace App\Support\Rayna;

/**
 * Mock client for demonstrations when no live Rayna credentials exist.
 *
 * NOTE: Values here are SYNTHETIC MOCK VALUES generated to satisfy the schema
 * structure of rayna-api.json. Only structural schemas, transfer type IDs,
 * imageBase, and imageExample are sourced from rayna-api.json.
 */
class RaynaMockClient
{
    private string $imageBase;

    public function __construct(string $imageBase = 'https://d2cazmkfw8kdtj.cloudfront.net')
    {
        $this->imageBase = rtrim($imageBase, '/');
    }

    /** 1. Countries: POST /api/Tour/countries (schema: countryId, countryName) */
    public function countries(): array
    {
        return [
            ['countryId' => 1, 'countryName' => 'United Arab Emirates [Synthetic Mock]'],
            ['countryId' => 2, 'countryName' => 'Singapore [Synthetic Mock]'],
        ];
    }

    /** 2. Cities: POST /api/Tour/cities (schema: cityId, cityName) */
    public function cities(int $countryId): array
    {
        return match ($countryId) {
            1 => [
                ['cityId' => 101, 'cityName' => 'Dubai [Synthetic Mock]'],
                ['cityId' => 102, 'cityName' => 'Abu Dhabi [Synthetic Mock]'],
            ],
            2 => [
                ['cityId' => 201, 'cityName' => 'Singapore City [Synthetic Mock]'],
            ],
            default => [
                ['cityId' => 101, 'cityName' => 'Dubai [Synthetic Mock]'],
            ],
        };
    }

    /**
     * 3. Tour Static Data: POST /api/Tour/tourstaticdata
     * Note: Tour 4850 and imagePath "Tour-Images/false-4850/fly-fish.jpg" are taken from the
     * imageExample field in rayna-api.json. All other descriptions and numbers are synthetic.
     */
    public function tourStaticData(int $countryId, int $cityId): array
    {
        return [
            [
                'tourId' => 4850,
                'countryId' => $countryId ?: 1,
                'countryName' => 'United Arab Emirates [Synthetic Mock]',
                'cityId' => $cityId ?: 101,
                'cityName' => 'Dubai [Synthetic Mock]',
                'tourName' => 'Synthetic Demo Tour (ID 4850 from imageExample)',
                'reviewCount' => 14,
                'rating' => 4.6,
                'duration' => '2 Hours',
                // Explicitly from rayna-api.json imageExample
                'imagePath' => 'Tour-Images/false-4850/fly-fish.jpg',
                'imageCaptionName' => 'fly-fish.jpg',
                // Explicit transfer type ID from rayna-api.json
                'cityTourTypeId' => 41865,
                'cityTourType' => 'Water Sports [Synthetic]',
                'tourShortDescription' => '[SYNTHETIC MOCK] Slot-required tour sample constructed to test the isSlot=true branch.',
                'cancellationPolicyName' => 'Standard Cancellation [Synthetic]',
                'isSlot' => true,
                'onlyChild' => false,
                'contractId' => 1001,
                'imageUrl' => "{$this->imageBase}/Tour-Images/false-4850/fly-fish.jpg",
            ],
            [
                'tourId' => 4851,
                'countryId' => $countryId ?: 1,
                'countryName' => 'United Arab Emirates [Synthetic Mock]',
                'cityId' => $cityId ?: 101,
                'cityName' => 'Dubai [Synthetic Mock]',
                'tourName' => 'Synthetic Demo Tour (Non-Slot)',
                'reviewCount' => 28,
                'rating' => 4.8,
                'duration' => '4 Hours',
                'imagePath' => 'Tour-Images/false-4850/fly-fish.jpg',
                'imageCaptionName' => 'sample-tour.jpg',
                // Explicit transfer type ID from rayna-api.json
                'cityTourTypeId' => 41843,
                'cityTourType' => 'Sightseeing [Synthetic]',
                'tourShortDescription' => '[SYNTHETIC MOCK] Non-slot tour sample constructed to test the isSlot=false branch.',
                'cancellationPolicyName' => 'Standard Cancellation [Synthetic]',
                'isSlot' => false,
                'onlyChild' => false,
                'contractId' => 1002,
                'imageUrl' => "{$this->imageBase}/Tour-Images/false-4850/fly-fish.jpg",
            ],
        ];
    }

    /** 4. Tour Static Data by ID: POST /api/Tour/tourStaticDataById */
    public function tourStaticDataById(int $countryId, int $cityId, int $tourId, int $contractId, ?string $travelDate = null): array
    {
        $isSlot = ($tourId === 4850);
        return [
            'tourId' => $tourId,
            'tourName' => $isSlot ? 'Synthetic Demo Tour (ID 4850 from imageExample)' : "Synthetic Demo Tour #{$tourId}",
            'departurePoint' => 'Synthetic Departure Point',
            'reportingTime' => '08:30 AM',
            'tourLanguage' => 'English',
            'tourDescription' => '[SYNTHETIC MOCK] Mock detailed description populated to match the tourStaticDataById schema in rayna-api.json.',
            'tourInclusion' => '[SYNTHETIC MOCK] Equipment, Safety briefing, Instructor guidance',
            'raynaToursAdvantage' => '[SYNTHETIC MOCK] Supplier booking guarantee',
            'whatsInThisTour' => '[SYNTHETIC MOCK] Sample itinerary walkthrough',
            'importantInformation' => '[SYNTHETIC MOCK] Valid ID or passport copy required',
            'itenararyDescription' => '[SYNTHETIC MOCK] Day-wise activity flow',
            'usefulInformation' => '[SYNTHETIC MOCK] Wear comfortable clothing',
            'faqDetails' => '[SYNTHETIC MOCK] FAQ details',
            'termsAndConditions' => '[SYNTHETIC MOCK] Standard cancellation and terms',
            'cancellationPolicyName' => 'Standard Cancellation [Synthetic]',
            'cancellationPolicyDescription' => '[SYNTHETIC MOCK] 100% refund up to 24 hours prior to travel date',
            'childCancellationPolicyName' => 'Child Cancellation [Synthetic]',
            'childCancellationPolicyDescription' => '[SYNTHETIC MOCK] Same as adult policy',
            'childAge' => '3-11',
            'infantAge' => '0-2',
            'infantCount' => 0,
            'isSlot' => $isSlot,
            'onlyChild' => false,
            'contractId' => $contractId ?: 1001,
            'tourImages' => [
                [
                    'imagePath' => 'Tour-Images/false-4850/fly-fish.jpg',
                    'imageUrl' => "{$this->imageBase}/Tour-Images/false-4850/fly-fish.jpg",
                    'imageCaptionName' => 'fly-fish.jpg',
                    'isFrontImage' => true,
                    'isBannerImage' => false,
                    'isBannerRotateImage' => false,
                ],
            ],
            'tourReview' => [
                [
                    'reviewId' => 1,
                    'reviewTitle' => 'Synthetic Review',
                    'reviewContent' => '[SYNTHETIC MOCK] Sample feedback content.',
                    'visitMonth' => 'October 2026',
                    'rating' => 5,
                    'guestName' => 'Synthetic Guest',
                ],
            ],
        ];
    }

    /** 5. Tour Option Static Data: POST /api/Tour/touroptionstaticdata */
    public function tourOptionStaticData(int $tourId, int $contractId): array
    {
        return [
            'touroption' => [
                [
                    'tourOptionId' => 201,
                    'optionName' => 'Standard Option [Synthetic Mock]',
                    'minPax' => 1,
                    'maxPax' => 10,
                    'duration' => '2 Hours',
                    'timeZone' => 'Asia/Dubai',
                ],
            ],
            'operationdays' => [
                [
                    'tourOptionId' => 201,
                    'monday' => true,
                    'tuesday' => true,
                    'wednesday' => true,
                    'thursday' => true,
                    'friday' => true,
                    'saturday' => true,
                    'sunday' => true,
                ],
            ],
            'specialdates' => [],
            'transfertime' => [
                [
                    'tourOptionId' => 201,
                    'transferType' => 'Without Transfer',
                    'transferTime' => '09:00',
                    'duration' => '2 Hours',
                ],
            ],
        ];
    }

    /** 6. Tour List (Price): POST /api/Tour/tourlist */
    public function tourList(int $countryId, int $cityId, string $travelDate): array
    {
        return [
            ['tourId' => 4850, 'contractId' => 1001, 'amount' => 150.0, 'discount' => 0.0, 'sortOrder' => 1],
            ['tourId' => 4851, 'contractId' => 1002, 'amount' => 200.0, 'discount' => 0.0, 'sortOrder' => 2],
        ];
    }

    /** 7. Tour Options: POST /api/Tour/touroption */
    public function tourOptions(
        int $tourId,
        int $contractId,
        string $travelDate,
        int $adults = 1,
        int $children = 0,
        int $infants = 0
    ): array {
        $isSlot = ($tourId === 4850);
        return [
            [
                'tourId' => $tourId,
                'tourOptionId' => 201,
                // Explicitly from transferTypes in rayna-api.json (41865 = Without Transfer)
                'transferId' => 41865,
                'transferName' => 'Without Transfer',
                'adultPrice' => 150.0,
                'childPrice' => 100.0,
                'infantPrice' => 0.0,
                'withoutDiscountAmount' => 150.0,
                'finalAmount' => (150.0 * $adults) + (100.0 * $children),
                'startTime' => '09:00',
                'departureTime' => '09:00',
                'disableChild' => false,
                'disableInfant' => true,
                'allowTodaysBooking' => true,
                'cutOff' => 0,
                'isSlot' => $isSlot,
                'isDefaultTransfer' => 1,
                'rateKey' => 'SYNTHETIC-RATEKEY-201',
                'inventoryId' => 1001,
            ],
            [
                'tourId' => $tourId,
                'tourOptionId' => 202,
                // Explicitly from transferTypes in rayna-api.json (41843 = Sharing Transfer)
                'transferId' => 41843,
                'transferName' => 'Sharing Transfer',
                'adultPrice' => 200.0,
                'childPrice' => 150.0,
                'infantPrice' => 0.0,
                'withoutDiscountAmount' => 200.0,
                'finalAmount' => (200.0 * $adults) + (150.0 * $children),
                'startTime' => '08:30',
                'departureTime' => '08:30',
                'disableChild' => false,
                'disableInfant' => true,
                'allowTodaysBooking' => true,
                'cutOff' => 0,
                'isSlot' => $isSlot,
                'isDefaultTransfer' => 0,
                'rateKey' => 'SYNTHETIC-RATEKEY-202',
                'inventoryId' => 1002,
            ],
        ];
    }

    /** 8. Time Slots: POST /api/Tour/timeslot (Only when isSlot = true) */
    public function timeSlots(
        int $tourId,
        int $tourOptionId,
        int $transferId,
        string $travelDate,
        int $contractId,
        int $adults = 1,
        int $children = 0
    ): array {
        return [
            [
                'tourOptionId' => $tourOptionId,
                'timeSlotId' => 'SYNTHETIC-SLOT-0900',
                'timeSlot' => '09:00 AM [Synthetic Slot]',
                'available' => 10,
                'adultPrice' => 150.0,
                'childPrice' => 100.0,
                'isDynamicPrice' => false,
            ],
            [
                'tourOptionId' => $tourOptionId,
                'timeSlotId' => 'SYNTHETIC-SLOT-1400',
                'timeSlot' => '02:00 PM [Synthetic Slot]',
                'available' => 8,
                'adultPrice' => 150.0,
                'childPrice' => 100.0,
                'isDynamicPrice' => false,
            ],
        ];
    }

    /**
     * 9. Tour Availability: POST /api/Tour/availability
     * Note: 'status: 1' and 'message: "success"' match the literal sample in rayna-api.json.
     */
    public function availability(
        int $tourId,
        int $tourOptionId,
        int $transferId,
        string $travelDate,
        int $contractId,
        int $adults = 1,
        int $children = 0,
        int $infants = 0
    ): array {
        return [
            'status' => 1,
            'message' => 'success',
            'productType' => 0,
            'isBookable' => true,
        ];
    }

    /**
     * 10. Tour Cancellation Policy: POST /api/Tour/policy
     * Note: currency: "AED", percentage: 100, and MM-DD-YYYY format match rayna-api.json line 116.
     */
    public function policy(
        int $tourId,
        int $tourOptionId,
        int $contractId,
        string $travelDate,
        string $startTime = '09:00',
        ?string $currentDate = null
    ): array {
        $travelDateObj = date_create($travelDate) ?: date_create('+7 days');
        $fromDate = date_format($travelDateObj, 'm-d-Y');
        $toDate = date_format($travelDateObj, 'm-d-Y');

        return [
            'statuscode' => 200,
            'error' => null,
            'currency' => 'AED',
            'currencysymbol' => 'AED',
            'errormessage' => '',
            'count' => 1,
            'result' => [
                [
                    'tourId' => $tourId,
                    'optionId' => $tourOptionId,
                    'fromDate' => $fromDate,
                    'toDate' => $toDate,
                    'percentage' => 100,
                ],
            ],
        ];
    }

    /**
     * 11. Create Booking: POST /api/Booking/bookings
     * Visibly and unmistakably fake confirmation for demo safety.
     */
    public function book(array $bookingPayload): array
    {
        $uniqueNo = $bookingPayload['uniqueNo'] ?? 10001;
        $serviceUniqueId = $bookingPayload['TourDetails'][0]['serviceUniqueId'] ?? $uniqueNo;

        return [
            'refernceNo' => "SYNTHETIC-FAKE-REF-{$uniqueNo}-NOT-A-REAL-BOOKING",
            'status' => 'Success (SIMULATED DEMO MOCK)',
            'bookingId' => 9999000 + (int) $uniqueNo,
            'downloadRequired' => true,
            'serviceUniqueId' => (string) $serviceUniqueId,
            'servicetype' => 'tour',
            'confirmationNo' => "SIMULATED-CONF-FAKE-{$uniqueNo}",
            'isRealBooking' => false,
            'mockDisclaimer' => 'THIS IS A SYNTHETIC DEMO SIMULATION. NO SUPPLIER RESERVATION WAS MADE AND NO WALLET WAS DEBITED.',
        ];
    }

    /** 12. Get Booked Tickets: POST /api/Booking/GetBookedTickets */
    public function getBookedTickets(int $uniqueNo, string $referenceNo, array $bookedOptions): array
    {
        return [
            'bookingId' => 9999000 + (int) $uniqueNo,
            'referenceNo' => $referenceNo,
            'BookingStatus' => 'Success (SIMULATED DEMO MOCK)',
            'ticketURL' => 'https://example.invalid/synthetic-mock-ticket-demo-only.pdf',
            'optionName' => 'Standard Option [Synthetic Mock]',
            'validity' => date('Y-m-d', strtotime('+7 days')),
            'validityExtraDetails' => 'DEMO ONLY - Not a valid ticket voucher',
            'printType' => 'barcode|QR',
            'slot' => '09:00 AM [Synthetic Slot]',
            'pnrNumber' => "SYNTHETIC-FAKE-PNR-{$uniqueNo}",
            'ticketDetails' => [
                [
                    'barCode' => '0000000000-DEMO-ONLY',
                    'type' => 'Adult',
                    'noOfAdult' => 1,
                    'noOfchild' => 0,
                ],
            ],
        ];
    }

    /** 13. Cancel Booking: POST /api/Booking/cancelbooking */
    public function cancelBooking(int $bookingId, string $referenceNo, string $reason = ''): array
    {
        return [
            [
                'status' => 'Success (SIMULATED DEMO MOCK)',
                'message' => 'Simulated cancellation completed. No live supplier call was made.',
                'bookingId' => $bookingId,
                'referenceNo' => $referenceNo,
            ],
        ];
    }
}

<?php

namespace App\Support\Rayna;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RaynaApiService
{
    public const TRANSFER_TYPES = [
        41865 => 'Without Transfer',
        41843 => 'Sharing Transfer',
        41844 => 'Private Transfer',
        43129 => 'Private Boat Without Transfers',
        43110 => 'Pvt Yacht Without Transfer',
    ];

    private string $mode;
    private string $baseUrl;
    private ?string $token;
    private int $timeout;
    private string $imageBase;
    private RaynaMockClient $mockClient;

    public function __construct()
    {
        $this->mode = (string) config('services.rayna.mode', 'mock');
        $this->baseUrl = rtrim((string) config('services.rayna.base_url', 'https://api.raynab2b.com'), '/');
        $this->token = config('services.rayna.token') ? trim((string) config('services.rayna.token')) : null;
        $this->timeout = (int) config('services.rayna.timeout', 30);
        $this->imageBase = rtrim((string) config('services.rayna.image_base', 'https://d2cazmkfw8kdtj.cloudfront.net'), '/');
        $this->mockClient = new RaynaMockClient($this->imageBase);
    }

    public function isMock(): bool
    {
        return $this->mode === 'mock' || empty($this->token);
    }

    public function getMode(): string
    {
        return $this->isMock() ? 'mock' : 'live';
    }

    public function isConfigured(): bool
    {
        return !empty($this->token);
    }

    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    public function getImageBase(): string
    {
        return $this->imageBase;
    }

    /** Prepend CloudFront CDN base URL to relative tour image paths. */
    public function formatImageUrl(?string $imagePath): ?string
    {
        if (empty($imagePath)) {
            return null;
        }

        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        return $this->imageBase . '/' . ltrim($imagePath, '/');
    }

    /**
     * 1. Get Countries: POST /api/Tour/countries
     *
     * @return list<array{countryId: int, countryName: string}>
     */
    public function countries(bool $fresh = false): array
    {
        if ($this->isMock()) {
            return $this->mockClient->countries();
        }

        $cacheKey = 'rayna:countries';
        if ($fresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 86400, function () {
            $data = $this->post('/api/Tour/countries', []);
            return $data['result'] ?? [];
        });
    }

    /**
     * 2. Get Cities for a Country: POST /api/Tour/cities
     * Note: Request key is 'CountryId' (capital C).
     *
     * @return list<array{cityId: int, cityName: string}>
     */
    public function cities(int $countryId, bool $fresh = false): array
    {
        if ($this->isMock()) {
            return $this->mockClient->cities($countryId);
        }

        $cacheKey = "rayna:cities:{$countryId}";
        if ($fresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 86400, function () use ($countryId) {
            $data = $this->post('/api/Tour/cities', ['CountryId' => $countryId]);
            return $data['result'] ?? [];
        });
    }

    /**
     * 3. Get Tour Static Data by Country and City: POST /api/Tour/tourstaticdata
     *
     * @return list<array<string, mixed>>
     */
    public function tourStaticData(int $countryId, int $cityId, bool $fresh = false): array
    {
        if ($this->isMock()) {
            return $this->mockClient->tourStaticData($countryId, $cityId);
        }

        $cacheKey = "rayna:tours:{$countryId}:{$cityId}";
        if ($fresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 3600, function () use ($countryId, $cityId) {
            $data = $this->post('/api/Tour/tourstaticdata', [
                'countryId' => $countryId,
                'cityId' => $cityId,
            ]);

            $list = $data['result'] ?? [];
            foreach ($list as &$item) {
                if (!empty($item['imagePath'])) {
                    $item['imageUrl'] = $this->formatImageUrl($item['imagePath']);
                }
            }

            return $list;
        });
    }

    /**
     * 4. Get Tour Static Data By ID: POST /api/Tour/tourStaticDataById
     *
     * @return array<string, mixed>
     */
    public function tourStaticDataById(int $countryId, int $cityId, int $tourId, int $contractId, ?string $travelDate = null): array
    {
        if ($this->isMock()) {
            return $this->mockClient->tourStaticDataById($countryId, $cityId, $tourId, $contractId, $travelDate);
        }

        $travelDate = $travelDate ?: date('Y-m-d');
        $payload = [
            'countryId' => $countryId,
            'cityId' => $cityId,
            'tourId' => $tourId,
            'contractId' => $contractId,
            'travelDate' => $travelDate,
        ];

        $data = $this->post('/api/Tour/tourStaticDataById', $payload);
        $result = $data['result'][0] ?? ($data['result'] ?? []);

        if (!empty($result['tourImages']) && is_array($result['tourImages'])) {
            foreach ($result['tourImages'] as &$img) {
                if (!empty($img['imagePath'])) {
                    $img['imageUrl'] = $this->formatImageUrl($img['imagePath']);
                }
            }
        }

        return $result;
    }

    /**
     * 5. Get Tour Option Static Data: POST /api/Tour/touroptionstaticdata
     *
     * @return array{touroption: array, operationdays: array, specialdates: array, transfertime: array}
     */
    public function tourOptionStaticData(int $tourId, int $contractId): array
    {
        if ($this->isMock()) {
            return $this->mockClient->tourOptionStaticData($tourId, $contractId);
        }

        $data = $this->post('/api/Tour/touroptionstaticdata', [
            'tourId' => $tourId,
            'contractId' => $contractId,
        ]);

        return $data['result'] ?? [];
    }

    /**
     * 6. Get Tour List with Prices: POST /api/Tour/tourlist
     *
     * @return list<array{tourId: int, contractId: int, amount: float, discount: float, sortOrder: int}>
     */
    public function tourList(int $countryId, int $cityId, string $travelDate): array
    {
        if ($this->isMock()) {
            return $this->mockClient->tourList($countryId, $cityId, $travelDate);
        }

        $data = $this->post('/api/Tour/tourlist', [
            'countryId' => $countryId,
            'cityId' => $cityId,
            'travelDate' => $travelDate,
        ]);

        return $data['result'] ?? [];
    }

    /**
     * 7. Get Tour Options & Rates: POST /api/Tour/touroption
     *
     * @return list<array<string, mixed>>
     */
    public function tourOptions(
        int $tourId,
        int $contractId,
        string $travelDate,
        int $adults = 1,
        int $children = 0,
        int $infants = 0
    ): array {
        if ($this->isMock()) {
            return $this->mockClient->tourOptions($tourId, $contractId, $travelDate, $adults, $children, $infants);
        }

        $data = $this->post('/api/Tour/touroption', [
            'tourId' => $tourId,
            'contractId' => $contractId,
            'travelDate' => $travelDate,
            'noOfAdult' => $adults,
            'noOfChild' => $children,
            'noOfInfant' => $infants,
        ]);

        return $data['result'] ?? [];
    }

    /**
     * 8. Get Time Slots: POST /api/Tour/timeslot
     * (Call only when option has isSlot = true)
     *
     * @return list<array{tourOptionId: int, timeSlotId: string, timeSlot: string, available: int, adultPrice: float, childPrice: float, isDynamicPrice: bool}>
     */
    public function timeSlots(
        int $tourId,
        int $tourOptionId,
        int $transferId,
        string $travelDate,
        int $contractId,
        int $adults = 1,
        int $children = 0
    ): array {
        if ($this->isMock()) {
            return $this->mockClient->timeSlots($tourId, $tourOptionId, $transferId, $travelDate, $contractId, $adults, $children);
        }

        $data = $this->post('/api/Tour/timeslot', [
            'tourId' => $tourId,
            'tourOptionId' => $tourOptionId,
            'travelDate' => $travelDate,
            'transferId' => $transferId,
            'adult' => $adults,
            'child' => $children,
            'contractId' => $contractId,
        ]);

        return $data['result'] ?? [];
    }

    /**
     * 9. Check Tour Availability: POST /api/Tour/availability
     *
     * @return array{status: int, message: string, productType: int, isBookable: bool}
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
        if ($this->isMock()) {
            return $this->mockClient->availability($tourId, $tourOptionId, $transferId, $travelDate, $contractId, $adults, $children, $infants);
        }

        $data = $this->post('/api/Tour/availability', [
            'tourId' => $tourId,
            'tourOptionId' => $tourOptionId,
            'transferId' => $transferId,
            'travelDate' => $travelDate,
            'adult' => $adults,
            'child' => $children,
            'infant' => $infants,
            'contractId' => $contractId,
        ]);

        $item = $data['result'][0] ?? ['status' => 0, 'message' => 'no_response', 'productType' => 0];
        $item['isBookable'] = strtolower((string) ($item['message'] ?? '')) === 'success';

        return $item;
    }

    /**
     * 10. Tour Cancellation Policy: POST /api/Tour/policy
     *
     * @return array<string, mixed>
     */
    public function policy(
        int $tourId,
        int $tourOptionId,
        int $contractId,
        string $travelDate,
        string $startTime = '09:00',
        ?string $currentDate = null
    ): array {
        if ($this->isMock()) {
            return $this->mockClient->policy($tourId, $tourOptionId, $contractId, $travelDate, $startTime, $currentDate);
        }

        $currentDate = $currentDate ?: date('Y/m/d/H/i');
        return $this->post('/api/Tour/policy', [
            'tourId' => $tourId,
            'travelDate' => $travelDate,
            'startTime' => $startTime,
            'currentDate' => $currentDate,
            'contractId' => $contractId,
            'tourOptionId' => $tourOptionId,
        ]);
    }

    /**
     * 11. Create Booking: POST /api/Booking/bookings
     *
     * @param array{uniqueNo: int, TourDetails: list<array>, passengers: list<array>} $bookingPayload
     * @return array<string, mixed>
     */
    public function book(array $bookingPayload): array
    {
        Log::info('[RAYNA_AUDIT] Booking Request', ['mode' => $this->getMode(), 'payload' => $bookingPayload]);

        if ($this->isMock()) {
            $res = $this->mockClient->book($bookingPayload);
            Log::info('[RAYNA_AUDIT] Booking Mock Response', ['response' => $res]);
            return $res;
        }

        $response = $this->post('/api/Booking/bookings', $bookingPayload);
        Log::info('[RAYNA_AUDIT] Booking Live Response', ['response' => $response]);

        return $response['result'][0] ?? ($response['result'] ?? []);
    }

    /**
     * 12. Get Booked Tickets: POST /api/Booking/GetBookedTickets
     *
     * @param int $uniqueNo
     * @param string $referenceNo
     * @param list<array{serviceUniqueId: int, bookingId: int}> $bookedOptions
     * @return array<string, mixed>
     */
    public function getBookedTickets(int $uniqueNo, string $referenceNo, array $bookedOptions): array
    {
        if ($this->isMock()) {
            return $this->mockClient->getBookedTickets($uniqueNo, $referenceNo, $bookedOptions);
        }

        $payload = [
            'uniqNO' => $uniqueNo,
            'referenceNo' => $referenceNo,
            'bookedOption' => $bookedOptions,
        ];

        $data = $this->post('/api/Booking/GetBookedTickets', $payload);
        return $data['result'] ?? [];
    }

    /**
     * 13. Cancel Booking: POST /api/Booking/cancelbooking
     *
     * @return array<string, mixed>
     */
    public function cancelBooking(int $bookingId, string $referenceNo, string $reason = ''): array
    {
        Log::info('[RAYNA_AUDIT] Cancellation Request', ['mode' => $this->getMode(), 'bookingId' => $bookingId, 'referenceNo' => $referenceNo, 'reason' => $reason]);

        if ($this->isMock()) {
            $res = $this->mockClient->cancelBooking($bookingId, $referenceNo, $reason);
            Log::info('[RAYNA_AUDIT] Cancellation Mock Response', ['response' => $res]);
            return $res;
        }

        $payload = [
            'bookingId' => $bookingId,
            'referenceNo' => $referenceNo,
            'cancellationReason' => $reason,
        ];

        $response = $this->post('/api/Booking/cancelbooking', $payload);
        Log::info('[RAYNA_AUDIT] Cancellation Live Response', ['response' => $response]);

        return $response['result'] ?? [];
    }

    /**
     * Executes the documented full demo integration flow from rayna-api.json:
     * countries -> cities -> tours -> options -> slots when required -> availability -> policy -> booking preview.
     *
     * @return array<string, mixed>
     */
    public function runDemoFlow(?string $travelDate = null, int $adults = 1): array
    {
        $travelDate = $travelDate ?: date('Y-m-d', strtotime('+7 days'));
        $flow = [];

        // 1. Countries
        $countries = $this->countries();
        $selectedCountry = $countries[0] ?? ['countryId' => 1, 'countryName' => 'United Arab Emirates'];
        $flow['step1_countries'] = [
            'name' => '1. Countries (POST /api/Tour/countries)',
            'count' => count($countries),
            'selected' => $selectedCountry,
            'data' => $countries,
        ];

        // 2. Cities
        $cities = $this->cities((int) $selectedCountry['countryId']);
        $selectedCity = $cities[0] ?? ['cityId' => 101, 'cityName' => 'Dubai'];
        $flow['step2_cities'] = [
            'name' => '2. Cities (POST /api/Tour/cities)',
            'countryId' => $selectedCountry['countryId'],
            'count' => count($cities),
            'selected' => $selectedCity,
            'data' => $cities,
        ];

        // 3. Tours (TourStaticData)
        $tours = $this->tourStaticData((int) $selectedCountry['countryId'], (int) $selectedCity['cityId']);
        $selectedTour = $tours[0] ?? null;
        $flow['step3_tours'] = [
            'name' => '3. Tour Catalog (POST /api/Tour/tourstaticdata)',
            'countryId' => $selectedCountry['countryId'],
            'cityId' => $selectedCity['cityId'],
            'count' => count($tours),
            'selected' => $selectedTour,
            'data' => $tours,
        ];

        if (!$selectedTour) {
            return ['status' => 'incomplete', 'flow' => $flow];
        }

        $tourId = (int) $selectedTour['tourId'];
        $contractId = (int) ($selectedTour['contractId'] ?? 1001);
        $isSlotRequired = !empty($selectedTour['isSlot']);

        // 4. Options & Rates (POST /api/Tour/touroption)
        $options = $this->tourOptions($tourId, $contractId, $travelDate, $adults);
        $selectedOption = $options[0] ?? null;
        $flow['step4_options'] = [
            'name' => '4. Options & Pricing (POST /api/Tour/touroption)',
            'tourId' => $tourId,
            'contractId' => $contractId,
            'travelDate' => $travelDate,
            'adults' => $adults,
            'count' => count($options),
            'selected' => $selectedOption,
            'data' => $options,
        ];

        if (!$selectedOption) {
            return ['status' => 'incomplete', 'flow' => $flow];
        }

        $optionId = (int) $selectedOption['tourOptionId'];
        $transferId = (int) ($selectedOption['transferId'] ?? 41865);
        $rate = (float) ($selectedOption['adultPrice'] ?? $selectedOption['finalAmount'] ?? 150.0);

        // 5. Timeslots (POST /api/Tour/timeslot) — only if isSlot is true
        $selectedSlot = null;
        if ($isSlotRequired) {
            $slots = $this->timeSlots($tourId, $optionId, $transferId, $travelDate, $contractId, $adults);
            $selectedSlot = $slots[0] ?? null;
            $flow['step5_timeslots'] = [
                'name' => '5. Timeslots (POST /api/Tour/timeslot - isSlot = true)',
                'isSlot' => true,
                'count' => count($slots),
                'selected' => $selectedSlot,
                'data' => $slots,
            ];
        } else {
            $flow['step5_timeslots'] = [
                'name' => '5. Timeslots (Skipped: tour has isSlot = false)',
                'isSlot' => false,
                'selected' => null,
                'message' => 'Tour does not require time slot reservation as per rayna-api.json rules',
            ];
        }

        // 6. Availability (POST /api/Tour/availability)
        $avail = $this->availability($tourId, $optionId, $transferId, $travelDate, $contractId, $adults);
        $flow['step6_availability'] = [
            'name' => '6. Availability Check (POST /api/Tour/availability)',
            'isBookable' => $avail['isBookable'] ?? false,
            'message' => $avail['message'] ?? 'success',
            'data' => $avail,
        ];

        // 7. Cancellation Policy (POST /api/Tour/policy)
        $policy = $this->policy($tourId, $optionId, $contractId, $travelDate, '09:00');
        $flow['step7_policy'] = [
            'name' => '7. Cancellation Policy (POST /api/Tour/policy)',
            'currency' => $policy['currency'] ?? 'AED',
            'charges' => $policy['result'] ?? [],
        ];

        // 8. Booking Preview (POST /api/Booking/bookings)
        $uniqueNo = 10001;
        $bookingPayload = [
            'uniqueNo' => $uniqueNo,
            'TourDetails' => [
                [
                    'serviceUniqueId' => $uniqueNo,
                    'tourId' => $tourId,
                    'optionId' => $optionId,
                    'adult' => $adults,
                    'child' => 0,
                    'infant' => 0,
                    'tourDate' => $travelDate,
                    'timeSlotId' => $selectedSlot ? $selectedSlot['timeSlotId'] : 0,
                    'startTime' => $selectedSlot ? $selectedSlot['timeSlot'] : ($selectedOption['startTime'] ?? '09:00'),
                    'transferId' => $transferId,
                    'pickup' => $transferId === 41865 ? '' : 'Hotel Lobby [Sample]',
                    'adultRate' => $rate,
                    'childRate' => 0.0,
                    'serviceTotal' => $rate * $adults,
                ],
            ],
            'passengers' => [
                [
                    'serviceType' => 'tour',
                    'prefix' => 'Mr.',
                    'firstName' => 'John',
                    'lastName' => 'Doe',
                    'email' => 'john.doe@example.com',
                    'mobile' => '+971501234567',
                    'nationality' => 'Indian',
                    'message' => 'Sample booking preview via rayna-api.json demo flow',
                    'leadPassenger' => 1,
                    'paxType' => 'Adult',
                    'clientReferenceNo' => "REF-DEMO-{$uniqueNo}",
                ],
            ],
        ];

        $bookingResult = $this->book($bookingPayload);
        $flow['step8_booking_preview'] = [
            'name' => '8. Booking Preview & Confirmation (POST /api/Booking/bookings)',
            'requestPayload' => $bookingPayload,
            'confirmation' => $bookingResult,
        ];

        return [
            'status' => 'success',
            'mode' => $this->getMode(),
            'isSyntheticMock' => $this->isMock(),
            'notes' => 'Flow executed using documented schema definitions from rayna-api.json. Concrete names, pricing, and confirmations are synthetic mock values for demo purposes. No external calls or wallet debits were made.',
            'flow' => $flow,
        ];
    }

    /**
     * Internal POST request handler for live Rayna API.
     *
     * @throws RaynaApiException
     */
    public function post(string $endpoint, array $payload): array
    {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');

        /** @var PendingRequest $request */
        $request = Http::timeout($this->timeout)
            ->withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Accept' => 'application/json',
            ]);

        if ($this->token) {
            $request = $request->withToken($this->token);
        }

        try {
            $response = $request->post($url, $payload);
        } catch (\Throwable $e) {
            throw new RaynaApiException("Rayna connection failed: {$e->getMessage()}", 500, $e instanceof \Exception ? $e : null);
        }

        if (!$response->successful()) {
            $status = $response->status();
            $body = $response->json();
            $err = $body['error'] ?? $body['errormessage'] ?? $response->body();
            throw new RaynaApiException("Rayna API error [HTTP {$status}]: {$err}", $status);
        }

        $data = $response->json();
        if (!is_array($data)) {
            throw new RaynaApiException('Invalid JSON envelope received from Rayna API', 500);
        }

        // Rayna envelope check
        if (isset($data['statuscode']) && (int) $data['statuscode'] !== 200) {
            $code = (int) $data['statuscode'];
            $msg = $data['error'] ?? $data['errormessage'] ?? "Rayna returned status {$code}";
            throw new RaynaApiException($msg, $code);
        }

        if (!empty($data['error'])) {
            $errCode = is_numeric($data['error']) ? (int) $data['error'] : 0;
            throw new RaynaApiException((string) $data['error'], $errCode);
        }

        return $data;
    }
}

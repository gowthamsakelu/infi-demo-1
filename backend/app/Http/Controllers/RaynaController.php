<?php

namespace App\Http\Controllers;

use App\Models\SavedActivity;
use App\Support\Rayna\RaynaApiException;
use App\Support\Rayna\RaynaApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RaynaController extends Controller
{
    public function __construct(private readonly RaynaApiService $rayna) {}

    public function status(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'mode' => $this->rayna->getMode(),
            'configured' => $this->rayna->isConfigured(),
            'baseUrl' => $this->rayna->getBaseUrl(),
            'imageBase' => $this->rayna->getImageBase(),
        ]);
    }

    public function demoFlow(Request $request): JsonResponse
    {
        return $this->guard(function () use ($request) {
            $travelDate = $request->query('travelDate') ?: date('Y-m-d', strtotime('+7 days'));
            $adults = max(1, (int) ($request->query('adults') ?: 1));

            return $this->rayna->runDemoFlow($travelDate, $adults);
        });
    }

    public function countries(Request $request): JsonResponse
    {
        return $this->guard(function () use ($request) {
            $fresh = $request->boolean('fresh');
            $data = $this->rayna->countries($fresh);
            return ['success' => true, 'count' => count($data), 'data' => $data];
        });
    }

    public function cities(Request $request): JsonResponse
    {
        return $this->guard(function () use ($request) {
            $countryId = (int) $request->validate(['countryId' => 'required|integer'])['countryId'];
            $fresh = $request->boolean('fresh');
            $data = $this->rayna->cities($countryId, $fresh);
            return ['success' => true, 'count' => count($data), 'data' => $data];
        });
    }

    public function tours(Request $request): JsonResponse
    {
        return $this->guard(function () use ($request) {
            $validated = $request->validate([
                'countryId' => 'required|integer',
                'cityId' => 'required|integer',
                'fresh' => 'nullable|boolean',
            ]);

            $data = $this->rayna->tourStaticData((int) $validated['countryId'], (int) $validated['cityId'], (bool) ($validated['fresh'] ?? false));
            return ['success' => true, 'count' => count($data), 'data' => $data];
        });
    }

    public function tourDetails(Request $request, int $tourId): JsonResponse
    {
        return $this->guard(function () use ($request, $tourId) {
            $validated = $request->validate([
                'countryId' => 'required|integer',
                'cityId' => 'required|integer',
                'contractId' => 'required|integer',
                'travelDate' => 'nullable|date_format:Y-m-d',
            ]);

            $data = $this->rayna->tourStaticDataById(
                (int) $validated['countryId'],
                (int) $validated['cityId'],
                $tourId,
                (int) $validated['contractId'],
                $validated['travelDate'] ?? null
            );

            return ['success' => true, 'data' => $data];
        });
    }

    public function options(Request $request, int $tourId): JsonResponse
    {
        return $this->guard(function () use ($request, $tourId) {
            $validated = $request->validate([
                'contractId' => 'required|integer',
                'travelDate' => 'required|date_format:Y-m-d',
                'adults' => 'nullable|integer|min:1',
                'children' => 'nullable|integer|min:0',
                'infants' => 'nullable|integer|min:0',
            ]);

            $data = $this->rayna->tourOptions(
                $tourId,
                (int) $validated['contractId'],
                $validated['travelDate'],
                (int) ($validated['adults'] ?? 1),
                (int) ($validated['children'] ?? 0),
                (int) ($validated['infants'] ?? 0)
            );

            return ['success' => true, 'count' => count($data), 'data' => $data];
        });
    }

    public function availability(Request $request, int $tourId): JsonResponse
    {
        return $this->guard(function () use ($request, $tourId) {
            $validated = $request->validate([
                'tourOptionId' => 'required|integer',
                'transferId' => 'required|integer',
                'travelDate' => 'required|date_format:Y-m-d',
                'contractId' => 'required|integer',
                'adults' => 'nullable|integer|min:1',
                'children' => 'nullable|integer|min:0',
                'infants' => 'nullable|integer|min:0',
            ]);

            $data = $this->rayna->availability(
                $tourId,
                (int) $validated['tourOptionId'],
                (int) $validated['transferId'],
                $validated['travelDate'],
                (int) $validated['contractId'],
                (int) ($validated['adults'] ?? 1),
                (int) ($validated['children'] ?? 0),
                (int) ($validated['infants'] ?? 0)
            );

            return ['success' => true, 'data' => $data];
        });
    }

    public function syncAdventures(Request $request): JsonResponse
    {
        return $this->guard(function () use ($request) {
            $validated = $request->validate([
                'countryId' => 'required|integer',
                'cityId' => 'required|integer',
            ]);

            $tours = $this->rayna->tourStaticData((int) $validated['countryId'], (int) $validated['cityId'], true);
            $synced = 0;

            foreach ($tours as $t) {
                $tourId = (int) ($t['tourId'] ?? 0);
                if (!$tourId) continue;

                SavedActivity::updateOrCreate(
                    ['place_id' => "rayna:{$tourId}"],
                    [
                        'name' => $t['tourName'] ?? "Tour #{$tourId}",
                        'city' => $t['cityName'] ?? 'Dubai',
                        'address' => $t['cityName'] ?? 'Dubai',
                        'rating' => (float) ($t['rating'] ?? 4.5),
                        'reviews' => (int) ($t['reviewCount'] ?? 10),
                        'tag' => $t['cityTourType'] ?: 'Sightseeing',
                        'status' => 'active',
                        'partner' => 'Rayna Tours',
                        'description' => $t['tourShortDescription'] ?? '',
                        'image' => $t['imageUrl'] ?? ($t['imagePath'] ? $this->rayna->formatImageUrl($t['imagePath']) : null),
                        'duration_minutes' => !empty($t['duration']) ? (int) $t['duration'] * 60 : 180,
                    ]
                );
                $synced++;
            }

            return ['success' => true, 'synced' => $synced, 'message' => "Synced {$synced} tours into Adventures catalog."];
        });
    }

    private function guard(callable $fn): JsonResponse
    {
        try {
            return response()->json($fn());
        } catch (RaynaApiException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ], $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}


<?php

namespace App\Http\Controllers;

use App\Support\Ruyi\RuyiApiException;
use App\Support\Ruyi\RuyiApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The live Ruyi Travels lists (hotels, packages, activities, transport, blogs), read only. */
class RuyiController extends Controller
{
    public function __construct(private RuyiApiService $ruyi)
    {
    }

    public function status(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ['baseUrl' => $this->ruyi->baseUrl(), 'lists' => array_keys(RuyiApiService::ENDPOINTS), 'readOnly' => true]]);
    }

    public function index(Request $request, string $kind): JsonResponse
    {
        $input = $request->validate([
            'row' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'filters' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $rows = $this->ruyi->list($kind, (int) ($input['row'] ?? 0), $input['filters'] ?? null);
        } catch (RuyiApiException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 502);
        }

        return response()->json(['success' => true, 'data' => $rows, 'row' => (int) ($input['row'] ?? 0), 'count' => count($rows)]);
    }
}
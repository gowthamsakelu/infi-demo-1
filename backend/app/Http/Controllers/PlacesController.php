<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaceSearchRequest;
use App\Support\GooglePlaces;
use App\Support\PlacesException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** Our own front for Google Places: the browser never sees the API key, and every call is rate limited (throttle:places). */
class PlacesController extends Controller
{
    public function __construct(private readonly GooglePlaces $places) {}

    public function status(): JsonResponse
    {
        return response()->json(['enabled' => $this->places->configured()]);
    }

    public function search(PlaceSearchRequest $request): JsonResponse
    {
        return $this->guard(fn () => [
            'success' => true,
            'data' => $this->places->search($request->string('q')->toString(), $request->string('kind')->toString(), $request->input('location'), $request->input('session')),
        ]);
    }

    public function show(Request $request, string $placeId): JsonResponse
    {
        abort_unless(preg_match('/^[A-Za-z0-9_-]{10,255}$/', $placeId), 404);
        $session = $request->query('session');

        return $this->guard(fn () => [
            'success' => true,
            'data' => $this->places->details($placeId, is_string($session) && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $session) ? $session : null),
        ]);
    }

    public function photo(Request $request): Response|JsonResponse
    {
        $data = $request->validate([
            'ref' => ['required', 'string', 'regex:#^places/[A-Za-z0-9_-]+/photos/[A-Za-z0-9_-]+$#'],
            'w' => ['nullable', 'integer', 'min:32', 'max:800'],
        ]);

        try {
            $photo = $this->places->photo($data['ref'], (int) ($data['w'] ?? 160));
        } catch (PlacesException $e) {
            return $this->fail($e);
        }
        abort_if($photo === null, 404);

        return response($photo[0], 200, ['Content-Type' => $photo[1], 'Cache-Control' => 'public, max-age=3600']);
    }

    private function guard(callable $work): JsonResponse
    {
        try {
            return response()->json($work());
        } catch (PlacesException $e) {
            return $this->fail($e);
        }
    }

    private function fail(PlacesException $e): JsonResponse
    {
        return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], $e->status);
    }
}

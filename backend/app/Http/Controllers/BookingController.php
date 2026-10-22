<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Staff;
use App\Models\Vendor;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query();

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('type', strtoupper($request->category));
        }

        if ($request->has('tab') && $request->tab !== 'All Bookings') {
            $query->where('category', $request->tab);
        }

        if ($request->filled('search')) {
            $s = strtolower($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('id', 'like', "%{$s}%")
                  ->orWhere('destination', 'like', "%{$s}%");
            });
        }

        // Cap the list so a large table cannot make the page heavy; callers can page with ?limit=&offset=.
        $limit = min((int) $request->query('limit', 500), 500);
        $bookings = $query->orderBy('id')->offset((int) $request->query('offset', 0))->limit($limit)->get();

        return response()->json([
            'status' => 'success',
            'count' => $bookings->count(),
            'data' => $bookings
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(string $id): JsonResponse
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $booking
        ]);
    }

    /**
     * Assign one or many bookings to a team member, vendor or contact.
     */
    public function assign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'string|exists:bookings,id',
            'assignee.id' => 'required|string|max:50',
            'assignee.name' => 'required|string|max:120',
            'assignee.type' => 'nullable|string|max:30',
            'assignee.avatar' => 'nullable|string|max:500',
            'assignee.role' => 'nullable|string|max:150',
        ]);

        $assignee = $data['assignee'];
        foreach (Booking::whereIn('id', $data['ids'])->get() as $booking) {
            $booking->assigned_to = [
                'id' => $assignee['id'],
                'name' => $assignee['name'],
                'avatar' => $assignee['avatar'] ?? '',
                'role' => $assignee['role'] ?? ($assignee['type'] ?? ''),
            ];
            $booking->assigned_status = 'Assigned';
            $booking->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => count($data['ids']).' booking(s) assigned to '.$assignee['name'],
            'data' => Booking::whereIn('id', $data['ids'])->get()->map(fn ($b) => ['id' => $b->id, 'assigned_to' => $b->assigned_to, 'assigned_status' => $b->assigned_status]),
        ]);
    }

    /**
     * Mark a booking Paid or back to Pending.
     */
    public function updatePayment(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $data = $request->validate(['status' => 'required|in:Paid,Pending,Part Paid']);
        $booking->status = $data['status'];
        $booking->status_class = ['Paid' => 'status-paid', 'Part Paid' => 'status-part-paid', 'Pending' => 'status-pending'][$data['status']];
        $booking->save();

        return response()->json(['status' => 'success', 'data' => ['id' => $booking->id, 'status' => $booking->status, 'status_class' => $booking->status_class]]);
    }

    /**
     * Add a guest to a booking.
     */
    public function addGuest(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $request->validate([
            'name' => 'required|string',
            'age' => 'required|integer',
            'role' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $guests = $booking->guests ?? [];
        $newGuest = [
            'id' => count($guests) + 1,
            'name' => $request->input('name'),
            'age' => (int) $request->input('age'),
            'role' => $request->input('role', 'Adult'),
            'phone' => $request->input('phone', ''),
        ];

        $guests[] = $newGuest;
        $booking->guests = $guests;
        $booking->pax = count($guests);
        $booking->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Guest added successfully',
            'data' => $booking
        ]);
    }

    /**
     * Update special requirements.
     */
    public function updateSpecialRequirements(Request $request, string $id): JsonResponse
    {
        $booking = Booking::find($id);
        if (!$booking) {
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        $booking->special_requirements = $request->input('special_requirements', []);
        $booking->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Special requirements updated',
            'data' => $booking
        ]);
    }

    /**
     * Return team members, vendors, and contacts.
     */
    public function metadata(): JsonResponse
    {
        return response()->json([
            'staff' => Staff::all(),
            'vendors' => Vendor::all(),
            'contacts' => Contact::all(),
        ]);
    }
}

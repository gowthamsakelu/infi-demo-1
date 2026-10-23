<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFollowUpRequest;
use App\Models\FollowUp;
use App\Models\Inquiry;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Inquiry::query()->with('followUps');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category', strtoupper($request->category));
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to_id', $request->assigned_to);
        }
        if ($request->filled('from')) {
            $query->whereDate('travel_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('travel_date', '<=', $request->to);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('customer_name', 'like', "%{$s}%")
                  ->orWhere('trip', 'like', "%{$s}%")
                  ->orWhere('customer_phone', 'like', "%{$s}%")
                  ->orWhere('id', 'like', "%{$s}%");
            });
        }

        $inquiries = $query->orderBy('id')->get()->map(fn (Inquiry $i) => $this->present($i));

        return response()->json(['success' => true, 'data' => $inquiries]);
    }

    public function storeFollowUp(StoreFollowUpRequest $request, Inquiry $inquiry): JsonResponse
    {
        $staff = $request->actingStaff();

        $followUp = $inquiry->followUps()->create([
            'customer_phone' => FollowUp::normalizePhone($inquiry->customer_phone),
            'customer_name' => $inquiry->customer_name,
            'type' => $request->type,
            'call_outcome' => $request->type === 'called' ? $request->call_outcome : null,
            'scheduled_at' => $request->date.' '.$request->time.':00',
            'comment' => $request->comment,
            'created_by' => $staff->id,
            'created_by_name' => $staff->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Follow-up saved',
            'data' => $this->presentFollowUp($followUp),
            'inquiry' => $this->present($inquiry->fresh('followUps')),
        ], 201);
    }

    public function storeNote(Request $request, Inquiry $inquiry): JsonResponse
    {
        $data = $request->validate(['comment' => ['required', 'string', 'max:500']]);
        $staffId = (string) $request->input('created_by', 'ST-05');
        $staff = Staff::find($staffId);
        // An unknown staff id sent by the client is refused; the built-in default may be missing on a fresh database.
        abort_if($staff === null && $request->has('created_by'), 403);
        $data['comment'] = trim($data['comment']);
        abort_if($data['comment'] === '', 422, 'Note cannot be empty.');

        $note = $inquiry->followUps()->create([
            'customer_phone' => FollowUp::normalizePhone($inquiry->customer_phone),
            'customer_name' => $inquiry->customer_name,
            'type' => 'note',
            'scheduled_at' => now(),
            'comment' => $data['comment'],
            'created_by' => $staff?->id ?? $staffId,
            'created_by_name' => $staff?->name ?? 'Ruyi Admin',
        ]);

        return response()->json(['success' => true, 'message' => 'Note saved', 'data' => $this->presentFollowUp($note)], 201);
    }

    public function assign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string', 'exists:inquiries,id'],
            'staff_id' => ['nullable', 'exists:staff,id'],
            'assignee_id' => ['required_without:staff_id', 'nullable', 'string', 'max:50'],
            'assignee_name' => ['required_without:staff_id', 'nullable', 'string', 'max:120'],
        ]);

        if (! empty($data['staff_id'])) {
            $staff = Staff::findOrFail($data['staff_id']);
            $assigneeId = $staff->id;
            $assigneeName = $staff->name;
        } else {
            $assigneeId = $data['assignee_id'];
            $assigneeName = $data['assignee_name'];
        }

        Inquiry::whereIn('id', $data['ids'])->update([
            'assigned_to_id' => $assigneeId,
            'assigned_to_name' => $assigneeName,
        ]);

        return response()->json([
            'success' => true,
            'message' => count($data['ids']).' inquiries assigned to '.$assigneeName,
            'data' => Inquiry::with('followUps')->whereIn('id', $data['ids'])->get()->map(fn (Inquiry $i) => $this->present($i)),
        ]);
    }

    /** Follow-ups for one customer (matched on phone); feeds the Lead Flow / Journey timeline. */
    public function followUps(Request $request): JsonResponse
    {
        $query = FollowUp::query()->orderByDesc('scheduled_at')->orderByDesc('id');

        if ($request->filled('phone')) {
            $query->where('customer_phone', FollowUp::normalizePhone($request->phone));
        }

        return response()->json([
            'success' => true,
            'data' => $query->get()->map(fn (FollowUp $f) => $this->presentFollowUp($f)),
        ]);
    }

    private function present(Inquiry $i): array
    {
        $last = $i->followUps->first();

        return [
            'id' => $i->id,
            'customer_name' => $i->customer_name,
            'customer_phone' => $i->customer_phone,
            'customer_email' => $i->customer_email,
            'location' => $i->location,
            'lead_source' => $i->lead_source,
            'trip' => $i->trip,
            'category' => $i->category,
            'pax' => $i->pax,
            'nights' => $i->nights,
            'travel_date' => $i->travel_date?->format('Y-m-d'),
            'status' => $i->status,
            'assigned_to_id' => $i->assigned_to_id,
            'assigned_to_name' => $i->assigned_to_name,
            'notes' => $i->notes,
            'itinerary_days' => $i->itinerary_days ?? [],
            'follow_up_count' => $i->followUps->count(),
            'last_follow_up' => $last ? $this->presentFollowUp($last) : null,
        ];
    }

    private function presentFollowUp(FollowUp $f): array
    {
        return [
            'id' => $f->id,
            'inquiry_id' => $f->inquiry_id,
            'customer_phone' => $f->customer_phone,
            'type' => $f->type,
            'call_outcome' => $f->call_outcome,
            'scheduled_at' => $f->scheduled_at->format('Y-m-d\TH:i:s'),
            'comment' => $f->comment,
            'created_by' => $f->created_by,
            'created_by_name' => $f->created_by_name,
        ];
    }
}

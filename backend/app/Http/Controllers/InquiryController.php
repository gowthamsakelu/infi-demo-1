<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFollowUpRequest;
use App\Http\Requests\StoreInquiryRequest;
use App\Models\FollowUp;
use App\Models\Inquiry;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use App\Support\ItineraryWriter;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $inquiries = $query->orderByDesc('created_at')->orderBy('id')->get()->map(fn (Inquiry $i) => $this->present($i));

        return response()->json(['success' => true, 'data' => $inquiries]);
    }

    /**
     * Add Inquiry wizard: the inquiry, its guests and (when sent) its itinerary are saved together or not at all.
     * Everything is optional. Pax is the number of guests; nights and travel date come from the itinerary dates.
     */
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $staff = $request->actingStaff();
        $itinerary = $request->input('itinerary');
        $days = is_array($itinerary) ? array_values($itinerary['days'] ?? []) : null;
        $meta = is_array($itinerary) ? ($itinerary['meta'] ?? null) : null;
        [$start, $nights] = $days === null ? [null, null] : $this->tripOf($days, $meta);
        $guests = $this->guestsOf($request);

        $inquiry = DB::transaction(function () use ($request, $staff, $days, $meta, $start, $nights, $guests) {
            $inquiry = Inquiry::create([
                'id' => Inquiry::nextId(),
                'customer_name' => $request->input('name'),
                'customer_phone' => $request->input('phone'),
                'customer_email' => $request->input('email'),
                'location' => $request->input('city'),
                'trip' => $request->input('destination'),
                'budget' => $request->input('budget'),
                'notes' => $request->input('comment'),
                'pax' => count($guests),
                'nights' => $nights,
                'travel_date' => $start?->toDateString(),
                'status' => 'new',
                'assigned_to_id' => $staff->id,
                'assigned_to_name' => $staff->name,
                'guests' => $guests,
            ]);
            if ($days !== null) {
                ItineraryWriter::write($inquiry->itineraryKind(), $inquiry->getKey(), $days, $meta, $start);
            }

            return $inquiry;
        });

        return response()->json([
            'success' => true,
            'message' => 'Inquiry saved',
            'data' => $this->present($inquiry->fresh(['followUps'])),
            'meta' => $inquiry->fresh()->itinerary?->meta(),
        ], 201);
    }

    /** First day and number of nights of the trip, from the itinerary's own dates (or its day list). */
    private function tripOf(array $days, ?array $meta): array
    {
        $start = $meta['startDate'] ?? ($days[0]['isoDate'] ?? null);
        $end = $meta['endDate'] ?? null;
        if (! $start) {
            return [null, null];
        }
        $start = CarbonImmutable::parse($start);
        $nights = $end ? $start->diffInDays(CarbonImmutable::parse($end)) : max(0, count($days) - 1);

        return [$start, (int) $nights];
    }

    /** Guest 1 is the customer (name and phone follow the inquiry); the rest carry a name and an age only. */
    private function guestsOf(StoreInquiryRequest $request): array
    {
        $sent = array_values($request->input('guests', []) ?: []);
        $count = max(1, min(StoreInquiryRequest::MAX_GUESTS, count($sent)));
        $out = [];
        for ($i = 0; $i < $count; $i++) {
            $g = $sent[$i] ?? [];
            $name = $g['name'] ?? null;
            $out[] = [
                'id' => $i + 1,
                'name' => $i === 0 ? ($name ?: $request->input('name')) : $name,
                'age' => isset($g['age']) && $g['age'] !== '' ? (int) $g['age'] : null,
                'role' => $i === 0 ? 'Primary Contact' : null,
                'phone' => $i === 0 ? $request->input('phone') : null,
                'isPrimary' => $i === 0,
            ];
        }

        return $out;
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

    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'nullable|string|max:120',
            'customer_phone' => 'nullable|string|max:30',
            'customer_email' => 'nullable|email|max:120',
            'location' => 'nullable|string|max:150',
            'trip' => 'nullable|string|max:150',
            'status' => 'nullable|string|in:new,ongoing,warm,hot,closed,won',
            'notes' => 'nullable|string|max:1000',
            'budget' => 'nullable|numeric',
        ]);

        $inquiry->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json([
            'success' => true,
            'message' => 'Inquiry updated successfully',
            'data' => $this->present($inquiry->fresh(['followUps'])),
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
            'budget' => $i->budget,
            'guests' => $i->guests ?? [],
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

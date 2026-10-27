<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateContactMessageRequest;
use App\Models\ContactMessage;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Contacts page: messages from the website form. Opening one marks it read (the sidebar badge follows),
 * and "Convert to Inquiry" creates one row in the existing Inquiries module, once.
 */
class ContactMessageController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = ContactMessage::query()->orderByDesc('created_at')->orderByDesc('id')->get();
        $packages = $this->packagesFor($rows->pluck('destination')->filter()->unique()->all());

        return response()->json(['success' => true, 'data' => $rows->map(fn (ContactMessage $m) => $this->present($m, $packages))->values()]);
    }

    public function update(UpdateContactMessageRequest $request, ContactMessage $message): JsonResponse
    {
        $data = [];
        if ($request->has('read')) {
            $data['read_at'] = $request->boolean('read') ? ($message->read_at ?? now()) : null;
        }
        if ($request->has('status') && ! ($message->status === 'converted' && $request->input('status') !== 'converted')) {
            $data['status'] = $request->input('status'); // a converted message stays converted: its inquiry exists
        }
        if ($request->has('assigned_to_name')) {
            $data['assigned_to_name'] = $request->input('assigned_to_name') ?: null;
        }
        $message->update($data);

        return response()->json(['success' => true, 'data' => $this->present($message->fresh(), $this->packagesFor([$message->destination]))]);
    }

    /** Mark every unread message as read (spam stays as it is: it never counted). */
    public function readAll(): JsonResponse
    {
        ContactMessage::query()->whereNull('read_at')->where('status', '!=', 'spam')->update(['read_at' => now()]);

        return $this->index();
    }

    /** Create the inquiry, link it, mark the message Converted. A second press returns the same inquiry. */
    public function convert(ContactMessage $message): JsonResponse
    {
        if ($message->status === 'spam') {
            return response()->json(['success' => false, 'message' => 'Spam cannot be converted. Move it out of Spam first.'], 422);
        }

        [$inquiryId, $created] = DB::transaction(function () use ($message) {
            $row = ContactMessage::query()->lockForUpdate()->findOrFail($message->id);
            if ($row->inquiry_id) {
                return [$row->inquiry_id, false];
            }

            $guests = max(1, (int) $row->adults + (int) $row->children);
            $nights = $row->travel_start && $row->travel_end ? max(0, $row->travel_start->diffInDays($row->travel_end)) : null;
            $inquiry = Inquiry::create([
                'id' => Inquiry::nextId(),
                'customer_name' => $row->name,
                'customer_phone' => $row->phone,
                'customer_email' => $row->email,
                'lead_source' => $row->source ?: 'Website form',
                'trip' => $row->destination ?: $row->subject,
                'category' => 'TOUR',
                'pax' => $guests,
                'nights' => $nights,
                'travel_date' => $row->travel_start?->toDateString(),
                'status' => 'new',
                'assigned_to_name' => $row->assigned_to_name,
                'notes' => trim(($row->subject ? $row->subject."\n" : '').$row->message),
                'guests' => collect(range(1, $guests))->map(fn ($n) => [
                    'id' => $n, 'name' => $n === 1 ? $row->name : null, 'age' => null,
                    'role' => $n === 1 ? 'Primary Contact' : null, 'phone' => $n === 1 ? $row->phone : null, 'isPrimary' => $n === 1,
                ])->all(),
            ]);
            $row->update(['inquiry_id' => $inquiry->id, 'status' => 'converted', 'read_at' => $row->read_at ?? now()]);

            return [$inquiry->id, true];
        });

        $fresh = $message->fresh();

        return response()->json([
            'success' => true,
            'message' => $created ? 'Inquiry created' : 'Already converted',
            'created' => $created,
            'inquiry' => ['id' => $inquiryId],
            'data' => $this->present($fresh, $this->packagesFor([$fresh->destination])),
        ], $created ? 201 : 200);
    }

    /** destination => the first package whose name mentions it. Empty when the packages page has no table yet. */
    private function packagesFor(array $destinations): array
    {
        if (! Schema::hasTable('tour_packages') || ! Schema::hasColumn('tour_packages', 'name')) {
            return [];
        }
        $out = [];
        try {
            foreach (array_filter($destinations) as $d) {
                $q = DB::table('tour_packages')->where('name', 'like', '%'.$d.'%');
                if (Schema::hasColumn('tour_packages', 'status')) {
                    $q->orderByRaw("status = 'published' desc"); // a live package before a draft
                }
                $p = $q->orderBy('id')->first();
                if ($p) {
                    $out[$d] = ['name' => $p->name, 'days' => $p->days ?? null, 'nights' => $p->nights ?? null];
                }
            }
        } catch (\Throwable) {
            return []; // the packages table is another page's: never fail this page because of it
        }

        return $out;
    }

    private function present(ContactMessage $m, array $packages): array
    {
        return [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'phone' => $m->phone,
            'subject' => $m->subject,
            'message' => $m->message,
            'source' => $m->source,
            'destination' => $m->destination,
            'travelStart' => $m->travel_start?->format('Y-m-d'),
            'travelEnd' => $m->travel_end?->format('Y-m-d'),
            'adults' => $m->adults,
            'children' => $m->children,
            'interests' => $m->interests,
            'existingCustomer' => $m->existing_customer,
            'status' => $m->status,
            'unread' => $m->read_at === null && $m->status !== 'spam',
            'read' => $m->read_at !== null,
            'assignedTo' => $m->assigned_to_name,
            'inquiryId' => $m->inquiry_id,
            'package' => $m->destination ? ($packages[$m->destination] ?? null) : null,
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FollowUp;
use App\Models\Inquiry;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $admin = [
            'name' => $user?->name ?? 'Karan Sapalia',
            'email' => $user?->email ?? 'admin@ruyitravel.com',
            'role' => $user?->role ?? 'admin',
            'title' => $user?->title ?? 'Tour Operations Manager & Admin',
        ];

        // Reference date matching seeded operational calendar
        $today = CarbonImmutable::parse('2026-10-27');
        $todayStr = $today->toDateString();

        // 1. Inquiries Metric
        $totalInquiries = Inquiry::count();
        $newInquiries = Inquiry::where('status', 'new')->count();
        $ongoingInquiries = Inquiry::where('status', 'ongoing')->count();
        $closedInquiries = Inquiry::where('status', 'closed')->count();
        $warmInquiries = Inquiry::where('status', 'warm')->count();
        $hotInquiries = Inquiry::where('status', 'hot')->count();

        // 2. Bookings Metric
        $totalBookings = Booking::count();
        $upcomingBookings = Booking::whereDate('start_date', '>', $todayStr)->count();
        $ongoingBookings = Booking::whereDate('start_date', '<=', $todayStr)
            ->whereDate('end_date', '>=', $todayStr)
            ->count();
        $completedBookings = Booking::whereDate('end_date', '<', $todayStr)->count();

        // 3. Revenue Metric
        $totalRevenue = (int) Booking::sum('raw_price');
        $tourRevenue = (int) Booking::where('type', 'TOUR')->sum('raw_price');
        $activityRevenue = (int) Booking::where('type', 'ACTIVITY')->sum('raw_price');
        $otherRevenue = (int) Booking::whereNotIn('type', ['TOUR', 'ACTIVITY'])->sum('raw_price');

        // 4. Team Performance Metric
        $assignedLeads = Inquiry::whereNotNull('assigned_to_name')->count();
        $teamNew = $newInquiries;
        $teamInProgress = Inquiry::whereIn('status', ['ongoing', 'warm', 'hot'])->count();
        $teamConverted = Inquiry::where('status', 'converted')->count();

        // 5. Calendar Metric (Today's Scheduled Events)
        $todayBookings = Booking::query()
            ->select('id', 'title', 'type', 'pax', 'status', 'destination', 'customer', 'guests', 'start_date', 'end_date', 'itinerary_days')
            ->whereDate('start_date', '<=', $todayStr)
            ->whereDate('end_date', '>=', $todayStr)
            ->get();

        $todayEvents = [];
        foreach ($todayBookings as $b) {
            $start = CarbonImmutable::parse($b->start_date)->startOfDay();
            foreach ($b->itinerary_days ?? [] as $i => $day) {
                $date = $start->addDays($i);
                if ($date->toDateString() !== $todayStr) {
                    continue;
                }
                foreach ($day['items'] ?? [] as $item) {
                    if (($item['type'] ?? '') === 'note') {
                        continue;
                    }
                    $todayEvents[] = [
                        'bookingId' => $b->id,
                        'title' => $item['title'] ?? 'Event',
                        'type' => $item['type'] ?? 'tour',
                        'time' => $item['time'] ?? '10:00 AM',
                        'customer' => $b->customer['name'] ?? ($b->guests[0]['name'] ?? 'Guest'),
                        'destination' => $b->destination,
                    ];
                }
            }
        }
        $todayTotalEvents = count($todayEvents);
        $todayTours = count(array_filter($todayEvents, fn ($e) => in_array($e['type'], ['tour', 'sightseeing'])));
        $todayActivities = count(array_filter($todayEvents, fn ($e) => in_array($e['type'], ['activity', 'activities'])));

        // 6. Payments Metric
        $receivedPayments = (int) Booking::where('status', 'Paid')->sum('raw_price');
        $pendingPayments = (int) Booking::where('status', 'Pending')->sum('raw_price');
        $partPaidPayments = (int) Booking::where('status', 'Part Paid')->sum('raw_price');
        $refunds = 0;

        // Needs Attention Priority Actions
        $pendingBookingsCount = Booking::where('status', 'Pending')->count();
        $needsAttention = [
            'pending_payments_count' => $pendingBookingsCount,
            'pending_payments_amount' => $pendingPayments,
            'unassigned_inquiries_count' => $newInquiries,
            'active_trips_today' => $ongoingBookings,
        ];

        // Upcoming Trips (Top 5 next departures or active)
        $upcomingTrips = Booking::query()
            ->select('id', 'title', 'type', 'pax', 'price', 'raw_price', 'status', 'destination', 'customer', 'start_date', 'end_date', 'dates')
            ->whereDate('end_date', '>=', $todayStr)
            ->orderBy('start_date')
            ->take(5)
            ->get()
            ->map(function ($b) use ($todayStr) {
                $start = CarbonImmutable::parse($b->start_date);
                $isOngoing = $b->start_date <= $todayStr && $b->end_date >= $todayStr;

                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'type' => $b->type,
                    'pax' => $b->pax,
                    'price' => $b->price ?: ('₹' . number_format($b->raw_price)),
                    'raw_price' => $b->raw_price,
                    'status' => $b->status,
                    'is_ongoing' => $isOngoing,
                    'destination' => $b->destination,
                    'customer_name' => $b->customer['name'] ?? 'Guest',
                    'customer_phone' => $b->customer['phone'] ?? '',
                    'start_date' => $b->start_date,
                    'end_date' => $b->end_date,
                    'dates' => $b->dates ?: ($start->format('d M') . ' – ' . CarbonImmutable::parse($b->end_date)->format('d M Y')),
                ];
            });

        // Recent Inquiries
        $recentInquiries = Inquiry::query()
            ->select('id', 'customer_name', 'customer_phone', 'trip', 'status', 'pax', 'nights', 'budget', 'assigned_to_name', 'created_at')
            ->orderBy('created_at', 'desc')
            ->take(6)
            ->get()
            ->map(function ($inq) {
                return [
                    'id' => $inq->id,
                    'customer_name' => $inq->customer_name,
                    'customer_phone' => $inq->customer_phone,
                    'trip' => $inq->trip,
                    'status' => $inq->status,
                    'pax' => $inq->pax,
                    'nights' => $inq->nights,
                    'budget' => $inq->budget ? ('₹' . number_format($inq->budget)) : 'Custom',
                    'assigned_to' => $inq->assigned_to_name ?: 'Unassigned',
                    'created_at' => $inq->created_at?->diffForHumans() ?? 'Recently',
                ];
            });

        // Recent Activity Feed
        $recentActivity = FollowUp::query()
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($f) {
                return [
                    'id' => $f->id,
                    'inquiry_id' => $f->inquiry_id,
                    'customer_name' => $f->customer_name,
                    'type' => $f->type,
                    'comment' => $f->comment,
                    'author' => $f->created_by_name ?: 'Staff',
                    'time' => $f->created_at?->diffForHumans() ?? 'Recently',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'admin' => $admin,
                'current_date' => $today->format('l, d F Y'),
                'metrics' => [
                    'inquiries' => [
                        'total' => $totalInquiries,
                        'new' => $newInquiries,
                        'ongoing' => $ongoingInquiries,
                        'closed' => $closedInquiries,
                        'warm' => $warmInquiries,
                        'hot' => $hotInquiries,
                    ],
                    'bookings' => [
                        'total' => $totalBookings,
                        'upcoming' => $upcomingBookings,
                        'ongoing' => $ongoingBookings,
                        'completed' => $completedBookings,
                    ],
                    'revenue' => [
                        'total' => $totalRevenue,
                        'total_formatted' => $this->formatLakh($totalRevenue),
                        'tour' => $tourRevenue,
                        'tour_formatted' => $this->formatLakh($tourRevenue),
                        'activity' => $activityRevenue,
                        'activity_formatted' => $this->formatLakh($activityRevenue),
                        'other' => $otherRevenue,
                        'other_formatted' => $this->formatLakh($otherRevenue),
                    ],
                    'team' => [
                        'total' => $assignedLeads ?: $totalInquiries,
                        'new' => $teamNew,
                        'in_progress' => $teamInProgress,
                        'converted' => $teamConverted,
                    ],
                    'calendar' => [
                        'total' => $todayTotalEvents,
                        'tours' => $todayTours,
                        'activities' => $todayActivities,
                        'events' => $todayEvents,
                    ],
                    'payments' => [
                        'total_received' => $receivedPayments,
                        'received_formatted' => $this->formatLakh($receivedPayments),
                        'pending' => $pendingPayments,
                        'pending_formatted' => $this->formatLakh($pendingPayments),
                        'refunds' => $refunds,
                        'refunds_formatted' => '₹0.00',
                        'part_paid' => $partPaidPayments,
                        'part_paid_formatted' => $this->formatLakh($partPaidPayments),
                    ],
                ],
                'needs_attention' => $needsAttention,
                'upcoming_trips' => $upcomingTrips,
                'recent_inquiries' => $recentInquiries,
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    private function formatLakh(int|float $val): string
    {
        if ($val >= 100000) {
            return '₹' . number_format($val / 100000, 2) . 'L';
        }

        return '₹' . number_format($val);
    }
}

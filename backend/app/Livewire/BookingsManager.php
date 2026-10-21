<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Booking;
use App\Models\Staff;
use App\Models\Vendor;
use App\Models\Contact;

class BookingsManager extends Component
{
    // Search and Filters
    public string $search = '';
    public string $tab = 'All Bookings';
    public string $category = 'ALL';

    // Selection State
    public array $selectedBookings = [];
    public bool $isBulkMoreOpen = false;

    // Slide-over Drawer / Modal State
    public ?string $activeBookingId = null;
    public string $activeDrawerTab = 'customer-details';
    public string $guestSearch = '';

    // Modals
    public bool $showAddGuestModal = false;
    public string $guestName = '';
    public int $guestAge = 30;
    public string $guestRole = 'Adult';
    public string $guestPhone = '';
    public string $guestNotes = '';

    public bool $showSpecialReqModal = false;
    public string $customReqText = '';
    public array $tempSpecialReqs = [];

    public bool $showActivityDetailsModal = false;
    public ?array $selectedActivity = null;
    public string $selectedActivityDay = '';

    public bool $showEditActivityModal = false;
    public string $editDay = '';
    public string $editItemId = '';
    public string $editTitle = '';
    public string $editSubtitle = '';
    public string $editType = 'transport';

    public bool $showAddEventModal = false;
    public string $eventDay = 'Day 1';
    public string $eventTitle = '';
    public string $eventSubtitle = '';
    public string $eventType = 'sightseeing';

    public bool $showAssignModal = false;
    public string $assignDay = '';
    public string $assignItemId = '';
    public ?array $assignTargetItem = null;
    public string $assignCategory = 'team'; // 'team', 'vendors', 'contacts'

    public string $newNoteText = '';

    // Toast
    public ?string $toastMessage = null;
    public string $toastType = 'info';

    public function setTab(string $tab): void
    {
        $this->tab = $tab;
    }

    public function setCategory(string $cat): void
    {
        $this->category = $cat;
        $query = Booking::query();
        if ($cat !== 'ALL') {
            if ($cat === 'VILLA') {
                $query->whereIn('type', ['VILLA', 'RESORT']);
            } else {
                $query->where('type', $cat);
            }
        }
        if ($this->tab !== 'All Bookings') {
            $query->where('category', $this->tab);
        }
        if ($query->count() === 0) {
            $this->tab = 'All Bookings';
        }
    }

    public function clearSearch(): void
    {
        $this->search = '';
    }

    public function toggleSelectBooking(string $id): void
    {
        if (in_array($id, $this->selectedBookings)) {
            $this->selectedBookings = array_values(array_diff($this->selectedBookings, [$id]));
        } else {
            $this->selectedBookings[] = $id;
        }
    }

    public function toggleSelectAll(): void
    {
        $currentIds = $this->filteredBookings->pluck('id')->toArray();
        if (count($this->selectedBookings) === count($currentIds) && count($currentIds) > 0) {
            $this->selectedBookings = [];
        } else {
            $this->selectedBookings = $currentIds;
        }
    }

    public function clearSelection(): void
    {
        $this->selectedBookings = [];
        $this->isBulkMoreOpen = false;
    }

    public function toggleBulkMore(): void
    {
        $this->isBulkMoreOpen = !$this->isBulkMoreOpen;
    }

    public function bulkAssign(): void
    {
        if (empty($this->selectedBookings)) return;
        $count = count($this->selectedBookings);
        
        $staff = Staff::first();
        foreach ($this->selectedBookings as $id) {
            $b = Booking::find($id);
            if ($b) {
                $b->category = 'Assigned';
                $b->assigned_status = 'Assigned';
                $b->assigned_to = [
                    'name' => $staff ? $staff->name : 'Rahul Mehta',
                    'role' => $staff ? $staff->role : 'Operations Lead',
                    'avatar' => $staff ? $staff->avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                ];
                $b->save();
            }
        }
        $this->showToast("Successfully assigned {$count} booking(s) to " . ($staff ? $staff->name : 'Rahul Mehta') . "!", 'success');
        $this->selectedBookings = [];
        $this->isBulkMoreOpen = false;
    }

    public function bulkMarkPaid(): void
    {
        if (empty($this->selectedBookings)) return;
        $count = count($this->selectedBookings);

        foreach ($this->selectedBookings as $id) {
            $b = Booking::find($id);
            if ($b) {
                $b->status = 'Confirmed';
                $b->status_class = 'status-confirmed';
                $b->save();
            }
        }
        $this->showToast("Marked {$count} booking(s) as Confirmed & Paid!", 'success');
        $this->isBulkMoreOpen = false;
    }

    public function bulkMarkUnpaid(): void
    {
        if (empty($this->selectedBookings)) return;
        $count = count($this->selectedBookings);

        foreach ($this->selectedBookings as $id) {
            $b = Booking::find($id);
            if ($b) {
                $b->status = 'Pending';
                $b->status_class = 'status-pending';
                $b->save();
            }
        }
        $this->showToast("Marked {$count} booking(s) as Unpaid (Pending)!", 'info');
        $this->isBulkMoreOpen = false;
    }

    public function getIsAllSelectedPaidProperty(): bool
    {
        if (empty($this->selectedBookings)) return false;
        $items = Booking::whereIn('id', $this->selectedBookings)->get();
        return $items->isNotEmpty() && $items->every(fn($b) => in_array($b->status, ['Paid', 'Confirmed']));
    }

    public function openDrawer(string $id): void
    {
        $this->activeBookingId = $id;
        $this->activeDrawerTab = 'customer-details';
    }

    public function closeDrawer(): void
    {
        $this->activeBookingId = null;
    }

    public function setDrawerTab(string $tab): void
    {
        $this->activeDrawerTab = $tab;
    }

    public function confirmBooking(string $id): void
    {
        $b = Booking::find($id);
        if ($b) {
            $b->status = 'Confirmed';
            $b->status_class = 'status-confirmed';
            $b->save();
            $this->showToast("Booking {$b->id} confirmed successfully!", 'success');
        }
    }

    // Guest Operations
    public function openAddGuestModal(): void
    {
        $this->guestName = '';
        $this->guestAge = 30;
        $this->guestRole = 'Adult';
        $this->guestPhone = '';
        $this->guestNotes = '';
        $this->showAddGuestModal = true;
    }

    public function closeAddGuestModal(): void
    {
        $this->showAddGuestModal = false;
    }

    public function saveGuest(): void
    {
        if (empty(trim($this->guestName))) return;
        if (!$this->activeBookingId) return;

        $booking = Booking::find($this->activeBookingId);
        if ($booking) {
            $guests = $booking->guests ?? [];
            $guests[] = [
                'id' => count($guests) + 1,
                'name' => trim($this->guestName),
                'age' => $this->guestAge,
                'role' => $this->guestRole,
                'phone' => trim($this->guestPhone) ?: '+91 99884 84884',
                'notes' => trim($this->guestNotes),
            ];
            $booking->guests = $guests;
            $booking->pax = count($guests);
            $booking->save();

            $this->showToast("Added {$this->guestName} to {$booking->title}!", 'success');
        }

        $this->showAddGuestModal = false;
    }

    public function removeGuest(int $guestId): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if ($booking) {
            $guests = collect($booking->guests ?? [])->reject(fn($g) => ($g['id'] ?? null) == $guestId)->values()->toArray();
            $booking->guests = $guests;
            $booking->pax = max(1, count($guests));
            $booking->save();
            $this->showToast("Removed guest from booking.", 'info');
        }
    }

    // Special Requirements
    public function openSpecialReqModal(): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        $this->tempSpecialReqs = $booking->special_requirements ?? [];
        $this->customReqText = '';
        $this->showSpecialReqModal = true;
    }

    public function closeSpecialReqModal(): void
    {
        $this->showSpecialReqModal = false;
    }

    public function addPresetRequirement(string $presetId): void
    {
        $presets = [
            'preset-1' => ['icon' => 'leaf', 'text' => 'Vegetarian Food', 'color' => '#16A34A'],
            'preset-2' => ['icon' => 'bed', 'text' => '2 Connecting Rooms', 'color' => '#2563EB'],
            'preset-3' => ['icon' => 'wheelchair', 'text' => 'Wheelchair Assistance', 'color' => '#2563EB'],
            'preset-4' => ['icon' => 'waves', 'text' => 'Near Beach', 'color' => '#0284C7'],
            'preset-5' => ['icon' => 'smile', 'text' => 'Kid Friendly Activities', 'color' => '#EA580C'],
            'preset-6' => ['icon' => 'baby', 'text' => 'Baby Crib / Cot', 'color' => '#8B5CF6'],
            'preset-7' => ['icon' => 'clock', 'text' => 'Late Check-out', 'color' => '#D97706'],
            'preset-8' => ['icon' => 'utensils', 'text' => 'Jain / Non-Spicy Food', 'color' => '#10B981'],
            'preset-9' => ['icon' => 'shield', 'text' => 'First Aid & Medical Kit', 'color' => '#DC2626'],
        ];

        if (isset($presets[$presetId])) {
            $p = $presets[$presetId];
            $this->tempSpecialReqs[] = [
                'id' => 'sr-' . uniqid(),
                'icon' => $p['icon'],
                'text' => $p['text'],
                'color' => $p['color'],
            ];
        }
    }

    public function addCustomRequirement(): void
    {
        if (empty(trim($this->customReqText))) return;
        $this->tempSpecialReqs[] = [
            'id' => 'sr-' . uniqid(),
            'icon' => 'star',
            'text' => trim($this->customReqText),
            'color' => '#2563EB',
        ];
        $this->customReqText = '';
    }

    public function removeSpecialReq(int $index): void
    {
        unset($this->tempSpecialReqs[$index]);
        $this->tempSpecialReqs = array_values($this->tempSpecialReqs);
    }

    public function saveSpecialRequirements(): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if ($booking) {
            $booking->special_requirements = $this->tempSpecialReqs;
            $booking->save();
            $this->showToast("Special requirements updated!", 'success');
        }
        $this->showSpecialReqModal = false;
    }

    // Itinerary Operations
    public function openActivityDetails(string $day, string $itemId): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        foreach ($booking->itinerary_days ?? [] as $d) {
            if ($d['day'] === $day) {
                foreach ($d['items'] ?? [] as $item) {
                    if ($item['id'] === $itemId) {
                        $this->selectedActivity = $item;
                        $this->selectedActivityDay = $day;
                        $this->showActivityDetailsModal = true;
                        return;
                    }
                }
            }
        }
    }

    public function closeActivityDetails(): void
    {
        $this->showActivityDetailsModal = false;
        $this->selectedActivity = null;
    }

    public function toggleActivityCompleted(string $day, string $itemId): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        $days = $booking->itinerary_days ?? [];
        foreach ($days as &$d) {
            if ($d['day'] === $day) {
                foreach ($d['items'] as &$item) {
                    if ($item['id'] === $itemId) {
                        $item['isCompleted'] = !($item['isCompleted'] ?? false);
                        $this->showToast($item['isCompleted'] ? "Marked as completed!" : "Marked as pending.", 'info');
                    }
                }
            }
        }
        $booking->itinerary_days = $days;
        $booking->save();

        if ($this->selectedActivity && $this->selectedActivity['id'] === $itemId) {
            $this->closeActivityDetails();
        }
    }

    public function openEditActivity(string $day, string $itemId): void
    {
        $this->closeActivityDetails();
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        foreach ($booking->itinerary_days ?? [] as $d) {
            if ($d['day'] === $day) {
                foreach ($d['items'] ?? [] as $item) {
                    if ($item['id'] === $itemId) {
                        $this->editDay = $day;
                        $this->editItemId = $itemId;
                        $this->editTitle = $item['title'] ?? '';
                        $this->editSubtitle = $item['subtitle'] ?? '';
                        $this->editType = $item['type'] ?? 'transport';
                        $this->showEditActivityModal = true;
                        return;
                    }
                }
            }
        }
    }

    public function closeEditActivity(): void
    {
        $this->showEditActivityModal = false;
    }

    public function saveEditActivity(): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        $days = $booking->itinerary_days ?? [];
        foreach ($days as &$d) {
            if ($d['day'] === $this->editDay) {
                foreach ($d['items'] as &$item) {
                    if ($item['id'] === $this->editItemId) {
                        $item['title'] = $this->editTitle;
                        $item['subtitle'] = $this->editSubtitle;
                        $item['type'] = $this->editType;
                    }
                }
            }
        }
        $booking->itinerary_days = $days;
        $booking->save();

        $this->showToast("Activity updated!", 'success');
        $this->showEditActivityModal = false;
    }

    public function openAddEvent(?string $day = null): void
    {
        $this->eventDay = $day ?? 'Day 1';
        $this->eventTitle = '';
        $this->eventSubtitle = '';
        $this->eventType = 'sightseeing';
        $this->showAddEventModal = true;
    }

    public function closeAddEvent(): void
    {
        $this->showAddEventModal = false;
    }

    public function saveAddEvent(): void
    {
        if (empty(trim($this->eventTitle))) return;
        if (!$this->activeBookingId) return;

        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        $days = $booking->itinerary_days ?? [];
        $found = false;

        $iconMap = [
            'transport' => 'bus',
            'hotel' => 'bed',
            'sightseeing' => 'compass',
            'activity' => 'activity',
            'food' => 'coffee',
        ];

        $newItem = [
            'id' => 'IT-' . strtoupper(substr(uniqid(), -6)),
            'type' => $this->eventType,
            'icon' => $iconMap[$this->eventType] ?? 'compass',
            'title' => trim($this->eventTitle),
            'subtitle' => trim($this->eventSubtitle),
            'assigned' => ['isAssigned' => false],
            'isCompleted' => false,
        ];

        foreach ($days as &$d) {
            if ($d['day'] === $this->eventDay) {
                $d['items'][] = $newItem;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $days[] = [
                'day' => $this->eventDay,
                'date' => 'Upcoming',
                'items' => [$newItem]
            ];
        }

        $booking->itinerary_days = $days;
        $booking->save();

        $this->showToast("Added event to {$this->eventDay}!", 'success');
        $this->showAddEventModal = false;
    }

    public function openAssignModal(string $day, string $itemId): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        foreach ($booking->itinerary_days ?? [] as $d) {
            if ($d['day'] === $day) {
                foreach ($d['items'] ?? [] as $item) {
                    if ($item['id'] === $itemId) {
                        $this->assignDay = $day;
                        $this->assignItemId = $itemId;
                        $this->assignTargetItem = $item;
                        $this->assignCategory = 'team';
                        $this->showAssignModal = true;
                        return;
                    }
                }
            }
        }
    }

    public function closeAssignModal(): void
    {
        $this->showAssignModal = false;
        $this->assignTargetItem = null;
    }

    public function setAssignCategory(string $cat): void
    {
        $this->assignCategory = $cat;
    }

    public function confirmAssignment(string $assigneeId, string $type): void
    {
        if (!$this->activeBookingId) return;
        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        $assignedData = null;
        if ($type === 'team') {
            $staff = Staff::find($assigneeId);
            if ($staff) {
                $assignedData = [
                    'isAssigned' => true,
                    'name' => $staff->name,
                    'avatar' => $staff->avatar,
                    'role' => $staff->role,
                ];
            }
        } elseif ($type === 'vendors') {
            $vendor = Vendor::find($assigneeId);
            if ($vendor) {
                $assignedData = [
                    'isAssigned' => true,
                    'name' => $vendor->name,
                    'avatar' => $vendor->image,
                    'role' => $vendor->service,
                ];
            }
        } elseif ($type === 'contacts') {
            $contact = Contact::find($assigneeId);
            if ($contact) {
                $assignedData = [
                    'isAssigned' => true,
                    'name' => $contact->name,
                    'avatar' => $contact->avatar,
                    'role' => $contact->role,
                ];
            }
        }

        if ($assignedData) {
            $days = $booking->itinerary_days ?? [];
            foreach ($days as &$d) {
                if ($d['day'] === $this->assignDay) {
                    foreach ($d['items'] as &$item) {
                        if ($item['id'] === $this->assignItemId) {
                            $item['assigned'] = $assignedData;
                        }
                    }
                }
            }
            $booking->itinerary_days = $days;
            $booking->save();

            $this->showToast("Assigned to {$assignedData['name']}!", 'success');
        }

        $this->closeAssignModal();
    }

    // Updates / Notes
    public function addNote(): void
    {
        if (empty(trim($this->newNoteText))) return;
        if (!$this->activeBookingId) return;

        $booking = Booking::find($this->activeBookingId);
        if (!$booking) return;

        $customer = $booking->customer ?? [];
        $leadFlow = $customer['leadFlow'] ?? [];

        $leadFlow[] = [
            'date' => now()->format('d M'),
            'time' => now()->format('h:i A'),
            'type' => 'note',
            'iconBg' => 'icon-blue',
            'title' => 'Operations Note',
            'desc' => trim($this->newNoteText),
            'author' => 'By Karan Sapalia (Admin)'
        ];

        $customer['leadFlow'] = $leadFlow;
        $booking->customer = $customer;
        $booking->save();

        $this->newNoteText = '';
        $this->showToast("Note added to update log!", 'success');
    }

    public function triggerAction(string $type): void
    {
        if ($type === 'call') {
            $this->showToast("Dialing customer phone...", 'info');
        } elseif ($type === 'whatsapp') {
            $this->showToast("Opening WhatsApp conversation...", 'success');
        } elseif ($type === 'share') {
            $this->showToast("Booking voucher link copied to clipboard!", 'success');
        }
    }

    public function showToast(string $message, string $type = 'info'): void
    {
        $this->toastMessage = $message;
        $this->toastType = $type;
        $this->dispatch('show-toast', ['message' => $message, 'type' => $type]);
    }

    // Computed Properties
    public function getFilteredBookingsProperty()
    {
        $query = Booking::query();

        if ($this->tab !== 'All Bookings') {
            $query->where('category', $this->tab);
        }

        if ($this->category !== 'ALL') {
            if ($this->category === 'VILLA') {
                $query->whereIn('type', ['VILLA', 'RESORT']);
            } else {
                $query->where('type', $this->category);
            }
        }

        if (!empty(trim($this->search))) {
            $s = strtolower(trim($this->search));
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('id', 'like', "%{$s}%")
                  ->orWhere('destination', 'like', "%{$s}%");
            });
        }

        return $query->get();
    }

    public function getActiveBookingProperty()
    {
        if (!$this->activeBookingId) return null;
        return Booking::find($this->activeBookingId);
    }

    public function getStatsProperty(): array
    {
        $query = Booking::query();
        if ($this->category !== 'ALL') {
            if ($this->category === 'VILLA') {
                $query->whereIn('type', ['VILLA', 'RESORT']);
            } else {
                $query->where('type', $this->category);
            }
        }
        $all = $query->get();
        $totalBookings = $all->count();
        $totalPax = $all->sum('pax');
        $totalRev = $all->sum('raw_price');
        $pendingRev = $all->where('status', 'Pending')->sum('raw_price');

        return [
            'total' => $totalBookings,
            'pax' => $totalPax,
            'revenue' => '₹' . number_format($totalRev),
            'pending' => '₹' . number_format($pendingRev),
            'countNew' => $all->where('category', 'New Bookings')->count(),
            'countAssigned' => $all->where('category', 'Assigned')->count(),
            'countOngoing' => $all->where('category', 'Ongoing')->count(),
        ];
    }

    public function render()
    {
        return view('livewire.bookings-manager', [
            'bookings' => $this->filteredBookings,
            'activeBooking' => $this->activeBooking,
            'stats' => $this->stats,
            'staffList' => Staff::all(),
            'vendorsList' => Vendor::all(),
            'contactsList' => Contact::all(),
        ])->layout('layouts.app');
    }
}

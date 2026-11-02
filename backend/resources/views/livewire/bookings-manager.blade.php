<div class="app-root-container" id="app-root-container">
    <!-- ========================================== -->
    <!-- DESKTOP AREA CONTAINER                     -->
    <!-- ========================================== -->
    <div id="desktop-view-slot" class="view-slot-desktop">
        <div class="desktop-layout">
            <!-- Left Sidebar -->
            <aside class="desktop-sidebar">
                <div class="sidebar-brand">
                    <div class="brand-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                        </svg>
                    </div>
                    <div class="brand-text-col">
                        <h2>{{ \App\Models\AppSetting::read('company', [])['name'] ?? 'Ruyi Admin' }}</h2>
                        <p>Travel Operations</p>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <span class="nav-section-title">Menu</span>
                    <a class="sidebar-nav-item" href="#">
                        <div class="nav-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span>Dashboard</span>
                        </div>
                    </a>

                    <a class="sidebar-nav-item active" href="#">
                        <div class="nav-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                <rect width="20" height="14" x="2" y="6" rx="2"/>
                            </svg>
                            <span>Bookings</span>
                        </div>
                        <span class="sidebar-badge">{{ $stats['total'] }}</span>
                    </a>

                    <a class="sidebar-nav-item" href="#">
                        <div class="nav-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>Inquiries</span>
                        </div>
                        <span class="sidebar-badge">5</span>
                    </a>

                    <a class="sidebar-nav-item" href="#">
                        <div class="nav-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                <line x1="16" x2="16" y1="2" y2="6"/>
                                <line x1="8" x2="8" y1="2" y2="6"/>
                                <line x1="3" x2="21" y1="10" y2="10"/>
                            </svg>
                            <span>Calendar</span>
                        </div>
                    </a>

                    <span class="nav-section-title">Operations Team</span>
                    @foreach($staffList as $staff)
                    <div class="sidebar-nav-item" style="cursor: pointer;" title="Active Trips: {{ $staff->active_trips }}">
                        <div class="nav-left">
                            <img src="{{ $staff->avatar }}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                            <span style="font-size: 13px;">{{ $staff->name }}</span>
                        </div>
                        <span class="sidebar-badge" style="font-size: 10px;">{{ $staff->active_trips }} trips</span>
                    </div>
                    @endforeach

                    <span class="nav-section-title">System</span>
                    <a class="sidebar-nav-item" href="#">
                        <div class="nav-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <span>Settings</span>
                        </div>
                    </a>
                </nav>

                <div class="sidebar-profile-box">
                    <div class="profile-user-left">
                        <div class="ks-avatar-badge">KS</div>
                        <div>
                            <h4>Karan Sapalia</h4>
                            <p>Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Desktop Area -->
            <main class="desktop-main">
                <!-- Top Header with Search and Notification Bar (Image 3 reference) -->
                <header class="desktop-top-header">
                    <div class="desktop-search-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.3-4.3"/>
                        </svg>
                        <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search by booking ID, destination, or guest name..." />
                        @if(!empty($search))
                        <button wire:click="clearSearch" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 14px; padding: 0 4px;">✕</button>
                        @endif
                    </div>

                    <div class="desktop-header-actions">
                        <div class="desktop-notification-wrapper" style="position: relative;">
                            <button class="icon-bell-btn" title="Notifications" wire:click="showToast('You have 3 new travel updates and notifications', 'info')">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                                </svg>
                                <span class="bell-dot"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Body with Table and Inline Details (Clean, Spacious & Outlook Split View) -->
                <div class="desktop-body">
                    <div class="desktop-content-col">

                        <!-- Workspace Split: Table + Inline Details Pane (Outlook Style) -->
                        <div class="desktop-workspace-split {{ $activeBooking ? 'has-open-detail' : '' }}" id="desktop-workspace-split">
                            <!-- Left Column: Master View (Full Table or Slim Master List) -->
                            <div class="desktop-table-container">
                                <div class="desktop-full-table-view" style="{{ $activeBooking ? 'display: none;' : '' }}">
                                <div class="table-toolbar">
                                <div class="toolbar-tabs-group">
                                    <button class="desktop-tab-btn {{ $tab === 'All Bookings' ? 'active' : '' }}" wire:click="setTab('All Bookings')">
                                        All Bookings ({{ $stats['total'] }})
                                    </button>
                                    <button class="desktop-tab-btn {{ $tab === 'New Bookings' ? 'active' : '' }}" wire:click="setTab('New Bookings')">
                                        New Bookings ({{ $stats['countNew'] }})
                                    </button>
                                    <button class="desktop-tab-btn {{ $tab === 'Assigned' ? 'active' : '' }}" wire:click="setTab('Assigned')">
                                        Assigned ({{ $stats['countAssigned'] }})
                                    </button>
                                    <button class="desktop-tab-btn {{ $tab === 'Ongoing' ? 'active' : '' }}" wire:click="setTab('Ongoing')">
                                        Ongoing ({{ $stats['countOngoing'] }})
                                    </button>
                                </div>

                                <div class="toolbar-actions-group">
                                    <div class="table-toolbar-search-box">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="m21 21-4.3-4.3"/>
                                        </svg>
                                        <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search bookings..." />
                                    </div>
                                    <select wire:model.live="category" class="desktop-select-filter">
                                        <option value="ALL">All Categories</option>
                                        <option value="TOUR">Tour Packages</option>
                                        <option value="VILLA">Villas & Resorts</option>
                                        <option value="ACTIVITY">Activities & Sports</option>
                                        <option value="TRANSPORT">Transports</option>
                                    </select>

                                </div>
                            </div>

                            <!-- Selection / Action Bar ("X selected", "+ Assign", "...") -->
                            @if(count($selectedBookings) > 0)
                            <div class="mobile-selection-bar desktop-selection-bar" style="display: flex;">
                                <div class="selection-left">
                                    <div class="custom-checkbox checked" wire:click="toggleSelectAll">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>{{ count($selectedBookings) }} selected</span>
                                </div>
                                <div class="selection-actions-right">
                                    <div style="position: relative;">
                                        <button class="action-more-btn" wire:click="toggleBulkMore" title="More options" aria-haspopup="true">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="1.5"/>
                                                <circle cx="19" cy="12" r="1.5"/>
                                                <circle cx="5" cy="12" r="1.5"/>
                                            </svg>
                                        </button>
                                        @if($isBulkMoreOpen)
                                        <div class="bulk-more-dropdown" style="display: block;">
                                            <button class="dropdown-item-btn" wire:click="bulkAssign">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="9" cy="7" r="4"/>
                                                    <line x1="19" x2="19" y1="8" y2="14"/>
                                                    <line x1="22" x2="16" y1="11" y2="11"/>
                                                </svg>
                                                <span>Assign</span>
                                            </button>
                                            @if($this->isAllSelectedPaid)
                                            <button class="dropdown-item-btn" wire:click="bulkMarkUnpaid">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="12" x2="12" y1="8" y2="12"/>
                                                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                                                </svg>
                                                <span>Mark as Unpaid</span>
                                            </button>
                                            @else
                                            <button class="dropdown-item-btn" wire:click="bulkMarkPaid">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                                <span>Mark as Paid</span>
                                            </button>
                                            @endif
                                            <div class="dropdown-divider"></div>
                                            <button class="dropdown-item-btn item-danger" wire:click="clearSelection">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
                                                <span>Clear Selection</span>
                                            </button>
                                        </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            @endif

                            <!-- Table Element -->
                            <table class="bookings-table">
                                <thead>
                                    <tr>
                                        <th style="width: 44px; padding-left: 20px; padding-right: 0;">
                                            <div class="custom-checkbox {{ count($selectedBookings) === count($bookings) && count($bookings) > 0 ? 'checked' : '' }}" wire:click="toggleSelectAll">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </div>
                                        </th>
                                        <th style="min-width: 240px; padding-left: 14px;">Booking / Trip</th>
                                        <th>Category</th>
                                        <th>Pax & Duration</th>
                                        <th>Travel Dates</th>
                                        <th>Lead Guest</th>
                                        <th>Assigned To</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th style="text-align: right; padding-right: 24px; min-width: 160px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($bookings as $b)
                                    @php
                                        $isSelected = in_array($b->id, $selectedBookings);
                                        $isActive = $activeBookingId === $b->id;
                                        $cust = $b->customer ?? [];
                                        $leadGuest = ($b->guests && count($b->guests) > 0) ? $b->guests[0] : ['name' => $cust['name'] ?? 'Guest', 'phone' => $cust['phone'] ?? ''];
                                        $assigned = $b->assigned_to;
                                    @endphp
                                    <tr class="{{ $isActive ? 'selected-row' : '' }}" wire:click="openDrawer('{{ $b->id }}')" style="cursor: pointer;">
                                        <td style="padding-left: 20px; padding-right: 0;" wire:click.stop="toggleSelectBooking('{{ $b->id }}')">
                                            <div class="custom-checkbox {{ $isSelected ? 'checked' : '' }}">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </div>
                                        </td>
                                        <td style="padding-left: 14px;">
                                            <div class="table-booking-cell">
                                                <div class="table-thumb">
                                                    <img src="{{ $b->image }}" alt="{{ $b->title }}" />
                                                </div>
                                                <div class="table-booking-info">
                                                    <h4>{{ $b->title }}</h4>
                                                    <p><span>{{ $b->id }}</span> • {{ $b->destination }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="tag-pill {{ $b->type_class }}">{{ $b->type }}</span>
                                        </td>
                                        <td>
                                            <div style="font-weight: 600; color: #0F172A; font-size: 13.5px;">{{ $b->pax }} Travelers</div>
                                            <div style="font-size: 12px; color: #64748B;">{{ $b->duration }}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight: 600; color: #0F172A; font-size: 13px;">{{ $b->dates }}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight: 600; color: #0F172A; font-size: 13.5px;">{{ $leadGuest['name'] ?? 'Guest' }}</div>
                                            <div style="font-size: 12px; color: #64748B;">{{ $leadGuest['phone'] ?? '' }}</div>
                                        </td>
                                        <td>
                                            @if($assigned && !empty($assigned['name']))
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <img src="{{ $assigned['avatar'] ?? '' }}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                                                <span style="font-size: 13px; font-weight: 600; color: #334155;">{{ $assigned['name'] }}</span>
                                            </div>
                                            @else
                                            <span style="font-size: 12.5px; color: #94A3B8; font-style: italic;">Unassigned</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="status-badge {{ $b->status_class }}">{{ $b->status }}</span>
                                        </td>
                                        <td>
                                            <span class="table-price-badge">{{ $b->price }}</span>
                                        </td>
                                        <td style="text-align: right; padding-right: 20px;">
                                            <div class="desktop-action-btn-group" wire:click.stop>
                                                @php
                                                    $leadPhone = $leadGuest['phone'] ?? '';
                                                    $cleanPhone = preg_replace('/[^0-9+]/', '', $leadPhone);
                                                    $digitsWa = preg_replace('/[^0-9]/', '', $leadPhone);
                                                    if (strlen($digitsWa) === 10) { $digitsWa = '91' . $digitsWa; }
                                                    $waMsg = urlencode("Hi " . ($leadGuest['name'] ?? 'Guest') . ", this is Ruyi Travel Operations regarding your booking {$b->id} ({$b->title}).");
                                                @endphp
                                                @if(!empty($cleanPhone))
                                                <a href="tel:{{ $cleanPhone }}" class="card-circle-action-btn btn-action-call" title="Call {{ $leadGuest['name'] ?? 'Guest' }} ({{ $leadPhone }})" aria-label="Call" wire:click.stop>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                    </svg>
                                                </a>
                                                <a href="https://wa.me/{{ $digitsWa }}?text={{ $waMsg }}" target="_blank" rel="noopener noreferrer" class="card-circle-action-btn btn-action-whatsapp" title="WhatsApp {{ $leadGuest['name'] ?? 'Guest' }} ({{ $leadPhone }})" aria-label="WhatsApp" wire:click.stop>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
                                                    </svg>
                                                </a>
                                                @endif
                                                <button class="row-view-details-btn" wire:click.stop="openDrawer('{{ $b->id }}')" title="View details for {{ $b->title }}">
                                                    <span>View</span>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="10" style="text-align: center; padding: 48px; color: #64748B;">
                                            No bookings found matching your search or filters.
                                        </td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                                </div>

                                <!-- 2. Compact Outlook Master List (Shown when details open) -->
                                <div class="desktop-compact-list-view" style="{{ $activeBooking ? 'display: flex;' : 'display: none;' }}">
                                    <div class="compact-list-header">
                                        <div class="compact-header-top">
                                            <div class="compact-search-bar">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                                <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search..." />
                                            </div>
                                            <button class="btn-expand-full-table" wire:click="closeDrawer" title="Expand to Full Table View">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                            </button>
                                        </div>
                                        <div class="compact-tabs-nav">
                                            <button class="compact-tab-btn {{ $tab === 'All Bookings' ? 'active' : '' }}" wire:click="setTab('All Bookings')">All ({{ $stats['total'] }})</button>
                                            <button class="compact-tab-btn {{ $tab === 'New Bookings' ? 'active' : '' }}" wire:click="setTab('New Bookings')">New ({{ $stats['countNew'] }})</button>
                                            <button class="compact-tab-btn {{ $tab === 'Assigned' ? 'active' : '' }}" wire:click="setTab('Assigned')">Assigned ({{ $stats['countAssigned'] }})</button>
                                            <button class="compact-tab-btn {{ $tab === 'Ongoing' ? 'active' : '' }}" wire:click="setTab('Ongoing')">Ongoing ({{ $stats['countOngoing'] }})</button>
                                        </div>
                                    </div>
                                    <div class="compact-list-items">
                                        @forelse($bookings as $cb)
                                        <div class="compact-booking-card {{ $activeBookingId === $cb->id ? 'active' : '' }}" wire:click="openDrawer('{{ $cb->id }}')" style="cursor: pointer;">
                                            <div class="compact-card-top">
                                                <img src="{{ $cb->image }}" class="compact-thumb" alt="{{ $cb->title }}" />
                                                <div class="compact-info-col">
                                                    <h4 class="compact-trip-title">{{ $cb->title }}</h4>
                                                    <p class="compact-guest-sub">{{ $cb->customer['name'] ?? 'Guest' }} • {{ $cb->pax }} Pax</p>
                                                </div>
                                            </div>
                                            <div class="compact-card-bottom">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span class="compact-price">{{ $cb->price }}</span>
                                                    <span class="compact-status-badge {{ $cb->status_class }}">{{ $cb->status }}</span>
                                                </div>
                                                @php
                                                    $cbLead = ($cb->guests && count($cb->guests) > 0) ? $cb->guests[0] : ['name' => $cb->customer['name'] ?? 'Guest', 'phone' => $cb->customer['phone'] ?? ''];
                                                    $cbPhone = preg_replace('/[^0-9+]/', '', $cbLead['phone'] ?? '');
                                                    $cbWa = preg_replace('/[^0-9]/', '', $cbLead['phone'] ?? '');
                                                    if (strlen($cbWa) === 10) { $cbWa = '91' . $cbWa; }
                                                    $cbWaMsg = urlencode("Hi " . ($cbLead['name'] ?? 'Guest') . ", regarding booking {$cb->id} ({$cb->title})...");
                                                @endphp
                                                @if(!empty($cbPhone))
                                                <div class="card-action-btns-row" wire:click.stop style="gap: 5px;">
                                                    <a href="tel:{{ $cbPhone }}" class="card-circle-action-btn btn-action-call" style="width: 28px; height: 28px;" title="Call {{ $cbLead['name'] ?? 'Guest' }}" aria-label="Call" wire:click.stop>
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                        </svg>
                                                    </a>
                                                    <a href="https://wa.me/{{ $cbWa }}?text={{ $cbWaMsg }}" target="_blank" rel="noopener noreferrer" class="card-circle-action-btn btn-action-whatsapp" style="width: 28px; height: 28px;" title="WhatsApp {{ $cbLead['name'] ?? 'Guest' }}" aria-label="WhatsApp" wire:click.stop>
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                    </a>
                                                </div>
                                                @endif
                                            </div>
                                        </div>
                                        @empty
                                        <div style="text-align: center; padding: 24px; color: #94A3B8; font-size: 13px;">No bookings found</div>
                                        @endforelse
                                    </div>
                                </div>
                            </div>

                        <!-- Inline Detail Drawer (Popup on PC eliminated -> Inline Outlook split view!) -->
                        <aside class="desktop-details-drawer {{ $activeBooking ? 'open' : '' }}" id="desktop-details-drawer">
                @if($activeBooking)
                <!-- Unified Header (Matching Mobile exactly) -->
                <div class="desktop-drawer-header-box">
                    <div class="sheet-drag-handle-bar desktop-sheet-top-bar" style="display: flex; justify-content: flex-end; align-items: center; padding: 12px 18px 0 18px; background: #FFFFFF;">
                        <button class="sheet-close-btn" wire:click="closeDrawer" title="Close Drawer (Esc)" aria-label="Close">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    @php
                        $c = $activeBooking->customer ?? [];
                        $custName = $c['name'] ?? ($activeBooking->guest['name'] ?? 'Customer');
                        $initials = $c['initials'] ?? (collect(explode(' ', $custName))->map(fn($n) => $n[0] ?? '')->join('') ?: 'CU');
                    @endphp
                    <div class="sheet-customer-header">
                        <div class="customer-avatar-badge">{{ $initials }}</div>
                        <div class="customer-header-info">
                            <div class="customer-title-row">
                                <h2 class="customer-name-title">{{ $custName }}</h2>
                                <span class="status-pill {{ $activeBooking->status_class }}">
                                    <span class="dot"></span>
                                    {{ $activeBooking->status }}
                                </span>
                            </div>
                            <p class="customer-trip-subtitle">{{ $activeBooking->title }}</p>
                            <div class="customer-meta-chips">
                                <span class="meta-chip">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                    </svg>
                                    {{ $activeBooking->pax }} Pax
                                </span>
                                <span class="meta-dot">•</span>
                                <span class="meta-chip">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {{ $activeBooking->duration }}
                                </span>
                                <span class="meta-dot">•</span>
                                <span class="meta-chip">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                        <line x1="16" x2="16" y1="2" y2="6"/>
                                        <line x1="8" x2="8" y1="2" y2="6"/>
                                        <line x1="3" x2="21" y1="10" y2="10"/>
                                    </svg>
                                    {{ $activeBooking->dates }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="sheet-tabs-nav desktop-tabs-nav">
                    <button class="sheet-tab-btn {{ $activeDrawerTab === 'customer-details' ? 'active' : '' }}" wire:click="setDrawerTab('customer-details')">Customer Details</button>
                    <button class="sheet-tab-btn {{ $activeDrawerTab === 'guests' ? 'active' : '' }}" wire:click="setDrawerTab('guests')">Guests ({{ count($activeBooking->guests ?? []) }})</button>
                    <button class="sheet-tab-btn {{ $activeDrawerTab === 'itinerary' ? 'active' : '' }}" wire:click="setDrawerTab('itinerary')">Itinerary</button>
                    <button class="sheet-tab-btn {{ $activeDrawerTab === 'updates' ? 'active' : '' }}" wire:click="setDrawerTab('updates')">Updates</button>
                </div>

                <!-- Scrollable Detail Body -->
                <div class="sheet-body-scroll desktop-body-scroll">
                    @if($activeDrawerTab === 'customer-details')
                    @php $c = $activeBooking->customer ?? []; @endphp
                    <div class="customer-details-tab-content">
                        <!-- Card 1: Customer Information -->
                        <div class="details-section-card">
                            <div class="details-section-header">
                                <div class="section-header-left">
                                    <div class="section-icon-circle blue-circle">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                    <h3>Customer Information</h3>
                                </div>
                                <button class="btn-edit-action" wire:click="openCustomerEditModal" title="Edit Customer Details">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit
                                </button>
                            </div>

                            <div class="customer-info-grid">
                                <!-- Left Column: Row 1 -->
                                <div class="info-cell">
                                    <span class="info-label">Customer Name</span>
                                    <span class="info-value-bold">{{ $c['name'] ?? ($activeBooking->guest['name'] ?? 'Customer') }}</span>
                                </div>
                                <!-- Right Column: Row 1 -->
                                <div class="info-cell info-cell-email">
                                    <span class="info-label">Email</span>
                                    <div class="contact-value-row">
                                        <span class="info-value-text email-text-val" title="{{ $c['email'] ?? '' }}">{{ $c['email'] ?? 'rohan.malhotra@gmail.com' }}</span>
                                        <button class="mini-icon-btn btn-mail-blue" wire:click="showToast('Drafting email...', 'info')" title="Send Email">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <rect width="20" height="16" x="2" y="4" rx="2"/>
                                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <!-- Left Column: Row 2 -->
                                <div class="info-cell info-cell-contact">
                                    <span class="info-label">Primary Contact</span>
                                    <div class="contact-value-row">
                                        <span class="info-value-bold phone-number-val">{{ $c['phone'] ?? '+91 99884 84884' }}</span>
                                        <div class="contact-action-btns">
                                            <button class="mini-icon-btn btn-call-green" wire:click="triggerAction('call')" title="Call">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                </svg>
                                            </button>
                                            <button class="mini-icon-btn btn-wa-green" wire:click="triggerAction('whatsapp')" title="WhatsApp">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.435 5.176L2.05 21.95a.6.6 0 0 0 .736.736l4.774-1.385A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm3.906 14.153c-.225.63-1.127 1.196-1.55 1.258-.42.062-.958.088-1.55-.102-.38-.122-.87-.282-1.49-.55-2.617-1.13-4.326-3.79-4.457-3.963-.13-.174-1.065-1.417-1.065-2.702 0-1.286.674-1.92.913-2.18.239-.261.52-.326.695-.326.174 0 .348.002.5.01.16.007.375-.06.587.447.218.522.74 1.804.805 1.935.066.13.11.283.022.457-.087.174-.13.283-.26.435-.13.152-.273.34-.39.456-.13.13-.265.272-.114.533.152.261.674 1.11 1.447 1.8 1 .892 1.84 1.168 2.1 1.3.26.13.413.11.565-.065.152-.174.652-.761.826-1.022.174-.26.348-.217.587-.13.239.087 1.522.717 1.783.848.26.13.435.195.5.304.065.109.065.63-.16 1.26Z" fill="#16A34A"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <!-- Right Column: Row 2 -->
                                <div class="info-cell">
                                    <span class="info-label">Lead Source</span>
                                    <span class="info-value-text">{{ $c['leadSource'] ?? 'Website' }}</span>
                                </div>

                                <!-- Left Column: Row 3 -->
                                <div class="info-cell">
                                    <span class="info-label">Travel Dates</span>
                                    <span class="info-value-text">{{ $c['travelDates'] ?? $activeBooking->dates }}</span>
                                </div>
                                <!-- Right Column: Row 3 -->
                                <div class="info-cell">
                                    <span class="info-label">Location</span>
                                    <span class="info-value-text">{{ $c['location'] ?? 'New Delhi, Delhi' }}</span>
                                </div>

                                <!-- Left Column: Row 4 -->
                                <div class="info-cell">
                                    <span class="info-label">Preferred Destination</span>
                                    <span class="info-value-text">{{ $c['preferredDestination'] ?? $activeBooking->destination }}</span>
                                </div>
                                <!-- Right Column: Row 4 -->
                                <div class="info-cell">
                                    <span class="info-label">Budget (Est.)</span>
                                    <span class="info-value-bold" style="color: #0F172A;">{{ $c['budgetEst'] ?? $activeBooking->price }}</span>
                                </div>

                                <!-- Left Column: Row 5 -->
                                <div class="info-cell">
                                    <span class="info-label">Customer Type</span>
                                    <span class="info-value-text">{{ $c['customerType'] ?? ('Family (' . $activeBooking->pax . ' Pax)') }}</span>
                                </div>
                                <!-- Right Column: Row 5 -->
                                <div class="info-cell">
                                    <span class="info-label">Status</span>
                                    <div>
                                        <span class="status-pill {{ $activeBooking->status_class }}" style="display: inline-flex;">
                                            <span class="dot"></span>
                                            {{ $c['status'] ?? $activeBooking->status }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Short Details Card -->
                            <div class="short-details-card">
                                <div class="short-details-header">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" x2="8" y1="13" y2="13"/>
                                        <line x1="16" x2="8" y1="17" y2="17"/>
                                        <line x1="10" x2="8" y1="9" y2="9"/>
                                    </svg>
                                    <span>Short Details</span>
                                </div>
                                <p class="short-details-text">{{ $c['shortDetails'] ?? ($activeBooking->notes ?? 'Trip details logged into operations queue.') }}</p>
                            </div>
                        </div>

                        <!-- Card 2: Lead Flow / Journey -->
                        <div class="details-section-card">
                            <div class="details-section-header">
                                <div class="section-header-left">
                                    <div class="section-icon-circle blue-circle">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                                        </svg>
                                    </div>
                                    <h3>Lead Flow / Journey</h3>
                                </div>
                                <button class="btn-add-followup" wire:click="openAddFollowupModal">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <line x1="12" x2="12" y1="5" y2="19"/>
                                        <line x1="5" x2="19" y1="12" y2="12"/>
                                    </svg>
                                    Add Follow-up
                                </button>
                            </div>

                            <div class="lead-journey-timeline">
                                @forelse($c['leadFlow'] ?? [] as $step)
                                <div class="journey-item">
                                    <div class="journey-time-col">
                                        <span class="journey-date">{{ $step['date'] ?? '' }}</span>
                                        <span class="journey-time">{{ $step['time'] ?? '' }}</span>
                                    </div>
                                    <div class="journey-track-col">
                                        <div class="journey-dot-icon {{ $step['iconBg'] ?? 'icon-blue' }}">
                                            @if(($step['type'] ?? '') === 'call')
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                            @elseif(($step['type'] ?? '') === 'whatsapp')
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                                            @else
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                            @endif
                                        </div>
                                    </div>
                                    <div class="journey-content-col">
                                        <div class="journey-item-header">
                                            <h4>{{ $step['title'] }}</h4>
                                            <span class="journey-author">{{ $step['author'] ?? 'By Admin' }}</span>
                                        </div>
                                        <p class="journey-desc">{{ $step['desc'] }}</p>
                                    </div>
                                </div>
                                @empty
                                <p style="font-size: 13px; color: #94A3B8; text-align: center; padding: 16px 0;">No journey follow-ups recorded yet.</p>
                                @endforelse
                            </div>
                        </div>
                    </div>

                    @elseif($activeDrawerTab === 'guests')
                    <!-- Guests Tab Content -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <span class="section-title" style="margin: 0;">Registered Travelers ({{ count($activeBooking->guests ?? []) }})</span>
                        <button class="add-guest-pill-btn" wire:click="openAddGuestModal">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="12" x2="12" y1="5" y2="19"/>
                                <line x1="5" x2="19" y1="12" y2="12"/>
                            </svg>
                            Add Guest
                        </button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        @forelse($activeBooking->guests ?? [] as $g)
                        <div class="guest-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="guest-num-badge" style="width: 28px; height: 28px; border-radius: 8px; background: #F1F5F9; color: #475569; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center;">
                                    {{ $loop->iteration }}
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">{{ $g['name'] }}</h4>
                                    <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                                        Age {{ $g['age'] }} • {{ $g['role'] ?? 'Adult' }}
                                    </div>
                                </div>
                            </div>
                            <div class="guest-right-actions" style="display: flex; align-items: center; gap: 8px;">
                                <a href="tel:{{ preg_replace('/[^0-9+]/', '', $g['phone'] ?? '') }}" class="circle-action-btn btn-phone" title="Call {{ $g['name'] }}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                </a>
                                <button class="circle-action-btn btn-more" wire:click="showToast('Guest options for {{ $g['name'] }}: ID verified', 'info')" title="More options" aria-label="More options">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="1.5"/>
                                        <circle cx="12" cy="5" r="1.5"/>
                                        <circle cx="12" cy="19" r="1.5"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        @empty
                        <p style="text-align: center; color: #94A3B8; padding: 24px;">No guests registered. Click "Add Guest" above.</p>
                        @endforelse
                    </div>

                    @elseif($activeDrawerTab === 'itinerary')
                    <!-- Itinerary Tab Content (Uniform Pattern with Customer Details and Guests) -->
                    <div class="itinerary-tab-content" style="padding: 0;">
                        <div class="itinerary-section-header-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div class="section-header-left" style="display: flex; align-items: center; gap: 8px;">
                                <div class="section-icon-circle blue-circle" style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary-light, #EFF6FF); display: flex; align-items: center; justify-content: center; color: var(--primary, #2563EB);">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                        <line x1="16" x2="16" y1="2" y2="6"/>
                                        <line x1="8" x2="8" y1="2" y2="6"/>
                                        <line x1="3" x2="21" y1="10" y2="10"/>
                                    </svg>
                                </div>
                                <h3 style="font-size: 14.5px; font-weight: 700; color: #0F172A; margin: 0;">Day-wise Schedule</h3>
                            </div>
                            <button class="btn-add-event-pill" wire:click="openAddEvent('Day 1')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="12" x2="12" y1="5" y2="19"/>
                                    <line x1="5" x2="19" y1="12" y2="12"/>
                                </svg>
                                Add Event
                            </button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 16px;">
                        @forelse($activeBooking->itinerary_days ?? [] as $dayGroup)
                        <div class="day-schedule-box" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 13px; font-weight: 800; color: var(--primary, #2563EB); background: var(--primary-light, #EFF6FF); padding: 2px 8px; border-radius: 6px;">{{ $dayGroup['day'] }}</span>
                                    <span style="font-size: 12.5px; color: #64748B; font-weight: 500;">{{ $dayGroup['date'] ?? '' }}</span>
                                </div>
                                <button class="action-pill-btn" wire:click="openAddEvent('{{ $dayGroup['day'] }}')" style="padding: 2px 8px; font-size: 11px;">Add</button>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                @foreach($dayGroup['items'] ?? [] as $item)
                                @php
                                    $isItemAssigned = !empty($item['assigned']['isAssigned']);
                                    $isCompleted = !empty($item['isCompleted']);
                                @endphp
                                <div class="itinerary-item-row" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                                        <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--primary-light, #EFF6FF); color: var(--primary, #2563EB); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 13px; font-weight: 700; color: #0F172A; text-decoration: {{ $isCompleted ? 'line-through' : 'none' }};">{{ $item['title'] }}</div>
                                            <div style="font-size: 11.5px; color: #64748B;">{{ $item['subtitle'] }}</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                        @if($isItemAssigned)
                                        <div style="display: flex; align-items: center; gap: 6px; background: #ECFDF5; padding: 3px 8px; border-radius: 20px;" title="Assigned: {{ $item['assigned']['name'] ?? '' }}">
                                            <span style="font-size: 11px; font-weight: 600; color: #059669;">✓ {{ $item['assigned']['name'] ?? 'Assigned' }}</span>
                                        </div>
                                        @else
                                        <button class="action-pill-btn" wire:click="openAssignModal('{{ $dayGroup['day'] }}', '{{ $item['id'] }}')" style="padding: 3px 8px; font-size: 11px;">Assign</button>
                                        @endif

                                        <button wire:click="toggleActivityCompleted('{{ $dayGroup['day'] }}', '{{ $item['id'] }}')" class="action-pill-btn" style="padding: 3px 8px; font-size: 11px; {{ $isCompleted ? 'background: #DCFCE7; color: #16A34A;' : '' }}">
                                            {{ $isCompleted ? 'Done' : 'Mark' }}
                                        </button>
                                        <button wire:click="openEditActivity('{{ $dayGroup['day'] }}', '{{ $item['id'] }}')" style="background: none; border: none; cursor: pointer; color: #64748B;" title="Edit Activity">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                        </button>
                                    </div>
                                </div>
                                @endforeach
                            </div>
                        </div>
                        @empty
                        <p style="text-align: center; color: #94A3B8; padding: 24px;">No itinerary days scheduled yet.</p>
                        @endforelse
                    </div>
                </div>

                    @elseif($activeDrawerTab === 'updates')
                    <!-- Updates Tab Content -->
                    <div class="section-card">
                        <span class="section-title">Add Operations Note</span>
                        <div style="display: flex; gap: 8px; margin-top: 10px;">
                            <input type="text" wire:model="newNoteText" placeholder="Enter status note or briefing..." style="flex: 1; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
                            <button class="btn-primary-desktop" wire:click="addNote" style="padding: 8px 16px; border-radius: 8px; font-size: 12.5px;">Add</button>
                        </div>
                    </div>

                    <div class="section-card" style="margin-top: 14px;">
                        <span class="section-title">Timeline History</span>
                        <div class="lead-timeline" style="margin-top: 14px; display: flex; flex-direction: column; gap: 12px;">
                            @forelse($activeBooking->customer['leadFlow'] ?? [] as $lf)
                            <div style="display: flex; gap: 12px;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary-light, #EFF6FF); color: var(--primary, #2563EB); display: flex; align-items: center; justify-content: center; font-size: 10px;">
                                    ✓
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <h5 style="margin: 0; font-size: 12.5px; font-weight: 700; color: #0F172A;">{{ $lf['title'] }}</h5>
                                        <span style="font-size: 11px; color: #94A3B8;">{{ $lf['date'] ?? '' }}</span>
                                    </div>
                                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748B;">{{ $lf['desc'] ?? '' }}</p>
                                </div>
                            </div>
                            @empty
                            <p style="font-size: 12px; color: #94A3B8;">No updates logged.</p>
                            @endforelse
                        </div>
                    </div>
                    @endif
                </div>

                <!-- Exact Match to Mobile Footer (Image 1) -->
                <div class="sheet-sticky-footer desktop-drawer-footer">
                    <button class="btn-confirm-booking" wire:click="confirmBooking('{{ $activeBooking->id }}')">
                        Confirm Booking
                    </button>
                    <div class="sheet-quick-actions-grid desktop-quick-actions-grid">
                        <button class="quick-action-col-btn btn-act-call" wire:click="triggerAction('call')" title="Call">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            <span>Call</span>
                        </button>
                        <button class="quick-action-col-btn btn-act-msg" wire:click="triggerAction('whatsapp')" title="Message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>Message</span>
                        </button>
                        <button class="quick-action-col-btn btn-act-fwd" wire:click="triggerAction('share')" title="Forward">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z"/>
                                <path d="M22 2 11 13"/>
                            </svg>
                            <span>Forward</span>
                        </button>
                        <button class="quick-action-col-btn btn-act-more" wire:click="triggerAction('more')" title="More">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1.5"/>
                                <circle cx="19" cy="12" r="1.5"/>
                                <circle cx="5" cy="12" r="1.5"/>
                            </svg>
                            <span>More</span>
                        </button>
                    </div>
                </div>
                @endif
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

    <!-- ========================================== -->
    <!-- MOBILE AREA CONTAINER                      -->
    <!-- ========================================== -->
    <div id="mobile-view-slot" class="view-slot-mobile">
        <div class="mobile-layout">
            <!-- Mobile Top Header -->
            <header class="mobile-top-header">
                <div class="mobile-header-row">
                    <div class="brand-text-col">
                        <h2>{{ \App\Models\AppSetting::read('company', [])['name'] ?? 'Ruyi Admin' }}</h2>
                        <p>Travel Operations</p>
                    </div>
                    <button class="icon-bell-btn" wire:click="showToast('No new notifications', 'info')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                        <span class="bell-dot"></span>
                    </button>
                </div>
                <div class="mobile-search-row" style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">
                    <div class="search-input-wrapper" style="flex: 1;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.3-4.3"/>
                        </svg>
                        <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search bookings..." />
                    </div>
                    <div class="mobile-category-select-wrapper">
                        <svg class="category-filter-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                        <select wire:model.live="category" class="mobile-select-filter">
                            <option value="ALL">All Categories</option>
                            <option value="TOUR">Tour Packages</option>
                            <option value="VILLA">Villas & Resorts</option>
                            <option value="ACTIVITY">Activities & Sports</option>
                            <option value="TRANSPORT">Transports</option>
                        </select>
                    </div>
                </div>
            </header>

            <!-- Mobile Status Tabs -->
            <div class="mobile-filter-tabs-row" style="display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0;">
                <button class="desktop-tab-btn {{ $tab === 'All Bookings' ? 'active' : '' }}" wire:click="setTab('All Bookings')">All ({{ $stats['total'] }})</button>
                <button class="desktop-tab-btn {{ $tab === 'New Bookings' ? 'active' : '' }}" wire:click="setTab('New Bookings')">New ({{ $stats['countNew'] }})</button>
                <button class="desktop-tab-btn {{ $tab === 'Assigned' ? 'active' : '' }}" wire:click="setTab('Assigned')">Assigned ({{ $stats['countAssigned'] }})</button>
                <button class="desktop-tab-btn {{ $tab === 'Ongoing' ? 'active' : '' }}" wire:click="setTab('Ongoing')">Ongoing ({{ $stats['countOngoing'] }})</button>
            </div>

            <!-- Mobile Selection Bar -->
            @if(count($selectedBookings) > 0)
            <div class="mobile-selection-bar" style="display: flex; margin: 8px 16px 0 16px;">
                <div class="selection-left">
                    <div class="custom-checkbox checked" wire:click="toggleSelectAll">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span>{{ count($selectedBookings) }} selected</span>
                </div>
                <div class="selection-actions-right">
                    <div style="position: relative;">
                        <button class="action-more-btn" wire:click="toggleBulkMore" title="More options" aria-haspopup="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1.5"/>
                                <circle cx="19" cy="12" r="1.5"/>
                                <circle cx="5" cy="12" r="1.5"/>
                            </svg>
                        </button>
                        @if($isBulkMoreOpen)
                        <div class="bulk-more-dropdown" style="display: block;">
                            <button class="dropdown-item-btn" wire:click="bulkAssign">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <line x1="19" x2="19" y1="8" y2="14"/>
                                    <line x1="22" x2="16" y1="11" y2="11"/>
                                </svg>
                                <span>Assign</span>
                            </button>
                            @if($this->isAllSelectedPaid)
                            <button class="dropdown-item-btn" wire:click="bulkMarkUnpaid">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" x2="12" y1="8" y2="12"/>
                                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                                </svg>
                                <span>Mark as Unpaid</span>
                            </button>
                            @else
                            <button class="dropdown-item-btn" wire:click="bulkMarkPaid">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Mark as Paid</span>
                            </button>
                            @endif
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item-btn item-danger" wire:click="clearSelection">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                <span>Clear Selection</span>
                            </button>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
            @endif

            <!-- Mobile Cards List -->
            <div class="mobile-cards-container" style="padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;">
                @forelse($bookings as $b)
                @php $isSelected = in_array($b->id, $selectedBookings); @endphp
                <div class="mobile-booking-card" wire:click="openDrawer('{{ $b->id }}')" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative;">
                    <div wire:click.stop="toggleSelectBooking('{{ $b->id }}')" style="flex-shrink: 0;">
                        <div class="custom-checkbox {{ $isSelected ? 'checked' : '' }}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                    </div>
                    <div class="card-thumb-wrapper" style="width: 56px; height: 56px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #E2E8F0;">
                        <img src="{{ $b->image }}" style="width: 100%; height: 100%; object-fit: cover;" alt="" />
                    </div>
                    <div class="card-info-col" style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
                        <span class="card-type-badge {{ $b->type_class }}" style="font-size: 10px; padding: 2px 6px;">{{ $b->type }}</span>
                        <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $b->title }}</h4>
                        <div style="font-size: 11.5px; color: #64748B; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            <span>{{ $b->pax }} Pax • {{ $b->duration }}</span>
                        </div>
                        <div style="font-size: 11.5px; color: #64748B; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <span>{{ $b->dates }}</span>
                        </div>
                    </div>
                    <div class="card-right-col" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 8px; flex-shrink: 0;">
                        @php
                            $mLead = ($b->guests && count($b->guests) > 0) ? $b->guests[0] : ['name' => $b->customer['name'] ?? 'Guest', 'phone' => $b->customer['phone'] ?? ''];
                            $mPhone = preg_replace('/[^0-9+]/', '', $mLead['phone'] ?? '');
                            $mWa = preg_replace('/[^0-9]/', '', $mLead['phone'] ?? '');
                            if (strlen($mWa) === 10) { $mWa = '91' . $mWa; }
                            $mWaMsg = urlencode("Hi " . ($mLead['name'] ?? 'Guest') . ", regarding your booking {$b->id} ({$b->title})...");
                        @endphp
                        <div class="card-action-btns-row" wire:click.stop>
                            @if(!empty($mPhone))
                            <a href="tel:{{ $mPhone }}" class="card-circle-action-btn btn-action-call" title="Call {{ $mLead['name'] ?? 'Guest' }}" aria-label="Call" wire:click.stop>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                </svg>
                            </a>
                            <a href="https://wa.me/{{ $mWa }}?text={{ $mWaMsg }}" target="_blank" rel="noopener noreferrer" class="card-circle-action-btn btn-action-whatsapp" title="WhatsApp {{ $mLead['name'] ?? 'Guest' }}" aria-label="WhatsApp" wire:click.stop>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
                                </svg>
                            </a>
                            @endif
                        </div>
                        <div class="card-price-status-row" style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 14px; font-weight: 700; color: #0F172A;">{{ $b->price }}</span>
                            <span class="status-pill {{ $b->status_class }}" style="font-size: 11px; padding: 2px 7px;">
                                <span class="dot"></span>
                                {{ $b->status }}
                            </span>
                        </div>
                    </div>
                </div>
                @empty
                <div style="text-align: center; padding: 48px 20px; color: #64748B;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; color: #94A3B8;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.3-4.3"/>
                        </svg>
                    </div>
                    <h4 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 4px 0;">No Bookings Found</h4>
                    <p style="font-size: 13px; margin: 0 0 14px 0; color: #94A3B8;">No results matching your selected filters.</p>
                    <button class="action-pill-btn" wire:click="$set('search', ''); $set('category', 'ALL'); $set('tab', 'All Bookings');" style="height: 36px; padding: 0 16px; font-weight: 600; border-radius: 10px; background: var(--primary-gradient, var(--primary, #2563EB)); color: #FFFFFF; border: none; cursor: pointer; margin: 0 auto;">Reset Filters</button>
                </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- ========================================== -->
    <!-- GLOBAL MODALS                              -->
    <!-- ========================================== -->

    <!-- Add Guest Modal -->
    <div class="modal-overlay {{ $showAddGuestModal ? 'open' : '' }}">
        <div class="modal-card">
            <div class="modal-header">
                <h3>Add New Guest</h3>
                <button class="sheet-close-btn" wire:click="closeAddGuestModal" style="position: static;">✕</button>
            </div>
            <form wire:submit.prevent="saveGuest">
                <div class="modal-body">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" wire:model="guestName" placeholder="e.g. Rahul Sharma" required />
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>Age *</label>
                            <input type="number" wire:model="guestAge" min="1" max="110" required />
                        </div>
                        <div class="form-group">
                            <label>Category / Role</label>
                            <select wire:model="guestRole">
                                <option value="Adult">Adult</option>
                                <option value="Child">Child</option>
                                <option value="Senior">Senior</option>
                                <option value="Primary Contact">Primary Contact</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" wire:model="guestPhone" placeholder="e.g. +91 98765 43210" />
                    </div>
                    <div class="form-group">
                        <label>ID Proof / Notes</label>
                        <input type="text" wire:model="guestNotes" placeholder="Aadhaar / Passport / Special meal request" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary-desktop" wire:click="closeAddGuestModal">Cancel</button>
                    <button type="submit" class="btn-primary-desktop">Add Guest</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Special Requirements Modal -->
    <div class="modal-overlay {{ $showSpecialReqModal ? 'open' : '' }}">
        <div class="modal-card">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #2563EB)" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <h3>Edit Special Requirements</h3>
                </div>
                <button class="sheet-close-btn" wire:click="closeSpecialReqModal" style="position: static;">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Current Requirements</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;">
                        @forelse($tempSpecialReqs as $idx => $req)
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 6px 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
                            <span style="font-size: 13px; font-weight: 600; color: #1E293B;">{{ $req['text'] }}</span>
                            <button type="button" wire:click="removeSpecialReq({{ $idx }})" style="background: none; border: none; cursor: pointer; color: #EF4444; font-size: 13px; font-weight: bold;">✕</button>
                        </div>
                        @empty
                        <span style="font-size: 12px; color: #94A3B8;">No requirements added yet.</span>
                        @endforelse
                    </div>
                </div>

                <div class="form-group">
                    <label>Quick Add Presets</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <button type="button" wire:click="addPresetRequirement('preset-1')" class="action-pill-btn" style="font-size: 11px;">Veg Food</button>
                        <button type="button" wire:click="addPresetRequirement('preset-2')" class="action-pill-btn" style="font-size: 11px;">Connecting Rooms</button>
                        <button type="button" wire:click="addPresetRequirement('preset-3')" class="action-pill-btn" style="font-size: 11px;">Wheelchair</button>
                        <button type="button" wire:click="addPresetRequirement('preset-4')" class="action-pill-btn" style="font-size: 11px;">Near Beach</button>
                        <button type="button" wire:click="addPresetRequirement('preset-5')" class="action-pill-btn" style="font-size: 11px;">Kid Friendly</button>
                        <button type="button" wire:click="addPresetRequirement('preset-6')" class="action-pill-btn" style="font-size: 11px;">Baby Cot</button>
                        <button type="button" wire:click="addPresetRequirement('preset-7')" class="action-pill-btn" style="font-size: 11px;">Late Check-out</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Add Custom Requirement</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" wire:model="customReqText" placeholder="e.g. Extra pillows, Non-smoking room" style="flex: 1;" />
                        <button type="button" wire:click="addCustomRequirement" class="btn-primary-desktop" style="padding: 0 16px; border-radius: 10px; font-size: 13px; font-weight: 700; white-space: nowrap;">Add</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-confirm-booking" wire:click="saveSpecialRequirements" style="height: 40px; font-size: 13.5px; border-radius: 10px;">Save & Apply</button>
            </div>
        </div>
    </div>

    <!-- Edit Activity Modal -->
    <div class="modal-overlay {{ $showEditActivityModal ? 'open' : '' }}">
        <div class="modal-card">
            <div class="modal-header">
                <h3>Edit Itinerary Activity</h3>
                <button class="sheet-close-btn" wire:click="closeEditActivity" style="position: static;">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Activity Title</label>
                    <input type="text" wire:model="editTitle" placeholder="e.g. River Rafting (16 km)" />
                </div>
                <div class="form-group">
                    <label>Timing & Subtitle / Location</label>
                    <input type="text" wire:model="editSubtitle" placeholder="e.g. 10:00 AM • Rishikesh" />
                </div>
                <div class="form-group">
                    <label>Category / Icon</label>
                    <select wire:model="editType">
                        <option value="transport">Transport / Bus</option>
                        <option value="hotel">Hotel / Accommodation</option>
                        <option value="sightseeing">Sightseeing / Tour</option>
                        <option value="activity">Sport / Adventure</option>
                        <option value="food">Restaurant / Meal</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="action-pill-btn" wire:click="closeEditActivity">Cancel</button>
                <button type="button" class="btn-primary-desktop" wire:click="saveEditActivity" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">Save Changes</button>
            </div>
        </div>
    </div>

    <!-- Add Event Modal -->
    <div class="modal-overlay {{ $showAddEventModal ? 'open' : '' }}">
        <div class="modal-card">
            <div class="modal-header">
                <h3>Add Itinerary Event</h3>
                <button class="sheet-close-btn" wire:click="closeAddEvent" style="position: static;">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Select Day</label>
                    <select wire:model="eventDay">
                        <option value="Day 1">Day 1</option>
                        <option value="Day 2">Day 2</option>
                        <option value="Day 3">Day 3</option>
                        <option value="Day 4">Day 4</option>
                        <option value="Day 5">Day 5</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Event Title</label>
                    <input type="text" wire:model="eventTitle" placeholder="e.g. Sunset Boat Cruise & Tea" />
                </div>
                <div class="form-group">
                    <label>Time & Subtitle / Location</label>
                    <input type="text" wire:model="eventSubtitle" placeholder="e.g. 05:30 PM • 1-hour cruise with DJ" />
                </div>
                <div class="form-group">
                    <label>Category / Icon</label>
                    <select wire:model="eventType">
                        <option value="sightseeing">Sightseeing / Tour</option>
                        <option value="transport">Transport / Bus</option>
                        <option value="hotel">Hotel / Accommodation</option>
                        <option value="activity">Sport / Adventure</option>
                        <option value="food">Restaurant / Meal</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="action-pill-btn" wire:click="closeAddEvent">Cancel</button>
                <button type="button" class="btn-primary-desktop" wire:click="saveAddEvent" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">Add to Itinerary</button>
            </div>
        </div>
    </div>

    <!-- Assign Coordinator / Vendor Modal -->
    <div class="modal-overlay {{ $showAssignModal ? 'open' : '' }}">
        <div class="modal-card" style="width: 520px;">
            <div class="modal-header">
                <h3>Assign Activity</h3>
                <button class="sheet-close-btn" wire:click="closeAssignModal" style="position: static;">✕</button>
            </div>
            <div class="modal-body">
                @if($assignTargetItem)
                <div class="assign-activity-card" style="margin: 0 0 14px 0; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">{{ $assignTargetItem['title'] }}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748B;">{{ $assignTargetItem['subtitle'] }}</p>
                    </div>
                    <span class="tag-activity-pill" style="padding: 3px 8px; border-radius: 9999px; background: var(--primary-light, #EFF6FF); color: var(--primary, #2563EB); font-size: 11px; font-weight: 700; text-transform: uppercase;">{{ $assignTargetItem['type'] ?? 'ACTIVITY' }}</span>
                </div>
                @endif

                <div class="form-group">
                    <label>Select Assignee Category</label>
                    <div class="assign-tabs-row" style="margin-bottom: 6px; display: flex; gap: 8px;">
                        <button type="button" class="assign-tab-btn {{ $assignCategory === 'team' ? 'active' : '' }}" wire:click="setAssignCategory('team')">Team Members</button>
                        <button type="button" class="assign-tab-btn {{ $assignCategory === 'vendors' ? 'active' : '' }}" wire:click="setAssignCategory('vendors')">Vendors</button>
                        <button type="button" class="assign-tab-btn {{ $assignCategory === 'contacts' ? 'active' : '' }}" wire:click="setAssignCategory('contacts')">Contacts</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Choose Person / Supplier</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                        @if($assignCategory === 'team')
                        @foreach($staffList as $staff)
                        <div wire:click="confirmAssignment('{{ $staff->id }}', 'team')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="{{ $staff->avatar }}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #0F172A;">{{ $staff->name }}</div>
                                    <div style="font-size: 11.5px; color: #64748B;">{{ $staff->role }}</div>
                                </div>
                            </div>
                            <button type="button" class="action-pill-btn" style="padding: 4px 10px; font-size: 11px;">Assign</button>
                        </div>
                        @endforeach

                        @elseif($assignCategory === 'vendors')
                        @foreach($vendorsList as $vendor)
                        <div wire:click="confirmAssignment('{{ $vendor->id }}', 'vendors')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="{{ $vendor->image }}" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover;" />
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #0F172A;">{{ $vendor->name }}</div>
                                    <div style="font-size: 11.5px; color: #64748B;">{{ $vendor->service }}</div>
                                </div>
                            </div>
                            <button type="button" class="action-pill-btn" style="padding: 4px 10px; font-size: 11px;">Assign</button>
                        </div>
                        @endforeach

                        @elseif($assignCategory === 'contacts')
                        @foreach($contactsList as $contact)
                        <div wire:click="confirmAssignment('{{ $contact->id }}', 'contacts')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <img src="{{ $contact->avatar }}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                                <div>
                                    <div style="font-size: 13px; font-weight: 700; color: #0F172A;">{{ $contact->name }}</div>
                                    <div style="font-size: 11.5px; color: #64748B;">{{ $contact->role }} • {{ $contact->phone }}</div>
                                </div>
                            </div>
                            <button type="button" class="action-pill-btn" style="padding: 4px 10px; font-size: 11px;">Assign</button>
                        </div>
                        @endforeach
                        @endif
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="action-pill-btn" wire:click="closeAssignModal">Cancel</button>
            </div>
        </div>
    </div>
</div>

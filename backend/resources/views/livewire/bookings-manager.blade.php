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
                        <h2>Ruyi Admin</h2>
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
                            <span>Enquiries</span>
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
                <!-- Top Header -->
                <header class="desktop-top-header">
                    <div class="desktop-search-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.3-4.3"/>
                        </svg>
                        <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search by booking ID, destination, or guest name..." />
                        @if(!empty($search))
                        <button wire:click="clearSearch" style="background: transparent; border: none; cursor: pointer; color: #94A3B8;">✕</button>
                        @endif
                    </div>

                    <div class="desktop-header-actions">
                        <button class="icon-bell-btn" title="Notifications" wire:click="showToast('No new notifications', 'info')">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            <span class="bell-dot"></span>
                        </button>
                    </div>
                </header>

                <!-- Body with Metrics and Full-Width Table -->
                <div class="desktop-body">
                    <div class="desktop-content-col">
                        <!-- Metrics Row -->
                        <div class="metrics-row">
                            <div class="metric-card">
                                <div class="metric-icon-box metric-icon-blue">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                        <rect width="20" height="14" x="2" y="6" rx="2"/>
                                    </svg>
                                </div>
                                <div class="metric-info">
                                    <h5>Total Bookings</h5>
                                    <h3>{{ $stats['total'] }}</h3>
                                    <div class="metric-trend">↑ +14.2% this month</div>
                                </div>
                            </div>

                            <div class="metric-card">
                                <div class="metric-icon-box metric-icon-green">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div class="metric-info">
                                    <h5>Total Travelers</h5>
                                    <h3>{{ $stats['pax'] }} Pax</h3>
                                    <div class="metric-trend">Active across {{ $stats['total'] }} tours</div>
                                </div>
                            </div>

                            <div class="metric-card">
                                <div class="metric-icon-box metric-icon-purple">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                                        <line x1="2" x2="22" y1="10" y2="10"/>
                                    </svg>
                                </div>
                                <div class="metric-info">
                                    <h5>Collected Revenue</h5>
                                    <h3>{{ $stats['revenue'] }}</h3>
                                    <div class="metric-trend">86% Settlement rate</div>
                                </div>
                            </div>

                            <div class="metric-card">
                                <div class="metric-icon-box metric-icon-orange">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" x2="12" y1="8" y2="12"/>
                                        <line x1="12" x2="12.01" y1="16" y2="16"/>
                                    </svg>
                                </div>
                                <div class="metric-info">
                                    <h5>Pending Due</h5>
                                    <h3>{{ $stats['pending'] }}</h3>
                                    <div class="metric-trend" style="color: #EA580C;">Awaiting settlement</div>
                                </div>
                            </div>
                        </div>

                        <!-- Table Container with Toolbar -->
                        <div class="desktop-table-container">
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
                                    <select wire:model.live="category" style="padding: 8px 14px; border-radius: 10px; border: 1px solid #CBD5E1; font-size: 13.5px; font-family: inherit; font-weight: 500; background: #FFFFFF; color: #1E293B; cursor: pointer;">
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
                                    <button class="action-pill-btn" wire:click="bulkAssign">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <line x1="19" x2="19" y1="8" y2="14"/>
                                            <line x1="22" x2="16" y1="11" y2="11"/>
                                        </svg>
                                        + Assign
                                    </button>
                                    <div style="position: relative;">
                                        <button class="action-more-btn" wire:click="toggleBulkMore" title="More options">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="1"/>
                                                <circle cx="19" cy="12" r="1"/>
                                                <circle cx="5" cy="12" r="1"/>
                                            </svg>
                                        </button>
                                        @if($isBulkMoreOpen)
                                        <div class="bulk-more-dropdown" style="display: block; position: absolute; right: 0; top: 40px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 6px; width: 160px; z-index: 100;">
                                            <button class="dropdown-item-btn" wire:click="bulkMarkPaid" style="padding: 8px 10px; font-size: 13px; width: 100%; text-align: left; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                Mark as Paid
                                            </button>
                                            <button class="dropdown-item-btn" wire:click="clearSelection" style="padding: 8px 10px; font-size: 13px; color: #64748B; width: 100%; text-align: left; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                Clear Selection
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
                                        <th style="text-align: right; padding-right: 24px;">Action</th>
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
                                            <div class="table-trip-cell">
                                                <img src="{{ $b->image }}" class="table-trip-thumb" alt="{{ $b->title }}" />
                                                <div class="table-trip-meta">
                                                    <div class="table-trip-title">{{ $b->title }}</div>
                                                    <div class="table-trip-dest">
                                                        <span>{{ $b->id }}</span> • {{ $b->destination }}
                                                    </div>
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
                                        <td style="text-align: right; padding-right: 24px;">
                                            <button class="action-pill-btn" style="padding: 6px 12px; font-size: 12px;" wire:click.stop="openDrawer('{{ $b->id }}')">
                                                View
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                            </button>
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
                    </div>
                </div>
            </main>

            <!-- Slide-Over Drawer Backdrop Overlay -->
            <div class="desktop-drawer-backdrop {{ $activeBooking ? 'open' : '' }}" wire:click="closeDrawer"></div>

            <!-- Slide-Over Detail Drawer (580px wide SaaS layout on PC) -->
            <aside class="desktop-details-drawer {{ $activeBooking ? 'open' : '' }}" id="desktop-details-drawer">
                @if($activeBooking)
                <!-- Unified Header -->
                <div class="desktop-drawer-header-box">
                    <button class="sheet-close-btn" wire:click="closeDrawer" title="Close Drawer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div class="desktop-header-top-row">
                        <div class="desktop-header-tags">
                            <span class="tag-pill {{ $activeBooking->type_class }}">{{ $activeBooking->type }}</span>
                            <span class="tag-booking-id">{{ $activeBooking->id }}</span>
                            <span class="status-badge {{ $activeBooking->status_class }}">{{ $activeBooking->status }}</span>
                        </div>
                        <div class="desktop-header-price">{{ $activeBooking->price }}</div>
                    </div>
                    <h3 class="desktop-header-title">{{ $activeBooking->title }}</h3>
                    <div class="desktop-header-meta">
                        <span class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            {{ $activeBooking->pax }} Travelers ({{ $activeBooking->customer['customerType'] ?? 'Family' }})
                        </span>
                        <span class="meta-sep">•</span>
                        <span class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            {{ $activeBooking->dates }}
                        </span>
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
                    <!-- Customer Profile Card -->
                    <div class="customer-profile-card">
                        <div class="customer-profile-avatar">{{ $c['initials'] ?? 'RM' }}</div>
                        <div class="customer-profile-info">
                            <div class="customer-profile-header-row">
                                <h4 class="customer-profile-name">{{ $c['name'] ?? 'Primary Guest' }}</h4>
                                <span class="badge-vip-pill">VIP Traveler</span>
                            </div>
                            <div class="customer-profile-grid">
                                <div class="profile-info-item">
                                    <span class="profile-item-label">Phone</span>
                                    <span class="profile-item-val">{{ $c['phone'] ?? '+91 99884 84884' }}</span>
                                </div>
                                <div class="profile-info-item">
                                    <span class="profile-item-label">Email</span>
                                    <span class="profile-item-val" style="word-break: break-all;">{{ $c['email'] ?? 'rohan.malhotra@gmail.com' }}</span>
                                </div>
                                <div class="profile-info-item">
                                    <span class="profile-item-label">Location</span>
                                    <span class="profile-item-val">{{ $c['location'] ?? 'Chandigarh, Punjab' }}</span>
                                </div>
                                <div class="profile-info-item">
                                    <span class="profile-item-label">Source</span>
                                    <span class="profile-item-val">{{ $c['leadSource'] ?? 'Google Search' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Special Requirements Card -->
                    <div class="section-card">
                        <div class="section-header-row">
                            <span class="section-title">Special Requirements</span>
                            <button class="action-pill-btn" wire:click="openSpecialReqModal" style="padding: 4px 10px; font-size: 11.5px;">+ Quick Edit</button>
                        </div>
                        <div class="special-req-tags-grid">
                            @forelse($activeBooking->special_requirements ?? [] as $sr)
                            <div class="special-req-pill" style="border-left: 3px solid {{ $sr['color'] ?? '#2563EB' }}; display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #F8FAFC; border-radius: 8px;">
                                <span style="font-size: 12.5px; font-weight: 600; color: #1E293B;">{{ $sr['text'] }}</span>
                            </div>
                            @empty
                            <p style="font-size: 12.5px; color: #94A3B8; margin: 4px 0;">No special requirements recorded.</p>
                            @endforelse
                        </div>
                    </div>

                    <!-- Short Details -->
                    <div class="section-card">
                        <span class="section-title">Trip Overview</span>
                        <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 8px 0 0 0;">
                            {{ $c['shortDetails'] ?? $activeBooking->notes }}
                        </p>
                    </div>

                    <!-- Lead Flow Timeline -->
                    <div class="section-card">
                        <span class="section-title">Lead Activity & Timeline</span>
                        <div class="lead-timeline" style="margin-top: 14px; display: flex; flex-direction: column; gap: 14px;">
                            @forelse($c['leadFlow'] ?? [] as $lf)
                            <div style="display: flex; gap: 12px; position: relative;">
                                <div style="width: 28px; height: 28px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 700;">
                                    ✓
                                </div>
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h5 style="margin: 0; font-size: 13px; font-weight: 700; color: #0F172A;">{{ $lf['title'] }}</h5>
                                        <span style="font-size: 11.5px; color: #94A3B8;">{{ $lf['date'] ?? '' }} • {{ $lf['time'] ?? '' }}</span>
                                    </div>
                                    <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748B;">{{ $lf['desc'] ?? '' }}</p>
                                    <span style="font-size: 11px; color: #3B82F6; font-weight: 500;">{{ $lf['author'] ?? '' }}</span>
                                </div>
                            </div>
                            @empty
                            <p style="font-size: 12px; color: #94A3B8;">No timeline events recorded yet.</p>
                            @endforelse
                        </div>
                    </div>

                    @elseif($activeDrawerTab === 'guests')
                    <!-- Guests Tab Content -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <span class="section-title" style="margin: 0;">Registered Travelers ({{ count($activeBooking->guests ?? []) }})</span>
                        <button class="btn-primary-desktop" wire:click="openAddGuestModal" style="padding: 6px 14px; font-size: 12.5px; border-radius: 8px;">+ Add Guest</button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        @forelse($activeBooking->guests ?? [] as $g)
                        <div class="guest-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 38px; height: 38px; border-radius: 50%; background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                                    {{ substr($g['name'] ?? 'G', 0, 1) }}
                                </div>
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0F172A;">{{ $g['name'] }}</h4>
                                        <span class="tag-pill" style="font-size: 11px; padding: 2px 7px; background: #F1F5F9; color: #475569;">{{ $g['role'] ?? 'Adult' }}</span>
                                    </div>
                                    <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                                        Age: {{ $g['age'] }} • Phone: {{ $g['phone'] }}
                                    </div>
                                </div>
                            </div>
                            <button wire:click="removeGuest({{ $g['id'] }})" style="background: none; border: none; cursor: pointer; color: #EF4444; padding: 4px;" title="Remove Guest">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                        @empty
                        <p style="text-align: center; color: #94A3B8; padding: 24px;">No guests registered. Click "+ Add Guest" above.</p>
                        @endforelse
                    </div>

                    @elseif($activeDrawerTab === 'itinerary')
                    <!-- Itinerary Tab Content -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <span class="section-title" style="margin: 0;">Day-Wise Schedule</span>
                        <button class="btn-primary-desktop" wire:click="openAddEvent('Day 1')" style="padding: 6px 14px; font-size: 12.5px; border-radius: 8px;">+ Add Event</button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        @forelse($activeBooking->itinerary_days ?? [] as $dayGroup)
                        <div class="day-schedule-box" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 13px; font-weight: 800; color: #2563EB; background: #EFF6FF; padding: 2px 8px; border-radius: 6px;">{{ $dayGroup['day'] }}</span>
                                    <span style="font-size: 12.5px; color: #64748B; font-weight: 500;">{{ $dayGroup['date'] ?? '' }}</span>
                                </div>
                                <button class="action-pill-btn" wire:click="openAddEvent('{{ $dayGroup['day'] }}')" style="padding: 2px 8px; font-size: 11px;">+ Add</button>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                @foreach($dayGroup['items'] ?? [] as $item)
                                @php
                                    $isItemAssigned = !empty($item['assigned']['isAssigned']);
                                    $isCompleted = !empty($item['isCompleted']);
                                @endphp
                                <div class="itinerary-item-row" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                                    <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
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
                                        <button class="action-pill-btn" wire:click="openAssignModal('{{ $dayGroup['day'] }}', '{{ $item['id'] }}')" style="padding: 3px 8px; font-size: 11px;">+ Assign</button>
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
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 10px;">
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

                <!-- Sleek Sticky Footer Action Bar -->
                <div class="desktop-drawer-footer">
                    <button class="btn-primary-desktop desktop-confirm-booking-btn" wire:click="confirmBooking('{{ $activeBooking->id }}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Confirm Booking</span>
                    </button>
                    <div class="desktop-footer-actions-group">
                        <button class="desktop-action-icon-btn btn-action-call" wire:click="triggerAction('call')" title="Call Customer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            <span>Call</span>
                        </button>
                        <button class="desktop-action-icon-btn btn-action-msg" wire:click="triggerAction('whatsapp')" title="WhatsApp Message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            </svg>
                            <span>WhatsApp</span>
                        </button>
                        <button class="desktop-action-icon-btn btn-action-fwd" wire:click="triggerAction('share')" title="Forward Voucher">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                <path d="m22 2-7 20-4-9-9-4Z"/>
                                <path d="M22 2 11 13"/>
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
                @endif
            </aside>
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
                        <h2>Ruyi Admin</h2>
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
                <div class="desktop-search-wrapper" style="margin-top: 10px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                    </svg>
                    <input type="text" wire:model.live.debounce.200ms="search" placeholder="Search bookings..." />
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
                    <button class="action-pill-btn" wire:click="bulkAssign">+ Assign</button>
                    <button class="action-pill-btn" wire:click="clearSelection" style="color: #64748B;">Clear</button>
                </div>
            </div>
            @endif

            <!-- Mobile Cards List -->
            <div class="mobile-cards-container" style="padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;">
                @forelse($bookings as $b)
                @php $isSelected = in_array($b->id, $selectedBookings); @endphp
                <div class="mobile-booking-card" wire:click="openDrawer('{{ $b->id }}')" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; position: relative;">
                    <div style="display: flex; gap: 12px;">
                        <div wire:click.stop="toggleSelectBooking('{{ $b->id }}')" style="padding-top: 2px;">
                            <div class="custom-checkbox {{ $isSelected ? 'checked' : '' }}">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                        </div>
                        <img src="{{ $b->image }}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" alt="" />
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <span class="tag-pill {{ $b->type_class }}" style="font-size: 10px; padding: 2px 6px;">{{ $b->type }}</span>
                                <span class="status-badge {{ $b->status_class }}" style="font-size: 11px;">{{ $b->status }}</span>
                            </div>
                            <h4 style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ $b->title }}</h4>
                            <div style="font-size: 12px; color: #64748B;">{{ $b->id }} • {{ $b->dates }}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                                <span style="font-size: 12px; color: #475569; font-weight: 600;">{{ $b->pax }} Travelers</span>
                                <span style="font-size: 14px; font-weight: 800; color: #2563EB;">{{ $b->price }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                @empty
                <p style="text-align: center; color: #94A3B8; padding: 24px;">No bookings found.</p>
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
                    <button type="submit" class="btn-primary-desktop">+ Add Guest</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Special Requirements Modal -->
    <div class="modal-overlay {{ $showSpecialReqModal ? 'open' : '' }}">
        <div class="modal-card">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
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
                        <button type="button" wire:click="addPresetRequirement('preset-1')" class="action-pill-btn" style="font-size: 11px;">+ Veg Food</button>
                        <button type="button" wire:click="addPresetRequirement('preset-2')" class="action-pill-btn" style="font-size: 11px;">+ Connecting Rooms</button>
                        <button type="button" wire:click="addPresetRequirement('preset-3')" class="action-pill-btn" style="font-size: 11px;">+ Wheelchair</button>
                        <button type="button" wire:click="addPresetRequirement('preset-4')" class="action-pill-btn" style="font-size: 11px;">+ Near Beach</button>
                        <button type="button" wire:click="addPresetRequirement('preset-5')" class="action-pill-btn" style="font-size: 11px;">+ Kid Friendly</button>
                        <button type="button" wire:click="addPresetRequirement('preset-6')" class="action-pill-btn" style="font-size: 11px;">+ Baby Cot</button>
                        <button type="button" wire:click="addPresetRequirement('preset-7')" class="action-pill-btn" style="font-size: 11px;">+ Late Check-out</button>
                    </div>
                </div>

                <div class="form-group">
                    <label>Add Custom Requirement</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" wire:model="customReqText" placeholder="e.g. Extra pillows, Non-smoking room" style="flex: 1;" />
                        <button type="button" wire:click="addCustomRequirement" class="btn-primary-desktop" style="padding: 0 16px; border-radius: 10px; font-size: 13px; font-weight: 700; white-space: nowrap;">+ Add</button>
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
                <button type="button" class="btn-primary-desktop" wire:click="saveAddEvent" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">+ Add to Itinerary</button>
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
                    <span class="tag-activity-pill" style="padding: 3px 8px; border-radius: 9999px; background: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 700; text-transform: uppercase;">{{ $assignTargetItem['type'] ?? 'ACTIVITY' }}</span>
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

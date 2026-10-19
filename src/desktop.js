// Desktop / PC Admin View Renderer and Controller
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from './data.js';

export function createDesktopView(container) {
  let bookings = [...INITIAL_BOOKINGS];
  let activeTab = 'All Bookings';
  let searchQuery = '';
  let selectedCategory = 'ALL';
  let activeBooking = null; // Default: closed popup, table is full-width!
  let isDetailDrawerOpen = false;
  let activeDetailTab = 'overview';
  let guestSearchQuery = '';

  container.innerHTML = `
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
          <a class="sidebar-nav-item" href="#dashboard" id="nav-dashboard">
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

          <a class="sidebar-nav-item active" href="#bookings" id="nav-bookings">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
              </svg>
              <span>Bookings</span>
            </div>
            <span class="sidebar-badge" id="sidebar-total-badge">28</span>
          </a>

          <a class="sidebar-nav-item" href="#enquiries" id="nav-enquiries">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Enquiries</span>
            </div>
            <span class="sidebar-badge">5</span>
          </a>

          <a class="sidebar-nav-item" href="#calendar" id="nav-calendar">
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
          ${STAFF_MEMBERS.map(s => `
            <div class="sidebar-nav-item staff-member-item" data-staff-id="${s.id}" style="cursor: pointer;" title="Filter trips assigned to ${s.name}">
              <div class="nav-left">
                <img src="${s.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
                <span style="font-size: 13px;">${s.name}</span>
              </div>
              <span class="sidebar-badge" style="font-size: 10px;">${s.activeTrips} trips</span>
            </div>
          `).join('')}

          <span class="nav-section-title">System</span>
          <a class="sidebar-nav-item" href="#settings" id="nav-settings">
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
            <input type="text" id="desktop-search-input" placeholder="Search by booking ID, destination, or guest name..." />
            <button id="desktop-search-clear" style="display: none; background: transparent; border: none; cursor: pointer; color: #94A3B8;">✕</button>
          </div>

          <div class="desktop-header-actions">
            <a href="/mobile.html" class="btn-secondary-desktop" style="text-decoration: none;" title="Open clean mobile responsive preview">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <line x1="12" x2="12.01" y1="18" y2="18"/>
              </svg>
              Mobile View
            </a>
            <button class="btn-secondary-desktop" id="desktop-export-btn" title="Download Bookings as CSV">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Export CSV
            </button>
            <button class="btn-primary-desktop" id="desktop-new-booking-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" x2="12" y1="5" y2="19"/>
                <line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
              New Booking
            </button>
            <button class="icon-bell-btn" id="desktop-bell-btn" title="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span class="bell-dot"></span>
            </button>
          </div>
        </header>

        <!-- Body with Metrics and Full-Width Table (Spacious & Clean) -->
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
                  <h3 id="stat-total-bookings">28</h3>
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
                  <h3 id="stat-total-pax">142 Pax</h3>
                  <div class="metric-trend">Active across 6 tours</div>
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
                  <h3 id="stat-revenue">₹2,19,500</h3>
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
                  <h3 id="stat-pending">₹32,500</h3>
                  <div class="metric-trend" style="color: #EA580C;">2 Bookings awaiting</div>
                </div>
              </div>
            </div>

            <!-- Table Container with Toolbar -->
            <div class="desktop-table-container">
              <div class="table-toolbar">
                <div class="toolbar-tabs-group">
                  <button class="desktop-tab-btn ${activeTab === 'All Bookings' ? 'active' : ''}" data-d-tab="All Bookings">
                    All Bookings (28)
                  </button>
                  <button class="desktop-tab-btn ${activeTab === 'New Bookings' ? 'active' : ''}" data-d-tab="New Bookings">
                    New Bookings (8)
                  </button>
                  <button class="desktop-tab-btn ${activeTab === 'Assigned' ? 'active' : ''}" data-d-tab="Assigned">
                    Assigned (12)
                  </button>
                  <button class="desktop-tab-btn ${activeTab === 'Ongoing' ? 'active' : ''}" data-d-tab="Ongoing">
                    Ongoing (6)
                  </button>
                </div>

                <div class="toolbar-actions-group">
                  <select id="desktop-category-filter" style="padding: 8px 14px; border-radius: 10px; border: 1px solid #CBD5E1; font-size: 13.5px; font-family: inherit; font-weight: 500; background: #FFFFFF; color: #1E293B; cursor: pointer;">
                    <option value="ALL">All Categories</option>
                    <option value="TOUR">Tour Packages</option>
                    <option value="VILLA">Villas & Resorts</option>
                    <option value="ACTIVITY">Activities & Sports</option>
                    <option value="TRANSPORT">Transports</option>
                  </select>
                </div>
              </div>

              <!-- Selection Banner -->
              <div class="desktop-selection-bar" id="desktop-selection-banner" style="display: none;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="custom-checkbox" id="desktop-select-all-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span id="desktop-selected-label">0 bookings selected</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 12px;" id="desktop-bulk-assign-btn">
                    + Assign Coordinator
                  </button>
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 12px;" id="desktop-bulk-paid-btn">
                    Mark as Paid
                  </button>
                  <button class="btn-secondary-desktop" style="height: 32px; font-size: 12.5px; padding: 0 10px; color: #64748B;" id="desktop-bulk-clear-btn">
                    Clear
                  </button>
                </div>
              </div>

              <!-- Table Element -->
              <table class="bookings-table">
                <thead>
                  <tr>
                    <th style="width: 44px; text-align: center;"></th>
                    <th style="min-width: 220px;">Booking / Trip</th>
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
                <tbody id="desktop-table-body">
                  <!-- Rows populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Slide-Over Drawer Backdrop Overlay -->
      <div class="desktop-drawer-backdrop" id="desktop-drawer-backdrop"></div>

      <!-- Slide-Over Detail Drawer (Popup on PC) -->
      <aside class="desktop-details-drawer" id="desktop-details-drawer">
        <!-- Top bar with title and close button -->
        <div class="drawer-top-bar">
          <div class="drawer-top-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>
            <span>Trip Details</span>
          </div>
          <button class="drawer-close-btn" id="close-desktop-detail-btn" title="Close (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Sheet Header Card -->
        <div class="sheet-header-card" id="desktop-sheet-header">
          <!-- Rendered dynamically -->
        </div>

        <!-- Tabs -->
        <div class="sheet-tabs-nav">
          <button class="sheet-tab-btn ${activeDetailTab === 'overview' ? 'active' : ''}" data-dt-tab="overview">Overview</button>
          <button class="sheet-tab-btn ${activeDetailTab === 'guests' ? 'active' : ''}" data-dt-tab="guests">Guests (<span id="desktop-guest-count-badge">0</span>)</button>
          <button class="sheet-tab-btn ${activeDetailTab === 'itinerary' ? 'active' : ''}" data-dt-tab="itinerary">Itinerary</button>
          <button class="sheet-tab-btn ${activeDetailTab === 'updates' ? 'active' : ''}" data-dt-tab="updates">Updates</button>
        </div>

        <!-- Scrollable Detail Body -->
        <div class="sheet-body-scroll" id="desktop-sheet-body">
          <!-- Rendered dynamically -->
        </div>

        <!-- Sticky Footer Action -->
        <div class="sheet-sticky-footer">
          <button class="btn-confirm-booking" id="desktop-confirm-booking-btn">Confirm Booking</button>
          <div class="sheet-quick-actions-grid">
            <button class="quick-action-col-btn btn-act-call" id="desktop-act-call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </button>
            <button class="quick-action-col-btn btn-act-msg" id="desktop-act-msg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Message</span>
            </button>
            <button class="quick-action-col-btn btn-act-fwd" id="desktop-act-fwd">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span>Forward</span>
            </button>
            <button class="quick-action-col-btn btn-act-more" id="desktop-act-more">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  `;

  // Render Table Rows
  function renderTable() {
    const tbody = container.querySelector('#desktop-table-body');
    if (!tbody) return;

    let filtered = bookings.filter(b => {
      const matchSearch = !searchQuery || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.guest.phone && b.guest.phone.includes(searchQuery));

      const matchTab = activeTab === 'All Bookings' || b.category === activeTab;
      const matchCat = selectedCategory === 'ALL' || b.type === selectedCategory;

      return matchSearch && matchTab && matchCat;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 48px 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #64748B;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: #94A3B8;">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <h4 style="font-size: 15px; color: #0F172A; font-weight: 700;">No bookings found</h4>
              <p style="font-size: 13px;">No results matching your query. Try resetting filters.</p>
              <button class="btn-secondary-desktop" id="btn-reset-filters" style="height: 32px; font-size: 12.5px; margin-top: 6px;">Reset Filters</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(b => {
      const isRowActive = activeBooking && activeBooking.id === b.id;
      return `
        <tr class="${isRowActive ? 'row-selected row-active' : ''}" data-desktop-row-id="${b.id}">
          <td style="text-align: center;">
            <div class="custom-checkbox ${b.selected ? 'checked' : ''}" data-d-select-id="${b.id}">
              ${b.selected ? `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ` : ''}
            </div>
          </td>
          <td>
            <div class="table-booking-cell">
              <div class="table-thumb">
                <img src="${b.image}" alt="${b.title}" />
              </div>
              <div class="table-booking-info">
                <h4>${b.title}</h4>
                <p>${b.id} • ${b.destination}</p>
              </div>
            </div>
          </td>
          <td>
            <span class="card-type-badge ${b.typeClass}">${b.type}</span>
          </td>
          <td>
            <span style="font-weight: 600; color: #0F172A;">${b.pax} Pax</span>
            <div style="font-size: 12px; color: #64748B;">${b.duration}</div>
          </td>
          <td>
            <span style="font-weight: 500; color: #334155;">${b.dates}</span>
          </td>
          <td>
            <span style="font-weight: 600; color: #0F172A;">${b.guest.name}</span>
            <div style="font-size: 12px; color: #64748B;">${b.guest.phone}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${b.assignedTo.avatar ? `<img src="${b.assignedTo.avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />` : ''}
              <span style="font-size: 13px; font-weight: 500; color: #1E293B;">${b.assignedTo.name}</span>
            </div>
          </td>
          <td>
            <span class="status-pill ${b.statusClass}">
              <span class="dot"></span>
              ${b.status}
            </span>
          </td>
          <td>
            <span style="font-size: 15px; font-weight: 700; color: #0F172A;">${b.price}</span>
          </td>
          <td style="text-align: right; padding-right: 24px;">
            <button class="row-view-details-btn" data-open-detail="${b.id}" title="View details for ${b.title}">
              <span>View</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Update selection count banner
    const selectedCount = bookings.filter(b => b.selected).length;
    const bannerEl = container.querySelector('#desktop-selection-banner');
    const labelEl = container.querySelector('#desktop-selected-label');
    const allBox = container.querySelector('#desktop-select-all-box');

    if (bannerEl) {
      if (selectedCount > 0) {
        bannerEl.style.display = 'flex';
        if (labelEl) labelEl.textContent = `${selectedCount} booking${selectedCount > 1 ? 's' : ''} selected`;
        if (allBox) allBox.className = selectedCount === bookings.length ? 'custom-checkbox checked' : 'custom-checkbox checked';
      } else {
        bannerEl.style.display = 'none';
        if (allBox) allBox.className = 'custom-checkbox';
      }
    }
  }

  // Open & Close Detail Popup Drawer
  function openDrawer(booking) {
    activeBooking = booking;
    isDetailDrawerOpen = true;
    renderDetailPanel();
    renderTable();

    const drawer = container.querySelector('#desktop-details-drawer');
    const backdrop = container.querySelector('#desktop-drawer-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  function closeDrawer() {
    activeBooking = null;
    isDetailDrawerOpen = false;
    renderTable();

    const drawer = container.querySelector('#desktop-details-drawer');
    const backdrop = container.querySelector('#desktop-drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  // Render Details inside Drawer
  function renderDetailPanel() {
    const headerEl = container.querySelector('#desktop-sheet-header');
    const bodyEl = container.querySelector('#desktop-sheet-body');
    const countBadge = container.querySelector('#desktop-guest-count-badge');
    if (!headerEl || !bodyEl || !activeBooking) return;

    const b = activeBooking;
    if (countBadge) countBadge.textContent = b.guests.length;

    // Header
    headerEl.innerHTML = `
      <div class="sheet-card-top-row">
        <div class="sheet-thumb">
          <img src="${b.image}" alt="${b.title}" />
        </div>
        <div class="sheet-header-info">
          <div class="sheet-tag-row">
            <span class="card-type-badge ${b.typeClass}">${b.type}</span>
            <span class="status-pill ${b.statusClass}">
              <span class="dot"></span>
              ${b.status}
            </span>
          </div>
          <h2 class="sheet-title">${b.title}</h2>
          <p class="sheet-sub-id">Booking ID: <strong>${b.id}</strong></p>
        </div>
      </div>
      <div class="sheet-stats-row">
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span>${b.pax} Pax</span>
        </div>
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span>${b.dates}</span>
        </div>
        <div class="stat-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 4v16"/>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
            <path d="M2 17h20"/>
            <path d="M6 8v9"/>
          </svg>
          <span>${b.duration}</span>
        </div>
      </div>
    `;

    // Body content by tab
    if (activeDetailTab === 'overview') {
      bodyEl.innerHTML = `
        <div class="detail-rows-list">
          <!-- Lead Guest -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Lead Guest</span>
              <div class="detail-value">${b.guest.name}</div>
            </div>
          </div>

          <!-- Contact with action buttons -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Contact</span>
              <div class="detail-value">${b.guest.phone}</div>
            </div>
            <div class="detail-contact-actions">
              <button class="circle-action-btn btn-phone" title="Call Guest" id="action-call-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-whatsapp" title="WhatsApp Guest" id="action-wa-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-email" title="Email Guest" id="action-email-guest">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Destination -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Destination</span>
              <div class="detail-value">${b.destination}</div>
            </div>
            <button class="circle-action-btn btn-map" title="View Map" id="action-view-map">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" x2="9" y1="3" y2="18"/>
                <line x1="15" x2="15" y1="6" y2="21"/>
              </svg>
            </button>
          </div>

          <!-- Booking Type -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Booking Type</span>
              <div class="detail-value">${b.bookingType}</div>
            </div>
          </div>

          <!-- Travel Date -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Travel Date</span>
              <div class="detail-value">${b.travelDateFull || b.dates}</div>
            </div>
          </div>

          <!-- Services -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Included Services</span>
              <div class="detail-value">${b.services}</div>
            </div>
          </div>

          <!-- Assigned Coordinator -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Assigned Coordinator</span>
              <div class="assigned-avatar-pill">
                ${b.assignedTo.avatar ? `<img src="${b.assignedTo.avatar}" alt="${b.assignedTo.name}" />` : ''}
                <span class="detail-value">${b.assignedTo.name} (${b.assignedTo.role || 'Coordinator'})</span>
              </div>
            </div>
            <button class="btn-secondary-desktop" style="height: 30px; font-size: 12px; padding: 0 10px;" id="d-change-coordinator-btn">Change</button>
          </div>

          <!-- Notes -->
          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Special Notes</span>
              <div class="detail-value-sub">${b.notes}</div>
            </div>
          </div>
        </div>
      `;
    } else if (activeDetailTab === 'guests') {
      const filteredGuests = b.guests.filter(g => 
        !guestSearchQuery || 
        g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(guestSearchQuery))
      );

      bodyEl.innerHTML = `
        <div class="guests-sub-header">
          <div class="guest-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" placeholder="Search guests in booking..." id="desktop-guest-search-input" value="${guestSearchQuery}" />
          </div>
          <button class="add-guest-pill-btn" id="desktop-add-guest-btn">+ Add Guest</button>
        </div>

        <div class="guests-cards-list">
          ${filteredGuests.map(g => `
            <div class="guest-item-card">
              <div class="guest-left-info">
                <div class="guest-num-badge">${g.id}</div>
                <div class="guest-name-col">
                  <h4>${g.name}</h4>
                  <p>Age ${g.age} ${g.role ? `• ${g.role}` : ''}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${g.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${g.name} (${g.phone})...', type: 'info' }}))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button class="circle-action-btn btn-email" title="Message ${g.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp chat with ${g.name}...', type: 'info' }}))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Bind guest search
      const gInput = container.querySelector('#desktop-guest-search-input');
      if (gInput) {
        gInput.addEventListener('input', (e) => {
          guestSearchQuery = e.target.value;
          renderDetailPanel();
        });
      }
    } else if (activeDetailTab === 'itinerary') {
      const days = b.itineraryDays || [];
      const getItemIcon = (type) => {
        if (type === 'bus' || type === 'transport') return `<div class="item-icon-box item-icon-bus"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5.3c-.3-1.1-1.3-1.9-2.4-1.9H5c-1.1 0-2.1.8-2.4 1.9L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg></div>`;
        if (type === 'bed' || type === 'hotel') return `<div class="item-icon-box item-icon-bed"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg></div>`;
        if (type === 'camera' || type === 'sightseeing') return `<div class="item-icon-box item-icon-camera"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div>`;
        if (type === 'raft' || type === 'activity') return `<div class="item-icon-box item-icon-raft"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M20 12v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3"/><line x1="8" y1="12" x2="6" y2="6"/><line x1="16" y1="12" x2="18" y2="6"/></svg></div>`;
        return `<div class="item-icon-box item-icon-restaurant"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M4 2v20"/><path d="M4 2c2 0 5 1 5 4v2a3 3 0 0 1-3 3H4"/></svg></div>`;
      };

      bodyEl.innerHTML = `
        <div class="itinerary-v2-container">
          ${days.map(d => `
            <div class="itinerary-day-section">
              <div class="timeline-day-col">
                <span class="day-badge-text">${d.day}</span>
                <span class="day-date-sub">${d.date}</span>
              </div>
              <div class="timeline-track-col">
                <div class="timeline-line-track"></div>
                <div class="timeline-dot-node"></div>
              </div>
              <div class="timeline-items-col">
                ${d.items.map(item => `
                  <div class="itinerary-card-item">
                    <div class="item-left-content">
                      ${getItemIcon(item.type)}
                      <div class="item-text-info">
                        <h4 class="item-text-title">${item.title}</h4>
                        <p class="item-text-sub">${item.subtitle}</p>
                      </div>
                    </div>
                    <div class="item-right-content">
                      ${item.assigned && item.assigned.isAssigned ? `
                        <span class="assigned-pill-badge">Assigned</span>
                        <img src="${item.assigned.avatar}" class="assigned-avatar-mini" alt="${item.assigned.name}" title="Assigned to ${item.assigned.name}" />
                      ` : ''}
                      <button class="item-menu-btn" title="Actions" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Item options for: ${item.title}', type: 'info' }}))">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <circle cx="12" cy="12" r="1.5"/>
                          <circle cx="12" cy="5" r="1.5"/>
                          <circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeDetailTab === 'updates') {
      bodyEl.innerHTML = `
        <div class="updates-list">
          ${b.updates.map(u => `
            <div class="update-log-card">
              <div class="update-log-header">
                <span class="update-log-title">${u.title}</span>
                <span class="update-log-time">${u.time}</span>
              </div>
              <p class="update-log-desc">${u.desc}</p>
              <div class="update-log-user">By ${u.user}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // Bind All Event Listeners
  function bindEvents() {
    // Search input
    const searchInput = container.querySelector('#desktop-search-input');
    const searchClear = container.querySelector('#desktop-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
        renderTable();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        renderTable();
      });
    }

    // Category dropdown filter
    const catSelect = container.querySelector('#desktop-category-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        renderTable();
      });
    }

    // Tabs
    container.querySelectorAll('.desktop-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.dTab;
        container.querySelectorAll('.desktop-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTable();
      });
    });

    // Detail Panel Tabs
    container.querySelectorAll('[data-dt-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeDetailTab = btn.dataset.dtTab;
        container.querySelectorAll('[data-dt-tab]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDetailPanel();
      });
    });

    // Drawer Close Button
    const closeBtn = container.querySelector('#close-desktop-detail-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Backdrop click closes drawer
    const backdrop = container.querySelector('#desktop-drawer-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Keyboard Esc closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDetailDrawerOpen) {
        closeDrawer();
      }
    });

    // Select All Checkbox
    const selectAllBox = container.querySelector('#desktop-select-all-box');
    if (selectAllBox) {
      selectAllBox.addEventListener('click', () => {
        const anyUnselected = bookings.some(b => !b.selected);
        bookings.forEach(b => b.selected = anyUnselected);
        renderTable();
      });
    }

    // Clear Selection Button
    const clearSelBtn = container.querySelector('#desktop-bulk-clear-btn');
    if (clearSelBtn) {
      clearSelBtn.addEventListener('click', () => {
        bookings.forEach(b => b.selected = false);
        renderTable();
      });
    }

    // Table Clicks & Row Selection
    container.addEventListener('click', (e) => {
      // Reset filters button in empty state
      if (e.target.closest('#btn-reset-filters') || e.target.closest('#btn-clear-table-search')) {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        if (catSelect) catSelect.value = 'ALL';
        selectedCategory = 'ALL';
        activeTab = 'All Bookings';
        container.querySelectorAll('.desktop-tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.dTab === 'All Bookings');
        });
        renderTable();
        return;
      }

      // Checkbox click
      const chk = e.target.closest('[data-d-select-id]');
      if (chk) {
        e.stopPropagation();
        const id = chk.dataset.dSelectId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          b.selected = !b.selected;
          renderTable();
        }
        return;
      }

      // Action button "View" or Row Click -> Open Popup Drawer!
      const openBtn = e.target.closest('[data-open-detail]');
      const row = e.target.closest('[data-desktop-row-id]');
      if (openBtn || row) {
        const id = openBtn ? openBtn.dataset.openDetail : row.dataset.desktopRowId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          openDrawer(b);
        }
        return;
      }

      // Add Guest Button inside Drawer
      if (e.target.closest('#desktop-add-guest-btn')) {
        if (activeBooking) {
          window.dispatchEvent(new CustomEvent('open-add-guest-modal', {
            detail: { bookingId: activeBooking.id }
          }));
        }
        return;
      }

      // Change Coordinator inside Drawer
      if (e.target.closest('#d-change-coordinator-btn')) {
        if (activeBooking) {
          window.dispatchEvent(new CustomEvent('open-assign-staff-modal', {
            detail: { bookingIds: [activeBooking.id] }
          }));
        }
        return;
      }

      // Confirm Booking Button inside Drawer
      if (e.target.closest('#desktop-confirm-booking-btn')) {
        if (activeBooking) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Booking ${activeBooking.id} (${activeBooking.title}) confirmed successfully! Vouchers sent.`, type: 'success' }
          }));
        }
        return;
      }

      // Action buttons in Drawer Overview tab
      if (e.target.closest('#action-call-guest')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Dialing Lead Guest ${activeBooking.guest.name} (${activeBooking.guest.phone})...`, type: 'info' }
        }));
        return;
      }
      if (e.target.closest('#action-wa-guest')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Opening WhatsApp chat with ${activeBooking.guest.name}...`, type: 'success' }
        }));
        return;
      }
      if (e.target.closest('#action-email-guest')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Opening email draft for ${activeBooking.guest.name}...`, type: 'info' }
        }));
        return;
      }
      if (e.target.closest('#action-view-map')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Opening map view for destination: ${activeBooking.destination}...`, type: 'info' }
        }));
        return;
      }

      // Drawer quick action buttons in footer
      if (e.target.closest('#desktop-act-call')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Connecting call to ${activeBooking?.guest?.name || 'Lead Guest'}...`, type: 'info' }
        }));
        return;
      }
      if (e.target.closest('#desktop-act-msg')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Messaging thread opened for ${activeBooking?.guest?.name || 'Lead Guest'}`, type: 'info' }
        }));
        return;
      }
      if (e.target.closest('#desktop-act-fwd')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Trip voucher forwarded to operations team!`, type: 'success' }
        }));
        return;
      }
      if (e.target.closest('#desktop-act-more')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Opening booking options (Print Voucher, Duplicate, Export Invoice)...`, type: 'info' }
        }));
        return;
      }

      // Staff member in left sidebar -> filter trips by staff
      const staffNav = e.target.closest('.staff-member-item');
      if (staffNav) {
        const staffId = staffNav.dataset.staffId;
        const staff = STAFF_MEMBERS.find(s => s.id === staffId);
        if (staff) {
          if (searchInput) searchInput.value = staff.name;
          searchQuery = staff.name;
          renderTable();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Showing bookings assigned to ${staff.name}`, type: 'info' }
          }));
        }
        return;
      }

      // Bulk assign or bulk paid
      if (e.target.closest('#desktop-bulk-assign-btn')) {
        const selectedIds = bookings.filter(b => b.selected).map(b => b.id);
        if (selectedIds.length > 0) {
          window.dispatchEvent(new CustomEvent('open-assign-staff-modal', {
            detail: { bookingIds: selectedIds }
          }));
        }
        return;
      }
      if (e.target.closest('#desktop-bulk-paid-btn')) {
        const selected = bookings.filter(b => b.selected);
        if (selected.length > 0) {
          selected.forEach(b => {
            b.status = 'Paid';
            b.statusClass = 'status-paid';
          });
          renderTable();
          if (activeBooking) renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Marked ${selected.length} booking(s) as Paid!`, type: 'success' }
          }));
        }
        return;
      }

      // Export CSV Button -> Actually downloads real CSV!
      if (e.target.closest('#desktop-export-btn')) {
        const headers = ["Booking ID", "Title", "Category", "Pax", "Duration", "Travel Dates", "Lead Guest", "Phone", "Assigned To", "Status", "Price"];
        const rows = bookings.map(b => [
          `"${b.id}"`,
          `"${b.title.replace(/"/g, '""')}"`,
          `"${b.type}"`,
          `"${b.pax}"`,
          `"${b.duration}"`,
          `"${b.dates}"`,
          `"${b.guest.name}"`,
          `"${b.guest.phone}"`,
          `"${b.assignedTo.name}"`,
          `"${b.status}"`,
          `"${b.price}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ruyi_admin_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Exported ${bookings.length} bookings to CSV!`, type: 'success' }
        }));
        return;
      }

      // New Booking Button
      if (e.target.closest('#desktop-new-booking-btn')) {
        window.dispatchEvent(new CustomEvent('open-new-booking-modal'));
        return;
      }

      // Notification Bell
      if (e.target.closest('#desktop-bell-btn')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'You have 3 unread operations updates.', type: 'info' }
        }));
        return;
      }
    });
  }

  // Initial renders
  renderTable();
  bindEvents();

  return {
    getBookings: () => bookings,
    openBooking: (id) => {
      const b = bookings.find(item => item.id === id);
      if (b) openDrawer(b);
    },
    closeDrawer,
    updateBooking: (updated) => {
      const idx = bookings.findIndex(b => b.id === updated.id);
      if (idx !== -1) {
        bookings[idx] = updated;
        renderTable();
        if (activeBooking && activeBooking.id === updated.id) {
          activeBooking = updated;
          renderDetailPanel();
        }
      }
    },
    addBooking: (newBooking) => {
      bookings.unshift(newBooking);
      renderTable();
      openDrawer(newBooking);
    }
  };
}

// Mobile View Renderer and Controller
import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST } from './data.js';

export function createMobileView(container, options = {}) {
  let bookings = [...INITIAL_BOOKINGS];
  let vendors = [...VENDORS_LIST];
  let activeCategory = 'New Bookings'; // 'New Bookings', 'Assigned', 'Ongoing'
  let searchQuery = '';
  let activeModalBooking = bookings[0]; // Haridwar - Kashi Trip BK-5021
  let activeModalTab = options.initialTab || 'overview'; // 'overview', 'guests', 'itinerary', 'updates'
  let isModalOpen = options.autoOpenModal !== undefined ? options.autoOpenModal : false;
  let showAllGuests = false;

  // Itinerary & Assign State
  let openDropdownItemId = options.initialDropdownItemId || null; // e.g. 'IT-101' to preview Screen 2
  let isAssignSheetOpen = options.initialAssignSheetOpen || false; // to preview Screen 3
  let targetActivityItem = activeModalBooking.itineraryDays?.[1]?.items?.[1] || null; // River Rafting
  let selectedVendorId = 'V-01'; // Adventure World
  let assignVendorTab = 'Vendors';
  let vendorSearchQuery = '';
  let optionalNoteText = '';

  // Root container structure
  container.innerHTML = `
    <div class="phone-device">
      <!-- Status Bar -->
      <div class="mobile-status-bar">
        <span class="status-time">9:41</span>
        <div class="status-bar-icons">
          <!-- Signal Icon -->
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="16" width="3" height="5" rx="1"/>
            <rect x="7" y="12" width="3" height="9" rx="1"/>
            <rect x="12" y="8" width="3" height="13" rx="1"/>
            <rect x="17" y="4" width="3" height="17" rx="1"/>
          </svg>
          <!-- Wifi Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M5 13a10 10 0 0 1 14 0" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M12 20h.01" />
          </svg>
          <!-- Battery Icon -->
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="7" width="17" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
            <rect x="4" y="9" width="11" height="6" rx="1.5"/>
            <path d="M21 10.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Scrollable Main Screen Content -->
      <div class="mobile-screen-content" id="mobile-screen-scroll">
        <!-- Header -->
        <div class="mobile-app-header">
          <div class="app-brand-left">
            <div class="brand-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
              </svg>
            </div>
            <div class="brand-text-col">
              <h2>Ruyi Admin</h2>
              <p>Bookings • 28 Total</p>
            </div>
          </div>
          <div class="app-header-right">
            <button class="icon-bell-btn" id="mobile-bell-btn" title="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span class="bell-dot"></span>
            </button>
            <div class="ks-avatar-badge" title="Karan Sapalia">KS</div>
          </div>
        </div>

        <!-- Page Title -->
        <div class="mobile-title-section">
          <h1>Bookings</h1>
          <p>Manage and track all types of bookings.</p>
        </div>

        <!-- Search & Filter Row -->
        <div class="mobile-search-row">
          <div class="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="mobile-search-input" placeholder="Search by guest, destination or ID..." />
          </div>
          <button class="filter-btn-square" id="mobile-filter-btn" title="Filter Bookings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="21" x2="14" y1="4" y2="4"/>
              <line x1="10" x2="3" y1="4" y2="4"/>
              <line x1="21" x2="12" y1="12" y2="12"/>
              <line x1="8" x2="3" y1="12" y2="12"/>
              <line x1="21" x2="16" y1="20" y2="20"/>
              <line x1="12" x2="3" y1="20" y2="20"/>
              <line x1="14" x2="14" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="10" y2="14"/>
              <line x1="16" x2="16" y1="18" y2="22"/>
            </svg>
          </button>
        </div>

        <!-- Status Filter Tabs / Pills -->
        <div class="category-filter-tabs">
          <button class="tab-pill ${activeCategory === 'New Bookings' ? 'active' : ''}" data-cat="New Bookings">
            New Bookings <span class="pill-badge">8</span>
          </button>
          <button class="tab-pill ${activeCategory === 'Assigned' ? 'active' : ''}" data-cat="Assigned">
            Assigned <span class="pill-badge">12</span>
          </button>
          <button class="tab-pill ${activeCategory === 'Ongoing' ? 'active' : ''}" data-cat="Ongoing">
            Ongoing <span class="pill-badge">6</span>
          </button>
        </div>

        <!-- Selection / Bulk Action Bar -->
        <div class="mobile-selection-bar">
          <div class="selection-left">
            <div class="custom-checkbox checked" id="mobile-select-all-box">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span id="mobile-selected-count">2 selected</span>
          </div>
          <div class="selection-actions-right">
            <button class="action-pill-btn" id="mobile-bulk-assign-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" x2="19" y1="8" y2="14"/>
                <line x1="22" x2="16" y1="11" y2="11"/>
              </svg>
              + Assign
            </button>
            <button class="action-more-btn" id="mobile-bulk-more-btn" title="More options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Bookings Cards List -->
        <div class="bookings-cards-list" id="mobile-cards-list"></div>
      </div>

      <!-- Bottom Navigation Bar (Fixed) -->
      <div class="mobile-bottom-nav">
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          Dashboard
        </button>
        <button class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            <rect width="20" height="14" x="2" y="6" rx="2"/>
          </svg>
          Bookings
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Enquiries
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          Calendar
        </button>
        <button class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/>
            <rect width="7" height="7" x="3" y="14" rx="1"/>
          </svg>
          More
        </button>
      </div>

      <!-- Home Indicator -->
      <div class="home-indicator"></div>

      <!-- Backdrop for Bottom Sheet Modal -->
      <div class="sheet-backdrop ${isModalOpen ? 'open' : ''}" id="mobile-sheet-backdrop"></div>

      <!-- Bottom Sheet Modal (Screens 1, 2, 4) -->
      <div class="bottom-sheet ${isModalOpen ? 'open' : ''}" id="mobile-bottom-sheet">
        <!-- Sheet Header Card & Controls -->
        <div id="sheet-header-card-content">
          <!-- Populated dynamically -->
        </div>

        <!-- Sheet Navigation Tabs (Overview, Guests, Itinerary, Updates) -->
        <div class="sheet-tabs-nav">
          <button class="sheet-tab-btn ${activeModalTab === 'overview' ? 'active' : ''}" data-sheet-tab="overview">Overview</button>
          <button class="sheet-tab-btn ${activeModalTab === 'guests' ? 'active' : ''}" data-sheet-tab="guests">Guests (<span id="sheet-guest-count-badge">12</span>)</button>
          <button class="sheet-tab-btn ${activeModalTab === 'itinerary' ? 'active' : ''}" data-sheet-tab="itinerary">Itinerary</button>
          <button class="sheet-tab-btn ${activeModalTab === 'updates' ? 'active' : ''}" data-sheet-tab="updates">Updates</button>
        </div>

        <!-- Sheet Body Scroll Content -->
        <div class="sheet-body-scroll" id="sheet-body-content">
          <!-- Populated dynamically based on active tab -->
        </div>

        <!-- Sheet Sticky Footer Action Section -->
        <div class="sheet-sticky-footer">
          <button class="btn-confirm-booking" id="mobile-confirm-booking-btn">Confirm Booking</button>
          <div class="sheet-quick-actions-grid">
            <button class="quick-action-col-btn btn-act-call" id="sheet-act-call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </button>
            <button class="quick-action-col-btn btn-act-msg" id="sheet-act-msg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Message</span>
            </button>
            <button class="quick-action-col-btn btn-act-fwd" id="sheet-act-fwd">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span>Forward</span>
            </button>
            <button class="quick-action-col-btn btn-act-more" id="sheet-act-more">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Assign to Modal Sheet (Screen 3) -->
      <div class="assign-to-sheet ${isAssignSheetOpen ? 'open' : ''}" id="mobile-assign-to-sheet">
        <!-- Top Drag Handle & Bar -->
        <div class="sheet-drag-handle-bar">
          <div class="sheet-handle"></div>
        </div>
        <div class="assign-header-bar">
          <h3>Assign to</h3>
          <button class="sheet-close-btn" id="close-assign-to-sheet-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Selected Activity Card -->
        <div class="assign-activity-card" id="assign-activity-card-view">
          <div class="assign-activity-thumb">
            <img src="/images/rishikesh.jpg" alt="River Rafting" />
          </div>
          <div class="assign-activity-info">
            <h4>River Rafting (16 km)</h4>
            <p>Day 2 • 10:00 AM • Rishikesh</p>
          </div>
          <span class="tag-activity-pill">Activity</span>
        </div>

        <!-- Tabs: Team Members, Vendors, Contacts -->
        <div class="assign-tabs-row">
          <button class="assign-tab-btn ${assignVendorTab === 'Team Members' ? 'active' : ''}" data-assign-tab="Team Members">Team Members</button>
          <button class="assign-tab-btn ${assignVendorTab === 'Vendors' ? 'active' : ''}" data-assign-tab="Vendors">Vendors</button>
          <button class="assign-tab-btn ${assignVendorTab === 'Contacts' ? 'active' : ''}" data-assign-tab="Contacts">Contacts</button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="vendor-search-row">
          <div class="vendor-search-input-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="assign-vendor-search" placeholder="Search vendor by name, service or location..." />
          </div>
          <button class="filter-btn-square" style="width: 38px; height: 38px;" title="Filter Vendors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="21" x2="14" y1="4" y2="4"/>
              <line x1="10" x2="3" y1="4" y2="4"/>
              <line x1="21" x2="12" y1="12" y2="12"/>
              <line x1="8" x2="3" y1="12" y2="12"/>
              <line x1="14" x2="14" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="10" y2="14"/>
            </svg>
          </button>
        </div>

        <!-- Vendors List -->
        <div class="vendor-list-scroll" id="assign-vendors-list">
          <!-- Rendered dynamically -->
        </div>

        <!-- Add New Vendor link -->
        <button class="btn-add-new-vendor" id="btn-add-new-vendor-trigger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" x2="12" y1="5" y2="19"/>
            <line x1="5" x2="19" y1="12" y2="12"/>
          </svg>
          Add New Vendor
        </button>

        <!-- Optional Note Input -->
        <div class="optional-note-box">
          <div class="optional-note-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="16" y2="12"/>
              <line x1="12" x2="12.01" y1="8" y2="8"/>
            </svg>
            Optional Note
          </div>
          <input type="text" class="optional-note-input" id="assign-optional-note-input" placeholder="e.g. Confirm timing and group size with vendor" />
        </div>

        <!-- Action Footer -->
        <div class="assign-footer-actions">
          <button class="btn-cancel-assign" id="btn-cancel-assign-sheet">Cancel</button>
          <button class="btn-whatsapp-assign" id="btn-submit-assign-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Assign & Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;

  // Render Functions
  function renderCards() {
    const listEl = container.querySelector('#mobile-cards-list');
    if (!listEl) return;

    let filtered = bookings.filter(b => {
      const matchSearch = !searchQuery || 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });

    listEl.innerHTML = filtered.map(b => `
      <div class="booking-card ${b.selected ? 'card-selected' : ''}" data-booking-id="${b.id}">
        <div class="custom-checkbox card-select-checkbox ${b.selected ? 'checked' : ''}" data-select-id="${b.id}">
          ${b.selected ? `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ` : ''}
        </div>
        <div class="card-thumb-wrapper">
          <img src="${b.image}" alt="${b.title}" loading="lazy" />
        </div>
        <div class="card-info-col">
          <span class="card-type-badge ${b.typeClass}">${b.type}</span>
          <h3 class="card-title">${b.title}</h3>
          <div class="card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>${b.pax} Pax • ${b.duration}</span>
          </div>
          <div class="card-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span>${b.dates}</span>
          </div>
        </div>
        <div class="card-right-col">
          <span class="status-pill ${b.statusClass}">
            <span class="dot"></span>
            ${b.status}
          </span>
          <span class="card-price">${b.price}</span>
        </div>
      </div>
    `).join('');

    const selectedCount = bookings.filter(b => b.selected).length;
    const countEl = container.querySelector('#mobile-selected-count');
    if (countEl) countEl.textContent = `${selectedCount} selected`;

    const allBox = container.querySelector('#mobile-select-all-box');
    if (allBox) {
      allBox.className = selectedCount > 0 ? 'custom-checkbox checked' : 'custom-checkbox';
    }
  }

  function renderSheetHeader() {
    const headerCard = container.querySelector('#sheet-header-card-content');
    if (!headerCard || !activeModalBooking) return;

    const b = activeModalBooking;

    // When on Itinerary tab, render the exact header from Screen 1, 2, 4!
    if (activeModalTab === 'itinerary') {
      headerCard.innerHTML = `
        <div class="sheet-drag-handle-bar" style="padding-bottom: 0;">
          <div class="sheet-handle"></div>
        </div>
        <div class="sheet-header-bar-v2">
          <button class="back-title-btn" id="itinerary-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Booking Details</span>
          </button>
          <button class="sheet-close-btn" id="mobile-sheet-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-title-price-row">
          <h2 class="sheet-title-large">${b.title}</h2>
          <div class="sheet-price-col">
            <div class="price-main">${b.price}</div>
            <div class="booking-id-sub">${b.id}</div>
          </div>
        </div>
        <div class="sheet-stats-row" style="padding: 2px 18px 12px 18px;">
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
            <span>4D / 3N</span>
          </div>
        </div>
      `;
    } else {
      // Overview & Guests header (from earlier reference)
      headerCard.innerHTML = `
        <div class="sheet-drag-handle-bar">
          <div class="sheet-handle"></div>
          <button class="sheet-close-btn" id="mobile-sheet-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-header-card">
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
              <p class="sheet-sub-id">Booking ID ${b.id}</p>
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
              <span>4D / 3N</span>
            </div>
          </div>
        </div>
      `;
    }

    const guestBadge = container.querySelector('#sheet-guest-count-badge');
    if (guestBadge) guestBadge.textContent = b.guests.length;
  }

  function getItemIconSvg(type) {
    switch (type) {
      case 'bus':
      case 'transport':
        return `
          <div class="item-icon-box item-icon-bus">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5.3c-.3-1.1-1.3-1.9-2.4-1.9H5c-1.1 0-2.1.8-2.4 1.9L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>
          </div>
        `;
      case 'bed':
      case 'hotel':
        return `
          <div class="item-icon-box item-icon-bed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 4v16"/>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
              <path d="M2 17h20"/>
              <path d="M6 8v9"/>
            </svg>
          </div>
        `;
      case 'camera':
      case 'sightseeing':
        return `
          <div class="item-icon-box item-icon-camera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
        `;
      case 'raft':
      case 'activity':
        return `
          <div class="item-icon-box item-icon-raft">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12h20"/>
              <path d="M20 12v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3"/>
              <line x1="8" y1="12" x2="6" y2="6"/>
              <line x1="16" y1="12" x2="18" y2="6"/>
            </svg>
          </div>
        `;
      case 'restaurant':
      case 'food':
        return `
          <div class="item-icon-box item-icon-restaurant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/>
              <path d="M15 11v11"/>
              <path d="M4 2v20"/>
              <path d="M4 2c2 0 5 1 5 4v2a3 3 0 0 1-3 3H4"/>
            </svg>
          </div>
        `;
      default:
        return `<div class="item-icon-box item-icon-bus"><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></div>`;
    }
  }

  function renderSheetBody() {
    const bodyEl = container.querySelector('#sheet-body-content');
    if (!bodyEl || !activeModalBooking) return;

    const b = activeModalBooking;

    // Overview Tab
    if (activeModalTab === 'overview') {
      bodyEl.innerHTML = `
        <div class="detail-rows-list">
          <div class="detail-row-item" id="row-click-guest">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Guest</span>
              <div class="detail-value">${b.guest.name}</div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

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
              <button class="circle-action-btn btn-phone" title="Call Guest" onclick="alert('Calling ${b.guest.name} (${b.guest.phone})...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-whatsapp" title="WhatsApp Guest" onclick="alert('Opening WhatsApp for ${b.guest.name}...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </button>
              <button class="circle-action-btn btn-email" title="Email Guest" onclick="alert('Sending email to ${b.guest.email || 'guest@example.com'}...')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </button>
            </div>
          </div>

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
            <button class="circle-action-btn btn-map" title="View on Map" onclick="alert('Viewing map for ${b.destination}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" x2="9" y1="3" y2="18"/>
                <line x1="15" x2="15" y1="6" y2="21"/>
              </svg>
            </button>
          </div>

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
              <div class="detail-value">${b.travelDateFull}</div>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Services</span>
              <div class="detail-value">${b.services}</div>
            </div>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
            </div>
            <div class="detail-content">
              <div class="detail-value">${b.assignedStatus}</div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="detail-row-item" id="row-click-staff">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Assigned To</span>
              <div class="assigned-avatar-pill">
                ${b.assignedTo.avatar ? `<img src="${b.assignedTo.avatar}" alt="${b.assignedTo.name}" />` : ''}
                <span class="detail-value">${b.assignedTo.name}</span>
              </div>
            </div>
            <svg class="row-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div class="detail-row-item">
            <div class="detail-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Notes</span>
              <div class="detail-value-sub">${b.notes}</div>
            </div>
          </div>
        </div>
      `;
    } 
    // Guests Tab (Screen 4 from earlier)
    else if (activeModalTab === 'guests') {
      const visibleGuests = showAllGuests ? b.guests : b.guests.slice(0, 4);
      const remainingCount = b.guests.length - 4;

      bodyEl.innerHTML = `
        <div class="guests-sub-header">
          <div class="guest-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="text" id="mobile-guest-search-input" placeholder="Search guest..." />
          </div>
          <button class="add-guest-pill-btn" id="mobile-add-guest-btn">
            + Add Guest
          </button>
        </div>

        <div class="guests-cards-list">
          ${visibleGuests.map(g => `
            <div class="guest-item-card">
              <div class="guest-left-info">
                <div class="guest-num-badge">${g.id}</div>
                <div class="guest-name-col">
                  <h4>${g.name}</h4>
                  <p>Age ${g.age} ${g.role ? `• ${g.role}` : ''}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${g.name}" onclick="alert('Calling ${g.name} (${g.phone})...')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button class="circle-action-btn btn-email" title="More options" onclick="alert('Guest options: Edit details, download ID, or remove guest.')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}

          ${remainingCount > 0 ? `
            <button class="more-guests-toggle-btn" id="toggle-more-guests-btn">
              <span>${showAllGuests ? 'Hide additional guests' : `+${remainingCount} more guests`}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${showAllGuests ? '18 15 12 9 6 15' : '9 18 15 12 9 6'}"/>
              </svg>
            </button>
          ` : ''}
        </div>
      `;
    }
    // Itinerary Tab (Screens 1, 2, 4 from NEW reference!)
    else if (activeModalTab === 'itinerary') {
      const days = b.itineraryDays || [];

      bodyEl.innerHTML = `
        <div class="itinerary-v2-container">
          ${days.map(dayGroup => `
            <div class="itinerary-day-section">
              <!-- Left Day & Date Label -->
              <div class="timeline-day-col">
                <span class="day-badge-text">${dayGroup.day}</span>
                <span class="day-date-sub">${dayGroup.date}</span>
              </div>

              <!-- Continuous Line & Dot Node -->
              <div class="timeline-track-col">
                <div class="timeline-line-track"></div>
                <div class="timeline-dot-node"></div>
              </div>

              <!-- Activity Items for this day -->
              <div class="timeline-items-col">
                ${dayGroup.items.map(item => `
                  <div class="itinerary-card-item" data-itinerary-item-id="${item.id}">
                    <div class="item-left-content">
                      ${getItemIconSvg(item.type)}
                      <div class="item-text-info">
                        <h4 class="item-text-title">${item.title}</h4>
                        <p class="item-text-sub">${item.subtitle}</p>
                      </div>
                    </div>

                    <div class="item-right-content">
                      <!-- Assigned Badge & Avatar (Screen 4) -->
                      ${item.assigned && item.assigned.isAssigned ? `
                        <span class="assigned-pill-badge">Assigned</span>
                        <img src="${item.assigned.avatar}" class="assigned-avatar-mini" alt="${item.assigned.name}" />
                      ` : ''}

                      <!-- Three Dots Menu Button -->
                      <button class="item-menu-btn" data-trigger-item-menu="${item.id}" title="Item options">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>

                      <!-- Action Context Menu (Screen 2) -->
                      ${openDropdownItemId === item.id ? `
                        <div class="item-dropdown-menu" id="active-item-dropdown">
                          <button class="dropdown-item-btn" data-dropdown-act="assign" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <line x1="19" x2="19" y1="8" y2="14"/>
                              <line x1="22" x2="16" y1="11" y2="11"/>
                            </svg>
                            <span>Assign</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="details" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" x2="8" y1="13" y2="13"/>
                              <line x1="16" x2="8" y1="17" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <span>View Details</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="edit" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="complete" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <polyline points="9 12 11 14 15 10"/>
                            </svg>
                            <span>Mark Complete</span>
                          </button>
                          <button class="dropdown-item-btn" data-dropdown-act="note" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span>Add Note</span>
                          </button>
                          <button class="dropdown-item-btn item-remove" data-dropdown-act="remove" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" x2="10" y1="11" y2="17"/>
                              <line x1="14" x2="14" y1="11" y2="17"/>
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    // Updates Tab
    else if (activeModalTab === 'updates') {
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

  function renderAssignVendorsList() {
    const listEl = container.querySelector('#assign-vendors-list');
    if (!listEl) return;

    let filtered = vendors.filter(v => {
      return !vendorSearchQuery || 
        v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
        v.service.toLowerCase().includes(vendorSearchQuery.toLowerCase());
    });

    listEl.innerHTML = filtered.map(v => `
      <div class="vendor-item-card ${v.id === selectedVendorId ? 'selected' : ''}" data-vendor-id="${v.id}">
        <div class="vendor-item-left">
          <div class="custom-radio ${v.id === selectedVendorId ? 'checked' : ''}">
            ${v.id === selectedVendorId ? `
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ` : ''}
          </div>
          <img src="${v.image}" class="vendor-avatar" alt="${v.name}" />
          <div class="vendor-info">
            <h4>${v.name}</h4>
            <p>${v.service ? `${v.service} • ` : ''}${v.phone}</p>
          </div>
        </div>
        <button class="item-menu-btn" onclick="event.stopPropagation(); alert('Options for ${v.name}')" title="Vendor options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  function openModal(booking, tab = 'overview') {
    activeModalBooking = booking || bookings[0];
    activeModalTab = tab;
    isModalOpen = true;
    showAllGuests = false;
    openDropdownItemId = null;

    renderSheetHeader();
    renderSheetBody();

    container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sheetTab === activeModalTab);
    });

    const backdrop = container.querySelector('#mobile-sheet-backdrop');
    const sheet = container.querySelector('#mobile-bottom-sheet');
    if (backdrop) backdrop.classList.add('open');
    if (sheet) sheet.classList.add('open');
  }

  function closeModal() {
    isModalOpen = false;
    openDropdownItemId = null;
    closeAssignSheet();
    const backdrop = container.querySelector('#mobile-sheet-backdrop');
    const sheet = container.querySelector('#mobile-bottom-sheet');
    if (backdrop) backdrop.classList.remove('open');
    if (sheet) sheet.classList.remove('open');
  }

  function openAssignSheet(item) {
    targetActivityItem = item || activeModalBooking.itineraryDays?.[1]?.items?.[1];
    isAssignSheetOpen = true;
    openDropdownItemId = null;

    // Update target activity card
    const cardEl = container.querySelector('#assign-activity-card-view');
    if (cardEl && targetActivityItem) {
      cardEl.innerHTML = `
        <div class="assign-activity-thumb">
          <img src="${targetActivityItem.image || '/images/rishikesh.jpg'}" alt="${targetActivityItem.title}" />
        </div>
        <div class="assign-activity-info">
          <h4>${targetActivityItem.title}</h4>
          <p>${targetActivityItem.subtitle}</p>
        </div>
        <span class="tag-activity-pill">${targetActivityItem.tag || 'Activity'}</span>
      `;
    }

    renderAssignVendorsList();

    const sheet = container.querySelector('#mobile-assign-to-sheet');
    if (sheet) sheet.classList.add('open');
  }

  function closeAssignSheet() {
    isAssignSheetOpen = false;
    const sheet = container.querySelector('#mobile-assign-to-sheet');
    if (sheet) sheet.classList.remove('open');
  }

  function bindEvents() {
    // Search input
    const searchInput = container.querySelector('#mobile-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCards();
      });
    }

    // Filter button
    const filterBtn = container.querySelector('#mobile-filter-btn');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Filter dialog: All categories active', type: 'info' }
        }));
      });
    }

    // Category Tabs
    container.querySelectorAll('.tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        container.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards();
      });
    });

    // Select All
    const selectAllBox = container.querySelector('#mobile-select-all-box');
    if (selectAllBox) {
      selectAllBox.addEventListener('click', () => {
        const anyUnselected = bookings.some(b => !b.selected);
        bookings.forEach(b => b.selected = anyUnselected);
        renderCards();
      });
    }

    // Vendor Search
    const vendorSearchInput = container.querySelector('#assign-vendor-search');
    if (vendorSearchInput) {
      vendorSearchInput.addEventListener('input', (e) => {
        vendorSearchQuery = e.target.value;
        renderAssignVendorsList();
      });
    }

    // Global Click Handler
    container.addEventListener('click', (e) => {
      // Close dropdown if clicked outside
      if (!e.target.closest('.item-right-content') && openDropdownItemId) {
        openDropdownItemId = null;
        renderSheetBody();
      }

      // Checkbox click on booking card
      const chk = e.target.closest('.card-select-checkbox');
      if (chk) {
        e.stopPropagation();
        const id = chk.dataset.selectId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          b.selected = !b.selected;
          renderCards();
        }
        return;
      }

      // Card click
      const card = e.target.closest('.booking-card');
      if (card) {
        const id = card.dataset.bookingId;
        const b = bookings.find(item => item.id === id);
        if (b) openModal(b, 'overview');
        return;
      }

      // Sheet close button or backdrop
      if (e.target.closest('#mobile-sheet-close-btn') || e.target.id === 'mobile-sheet-backdrop') {
        closeModal();
        return;
      }

      // Itinerary Back Button `< Booking Details`
      if (e.target.closest('#itinerary-back-btn')) {
        switchTab('overview');
        return;
      }

      // Sheet Navigation Tabs
      const sheetTabBtn = e.target.closest('.sheet-tab-btn');
      if (sheetTabBtn) {
        const targetTab = sheetTabBtn.dataset.sheetTab;
        switchTab(targetTab);
        return;
      }

      // Itinerary Item Three Dots `⋮` Button (Screen 2 Trigger)
      const menuTrigger = e.target.closest('[data-trigger-item-menu]');
      if (menuTrigger) {
        e.stopPropagation();
        const itemId = menuTrigger.dataset.triggerItemMenu;
        openDropdownItemId = openDropdownItemId === itemId ? null : itemId;
        renderSheetBody();
        return;
      }

      // Dropdown Menu Action Click
      const dropdownAct = e.target.closest('[data-dropdown-act]');
      if (dropdownAct) {
        e.stopPropagation();
        const act = dropdownAct.dataset.dropdownAct;
        const itemId = dropdownAct.dataset.targetId;

        // Find item
        let foundItem = null;
        activeModalBooking.itineraryDays?.forEach(d => {
          const item = d.items.find(i => i.id === itemId);
          if (item) foundItem = item;
        });

        openDropdownItemId = null;
        renderSheetBody();

        if (act === 'assign') {
          openAssignSheet(foundItem);
        } else if (act === 'complete') {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Marked "${foundItem?.title}" as Complete!`, type: 'success' }
          }));
        } else if (act === 'remove') {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Removed "${foundItem?.title}" from itinerary`, type: 'info' }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `${act.toUpperCase()}: ${foundItem?.title}`, type: 'info' }
          }));
        }
        return;
      }

      // Assign to sheet close
      if (e.target.closest('#close-assign-to-sheet-btn') || e.target.closest('#btn-cancel-assign-sheet')) {
        closeAssignSheet();
        return;
      }

      // Assign tab button (Team Members, Vendors, Contacts)
      const assignTabBtn = e.target.closest('.assign-tab-btn');
      if (assignTabBtn) {
        assignVendorTab = assignTabBtn.dataset.assignTab;
        container.querySelectorAll('.assign-tab-btn').forEach(b => b.classList.remove('active'));
        assignTabBtn.classList.add('active');
        renderAssignVendorsList();
        return;
      }

      // Vendor Item Selection
      const vendorCard = e.target.closest('.vendor-item-card');
      if (vendorCard) {
        selectedVendorId = vendorCard.dataset.vendorId;
        renderAssignVendorsList();
        return;
      }

      // Add New Vendor Trigger
      if (e.target.closest('#btn-add-new-vendor-trigger')) {
        const vendorName = prompt('Enter New Vendor Company Name:');
        if (vendorName) {
          const newV = {
            id: `V-0${vendors.length + 1}`,
            name: vendorName,
            phone: '+91 99887 76655',
            service: 'Rishikesh Rafting & Safari',
            image: '/images/rishikesh.jpg',
            selected: false
          };
          vendors.push(newV);
          selectedVendorId = newV.id;
          renderAssignVendorsList();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added vendor "${vendorName}"!`, type: 'success' }
          }));
        }
        return;
      }

      // Submit WhatsApp Assignment (Screen 3 -> Screen 4)
      if (e.target.closest('#btn-submit-assign-whatsapp')) {
        const vendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
        if (targetActivityItem) {
          targetActivityItem.assigned = {
            isAssigned: true,
            name: vendor.name,
            avatar: vendor.image
          };

          // Also ensure Hotel Ganga View has assigned badge like Screen 4
          const hotelItem = activeModalBooking.itineraryDays?.[0]?.items?.[1];
          if (hotelItem && !hotelItem.assigned) {
            hotelItem.assigned = {
              isAssigned: true,
              name: 'Rahul Mehta',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
            };
          }
        }

        closeAssignSheet();
        renderSheetBody(); // Re-renders to Screen 4 with Assigned badges!

        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            message: `Assigned ${vendor.name} to ${targetActivityItem?.title || 'Activity'} & WhatsApp details sent!`,
            type: 'success' 
          }
        }));
        return;
      }

      // Guest row click in overview -> switches to guests tab
      if (e.target.closest('#row-click-guest')) {
        switchTab('guests');
        return;
      }

      // Toggle more guests
      if (e.target.closest('#toggle-more-guests-btn')) {
        showAllGuests = !showAllGuests;
        renderSheetBody();
        return;
      }

      // Add guest button
      if (e.target.closest('#mobile-add-guest-btn')) {
        window.dispatchEvent(new CustomEvent('open-add-guest-modal', {
          detail: { bookingId: activeModalBooking.id }
        }));
        return;
      }

      // Confirm Booking
      if (e.target.closest('#mobile-confirm-booking-btn')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Booking ${activeModalBooking.id} (${activeModalBooking.title}) confirmed successfully!`, type: 'success' }
        }));
        return;
      }
    });
  }

  function switchTab(tab) {
    activeModalTab = tab;
    openDropdownItemId = null;
    closeAssignSheet();

    renderSheetHeader();
    container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sheetTab === activeModalTab);
    });
    renderSheetBody();
  }

  // Initial renders
  renderCards();
  renderSheetHeader();
  renderSheetBody();
  renderAssignVendorsList();
  bindEvents();

  if (isModalOpen) {
    openModal(activeModalBooking, activeModalTab);
    if (openDropdownItemId) {
      renderSheetBody();
    }
    if (isAssignSheetOpen) {
      openAssignSheet(targetActivityItem);
    }
  }

  return {
    openModal,
    closeModal,
    switchTab,
    openAssignSheet,
    closeAssignSheet,
    setOpenDropdownItemId: (id) => {
      openDropdownItemId = id;
      renderSheetBody();
    },
    setSearch: (q) => { searchQuery = q; renderCards(); },
    getBookings: () => bookings,
    updateBooking: (updated) => {
      const idx = bookings.findIndex(b => b.id === updated.id);
      if (idx !== -1) {
        bookings[idx] = updated;
        renderCards();
        if (activeModalBooking && activeModalBooking.id === updated.id) {
          activeModalBooking = updated;
          renderSheetHeader();
          renderSheetBody();
        }
      }
    }
  };
}

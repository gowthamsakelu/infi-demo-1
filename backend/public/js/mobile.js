import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST, SPECIAL_REQUIREMENTS_PRESETS, getSpecialReqIconSvg } from './data.js';
import { icon } from './shared/icons.js';
import { createMobileCalendar } from './calendar-mobile.js';
import { createMobileTeam } from './team-mobile.js';
import { OPERATIONS_TEAM_MEMBERS } from './shared/team-data.js';
import { bindSwipe, bindChipSwipe, slideIn } from './shared/swipe.js';
import { notificationsHtml, bindNotifications } from './shared/notifications.js';
import { currentPage, getParams, setParams, navigate, subscribe as subscribePage } from './shared/page-state.js';
import { createCategoryFilter } from './shared/dropdown-filter.js';
import { searchBox, emptyState, toast, openRowMenu, esc, jsq, skeletonCards, errorState } from './shared/ui.js';
import { renderTabs, bindQuickNotes, rowCard, rowMenuItems, assignItems, bulkBar, bindBulkBar, updateBulkBar } from './shared/list-ui.js';
import { journeyFor, renderJourneyItems, subscribeFollowUps, loadFollowUps } from './shared/followups.js';
import { openFollowUpModal } from './shared/followup-modal.js';
import { detailHeaderHtml, sheetHandleHtml } from './shared/detail-sheet.js';
import { inquiryState, INQUIRY_TABS, loadInquiries, subscribeInquiries, saveQuickNote, savePayment, syncBookingPayments } from './shared/inquiry-store.js';
import { openAssign } from './shared/assign-sheet.js';
import { openDayDialog, commit } from './shared/itinerary-dialog.js';
import { daysOf, persist, renumber, eventKind, itemIconHtml, itemPills } from './shared/itinerary.js';
import { openItineraryBuilder } from './shared/itinerary-builder-ui.js';
import { scheduleHtml } from './shared/schedule.js';
import { openMoreSheet } from './shared/nav-ui.js';
import { goToPage } from './shared/page-host.js';
import { matchesCategory } from './shared/booking-filters.js';
import { openAddInquiry } from './shared/add-inquiry.js';
import { addButtonHtml, setShellAddAction } from './shared/add-button.js';

export function createMobileView(container, options = {}) {
  const bookingsData = [...INITIAL_BOOKINGS];
  let bookings = bookingsData; // swapped for the inquiry list on the Inquiries page
  let page = 'bookings';
  let vendors = [...VENDORS_LIST];
  let teamMembers = [...STAFF_MEMBERS];
  let contacts = [...CONTACTS_LIST];
  let activeCategory = 'All Bookings'; // 'All Bookings', 'New Bookings', 'Assigned', 'Ongoing'
  let selectedCategory = 'ALL'; // 'ALL', 'TOUR', 'VILLA', 'ACTIVITY', 'TRANSPORT'
  let searchQuery = '';
  let activeModalBooking = bookings[0]; // Haridwar - Kashi Trip BK-5021
  let activeModalTab = options.initialTab || 'customer-details'; // 'customer-details', 'guests', 'itinerary', 'updates'
  const modalTabs = ['customer-details', 'guests', 'itinerary', 'updates'];
  let isModalOpen = options.autoOpenModal !== undefined ? options.autoOpenModal : false;
  let showAllGuests = false;
  let modalActiveItem = null;

  // Itinerary & Assign State
  let openDropdownItemId = options.initialDropdownItemId || null; // e.g. 'IT-101' to preview Screen 2
  let isAssignSheetOpen = options.initialAssignSheetOpen || false; // to preview Screen 3
  let targetActivityItem = activeModalBooking.itineraryDays?.[1]?.items?.[1] || null; // River Rafting
  let assignVendorTab = 'Team Members'; // 'Team Members', 'Vendors', 'Contacts'
  let selectedAssignee = {
    type: 'Team Members',
    id: teamMembers[0].id,
    name: teamMembers[0].name,
    avatar: teamMembers[0].avatar,
    roleOrService: teamMembers[0].role,
    phone: teamMembers[0].phone
  };
  let vendorSearchQuery = '';
  let optionalNoteText = '';

  // Root container structure
  container.innerHTML = `
    <div class="phone-device">
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
              <p id="mobile-header-subtitle">Bookings • 28 Total</p>
            </div>
          </div>
          <div class="app-header-right">
            <button class="icon-bell-btn" id="mobile-bell-btn" title="Notifications" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span class="bell-dot" id="mobile-bell-dot"></span>
            </button>
            <button type="button" class="ks-avatar-badge" title="Karan Sapalia" aria-haspopup="menu" aria-label="Account menu">KS</button>
          </div>
        </div>

        <div id="mobile-bookings-page">
        <!-- Search & Filter Row -->
        <div class="mobile-search-row">
          ${searchBox({ id: 'mobile-search-input', placeholder: 'Search bookings...', value: searchQuery, variant: 'mobile' })}
          <span id="mobile-filter-slot"></span>
        </div>

        <!-- Status Filter Tabs / Pills -->
        <div id="mobile-tabs-host"></div>

        ${bulkBar('mobile')}

        <!-- Bookings Cards List -->
        <div class="bookings-cards-list row-list" id="mobile-cards-list"></div>
        </div>
        <div id="mobile-calendar-page" hidden></div>
        <div id="mobile-team-page" hidden></div>
      </div>

      <div id="mobile-page-host" class="mobile-screen-content"></div>
      ${addButtonHtml('mobile-page-add', true)}

      <!-- Notifications: the same panel as on PC, across the screen under the header -->
      <div class="notif-backdrop" id="mobile-notif-backdrop" hidden></div>
      <div class="notifications-panel mobile-notifications" id="mobile-notifications" role="dialog" aria-label="Notifications" hidden>${notificationsHtml()}</div>

      <!-- Bottom Navigation Bar (Fixed) -->
      <div class="mobile-bottom-nav">
        <button class="nav-item ${currentPage() === 'dashboard' ? 'active' : ''}" data-route="dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"/>
            <rect width="7" height="5" x="14" y="3" rx="1"/>
            <rect width="7" height="9" x="14" y="12" rx="1"/>
            <rect width="7" height="5" x="3" y="16" rx="1"/>
          </svg>
          Dashboard
        </button>
        <button class="nav-item ${currentPage() === 'bookings' ? 'active' : ''}" data-route="bookings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            <rect width="20" height="14" x="2" y="6" rx="2"/>
          </svg>
          Bookings
        </button>
        <button class="nav-item ${currentPage() === 'inquiries' ? 'active' : ''}" data-route="inquiries">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Inquiries
        </button>
        <button class="nav-item ${currentPage() === 'calendar' ? 'active' : ''}" data-route="calendar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          Calendar
        </button>
        <button class="nav-item" id="mobile-more-btn" data-more aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/>
            <rect width="7" height="7" x="3" y="14" rx="1"/>
          </svg>
          More
        </button>
      </div>

      <!-- Backdrop for Bottom Sheet Modal -->
      <div class="sheet-backdrop ${isModalOpen ? 'open' : ''}" id="mobile-sheet-backdrop"></div>

      <!-- Bottom Sheet Modal (Screens 1, 2, 4) -->
      <div class="bottom-sheet ${isModalOpen ? 'open' : ''}" id="mobile-bottom-sheet">
        <!-- Sheet Header Card & Controls -->
        <div id="sheet-header-card-content">
          <!-- Populated dynamically -->
        </div>

        <!-- Sheet Navigation Tabs (Customer Details, Guests, Itinerary, Updates) -->
        <div class="sheet-tabs-nav scroll-row">
          <button class="sheet-tab-btn ${activeModalTab === 'customer-details' ? 'active' : ''}" data-sheet-tab="customer-details">Customer Details</button>
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
              ${icon('phone', { size: 20, stroke: 2.2 })}
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
              ${icon('more', { size: 20, stroke: 2.2 })}
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal 1: Edit Special Requirements -->
      <div class="modal-overlay" id="mobile-special-req-modal">
        <div class="modal-card">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <h3>Edit Special Requirements</h3>
            </div>
            <button class="sheet-close-btn" id="close-special-req-modal-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Current Requirements</label>
              <div id="modal-reqs-current-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;"></div>
            </div>
            <div class="form-group">
              <label>Quick Add Presets</label>
              <div class="modal-chip-grid" id="modal-presets-chip-grid"></div>
            </div>
            <div class="form-group">
              <label>Add Custom Requirement</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="modal-custom-req-input" placeholder="e.g. Extra pillows, Non-smoking room" style="flex: 1;" />
                <button class="btn-primary-desktop" id="btn-add-custom-req">Add</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-confirm-booking" id="btn-done-special-req">Save & Apply</button>
          </div>
        </div>
      </div>

      <!-- Modal 2: Activity Details -->
      <div class="modal-overlay" id="mobile-activity-details-modal">
        <div class="modal-card">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="item-icon-box item-icon-bus" id="modal-details-icon-box" style="width: 30px; height: 30px;"></div>
              <h3 id="modal-details-title-text">Activity Details</h3>
            </div>
            <button class="sheet-close-btn" id="close-modal-details-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body" id="modal-details-body-content"></div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="btn-modal-details-toggle-complete">Mark Completed</button>
            <button class="action-pill-btn" id="btn-modal-details-edit-trigger">Edit</button>
            <button class="btn-primary-desktop" id="btn-modal-details-close-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Modal 3: Edit Activity -->
      <div class="modal-overlay" id="mobile-edit-activity-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Itinerary Activity</h3>
            <button class="sheet-close-btn" id="close-modal-edit-activity-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Activity Title</label>
              <input type="text" id="modal-edit-act-title" placeholder="e.g. River Rafting (16 km)" />
            </div>
            <div class="form-group">
              <label>Timing & Subtitle / Location</label>
              <input type="text" id="modal-edit-act-subtitle" placeholder="e.g. 10:00 AM • Rishikesh" />
            </div>
            <div class="form-group">
              <label>Category / Icon</label>
              <select id="modal-edit-act-type">
                <option value="transport">Transport / Bus</option>
                <option value="hotel">Hotel / Accommodation</option>
                <option value="sightseeing">Sightseeing / Tour</option>
                <option value="activity">Sport / Adventure</option>
                <option value="food">Restaurant / Meal</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="btn-cancel-edit-activity">Cancel</button>
            <button class="btn-primary-desktop" id="btn-save-edit-activity">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Mobile Modal 5: Edit Customer Details (App-based modal) -->
      <div class="modal-overlay" id="mobile-edit-customer-modal">
        <div class="modal-card" style="width: 92%; max-width: 480px; max-height: calc(var(--vvh) - 24px); overflow-y: auto;">
          <div class="modal-header">
            <h3>Edit Customer Details</h3>
            <button class="sheet-close-btn" id="close-mobile-modal-edit-customer-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Customer Name</label>
              <input type="text" id="mobile-modal-edit-cust-name" placeholder="Full Name" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" id="mobile-modal-edit-cust-phone" placeholder="+91 99884 84884" />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="mobile-modal-edit-cust-email" placeholder="guest@example.com" />
            </div>
            <div class="form-group">
              <label>Location / City</label>
              <input type="text" id="mobile-modal-edit-cust-location" placeholder="Chandigarh, Punjab" />
            </div>
            <div class="form-group">
              <label>Lead Source</label>
              <select id="mobile-modal-edit-cust-source">
                <option value="Google Search">Google Search</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Instagram">Instagram</option>
                <option value="Direct Call">Direct Call</option>
                <option value="WhatsApp Inquiry">WhatsApp Inquiry</option>
              </select>
            </div>
            <div class="form-group">
              <label>Traveler Type / Pax</label>
              <input type="text" id="mobile-modal-edit-cust-type" placeholder="e.g. Family (3 Pax)" />
            </div>
            <div class="form-group">
              <label>Preferred Destination</label>
              <input type="text" id="mobile-modal-edit-cust-destination" placeholder="Kashmir / Manali" />
            </div>
            <div class="form-group">
              <label>Travel Dates</label>
              <input type="text" id="mobile-modal-edit-cust-dates" placeholder="12 Oct - 17 Oct" />
            </div>
            <div class="form-group">
              <label>Estimated Budget / Price</label>
              <input type="text" id="mobile-modal-edit-cust-budget" placeholder="₹45,000" />
            </div>
            <div class="form-group">
              <label>Customer Notes / Requirements</label>
              <textarea id="mobile-modal-edit-cust-notes" rows="3" placeholder="Special requirements, preferences..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="btn-cancel-edit-customer">Cancel</button>
            <button class="btn-primary-desktop" id="btn-save-edit-customer">Save Customer Details</button>
          </div>
        </div>
      </div>

      <!-- Mobile Modal 6: Add Follow-up Activity (App-based modal) -->
      <div class="modal-overlay" id="mobile-add-followup-modal">
        <div class="modal-card" style="width: 92%; max-width: 440px;">
          <div class="modal-header">
            <h3>Add Follow-up Activity</h3>
            <button class="sheet-close-btn" id="close-mobile-modal-add-followup-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Follow-up Channel</label>
              <select id="mobile-modal-add-followup-type">
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp Message</option>
                <option value="email">Email</option>
                <option value="meeting">In-Person Meeting</option>
                <option value="note">Internal Note / Status</option>
              </select>
            </div>
            <div class="form-group">
              <label>Activity Title / Subject</label>
              <input type="text" id="mobile-modal-add-followup-title" placeholder="e.g. Follow-up Call, WhatsApp Quote Sent" />
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="text" id="mobile-modal-add-followup-date" placeholder="e.g. 20 Oct" />
            </div>
            <div class="form-group">
              <label>Time</label>
              <input type="text" id="mobile-modal-add-followup-time" placeholder="e.g. 02:30 PM" />
            </div>
            <div class="form-group">
              <label>Follow-up Notes / Discussion</label>
              <textarea id="mobile-modal-add-followup-desc" rows="3" placeholder="Enter notes from the conversation, quote details, or action items..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="btn-cancel-add-followup">Cancel</button>
            <button class="btn-primary-desktop" id="btn-submit-add-followup">Save Follow-up</button>
          </div>
        </div>
      </div>

      <!-- Mobile Modal 7: Add Assignee (Team/Vendor/Contact) App-based modal -->
      <div class="modal-overlay" id="mobile-add-assignee-modal">
        <div class="modal-card" style="width: 92%; max-width: 440px;">
          <div class="modal-header">
            <h3 id="mobile-modal-add-assignee-heading">Add New Member</h3>
            <button class="sheet-close-btn" id="close-mobile-modal-add-assignee-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label id="mobile-modal-add-assignee-name-lbl">Full Name</label>
              <input type="text" id="mobile-modal-add-assignee-name" placeholder="Enter name or company" />
            </div>
            <div class="form-group">
              <label id="mobile-modal-add-assignee-role-lbl">Role / Service</label>
              <input type="text" id="mobile-modal-add-assignee-role" placeholder="e.g. Tour Guide, Rafting Coordinator" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" id="mobile-modal-add-assignee-phone" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="btn-cancel-add-assignee">Cancel</button>
            <button class="btn-primary-desktop" id="btn-submit-add-assignee">Save & Assign</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Functions
  const BOOKING_TABS = [
    { key: 'All Bookings', label: 'All' },
    { key: 'New Bookings', label: 'New Bookings' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'Ongoing', label: 'Ongoing' },
  ];
  const tabDefs = () => (page === 'inquiries' ? INQUIRY_TABS : BOOKING_TABS);
  const allKey = () => tabDefs()[0].key;

  // Update selection visuals in place (no re-render, so cards never remount or shift).
  function syncSelectionUI() {
    container.querySelectorAll('.list-row-card').forEach((card) => {
      const b = bookings.find(x => x.id === card.dataset.bookingId);
      if (!b) return;
      card.classList.toggle('card-selected', !!b.selected);
      const cb = card.querySelector('.card-select-checkbox');
      cb.classList.toggle('checked', !!b.selected);
      cb.setAttribute('aria-checked', !!b.selected);
    });
    updateBulkBar(container, 'mobile', bookings.filter(b => b.selected).length);
  }

  // Re-render only the cards that changed (assign, paid, ...), keeping the rest of the DOM untouched.
  function patchRows(ids) {
    if (!ids || !ids.length) return renderCards();
    let ok = true;
    ids.forEach((id) => {
      const b = bookings.find(x => x.id === id);
      const el = container.querySelector(`.list-row-card[data-booking-id="${id}"]`);
      if (!b || !el) { ok = false; return; }
      const t = document.createElement('div');
      t.innerHTML = rowCard(b).trim();
      el.replaceWith(t.firstElementChild);
    });
    if (!ok) return renderCards();
    if (isModalOpen && activeModalBooking && ids.includes(activeModalBooking.id)) { renderSheetHeader(); renderSheetBody(); }
    syncSelectionUI();
  }

  function renderCards() {
    const listEl = container.querySelector('#mobile-cards-list');
    if (!listEl) return;
    const inquiry = page === 'inquiries';
    const what = inquiry ? 'inquiries' : 'bookings';
    const q = searchQuery.toLowerCase();
    const catValue = selectedCategory === 'ALL' ? '' : selectedCategory;

    const base = bookings.filter(b => {
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.destination.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) ||
        b.guest.name.toLowerCase().includes(q) || (b.guest.phone && b.guest.phone.includes(searchQuery));
      return matchSearch && matchesCategory(b, catValue);
    });
    const filtered = base.filter(b => activeCategory === allKey() || b.category === activeCategory);

    const searchEl = container.querySelector('#mobile-search-input');
    if (searchEl) { searchEl.placeholder = `Search ${what}...`; searchEl.setAttribute('aria-label', `Search ${what}`); }

    if (inquiry && !inquiryState.loaded) {
      listEl.innerHTML = skeletonCards(5);
    } else if (inquiry && inquiryState.failed) {
      listEl.innerHTML = errorState({ title: 'Could not load inquiries', text: 'Check your connection and try again.', retryId: 'btn-retry-inquiries' });
    } else if (filtered.length === 0) {
      listEl.innerHTML = emptyState({ title: `No ${what} found`, text: 'No results matching your selected filters.', resetId: 'btn-clear-mobile-empty-filters' });
    } else {
      listEl.innerHTML = filtered.map(rowCard).join('');
    }

    const tabs = tabDefs().map(t => ({ ...t, count: t.key === allKey() ? base.length : base.filter(b => b.category === t.key).length }));
    renderTabs(container.querySelector('#mobile-tabs-host'), { tabs, active: activeCategory, variant: 'mobile', attr: 'data-cat' });

    updateBulkBar(container, 'mobile', bookings.filter(b => b.selected).length);
  }

  function renderSheetHeader() {
    const headerCard = container.querySelector('#sheet-header-card-content');
    if (!headerCard || !activeModalBooking) return;

    const b = activeModalBooking;
    const initials = b.customer?.initials || (b.guest?.name?.split(' ').map(n=>n[0]).join('') || 'CU');
    const custName = b.customer?.name || b.guest?.name || 'Customer';

    // Uniform Customer Profile Header for ALL tabs: Customer Details, Guests, Itinerary, Updates
    headerCard.innerHTML = sheetHandleHtml('mobile-sheet-handle') + detailHeaderHtml({
      avatar: esc(initials),
      title: custName,
      pill: `<span class="status-pill ${b.statusClass}"><span class="dot"></span>${b.status}</span>`,
      subtitle: b.title,
      chips: [{ icon: 'user', text: `${b.pax} Pax` }, { icon: 'clock', text: b.duration || '—' }, { icon: 'calendar', text: b.dates }],
    }, { close: 'id="mobile-sheet-close-btn"' });

    const guestBadge = container.querySelector('#sheet-guest-count-badge');
    if (guestBadge) guestBadge.textContent = b.guests.length;
  }


  function renderSheetBody() {
    const bodyEl = container.querySelector('#sheet-body-content');
    if (!bodyEl || !activeModalBooking) return;

    const b = activeModalBooking;

    // Customer Details Tab (Exact structure from Image 3 reference)
    if (activeModalTab === 'customer-details') {
      const c = b.customer || {
        name: b.guest.name,
        initials: b.guest.name.split(' ').map(n=>n[0]).join('') || 'CU',
        phone: b.guest.phone,
        email: b.guest.email,
        location: 'New Delhi, Delhi',
        leadSource: 'Website',
        preferredDestination: b.destination,
        travelDates: `${b.dates} 2024`,
        customerType: `Family (${b.pax} Pax)`,
        budgetEst: b.price,
        status: b.status,
        shortDetails: b.notes || 'Pilgrimage and family holiday tour package booked through Ruyi portal.',
        leadFlow: [
          { date: '10 Nov', time: '10:30 AM', type: 'call', iconBg: 'icon-blue', title: 'Initial Inquiry (Call)', desc: 'Customer inquired about booking details and availability.', author: 'By Ruyi Admin' },
          { date: '10 Nov', time: '02:15 PM', type: 'whatsapp', iconBg: 'icon-green', title: 'Shared Itinerary (WhatsApp)', desc: 'Sent day-wise details and pricing breakdown.', author: 'By Ruyi Admin' },
          { date: '11 Nov', time: '11:00 AM', type: 'email', iconBg: 'icon-blue', title: 'Sent Quote & Voucher (Email)', desc: 'Dispatched voucher confirmation and receipt.', author: 'By Ruyi Admin' }
        ]
      };

      bodyEl.innerHTML = `
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
              <button class="btn-edit-action" id="btn-edit-customer" title="Edit Customer Details">
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
                <span class="info-value-bold">${esc(c.name)}</span>
              </div>
              <!-- Right Column: Row 1 -->
              <div class="info-cell info-cell-email">
                <span class="info-label">Email</span>
                <div class="contact-value-row">
                  <span class="info-value-text email-text-val" title="${esc(c.email)}">${esc(c.email)}</span>
                  <button class="mini-icon-btn btn-mail-blue" title="Send Email" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Drafting email to ${jsq(c.email)}...', type: 'info' }}))">
                    ${icon('mail', { size: 12 })}
                  </button>
                </div>
              </div>

              <!-- Left Column: Row 2 -->
              <div class="info-cell info-cell-contact">
                <span class="info-label">Primary Contact</span>
                <div class="contact-value-row">
                  <span class="info-value-bold phone-number-val">${esc(c.phone)}</span>
                  <div class="contact-action-btns">
                    <button class="mini-icon-btn btn-call-green" title="Call ${jsq(c.phone)}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${jsq(c.name)} (${jsq(c.phone)})...', type: 'info' }}))">
                      ${icon('phone', { size: 12, stroke: 2.5 })}
                    </button>
                    <button class="mini-icon-btn btn-wa-green" title="WhatsApp" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp chat with ${jsq(c.name)}...', type: 'success' }}))">
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
                <span class="info-value-text">${esc(c.leadSource || 'Website')}</span>
              </div>

              <!-- Left Column: Row 3 -->
              <div class="info-cell">
                <span class="info-label">Travel Dates</span>
                <span class="info-value-text">${esc(c.travelDates || b.dates)}</span>
              </div>
              <!-- Right Column: Row 3 -->
              <div class="info-cell">
                <span class="info-label">Location</span>
                <span class="info-value-text">${esc(c.location || 'New Delhi, Delhi')}</span>
              </div>

              <!-- Left Column: Row 4 -->
              <div class="info-cell">
                <span class="info-label">Preferred Destination</span>
                <span class="info-value-text">${esc(c.preferredDestination || b.destination)}</span>
              </div>
              <!-- Right Column: Row 4 -->
              <div class="info-cell">
                <span class="info-label">Budget (Est.)</span>
                <span class="info-value-bold" style="color: #0F172A;">${esc(c.budgetEst || b.price)}</span>
              </div>

              <!-- Left Column: Row 5 -->
              <div class="info-cell">
                <span class="info-label">Customer Type</span>
                <span class="info-value-text">${c.customerType || 'Family (12 Pax)'}</span>
              </div>
              <!-- Right Column: Row 5 -->
              <div class="info-cell">
                <span class="info-label">Status</span>
                <div>
                  <span class="status-pill ${b.statusClass}" style="display: inline-flex;">
                    <span class="dot"></span>
                    ${c.status || b.status}
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
              <p class="short-details-text">${esc(c.shortDetails || b.notes || 'Trip details logged into operations queue.')}</p>
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
            </div>

            <div class="lead-journey-timeline">
              ${renderJourneyItems(journeyFor(c))}
            </div>
          </div>
        </div>
      `;
    } 
    // Guests Tab (Exact match to Image 1 reference with Special Requirements)
    else if (activeModalTab === 'guests') {
      const visibleGuests = showAllGuests ? b.guests : b.guests.slice(0, 4);
      const remainingCount = b.guests.length - 4;
      const reqs = b.specialRequirements || [];

      bodyEl.innerHTML = `
        <!-- Special Requirements Card (Image 1 reference) -->
        <div class="special-req-card">
          <div class="special-req-header">
            <div class="special-req-title-left">
              <div class="special-req-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <span class="special-req-title">Special Requirements</span>
            </div>
            <button class="special-req-edit-btn" id="mobile-edit-special-req-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
              Edit
            </button>
          </div>
          <div class="special-req-chips-list">
            ${reqs.length > 0 ? reqs.map(r => `
              <span class="special-req-chip">
                <span class="req-chip-icon">${getSpecialReqIconSvg(r.icon, r.color || '#2563EB')}</span>
                <span class="req-chip-text">${r.text}</span>
              </span>
            `).join('') : `
              <span style="font-size: 12.5px; color: #94A3B8; font-style: italic;">No special requirements added yet. Click Edit to add.</span>
            `}
          </div>
        </div>

        <div class="guests-sub-header">
          <div class="guest-search-box">
            ${icon('search', { size: 16 })}
            <input type="text" id="mobile-guest-search-input" placeholder="Search guest..." />
          </div>
          <button class="add-guest-pill-btn" id="mobile-add-guest-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" x2="12" y1="5" y2="19"/>
              <line x1="5" x2="19" y1="12" y2="12"/>
            </svg>
            Add Guest
          </button>
        </div>

        <div class="guests-cards-list">
          ${visibleGuests.map(g => `
            <div class="guest-item-card">
              <div class="guest-left-info">
                <div class="guest-num-badge">${g.id}</div>
                <div class="guest-name-col">
                  <h4>${esc(g.name)}</h4>
                  <p>${g.age !== '' && g.age != null ? `Age ${esc(g.age)}` : 'Age not added'}${g.role ? ` • ${esc(g.role)}` : ''}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${jsq(g.name)}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${jsq(g.name)} (${jsq(g.phone)})...', type: 'info' }}))">
                  ${icon('phone', { size: 14, stroke: 2.5 })}
                </button>
                <button class="circle-action-btn btn-more" data-guest-menu="${g.id}" title="More options for ${jsq(g.name)}" aria-label="More options" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Guest options for ${jsq(g.name)}: ID verified and travel pass issued.', type: 'info' }}))">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
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
    // Itinerary Tab (Screens 1, 2, 4 from reference with Details, Edit, Mark Complete, Add Event)
    else if (activeModalTab === 'itinerary') {
      bodyEl.innerHTML = scheduleHtml(b.itineraryDays || [], { side: 'mobile', openItemId: openDropdownItemId });
    }
    // Updates Tab
    else if (activeModalTab === 'updates') {
      bodyEl.innerHTML = `
        <div class="updates-list">
          ${b.updates.length === 0 ? '<p style="font-size: 13px; color: #94A3B8; text-align: center; padding: 24px 0;">No updates yet.</p>' : ''}
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
    const searchInput = container.querySelector('#assign-vendor-search');
    const addBtnLabel = container.querySelector('#assign-add-btn-label');
    if (!listEl) return;

    if (assignVendorTab === 'Team Members') {
      if (searchInput) searchInput.placeholder = 'Search team member by name, role or phone...';
      if (addBtnLabel) addBtnLabel.textContent = 'Add New Team Member';

      const filtered = teamMembers.filter(m => {
        return !vendorSearchQuery || 
          m.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          m.phone.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      });

      listEl.innerHTML = filtered.map(m => {
        const isSelected = selectedAssignee?.id === m.id;
        return `
          <div class="vendor-item-card ${isSelected ? 'selected' : ''}" data-assign-type="Team Members" data-assign-id="${m.id}">
            <div class="vendor-item-left">
              <div class="custom-radio ${isSelected ? 'checked' : ''}">
                ${isSelected ? `
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ` : ''}
              </div>
              <img src="${m.avatar}" class="vendor-avatar" style="border-radius: 50%;" alt="${m.name}" />
              <div class="vendor-info">
                <h4>${m.name}</h4>
                <p>${m.role} • ${m.phone}</p>
              </div>
            </div>
            <span class="active-badge-pill" style="font-size: 11px; padding: 3px 8px; border-radius: 12px; background: #EFF6FF; color: #2563EB; font-weight: 700; flex-shrink: 0;">
              ${m.activeTrips} Trips
            </span>
          </div>
        `;
      }).join('');
    } else if (assignVendorTab === 'Vendors') {
      if (searchInput) searchInput.placeholder = 'Search vendor by name, service or location...';
      if (addBtnLabel) addBtnLabel.textContent = 'Add New Vendor';

      const filtered = vendors.filter(v => {
        return !vendorSearchQuery || 
          v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          v.service.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          v.phone.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      });

      listEl.innerHTML = filtered.map(v => {
        const isSelected = selectedAssignee?.id === v.id;
        return `
          <div class="vendor-item-card ${isSelected ? 'selected' : ''}" data-assign-type="Vendors" data-assign-id="${v.id}">
            <div class="vendor-item-left">
              <div class="custom-radio ${isSelected ? 'checked' : ''}">
                ${isSelected ? `
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
            <button class="item-menu-btn" onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Vendor options for ${jsq(v.name)}: Active provider on record.', type: 'info' }}))" title="Vendor options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        `;
      }).join('');
    } else if (assignVendorTab === 'Contacts') {
      if (searchInput) searchInput.placeholder = 'Search contact by name, role or phone...';
      if (addBtnLabel) addBtnLabel.textContent = 'Add New Contact';

      const filtered = contacts.filter(c => {
        return !vendorSearchQuery || 
          c.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          c.role.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
          (c.details && c.details.toLowerCase().includes(vendorSearchQuery.toLowerCase())) ||
          c.phone.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      });

      listEl.innerHTML = filtered.map(c => {
        const isSelected = selectedAssignee?.id === c.id;
        return `
          <div class="vendor-item-card ${isSelected ? 'selected' : ''}" data-assign-type="Contacts" data-assign-id="${c.id}">
            <div class="vendor-item-left">
              <div class="custom-radio ${isSelected ? 'checked' : ''}">
                ${isSelected ? `
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ` : ''}
              </div>
              <img src="${c.avatar}" class="vendor-avatar" style="border-radius: 50%;" alt="${esc(c.name)}" />
              <div class="vendor-info">
                <h4>${esc(c.name)}</h4>
                <p>${c.role} • ${esc(c.phone)}</p>
                ${c.details ? `<span style="font-size: 11px; color: #94A3B8; display: block; margin-top: 1px;">${c.details}</span>` : ''}
              </div>
            </div>
            <a href="tel:${jsq(c.phone)}" class="circle-action-btn btn-phone" style="width: 30px; height: 30px; flex-shrink: 0;" onclick="event.stopPropagation();" title="Call ${jsq(c.name)}">
              ${icon('phone', { size: 14, stroke: 2.2 })}
            </a>
          </div>
        `;
      }).join('');
    }
  }

  function openModal(booking, tab = 'customer-details') {
    activeModalBooking = booking || bookings[0];
    activeModalTab = tab;
    isModalOpen = true;
    // On the Calendar page the primary action only applies to pending bookings.
    const confirmBtn = container.querySelector('#mobile-confirm-booking-btn');
    if (page === 'calendar' && activeModalBooking.status !== 'Pending') confirmBtn?.style.setProperty('display', 'none', 'important'); else confirmBtn?.style.removeProperty('display');
    showAllGuests = false;
    openDropdownItemId = null;

    renderSheetHeader();
    renderSheetBody();

    container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      const isActive = btn.dataset.sheetTab === activeModalTab;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    });

    const backdrop = container.querySelector('#mobile-sheet-backdrop');
    const sheet = container.querySelector('#mobile-bottom-sheet');
    if (backdrop) backdrop.classList.add('open');
    if (sheet) sheet.classList.add('open');

    // Ensure bottom nav is hidden so it never peeks beneath sheet
    const bottomNav = container.querySelector('.mobile-bottom-nav');
    if (bottomNav) bottomNav.style.setProperty('display', 'none', 'important');
  }

  function closeModal() {
    isModalOpen = false;
    openDropdownItemId = null;
    closeAssignSheet();
    const backdrop = container.querySelector('#mobile-sheet-backdrop');
    const sheet = container.querySelector('#mobile-bottom-sheet');
    if (backdrop) backdrop.classList.remove('open');
    if (sheet) sheet.classList.remove('open');

    // Restore bottom nav
    const bottomNav = container.querySelector('.mobile-bottom-nav');
    if (bottomNav) bottomNav.style.removeProperty('display');
  }

  // Assign an itinerary event: the same shared Assign sheet as everywhere else, with the event as the summary card.
  function assignItineraryItem(item) {
    const rec = activeModalBooking;
    if (!item || !rec) return;
    const prev = item.assigned;
    const t = eventKind(item);
    openAssign({
      kind: 'itinerary',
      items: [{ id: item.id, title: item.title, name: item.title }],
      summary: { title: item.title, subtitle: item.subtitle, badge: t.label, iconHtml: icon(t.icon, { size: 22 }) },
      onApply: (who) => { item.assigned = { isAssigned: true, name: who.name, avatar: who.avatar }; renderSheetBody(); },
      onRevert: () => { item.assigned = prev; renderSheetBody(); },
      persist: () => persist(rec, { onRollback: renderSheetBody }),
    });
  }

  function openAssignSheet(item) { assignItineraryItem(item); }

  function closeAssignSheet() {
    return;
    isAssignSheetOpen = false;
    const sheet = container.querySelector('#mobile-assign-to-sheet');
    if (sheet) {
      sheet.classList.remove('open');
      sheet.style.removeProperty('display');
    }

    // Restore bottom sheet if modal was open
    const bottomSheet = container.querySelector('#mobile-bottom-sheet');
    if (bottomSheet && isModalOpen) {
      bottomSheet.classList.remove('hide-for-assign');
      bottomSheet.style.removeProperty('display');
      bottomSheet.style.setProperty('display', 'flex', 'important');
    }

    // Restore bottom nav only if main modal is not open
    const bottomNav = container.querySelector('.mobile-bottom-nav');
    if (bottomNav && !isModalOpen) {
      bottomNav.style.removeProperty('display');
    }
  }

  // Modal Helpers
  function openSpecialReqModal() {
    const modal = container.querySelector('#mobile-special-req-modal');
    if (!modal) return;
    renderSpecialReqModalContent();
    modal.classList.add('open');
  }

  function closeSpecialReqModal() {
    const modal = container.querySelector('#mobile-special-req-modal');
    if (modal) modal.classList.remove('open');
    renderSheetBody();
  }

  function renderSpecialReqModalContent() {
    const listEl = container.querySelector('#modal-reqs-current-list');
    const presetsEl = container.querySelector('#modal-presets-chip-grid');
    if (!listEl || !presetsEl || !activeModalBooking) return;

    activeModalBooking.specialRequirements = activeModalBooking.specialRequirements || [];
    const reqs = activeModalBooking.specialRequirements;

    listEl.innerHTML = reqs.length > 0 ? reqs.map((r) => `
      <div class="editable-req-item">
        <div class="editable-req-item-left">
          <span>${getSpecialReqIconSvg(r.icon, r.color || '#2563EB')}</span>
          <span>${r.text}</span>
        </div>
        <button class="btn-delete-req-pill" data-delete-req-id="${r.id}" title="Remove requirement">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('') : '<p style="font-size: 13px; color: #94A3B8; text-align: center; margin: 6px 0;">No requirements added yet.</p>';

    presetsEl.innerHTML = SPECIAL_REQUIREMENTS_PRESETS.map(p => {
      const alreadyHas = reqs.some(r => r.text.toLowerCase() === p.text.toLowerCase());
      return `
        <button class="preset-chip-btn ${alreadyHas ? 'is-active' : ''}" data-preset-text="${p.text}" data-preset-icon="${p.icon}" data-preset-color="${p.color}">
          ${getSpecialReqIconSvg(p.icon, alreadyHas ? '#2563EB' : p.color)}
          <span>${alreadyHas ? '✓ ' + p.text : p.text}</span>
        </button>
      `;
    }).join('');
  }

  function openActivityDetailsModal(item) {
    if (!item) return;
    modalActiveItem = item;
    const modal = container.querySelector('#mobile-activity-details-modal');
    const titleText = container.querySelector('#modal-details-title-text');
    const iconBox = container.querySelector('#modal-details-icon-box');
    const bodyContent = container.querySelector('#modal-details-body-content');
    const toggleBtn = container.querySelector('#btn-modal-details-toggle-complete');

    if (titleText) titleText.textContent = item.title;
    if (iconBox) iconBox.innerHTML = itemIconHtml(item, 20);
    if (toggleBtn) {
      toggleBtn.textContent = item.completed ? 'Mark Incomplete' : 'Mark Completed ✓';
      toggleBtn.style.color = item.completed ? '#DC2626' : '#16A34A';
    }

    let dayLabel = 'Day 1';
    let dateLabel = '';
    activeModalBooking.itineraryDays?.forEach(d => {
      if (d.items.some(i => i.id === item.id)) {
        dayLabel = d.day;
        dateLabel = d.date;
      }
    });

    if (bodyContent) {
      bodyContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
            <div>
              <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Schedule</span>
              <h4 style="margin: 2px 0 0 0; font-size: 14px; color: #0F172A;">${dayLabel} • ${dateLabel}</h4>
            </div>
            <span class="status-pill ${item.completed ? 'status-paid' : 'badge-tour'}">
              <span class="dot"></span>
              ${item.completed ? 'Completed ✓' : 'Scheduled'}
            </span>
          </div>

          <div class="customer-info-grid" style="gap: 10px 14px;">
            <div class="info-cell">
              <span class="info-label">Activity Name</span>
              <span class="info-value-bold">${item.title}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Timing & Subtitle</span>
              <span class="info-value-text">${item.subtitle}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Category Type</span>
              <span class="info-value-text" style="text-transform: capitalize;">${item.type}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Assigned Status</span>
              <span class="info-value-bold" style="color: ${item.assigned?.isAssigned ? '#15803D' : '#D97706'};">
                ${item.assigned?.isAssigned ? item.assigned.name : 'Unassigned'}
              </span>
            </div>
          </div>

          ${item.assigned?.isAssigned ? `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 10px;">
              <img src="${item.assigned.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
              <div>
                <h5 style="margin: 0; font-size: 13px; font-weight: 700; color: #166534;">${item.assigned.name}</h5>
                <p style="margin: 0; font-size: 11.5px; color: #15803D;">Assigned Coordinator</p>
              </div>
            </div>
          ` : `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 10px;">
              <span style="font-size: 12.5px; color: #1E40AF; font-weight: 600;">No vendor or staff assigned yet</span>
              <button class="action-pill-btn" id="btn-modal-details-assign-now" style="background: #2563EB; color: #FFFFFF; border: none; padding: 5px 12px; font-size: 12px;">Assign Now</button>
            </div>
          `}
        </div>
      `;
    }

    if (modal) modal.classList.add('open');
  }

  function closeActivityDetailsModal() {
    const modal = container.querySelector('#mobile-activity-details-modal');
    if (modal) modal.classList.remove('open');
  }

  function openEditActivityModal(item) {
    if (!item) return;
    modalActiveItem = item;
    const modal = container.querySelector('#mobile-edit-activity-modal');
    const titleInput = container.querySelector('#modal-edit-act-title');
    const subtitleInput = container.querySelector('#modal-edit-act-subtitle');
    const typeSelect = container.querySelector('#modal-edit-act-type');

    if (titleInput) titleInput.value = item.title;
    if (subtitleInput) subtitleInput.value = item.subtitle;
    if (typeSelect) typeSelect.value = item.type || 'sightseeing';

    if (modal) modal.classList.add('open');
  }

  function closeEditActivityModal() {
    const modal = container.querySelector('#mobile-edit-activity-modal');
    if (modal) modal.classList.remove('open');
  }



  function openMobileEditCustomerModal() {
    if (!activeModalBooking) return;
    const c = activeModalBooking.customer || {
      name: activeModalBooking.guest?.name || 'Customer',
      phone: activeModalBooking.guest?.phone || '+91 99884 84884',
      email: activeModalBooking.guest?.email || 'guest@example.com',
      location: 'Chandigarh, Punjab',
      leadSource: 'Website',
      preferredDestination: activeModalBooking.destination || '',
      travelDates: activeModalBooking.dates || '',
      customerType: `Family (${activeModalBooking.pax || 3} Pax)`,
      budgetEst: activeModalBooking.price || '',
      shortDetails: activeModalBooking.notes || ''
    };

    const modal = container.querySelector('#mobile-edit-customer-modal');
    if (!modal) return;
    const setVal = (sel, val) => { const el = modal.querySelector(sel); if (el) el.value = val || ''; };
    setVal('#mobile-modal-edit-cust-name', c.name);
    setVal('#mobile-modal-edit-cust-phone', c.phone);
    setVal('#mobile-modal-edit-cust-email', c.email);
    setVal('#mobile-modal-edit-cust-location', c.location);
    setVal('#mobile-modal-edit-cust-source', c.leadSource || 'Website');
    setVal('#mobile-modal-edit-cust-type', c.customerType || `Family (${activeModalBooking.pax || 3} Pax)`);
    setVal('#mobile-modal-edit-cust-destination', c.preferredDestination || activeModalBooking.destination);
    setVal('#mobile-modal-edit-cust-dates', c.travelDates || activeModalBooking.dates);
    setVal('#mobile-modal-edit-cust-budget', c.budgetEst || activeModalBooking.price);
    setVal('#mobile-modal-edit-cust-notes', c.shortDetails || activeModalBooking.notes || '');

    modal.classList.add('open');
  }

  function closeMobileEditCustomerModal() {
    const modal = container.querySelector('#mobile-edit-customer-modal');
    if (modal) modal.classList.remove('open');
  }

  function openMobileAddFollowupModal() {
    if (!activeModalBooking) return;
    const modal = container.querySelector('#mobile-add-followup-modal');
    if (!modal) return;
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const typeEl = modal.querySelector('#mobile-modal-add-followup-type');
    const titleEl = modal.querySelector('#mobile-modal-add-followup-title');
    const dateEl = modal.querySelector('#mobile-modal-add-followup-date');
    const timeEl = modal.querySelector('#mobile-modal-add-followup-time');
    const descEl = modal.querySelector('#mobile-modal-add-followup-desc');

    if (typeEl) typeEl.value = 'call';
    if (titleEl) titleEl.value = 'Follow-up Call';
    if (dateEl) dateEl.value = dateStr;
    if (timeEl) timeEl.value = timeStr;
    if (descEl) descEl.value = '';

    modal.classList.add('open');
  }

  function closeMobileAddFollowupModal() {
    const modal = container.querySelector('#mobile-add-followup-modal');
    if (modal) modal.classList.remove('open');
  }

  function openMobileAddAssigneeModal(type) {
    const modal = container.querySelector('#mobile-add-assignee-modal');
    if (!modal) return;
    const heading = modal.querySelector('#mobile-modal-add-assignee-heading');
    const nameLbl = modal.querySelector('#mobile-modal-add-assignee-name-lbl');
    const roleLbl = modal.querySelector('#mobile-modal-add-assignee-role-lbl');
    const nameInput = modal.querySelector('#mobile-modal-add-assignee-name');
    const roleInput = modal.querySelector('#mobile-modal-add-assignee-role');
    const phoneInput = modal.querySelector('#mobile-modal-add-assignee-phone');

    if (heading) heading.textContent = `Add New ${type === 'Vendors' ? 'Vendor' : type === 'Contacts' ? 'Contact' : 'Team Member'}`;
    if (nameLbl) nameLbl.textContent = type === 'Vendors' ? 'Company Name' : 'Full Name';
    if (roleLbl) roleLbl.textContent = type === 'Vendors' ? 'Service Provided' : 'Role / Title';
    if (nameInput) { nameInput.value = ''; nameInput.placeholder = type === 'Vendors' ? 'e.g. Mountain Peaks Trekking' : 'e.g. Ramesh Kumar'; }
    if (roleInput) { roleInput.value = ''; roleInput.placeholder = type === 'Vendors' ? 'e.g. Adventure Guides' : 'e.g. Tour Escort'; }
    if (phoneInput) { phoneInput.value = ''; phoneInput.placeholder = '+91 98765 00000'; }

    modal.classList.add('open');
  }

  function closeMobileAddAssigneeModal() {
    const modal = container.querySelector('#mobile-add-assignee-modal');
    if (modal) modal.classList.remove('open');
  }

  function bindEvents() {
    // Search input
    const searchInput = container.querySelector('#mobile-search-input');
    if (searchInput) {
      let searchTimer = null;
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        searchQuery = val;
        // Debounced: one render per pause in typing; the list stays visible meanwhile.
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => setParams({ q: val.trim() }, { push: false }), 200);
      });
    }

    // Category dropdown (shared component), persisted in the query string
    const categoryFilter = createCategoryFilter({ onChange: (v) => setParams({ category: v || null, tab: null }) });
    categoryFilter.attach(container.querySelector('#mobile-filter-slot'));

    function applyParams() {
      const q = getParams();
      searchQuery = q.q || '';
      activeCategory = tabDefs().some(t => t.key === q.tab) ? q.tab : allKey();
      selectedCategory = q.category || 'ALL';
      categoryFilter.setValue(q.category || '');
      if (searchInput && document.activeElement !== searchInput) searchInput.value = searchQuery;
      renderCards();
    }

    bindNotifications({ bell: container.querySelector('#mobile-bell-btn'), panel: container.querySelector('#mobile-notifications'), dot: container.querySelector('#mobile-bell-dot'), backdrop: container.querySelector('#mobile-notif-backdrop') });
    const calendar = createMobileCalendar(container.querySelector('#mobile-calendar-page'), {
      isActive: () => page === 'calendar' && document.documentElement.dataset.layout === 'mobile',
      onOpen: (b) => openModal(b),
    });
    const team = createMobileTeam(container.querySelector('#mobile-team-page'), {
      onViewBooking: (bId) => navigate('bookings', { q: bId })
    });

    // Page routing: Bookings <-> Inquiries share one list, one detail panel
    const subtitleEl = container.querySelector('#mobile-header-subtitle');
    const scrollMemory = {};
    let needRestore = false;
    function route() {
      const next = currentPage();
      const changed = next !== page;
      page = next;
      if (changed) {
        if (isModalOpen) closeModal();
        bookings = page === 'inquiries' ? inquiryState.list : bookingsData;
        bookings.forEach(b => { b.selected = false; });
        activeCategory = allKey();
        const sc = container.querySelector('#mobile-screen-scroll');
        scrollMemory[page === 'inquiries' ? 'bookings' : 'inquiries'] = sc ? sc.scrollTop : 0;
        needRestore = true;
      }
      container.querySelectorAll('.mobile-bottom-nav [data-route]').forEach(b => b.classList.toggle('active', b.dataset.route === page));
      // The shell draws Inquiries, Bookings (no add flow of its own: it opens the Inquiry one), Calendar and Team; other pages are hosted and set their own.
      if (page === 'team') setShellAddAction('Add Member', () => window.dispatchEvent(new CustomEvent('open-add-team-member-modal')));
      else if (page === 'inquiries' || page === 'bookings') setShellAddAction('Add Inquiry', () => openAddInquiry({ showRow: showNewInquiry, returnFocus: () => container.querySelector('#mobile-page-add') }));
      else setShellAddAction(null);
      container.querySelector('#mobile-bookings-page').hidden = page === 'calendar' || page === 'team';
      container.querySelector('#mobile-calendar-page').hidden = page !== 'calendar';
      container.querySelector('#mobile-team-page').hidden = page !== 'team';
      container.querySelector('#mobile-screen-scroll')?.classList.toggle('calendar-mode', page === 'calendar');
      if (page === 'calendar') { if (changed) calendar.activate(); else calendar.render(); }
      if (page === 'team') { if (changed) team.activate(); else team.render(); }
      if (subtitleEl) subtitleEl.textContent = page === 'calendar' ? 'Calendar' : page === 'team' ? `Operations Team • ${OPERATIONS_TEAM_MEMBERS.length} Total` : page === 'inquiries' ? `Inquiries • ${inquiryState.list.length} Total` : 'Bookings • 28 Total';
      const confirmBtn = container.querySelector('#mobile-confirm-booking-btn');
      if (confirmBtn) confirmBtn.textContent = page === 'inquiries' ? 'Confirm Inquiry' : 'Confirm Booking';
      applyParams();
      if (needRestore) { const sc = container.querySelector('#mobile-screen-scroll'); if (sc) sc.scrollTop = scrollMemory[page] || 0; needRestore = false; }
    }
    subscribePage(route);
    subscribeInquiries((ids) => {
      if (page !== 'inquiries') return;
      bookings = inquiryState.list;
      if (activeModalBooking) activeModalBooking = bookings.find(b => b.id === activeModalBooking.id) || activeModalBooking;
      if (subtitleEl) subtitleEl.textContent = `Inquiries • ${inquiryState.list.length} Total`;
      if (ids && ids.length) patchRows(ids); else renderCards();
      if (isModalOpen && !(ids && ids.length)) { renderSheetHeader(); renderSheetBody(); }
    });
    subscribeFollowUps(() => {
      if (isModalOpen && activeModalTab === 'customer-details' && activeModalBooking) renderSheetBody();
    });
    window.addEventListener('layout-changed', () => { if (isModalOpen) closeModal(); });
    // The itinerary event popups (View Details, Edit) close with a tap on the dimmed backdrop and with Esc, like every other popup
    container.querySelector('#mobile-activity-details-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeActivityDetailsModal(); });
    container.querySelector('#mobile-edit-activity-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeEditActivityModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const edit = container.querySelector('#mobile-edit-activity-modal.open');
      const details = container.querySelector('#mobile-activity-details-modal.open');
      if (!edit && !details) return;
      e.stopImmediatePropagation(); // Esc closes the popup only; the booking sheet under it stays on the Itinerary tab
      if (edit) closeEditActivityModal(); else closeActivityDetailsModal();
    }, true);
    window.addEventListener('bookings-changed', (e) => patchRows(e.detail?.ids));
    loadFollowUps();
    loadInquiries();
    syncBookingPayments().then(() => renderCards());
    container.querySelectorAll('.mobile-bottom-nav [data-route]').forEach((b) => {
      b.addEventListener('click', () => goToPage(b.dataset.route));
    });
    route();

    container.querySelector('#mobile-more-btn').addEventListener('click', (e) => openMoreSheet({ returnFocus: () => e.currentTarget }));
    container.addEventListener('click', (e) => { if (e.target.closest('#btn-retry-inquiries')) loadInquiries(); });

    // Add Inquiry: the one wizard. After a save the list shows everything again and scrolls to the top, where the new row is.
    function showNewInquiry(row) {
      setParams({ q: null, tab: null, category: null }, { push: false });
      requestAnimationFrame(() => container.querySelector('#mobile-screen-scroll')?.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    }

    // Bulk bar: select all / clear / search / filter / Assign
    bindBulkBar(container, 'mobile', {
      onSelectAll: () => { const any = bookings.some(b => !b.selected); bookings.forEach(b => { b.selected = any; }); syncSelectionUI(); },
      onClear: () => { bookings.forEach(b => { b.selected = false; }); syncSelectionUI(); },
      onAssign: () => assignSelected(),
    });

    function startAssign(list) {
      const prev = list.map(b => ({ b, assignedTo: b.assignedTo, assignedStatus: b.assignedStatus }));
      const ids = list.map(b => b.id);
      const repaint = () => window.dispatchEvent(new CustomEvent('bookings-changed', { detail: { ids } }));
      openAssign({
        kind: page === 'inquiries' ? 'inquiry' : 'booking',
        items: assignItems(list),
        onApply: (who) => {
          list.forEach(b => { b.assignedTo = { name: who.name, avatar: who.avatar, role: who.role }; b.assignedStatus = 'Assigned'; b.selected = false; });
          repaint();
        },
        onRevert: () => { prev.forEach(p => { p.b.assignedTo = p.assignedTo; p.b.assignedStatus = p.assignedStatus; }); repaint(); },
        onDone: () => syncSelectionUI(),
      });
    }

    function assignSelected() {
      const sel = bookings.filter(b => b.selected);
      if (!sel.length) return toast('Select at least 1 item to assign.', 'info');
      startAssign(sel);
    }

    function setPayment(b, status) {
      const prev = { status: b.status, statusClass: b.statusClass };
      const apply = (v) => { b.status = v.status; b.statusClass = v.statusClass; window.dispatchEvent(new CustomEvent('bookings-changed', { detail: { ids: [b.id] } })); };
      apply({ status, statusClass: status === 'Paid' ? 'status-paid' : 'status-pending' }); // optimistic
      savePayment(b.id, status).then((ok) => {
        if (ok) return toast(`${b.id} marked as ${status === 'Paid' ? 'Paid' : 'Unpaid'}`, 'success');
        apply(prev); // roll back
        toast('Could not save the payment status. It was reverted.', 'warning');
      });
    }

    function runRowMenu(b, key) {
      if (key === 'view') openModal(b, 'customer-details');
      else if (key === 'assign') startAssign([b]);
      else if (key === 'paid') setPayment(b, 'Paid');
      else if (key === 'unpaid') setPayment(b, 'Pending');
      else if (key === 'email') {
        if (!b.guest.email) return toast('No email on file for this customer.', 'warning');
        window.location.href = `mailto:${b.guest.email}?subject=${encodeURIComponent(`Your inquiry ${b.id}: ${b.title}`)}`;
        toast(`Drafting email to ${b.guest.email}...`, 'info');
      }
      else if (key === 'followup') openFollowUpModal(b.raw);
    }

    bindQuickNotes(container);
    container.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-quick-note]');
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector('input');
      const send = form.querySelector('.quick-note-send');
      if (!input.value.trim() || send.disabled) return; // empty notes cannot be sent
      send.disabled = true; // one request at a time; it stays off until the field changes
      if (await saveQuickNote(form.dataset.quickNote, input.value)) input.value = '';
      else send.disabled = !input.value.trim();
    });

    container.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab-pill[data-cat]');
      if (tab) { setCategory(tab.dataset.cat); return; }
      if (e.target.closest('.quick-note')) { e.stopPropagation(); return; }
      const more = e.target.closest('[data-row-menu]');
      if (more) {
        e.stopPropagation();
        const b = bookings.find(x => x.id === more.dataset.rowMenu);
        if (b) openRowMenu(more, rowMenuItems(b), (key) => runRowMenu(b, key));
      }
    }, true);

    // Categories Array for Left/Right Swiping & Filtering
    const categories = { includes: (k) => tabDefs().some(t => t.key === k), indexOf: (k) => tabDefs().findIndex(t => t.key === k), get length() { return tabDefs().length; }, 0: null };
    const categoryAt = (i) => tabDefs()[i].key;

    function setCategory(cat, slideDir = null) {
      if (!categories.includes(cat)) return;
      activeCategory = cat;
      setParams({ tab: cat === allKey() ? null : cat }, { silent: true });

      // Update active tab buttons
      container.querySelectorAll('.tab-pill').forEach(btn => {
        if (btn.dataset.cat === cat) {
          btn.classList.add('active');
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          btn.classList.remove('active');
        }
      });

      const listEl = container.querySelector('#mobile-cards-list');
      if (listEl) {
        const offset = slideDir === 'left' ? '-14px' : slideDir === 'right' ? '14px' : '0px';
        listEl.style.transition = 'opacity var(--motion-fast) var(--ease-out), transform var(--motion-fast) var(--ease-out)';
        listEl.style.opacity = '0';
        listEl.style.transform = `translateX(${offset})`;

        setTimeout(() => {
          renderCards();
          listEl.style.transform = slideDir === 'left' ? 'translateX(14px)' : slideDir === 'right' ? 'translateX(-14px)' : 'translateX(0)';
          void listEl.offsetHeight; // trigger reflow
          listEl.style.transition = 'opacity var(--motion-fast) var(--ease-out), transform var(--motion-fast) var(--ease-out)';
          listEl.style.opacity = '1';
          listEl.style.transform = 'translateX(0)';
        }, 60);
      } else {
        renderCards();
      }
    }

    function switchCategoryByDirection(direction) {
      const currentIndex = categories.indexOf(activeCategory);
      let targetIndex = currentIndex;

      if (direction === 'left') {
        // Swiping left moves towards left tab ('New Bookings')
        targetIndex = Math.max(0, currentIndex - 1);
      } else if (direction === 'right') {
        // Swiping right moves towards right tab ('Assigned', 'Ongoing')
        targetIndex = Math.min(categories.length - 1, currentIndex + 1);
      }

      if (targetIndex !== currentIndex) {
        setCategory(categoryAt(targetIndex), direction);
      }
    }

    // Category Tabs click

    // Swiping the Bookings / Inquiries list moves to the next / previous chip: see bindChipSwipe below (one shared gesture for every list page).

    // Modal Sheet Left and Right Swipe / Scroll Gesture Handling (Customer Details <-> Guests <-> Itinerary <-> Updates)
    const sheetEl = container.querySelector('#mobile-bottom-sheet');
    const modalTabs = ['customer-details', 'guests', 'itinerary', 'updates'];

    function switchModalTabByDirection(direction) {
      const currentIndex = modalTabs.indexOf(activeModalTab);
      let targetIndex = currentIndex;

      if (direction === 'left') {
        // Swiping left moves towards left tab (e.g. Guests -> Customer Details, Itinerary -> Guests)
        targetIndex = Math.max(0, currentIndex - 1);
      } else if (direction === 'right') {
        // Swiping right moves towards right tab (e.g. Guests -> Itinerary, Itinerary -> Updates)
        targetIndex = Math.min(modalTabs.length - 1, currentIndex + 1);
      }

      if (targetIndex !== currentIndex) {
        switchTab(modalTabs[targetIndex], direction);
      }
    }

    // Swipe the tab content: next / previous tab. Swipe the header (avatar and name): next / previous record of the list behind the sheet.
    function swipeRecord(step) {
      if (!isModalOpen || (page !== 'bookings' && page !== 'inquiries')) return;
      const ids = [...container.querySelectorAll('#mobile-cards-list .list-row-card[data-booking-id]')].map((el) => el.dataset.bookingId);
      const at = ids.indexOf(activeModalBooking?.id);
      const next = at === -1 ? null : bookings.find((b) => b.id === ids[at + step]);
      if (!next) return; // first / last record, or the list order is not known: do nothing
      activeModalBooking = next;
      activeModalTab = 'customer-details';
      openDropdownItemId = null;
      showAllGuests = false;
      renderSheetHeader();
      renderSheetBody();
      container.querySelectorAll('.sheet-tab-btn').forEach((btn) => {
        const on = btn.dataset.sheetTab === activeModalTab;
        btn.classList.toggle('active', on);
        if (on) btn.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      });
      const bodyEl2 = container.querySelector('#sheet-body-content');
      if (bodyEl2) bodyEl2.scrollTop = 0;
      slideIn(container.querySelector('#sheet-header-card-content'), step);
      slideIn(bodyEl2, step);
    }
    bindChipSwipe(container.querySelector('#mobile-cards-list'), container.querySelector('#mobile-tabs-host'), { enabled: () => page === 'bookings' || page === 'inquiries' });
    const swipeOk = () => isModalOpen && !isAssignSheetOpen && !document.querySelector('.asg-overlay, .modal-overlay.open, .row-floating-menu');
    bindSwipe(container.querySelector('#sheet-body-content'), { enabled: swipeOk, onNext: () => switchModalTabByDirection('right'), onPrev: () => switchModalTabByDirection('left') });
    bindSwipe(container.querySelector('#sheet-header-card-content'), { enabled: swipeOk, onNext: () => swipeRecord(1), onPrev: () => swipeRecord(-1) });

    // Bottom sheet: Esc and swipe-down on the handle/header close it
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isModalOpen && !document.querySelector('.asg-overlay, .fu-overlay, .row-floating-menu, .sheet-overlay')) closeModal(); });
    (() => {
      const sheetEl = container.querySelector('#mobile-bottom-sheet');
      let startY = null;
      sheetEl.addEventListener('touchstart', (e) => { if (e.target.closest('#sheet-header-card-content')) startY = e.touches[0].clientY; }, { passive: true });
      sheetEl.addEventListener('touchmove', (e) => {
        if (startY === null) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 0) sheetEl.style.transform = `translateY(${dy}px)`;
      }, { passive: true });
      sheetEl.addEventListener('touchend', (e) => {
        if (startY === null) return;
        const dy = e.changedTouches[0].clientY - startY;
        startY = null;
        sheetEl.style.transform = '';
        if (dy > 90) closeModal();
      });
    })();

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
      // Reset filters from empty state
      if (e.target.closest('#btn-clear-mobile-empty-filters')) {
        setParams({ q: null, tab: null, category: null, payment: null, assigned: null, from: null, to: null });
        return;
      }

      if (e.target.closest('#btn-view-all-category-filters')) {
        setParams({ q: null, tab: null });
        return;
      }

      // Edit customer button -> Opens app modal
      if (e.target.closest('#btn-edit-customer')) {
        openMobileEditCustomerModal();
        return;
      }

      // Edit Customer Modal Actions
      if (e.target.closest('#btn-cancel-edit-customer') || e.target.closest('#close-mobile-modal-edit-customer-btn')) {
        closeMobileEditCustomerModal();
        return;
      }

      if (e.target.closest('#btn-save-edit-customer')) {
        if (!activeModalBooking) return;
        const nameVal = container.querySelector('#mobile-modal-edit-cust-name')?.value?.trim();
        const phoneVal = container.querySelector('#mobile-modal-edit-cust-phone')?.value?.trim();
        const emailVal = container.querySelector('#mobile-modal-edit-cust-email')?.value?.trim();
        const locVal = container.querySelector('#mobile-modal-edit-cust-location')?.value?.trim();
        const srcVal = container.querySelector('#mobile-modal-edit-cust-source')?.value;
        const typeVal = container.querySelector('#mobile-modal-edit-cust-type')?.value?.trim();
        const destVal = container.querySelector('#mobile-modal-edit-cust-destination')?.value?.trim();
        const datesVal = container.querySelector('#mobile-modal-edit-cust-dates')?.value?.trim();
        const budgetVal = container.querySelector('#mobile-modal-edit-cust-budget')?.value?.trim();
        const notesVal = container.querySelector('#mobile-modal-edit-cust-notes')?.value?.trim();

        if (!nameVal || !phoneVal) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Customer name and phone number are required.', type: 'warning' }
          }));
          return;
        }

        const nameParts = nameVal.split(' ');
        const initials = (nameParts[0]?.[0] || 'C') + (nameParts[1]?.[0] || '');

        activeModalBooking.customer = activeModalBooking.customer || {};
        activeModalBooking.customer.name = nameVal;
        activeModalBooking.customer.initials = initials.toUpperCase();
        activeModalBooking.customer.phone = phoneVal;
        activeModalBooking.customer.email = emailVal || activeModalBooking.customer.email;
        activeModalBooking.customer.location = locVal || activeModalBooking.customer.location;
        activeModalBooking.customer.leadSource = srcVal || activeModalBooking.customer.leadSource;
        activeModalBooking.customer.customerType = typeVal || activeModalBooking.customer.customerType;
        activeModalBooking.customer.preferredDestination = destVal || activeModalBooking.destination;
        activeModalBooking.customer.travelDates = datesVal || activeModalBooking.dates;
        activeModalBooking.customer.budgetEst = budgetVal || activeModalBooking.price;
        activeModalBooking.customer.shortDetails = notesVal;

        if (activeModalBooking.guest) {
          activeModalBooking.guest.name = nameVal;
          activeModalBooking.guest.phone = phoneVal;
          if (emailVal) activeModalBooking.guest.email = emailVal;
        }
        if (destVal) {
          activeModalBooking.destination = destVal;
        }

        closeMobileEditCustomerModal();
        renderCards();
        renderSheetBody();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Customer details updated successfully!', type: 'success' }
        }));
        return;
      }

      // Add Follow-up Modal Actions
      if (e.target.closest('#btn-cancel-add-followup') || e.target.closest('#close-mobile-modal-add-followup-btn')) {
        closeMobileAddFollowupModal();
        return;
      }

      if (e.target.closest('#btn-submit-add-followup')) {
        if (!activeModalBooking) return;
        const typeVal = container.querySelector('#mobile-modal-add-followup-type')?.value || 'call';
        const titleVal = container.querySelector('#mobile-modal-add-followup-title')?.value?.trim();
        const dateVal = container.querySelector('#mobile-modal-add-followup-date')?.value?.trim();
        const timeVal = container.querySelector('#mobile-modal-add-followup-time')?.value?.trim();
        const descVal = container.querySelector('#mobile-modal-add-followup-desc')?.value?.trim();

        if (!titleVal) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Please enter an activity title / subject.', type: 'warning' }
          }));
          return;
        }

        const typeMap = {
          call: { bg: 'icon-blue', title: 'Follow-up Call (Logged)' },
          whatsapp: { bg: 'icon-green', title: 'WhatsApp Chat (Logged)' },
          email: { bg: 'icon-blue', title: 'Email Sent (Logged)' },
          meeting: { bg: 'icon-purple', title: 'In-Person Meeting (Logged)' },
          note: { bg: 'icon-orange', title: 'Status Note (Logged)' }
        };

        activeModalBooking.customer = activeModalBooking.customer || {};
        activeModalBooking.customer.leadFlow = activeModalBooking.customer.leadFlow || [];
        activeModalBooking.customer.leadFlow.unshift({
          date: dateVal || 'Today',
          time: timeVal || 'Just now',
          type: typeVal,
          iconBg: typeMap[typeVal]?.bg || 'icon-blue',
          title: titleVal,
          desc: descVal,
          author: 'By Ruyi Admin'
        });

        closeMobileAddFollowupModal();
        renderSheetBody();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'New follow-up added to journey!', type: 'success' }
        }));
        return;
      }

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
          syncSelectionUI();
        }
        return;
      }

      // Quick Call Action on Mobile Booking Card
      const callBtn = e.target.closest('[data-action-call]');
      if (callBtn) {
        e.stopPropagation();
        e.preventDefault();
        const id = callBtn.dataset.actionCall;
        const b = bookings.find(item => item.id === id);
        if (b && b.guest && b.guest.phone) {
          const rawPhone = b.guest.phone;
          const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
          window.location.href = `tel:${cleanPhone}`;
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Calling ${b.guest.name} (${rawPhone})...`, type: 'info' }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Phone number not available for this guest.', type: 'warning' }
          }));
        }
        return;
      }

      // Quick WhatsApp Action on Mobile Booking Card
      const waBtn = e.target.closest('[data-action-whatsapp]');
      if (waBtn) {
        e.stopPropagation();
        e.preventDefault();
        const id = waBtn.dataset.actionWhatsapp;
        const b = bookings.find(item => item.id === id);
        if (b && b.guest && b.guest.phone) {
          const rawPhone = b.guest.phone;
          const digits = rawPhone.replace(/[^0-9]/g, '');
          const phoneForWa = digits.startsWith('91') ? digits : (digits.length === 10 ? '91' + digits : digits);
          const msg = encodeURIComponent(`Hi ${b.guest.name}, this is Ruyi Travel Operations regarding your booking ${b.id} (${b.title}).`);
          window.open(`https://wa.me/${phoneForWa}?text=${msg}`, '_blank');
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Opening WhatsApp chat with ${b.guest.name}...`, type: 'success' }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Phone number not available for this guest.', type: 'warning' }
          }));
        }
        return;
      }

      // Card click -> Open Modal on Customer Details
      const card = e.target.closest('.booking-card');
      if (card && !e.target.closest('.quick-note') && !e.target.closest('[data-row-menu]')) {
        const id = card.dataset.bookingId;
        const b = bookings.find(item => item.id === id);
        if (b) openModal(b, 'customer-details');
        return;
      }

      // Sheet close button or backdrop
      if (e.target.closest('#mobile-sheet-close-btn') || e.target.id === 'mobile-sheet-backdrop') {
        closeModal();
        return;
      }

      // Itinerary Back Button `< Booking Details`
      if (e.target.closest('#itinerary-back-btn')) {
        switchTab('customer-details', 'left');
        return;
      }

      // Sheet Navigation Tabs
      const sheetTabBtn = e.target.closest('[data-sheet-tab]'); // the booking sheet's own tabs (the tab rows of hosted pages are not this handler's business)
      if (sheetTabBtn) {
        const targetTab = sheetTabBtn.dataset.sheetTab;
        const currentIdx = modalTabs.indexOf(activeModalTab);
        const targetIdx = modalTabs.indexOf(targetTab);
        const dir = targetIdx > currentIdx ? 'right' : (targetIdx < currentIdx ? 'left' : null);
        switchTab(targetTab, dir);
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
        } else if (act === 'details') {
          openActivityDetailsModal(foundItem);
        } else if (act === 'edit') {
          openEditActivityModal(foundItem);
        } else if (act === 'complete') {
          if (foundItem) {
            foundItem.completed = !foundItem.completed;
            persist(activeModalBooking, { onRollback: renderSheetBody });
            renderSheetBody();
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { 
                message: foundItem.completed ? `Marked "${foundItem.title}" as Complete! ✓` : `Marked "${foundItem.title}" as Scheduled`,
                type: 'success' 
              }
            }));
          }
        } else if (act === 'remove') {
          if (foundItem) {
            activeModalBooking.itineraryDays?.forEach(d => {
              const idx = d.items.indexOf(foundItem);
              if (idx !== -1) d.items.splice(idx, 1);
            });
            renderSheetBody();
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: `Removed "${foundItem.title}" from itinerary`, type: 'info' }
            }));
          }
        }
        return;
      }

      // Special Requirements Modal Triggers & Actions
      if (e.target.closest('#mobile-edit-special-req-btn')) {
        openSpecialReqModal();
        return;
      }

      const delReqBtn = e.target.closest('[data-delete-req-id]');
      if (delReqBtn) {
        const reqId = delReqBtn.dataset.deleteReqId;
        activeModalBooking.specialRequirements = activeModalBooking.specialRequirements.filter(r => r.id !== reqId);
        renderSpecialReqModalContent();
        return;
      }

      const presetBtn = e.target.closest('[data-preset-text]');
      if (presetBtn) {
        const text = presetBtn.dataset.presetText;
        const icon = presetBtn.dataset.presetIcon;
        const color = presetBtn.dataset.presetColor;
        activeModalBooking.specialRequirements = activeModalBooking.specialRequirements || [];
        const existingIdx = activeModalBooking.specialRequirements.findIndex(r => r.text.toLowerCase() === text.toLowerCase());
        if (existingIdx !== -1) {
          activeModalBooking.specialRequirements.splice(existingIdx, 1);
        } else {
          activeModalBooking.specialRequirements.push({ id: 'SR-' + Date.now(), icon, text, color });
        }
        renderSpecialReqModalContent();
        return;
      }

      if (e.target.closest('#btn-add-custom-req')) {
        const input = container.querySelector('#modal-custom-req-input');
        const val = input?.value?.trim();
        if (val) {
          activeModalBooking.specialRequirements = activeModalBooking.specialRequirements || [];
          activeModalBooking.specialRequirements.push({
            id: 'SR-' + Date.now(),
            icon: 'leaf',
            text: val,
            color: '#2563EB'
          });
          input.value = '';
          renderSpecialReqModalContent();
        }
        return;
      }

      if (e.target.closest('#btn-done-special-req') || e.target.closest('#close-special-req-modal-btn')) {
        closeSpecialReqModal();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Special requirements updated successfully!', type: 'success' }
        }));
        return;
      }

      // Add Itinerary Event Modal Triggers & Actions
      if (e.target.closest('#mobile-add-event-btn')) { openItineraryBuilder(activeModalBooking, { onChange: renderSheetBody }); return; }
      const dayMenuBtn = e.target.closest('[data-day-menu]');
      if (dayMenuBtn) {
        e.stopPropagation();
        const idx = Number(dayMenuBtn.dataset.dayMenu);
        const rec = activeModalBooking;
        openRowMenu(dayMenuBtn, [
          { key: 'add', label: 'Add event', icon: 'plus' },
          { key: 'rename', label: 'Rename day', icon: 'edit' },
          { key: 'delete', label: 'Delete day', icon: 'trash', danger: true },
        ], (key) => {
          if (key === 'add') return openItineraryBuilder(rec, { day: idx, step: 2, onChange: renderSheetBody });
          if (key === 'rename') return openDayDialog(rec, { index: idx, onChange: renderSheetBody });
          if (daysOf(rec)[idx]?.items.length) return toast('Only empty days can be deleted. Remove its events first.', 'warning');
          commit(rec, () => { daysOf(rec).splice(idx, 1); renumber(rec); }, renderSheetBody, 'Day deleted');
        });
        return;
      }

      // Activity Details Modal Actions
      if (e.target.closest('#btn-modal-details-toggle-complete')) {
        if (modalActiveItem) {
          modalActiveItem.completed = !modalActiveItem.completed;
          openActivityDetailsModal(modalActiveItem);
          renderSheetBody();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { 
              message: modalActiveItem.completed ? `Marked "${modalActiveItem.title}" as Complete! ✓` : `Marked as Scheduled`,
              type: 'success' 
            }
          }));
        }
        return;
      }

      if (e.target.closest('#btn-modal-details-edit-trigger')) {
        const itemToEdit = modalActiveItem;
        closeActivityDetailsModal();
        openEditActivityModal(itemToEdit);
        return;
      }

      if (e.target.closest('#btn-modal-details-assign-now')) {
        const itemToAssign = modalActiveItem;
        closeActivityDetailsModal();
        openAssignSheet(itemToAssign);
        return;
      }

      if (e.target.closest('#btn-modal-details-close-btn') || e.target.closest('#close-modal-details-btn')) {
        closeActivityDetailsModal();
        return;
      }

      // Edit Activity Modal Actions
      if (e.target.closest('#btn-cancel-edit-activity') || e.target.closest('#close-modal-edit-activity-btn')) {
        closeEditActivityModal();
        return;
      }

      if (e.target.closest('#btn-save-edit-activity')) {
        const title = container.querySelector('#modal-edit-act-title')?.value?.trim();
        const subtitle = container.querySelector('#modal-edit-act-subtitle')?.value?.trim();
        const type = container.querySelector('#modal-edit-act-type')?.value;

        if (title && modalActiveItem) {
          modalActiveItem.title = title;
          if (subtitle) modalActiveItem.subtitle = subtitle;
          if (type) modalActiveItem.type = type;
          persist(activeModalBooking, { onRollback: renderSheetBody });
          closeEditActivityModal();
          renderSheetBody();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Updated "${title}" activity!`, type: 'success' }
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
        
        // Ensure default selected assignee matches the active tab
        if (assignVendorTab === 'Team Members' && (!selectedAssignee || selectedAssignee.type !== 'Team Members')) {
          selectedAssignee = { type: 'Team Members', id: teamMembers[0].id, name: teamMembers[0].name, avatar: teamMembers[0].avatar, roleOrService: teamMembers[0].role, phone: teamMembers[0].phone };
        } else if (assignVendorTab === 'Vendors' && (!selectedAssignee || selectedAssignee.type !== 'Vendors')) {
          selectedAssignee = { type: 'Vendors', id: vendors[0].id, name: vendors[0].name, avatar: vendors[0].image, roleOrService: vendors[0].service, phone: vendors[0].phone };
        } else if (assignVendorTab === 'Contacts' && (!selectedAssignee || selectedAssignee.type !== 'Contacts')) {
          selectedAssignee = { type: 'Contacts', id: contacts[0].id, name: contacts[0].name, avatar: contacts[0].avatar, roleOrService: contacts[0].role, phone: contacts[0].phone };
        }

        renderAssignVendorsList();
        return;
      }

      // Assign Item Selection (Team Member, Vendor, or Contact)
      const assignCard = e.target.closest('.vendor-item-card');
      if (assignCard) {
        const type = assignCard.dataset.assignType;
        const id = assignCard.dataset.assignId;
        if (type === 'Team Members') {
          const m = teamMembers.find(t => t.id === id);
          if (m) selectedAssignee = { type, id: m.id, name: m.name, avatar: m.avatar, roleOrService: m.role, phone: m.phone };
        } else if (type === 'Vendors') {
          const v = vendors.find(t => t.id === id);
          if (v) selectedAssignee = { type, id: v.id, name: v.name, avatar: v.image, roleOrService: v.service, phone: v.phone };
        } else if (type === 'Contacts') {
          const c = contacts.find(t => t.id === id);
          if (c) selectedAssignee = { type, id: c.id, name: c.name, avatar: c.avatar, roleOrService: c.role, phone: c.phone };
        }
        renderAssignVendorsList();
        return;
      }

      // Add New Item Trigger (Team Member, Vendor, or Contact) -> Opens app-based modal
      if (e.target.closest('#btn-add-new-vendor-trigger')) {
        openMobileAddAssigneeModal(assignVendorTab);
        return;
      }

      // Add Assignee Modal Actions
      if (e.target.closest('#btn-cancel-add-assignee') || e.target.closest('#close-mobile-modal-add-assignee-btn')) {
        closeMobileAddAssigneeModal();
        return;
      }

      if (e.target.closest('#btn-submit-add-assignee')) {
        const nameVal = container.querySelector('#mobile-modal-add-assignee-name')?.value?.trim();
        const roleVal = container.querySelector('#mobile-modal-add-assignee-role')?.value?.trim();
        const phoneVal = container.querySelector('#mobile-modal-add-assignee-phone')?.value?.trim() || '+91 98765 00000';

        if (!nameVal) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Please enter a name or company title.', type: 'warning' }
          }));
          return;
        }

        if (assignVendorTab === 'Team Members') {
          const newM = {
            id: `ST-0${teamMembers.length + 1}`,
            name: nameVal,
            role: roleVal || 'Operations Coordinator',
            phone: phoneVal,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            activeTrips: 1
          };
          teamMembers.unshift(newM);
          selectedAssignee = { type: 'Team Members', id: newM.id, name: newM.name, avatar: newM.avatar, roleOrService: newM.role, phone: newM.phone };
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added team member "${nameVal}"!`, type: 'success' }
          }));
        } else if (assignVendorTab === 'Vendors') {
          const newV = {
            id: `V-0${vendors.length + 1}`,
            name: nameVal,
            phone: phoneVal,
            service: roleVal || 'Rishikesh Rafting & Safari',
            image: './images/rishikesh.jpg',
            selected: false
          };
          vendors.unshift(newV);
          selectedAssignee = { type: 'Vendors', id: newV.id, name: newV.name, avatar: newV.image, roleOrService: newV.service, phone: newV.phone };
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added vendor "${nameVal}"!`, type: 'success' }
          }));
        } else if (assignVendorTab === 'Contacts') {
          const newC = {
            id: `CT-0${contacts.length + 1}`,
            name: nameVal,
            phone: phoneVal,
            role: roleVal || 'Tour Contact',
            details: 'On-ground operations contact',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80'
          };
          contacts.unshift(newC);
          selectedAssignee = { type: 'Contacts', id: newC.id, name: newC.name, avatar: newC.avatar, roleOrService: newC.role, phone: newC.phone };
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added contact "${nameVal}"!`, type: 'success' }
          }));
        }

        closeMobileAddAssigneeModal();
        renderAssignVendorsList();
        return;
      }

      // Submit WhatsApp Assignment (Screen 3 -> Screen 4)
      if (e.target.closest('#btn-submit-assign-whatsapp')) {
        const assignee = selectedAssignee || {
          name: teamMembers[0].name,
          avatar: teamMembers[0].avatar
        };

        if (targetActivityItem?.isBulk) {
          const sel = bookings.filter(b => b.selected);
          sel.forEach(b => {
            b.assignedTo = {
              name: assignee.name,
              avatar: assignee.avatar,
              role: assignee.roleOrService || 'Coordinator'
            };
            b.assignedStatus = 'Assigned';
            b.selected = false;
          });
          closeAssignSheet();
          renderCards();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { 
              message: `Assigned ${assignee.name} to ${sel.length} booking(s) & WhatsApp details sent!`,
              type: 'success' 
            }
          }));
          return;
        }

        if (targetActivityItem) {
          targetActivityItem.assigned = {
            isAssigned: true,
            name: assignee.name,
            avatar: assignee.avatar
          };

          // Also ensure Hotel Ganga View has assigned badge like Screen 4
          const hotelItem = activeModalBooking?.itineraryDays?.[0]?.items?.[1];
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
            message: `Assigned ${assignee.name} (${assignVendorTab}) to ${targetActivityItem?.title || 'Activity'} & WhatsApp details sent!`,
            type: 'success' 
          }
        }));
        return;
      }

      // Guest row click in overview -> switches to guests tab
      if (e.target.closest('#row-click-guest')) {
        switchTab('guests', 'right');
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
        if (activeModalBooking?.kind === 'inquiry') { toast(`Inquiry ${activeModalBooking.id} (${activeModalBooking.title}) confirmed.`, 'success'); return; }
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Booking ${activeModalBooking.id} (${activeModalBooking.title}) confirmed successfully!`, type: 'success' }
        }));
        return;
      }
    });
  }

  function switchTab(tab, slideDir = null) {
    if (activeModalTab === tab && !slideDir) return;
    if (!slideDir && activeModalTab !== tab) {
      const currentIdx = modalTabs.indexOf(activeModalTab);
      const targetIdx = modalTabs.indexOf(tab);
      if (currentIdx !== -1 && targetIdx !== -1) {
        slideDir = targetIdx > currentIdx ? 'right' : 'left';
      }
    }

    activeModalTab = tab;
    openDropdownItemId = null;
    closeAssignSheet();

    renderSheetHeader();
    container.querySelectorAll('.sheet-tab-btn').forEach(btn => {
      const isActive = btn.dataset.sheetTab === activeModalTab;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    const bodyEl = container.querySelector('#sheet-body-content');
    if (bodyEl && slideDir) {
      const exitOffset = slideDir === 'left' ? '18px' : '-18px';
      const enterOffset = slideDir === 'left' ? '-18px' : '18px';
      bodyEl.style.transition = 'opacity var(--motion-fast) var(--ease-out), transform var(--motion-fast) var(--ease-out)';
      bodyEl.style.opacity = '0.3';
      bodyEl.style.transform = `translateX(${exitOffset})`;

      setTimeout(() => {
        renderSheetBody();
        bodyEl.scrollTop = 0;
        bodyEl.style.transition = 'none';
        bodyEl.style.transform = `translateX(${enterOffset})`;
        void bodyEl.offsetHeight; // Force reflow
        bodyEl.style.transition = 'opacity var(--motion-base) var(--ease-out), transform var(--motion-base) var(--ease-out)';
        bodyEl.style.opacity = '1';
        bodyEl.style.transform = 'translateX(0)';
      }, 70);
    } else {
      renderSheetBody();
    }
  }

  // Initial cards render in route() (inside bindEvents), so the first paint is already the right page.
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
    openSpecialReqModal,
    closeSpecialReqModal,
    openActivityDetailsModal,
    closeActivityDetailsModal,
    openEditActivityModal,
    closeEditActivityModal,
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

import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST, SPECIAL_REQUIREMENTS_PRESETS, getSpecialReqIconSvg } from './data.js';
import { icon } from './shared/icons.js';
import { currentPage, getParams, setParams, navigate, subscribe as subscribePage } from './shared/page-state.js';
import { createCategoryFilter } from './shared/dropdown-filter.js';
import { searchBox, emptyState, toast, openRowMenu, closeRowMenu, esc, initials } from './shared/ui.js';
import { renderTabs, avatar, categoryBadge, statusPill, rowActionButtons, rowMenuItems, assignItems, quickNote, bulkBar, bindBulkBar, updateBulkBar } from './shared/list-ui.js';
import { journeyFor, renderJourneyItems, subscribeFollowUps, loadFollowUps } from './shared/followups.js';
import { openFollowUpModal } from './shared/followup-modal.js';
import { inquiryState, INQUIRY_TABS, loadInquiries, subscribeInquiries, saveQuickNote, savePayment, syncBookingPayments } from './shared/inquiry-store.js';
import { openAssign } from './shared/assign-sheet.js';
import { matchesCategory } from './shared/booking-filters.js';

export function createDesktopView(container) {
  const bookingsData = [...INITIAL_BOOKINGS];
  let bookings = bookingsData; // swapped for the inquiry list on the Inquiries page
  let page = 'bookings';
  let vendors = [...VENDORS_LIST];
  let teamMembers = [...STAFF_MEMBERS];
  let contacts = [...CONTACTS_LIST];
  let activeTab = 'All Bookings';
  let searchQuery = '';
  let selectedCategory = 'ALL';
  let activeBooking = null; // Default: closed popup, table is full-width!
  let isDetailDrawerOpen = false;
  let activeDetailTab = 'customer-details';
  let guestSearchQuery = '';
  let showAllGuests = false;
  let openDropdownItemId = null;
  let modalActiveItem = null;

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

          <a class="sidebar-nav-item" href="#inquiries" id="nav-inquiries">
            <div class="nav-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Inquiries</span>
            </div>
            <span class="sidebar-badge" id="sidebar-inquiries-badge">8</span>
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
        <!-- Top Header with Search and Notification Bar (Image 3 reference) -->
        <header class="desktop-top-header">
          <div class="desktop-search-wrapper">
            ${icon('search', { size: 18 })}
            <input type="text" id="desktop-search-input" placeholder="Search by booking ID, destination, or guest name..." value="${searchQuery}" />
            <button id="desktop-search-clear" style="${searchQuery ? 'display: block;' : 'display: none;'} background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 14px; padding: 0 4px;">✕</button>
          </div>

          <div class="desktop-header-actions">
            <div class="desktop-notification-wrapper" style="position: relative;">
              <button class="icon-bell-btn" id="desktop-bell-btn" title="Notifications" aria-label="Notifications">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span class="bell-dot" id="desktop-bell-dot"></span>
              </button>
              <div class="desktop-notifications-dropdown" id="desktop-notifications-dropdown" style="display: none;">
                <div class="notifications-header">
                  <h4>Notifications</h4>
                  <button class="notifications-mark-read-btn" id="btn-mark-all-notifications-read">Mark all as read</button>
                </div>
                <div class="notifications-list">
                  <div class="notification-item unread">
                    <div class="notif-icon-circle blue">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <div class="notif-content">
                      <p class="notif-text"><strong>New Booking:</strong> Haridwar - Kashi Trip (BK-5021) • 12 Pax</p>
                      <span class="notif-time">10m ago</span>
                    </div>
                  </div>
                  <div class="notification-item unread">
                    <div class="notif-icon-circle green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="notif-content">
                      <p class="notif-text"><strong>Payment Confirmed:</strong> ₹36,000 received from Amit Verma</p>
                      <span class="notif-time">25m ago</span>
                    </div>
                  </div>
                  <div class="notification-item unread">
                    <div class="notif-icon-circle purple">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div class="notif-content">
                      <p class="notif-text"><strong>Special Requirement:</strong> Room Heating requested for BK-5027</p>
                      <span class="notif-time">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Body with Table and Inline Details (Clean, Spacious & Outlook Split View) -->
        <div class="desktop-body">
          <div class="desktop-content-col">
            <!-- Workspace Split: Table + Inline Details Pane (Outlook Style) -->
            <div class="desktop-workspace-split" id="desktop-workspace-split">
              <!-- Left Column: Master View (Full Table when closed, Slim Outlook Master List when open) -->
              <div class="desktop-table-container" id="desktop-table-container">
                <!-- 1. Full 10-Column Spacious Table View (Displayed when details are closed) -->
                <div class="desktop-full-table-view" id="desktop-full-table-view">
                  <div class="table-toolbar">
                    <div id="desktop-tabs-host"></div>
                    <div class="toolbar-actions-group">
                      ${searchBox({ id: 'desktop-table-search-input', placeholder: 'Search bookings...', value: searchQuery, variant: 'desktop' })}
                      <span id="desktop-filter-slot"></span>
                    </div>
                  </div>

                  ${bulkBar('desktop', { desktop: true })}

                  <table class="bookings-table">
                    <thead id="desktop-thead"></thead>
                    <tbody id="desktop-table-body"></tbody>
                  </table>
                </div>

                <!-- 2. Compact Outlook Master List (Shown when details pane is open) -->
                <div class="desktop-compact-list-view" id="desktop-compact-list-view">
                  <div class="compact-list-header">
                    <div class="compact-header-top">
                      <div class="compact-search-bar">
                        ${icon('search', { size: 15 })}
                        <input type="text" id="desktop-compact-search-input" placeholder="Search bookings..." value="${searchQuery}" aria-label="Search" />
                      </div>
                      <span id="desktop-compact-filter-slot"></span>
                      <button class="btn-expand-full-table" id="desktop-btn-expand-table" title="Expand to Full Table View" aria-label="Expand to full table">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                      </button>
                    </div>
                    <div id="desktop-compact-tabs-host"></div>
                  </div>
                  <div class="compact-list-items" id="desktop-compact-list-items">
                    <!-- Populated dynamically in renderTable() -->
                  </div>
                </div>
              </div>

              <!-- Right Column: Inline Detail Pane (Outlook Style - NO dark popup backdrop!) -->
              <aside class="desktop-details-drawer" id="desktop-details-drawer">
                <!-- Unified Header: Rendered dynamically in renderDetailPanel() -->
                <div class="desktop-drawer-header-box" id="desktop-sheet-header">
                  <!-- Populated dynamically with trip title, price, ID, status & metadata -->
                </div>

                <!-- Navigation Tabs -->
                <div class="sheet-tabs-nav desktop-tabs-nav">
                  <button class="sheet-tab-btn ${activeDetailTab === 'customer-details' ? 'active' : ''}" data-dt-tab="customer-details">Customer Details</button>
                  <button class="sheet-tab-btn ${activeDetailTab === 'guests' ? 'active' : ''}" data-dt-tab="guests">Guests (<span id="desktop-guest-count-badge">0</span>)</button>
                  <button class="sheet-tab-btn ${activeDetailTab === 'itinerary' ? 'active' : ''}" data-dt-tab="itinerary">Itinerary</button>
                  <button class="sheet-tab-btn ${activeDetailTab === 'updates' ? 'active' : ''}" data-dt-tab="updates">Updates</button>
                </div>

                <!-- Scrollable Detail Body -->
                <div class="sheet-body-scroll desktop-body-scroll" id="desktop-sheet-body">
                  <!-- Rendered dynamically -->
                </div>

                <!-- Exact Match to Mobile Footer (Image 1) -->
                <div class="sheet-sticky-footer desktop-drawer-footer" id="desktop-drawer-footer">
                  <button class="btn-confirm-booking" id="desktop-confirm-booking-btn">Confirm Booking</button>
                  <div class="sheet-quick-actions-grid desktop-quick-actions-grid">
                    <button class="quick-action-col-btn btn-act-call" id="desktop-act-call" title="Call">
                      ${icon('phone', { size: 20, stroke: 2.2 })}
                      <span>Call</span>
                    </button>
                    <button class="quick-action-col-btn btn-act-msg" id="desktop-act-msg" title="Message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span>Message</span>
                    </button>
                    <button class="quick-action-col-btn btn-act-fwd" id="desktop-act-fwd" title="Forward">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                      <span>Forward</span>
                    </button>
                    <button class="quick-action-col-btn btn-act-more" id="desktop-act-more" title="More">
                      ${icon('more', { size: 20, stroke: 2.2 })}
                      <span>More</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <!-- Desktop Modal 1: Edit Special Requirements -->
      <div class="modal-overlay" id="desktop-special-req-modal">
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
            <button class="sheet-close-btn" id="close-desktop-special-req-modal-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Current Requirements</label>
              <div id="desktop-modal-reqs-current-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto;"></div>
            </div>
            <div class="form-group">
              <label>Quick Add Presets</label>
              <div class="modal-chip-grid" id="desktop-modal-presets-chip-grid"></div>
            </div>
            <div class="form-group">
              <label>Add Custom Requirement</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="desktop-modal-custom-req-input" placeholder="e.g. Extra pillows, Non-smoking room" style="flex: 1;" />
                <button class="btn-primary-desktop" id="desktop-btn-add-custom-req" style="padding: 0 16px; border-radius: 10px; font-size: 13px; font-weight: 700; white-space: nowrap;">+ Add</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-confirm-booking" id="desktop-btn-done-special-req" style="height: 40px; font-size: 13.5px; border-radius: 10px;">Save & Apply</button>
          </div>
        </div>
      </div>

      <!-- Desktop Modal 2: Activity Details -->
      <div class="modal-overlay" id="desktop-activity-details-modal">
        <div class="modal-card">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="item-icon-box item-icon-bus" id="desktop-modal-details-icon-box" style="width: 30px; height: 30px;"></div>
              <h3 id="desktop-modal-details-title-text">Activity Details</h3>
            </div>
            <button class="sheet-close-btn" id="close-desktop-modal-details-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body" id="desktop-modal-details-body-content"></div>
          <div class="modal-footer" style="display: flex; gap: 8px; justify-content: space-between;">
            <button class="action-pill-btn" id="desktop-btn-modal-details-toggle-complete" style="padding: 8px 14px; font-size: 12.5px;">Mark Completed</button>
            <div style="display: flex; gap: 8px;">
              <button class="action-pill-btn" id="desktop-btn-modal-details-edit-trigger" style="padding: 8px 14px; font-size: 12.5px;">Edit</button>
              <button class="btn-primary-desktop" id="desktop-btn-modal-details-close-btn" style="padding: 8px 16px; border-radius: 10px; font-size: 13px;">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Modal 3: Edit Activity -->
      <div class="modal-overlay" id="desktop-edit-activity-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Itinerary Activity</h3>
            <button class="sheet-close-btn" id="close-desktop-modal-edit-activity-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Activity Title</label>
              <input type="text" id="desktop-modal-edit-act-title" placeholder="e.g. River Rafting (16 km)" />
            </div>
            <div class="form-group">
              <label>Timing & Subtitle / Location</label>
              <input type="text" id="desktop-modal-edit-act-subtitle" placeholder="e.g. 10:00 AM • Rishikesh" />
            </div>
            <div class="form-group">
              <label>Category / Icon</label>
              <select id="desktop-modal-edit-act-type">
                <option value="transport">Transport / Bus</option>
                <option value="hotel">Hotel / Accommodation</option>
                <option value="sightseeing">Sightseeing / Tour</option>
                <option value="activity">Sport / Adventure</option>
                <option value="food">Restaurant / Meal</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="desktop-btn-cancel-edit-activity">Cancel</button>
            <button class="btn-primary-desktop" id="desktop-btn-save-edit-activity" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Desktop Modal 4: Add Itinerary Event -->
      <div class="modal-overlay" id="desktop-add-event-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add Itinerary Event</h3>
            <button class="sheet-close-btn" id="close-desktop-modal-add-event-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Select Day</label>
              <select id="desktop-modal-add-event-day-select"></select>
            </div>
            <div class="form-group">
              <label>Event Title</label>
              <input type="text" id="desktop-modal-add-event-title" placeholder="e.g. Sunset Boat Cruise & Tea" />
            </div>
            <div class="form-group">
              <label>Time & Subtitle / Location</label>
              <input type="text" id="desktop-modal-add-event-subtitle" placeholder="e.g. 05:30 PM • 1-hour cruise with DJ" />
            </div>
            <div class="form-group">
              <label>Category / Icon</label>
              <select id="desktop-modal-add-event-type">
                <option value="sightseeing">Sightseeing / Tour</option>
                <option value="transport">Transport / Bus</option>
                <option value="hotel">Hotel / Accommodation</option>
                <option value="activity">Sport / Adventure</option>
                <option value="food">Restaurant / Meal</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="desktop-btn-cancel-add-event">Cancel</button>
            <button class="btn-primary-desktop" id="desktop-btn-submit-add-event" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">+ Add to Itinerary</button>
          </div>
        </div>
      </div>

      <!-- Desktop Modal 5: Assign Coordinator / Vendor -->
      <div class="modal-overlay" id="desktop-assign-modal">
        <div class="modal-card" style="width: 520px;">
          <div class="modal-header">
            <h3>Assign Activity</h3>
            <button class="sheet-close-btn" id="close-desktop-assign-modal-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <!-- Selected Activity Preview Card (Matches Mobile Screen 3) -->
            <div class="assign-activity-card" id="desktop-assign-activity-card" style="margin: 0 0 14px 0; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 10px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" id="desktop-assign-activity-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style="flex: 1; min-width: 0;">
                <h4 id="desktop-assign-activity-title" style="margin: 0; font-size: 13.5px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Activity Title</h4>
                <p id="desktop-assign-activity-subtitle" style="margin: 2px 0 0 0; font-size: 12px; color: #64748B;">Time & Location</p>
              </div>
              <span class="tag-activity-pill" id="desktop-assign-activity-category" style="padding: 3px 8px; border-radius: 9999px; background: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 700; text-transform: uppercase;">ACTIVITY</span>
            </div>

            <div class="form-group">
              <label>Select Assignee Category</label>
              <div class="assign-tabs-row" style="margin-bottom: 6px;">
                <button class="assign-tab-btn active" id="desktop-assign-tab-team">Team Members</button>
                <button class="assign-tab-btn" id="desktop-assign-tab-vendors">Vendors</button>
                <button class="assign-tab-btn" id="desktop-assign-tab-contacts">Contacts</button>
              </div>
            </div>
            <div class="form-group">
              <label>Choose Person / Supplier</label>
              <div id="desktop-assign-picker-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-pill-btn" id="desktop-btn-cancel-assign">Cancel</button>
            <button class="btn-primary-desktop" id="desktop-btn-confirm-assign" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">Confirm Assignment</button>
          </div>
        </div>
      </div>
      <!-- Desktop Modal 6: Edit Customer Details (App-based Modal) -->
      <div class="modal-overlay" id="desktop-edit-customer-modal">
        <div class="modal-card" style="width: 520px; max-width: 95vw;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <h3>Edit Customer Details</h3>
            </div>
            <button class="sheet-close-btn" id="close-desktop-edit-cust-modal-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Customer Name</label>
              <input type="text" id="desktop-edit-cust-name" placeholder="Full Name" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Primary Phone</label>
                <input type="text" id="desktop-edit-cust-phone" placeholder="+91 98765 43210" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="desktop-edit-cust-email" placeholder="customer@gmail.com" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Location / City</label>
                <input type="text" id="desktop-edit-cust-location" placeholder="City, State" />
              </div>
              <div class="form-group">
                <label>Travel Dates</label>
                <input type="text" id="desktop-edit-cust-dates" placeholder="e.g. 15-20 Nov 2024" />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Budget (Est.)</label>
                <input type="text" id="desktop-edit-cust-budget" placeholder="₹24,500" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select id="desktop-edit-cust-status">
                  <option value="Confirmed">Confirmed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Special Notes / Short Details</label>
              <textarea id="desktop-edit-cust-notes" rows="3" placeholder="Enter notes or preferences..." style="width: 100%; border: 1px solid #CBD5E1; border-radius: 10px; padding: 10px; font-family: inherit; font-size: 13px; resize: vertical;"></textarea>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="action-pill-btn" id="desktop-btn-cancel-edit-cust">Cancel</button>
            <button class="btn-primary-desktop" id="desktop-btn-save-edit-cust" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">Save Details</button>
          </div>
        </div>
      </div>

      <!-- Desktop Modal 7: Add Follow-up Entry (App-based Modal) -->
      <div class="modal-overlay" id="desktop-add-followup-modal">
        <div class="modal-card" style="width: 500px; max-width: 95vw;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              <h3>Add Follow-up Entry</h3>
            </div>
            <button class="sheet-close-btn" id="close-desktop-add-followup-modal-btn" style="position: static;">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Channel / Type</label>
              <select id="desktop-modal-followup-type">
                <option value="call">Phone Call (Inbound/Outbound)</option>
                <option value="whatsapp">WhatsApp Message</option>
                <option value="email">Email Sent</option>
                <option value="note">Internal Team Note</option>
              </select>
            </div>
            <div class="form-group">
              <label>Follow-up Title</label>
              <input type="text" id="desktop-modal-followup-title" placeholder="e.g. Call regarding dates & meal preference" />
            </div>
            <div class="form-group">
              <label>Discussion Summary / Details</label>
              <textarea id="desktop-modal-followup-desc" rows="3" placeholder="Enter follow-up details..." style="width: 100%; border: 1px solid #CBD5E1; border-radius: 10px; padding: 10px; font-family: inherit; font-size: 13px; resize: vertical;"></textarea>
            </div>
            <div class="form-group">
              <label>Logged By</label>
              <input type="text" id="desktop-modal-followup-author" value="By Ruyi Admin" />
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="action-pill-btn" id="desktop-btn-cancel-add-followup">Cancel</button>
            <button class="btn-primary-desktop" id="desktop-btn-save-add-followup" style="padding: 8px 18px; border-radius: 10px; font-size: 13px;">+ Log Follow-up</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render Table Rows
  const BOOKING_TABS = [
    { key: 'All Bookings', label: 'All Bookings', short: 'All' },
    { key: 'New Bookings', label: 'New Bookings', short: 'New' },
    { key: 'Assigned', label: 'Assigned', short: 'Assigned' },
    { key: 'Ongoing', label: 'Ongoing', short: 'Ongoing' },
  ];
  const isInquiries = () => page === 'inquiries';
  const tabDefs = () => (isInquiries() ? INQUIRY_TABS : BOOKING_TABS);
  const allKey = () => tabDefs()[0].key;

  function matchesSearch(b) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.destination.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) ||
      b.guest.name.toLowerCase().includes(q) || (b.guest.phone && b.guest.phone.includes(searchQuery));
  }

  const TH_CHECK = `<th style="width: 44px; padding-left: 20px; padding-right: 0;"><div class="custom-checkbox" id="desktop-th-select-all" role="checkbox" aria-checked="false" aria-label="Select all" tabindex="0">${icon('check', { size: 12, stroke: 3 })}</div></th>`;
  const TH_ACTION = '<th style="text-align: right; padding-right: 24px; min-width: 130px;">Action</th>';
  const THEAD_BOOKINGS = `<tr>${TH_CHECK}<th class="col-main">Customer</th><th>Trip</th><th class="col-secondary">Pax &amp; Duration</th><th>Travel Dates</th><th class="col-secondary">Assigned To</th><th>Status</th><th>Amount</th>${TH_ACTION}</tr>`;
  const THEAD_INQUIRIES = `<tr>${TH_CHECK}<th class="col-main">Customer</th><th>Trip</th><th class="col-secondary">Pax &amp; Nights</th><th>Travel Date</th><th class="col-secondary">Assigned To</th><th>Status</th><th class="col-note" style="min-width: 150px;">Quick Note</th>${TH_ACTION}</tr>`;

  const checkboxCell = (b) => `
    <td style="width: 44px; padding-left: 20px; padding-right: 0;" class="td-checkbox-cell">
      <div class="custom-checkbox card-select-checkbox ${b.selected ? 'checked' : ''}" data-desktop-select-id="${b.id}" role="checkbox" aria-checked="${!!b.selected}" aria-label="Select ${esc(b.guest.name)}" tabindex="0">${b.selected ? icon('check', { size: 12, stroke: 3 }) : ''}</div>
    </td>`;
  const actionCell = (b) => `<td style="text-align: right; padding-right: 20px;"><div class="desktop-action-btn-group">${rowActionButtons(b, 14)}</div></td>`;
  // Same customer cell on both pages: avatar, name + category tag, phone.
  const customerCell = (b) => `
    <td style="padding-left: 14px;">
      <div class="table-booking-cell">
        <div class="table-thumb">${avatar(b.guest.name, 'row-avatar-fill')}</div>
        <div class="table-booking-info">
          <h4 class="cust-name-line"><span class="cust-name">${esc(b.guest.name)}</span>${categoryBadge(b)}</h4>
          <p>${esc(b.guest.phone)}</p>
        </div>
      </div>
    </td>`;
  const assignedCell = (b) => `<td class="col-secondary"><span class="assigned-name">${esc(b.assignedTo.name)}</span></td>`;
  const rowClass = (b, isRowActive) => `${isRowActive ? 'row-selected row-active' : ''} ${b.selected ? 'row-checked' : ''}`;

  function bookingRow(b, isRowActive) {
    return `
      <tr class="${rowClass(b, isRowActive)}" data-desktop-row-id="${b.id}" style="cursor: pointer;">
        ${checkboxCell(b)}${customerCell(b)}
        <td><span class="cell-strong">${esc(b.title)}</span><div class="cell-sub">${b.id} • ${esc(b.destination)}</div></td>
        <td class="col-secondary"><span class="cell-strong">${b.pax} Pax</span><div class="cell-sub">${esc(b.duration)}</div></td>
        <td><span class="cell-date">${esc(b.dates)}</span></td>
        ${assignedCell(b)}
        <td>${statusPill(b)}</td>
        <td><span class="cell-amount">${esc(b.price)}</span></td>
        ${actionCell(b)}
      </tr>`;
  }

  function inquiryRow(b, isRowActive) {
    return `
      <tr class="${rowClass(b, isRowActive)}" data-desktop-row-id="${b.id}" style="cursor: pointer;">
        ${checkboxCell(b)}${customerCell(b)}
        <td><span class="cell-strong">${esc(b.title)}</span><div class="cell-sub">${b.id}</div></td>
        <td class="col-secondary"><span class="cell-strong">${b.pax} Pax</span><div class="cell-sub">${esc(b.duration)}</div></td>
        <td><span class="cell-date">${esc(b.dates)}</span></td>
        ${assignedCell(b)}
        <td>${statusPill(b)}</td>
        <td class="col-note">${quickNote(b)}</td>
        ${actionCell(b)}
      </tr>`;
  }

  function compactCard(b, isCardActive) {
    const inquiry = b.kind === 'inquiry';
    return `
      <div class="compact-booking-card ${isCardActive ? 'active' : ''}" data-compact-booking-id="${b.id}" style="cursor: pointer;">
        <div class="compact-card-top">
          <div class="compact-thumb">${avatar(b.guest.name, 'row-avatar-fill')}</div>
          <div class="compact-info-col">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              ${categoryBadge(b, 'style="font-size: 10px; padding: 2px 6px;"')}
              <span class="compact-dates" style="font-size: 11px; color: #64748B;">${esc(b.dates)}</span>
            </div>
            <h4 class="compact-trip-title" title="${esc(b.guest.name)}">${esc(b.guest.name)}</h4>
            <p class="compact-guest-sub" style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              <span>${esc(b.title)}</span><span style="color: #94A3B8;">•</span><span>${b.pax} Pax</span>
            </p>
          </div>
        </div>
        <div class="compact-card-bottom">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${inquiry ? '' : `<span class="compact-price">${esc(b.price)}</span>`}
            <span class="compact-status-badge ${b.statusClass}"><span class="dot"></span>${esc(b.status)}</span>
          </div>
          <div class="card-action-btns-row" style="gap: 5px;">${rowActionButtons(b, 13, 'width: 28px; height: 28px;')}</div>
        </div>
      </div>`;
  }

  function renderTable() {
    const tbody = container.querySelector('#desktop-table-body');
    if (!tbody) return;
    const inquiry = isInquiries();
    const catValue = selectedCategory === 'ALL' ? '' : selectedCategory;

    const base = bookings.filter(b => matchesSearch(b) && matchesCategory(b, catValue));
    const filtered = base.filter(b => activeTab === allKey() || b.category === activeTab);

    const tabs = tabDefs().map(t => ({ ...t, count: t.key === allKey() ? base.length : base.filter(b => b.category === t.key).length }));
    renderTabs(container.querySelector('#desktop-tabs-host'), { tabs, active: activeTab, variant: 'desktop', attr: 'data-d-tab' });
    renderTabs(container.querySelector('#desktop-compact-tabs-host'), { tabs, active: activeTab, variant: 'compact', attr: 'data-d-tab' });

    const what = inquiry ? 'inquiries' : 'bookings';
    container.querySelectorAll('#desktop-table-search-input, #desktop-compact-search-input').forEach(i => { i.placeholder = `Search ${what}...`; });
    container.querySelector('#desktop-thead').innerHTML = inquiry ? THEAD_INQUIRIES : THEAD_BOOKINGS;

    const compact = container.querySelector('#desktop-compact-list-items');
    const keepScroll = compact ? compact.scrollTop : 0;

    if (inquiry && !inquiryState.loaded) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 48px; color: #94A3B8;">Loading inquiries...</td></tr>';
      if (compact) compact.innerHTML = '';
    } else if (filtered.length === 0) {
      tbody.innerHTML = emptyState({ title: `No ${what} found`, text: 'No results matching your query. Try resetting filters.', colspanRow: 10 });
      if (compact) compact.innerHTML = emptyState({ title: `No ${what} found`, text: 'Try resetting filters.', resetId: 'btn-reset-filters-compact' });
    } else {
      tbody.innerHTML = filtered.map(b => (inquiry ? inquiryRow : bookingRow)(b, activeBooking && activeBooking.id === b.id)).join('');
      if (compact) compact.innerHTML = filtered.map(b => compactCard(b, activeBooking && activeBooking.id === b.id)).join('');
    }
    if (compact) compact.scrollTop = keepScroll;

    const selectedCount = bookings.filter(b => b.selected).length;
    updateBulkBar(container, 'desktop', selectedCount);
    const thAll = container.querySelector('#desktop-th-select-all');
    if (thAll) { thAll.classList.toggle('checked', selectedCount > 0); thAll.setAttribute('aria-checked', selectedCount > 0); }
  }

  // Open & Close Detail Pane (Outlook Inline Split View)
  function openDrawer(booking) {
    activeBooking = booking;
    isDetailDrawerOpen = true;
    renderDetailPanel();
    const split = container.querySelector('#desktop-workspace-split');
    const drawer = container.querySelector('#desktop-details-drawer');
    split.classList.add('has-open-detail');
    drawer.classList.add('open');
    renderTable();
    container.querySelector('#desktop-compact-list-items .compact-booking-card.active')?.scrollIntoView({ block: 'nearest' });
  }

  function closeDrawer() {
    activeBooking = null;
    isDetailDrawerOpen = false;
    const split = container.querySelector('#desktop-workspace-split');
    const drawer = container.querySelector('#desktop-details-drawer');
    split.classList.remove('has-open-detail');
    drawer.classList.remove('open');
    renderTable();
  }

  // Render Details inside Drawer
  function renderDetailPanel() {
    const headerEl = container.querySelector('#desktop-sheet-header');
    const bodyEl = container.querySelector('#desktop-sheet-body');
    const countBadge = container.querySelector('#desktop-guest-count-badge');
    if (!headerEl || !bodyEl || !activeBooking) return;

    const b = activeBooking;
    if (countBadge) countBadge.textContent = b.guests.length;

    // Header: Unified, comprehensive Trip & Booking Header
    const initials = b.customer?.initials || (b.guest?.name?.split(' ').map(n=>n[0]).join('') || 'CU');
    const custName = b.customer?.name || b.guest?.name || 'Customer';

    // Header: Unified Customer Profile Header for ALL tabs: Customer Details, Guests, Itinerary, Updates
    headerEl.innerHTML = `
      <div class="sheet-drag-handle-bar desktop-sheet-top-bar" style="display: flex; justify-content: flex-end; align-items: center; padding: 12px 18px 0 18px; background: #FFFFFF;">
        <button class="sheet-close-btn" id="close-desktop-detail-btn" title="Close Drawer (Esc)" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="sheet-customer-header">
        <div class="customer-avatar-badge">${initials}</div>
        <div class="customer-header-info">
          <div class="customer-title-row">
            <h2 class="customer-name-title">${custName}</h2>
            <span class="status-pill ${b.statusClass}">
              <span class="dot"></span>
              ${b.status}
            </span>
          </div>
          <p class="customer-trip-subtitle">${b.title}</p>
          <div class="customer-meta-chips">
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              ${b.pax} Pax
            </span>
            <span class="meta-dot">•</span>
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              ${b.duration}
            </span>
            <span class="meta-dot">•</span>
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              ${b.dates}
            </span>
          </div>
        </div>
      </div>
    `;

    // Re-bind close button
    const closeBtn = headerEl.querySelector('#close-desktop-detail-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Body content by tab
    if (activeDetailTab === 'customer-details') {
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
        shortDetails: b.notes || 'Trip details logged into operations queue.',
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
                <span class="info-value-bold">${c.name}</span>
              </div>
              <!-- Right Column: Row 1 -->
              <div class="info-cell info-cell-email">
                <span class="info-label">Email</span>
                <div class="contact-value-row">
                  <span class="info-value-text email-text-val" title="${c.email}">${c.email}</span>
                  <button class="mini-icon-btn btn-mail-blue" title="Send Email" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Drafting email to ${c.email}...', type: 'info' }}))">
                    ${icon('mail', { size: 12 })}
                  </button>
                </div>
              </div>

              <!-- Left Column: Row 2 -->
              <div class="info-cell info-cell-contact">
                <span class="info-label">Primary Contact</span>
                <div class="contact-value-row">
                  <span class="info-value-bold phone-number-val">${c.phone}</span>
                  <div class="contact-action-btns">
                    <button class="mini-icon-btn btn-call-green" title="Call ${c.phone}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${c.name} (${c.phone})...', type: 'info' }}))">
                      ${icon('phone', { size: 12, stroke: 2.5 })}
                    </button>
                    <button class="mini-icon-btn btn-wa-green" title="WhatsApp" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp chat with ${c.name}...', type: 'success' }}))">
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
                <span class="info-value-text">${c.leadSource || 'Website'}</span>
              </div>

              <!-- Left Column: Row 3 -->
              <div class="info-cell">
                <span class="info-label">Travel Dates</span>
                <span class="info-value-text">${c.travelDates || b.dates}</span>
              </div>
              <!-- Right Column: Row 3 -->
              <div class="info-cell">
                <span class="info-label">Location</span>
                <span class="info-value-text">${c.location || 'New Delhi, Delhi'}</span>
              </div>

              <!-- Left Column: Row 4 -->
              <div class="info-cell">
                <span class="info-label">Preferred Destination</span>
                <span class="info-value-text">${c.preferredDestination || b.destination}</span>
              </div>
              <!-- Right Column: Row 4 -->
              <div class="info-cell">
                <span class="info-label">Budget (Est.)</span>
                <span class="info-value-bold" style="color: #0F172A;">${c.budgetEst || b.price}</span>
              </div>

              <!-- Left Column: Row 5 -->
              <div class="info-cell">
                <span class="info-label">Customer Type</span>
                <span class="info-value-text">${c.customerType || 'Family (' + b.pax + ' Pax)'}</span>
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
              <p class="short-details-text">${c.shortDetails || b.notes || 'Trip details logged into operations queue.'}</p>
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
              ${b.kind === 'inquiry' ? '' : `<button class="btn-add-followup" id="btn-add-followup-action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" x2="12" y1="5" y2="19"/>
                  <line x1="5" x2="19" y1="12" y2="12"/>
                </svg>
                Add Follow-up
              </button>`}
            </div>

            <div class="lead-journey-timeline">
              ${renderJourneyItems(journeyFor(c))}
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
      const visibleGuests = showAllGuests ? filteredGuests : filteredGuests.slice(0, 4);
      const remainingCount = filteredGuests.length - 4;
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
            <button class="special-req-edit-btn" id="desktop-edit-special-req-btn">
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
            <input type="text" placeholder="Search guests in booking..." id="desktop-guest-search-input" value="${guestSearchQuery}" />
          </div>
          <button class="add-guest-pill-btn" id="desktop-add-guest-btn">
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
                  <h4>${g.name}</h4>
                  <p>Age ${g.age} ${g.role ? `• ${g.role}` : ''}</p>
                </div>
              </div>
              <div class="guest-right-actions">
                <button class="circle-action-btn btn-phone" title="Call ${g.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${g.name} (${g.phone})...', type: 'info' }}))">
                  ${icon('phone', { size: 14, stroke: 2.2 })}
                </button>
                <button class="circle-action-btn btn-more" data-guest-menu="${g.id}" title="More options for ${g.name}" aria-label="More options">
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
            <button class="more-guests-toggle-btn" id="desktop-toggle-more-guests-btn">
              <span>${showAllGuests ? 'Hide additional guests' : `+${remainingCount} more guests`}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${showAllGuests ? '18 15 12 9 6 15' : '9 18 15 12 9 6'}"/>
              </svg>
            </button>
          ` : ''}
        </div>
      `;

      // Bind guest search & toggle
      const gInput = container.querySelector('#desktop-guest-search-input');
      if (gInput) {
        gInput.addEventListener('input', (e) => {
          guestSearchQuery = e.target.value;
          renderDetailPanel();
        });
      }

      const moreBtn = container.querySelector('#desktop-toggle-more-guests-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', () => {
          showAllGuests = !showAllGuests;
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
        <div class="itinerary-tab-content">
          <div class="itinerary-section-header-bar">
            <div class="section-header-left" style="display: flex; align-items: center; gap: 8px;">
              <div class="section-icon-circle blue-circle" style="width: 28px; height: 28px; border-radius: 50%; background: #EFF6FF; display: flex; align-items: center; justify-content: center; color: #2563EB;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
              </div>
              <h3 style="font-size: 14.5px; font-weight: 700; color: #0F172A; margin: 0;">Day-wise Schedule</h3>
            </div>
            <button class="btn-add-event-pill" id="desktop-add-event-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" x2="12" y1="5" y2="19"/>
                <line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
              + Add Event
            </button>
          </div>

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
                  <div class="itinerary-card-item ${item.completed ? 'is-completed' : ''}" data-desktop-itinerary-item-id="${item.id}">
                    <div class="item-left-content">
                      ${getItemIcon(item.type)}
                      <div class="item-text-info">
                        <h4 class="item-text-title">${item.title}</h4>
                        <p class="item-text-sub">${item.subtitle}</p>
                      </div>
                    </div>
                    <div class="item-right-content">
                      ${item.completed ? `
                        <span class="completed-pill-badge" title="Completed">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Completed
                        </span>
                      ` : ''}
                      ${item.assigned && item.assigned.isAssigned ? `
                        <span class="assigned-pill-badge">Assigned</span>
                        <img src="${item.assigned.avatar}" class="assigned-avatar-mini" alt="${item.assigned.name}" title="Assigned to ${item.assigned.name}" />
                      ` : ''}
                      <button class="item-menu-btn" data-trigger-desktop-item-menu="${item.id}" data-trigger-item-menu="${item.id}" title="Actions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <circle cx="12" cy="12" r="1.5"/>
                          <circle cx="12" cy="5" r="1.5"/>
                          <circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>

                      ${openDropdownItemId === item.id ? `
                        <div class="item-dropdown-menu" id="desktop-active-item-dropdown">
                          <button class="dropdown-item-btn" data-desktop-dropdown-act="assign" data-dropdown-act="assign" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <line x1="19" x2="19" y1="8" y2="14"/>
                              <line x1="22" x2="16" y1="11" y2="11"/>
                            </svg>
                            <span>Assign</span>
                          </button>
                          <button class="dropdown-item-btn" data-desktop-dropdown-act="details" data-dropdown-act="details" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" x2="8" y1="13" y2="13"/>
                              <line x1="16" x2="8" y1="17" y2="17"/>
                              <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <span>View Details</span>
                          </button>
                          <button class="dropdown-item-btn" data-desktop-dropdown-act="edit" data-dropdown-act="edit" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                              <path d="m15 5 4 4"/>
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button class="dropdown-item-btn" data-desktop-dropdown-act="complete" data-dropdown-act="complete" data-target-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <polyline points="9 12 11 14 15 10"/>
                            </svg>
                            <span>${item.completed ? 'Mark as Incomplete' : 'Mark Complete'}</span>
                          </button>
                          <button class="dropdown-item-btn item-remove" data-desktop-dropdown-act="remove" data-dropdown-act="remove" data-target-id="${item.id}">
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
        </div>
      `;
    } else if (activeDetailTab === 'updates') {
      bodyEl.innerHTML = `
        <div class="updates-list">
          ${b.updates.length === 0 ? '<p style="font-size: 13px; color: #94A3B8; text-align: center; padding: 24px 0;">No updates yet.</p>' : ''}
          ${b.updates.map(u => `
            <div class="update-log-card">
              <div class="update-log-header">
                <span class="update-log-title">${u.title}</span>
                <span class="update-log-time">${u.time || ''}</span>
              </div>
              <p class="update-log-desc">${u.desc}</p>
              <div class="update-log-user">By ${u.user}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function switchDetailTab(tab) {
    activeDetailTab = tab;
    container.querySelectorAll('[data-dt-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.dtTab === activeDetailTab);
    });
    renderDetailPanel();
  }

  // Desktop Modal Helpers
  let desktopAssignTab = 'Team Members';
  let desktopSelectedAssignee = null;

  function openDesktopSpecialReqModal() {
    const modal = container.querySelector('#desktop-special-req-modal');
    if (!modal) return;
    renderDesktopSpecialReqModalContent();
    modal.classList.add('open');
  }

  function closeDesktopSpecialReqModal() {
    const modal = container.querySelector('#desktop-special-req-modal');
    if (modal) modal.classList.remove('open');
    renderDetailPanel();
  }

  function renderDesktopSpecialReqModalContent() {
    const listEl = container.querySelector('#desktop-modal-reqs-current-list');
    const presetsEl = container.querySelector('#desktop-modal-presets-chip-grid');
    if (!listEl || !presetsEl || !activeBooking) return;

    activeBooking.specialRequirements = activeBooking.specialRequirements || [];
    const reqs = activeBooking.specialRequirements;

    listEl.innerHTML = reqs.length > 0 ? reqs.map(r => `
      <div class="editable-req-item">
        <div class="editable-req-item-left">
          <span>${getSpecialReqIconSvg(r.icon, r.color || '#2563EB')}</span>
          <span>${r.text}</span>
        </div>
        <button class="btn-delete-req-pill" data-desktop-delete-req-id="${r.id}" title="Remove requirement">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('') : '<p style="font-size: 13px; color: #94A3B8; text-align: center; margin: 6px 0;">No requirements added yet.</p>';

    presetsEl.innerHTML = SPECIAL_REQUIREMENTS_PRESETS.map(p => {
      const alreadyHas = reqs.some(r => r.text.toLowerCase() === p.text.toLowerCase());
      return `
        <button class="preset-chip-btn ${alreadyHas ? 'is-active' : ''}" data-desktop-preset-text="${p.text}" data-desktop-preset-icon="${p.icon}" data-desktop-preset-color="${p.color}">
          ${getSpecialReqIconSvg(p.icon, alreadyHas ? '#2563EB' : p.color)}
          <span>${alreadyHas ? '✓ ' + p.text : '+ ' + p.text}</span>
        </button>
      `;
    }).join('');
  }

  function openDesktopActivityDetailsModal(item) {
    if (!item) return;
    modalActiveItem = item;
    const modal = container.querySelector('#desktop-activity-details-modal');
    const titleText = container.querySelector('#desktop-modal-details-title-text');
    const bodyContent = container.querySelector('#desktop-modal-details-body-content');
    const toggleBtn = container.querySelector('#desktop-btn-modal-details-toggle-complete');

    if (titleText) titleText.textContent = item.title;
    if (toggleBtn) {
      toggleBtn.textContent = item.completed ? 'Mark Incomplete' : 'Mark Completed ✓';
      toggleBtn.style.color = item.completed ? '#DC2626' : '#16A34A';
    }

    let dayLabel = 'Day 1';
    let dateLabel = '';
    activeBooking.itineraryDays?.forEach(d => {
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
              <button class="action-pill-btn" id="desktop-btn-modal-details-assign-now" style="background: #2563EB; color: #FFFFFF; border: none; padding: 5px 12px; font-size: 12px;">Assign Now</button>
            </div>
          `}
        </div>
      `;
    }

    if (modal) modal.classList.add('open');
  }

  function closeDesktopActivityDetailsModal() {
    const modal = container.querySelector('#desktop-activity-details-modal');
    if (modal) modal.classList.remove('open');
  }

  function openDesktopEditActivityModal(item) {
    if (!item) return;
    modalActiveItem = item;
    const modal = container.querySelector('#desktop-edit-activity-modal');
    const titleInput = container.querySelector('#desktop-modal-edit-act-title');
    const subtitleInput = container.querySelector('#desktop-modal-edit-act-subtitle');
    const typeSelect = container.querySelector('#desktop-modal-edit-act-type');

    if (titleInput) titleInput.value = item.title;
    if (subtitleInput) subtitleInput.value = item.subtitle;
    if (typeSelect) typeSelect.value = item.type || 'sightseeing';

    if (modal) modal.classList.add('open');
  }

  function closeDesktopEditActivityModal() {
    const modal = container.querySelector('#desktop-edit-activity-modal');
    if (modal) modal.classList.remove('open');
  }

  function openDesktopAddEventModal() {
    const modal = container.querySelector('#desktop-add-event-modal');
    const daySelect = container.querySelector('#desktop-modal-add-event-day-select');
    const titleInput = container.querySelector('#desktop-modal-add-event-title');
    const subtitleInput = container.querySelector('#desktop-modal-add-event-subtitle');

    if (titleInput) titleInput.value = '';
    if (subtitleInput) subtitleInput.value = '';

    if (daySelect && activeBooking.itineraryDays) {
      daySelect.innerHTML = activeBooking.itineraryDays.map((d, idx) => `
        <option value="${idx}">${d.day} (${d.date})</option>
      `).join('') + `<option value="new">+ Create New Day</option>`;
    }

    if (modal) modal.classList.add('open');
  }

  function closeDesktopAddEventModal() {
    const modal = container.querySelector('#desktop-add-event-modal');
    if (modal) modal.classList.remove('open');
  }

  let isBulkAssign = false;
  let bulkSelectedBookings = [];

  function openDesktopBulkAssignModal(selectedBookings) {
    if (!selectedBookings || selectedBookings.length === 0) return;
    isBulkAssign = true;
    bulkSelectedBookings = selectedBookings;
    openDesktopAssignModal({
      title: `${selectedBookings.length} Bookings Selected`,
      subtitle: selectedBookings.map(b => b.id).join(', '),
      type: 'tour'
    });
  }

  function openDesktopAssignModal(item) {
    if (!item) return;
    modalActiveItem = item;
    const modal = container.querySelector('#desktop-assign-modal');
    const actTitle = container.querySelector('#desktop-assign-activity-title');
    const actSubtitle = container.querySelector('#desktop-assign-activity-subtitle');
    const actCat = container.querySelector('#desktop-assign-activity-category');
    if (actTitle) actTitle.textContent = item.title;
    if (actSubtitle) actSubtitle.textContent = item.subtitle;
    if (actCat) actCat.textContent = (item.type || 'activity').toUpperCase();

    renderDesktopAssignList(desktopAssignTab);
    if (modal) modal.classList.add('open');
  }

  function closeDesktopAssignModal() {
    isBulkAssign = false;
    bulkSelectedBookings = [];
    const modal = container.querySelector('#desktop-assign-modal');
    if (modal) modal.classList.remove('open');
  }

  function renderDesktopAssignList(tab) {
    desktopAssignTab = tab;
    const listEl = container.querySelector('#desktop-assign-picker-list');
    if (!listEl) return;

    let items = [];
    if (tab === 'Team Members') {
      items = teamMembers.map(m => ({ id: m.id, name: m.name, sub: m.role, avatar: m.avatar }));
    } else if (tab === 'Vendors') {
      items = vendors.map(v => ({ id: v.id, name: v.name, sub: v.service, avatar: v.image }));
    } else {
      items = contacts.map(c => ({ id: c.id, name: c.name, sub: c.role, avatar: c.avatar }));
    }

    if (!desktopSelectedAssignee && items.length > 0) {
      desktopSelectedAssignee = items[0];
    }

    listEl.innerHTML = items.map(item => {
      const isSel = desktopSelectedAssignee?.id === item.id;
      return `
        <div class="vendor-item-card ${isSel ? 'selected' : ''}" data-desktop-assign-select-id="${item.id}" style="padding: 8px 12px; cursor: pointer;">
          <div class="vendor-item-left" style="gap: 10px;">
            <div class="custom-radio ${isSel ? 'checked' : ''}">
              ${isSel ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <img src="${item.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
            <div class="vendor-info">
              <h4 style="font-size: 13.5px; margin: 0;">${item.name}</h4>
              <p style="font-size: 12px; color: #64748B; margin: 0;">${item.sub}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Bind All Event Listeners
  function bindEvents() {
    // Search inputs in top header, table toolbar, and compact list
    const topSearch = container.querySelector('#desktop-search-input');
    const topClear = container.querySelector('#desktop-search-clear');
    const tableSearch = container.querySelector('#desktop-table-search-input');
    const compactSearch = container.querySelector('#desktop-compact-search-input');

    function syncSearch(val) {
      searchQuery = val;
      if (topSearch && topSearch.value !== val) topSearch.value = val;
      if (tableSearch && tableSearch.value !== val) tableSearch.value = val;
      if (compactSearch && compactSearch.value !== val) compactSearch.value = val;
      if (topClear) topClear.style.display = val ? 'block' : 'none';
      if (currentPage() === 'inquiries') {
        setParams({ q: val }, { push: false });
        return;
      }
      setParams({ q: val }, { push: false, silent: true });
      renderTable();
    }

    if (topSearch) {
      topSearch.addEventListener('input', (e) => syncSearch(e.target.value.trim()));
    }
    if (topClear) {
      topClear.addEventListener('click', () => syncSearch(''));
    }
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => syncSearch(e.target.value.trim()));
    }
    if (compactSearch) {
      compactSearch.addEventListener('input', (e) => syncSearch(e.target.value.trim()));
    }

    // Category dropdown (shared component), persisted in the query string
    const categoryFilter = createCategoryFilter({ onChange: (v) => setParams({ category: v || null, tab: null }) });
    categoryFilter.attach(container.querySelector('#desktop-filter-slot'));
    categoryFilter.attach(container.querySelector('#desktop-compact-filter-slot'), 'dd-compact');

    function applyParams() {
      const q = getParams();
      searchQuery = q.q || '';
      activeTab = tabDefs().some(t => t.key === q.tab) ? q.tab : allKey();
      selectedCategory = q.category || 'ALL';
      categoryFilter.setValue(q.category || '');
      [topSearch, tableSearch, compactSearch].forEach((el) => { if (el && document.activeElement !== el) el.value = searchQuery; });
      if (topClear) topClear.style.display = searchQuery ? 'block' : 'none';
      renderTable();
    }

    // Page routing: Bookings <-> Inquiries share one workspace (table, split view, detail pane)
    function route() {
      const next = currentPage();
      const changed = next !== page;
      page = next;
      if (changed) {
        if (isDetailDrawerOpen) closeDrawer();
        bookings = page === 'inquiries' ? inquiryState.list : bookingsData;
        bookings.forEach(b => { b.selected = false; });
        activeTab = allKey();
      }
      container.querySelector('#nav-bookings')?.classList.toggle('active', page === 'bookings');
      container.querySelector('#nav-inquiries')?.classList.toggle('active', page === 'inquiries');
      if (topSearch) topSearch.placeholder = 'Search by name, trip, destination, or phone...';
      container.querySelector('#desktop-confirm-booking-btn') && (container.querySelector('#desktop-confirm-booking-btn').textContent = page === 'inquiries' ? 'Confirm Inquiry' : 'Confirm Booking');
      applyParams();
    }
    subscribePage(route);
    subscribeInquiries(() => {
      if (page !== 'inquiries') return;
      bookings = inquiryState.list;
      if (activeBooking) activeBooking = bookings.find(b => b.id === activeBooking.id) || null;
      renderTable();
      if (isDetailDrawerOpen && activeBooking) renderDetailPanel();
    });
    subscribeFollowUps(() => {
      if (isDetailDrawerOpen && activeDetailTab === 'customer-details' && activeBooking) renderDetailPanel();
    });
    window.addEventListener('layout-changed', () => { if (isDetailDrawerOpen) closeDrawer(); });
    container.addEventListener('click', (e) => { if (e.target.id === 'desktop-workspace-split' && isDetailDrawerOpen) closeDrawer(); });
    window.addEventListener('bookings-changed', () => { renderTable(); if (isDetailDrawerOpen && activeBooking) renderDetailPanel(); });
    loadFollowUps();
    loadInquiries();
    syncBookingPayments().then(() => renderTable());

    container.querySelectorAll('a.sidebar-nav-item[href="#bookings"], a.sidebar-nav-item[href="#inquiries"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(a.getAttribute('href').slice(1));
      });
    });

    // Bulk bar: select all / clear / search / filter / Assign
    bindBulkBar(container, 'desktop', {
      onSelectAll: () => { const any = bookings.some(b => !b.selected); bookings.forEach(b => { b.selected = any; }); renderTable(); },
      onClear: () => { bookings.forEach(b => { b.selected = false; }); renderTable(); },
      onAssign: () => assignSelected(),
    });

    function startAssign(list) {
      openAssign({
        kind: page === 'inquiries' ? 'inquiry' : 'booking',
        items: assignItems(list),
        onDone: (who) => {
          if (page === 'bookings') {
            list.forEach(b => { b.assignedTo = { name: who.name, avatar: who.avatar, role: who.role }; b.assignedStatus = 'Assigned'; });
            window.dispatchEvent(new Event('bookings-changed'));
          }
          bookings.forEach(b => { b.selected = false; });
          renderTable();
        },
      });
    }

    function assignSelected() {
      const sel = bookings.filter(b => b.selected);
      if (!sel.length) return toast('Select at least 1 item to assign.', 'info');
      startAssign(sel);
    }

    function setPayment(b, status) {
      b.status = status;
      b.statusClass = status === 'Paid' ? 'status-paid' : 'status-pending';
      window.dispatchEvent(new Event('bookings-changed'));
      savePayment(b.id, status).then(ok => toast(ok ? `${b.id} marked as ${status === 'Paid' ? 'Paid' : 'Unpaid'}` : 'Updated here, but saving to the server failed.', ok ? 'success' : 'warning'));
    }

    function runRowMenu(b, key) {
      if (key === 'view') openDrawer(b);
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

    container.addEventListener('submit', async (e) => {
      const form = e.target.closest('[data-quick-note]');
      if (!form) return;
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input.value.trim()) { input.focus(); return; } // empty: just focus the field
      if (await saveQuickNote(form.dataset.quickNote, input.value)) input.value = '';
    });

    container.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-d-tab]');
      if (tab) { setParams({ tab: tab.dataset.dTab === allKey() ? null : tab.dataset.dTab }); return; }
      if (e.target.closest('.quick-note')) { e.stopPropagation(); return; }
      const more = e.target.closest('[data-row-menu]');
      if (more) {
        e.stopPropagation();
        const b = bookings.find(x => x.id === more.dataset.rowMenu);
        if (b) openRowMenu(more, rowMenuItems(b), (key) => runRowMenu(b, key));
      }
    }, true);

    route();

    // Detail Panel Tabs
    container.querySelectorAll('[data-dt-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        switchDetailTab(btn.dataset.dtTab);
      });
    });

    // Backdrop click closes drawer
    const backdrop = container.querySelector('#desktop-drawer-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Keyboard Esc closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDetailDrawerOpen) {
        closeDrawer();
      }
    });

    // Table Clicks & Row Selection
    container.addEventListener('click', (e) => {
      // Drawer Close Button (delegated)
      if (e.target.closest('#close-desktop-detail-btn')) {
        closeDrawer();
        return;
      }
      // Reset filters button in empty state
      if (e.target.closest('#btn-reset-filters') || e.target.closest('#btn-reset-filters-compact') || e.target.closest('#btn-clear-table-search')) {
        setParams({ q: null, tab: null, category: null });
        return;
      }

      // Close dropdown if clicked outside
      if (!e.target.closest('.item-right-content') && openDropdownItemId) {
        openDropdownItemId = null;
        renderDetailPanel();
      }

      // Desktop Itinerary Three Dots `⋮` Button
      const menuTrigger = e.target.closest('[data-trigger-desktop-item-menu], [data-trigger-item-menu]');
      if (menuTrigger) {
        e.stopPropagation();
        const itemId = menuTrigger.getAttribute('data-trigger-desktop-item-menu') || 
                       menuTrigger.getAttribute('data-trigger-item-menu') || 
                       menuTrigger.dataset.triggerDesktopItemMenu || 
                       menuTrigger.dataset.triggerItemMenu;
        openDropdownItemId = openDropdownItemId === itemId ? null : itemId;
        renderDetailPanel();
        return;
      }

      // Desktop Itinerary Dropdown Menu Actions
      const dropdownAct = e.target.closest('[data-desktop-dropdown-act], [data-dropdown-act]');
      if (dropdownAct) {
        e.stopPropagation();
        const act = dropdownAct.getAttribute('data-desktop-dropdown-act') || 
                    dropdownAct.getAttribute('data-dropdown-act') || 
                    dropdownAct.dataset.desktopDropdownAct || 
                    dropdownAct.dataset.dropdownAct;
        const itemId = dropdownAct.getAttribute('data-target-id') || 
                       dropdownAct.dataset.targetId;

        let foundItem = null;
        activeBooking?.itineraryDays?.forEach(d => {
          const item = d.items.find(i => i.id === itemId);
          if (item) foundItem = item;
        });

        openDropdownItemId = null;
        renderDetailPanel();

        if (act === 'assign') {
          openDesktopAssignModal(foundItem);
        } else if (act === 'details') {
          openDesktopActivityDetailsModal(foundItem);
        } else if (act === 'edit') {
          openDesktopEditActivityModal(foundItem);
        } else if (act === 'complete') {
          if (foundItem) {
            foundItem.completed = !foundItem.completed;
            renderDetailPanel();
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { 
                message: foundItem.completed ? `Marked "${foundItem.title}" as Complete! ✓` : `Marked "${foundItem.title}" as Scheduled`,
                type: 'success' 
              }
            }));
          }
        } else if (act === 'remove') {
          if (foundItem) {
            activeBooking?.itineraryDays?.forEach(d => {
              const idx = d.items.indexOf(foundItem);
              if (idx !== -1) d.items.splice(idx, 1);
            });
            renderDetailPanel();
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: { message: `Removed "${foundItem.title}" from itinerary`, type: 'info' }
            }));
          }
        }
        return;
      }

      // Desktop Special Requirements Modal Triggers & Actions
      if (e.target.closest('#desktop-edit-special-req-btn')) {
        openDesktopSpecialReqModal();
        return;
      }

      const delReqBtn = e.target.closest('[data-desktop-delete-req-id]');
      if (delReqBtn) {
        const reqId = delReqBtn.dataset.desktopDeleteReqId;
        if (activeBooking) {
          activeBooking.specialRequirements = activeBooking.specialRequirements.filter(r => r.id !== reqId);
          renderDesktopSpecialReqModalContent();
        }
        return;
      }

      const presetBtn = e.target.closest('[data-desktop-preset-text]');
      if (presetBtn) {
        const text = presetBtn.dataset.desktopPresetText;
        const icon = presetBtn.dataset.desktopPresetIcon;
        const color = presetBtn.dataset.desktopPresetColor;
        if (activeBooking) {
          activeBooking.specialRequirements = activeBooking.specialRequirements || [];
          const existingIdx = activeBooking.specialRequirements.findIndex(r => r.text.toLowerCase() === text.toLowerCase());
          if (existingIdx !== -1) {
            activeBooking.specialRequirements.splice(existingIdx, 1);
          } else {
            activeBooking.specialRequirements.push({ id: 'SR-' + Date.now(), icon, text, color });
          }
          renderDesktopSpecialReqModalContent();
        }
        return;
      }

      if (e.target.closest('#desktop-btn-add-custom-req')) {
        const input = container.querySelector('#desktop-modal-custom-req-input');
        const val = input?.value?.trim();
        if (val && activeBooking) {
          activeBooking.specialRequirements = activeBooking.specialRequirements || [];
          activeBooking.specialRequirements.push({
            id: 'SR-' + Date.now(),
            icon: 'leaf',
            text: val,
            color: '#2563EB'
          });
          input.value = '';
          renderDesktopSpecialReqModalContent();
        }
        return;
      }

      if (e.target.closest('#desktop-btn-done-special-req') || e.target.closest('#close-desktop-special-req-modal-btn')) {
        closeDesktopSpecialReqModal();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Special requirements updated successfully!', type: 'success' }
        }));
        return;
      }

      // Desktop Add Event Modal Triggers & Actions
      if (e.target.closest('#desktop-add-event-btn')) {
        openDesktopAddEventModal();
        return;
      }

      if (e.target.closest('#desktop-btn-cancel-add-event') || e.target.closest('#close-desktop-modal-add-event-btn')) {
        closeDesktopAddEventModal();
        return;
      }

      if (e.target.closest('#desktop-btn-submit-add-event')) {
        const dayVal = container.querySelector('#desktop-modal-add-event-day-select')?.value;
        const title = container.querySelector('#desktop-modal-add-event-title')?.value?.trim();
        const subtitle = container.querySelector('#desktop-modal-add-event-subtitle')?.value?.trim();
        const type = container.querySelector('#desktop-modal-add-event-type')?.value || 'sightseeing';

        if (!title) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Please enter an event title.', type: 'warning' }
          }));
          return;
        }

        const newEvent = {
          id: 'IT-EVT-' + Date.now(),
          type,
          icon: type === 'transport' ? 'bus' : type === 'hotel' ? 'bed' : type === 'activity' ? 'raft' : type === 'food' ? 'restaurant' : 'camera',
          title,
          subtitle: subtitle || 'Scheduled event',
          assigned: null,
          completed: false
        };

        if (activeBooking) {
          activeBooking.itineraryDays = activeBooking.itineraryDays || [];

          if (dayVal === 'new') {
            const nextDayNum = activeBooking.itineraryDays.length + 1;
            activeBooking.itineraryDays.push({
              day: `Day ${nextDayNum}`,
              date: 'TBD',
              items: [newEvent]
            });
          } else {
            const dIdx = parseInt(dayVal, 10);
            if (activeBooking.itineraryDays[dIdx]) {
              activeBooking.itineraryDays[dIdx].items.push(newEvent);
            }
          }

          closeDesktopAddEventModal();
          renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Added "${title}" to itinerary!`, type: 'success' }
          }));
        }
        return;
      }

      // Desktop Activity Details Modal Actions
      if (e.target.closest('#desktop-btn-modal-details-toggle-complete')) {
        if (modalActiveItem) {
          modalActiveItem.completed = !modalActiveItem.completed;
          openDesktopActivityDetailsModal(modalActiveItem);
          renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { 
              message: modalActiveItem.completed ? `Marked "${modalActiveItem.title}" as Complete! ✓` : `Marked as Scheduled`,
              type: 'success' 
            }
          }));
        }
        return;
      }

      if (e.target.closest('#desktop-btn-modal-details-edit-trigger')) {
        const itemToEdit = modalActiveItem;
        closeDesktopActivityDetailsModal();
        openDesktopEditActivityModal(itemToEdit);
        return;
      }

      if (e.target.closest('#desktop-btn-modal-details-assign-now')) {
        const itemToAssign = modalActiveItem;
        closeDesktopActivityDetailsModal();
        openDesktopAssignModal(itemToAssign);
        return;
      }

      if (e.target.closest('#desktop-btn-modal-details-close-btn') || e.target.closest('#close-desktop-modal-details-btn')) {
        closeDesktopActivityDetailsModal();
        return;
      }

      // Desktop Edit Activity Modal Actions
      if (e.target.closest('#desktop-btn-cancel-edit-activity') || e.target.closest('#close-desktop-modal-edit-activity-btn')) {
        closeDesktopEditActivityModal();
        return;
      }

      if (e.target.closest('#desktop-btn-save-edit-activity')) {
        const title = container.querySelector('#desktop-modal-edit-act-title')?.value?.trim();
        const subtitle = container.querySelector('#desktop-modal-edit-act-subtitle')?.value?.trim();
        const type = container.querySelector('#desktop-modal-edit-act-type')?.value;

        if (title && modalActiveItem) {
          modalActiveItem.title = title;
          if (subtitle) modalActiveItem.subtitle = subtitle;
          if (type) modalActiveItem.type = type;
          closeDesktopEditActivityModal();
          renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Updated "${title}" activity!`, type: 'success' }
          }));
        }
        return;
      }

      // Desktop Assign Modal Actions
      if (e.target.closest('#desktop-assign-tab-team')) {
        container.querySelectorAll('.assign-tabs-row .assign-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('#desktop-assign-tab-team').classList.add('active');
        renderDesktopAssignList('Team Members');
        return;
      }
      if (e.target.closest('#desktop-assign-tab-vendors')) {
        container.querySelectorAll('.assign-tabs-row .assign-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('#desktop-assign-tab-vendors').classList.add('active');
        renderDesktopAssignList('Vendors');
        return;
      }
      if (e.target.closest('#desktop-assign-tab-contacts')) {
        container.querySelectorAll('.assign-tabs-row .assign-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.closest('#desktop-assign-tab-contacts').classList.add('active');
        renderDesktopAssignList('Contacts');
        return;
      }

      const assignCard = e.target.closest('[data-desktop-assign-select-id]');
      if (assignCard) {
        const id = assignCard.dataset.desktopAssignSelectId;
        let pool = desktopAssignTab === 'Team Members' ? teamMembers : desktopAssignTab === 'Vendors' ? vendors : contacts;
        const found = pool.find(item => item.id === id);
        if (found) {
          desktopSelectedAssignee = {
            id: found.id,
            name: found.name,
            avatar: found.avatar || found.image
          };
          renderDesktopAssignList(desktopAssignTab);
        }
        return;
      }

      if (e.target.closest('#desktop-btn-confirm-assign')) {
        if (isBulkAssign && desktopSelectedAssignee) {
          const count = bulkSelectedBookings.length;
          const assigneeName = desktopSelectedAssignee.name;
          bulkSelectedBookings.forEach(b => {
            b.assignedTo = {
              name: desktopSelectedAssignee.name,
              avatar: desktopSelectedAssignee.avatar,
              role: desktopSelectedAssignee.sub || 'Operations Lead'
            };
            b.assignedStatus = 'Assigned';
            b.selected = false;
          });
          isBulkAssign = false;
          bulkSelectedBookings = [];
          closeDesktopAssignModal();
          renderTable();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Assigned ${assigneeName} to ${count} booking(s)!`, type: 'success' }
          }));
          return;
        }

        if (modalActiveItem && desktopSelectedAssignee) {
          modalActiveItem.assigned = {
            isAssigned: true,
            name: desktopSelectedAssignee.name,
            avatar: desktopSelectedAssignee.avatar
          };
          closeDesktopAssignModal();
          renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Assigned ${desktopSelectedAssignee.name} to "${modalActiveItem.title}"!`, type: 'success' }
          }));
        }
        return;
      }

      if (e.target.closest('#desktop-btn-cancel-assign') || e.target.closest('#close-desktop-assign-modal-btn')) {
        closeDesktopAssignModal();
        return;
      }

      // Checkbox click on booking row (Exactly as Mobile)
      const chk = e.target.closest('[data-desktop-select-id]');
      if (chk) {
        e.stopPropagation();
        const id = chk.dataset.desktopSelectId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          b.selected = !b.selected;
          renderTable();
        }
        return;
      }

      // Select All Checkbox Trigger (in selection bar or thead th)
      const selectAllTrigger = e.target.closest('#desktop-select-all-box, #desktop-th-select-all');
      if (selectAllTrigger) {
        e.stopPropagation();
        const anyUnselected = bookings.some(b => !b.selected);
        bookings.forEach(b => b.selected = anyUnselected);
        renderTable();
        return;
      }

      // Quick Call Action on Desktop (Table row or Compact card)
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
            detail: { message: `Dialing ${b.guest.name} (${rawPhone})...`, type: 'info' }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Phone number not available for this guest.', type: 'warning' }
          }));
        }
        return;
      }

      // Quick WhatsApp Action on Desktop (Table row or Compact card)
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

      // Click on Compact Master List Card (Outlook Split View)
      const compactCard = e.target.closest('[data-compact-booking-id]');
      if (compactCard) {
        const id = compactCard.dataset.compactBookingId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          openDrawer(b);
        }
        return;
      }

      // Expand to Full Table View Button
      if (e.target.closest('#desktop-btn-expand-table')) {
        closeDrawer();
        return;
      }

      // Action button "View" or Row Click -> Open Popup Drawer!
      const openBtn = e.target.closest('[data-open-detail]');
      const row = e.target.closest('[data-desktop-row-id]');
      if (openBtn || row) {
        // If clicking checkbox cell or action buttons, do not open drawer
        if (e.target.closest('.td-checkbox-cell') || e.target.closest('[data-desktop-select-id]') || e.target.closest('[data-action-call]') || e.target.closest('[data-action-whatsapp]') || e.target.closest('[data-row-menu]') || e.target.closest('.quick-note')) {
          return;
        }

        const id = openBtn ? openBtn.dataset.openDetail : row.dataset.desktopRowId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          openDrawer(b);
        }
        return;
      }

      // Open Edit Customer Modal (App-based modal, no browser popups)
      if (e.target.closest('#desktop-edit-customer-btn') || e.target.closest('#btn-edit-customer')) {
        if (!activeBooking) return;
        const c = activeBooking.customer || {
          name: activeBooking.guest.name,
          phone: activeBooking.guest.phone,
          email: activeBooking.guest.email,
          location: 'New Delhi, Delhi',
          travelDates: `${activeBooking.dates} 2024`,
          budgetEst: activeBooking.price,
          status: activeBooking.status,
          shortDetails: activeBooking.notes || ''
        };
        const modal = container.querySelector('#desktop-edit-customer-modal');
        if (modal) {
          container.querySelector('#desktop-edit-cust-name').value = c.name || '';
          container.querySelector('#desktop-edit-cust-phone').value = c.phone || '';
          container.querySelector('#desktop-edit-cust-email').value = c.email || '';
          container.querySelector('#desktop-edit-cust-location').value = c.location || '';
          container.querySelector('#desktop-edit-cust-dates').value = c.travelDates || activeBooking.dates;
          container.querySelector('#desktop-edit-cust-budget').value = c.budgetEst || activeBooking.price;
          container.querySelector('#desktop-edit-cust-status').value = activeBooking.status || 'Confirmed';
          container.querySelector('#desktop-edit-cust-notes').value = c.shortDetails || activeBooking.notes || '';
          modal.classList.add('open');
        }
        return;
      }

      // Close Edit Customer Modal
      if (e.target.closest('#desktop-btn-cancel-edit-cust') || e.target.closest('#close-desktop-edit-cust-modal-btn')) {
        container.querySelector('#desktop-edit-customer-modal')?.classList.remove('open');
        return;
      }

      // Save Customer Details
      if (e.target.closest('#desktop-btn-save-edit-cust')) {
        if (!activeBooking) return;
        const name = container.querySelector('#desktop-edit-cust-name')?.value?.trim();
        const phone = container.querySelector('#desktop-edit-cust-phone')?.value?.trim();
        const email = container.querySelector('#desktop-edit-cust-email')?.value?.trim();
        const location = container.querySelector('#desktop-edit-cust-location')?.value?.trim();
        const dates = container.querySelector('#desktop-edit-cust-dates')?.value?.trim();
        const budget = container.querySelector('#desktop-edit-cust-budget')?.value?.trim();
        const status = container.querySelector('#desktop-edit-cust-status')?.value;
        const notes = container.querySelector('#desktop-edit-cust-notes')?.value?.trim();

        if (!name) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Customer name is required.', type: 'warning' }
          }));
          return;
        }

        activeBooking.customer = activeBooking.customer || {};
        activeBooking.customer.name = name;
        activeBooking.guest.name = name;
        activeBooking.customer.initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2);

        if (phone) {
          activeBooking.customer.phone = phone;
          activeBooking.guest.phone = phone;
        }
        if (email) {
          activeBooking.customer.email = email;
          activeBooking.guest.email = email;
        }
        if (location) activeBooking.customer.location = location;
        if (dates) {
          activeBooking.customer.travelDates = dates;
          activeBooking.dates = dates;
        }
        if (budget) {
          activeBooking.customer.budgetEst = budget;
          activeBooking.price = budget;
        }
        if (status) {
          activeBooking.status = status;
          activeBooking.statusClass = status === 'Confirmed' ? 'status-confirmed' : status === 'Ongoing' ? 'status-ongoing' : 'status-pending';
        }
        if (notes !== undefined) {
          activeBooking.customer.shortDetails = notes;
          activeBooking.notes = notes;
        }

        container.querySelector('#desktop-edit-customer-modal')?.classList.remove('open');
        renderDetailPanel();
        renderTable();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Customer details updated successfully!', type: 'success' }
        }));
        return;
      }

      // Open Add Follow-up Modal (App-based modal, no browser popups)
      if (e.target.closest('#desktop-add-followup-btn') || e.target.closest('#btn-add-followup-action')) {
        if (activeBooking?.kind === 'inquiry') { openFollowUpModal(activeBooking.raw); return; }
        const modal = container.querySelector('#desktop-add-followup-modal');
        if (modal) {
          container.querySelector('#desktop-modal-followup-title').value = '';
          container.querySelector('#desktop-modal-followup-desc').value = '';
          modal.classList.add('open');
        }
        return;
      }

      // Close Add Follow-up Modal
      if (e.target.closest('#desktop-btn-cancel-add-followup') || e.target.closest('#close-desktop-add-followup-modal-btn')) {
        container.querySelector('#desktop-add-followup-modal')?.classList.remove('open');
        return;
      }

      // Save Follow-up
      if (e.target.closest('#desktop-btn-save-add-followup')) {
        const type = container.querySelector('#desktop-modal-followup-type')?.value || 'call';
        const title = container.querySelector('#desktop-modal-followup-title')?.value?.trim();
        const desc = container.querySelector('#desktop-modal-followup-desc')?.value?.trim();
        const author = container.querySelector('#desktop-modal-followup-author')?.value?.trim() || 'By Ruyi Admin';

        if (!title) {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Please enter a follow-up title.', type: 'warning' }
          }));
          return;
        }

        if (activeBooking) {
          activeBooking.customer = activeBooking.customer || {};
          activeBooking.customer.leadFlow = activeBooking.customer.leadFlow || [];
          activeBooking.customer.leadFlow.unshift({
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            iconBg: type === 'whatsapp' ? 'icon-green' : 'icon-blue',
            title,
            desc: desc || 'Follow-up logged into customer timeline.',
            author
          });
          container.querySelector('#desktop-add-followup-modal')?.classList.remove('open');
          renderDetailPanel();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'New follow-up added to journey!', type: 'success' }
          }));
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
        if (activeBooking?.kind === 'inquiry') {
          toast(`Inquiry ${activeBooking.id} (${activeBooking.title}) confirmed.`, 'success');
          return;
        }
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
          if (currentPage() !== 'bookings') navigate('bookings');
          setParams({ q: staff.name }, { push: false });
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

      // Notification Bell on Desktop Top Header
      if (e.target.closest('#desktop-bell-btn')) {
        const dropdown = container.querySelector('#desktop-notifications-dropdown');
        if (dropdown) {
          const isOpen = dropdown.style.display === 'block';
          dropdown.style.display = isOpen ? 'none' : 'block';
          const dot = container.querySelector('#desktop-bell-dot');
          if (dot) dot.style.display = 'none';
        }
        return;
      }

      // Mark All Notifications as Read
      if (e.target.closest('#btn-mark-all-notifications-read')) {
        container.querySelectorAll('.notification-item.unread').forEach(el => el.classList.remove('unread'));
        const dot = container.querySelector('#desktop-bell-dot');
        if (dot) dot.style.display = 'none';
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'All notifications marked as read.', type: 'success' }
        }));
        return;
      }

      // Close notifications if clicked outside
      if (!e.target.closest('#desktop-bell-btn') && !e.target.closest('#desktop-notifications-dropdown')) {
        const dropdown = container.querySelector('#desktop-notifications-dropdown');
        if (dropdown) dropdown.style.display = 'none';
      }

      // Guest Three Dots Menu Click
      const guestMenuBtn = e.target.closest('[data-guest-menu]');
      if (guestMenuBtn) {
        e.stopPropagation();
        const gId = guestMenuBtn.dataset.guestMenu;
        const guestObj = activeBooking?.guests?.find(g => String(g.id) === String(gId));
        const guestName = guestObj ? guestObj.name : 'Guest';
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Guest options for ${guestName}: ID verified, travel pass issued.`, type: 'info' }
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

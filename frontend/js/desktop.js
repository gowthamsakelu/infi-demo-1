import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST, SPECIAL_REQUIREMENTS_PRESETS, getSpecialReqIconSvg } from './data.js';

export function createDesktopView(container) {
  let bookings = [...INITIAL_BOOKINGS];
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

              <!-- Selection / Action Bar ("1 selected", "+ Assign", "...") Exactly as Mobile -->
              <div class="mobile-selection-bar desktop-selection-bar" id="desktop-selection-bar" style="display: none;">
                <div class="selection-left">
                  <div class="custom-checkbox" id="desktop-select-all-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span id="desktop-selected-count">0 selected</span>
                </div>
                <div class="selection-actions-right">
                  <button class="action-pill-btn" id="desktop-bulk-assign-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" x2="19" y1="8" y2="14"/>
                      <line x1="22" x2="16" y1="11" y2="11"/>
                    </svg>
                    + Assign
                  </button>
                  <div style="position: relative;">
                    <button class="action-more-btn" id="desktop-bulk-more-btn" title="More options">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                      </svg>
                    </button>
                    <div class="bulk-more-dropdown" id="desktop-bulk-more-dropdown" style="display: none; position: absolute; right: 0; top: 40px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 6px; width: 160px; z-index: 100;">
                      <button class="dropdown-item-btn" id="desktop-bulk-mark-paid-btn" style="padding: 8px 10px; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Mark as Paid
                      </button>
                      <button class="dropdown-item-btn" id="desktop-bulk-clear-btn" style="padding: 8px 10px; font-size: 13px; color: #64748B;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Table Element -->
              <table class="bookings-table">
                <thead>
                  <tr>
                    <th style="width: 44px; padding-left: 20px; padding-right: 0;">
                      <div class="custom-checkbox" id="desktop-th-select-all">
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

        <!-- Sleek Sticky Footer Action Bar -->
        <div class="desktop-drawer-footer" id="desktop-drawer-footer">
          <button class="btn-primary-desktop desktop-confirm-booking-btn" id="desktop-confirm-booking-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Confirm Booking</span>
          </button>
          <div class="desktop-footer-actions-group">
            <button class="desktop-action-icon-btn btn-action-call" id="desktop-act-call" title="Call Customer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Call</span>
            </button>
            <button class="desktop-action-icon-btn btn-action-msg" id="desktop-act-msg" title="WhatsApp Message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
            <button class="desktop-action-icon-btn btn-action-fwd" id="desktop-act-fwd" title="Forward Voucher">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span>Share</span>
            </button>
            <button class="desktop-action-icon-btn btn-action-more" id="desktop-act-more" title="More Options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

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
        <tr class="${isRowActive ? 'row-selected row-active' : ''} ${b.selected ? 'row-checked' : ''}" data-desktop-row-id="${b.id}" style="cursor: pointer;">
          <td style="width: 44px; padding-left: 20px; padding-right: 0;" class="td-checkbox-cell">
            <div class="custom-checkbox card-select-checkbox ${b.selected ? 'checked' : ''}" data-desktop-select-id="${b.id}">
              ${b.selected ? `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ` : ''}
            </div>
          </td>
          <td style="padding-left: 14px;">
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

    // Update Selection Bar State Exactly as Mobile
    const selectedCount = bookings.filter(b => b.selected).length;
    const countEl = container.querySelector('#desktop-selected-count');
    if (countEl) countEl.textContent = `${selectedCount} selected`;

    const selBar = container.querySelector('#desktop-selection-bar');
    if (selBar) {
      selBar.style.display = selectedCount > 0 ? 'flex' : 'none';
    }

    const allBox = container.querySelector('#desktop-select-all-box');
    if (allBox) {
      allBox.className = selectedCount > 0 ? (selectedCount === bookings.length ? 'custom-checkbox checked' : 'custom-checkbox checked') : 'custom-checkbox';
    }
    const thAllBox = container.querySelector('#desktop-th-select-all');
    if (thAllBox) {
      thAllBox.className = selectedCount > 0 ? (selectedCount === bookings.length ? 'custom-checkbox checked' : 'custom-checkbox checked') : 'custom-checkbox';
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

    // Header: Unified, comprehensive Trip & Booking Header
    const initials = b.customer?.initials || (b.guest?.name?.split(' ').map(n=>n[0]).join('') || 'CU');
    const custName = b.customer?.name || b.guest?.name || 'Customer';

    headerEl.innerHTML = `
      <div class="desktop-drawer-top-row">
        <div class="drawer-top-left-badges">
          <span class="drawer-booking-id-tag">${b.id}</span>
          <span class="card-type-badge ${b.typeClass}">${b.type}</span>
          <span class="status-pill ${b.statusClass}">
            <span class="dot"></span>
            ${b.status}
          </span>
        </div>
        <button class="drawer-close-btn" id="close-desktop-detail-btn" title="Close Drawer (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="desktop-drawer-title-price-row">
        <div class="drawer-title-block">
          <h2 class="drawer-trip-title">${b.title}</h2>
          <div class="drawer-dest-subtitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${b.destination}</span>
          </div>
        </div>
        <div class="drawer-price-block">
          <div class="drawer-price-value">${b.price}</div>
          <div class="drawer-price-caption">Total Package</div>
        </div>
      </div>

      <div class="desktop-drawer-meta-bar">
        <div class="drawer-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <span>${b.pax} Travelers</span>
        </div>
        <span class="drawer-meta-separator">•</span>
        <div class="drawer-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <span>${b.dates}</span>
        </div>
        <span class="drawer-meta-separator">•</span>
        <div class="drawer-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>${b.duration}</span>
        </div>
        ${b.assignedTo?.name ? `
          <span class="drawer-meta-separator">•</span>
          <div class="drawer-meta-item drawer-assigned-item">
            ${b.assignedTo.avatar ? `<img src="${b.assignedTo.avatar}" alt="${b.assignedTo.name}" class="drawer-assigned-avatar" />` : ''}
            <span>${b.assignedTo.name}</span>
          </div>
        ` : ''}
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
          <!-- Lead Customer Profile Card -->
          <div class="customer-profile-card">
            <div class="customer-profile-avatar">${initials}</div>
            <div class="customer-profile-info">
              <div class="customer-profile-name-row">
                <h4>${c.name}</h4>
                <span class="lead-badge">Lead Guest</span>
              </div>
              <p class="customer-profile-contact-sub">${c.phone} • ${c.email}</p>
            </div>
            <div class="customer-profile-actions">
              <button class="mini-circle-btn btn-call-green" title="Call ${c.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${c.name} (${c.phone})...', type: 'info' }}))">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button class="mini-circle-btn btn-wa-green" title="WhatsApp ${c.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp chat with ${c.name}...', type: 'success' }}))">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              </button>
              <button class="mini-circle-btn btn-mail-blue" title="Email ${c.name}" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Drafting email to ${c.email}...', type: 'info' }}))">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </button>
            </div>
          </div>
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
              <button class="btn-edit-action" id="desktop-edit-customer-btn" title="Edit Customer Details">
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
                  <span class="info-value-bold phone-number-val">${c.phone}</span>
                  <div class="contact-action-btns">
                    <button class="mini-icon-btn btn-call-green" title="Call" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Calling ${c.name} (${c.phone})...', type: 'info' }}))">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                    <button class="mini-icon-btn btn-wa-green" title="WhatsApp" onclick="window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Opening WhatsApp for ${c.name}...', type: 'success' }}))">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
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
              <button class="btn-add-followup" id="desktop-add-followup-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" x2="12" y1="5" y2="19"/>
                  <line x1="5" x2="19" y1="12" y2="12"/>
                </svg>
                Add Follow-up
              </button>
            </div>

            <div class="lead-journey-timeline">
              ${(c.leadFlow && c.leadFlow.length > 0) ? c.leadFlow.map((step, idx) => `
                <div class="journey-item">
                  <div class="journey-time-col">
                    <span class="journey-date">${step.date}</span>
                    <span class="journey-time">${step.time}</span>
                  </div>
                  <div class="journey-track-col">
                    <div class="journey-dot-icon ${step.iconBg || 'icon-blue'}">
                      ${step.type === 'call' ? `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      ` : step.type === 'whatsapp' ? `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                      ` : `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                      `}
                    </div>
                    ${idx < c.leadFlow.length - 1 ? '<div class="journey-line"></div>' : ''}
                  </div>
                  <div class="journey-content-col">
                    <div class="journey-item-header">
                      <h4>${step.title}</h4>
                      <span class="journey-author">${step.author || 'By Ruyi Admin'}</span>
                    </div>
                    <p class="journey-desc">${step.desc}</p>
                  </div>
                </div>
              `).join('') : `
                <p style="font-size: 13px; color: #94A3B8; text-align: center; padding: 16px 0;">No journey follow-ups recorded yet.</p>
              `}
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
        <div class="itinerary-section-header-bar">
          <h3>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            Day-wise Schedule
          </h3>
          <button class="btn-add-event-pill" id="desktop-add-event-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
          alert('Please enter an event title.');
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

      // Desktop Bulk "+ Assign" Button
      if (e.target.closest('#desktop-bulk-assign-btn')) {
        const sel = bookings.filter(b => b.selected);
        if (sel.length > 0) {
          openDesktopBulkAssignModal(sel);
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: 'Please select at least 1 booking to assign.', type: 'info' }
          }));
        }
        return;
      }

      // Desktop Bulk "..." More Button Dropdown
      if (e.target.closest('#desktop-bulk-more-btn')) {
        e.stopPropagation();
        const dd = container.querySelector('#desktop-bulk-more-dropdown');
        if (dd) {
          dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        }
        return;
      }

      // Close bulk more dropdown if clicked elsewhere
      if (!e.target.closest('#desktop-bulk-more-btn') && !e.target.closest('#desktop-bulk-more-dropdown')) {
        const dd = container.querySelector('#desktop-bulk-more-dropdown');
        if (dd) dd.style.display = 'none';
      }

      // Bulk Mark as Paid Action
      if (e.target.closest('#desktop-bulk-mark-paid-btn')) {
        const sel = bookings.filter(b => b.selected);
        if (sel.length > 0) {
          sel.forEach(b => {
            b.status = 'Paid';
            b.statusClass = 'status-paid';
            b.selected = false;
          });
          const dd = container.querySelector('#desktop-bulk-more-dropdown');
          if (dd) dd.style.display = 'none';
          renderTable();
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: `Marked ${sel.length} booking(s) as Paid!`, type: 'success' }
          }));
        }
        return;
      }

      // Bulk Clear Selection Action
      if (e.target.closest('#desktop-bulk-clear-btn')) {
        bookings.forEach(b => b.selected = false);
        const dd = container.querySelector('#desktop-bulk-more-dropdown');
        if (dd) dd.style.display = 'none';
        renderTable();
        return;
      }

      // Action button "View" or Row Click -> Open Popup Drawer!
      const openBtn = e.target.closest('[data-open-detail]');
      const row = e.target.closest('[data-desktop-row-id]');
      if (openBtn || row) {
        // If clicking checkbox cell, do not open drawer
        if (e.target.closest('.td-checkbox-cell') || e.target.closest('[data-desktop-select-id]')) {
          return;
        }

        const id = openBtn ? openBtn.dataset.openDetail : row.dataset.desktopRowId;
        const b = bookings.find(item => item.id === id);
        if (b) {
          openDrawer(b);
        }
        return;
      }

      // Edit Customer Button inside Drawer
      if (e.target.closest('#desktop-edit-customer-btn')) {
        const name = activeBooking?.customer?.name || activeBooking?.guest?.name || 'Customer';
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Editing customer details for ${name}...`, type: 'info' }
        }));
        return;
      }

      // Add Follow-up Button inside Drawer
      if (e.target.closest('#desktop-add-followup-btn')) {
        const note = prompt('Enter follow-up note (e.g. Call with customer regarding dates):');
        if (note && activeBooking?.customer) {
          activeBooking.customer.leadFlow = activeBooking.customer.leadFlow || [];
          activeBooking.customer.leadFlow.unshift({
            date: 'Today',
            time: 'Just now',
            type: 'call',
            iconBg: 'icon-blue',
            title: 'Follow-up Call (Logged)',
            desc: note,
            author: 'By Ruyi Admin'
          });
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

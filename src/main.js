// Main Application Orchestrator
import { createMobileView } from './mobile.js';
import { createDesktopView } from './desktop.js';
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Global Toast Dispatcher
  window.addEventListener('show-toast', (e) => {
    const { message, type } = e.detail;
    showToast(message, type);
  });

  // Modal State
  let targetBookingForGuest = 'BK-5021';
  let targetBookingsForAssign = ['BK-5021'];

  // Global Modals HTML
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = `
    <!-- Add Guest Modal -->
    <div class="modal-overlay" id="modal-add-guest">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Add New Guest</h3>
          <button class="sheet-close-btn" id="close-add-guest-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form id="form-add-guest">
          <div class="modal-body">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" id="guest-input-name" placeholder="e.g. Rahul Sharma" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Age *</label>
                <input type="number" id="guest-input-age" placeholder="e.g. 35" min="1" max="110" required />
              </div>
              <div class="form-group">
                <label>Category / Role</label>
                <select id="guest-input-role">
                  <option value="Adult">Adult</option>
                  <option value="Child">Child</option>
                  <option value="Senior">Senior</option>
                  <option value="Primary Contact">Primary Contact</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="guest-input-phone" placeholder="e.g. 9876543210" />
            </div>
            <div class="form-group">
              <label>ID Proof / Notes</label>
              <input type="text" id="guest-input-notes" placeholder="Aadhaar / Passport / Special meal request" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary-desktop" id="cancel-add-guest-modal">Cancel</button>
            <button type="submit" class="btn-primary-desktop">+ Add Guest</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign Staff Modal -->
    <div class="modal-overlay" id="modal-assign-staff">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Assign Coordinator</h3>
          <button class="sheet-close-btn" id="close-assign-staff-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; color: #64748B; margin-bottom: 8px;">Select an operations manager to assign to the booking(s):</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${STAFF_MEMBERS.map(s => `
              <div class="guest-item-card staff-assign-card" data-staff-id="${s.id}" style="cursor: pointer;">
                <div class="guest-left-info">
                  <img src="${s.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                  <div class="guest-name-col">
                    <h4>${s.name}</h4>
                    <p>${s.role} • Active in ${s.activeTrips} tours</p>
                  </div>
                </div>
                <button class="btn-secondary-desktop" style="height: 32px; font-size: 12px; padding: 0 12px;">Assign</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container" id="toast-container"></div>
  `;
  document.body.appendChild(modalContainer);

  // App Layout Shell Structure
  appContainer.innerHTML = `
    <!-- Top Global App Bar with Viewport Mode Switcher -->
    <div class="app-global-bar">
      <div class="brand-badge">
        <div class="brand-icon-mini">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
          </svg>
        </div>
        <span>Ruyi Admin UI</span>
      </div>

      <!-- Mode Switcher -->
      <div class="mode-switcher">
        <button class="mode-btn active" data-mode="pc">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="20" height="14" x="2" y="3" rx="2"/>
            <line x1="8" x2="16" y1="21" y2="21"/>
            <line x1="12" x2="12" y1="17" y2="21"/>
          </svg>
          🖥️ PC Admin View
        </button>
        <button class="mode-btn" data-mode="mobile">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <line x1="12" x2="12.01" y1="18" y2="18"/>
          </svg>
          📱 Phone Simulator
        </button>
        <button class="mode-btn" data-mode="dual">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <line x1="12" x2="12" y1="3" y2="21"/>
          </svg>
          ◫ Dual Side-by-Side
        </button>
      </div>

      <!-- Quick Screen Jump Shortcuts for testing reference screens -->
      <div class="global-actions" style="flex-wrap: wrap;">
        <span style="font-size: 12px; color: #94A3B8;">Jump to Screen:</span>
        <button class="pill-link" id="btn-jump-screen-1" title="Screen 1: Bookings List">1. Bookings</button>
        <button class="pill-link" id="btn-jump-screen-2" title="Overview Sheet">2. Overview</button>
        <button class="pill-link" id="btn-jump-screen-guests" title="Guests Tab">3. Guests (12)</button>
        <button class="pill-link" id="btn-jump-itinerary" title="Itinerary Timeline">4. Itinerary</button>
        <button class="pill-link" id="btn-jump-menu" title="Itinerary ⋮ Dropdown Menu">5. Action Menu</button>
        <button class="pill-link" id="btn-jump-assign" title="Assign to Vendor Modal">6. Assign to</button>
        <button class="pill-link" id="btn-jump-assigned" title="Itinerary with Assigned Badges">7. Assigned Badges</button>
      </div>
    </div>

    <!-- Active Viewport Container -->
    <div class="app-viewport mode-pc" id="viewport-container">
      <!-- Desktop Area Container -->
      <div id="desktop-view-slot"></div>

      <!-- Mobile Phone Simulator Container -->
      <div class="mobile-frame-container" id="mobile-view-slot"></div>
    </div>
  `;

  const viewportContainer = document.getElementById('viewport-container');
  const desktopSlot = document.getElementById('desktop-view-slot');
  const mobileSlot = document.getElementById('mobile-view-slot');

  // Initialize Mobile and Desktop Views
  const mobileView = createMobileView(mobileSlot);
  const desktopView = createDesktopView(desktopSlot);

  // Auto-detect mobile screen width
  const isMobileInitial = window.innerWidth <= 900;
  setMode(isMobileInitial ? 'mobile' : 'pc');

  // Switch Viewport Modes manually
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setMode(mode);
    });
  });

  // Listen for window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900 && !viewportContainer.classList.contains('mode-mobile')) {
      setMode('mobile');
    }
  });

  const trip = INITIAL_BOOKINGS.find(b => b.id === 'BK-5021');

  // Jump Screen Shortcuts
  document.getElementById('btn-jump-screen-1').addEventListener('click', () => {
    setMode('mobile');
    mobileView.closeModal();
    showToast('Screen 1: Mobile Bookings List', 'info');
  });

  document.getElementById('btn-jump-screen-2').addEventListener('click', () => {
    setMode('mobile');
    mobileView.openModal(trip, 'overview');
    showToast('Screen 2: Overview Bottom Sheet', 'info');
  });

  document.getElementById('btn-jump-screen-guests').addEventListener('click', () => {
    setMode('mobile');
    mobileView.openModal(trip, 'guests');
    showToast('Screen 3: Guests (12) Tab inside Bottom Sheet', 'info');
  });

  // NEW Itinerary Screen 1: Itinerary Timeline
  document.getElementById('btn-jump-itinerary').addEventListener('click', () => {
    setMode('mobile');
    mobileView.openModal(trip, 'itinerary');
    showToast('New Screen 1: Itinerary Timeline (Haridwar – Kashi Trip)', 'info');
  });

  // NEW Itinerary Screen 2: Action Dropdown Menu
  document.getElementById('btn-jump-menu').addEventListener('click', () => {
    setMode('mobile');
    mobileView.openModal(trip, 'itinerary');
    mobileView.setOpenDropdownItemId('IT-101');
    showToast('New Screen 2: Itinerary Item Action Menu (Assign, Details, Edit, Remove)', 'info');
  });

  // NEW Itinerary Screen 3: Assign to Vendor Sheet
  document.getElementById('btn-jump-assign').addEventListener('click', () => {
    setMode('mobile');
    mobileView.openModal(trip, 'itinerary');
    const raftItem = trip.itineraryDays?.[1]?.items?.[1];
    mobileView.openAssignSheet(raftItem);
    showToast('New Screen 3: "Assign to" Sheet with Vendors & WhatsApp', 'info');
  });

  // NEW Itinerary Screen 4: Itinerary with Assigned Badges
  document.getElementById('btn-jump-assigned').addEventListener('click', () => {
    setMode('mobile');
    // Ensure assigned tags are visible
    if (trip.itineraryDays?.[0]?.items?.[1]) {
      trip.itineraryDays[0].items[1].assigned = {
        isAssigned: true,
        name: 'Rahul Mehta',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      };
    }
    if (trip.itineraryDays?.[1]?.items?.[1]) {
      trip.itineraryDays[1].items[1].assigned = {
        isAssigned: true,
        name: 'Adventure World',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
      };
    }
    mobileView.closeAssignSheet();
    mobileView.openModal(trip, 'itinerary');
    showToast('New Screen 4: Itinerary with "Assigned" badges & coordinator avatars', 'success');
  });

  function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    viewportContainer.className = `app-viewport mode-${mode}`;
  }

  // Modal Listeners
  window.addEventListener('open-add-guest-modal', (e) => {
    targetBookingForGuest = e.detail.bookingId;
    document.getElementById('modal-add-guest').classList.add('open');
  });

  window.addEventListener('open-assign-staff-modal', (e) => {
    targetBookingsForAssign = e.detail.bookingIds;
    document.getElementById('modal-assign-staff').classList.add('open');
  });

  // Close modals
  document.getElementById('close-add-guest-modal').addEventListener('click', () => {
    document.getElementById('modal-add-guest').classList.remove('open');
  });
  document.getElementById('cancel-add-guest-modal').addEventListener('click', () => {
    document.getElementById('modal-add-guest').classList.remove('open');
  });
  document.getElementById('close-assign-staff-modal').addEventListener('click', () => {
    document.getElementById('modal-assign-staff').classList.remove('open');
  });

  // Handle Add Guest Form Submission
  document.getElementById('form-add-guest').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guest-input-name').value.trim();
    const age = parseInt(document.getElementById('guest-input-age').value) || 25;
    const role = document.getElementById('guest-input-role').value;
    const phone = document.getElementById('guest-input-phone').value.trim() || '9876500000';

    if (!name) return;

    // Find target booking
    const booking = INITIAL_BOOKINGS.find(b => b.id === targetBookingForGuest);
    if (booking) {
      const newGuest = {
        id: booking.guests.length + 1,
        name,
        age,
        role,
        phone
      };
      booking.guests.push(newGuest);
      booking.pax = booking.guests.length;

      // Update both views
      mobileView.updateBooking(booking);
      desktopView.updateBooking(booking);

      showToast(`Added ${name} to ${booking.title}!`, 'success');
    }

    document.getElementById('form-add-guest').reset();
    document.getElementById('modal-add-guest').classList.remove('open');
  });

  // Handle Staff Assignment
  document.querySelectorAll('.staff-assign-card').forEach(card => {
    card.addEventListener('click', () => {
      const staffId = card.dataset.staffId;
      const staff = STAFF_MEMBERS.find(s => s.id === staffId);
      if (staff) {
        targetBookingsForAssign.forEach(bId => {
          const booking = INITIAL_BOOKINGS.find(b => b.id === bId);
          if (booking) {
            booking.assignedTo = {
              name: staff.name,
              role: staff.role,
              avatar: staff.avatar
            };
            booking.assignedStatus = 'Assigned • Paid';
            booking.updates.unshift({
              time: 'Just now',
              title: `Assigned to ${staff.name}`,
              desc: `Coordinator ${staff.name} took ownership of trip operations.`,
              user: 'Karan Sapalia'
            });
            mobileView.updateBooking(booking);
            desktopView.updateBooking(booking);
          }
        });
        showToast(`Assigned ${staff.name} to ${targetBookingsForAssign.length} booking(s)!`, 'success');
      }
      document.getElementById('modal-assign-staff').classList.remove('open');
    });
  });

  // Toast Helper
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'}
      </svg>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});

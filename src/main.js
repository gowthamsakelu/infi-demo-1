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
          <p style="font-size: 13.5px; color: #64748B; margin-bottom: 12px;">Select an operations manager to assign to the booking(s):</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${STAFF_MEMBERS.map(s => `
              <div class="guest-item-card staff-assign-card" data-staff-id="${s.id}" style="cursor: pointer;">
                <div class="guest-left-info">
                  <img src="${s.avatar}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
                  <div class="guest-name-col">
                    <h4>${s.name}</h4>
                    <p>${s.role} • Active in ${s.activeTrips} tours</p>
                  </div>
                </div>
                <button class="btn-secondary-desktop" style="height: 32px; font-size: 12px; padding: 0 14px;">Assign</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- New Booking Modal -->
    <div class="modal-overlay" id="modal-new-booking">
      <div class="modal-card" style="width: 540px;">
        <div class="modal-header">
          <h3>Create New Booking</h3>
          <button class="sheet-close-btn" id="close-new-booking-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form id="form-new-booking">
          <div class="modal-body">
            <div class="form-group">
              <label>Booking / Trip Title *</label>
              <input type="text" id="nb-title" placeholder="e.g. Kashmir Great Lakes Trek" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Category *</label>
                <select id="nb-category">
                  <option value="TOUR">Tour Package</option>
                  <option value="VILLA">Villa & Resort</option>
                  <option value="ACTIVITY">Activity & Sport</option>
                  <option value="TRANSPORT">Transport</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total Pax *</label>
                <input type="number" id="nb-pax" placeholder="e.g. 4" min="1" max="100" required />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Travel Dates *</label>
                <input type="text" id="nb-dates" placeholder="e.g. 15 Dec - 20 Dec" required />
              </div>
              <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="nb-duration" placeholder="e.g. 5D / 4N" required />
              </div>
            </div>
            <div class="form-group">
              <label>Destination *</label>
              <input type="text" id="nb-destination" placeholder="e.g. Srinagar, Sonamarg, Gulmarg" required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Lead Guest Name *</label>
                <input type="text" id="nb-guest-name" placeholder="e.g. Suresh Kumar" required />
              </div>
              <div class="form-group">
                <label>Lead Guest Phone *</label>
                <input type="tel" id="nb-guest-phone" placeholder="e.g. 9811223344" required />
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>Package Price (₹) *</label>
                <input type="text" id="nb-price" placeholder="e.g. ₹45,000" required />
              </div>
              <div class="form-group">
                <label>Assign Coordinator</label>
                <select id="nb-coordinator">
                  ${STAFF_MEMBERS.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary-desktop" id="cancel-new-booking-modal">Cancel</button>
            <button type="submit" class="btn-primary-desktop">+ Create Booking</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container" id="toast-container"></div>
  `;
  document.body.appendChild(modalContainer);

  // App Layout Shell Structure - No ugly simulation toolbar! Clean and Production-ready
  appContainer.innerHTML = `
    <div class="app-root-container" id="app-root-container">
      <!-- Desktop Area Container -->
      <div id="desktop-view-slot" class="view-slot-desktop"></div>

      <!-- Mobile View Container -->
      <div id="mobile-view-slot" class="view-slot-mobile"></div>
    </div>
  `;

  const desktopSlot = document.getElementById('desktop-view-slot');
  const mobileSlot = document.getElementById('mobile-view-slot');

  // Initialize Views
  const mobileView = createMobileView(mobileSlot);
  const desktopView = createDesktopView(desktopSlot);

  // Modal Listeners
  window.addEventListener('open-add-guest-modal', (e) => {
    targetBookingForGuest = e.detail.bookingId;
    document.getElementById('modal-add-guest').classList.add('open');
  });

  window.addEventListener('open-assign-staff-modal', (e) => {
    targetBookingsForAssign = e.detail.bookingIds;
    document.getElementById('modal-assign-staff').classList.add('open');
  });

  window.addEventListener('open-new-booking-modal', () => {
    document.getElementById('modal-new-booking').classList.add('open');
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
  document.getElementById('close-new-booking-modal').addEventListener('click', () => {
    document.getElementById('modal-new-booking').classList.remove('open');
  });
  document.getElementById('cancel-new-booking-modal').addEventListener('click', () => {
    document.getElementById('modal-new-booking').classList.remove('open');
  });

  // Handle Add Guest Form Submission
  document.getElementById('form-add-guest').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guest-input-name').value.trim();
    const age = parseInt(document.getElementById('guest-input-age').value) || 25;
    const role = document.getElementById('guest-input-role').value;
    const phone = document.getElementById('guest-input-phone').value.trim() || '9876500000';

    if (!name) return;

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

  // Handle Create New Booking Form Submission
  document.getElementById('form-new-booking').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('nb-title').value.trim();
    const category = document.getElementById('nb-category').value;
    const pax = parseInt(document.getElementById('nb-pax').value) || 2;
    const dates = document.getElementById('nb-dates').value.trim();
    const duration = document.getElementById('nb-duration').value.trim();
    const destination = document.getElementById('nb-destination').value.trim();
    const guestName = document.getElementById('nb-guest-name').value.trim();
    const guestPhone = document.getElementById('nb-guest-phone').value.trim();
    let price = document.getElementById('nb-price').value.trim();
    if (!price.startsWith('₹')) price = '₹' + price;
    const coordinatorId = document.getElementById('nb-coordinator').value;
    const coordinator = STAFF_MEMBERS.find(s => s.id === coordinatorId) || STAFF_MEMBERS[0];

    const typeClassMap = {
      'TOUR': 'badge-tour',
      'VILLA': 'badge-villa',
      'ACTIVITY': 'badge-activity',
      'TRANSPORT': 'badge-transport'
    };

    const newId = `BK-${5020 + INITIAL_BOOKINGS.length + 1}`;
    const newBooking = {
      id: newId,
      title,
      type: category,
      typeClass: typeClassMap[category] || 'badge-tour',
      image: '/images/manali.jpg',
      pax,
      duration,
      dates,
      travelDateFull: `${dates} (${duration})`,
      status: 'Pending',
      statusClass: 'status-pending',
      price,
      rawPrice: parseInt(price.replace(/[^0-9]/g, '')) || 25000,
      category: 'New Bookings',
      selected: false,
      guest: {
        name: guestName,
        phone: guestPhone,
        email: `${guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        age: 32,
        isPrimary: true
      },
      destination,
      bookingType: category === 'TOUR' ? 'Tour Package' : (category === 'VILLA' ? 'Villa Stay' : 'Activity Booking'),
      services: 'Accommodation, Cab, Guided Sightseeing',
      assignedStatus: 'Unassigned',
      assignedTo: {
        name: coordinator.name,
        role: coordinator.role,
        avatar: coordinator.avatar
      },
      notes: 'Standard package requested. Confirmation pending.',
      guests: [
        { id: 1, name: guestName, age: 32, role: 'Primary Contact', phone: guestPhone }
      ],
      itineraryDays: [
        {
          day: 'Day 1',
          date: dates.split('-')[0]?.trim() || 'Day 1',
          items: [
            { id: 'IT-NEW-1', type: 'hotel', icon: 'bed', title: 'Hotel Check-in', subtitle: '12:00 PM • Welcome drink & rest', assigned: null },
            { id: 'IT-NEW-2', type: 'sightseeing', icon: 'camera', title: 'Local Sightseeing', subtitle: '04:00 PM • Explore destination', assigned: null }
          ]
        }
      ],
      updates: [
        { time: 'Just now', title: 'Booking Created', desc: 'Booking entered into operations queue.', user: 'Karan Sapalia' }
      ]
    };

    INITIAL_BOOKINGS.unshift(newBooking);
    desktopView.addBooking(newBooking);
    mobileView.updateBooking(newBooking);

    showToast(`Created new booking ${newBooking.id} (${newBooking.title})!`, 'success');
    document.getElementById('form-new-booking').reset();
    document.getElementById('modal-new-booking').classList.remove('open');
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

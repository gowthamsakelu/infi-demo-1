// Main Application Orchestrator
// mobile.js and desktop.js (about 115 KB each) are loaded only for the layout that is showing; the other one is loaded if the screen flips.
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from './data.js';
import { refresh } from './shared/page-state.js';
import { initKeyboard } from './shared/keyboard.js';
import { watchScrollRows } from './shared/list-ui.js';
import { watchStaticOverlays } from './shared/push.js';
import { initLayout, applyLayout } from './shared/layout.js';
import { enhanceSelects } from './shared/dropdown-filter.js';
import { closeRowMenu } from './shared/ui.js';
import { closeAssign } from './shared/assign-sheet.js';
import { closeFollowUpModal } from './shared/followup-modal.js';
import { initAccountMenu } from './shared/account-menu.js';
import { isHostedPage } from './shared/nav.js';
import { mountPage, unmountPage, prefetchPages } from './shared/page-host.js';
import { syncNavActive } from './shared/nav-ui.js';
import { currentPage, subscribe as subscribePage } from './shared/page-state.js';

// Wait (briefly) for the web fonts before the first render, so text never reflows when they arrive.
// The boot skeleton stays on screen meanwhile; after 1.5s we render with the fallback anyway.
const fontsReady = () => Promise.race([
  Promise.all([
    document.fonts.load('400 14px "Plus Jakarta Sans"'),
    document.fonts.load('700 14px "Plus Jakarta Sans"'),
  ]).catch(() => {}),
  new Promise((r) => setTimeout(r, 1500)),
]);

applyLayout();

document.addEventListener('DOMContentLoaded', async () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  await fontsReady();
  watchScrollRows();
  watchStaticOverlays();

  // Layout can change live (fold/unfold, rotate, resize). CSS swaps the layout from <html data-layout>; here we reset
  // open overlays so nothing is left in a state that does not exist in the new layout.
  initLayout(async () => {
    closeRowMenu();
    closeAssign();
    closeFollowUpModal();
    await ensureView();
    window.dispatchEvent(new Event('layout-changed'));
    refresh();
  });

  // Global Toast Dispatcher
  window.addEventListener('show-toast', (e) => {
    const { message, type, action } = e.detail;
    if ((type === 'success' || !type || type === 'info') && !action) return; // the screen shows the result itself; only warnings and errors speak up
    showToast(message, type, action);
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
            <button type="submit" class="btn-primary-desktop">Add Guest</button>
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

  document.getElementById('boot')?.remove();
  initKeyboard();
  initAccountMenu();
  const desktopSlot = document.getElementById('desktop-view-slot');
  const mobileSlot = document.getElementById('mobile-view-slot');

  // Build the view for the layout that is showing (the other one is built only if the screen flips).
  let mobileView = null;
  let desktopView = null;
  async function ensureView() {
    if (document.documentElement.dataset.layout === 'mobile') {
      if (!mobileView) { const { createMobileView } = await import('./mobile.js'); mobileView = createMobileView(mobileSlot); }
    } else if (!desktopView) {
      const { createDesktopView } = await import('./desktop.js');
      desktopView = createDesktopView(desktopSlot);
    }
  }
  await ensureView();

  // Pages outside Bookings / Inquiries / Calendar live in a host: the PC one beside the sidebar, the phone one under the header.
  function syncHostedPage() {
    const key = currentPage();
    const hosted = isHostedPage(key);
    const phone = document.documentElement.dataset.layout === 'mobile';
    document.querySelector('.desktop-content-col')?.classList.toggle('page-mode', hosted && !phone);
    document.querySelector('.phone-device')?.classList.toggle('page-mode', hosted && phone);
    if (hosted) mountPage(key, document.querySelector(phone ? '#mobile-page-host' : '#desktop-page-host'));
    else unmountPage();
    syncNavActive(key);
  }
  subscribePage(syncHostedPage);
  window.addEventListener('layout-changed', syncHostedPage);
  syncHostedPage();
  prefetchPages(currentPage()); // once idle: the other pages' scripts, styles and data

  enhanceSelects(document); // no unstyled OS lists: every <select> uses the shared dropdown

  // Modal Listeners
  window.addEventListener('open-add-guest-modal', (e) => {
    targetBookingForGuest = e.detail.bookingId;
    document.getElementById('modal-add-guest').classList.add('open');
  });

  // Close Add Guest Modal
  document.getElementById('close-add-guest-modal').addEventListener('click', () => {
    document.getElementById('modal-add-guest').classList.remove('open');
  });
  document.getElementById('cancel-add-guest-modal').addEventListener('click', () => {
    document.getElementById('modal-add-guest').classList.remove('open');
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
      mobileView?.updateBooking(booking);
      desktopView?.updateBooking(booking);

      showToast(`Added ${name} to ${booking.title}!`, 'success');
    }

    document.getElementById('form-add-guest').reset();
    document.getElementById('modal-add-guest').classList.remove('open');
  });

  // Toast Helper
  function showToast(msg, type = 'info', action = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'}
      </svg>
      <span>${msg}</span>
      ${action ? '<button type="button" class="toast-action"></button>' : ''}
    `;
    if (action) {
      const link = toast.querySelector('.toast-action');
      link.textContent = action.label;
      link.addEventListener('click', () => { action.onClick?.(); toast.remove(); });
    }
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity var(--motion-base) var(--ease-out), transform var(--motion-base) var(--ease-out)';
      setTimeout(() => toast.remove(), 300);
    }, action ? 6000 : 3200);
  }
});

// Notifications panel: the same content, unread state and behaviour behind the bell on PC and on phones.
// PC shows it as a dropdown under the bell; phones show the same card across the screen with a dim backdrop.
import { icon } from './icons.js';
import { lockScroll } from './ui.js';

const ITEMS = [
  { tone: 'blue', icon: 'assign', text: '<strong>New Booking:</strong> Haridwar - Kashi Trip (BK-5021) • 12 Pax', time: '10m ago' },
  { tone: 'green', icon: 'check', text: '<strong>Payment Confirmed:</strong> ₹36,000 received from Amit Verma', time: '25m ago' },
  { tone: 'purple', icon: 'note', text: '<strong>Special Requirement:</strong> Room Heating requested for BK-5027', time: '1h ago' },
];

const state = { unread: new Set(ITEMS.map((_, i) => i)), dotSeen: false };
const bound = new Set();

/** Inner markup of the panel (header and list). */
export function notificationsHtml() {
  return `
    <div class="notifications-header">
      <h4>Notifications</h4>
      <button type="button" class="notifications-mark-read-btn" data-notif-mark-all>Mark all as read</button>
      <button type="button" class="sheet-close-btn notif-close" data-notif-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
    </div>
    <div class="notifications-list" role="list">
      ${ITEMS.map((n, i) => `
        <div class="notification-item ${state.unread.has(i) ? 'unread' : ''}" role="listitem" data-notif="${i}">
          <div class="notif-icon-circle ${n.tone}">${icon(n.icon, { size: 14 })}</div>
          <div class="notif-content"><p class="notif-text">${n.text}</p><span class="notif-time">${n.time}</span></div>
        </div>`).join('')}
    </div>`;
}

function paintAll() {
  bound.forEach((b) => {
    b.panel.querySelectorAll('[data-notif]').forEach((el) => el.classList.toggle('unread', state.unread.has(Number(el.dataset.notif))));
    b.dot.style.display = state.dotSeen || state.unread.size === 0 ? 'none' : '';
  });
}

/**
 * @param {{ bell: HTMLElement, panel: HTMLElement, dot: HTMLElement, backdrop?: HTMLElement|null }} el
 * @returns {{ close: () => void }}
 */
export function bindNotifications({ bell, panel, dot, backdrop = null }) {
  const entry = { panel, dot };
  bound.add(entry);
  let open = false;
  let unlock = null;

  const set = (next) => {
    if (next === open) return;
    open = next;
    panel.hidden = !open;
    if (backdrop) backdrop.hidden = !open;
    bell.setAttribute('aria-expanded', String(open));
    if (open) { state.dotSeen = true; paintAll(); if (backdrop) unlock = lockScroll(); } else if (unlock) { unlock(); unlock = null; }
  };

  bell.setAttribute('aria-haspopup', 'true');
  bell.setAttribute('aria-expanded', 'false');
  bell.addEventListener('click', (e) => { e.stopPropagation(); set(!open); });
  panel.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('[data-notif-close]')) { set(false); return; }
    if (e.target.closest('[data-notif-mark-all]')) {
      state.unread.clear();
      paintAll();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'All notifications marked as read.', type: 'success' } }));
    }
  });
  backdrop?.addEventListener('click', () => set(false));
  // The bells that pages draw in their own header (data-sp-bell, data-dash-bell) press this bell for you; the same tap must not count as "outside" and close the panel it just opened.
  document.addEventListener('click', (e) => { if (open && !panel.contains(e.target) && !bell.contains(e.target) && !e.target.closest?.('[data-sp-bell], [data-dash-bell]')) set(false); });
  document.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') { e.preventDefault(); set(false); bell.focus({ preventScroll: true }); } });
  // Moving to another page or another layout closes it.
  window.addEventListener('hashchange', () => set(false));
  window.addEventListener('popstate', () => set(false));
  window.addEventListener('layout-changed', () => set(false));

  paintAll();
  return { close: () => set(false) };
}

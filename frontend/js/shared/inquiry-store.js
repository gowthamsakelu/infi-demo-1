// Inquiries data + the adapter that lets the Bookings list, split view and detail pane render them.
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from '../data.js';
import { phoneKey, addFollowUpLocal } from './followups.js';
import { icon } from './icons.js';
import { esc, toast, dismissOnOutside } from './ui.js';

export const INQUIRY_TABS = [
  { key: 'all', label: 'All', short: 'All' },
  { key: 'new', label: 'New', short: 'New' },
  { key: 'ongoing', label: 'Ongoing', short: 'Ongoing' },
  { key: 'warm', label: 'Warm', short: 'Warm' },
  { key: 'hot', label: 'Hot', short: 'Hot' },
];
const STATUS_LABEL = Object.fromEntries(INQUIRY_TABS.map((t) => [t.key, t.label]));
const BADGE = { TOUR: 'badge-tour', VILLA: 'badge-villa', ACTIVITY: 'badge-activity', TRANSPORT: 'badge-transport' };

const state = { raw: [], list: [], loaded: false, failed: false };
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
export const subscribeInquiries = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const inquiryState = state;

const fmtDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Journey entries of an existing booking customer that shares the phone number. */
function baselineFlow(phone) {
  const key = phoneKey(phone);
  const b = INITIAL_BOOKINGS.find((x) => phoneKey(x.customer?.phone || x.guest?.phone) === key);
  return b?.customer?.leadFlow || [];
}

/** Inquiry -> the booking-shaped object the shared list / detail code understands. */
export function inquiryToBooking(i, prev) {
  const staff = STAFF_MEMBERS.find((s) => s.id === i.assigned_to_id);
  const initialsOf = i.customer_name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return {
    kind: 'inquiry',
    id: i.id,
    raw: i,
    title: i.trip,
    type: i.category,
    typeClass: BADGE[i.category] || 'badge-tour',
    pax: i.pax,
    duration: `${i.nights} Night${i.nights === 1 ? '' : 's'}`,
    dates: fmtDate(i.travel_date),
    travelDateFull: fmtDate(i.travel_date),
    status: STATUS_LABEL[i.status] || i.status,
    statusClass: `status-inq-${i.status}`,
    category: i.status, // drives the status tabs
    price: '—',
    destination: i.trip,
    notes: i.notes || '',
    selected: prev?.selected || false,
    guest: { name: i.customer_name, phone: i.customer_phone, email: i.customer_email || '', isPrimary: true },
    customer: {
      name: i.customer_name,
      initials: initialsOf,
      phone: i.customer_phone,
      email: i.customer_email || '—',
      location: i.location || '—',
      leadSource: i.lead_source || '—',
      preferredDestination: i.trip,
      travelDates: fmtDate(i.travel_date),
      customerType: `${i.pax > 2 ? 'Group' : 'Couple / Solo'} (${i.pax} Pax)`,
      budgetEst: '—',
      status: STATUS_LABEL[i.status] || i.status,
      shortDetails: i.notes || 'No additional details recorded for this inquiry.',
      leadFlow: baselineFlow(i.customer_phone),
    },
    assignedTo: { name: staff?.name || i.assigned_to_name || 'Unassigned', avatar: staff?.avatar || '' },
    assignedStatus: i.assigned_to_id ? 'Assigned' : 'Unassigned',
    guests: [{ id: 1, name: i.customer_name, age: '', role: 'Primary Contact', phone: i.customer_phone, isPrimary: true }],
    itineraryDays: [],
    specialRequirements: [],
    updates: [{ title: 'Inquiry received', time: '', desc: `${i.customer_name} inquired about ${i.trip}${i.lead_source ? ` via ${i.lead_source}` : ''}.`, user: 'Ruyi Admin' }],
  };
}

function rebuild() {
  const prev = new Map(state.list.map((b) => [b.id, b]));
  state.list = state.raw.map((i) => {
    const old = prev.get(i.id);
    const next = inquiryToBooking(i, old);
    if (old) Object.assign(old, next); // keep object identity so open panes stay valid
    return old || next;
  });
}

export async function loadInquiries() {
  try {
    const res = await fetch('/api/inquiries', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    state.raw = (await res.json()).data;
    state.failed = false;
  } catch {
    state.failed = !state.loaded;
  }
  state.loaded = true;
  rebuild();
  notify();
}

export function applyInquiryUpdates(rows) {
  rows.forEach((u) => {
    const k = state.raw.findIndex((x) => x.id === u.id);
    if (k > -1) state.raw[k] = u;
  });
  rebuild();
  notify();
}

/** Quick note: validates, saves, and returns true on success. */
export async function saveQuickNote(id, text) {
  const comment = text.trim();
  if (!comment) { toast('Type a note first.', 'warning'); return false; }
  if (comment.length > 500) { toast('Note can be at most 500 characters.', 'warning'); return false; }
  try {
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ comment }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(Object.values(body.errors || {}).flat()[0] || 'Could not save the note.');
    addFollowUpLocal(body.data);
    toast('Note saved', 'success');
    return true;
  } catch (e) {
    toast(e.message || 'Could not save the note.', 'warning');
    return false;
  }
}

/** Persist Paid / Pending for bookings; returns after the request settles. */
export async function savePayment(bookingId, status) {
  try {
    const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/payment`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch { return false; }
}

/** On load, apply saved payment statuses to the in-memory bookings. */
export async function syncBookingPayments() {
  try {
    const res = await fetch('/api/bookings', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const rows = (await res.json()).data || [];
    rows.forEach((r) => {
      const b = INITIAL_BOOKINGS.find((x) => x.id === r.id);
      if (b && b.status !== r.status) { b.status = r.status; b.statusClass = r.status_class; }
    });
  } catch { /* standalone */ }
}

/** Assign modal for one or many inquiries (same card style as Bookings' assign list). */
export function openInquiryAssignModal(ids, onDone) {
  let staffId = STAFF_MEMBERS[0].id;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay open inq-assign-overlay';
  ov.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="inq-assign-title">
      <div class="modal-header"><h3 id="inq-assign-title">Assign ${ids.length} inquir${ids.length === 1 ? 'y' : 'ies'}</h3>
        <button class="sheet-close-btn" data-x aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:8px;align-items:stretch;" role="radiogroup" aria-label="Team member">
        ${STAFF_MEMBERS.map((m, k) => `
          <div class="vendor-item-card ${k === 0 ? 'selected' : ''}" data-staff="${m.id}" role="radio" aria-checked="${k === 0}" tabindex="0" style="padding:8px 12px;cursor:pointer;">
            <div class="vendor-item-left" style="gap:10px;">
              <div class="custom-radio ${k === 0 ? 'checked' : ''}"></div>
              <img src="${esc(m.avatar)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
              <div class="vendor-info"><h4 style="font-size:13.5px;margin:0;">${esc(m.name)}</h4><p style="font-size:12px;color:#64748B;margin:0;">${esc(m.role)}</p></div>
            </div>
          </div>`).join('')}
      </div>
      <div class="modal-footer"><button class="btn-secondary-desktop" data-x>Cancel</button><button class="btn-primary-desktop" data-ok>Assign</button></div>
    </div>`;
  document.body.appendChild(ov);
  const stop = dismissOnOutside(ov.querySelector('.modal-card'), close);
  const pick = (card) => {
    staffId = card.dataset.staff;
    ov.querySelectorAll('[data-staff]').forEach((c) => {
      const on = c === card;
      c.classList.toggle('selected', on);
      c.setAttribute('aria-checked', on);
      c.querySelector('.custom-radio').classList.toggle('checked', on);
    });
  };
  ov.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-staff]')) { e.preventDefault(); pick(e.target.closest('[data-staff]')); } });
  ov.addEventListener('click', async (e) => {
    const card = e.target.closest('[data-staff]');
    if (card) return pick(card);
    if (e.target.closest('[data-x]')) return close();
    if (!e.target.closest('[data-ok]')) return;
    try {
      const res = await fetch('/api/inquiries/assign', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ids, staff_id: staffId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error();
      applyInquiryUpdates(body.data);
      close();
      toast(body.message, 'success');
      onDone?.();
    } catch { toast('Could not assign. Try again.', 'warning'); }
  });
  function close() { stop(); ov.remove(); }
  ov.querySelector('[data-staff]').focus();
}

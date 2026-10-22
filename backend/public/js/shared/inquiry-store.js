// Inquiries data + the adapter that lets the Bookings list, split view and detail pane render them.
import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST } from '../data.js';
import { phoneKey, addFollowUpLocal } from './followups.js';
import { toast } from './ui.js';
import { markSaved } from './itinerary.js';

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
const notify = (ids) => listeners.forEach((fn) => fn(ids));
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
  const staff = [...STAFF_MEMBERS, ...VENDORS_LIST.map((v) => ({ ...v, avatar: v.image })), ...CONTACTS_LIST].find((s) => s.id === i.assigned_to_id);
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
    itineraryDays: prev?.itineraryDays ?? JSON.parse(JSON.stringify(i.itinerary_days || [])),
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
  notify(rows.map((r) => r.id));
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
      if (!b) return;
      if (b.status !== r.status) { b.status = r.status; b.statusClass = r.status_class; }
      if (Array.isArray(r.itinerary_days) && r.itinerary_days.length) b.itineraryDays = r.itinerary_days;
      if (r.assigned_to && r.assigned_to.name) b.assignedTo = { ...(b.assignedTo || {}), name: r.assigned_to.name, avatar: r.assigned_to.avatar || b.assignedTo?.avatar || '' };
      markSaved(b);
    });
  } catch { /* standalone */ }
}

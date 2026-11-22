// Inquiries data + the adapter that lets the Bookings list, split view and detail pane render them.
import { INITIAL_BOOKINGS, STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST } from '../data.js';
import { phoneKey, addFollowUpLocal } from './followups.js';
import { toast, UNNAMED_LEAD } from './ui.js';
import { markSaved } from './itinerary.js';

export const INQUIRY_TABS = [
  { key: 'all', label: 'All', short: 'All' },
  { key: 'new', label: 'New', short: 'New' },
  { key: 'ongoing', label: 'Ongoing', short: 'Ongoing' },
  { key: 'quotation_sent', label: 'Quotation Sent', short: 'Quotation Sent' },
  { key: 'converted', label: 'Converted', short: 'Converted' },
];
const STATUS_LABEL = {
  all: 'All',
  new: 'New',
  ongoing: 'Ongoing',
  quotation_sent: 'Quotation Sent',
  converted: 'Converted',
  warm: 'Quotation Sent',
  hot: 'Converted',
};
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
  // Name, phone, trip and nights are optional on a new inquiry: an inquiry without a name is an "Unnamed lead".
  const name = i.customer_name || UNNAMED_LEAD;
  const initialsOf = i.customer_name ? i.customer_name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const trip = i.trip || '';
  const nights = i.nights == null ? null : Number(i.nights);
  const budget = i.budget == null ? '—' : `₹${Number(i.budget).toLocaleString('en-IN')}`;
  const guests = (i.guests?.length ? i.guests : [{ id: 1, name: i.customer_name, role: 'Primary Contact', phone: i.customer_phone, isPrimary: true }])
    .map((g, k) => ({ id: g.id ?? k + 1, name: g.name || (k === 0 ? name : `Guest ${k + 1}`), age: g.age ?? '', role: g.role || '', phone: g.phone || '', isPrimary: !!g.isPrimary }));
  return {
    kind: 'inquiry',
    id: i.id,
    raw: i,
    freight_details: i.freight_details,
    lead_source: i.lead_source,
    title: trip || '—',
    type: i.freight_details?.requirements?.service_type || i.category,
    typeClass: BADGE[i.category] || 'badge-tour',
    pax: i.pax,
    duration: nights == null ? '' : `${nights} Night${nights === 1 ? '' : 's'}`,
    dates: fmtDate(i.travel_date),
    travelDateFull: fmtDate(i.travel_date),
    status: STATUS_LABEL[i.status] || i.status,
    statusClass: `status-inq-${i.status}`,
    category: i.status, // drives the status tabs
    price: '—',
    destination: trip,
    notes: i.notes || '',
    selected: prev?.selected || false,
    guest: { name, phone: i.customer_phone || '', email: i.customer_email || '', isPrimary: true },
    customer: {
      name,
      initials: initialsOf,
      phone: i.customer_phone || '—',
      email: i.customer_email || '—',
      location: i.location || '—',
      leadSource: i.lead_source || '—',
      preferredDestination: trip || '—',
      travelDates: fmtDate(i.travel_date),
      customerType: `${i.pax > 2 ? 'Group' : 'Couple / Solo'} (${i.pax} Pax)`,
      budgetEst: budget,
      status: STATUS_LABEL[i.status] || i.status,
      shortDetails: i.notes || 'No additional details recorded for this inquiry.',
      leadFlow: baselineFlow(i.customer_phone),
    },
    assignedTo: { name: staff?.name || i.assigned_to_name || 'Unassigned', avatar: staff?.avatar || '' },
    assignedStatus: i.assigned_to_id ? 'Assigned' : 'Unassigned',
    guests,
    itineraryDays: prev?.itineraryDays ?? JSON.parse(JSON.stringify(i.itinerary_days || [])),
    specialRequirements: [],
    updates: [{ title: 'Inquiry received', time: '', desc: `${i.customer_name || 'A new lead'} inquired${trip ? ` about ${trip}` : ''}${i.lead_source ? ` via ${i.lead_source}` : ''}.`, user: 'INFINITY Operations' }],
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
    const json = await res.json();
    if (Array.isArray(json.data) && json.data.length > 0) {
      state.raw = json.data;
      state.failed = false;
    } else {
      throw new Error('Empty data');
    }
  } catch {
    // If backend API is not available (e.g. static hosting or network error), populate from INITIAL_BOOKINGS
    if (!state.raw.length) {
      state.raw = INITIAL_BOOKINGS.map(b => ({
        id: b.id,
        customer_name: b.customer?.name || b.guest?.name || 'Customer',
        customer_phone: b.customer?.phone || b.guest?.phone || '',
        trip: b.title,
        pax: b.pax,
        travel_date: '2026-11-28',
        category: b.typeClass?.replace('badge-', '').toUpperCase() || 'TOUR',
        status: b.category === 'New Bookings' ? 'new' : 'ongoing',
        budget: b.rawPrice,
        freight_details: b.freight_details,
        lead_source: b.customer?.leadSource || 'Website',
        guests: [b.guest || { name: b.customer?.name, phone: b.customer?.phone, isPrimary: true }]
      }));
    }
    state.failed = false;
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

const JUST_ADDED_MS = 6000;
let freshTimer = null;

/** Highlight a row as "JUST ADDED" for about six seconds. */
export function markJustAdded(id) {
  const keep = state.list.filter((b) => b.justAdded);
  keep.forEach((b) => { b.justAdded = false; });
  const row = state.list.find((b) => b.id === id);
  if (row) row.justAdded = true;
  notify([...keep.map((b) => b.id), id]);
  clearTimeout(freshTimer);
  freshTimer = setTimeout(() => {
    const cur = state.list.find((b) => b.id === id);
    if (cur?.justAdded) { cur.justAdded = false; notify([id]); }
  }, JUST_ADDED_MS);
}

/**
 * Save a new inquiry (the Add Inquiry wizard): the inquiry, its guests and its itinerary in one request.
 * Resolves to the new row; throws an Error with a readable message when the server refuses.
 */
export async function createInquiry(payload) {
  let res;
  try {
    res = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
  } catch { throw new Error('Could not reach the server. Check your connection and try again.'); }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(Object.values(body.errors || {}).flat()[0] || body.message || `Could not save the inquiry (${res.status}).`);
  state.raw = [body.data, ...state.raw.filter((x) => x.id !== body.data.id)];
  state.loaded = true;
  state.failed = false;
  rebuild();
  notify();
  return state.list.find((b) => b.id === body.data.id);
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
    if (!res.ok) throw new Error(Object.values(body.errors || {}).flat()[0] || body.message || `Could not save the note (${res.status}).`);
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

/** On load, apply saved database records to the in-memory bookings. */
export async function syncBookingPayments() {
  try {
    const res = await fetch('/api/bookings', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const rows = (await res.json()).data || [];
    rows.forEach((r) => {
      const b = INITIAL_BOOKINGS.find((x) => x.id === r.id);
      if (!b) {
        INITIAL_BOOKINGS.push(r);
        return;
      }
      Object.assign(b, r);
      if (b.status !== r.status) { b.status = r.status; b.statusClass = r.status_class || r.statusClass; }
      if (Array.isArray(r.itinerary_days) && r.itinerary_days.length) b.itineraryDays = r.itinerary_days;
      if (Array.isArray(r.special_requirements)) b.specialRequirements = r.special_requirements;
      if (Array.isArray(r.guests)) { b.guests = r.guests; b.pax = r.guests.length; }
      if (r.customer) b.customer = r.customer;
      if (r.assigned_to && r.assigned_to.name) b.assignedTo = { ...(b.assignedTo || {}), name: r.assigned_to.name, avatar: r.assigned_to.avatar || b.assignedTo?.avatar || '' };
      markSaved(b);
    });
  } catch { /* standalone */ }
}

/** Update an inquiry and its freight details in the database. */
export async function updateInquiry(id, payload) {
  let res;
  try {
    res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Could not reach the server. Check your connection.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Could not update inquiry (${res.status}).`);
  const updated = body.data;
  const idx = state.raw.findIndex((x) => x.id === id);
  if (idx !== -1) {
    state.raw[idx] = updated;
  }
  rebuild();
  notify([id]);
  return state.list.find((b) => b.id === id);
}


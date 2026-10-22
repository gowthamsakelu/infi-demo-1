// Itinerary data helpers (days + events) and persistence, shared by Bookings and Inquiries.
import { toast } from './ui.js';

export const EVENT_TYPES = [
  { value: 'sightseeing', label: 'Sightseeing / Tour', icon: 'camera', iconKey: 'camera' },
  { value: 'transport', label: 'Transport / Bus', icon: 'bus', iconKey: 'bus' },
  { value: 'hotel', label: 'Hotel / Accommodation', icon: 'bed', iconKey: 'bed' },
  { value: 'activity', label: 'Sport / Adventure', icon: 'raft', iconKey: 'raft' },
  { value: 'food', label: 'Restaurant / Meal', icon: 'utensils', iconKey: 'restaurant' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON = Object.fromEntries(MONTHS.map((m, i) => [m.toLowerCase(), i]));

export const kindOf = (b) => (b.kind === 'inquiry' ? 'inquiries' : 'bookings');

/** First day of the trip as a Date, from the booking text ("18 Nov - 20 Nov 2024 (...)") or the inquiry travel date. */
export function tripStart(b) {
  if (b.kind === 'inquiry' && b.raw?.travel_date) {
    const d = new Date(`${b.raw.travel_date}T00:00:00`);
    return isNaN(d) ? null : d;
  }
  const text = b.travelDateFull || b.dates || '';
  const m = text.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (!m) return null;
  const year = Number((text.match(/\b(20\d{2})\b/) || [])[1]) || new Date().getFullYear();
  return new Date(year, MON[m[2].toLowerCase()], Number(m[1]));
}

export const fmtDay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

/** Label for day number n (1-based): "18 Nov" counted from the trip start, or "" when the trip has no dates. */
export function dateForDay(b, n) {
  const start = tripStart(b);
  if (!start) return '';
  const d = new Date(start);
  d.setDate(d.getDate() + n - 1);
  return fmtDay(d);
}

export const daysOf = (b) => (b.itineraryDays = b.itineraryDays || []);
export const dayName = (n) => `Day ${n}`;

/** Build the next (empty) day for a booking / inquiry. */
export function makeDay(b, title = '') {
  const n = daysOf(b).length + 1;
  return { day: dayName(n), date: dateForDay(b, n) || 'TBD', title: title.trim() || undefined, items: [] };
}

export function makeEvent({ title, subtitle, type }) {
  const t = EVENT_TYPES.find((x) => x.value === type) || EVENT_TYPES[0];
  return { id: `IT-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, type: t.value, icon: t.iconKey, title: title.trim(), subtitle: subtitle.trim() || 'Scheduled event', assigned: null, completed: false };
}

/** Renumber "Day n" labels (and dates, when the trip has a start date) after a day is removed. */
export function renumber(b) {
  daysOf(b).forEach((d, i) => { d.day = dayName(i + 1); const dt = dateForDay(b, i + 1); if (dt) d.date = dt; });
}

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * Save the whole itinerary. Call after mutating b.itineraryDays; pass the pre-change snapshot (from snapshot())
 * so the UI can roll back if the server refuses.
 */
export const snapshot = (b) => clone(daysOf(b));

export async function saveItinerary(b, before, { onRollback } = {}) {
  try {
    const res = await fetch(`/api/${kindOf(b)}/${encodeURIComponent(b.id)}/itinerary`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ days: daysOf(b) }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return true;
  } catch {
    b.itineraryDays = before;
    onRollback?.();
    toast('Could not save the itinerary. The change was reverted.', 'warning');
    return false;
  }
}

const base = new WeakMap();
/** Remember the last saved state of this record's itinerary (used to roll back a failed save). */
export const markSaved = (b) => base.set(b, snapshot(b));
/** Save the current itinerary after an in-place edit (complete, remove, edit, assign). */
export async function persist(b, { onRollback } = {}) {
  const ok = await saveItinerary(b, base.get(b) ?? snapshot(b), { onRollback });
  if (ok) markSaved(b);
  return ok;
}

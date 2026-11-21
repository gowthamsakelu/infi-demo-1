// Itinerary data helpers (days + events) and persistence, shared by Bookings and Inquiries.
import { toast, esc } from './ui.js';
import { icon } from './icons.js';

/** Label and icon of an event for the Assign sheet summary card. */
export function eventKind(item) {
  const key = { stay: ['Hotel', 'bed'], hotel: ['Hotel', 'bed'], transport: ['Transport', 'bus'], bus: ['Transport', 'bus'], meal: ['Meal', 'utensils'], food: ['Meal', 'utensils'], note: ['Note', 'note'] }[item.type];
  return key ? { label: key[0], icon: key[1] } : { label: 'Activity', icon: 'camera' };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON = Object.fromEntries(MONTHS.map((m, i) => [m.toLowerCase(), i]));

export const kindOf = (b) => (b.kind === 'inquiry' ? 'inquiries' : 'bookings');

// Icon of an event on the timeline: the stored icon first, then the event type (older and newer names both work).
const ICON_KEY = { bus: 'bus', transport: 'bus', bed: 'bed', hotel: 'bed', stay: 'bed', camera: 'camera', sightseeing: 'camera', raft: 'raft', activity: 'raft', restaurant: 'restaurant', food: 'restaurant', meal: 'restaurant', note: 'note' };
const ICON_NAME = { bus: 'bus', bed: 'bed', camera: 'camera', raft: 'raft', restaurant: 'utensils', note: 'note' };
export function itemIconHtml(item, size = 18) {
  const key = ICON_KEY[item.icon] || ICON_KEY[item.type] || 'restaurant';
  return `<div class="item-icon-box item-icon-${key}">${icon(ICON_NAME[key], { size })}</div>`;
}

/** "Not included" / "Staff only" pills shown on an event card. */
export function itemPills(item) {
  const out = [];
  if (item.inclusion === 'not_included') out.push('<span class="pill-not-included" title="Not included in the package">Not included</span>');
  if (item.type === 'note' && item.visibleToCustomer === false) out.push(`<span class="pill-staff-only" title="Staff only">${icon('lock', { size: 11, stroke: 2.4 })}Staff only</span>`);
  return out.join('');
}

/** First and last day of the trip as Dates ([null, null] when unknown). */
export function tripRange(b) {
  const start = tripStart(b);
  if (!start) return [null, null];
  if (b.kind === 'inquiry') {
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(0, (Number(b.raw?.nights) || 0)));
    return [start, end];
  }
  const text = b.travelDateFull || b.dates || '';
  const m = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s*[-–]\s*(\d{1,2})\s+([A-Za-z]{3})/);
  if (!m) return [start, start];
  const end = new Date(start.getFullYear(), MON[m[4].toLowerCase()], Number(m[3]));
  if (end < start) end.setFullYear(end.getFullYear() + 1);
  return [start, end];
}

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

export async function saveItinerary(b, before, { onRollback, meta } = {}) {
  try {
    const res = await fetch(`/api/${kindOf(b)}/${encodeURIComponent(b.id)}/itinerary`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ days: daysOf(b), ...(meta ? { meta } : {}) }),
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

// Calendar data and state, shared by the phone and desktop calendar views.
// Events come from GET /api/calendar/events for the visible month (padded to whole weeks); counts, dots and
// the agenda are all derived from them here.
import { getParams } from './page-state.js';

export const CATEGORIES = [
  { key: 'tours', label: 'Tours', icon: 'camera' },
  { key: 'activities', label: 'Activities', icon: 'raft' },
  { key: 'hotel', label: 'Hotel', icon: 'bed' },
  { key: 'transport', label: 'Transport', icon: 'bus' },
];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEAVY_DAY = 3; // this many events or more on a day = red dot

export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const todayYmd = () => ymd(new Date());
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** The Sunday-first weeks of a month, each a list of 7 Dates (days outside the month included). */
export function monthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay());
  const last = new Date(year, month + 1, 0);
  const weeks = [];
  for (let d = start; d <= last || weeks.length === 0; d = addDays(d, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
  return weeks;
}

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selected: todayYmd(),
  category: CATEGORIES[0].key,
  events: [],
  status: 'loading', // loading | ready | error
};
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
const cache = new Map();
let requestId = 0;

export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const getState = () => state;
export const query = () => (getParams().q || '').trim().toLowerCase();

const range = () => {
  const weeks = monthWeeks(state.year, state.month);
  return { from: ymd(weeks[0][0]), to: ymd(weeks[weeks.length - 1][6]) };
};

export async function load({ force = false } = {}) {
  const { from, to } = range();
  const key = `${from}|${to}`;
  const id = ++requestId;
  if (!force && cache.has(key)) {
    state.events = cache.get(key); state.status = 'ready'; notify();
    return;
  }
  state.status = 'loading'; notify(); // the previous month's events stay until the new ones arrive
  try {
    const res = await fetch(`/api/calendar/events?from=${from}&to=${to}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    const events = (await res.json()).data.events;
    cache.set(key, events);
    if (id !== requestId) return; // a newer month was requested meanwhile
    state.events = events; state.status = 'ready';
  } catch {
    if (id !== requestId) return;
    state.status = 'error';
  }
  notify();
}

/** Drop cached months (after a booking or itinerary changed) and reload the visible one. */
export const refetch = () => { cache.clear(); return load({ force: true }); };

export function setMonth(year, month, { selectDay } = {}) {
  const d = new Date(year, month, 1);
  state.year = d.getFullYear(); state.month = d.getMonth();
  // keep the same day-of-month where the new month has it; otherwise its last day
  const keep = parseYmd(state.selected).getDate();
  const day = selectDay ?? Math.min(keep, new Date(state.year, state.month + 1, 0).getDate());
  state.selected = ymd(new Date(state.year, state.month, day));
  return load();
}
export const shiftMonth = (n) => setMonth(state.year, state.month + n);

export function select(date) {
  const d = parseYmd(date);
  state.selected = date;
  if (d.getFullYear() !== state.year || d.getMonth() !== state.month) return setMonth(d.getFullYear(), d.getMonth(), { selectDay: d.getDate() });
  notify();
  return Promise.resolve();
}
export const goToToday = () => select(todayYmd());
export function setCategory(key) { if (state.category !== key) { state.category = key; notify(); } }

/** Events matching the top-bar search (name, trip, destination, phone). */
export function visibleEvents() {
  const q = query();
  if (!q) return state.events;
  return state.events.filter((e) => [e.customer, e.title, e.destination, e.phone, e.bookingId].some((t) => String(t || '').toLowerCase().includes(q)));
}

const inMonth = (e) => { const d = parseYmd(e.date); return d.getFullYear() === state.year && d.getMonth() === state.month; };

export function monthSummary() {
  const events = visibleEvents().filter(inMonth);
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]));
  events.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
  return { counts, bookings: new Set(events.map((e) => e.bookingId)).size };
}

/** 'heavy' | 'light' | '' for each date that has events (all categories). */
export function densityByDate() {
  const n = {};
  visibleEvents().forEach((e) => { n[e.date] = (n[e.date] || 0) + 1; });
  return Object.fromEntries(Object.entries(n).map(([d, c]) => [d, c >= HEAVY_DAY ? 'heavy' : 'light']));
}

/** Events of one category grouped by date, in date order. */
export function groupedByDate(category = state.category, { monthOnly = true } = {}) {
  const groups = new Map();
  visibleEvents().filter((e) => e.category === category && (!monthOnly || inMonth(e))).forEach((e) => {
    if (!groups.has(e.date)) groups.set(e.date, []);
    groups.get(e.date).push(e);
  });
  return groups;
}

export function dateLabel(date) {
  const d = parseYmd(date);
  const t = parseYmd(todayYmd());
  const diff = Math.round((d - t) / 86400000);
  const base = `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
  if (diff === 0) return `Today, ${base}`;
  if (diff === 1) return `Tomorrow, ${base}`;
  return `${WEEKDAYS[d.getDay()]}, ${base}`;
}

export const monthLabel = () => `${MONTH_NAMES[state.month]} ${state.year}`;

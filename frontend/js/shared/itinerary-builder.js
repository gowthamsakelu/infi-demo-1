// Itinerary builder model (no DOM). It turns a booking or inquiry into an editable plan (route, dates and, for every
// day, location, hotel, transport, activities, meals and notes), checks it, and turns it back into the day list the
// Day-wise Schedule timeline and the server use. Bookings and inquiries share all of it.
import { tripRange, daysOf } from './itinerary.js';

export const MEAL_PLANS = [
  { key: 'stay', label: 'Only stay', short: 'Stay only' },
  { key: 'bb', label: 'Stay + Breakfast', short: 'Breakfast' },
  { key: 'map', label: 'Stay + Breakfast & Dinner', short: 'MAP' },
  { key: 'all', label: 'Stay + all meals', short: 'All meals' },
  { key: 'other', label: 'Other', short: 'Other' },
];
export const TRANSPORT_MODES = ['Cab', 'Bus', 'Train', 'Flight', 'Boat', 'Other'];
export const MEAL_KINDS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
export const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Family room', 'Villa', 'Dormitory'];
export const VEHICLES = ['Hatchback', 'Sedan', 'SUV', 'Tempo Traveller', 'Mini bus', 'Coach', 'Other'];

const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDaysIso = (iso, n) => { const d = parseYmd(iso); d.setDate(d.getDate() + n); return ymd(d); };
export const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const fmtShort = (iso) => { const d = parseYmd(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtLong = (iso) => { const d = parseYmd(iso); return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const fmtRange = (a, b) => {
  const x = parseYmd(a); const y = parseYmd(b);
  if (a === b) return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
  return x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear()
    ? `${x.getDate()}–${y.getDate()} ${MONTHS[y.getMonth()]} ${y.getFullYear()}`
    : `${x.getDate()} ${MONTHS[x.getMonth()]} – ${y.getDate()} ${MONTHS[y.getMonth()]} ${y.getFullYear()}`;
};

/** '14:30' -> '02:30 PM' (the format the timeline and the calendar read). '' stays ''. */
export function to12h(v) {
  if (!v) return '';
  const [h, m] = v.split(':').map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}
/** '02:30 PM' -> '14:30'. */
export function to24h(v) {
  const m = String(v || '').match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) return '';
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return `${pad(h)}:${m[2]}`;
}
const minutes = (v) => { const t = to24h(v) || v; if (!/^\d{2}:\d{2}$/.test(t || '')) return null; return Number(t.slice(0, 2)) * 60 + Number(t.slice(3)); };

let seq = 0;
export const newId = (p) => `IT-${p}-${Date.now().toString(36)}${(seq++).toString(36)}`;

export const planOf = (stay) => MEAL_PLANS.find((p) => p.key === stay?.plan) || MEAL_PLANS[0];
export const planLabel = (stay) => (stay?.plan === 'other' && stay.planOther ? stay.planOther : planOf(stay).short);

export function blankDay(n, iso) {
  return { n, iso, title: '', locationMode: 'same', to: '', hotel: { mode: n === 1 ? 'different' : 'same', stay: null }, transport: { mode: n === 1 ? 'different' : 'same', items: [] }, activities: [], meals: [], notes: [], legacy: [] };
}

export const hasContent = (d) => !!(d.hotel.stay || d.transport.items.length || d.activities.length || d.meals.length || d.notes.length || d.legacy.length || d.locationMode === 'transit');

/** Everything about the plan that the user can change, as one comparable string. */
export const signature = (m) => JSON.stringify({ meta: m.meta, days: m.days });

/** Build the plan: from the saved itinerary when there is one, otherwise from the booking or inquiry. */
export function createModel(b, saved) {
  const [s, e] = tripRange(b);
  const meta = {
    origin: saved?.meta?.origin ?? b.customer?.location ?? b.raw?.location ?? '',
    destination: saved?.meta?.destination ?? b.destination ?? b.customer?.preferredDestination ?? '',
    stops: [...(saved?.meta?.stops ?? [])],
    start: saved?.meta?.startDate ?? (s ? ymd(s) : ''),
    end: saved?.meta?.endDate ?? (e ? ymd(e) : (s ? ymd(s) : '')),
  };
  const model = { meta, days: [], keep: {} };
  const saveDays = daysOf(b);
  if (saveDays.length) {
    fromDays(model, saveDays);
    if (!meta.start && saveDays[0]?.isoDate) meta.start = saveDays[0].isoDate;
    if (!meta.end && meta.start) meta.end = addDaysIso(meta.start, saveDays.length - 1);
    if (meta.start && meta.end && model.days.length < dayCount(meta)) padDays(model);
  } else {
    padDays(model);
    const d1 = model.days[0];
    if (d1 && meta.origin && meta.destination && meta.origin !== meta.destination) { d1.locationMode = 'transit'; d1.to = meta.stops[0] || meta.destination; }
  }
  return model;
}

export const dayCount = (meta) => (meta.start && meta.end && meta.end >= meta.start ? daysBetween(meta.start, meta.end) + 1 : 0);
export const nightCount = (meta) => Math.max(0, dayCount(meta) - 1);

function padDays(model) {
  const total = dayCount(model.meta);
  while (model.days.length < total) model.days.push(blankDay(model.days.length + 1, ''));
  redate(model);
}
function redate(model) {
  model.days.forEach((d, i) => { d.n = i + 1; d.iso = model.meta.start ? addDaysIso(model.meta.start, i) : ''; });
}

/** What changing the dates would do: how many days result and which existing days with content would be removed. */
export function planResize(model, start, end) {
  const total = start && end && end >= start ? daysBetween(start, end) + 1 : model.days.length;
  return { total, removing: model.days.slice(total).filter(hasContent) };
}
export function applyResize(model, start, end) {
  model.meta.start = start; model.meta.end = end;
  const total = dayCount(model.meta);
  if (model.days.length > total) model.days.length = total;
  padDays(model);
  redate(model);
}

/** Where the group is at the start (before = true) or end of day i. */
export function locationAfter(model, i) {
  let here = model.meta.origin || '';
  for (let k = 0; k <= i; k++) { const d = model.days[k]; if (d.locationMode === 'transit' && d.to) here = d.to; }
  return here;
}
export const locationBefore = (model, i) => (i === 0 ? model.meta.origin || '' : locationAfter(model, i - 1));

export function routeLabel(model, i) {
  const d = model.days[i];
  const from = locationBefore(model, i);
  if (d.locationMode === 'transit' && d.to) return `${from || 'Start'} → ${d.to}${i === 0 ? ' (Arrival Day)' : ''}`;
  return `${from || 'Trip'} (Local Day)`;
}

/** Places a day can travel to: the stops, the trip end, then anything added. */
export function placeChoices(model, i) {
  const here = locationBefore(model, i);
  const all = [...model.meta.stops, model.meta.destination, model.days[i].to].map((p) => (p || '').trim()).filter(Boolean);
  return [...new Set(all)].filter((p) => p !== here || p === model.days[i].to);
}

/** Runs of consecutive nights at one hotel: [{ from, stay, nights }]. A "same as previous" day extends the run. */
export function stayRuns(model) {
  const runs = [];
  let run = null;
  model.days.forEach((d, i) => {
    if (d.hotel.mode === 'different') { run = d.hotel.stay ? { from: i, stay: d.hotel.stay, nights: 1 } : null; if (run) runs.push(run); }
    else if (run) run.nights += 1;
  });
  return runs;
}

/** The vehicle a "same as previous day" transport day continues: the nearest earlier day that has transport. */
export function transportSource(model, i) {
  for (let k = i - 1; k >= 0; k--) {
    const d = model.days[k];
    if (d.transport.items.length) return d.transport.items.find((x) => x.vehicle) || d.transport.items[0];
    if (d.transport.mode !== 'same') return null;
  }
  return null;
}

/** Non-blocking things worth a second look. */
export function warnings(model) {
  const out = [];
  const last = model.days.length - 1;
  const runs = stayRuns(model);
  const covered = new Set();
  runs.forEach((r) => { for (let k = r.from; k < r.from + r.nights; k++) covered.add(k); });
  model.days.forEach((d, i) => { if (d.legacy.some((x) => x.type === 'stay' || x.type === 'hotel')) covered.add(i); });
  model.days.forEach((d, i) => {
    const n = i + 1;
    const overnight = d.transport.items.some((t) => t.plusDay > 0 && ['Bus', 'Train', 'Flight'].includes(t.mode));
    if (i < last && !covered.has(i) && !overnight) out.push({ day: n, text: `Day ${n} has no hotel for the night.` });
    if (i === last && !d.transport.items.length && !(d.transport.mode === 'same' && transportSource(model, i))) out.push({ day: n, text: `Day ${n} has no departure transport.` });
    const spans = [];
    d.transport.items.forEach((t) => { const a = minutes(t.dep); const z = t.plusDay ? null : minutes(t.arr); if (a !== null && z !== null) spans.push([a, z, t.title || `${t.from} to ${t.to}`]); });
    d.activities.forEach((a) => { const s = minutes(a.time); if (s !== null && a.durationMin) spans.push([s, s + a.durationMin, a.title]); });
    for (let x = 0; x < spans.length; x++) for (let y = x + 1; y < spans.length; y++) {
      if (spans[x][0] < spans[y][1] && spans[y][0] < spans[x][1]) out.push({ day: n, text: `Day ${n}: “${spans[x][2]}” and “${spans[y][2]}” overlap.` });
    }
  });
  return out;
}

/* ------------------------------------------------------------------------------------------------
   Plan -> days for the timeline and the server
   ------------------------------------------------------------------------------------------------ */

const clip = (s, n) => (String(s || '').length > n ? `${String(s).slice(0, n - 1)}…` : String(s || ''));
const joinDot = (...parts) => parts.filter(Boolean).join(' • ');

/** Assignment and completion made on the timeline are kept, unless the form just set them on the event itself. */
function withKeep(model, item) {
  const k = model.keep[item.id];
  const out = { assigned: null, completed: false, ...item };
  if (!('assigned' in item) && k?.assigned !== undefined) out.assigned = k.assigned;
  if (!('completed' in item) && k?.completed !== undefined) out.completed = k.completed;
  return out;
}
const priced = (price, quantity, total) => (price == null ? { price: null, quantity, totalPrice: total ?? null } : { price, quantity, totalPrice: total ?? Math.round(price * quantity * 100) / 100 });

export function toDays(model) {
  const runs = stayRuns(model);
  const days = model.days.map((d, i) => {
    const items = [];
    const run = runs.find((r) => i >= r.from && i < r.from + r.nights);
    if (run && run.from === i) {
      const s = run.stay;
      items.push({
        id: s.id, type: 'stay', icon: 'bed', title: `Check-in: ${s.name}`,
        subtitle: joinDot(to12h(s.checkInTime), `${s.city || ''}${s.city ? ' ' : ''}(${planLabel(s)})`.trim()),
        time: to12h(s.checkInTime) || null, location: s.city || null, inclusion: s.inclusion === 'paid_extra' ? 'paid_extra' : 'included',
        ...priced(s.price ?? null, (Number(s.rooms) || 1) * run.nights, null), priceOverridden: false, currency: 'INR', placeId: s.placeId || null,
        details: { b: { role: 'check_in', ...s, nights: run.nights } },
      });
    } else if (run) {
      const s = run.stay;
      items.push({
        id: `${s.id}-c${i + 1}`, type: 'stay', icon: 'bed', title: `Stay continues: ${s.name}`,
        subtitle: joinDot(s.city, `Night ${i - run.from + 1} of ${run.nights}`), location: s.city || null,
        details: { b: { role: 'continues', ref: s.id } },
      });
    }
    runs.forEach((r) => {
      if (r.from + r.nights === i) {
        items.push({
          id: `${r.stay.id}-out`, type: 'stay', icon: 'bed', title: `Check-out: ${r.stay.name}`,
          subtitle: joinDot(to12h(r.stay.checkOutTime), r.stay.city), time: to12h(r.stay.checkOutTime) || null,
          details: { b: { role: 'check_out', ref: r.stay.id } },
        });
      }
    });

    const source = d.transport.mode === 'same' && !d.transport.items.length && i > 0 ? transportSource(model, i) : null;
    if (source) {
      const t = source;
      items.push({ id: `${t.id}-s${i + 1}`, type: 'transport', icon: 'bus', title: `Same ${t.vehicle || t.mode || 'cab'} continues`, subtitle: t.driver || '', inclusion: t.arrangedBy === 'customer' ? 'not_included' : 'included', details: { b: { role: 'continues', ref: t.id } } });
    }
    d.transport.items.forEach((t) => {
      items.push({
        id: t.id, type: 'transport', icon: 'bus', title: t.title || `${t.from || 'Start'} to ${t.to || 'Destination'}`,
        subtitle: joinDot(to12h(t.dep), joinDot(t.vehicle || t.mode, t.driver)), time: to12h(t.dep) || null, endTime: to12h(t.arr) || null,
        inclusion: t.arrangedBy === 'customer' ? 'not_included' : 'included',
        ...priced(t.price ?? null, Number(t.days) || 1, t.totalPrice ?? null), priceOverridden: !!t.priceOverridden, currency: 'INR',
        vehicleTypeId: t.vehicleTypeId ?? null, assignedStaffId: t.assignedStaffId ?? null, ...('assigned' in t ? { assigned: t.assigned } : {}),
        details: { b: { role: 'transport', ...t } },
      });
    });
    d.activities.forEach((a) => {
      items.push({
        id: a.id, type: 'activity', icon: 'camera', title: a.title, subtitle: joinDot(to12h(a.time), a.place, a.duration),
        time: to12h(a.time) || null, location: a.place || null, inclusion: a.inclusion || 'included',
        ...priced(a.price ?? null, Number(a.tickets) || 1, null), priceOverridden: false, currency: 'INR', placeId: a.placeId || null,
        details: { b: { role: 'activity', ...a } },
      });
    });
    d.meals.forEach((m) => {
      items.push({
        id: m.id, type: 'meal', icon: 'restaurant', title: `${m.kind}${m.atHotel ? ' at hotel' : m.place ? `: ${m.place}` : ''}`,
        subtitle: joinDot(to12h(m.time), m.diet), time: to12h(m.time) || null, inclusion: m.inclusion || 'included',
        details: { b: { role: 'meal', ...m } },
      });
    });
    d.notes.forEach((n) => {
      items.push({
        id: n.id, type: 'note', icon: 'note', title: 'Note', subtitle: clip(n.text, 200), visibleToCustomer: n.visible !== false,
        details: { b: { role: 'note', ...n } },
      });
    });
    d.legacy.forEach((raw) => items.push({ ...raw }));

    return {
      day: `Day ${i + 1}`, date: d.iso ? fmtShort(d.iso) : 'TBD', isoDate: d.iso || null, title: d.title || null,
      location: d.locationMode === 'transit' ? d.to || null : (locationBefore(model, i) || null), locationMode: d.locationMode,
      items: items.map((it) => withKeep(model, it)),
    };
  });
  return days;
}

export function toMeta(model) {
  return { origin: model.meta.origin || null, destination: model.meta.destination || null, stops: [...model.meta.stops], startDate: model.meta.start || null, endDate: model.meta.end || null };
}

/** Saved days -> plan. Events the builder made carry their fields in details.b; any other event is kept as it is. */
function fromDays(model, days) {
  model.days = days.map((sd, i) => {
    const d = blankDay(i + 1, sd.isoDate || '');
    d.title = sd.title || '';
    d.locationMode = sd.locationMode === 'transit' ? 'transit' : 'same';
    d.to = d.locationMode === 'transit' ? (sd.location || '') : '';
    d.hotel.mode = i === 0 ? 'different' : 'same';
    d.transport.mode = i === 0 ? 'different' : 'same';
    (sd.items || []).forEach((it) => {
      model.keep[it.id] = { assigned: it.assigned ?? null, completed: !!it.completed };
      const b = it.details?.b;
      if (!b) { d.legacy.push(it); return; }
      const { role, ...rest } = b;
      if (role === 'check_in') { d.hotel.mode = 'different'; d.hotel.stay = { ...rest, id: it.id }; }
      else if (role === 'continues' && it.type === 'stay') d.hotel.mode = 'same';
      else if (role === 'continues' && it.type === 'transport') d.transport.mode = 'same';
      else if (role === 'transport') { d.transport.mode = 'different'; d.transport.items.push({ ...rest, id: it.id, assigned: it.assigned ?? null }); }
      else if (role === 'activity') d.activities.push({ ...rest, id: it.id });
      else if (role === 'meal') d.meals.push({ ...rest, id: it.id });
      else if (role === 'note') d.notes.push({ ...rest, id: it.id });
    });
    return d;
  });
  // A day that does not start a new hotel and has no earlier hotel to continue is simply "no hotel yet".
  model.days.forEach((d, i) => { if (i > 0 && d.hotel.mode === 'same' && !model.days.slice(0, i).some((p) => p.hotel.stay)) d.hotel.mode = 'different'; });
}

export const durationToMinutes = (text) => {
  const t = String(text || '').toLowerCase();
  const h = t.match(/(\d+(?:\.\d+)?)\s*h/); const m = t.match(/(\d+)\s*m/);
  const v = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  return v || (/^\d+$/.test(t.trim()) ? Number(t) * 60 : 0);
};

/** Copy the plan of one day onto another (hotel and transport are linked to the previous day, not copied). */
export function copyDay(model, from, to) {
  const src = model.days[from];
  const dst = model.days[to];
  const clone = (list) => list.map((x) => ({ ...x, id: newId('x') }));
  dst.activities = clone(src.activities);
  dst.meals = clone(src.meals);
  dst.notes = clone(src.notes);
  dst.transport.items = clone(src.transport.items);
  dst.transport.mode = src.transport.items.length ? 'different' : dst.transport.mode;
}

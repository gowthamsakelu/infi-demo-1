// Bookings filter config + matcher (consumed by the shared filter component).
import { STAFF_MEMBERS } from '../data.js';

export const BOOKING_FILTERS = {
  title: 'Filter bookings',
  fields: [
    {
      key: 'category', label: 'Category', type: 'select',
      options: [
        { value: 'TOUR', label: 'Tour Packages' },
        { value: 'VILLA', label: 'Villas & Resorts' },
        { value: 'ACTIVITY', label: 'Activities & Sports' },
        { value: 'TRANSPORT', label: 'Transports' },
      ],
    },
    {
      key: 'payment', label: 'Payment status', type: 'select',
      options: [{ value: 'Paid', label: 'Paid' }, { value: 'Part Paid', label: 'Part Paid' }, { value: 'Pending', label: 'Pending' }],
    },
    {
      key: 'assigned', label: 'Assigned to', type: 'select',
      options: [{ value: 'none', label: 'Unassigned' }, ...STAFF_MEMBERS.map((s) => ({ value: s.name, label: s.name }))],
    },
    { type: 'daterange', key: 'date', label: 'Travel date', fromKey: 'from', toKey: 'to' },
  ],
};

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/** "15 Jan - 20 Jan 2025 (5D / 4N)" -> { start, end } as YYYY-MM-DD strings, or null. */
export function bookingDateRange(b) {
  const text = b.travelDateFull || b.dates || '';
  const year = (text.match(/\b(20\d{2})\b/) || [])[1] || String(new Date().getFullYear());
  const days = [...text.matchAll(/(\d{1,2})\s+([A-Za-z]{3})/g)];
  if (!days.length) return null;
  const iso = (m) => `${year}-${String(MONTHS[m[2].toLowerCase()] + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return { start: iso(days[0]), end: iso(days[days.length - 1]) };
}

/** f: { category, payment, assigned, from, to } (empty string / undefined = no filter) */
export function matchesBookingFilters(b, f) {
  if (f.category) {
    const t = b.type.toUpperCase();
    if (f.category === 'VILLA' ? !(t === 'VILLA' || t === 'RESORT') : t !== f.category.toUpperCase()) return false;
  }
  if (f.payment && b.status !== f.payment) return false;
  if (f.assigned) {
    const name = b.assignedTo?.name || 'Unassigned';
    if (f.assigned === 'none' ? name !== 'Unassigned' : name !== f.assigned) return false;
  }
  if (f.from || f.to) {
    const r = bookingDateRange(b);
    if (!r) return false;
    if (f.from && r.end < f.from) return false;
    if (f.to && r.start > f.to) return false;
  }
  return true;
}

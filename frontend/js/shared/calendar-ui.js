// Markup shared by the phone and desktop calendar views. Cards reuse the compact list card, the itinerary icon boxes
// and the status badge; nothing here has its own colours.
import { icon } from './icons.js';
import { esc, errorState } from './ui.js';
import { INITIAL_BOOKINGS } from '../data.js';
import { CATEGORIES, dateLabel } from './calendar-store.js';

const ICON_CLASS = { tours: 'camera', activities: 'raft', hotel: 'bed', transport: 'bus' };
const bookingOf = (e) => INITIAL_BOOKINGS.find((b) => b.id === e.bookingId);

export const findBooking = (id) => INITIAL_BOOKINGS.find((b) => b.id === id) || null;

/** Tab definitions for the shared tabs component: the four categories with their counts. */
export const categoryTabs = (counts) => CATEGORIES.map((c) => ({ key: c.key, label: c.label, count: counts[c.key] || 0 }));

function iconBox(category) {
  const c = CATEGORIES.find((x) => x.key === category) || CATEGORIES[0];
  return `<div class="item-icon-box item-icon-${ICON_CLASS[category]}">${icon(c.icon, { size: 18 })}</div>`;
}

export function agendaCard(e, activeId) {
  const b = bookingOf(e);
  const badge = b ? `<span class="compact-status-badge ${esc(b.statusClass)}"><span class="dot"></span>${esc(b.status)}</span>` : '';
  return `
    <div class="cal-item-row" data-cal-row>
      <span class="cal-time">${e.time ? esc(e.time) : 'All day'}</span>
      <button type="button" class="compact-booking-card cal-card ${e.id === activeId ? 'active' : ''}" data-cal-event="${esc(e.id)}" data-booking-id-ref="${esc(e.bookingId)}">
        ${iconBox(e.category)}
        <span class="cal-card-text">
          <span class="cal-card-title">${esc(e.title)}</span>
          <span class="cal-card-sub">${esc(e.subtitle)}</span>
        </span>
        ${badge}
        ${icon('chevronRight', { size: 16 })}
      </button>
    </div>`;
}

/** One date: a collapsible heading and its timeline. Only dates with events are rendered. */
export function dateSection(date, events, { activeId, selected, collapsed = false }) {
  if (!events || !events.length) return '';
  const body = `<div class="cal-timeline">${events.map((e) => agendaCard(e, activeId)).join('')}</div>`;
  const meta = `${events.length} ${events.length === 1 ? 'item' : 'items'}`;
  return `
    <section class="cal-section ${selected ? 'is-selected' : ''} ${collapsed ? 'is-collapsed' : ''}" data-cal-date="${date}">
      <button type="button" class="cal-section-head" data-cal-toggle="${date}" aria-expanded="${!collapsed}">
        <span class="cal-section-title">${esc(dateLabel(date))}</span>
        <span class="cal-section-meta">${meta}${icon('chevronDown', { size: 14, cls: 'cal-chev' })}</span>
      </button>
      ${body}
    </section>`;
}

export const loadingAgenda = () => `
  <div class="cal-skeleton" aria-hidden="true">
    ${Array.from({ length: 4 }, () => '<div class="skel-card"><div class="skel skel-avatar"></div><div class="skel-lines"><div class="skel" style="width:70%"></div><div class="skel" style="width:50%"></div></div></div>').join('')}
  </div>`;

export const emptyAgenda = (text = 'No bookings this month') => `<div class="state-box"><h4>${esc(text)}</h4><p>Bookings and itinerary events appear here on their dates.</p></div>`;

export const errorAgenda = () => errorState({ title: 'Could not load the calendar', text: 'Check your connection and try again.', retryId: 'btn-retry-calendar' });

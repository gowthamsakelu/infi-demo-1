// The Day-wise Schedule (Itinerary tab): one component for the PC detail pane and the phone detail sheet, for Bookings and Inquiries.
// A narrow day column, a timeline line with a dot, and wide event cards. The markup differs between the two layouts only in the
// attribute names their click handlers already use, so those come in through `side`.
import { icon } from './icons.js';
import { esc } from './ui.js';
import { itemIconHtml, itemPills } from './itinerary.js';

const SIDES = {
  desktop: {
    addId: 'desktop-add-event-btn', itemAttr: 'data-desktop-itinerary-item-id', menuAttrs: 'data-trigger-desktop-item-menu', menuId: 'desktop-active-item-dropdown',
    act: (k, id) => `data-desktop-dropdown-act="${k}" data-dropdown-act="${k}" data-target-id="${id}"`,
  },
  mobile: {
    addId: 'mobile-add-event-btn', itemAttr: 'data-itinerary-item-id', menuAttrs: '', menuId: 'active-item-dropdown',
    act: (k, id) => `data-dropdown-act="${k}" data-target-id="${id}"`,
  },
};

const MENU_ICONS = {
  assign: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  details: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  complete: '<rect width="18" height="18" x="3" y="3" rx="2"/><polyline points="9 12 11 14 15 10"/>',
  remove: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
};

/** "07:30 AM • Lunch at hotel": the time gets its own weight so a day can be scanned by time. */
function subtitleHtml(item) {
  const sub = item.subtitle || '';
  const t = item.time;
  if (t && sub.startsWith(t)) return `<span class="item-time">${esc(t)}</span>${esc(sub.slice(t.length))}`;
  return esc(sub);
}

function menuItem(side, key, label, item, extra = '') {
  return `<button class="dropdown-item-btn ${extra}" ${side.act(key, item.id)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${MENU_ICONS[key === 'remove' ? 'remove' : key]}</svg><span>${label}</span></button>`;
}

function itemHtml(item, side, openItemId) {
  const assigned = item.assigned && item.assigned.isAssigned;
  // Status pills sit under the text, so the title keeps the card's width and only the menu button stays on the right.
  const badges = [
    itemPills(item),
    item.completed ? `<span class="completed-pill-badge" title="Completed">${icon('check', { size: 10, stroke: 3 })}Completed</span>` : '',
    assigned ? `<span class="assigned-pill-badge">Assigned</span><img src="${esc(item.assigned.avatar)}" class="assigned-avatar-mini" alt="${esc(item.assigned.name)}" title="Assigned to ${esc(item.assigned.name)}" />` : '',
  ].join('');
  return `
    <div class="itinerary-card-item ${item.completed ? 'is-completed' : ''}" ${side.itemAttr}="${esc(item.id)}">
      <div class="item-left-content">
        ${itemIconHtml(item, 22)}
        <div class="item-text-info">
          <h4 class="item-text-title">${esc(item.title)}</h4>
          <p class="item-text-sub">${subtitleHtml(item)}</p>
          ${badges ? `<div class="item-badges">${badges}</div>` : ''}
        </div>
      </div>
      <div class="item-right-content">
        <button class="item-menu-btn" ${side.menuAttrs ? `${side.menuAttrs}="${esc(item.id)}"` : ''} data-trigger-item-menu="${esc(item.id)}" aria-haspopup="menu" aria-label="Options for ${esc(item.title)}" title="Actions">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
        ${openItemId === item.id ? `
          <div class="item-dropdown-menu" id="${side.menuId}">
            ${menuItem(side, 'assign', 'Assign', item)}
            ${menuItem(side, 'details', 'View Details', item)}
            ${menuItem(side, 'edit', 'Edit', item)}
            ${menuItem(side, 'complete', item.completed ? 'Mark as Incomplete' : 'Mark Complete', item)}
            ${menuItem(side, 'remove', 'Remove', item, 'item-remove')}
          </div>` : ''}
      </div>
    </div>`;
}

/**
 * The whole Itinerary tab body.
 * @param {object[]} days  the booking's or inquiry's itineraryDays
 * @param {{ side: 'desktop'|'mobile', openItemId?: string|null }} opts  openItemId = the event whose menu is open
 */
export function scheduleHtml(days, { side: sideKey, openItemId = null }) {
  const side = SIDES[sideKey];
  return `
    <div class="itinerary-tab-content" data-schedule="${sideKey}">
      <div class="itinerary-section-header-bar">
        <div class="section-header-left">
          <div class="section-icon-circle blue-circle">${icon('calendar', { size: 15, stroke: 2.2 })}</div>
          <h3 class="schedule-title">Day-wise Schedule</h3>
        </div>
        <div class="itin-actions"><button class="btn-add-event-pill" id="${side.addId}">${icon('plus', { size: 13, stroke: 2.5 })}Add Event</button></div>
      </div>

      <div class="itinerary-v2-container">
        ${days.length === 0 ? '<div class="state-box"><h4>No itinerary yet</h4><p>Use Add Event to create the first day.</p></div>' : ''}
        ${days.map((d, dayIdx) => `
          <div class="itinerary-day-section">
            <div class="timeline-day-col">
              <div class="day-head"><span class="day-badge-text">${esc(d.day)}</span></div>
              <span class="day-date-sub">${esc(d.date)}</span>
              ${d.title ? `<span class="day-title-sub">${esc(d.title)}</span>` : ''}
              <button class="day-menu-btn" data-day-menu="${dayIdx}" aria-haspopup="menu" aria-label="Options for ${esc(d.day)}">${icon('more', { size: 14 })}</button>
            </div>
            <div class="timeline-track-col"><div class="timeline-line-track"></div><div class="timeline-dot-node"></div></div>
            <div class="timeline-items-col">
              ${d.items.length ? '' : '<p class="day-empty">No events yet</p>'}
              ${d.items.map((item) => itemHtml(item, side, openItemId)).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

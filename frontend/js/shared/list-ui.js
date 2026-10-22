// List components shared by the Bookings and Inquiries pages (desktop + mobile):
// scrolling status tabs, avatar, mobile row card, desktop action cell, bulk bar, quick note, row menus.
import { icon } from './icons.js';
import { esc, initials, contactButtons, rowMenuButton, checkbox } from './ui.js';

/* ---------- Status tabs (one component; horizontal scroll on mobile) ---------- */

/**
 * Render status tabs into `host`. tabs: [{ key, label, count }].
 * variant 'mobile' = scrolling pills with count badge; 'desktop' = toolbar tabs "Label (n)";
 * 'compact' = small tabs of the split-view list. `attr` is the data-attribute carrying the key.
 */
export function renderTabs(host, { tabs, active, variant = 'desktop', attr = 'data-tab' }) {
  if (!host) return;
  const scroller = variant === 'mobile' ? host.querySelector('.category-filter-tabs') : host.firstElementChild;
  const left = scroller ? scroller.scrollLeft : 0;
  const item = (t) => {
    const on = t.key === active;
    if (variant === 'mobile') {
      return `<button class="tab-pill ${on ? 'active' : ''}" role="tab" aria-selected="${on}" ${attr}="${esc(t.key)}">${esc(t.label)} <span class="pill-badge">${t.count}</span></button>`;
    }
    const cls = variant === 'compact' ? 'compact-tab-btn' : 'desktop-tab-btn';
    const short = variant === 'compact' ? t.short || t.label : t.label;
    return `<button class="${cls} ${on ? 'active' : ''}" role="tab" aria-selected="${on}" ${attr}="${esc(t.key)}">${esc(short)} (${t.count})</button>`;
  };
  const wrap = { mobile: 'category-filter-tabs', desktop: 'toolbar-tabs-group', compact: 'compact-tabs-nav' }[variant];
  host.innerHTML = `<div class="${wrap} tabs-scroller" role="tablist">${tabs.map(item).join('')}</div>`;
  const el = host.firstElementChild;
  el.scrollLeft = left;
  bindTabsScroller(el);
  // Bring the active tab into view only when the selection changed (not on every re-render).
  if (host.dataset.active !== String(active)) {
    host.dataset.active = String(active);
    const on = el.querySelector('[aria-selected="true"]');
    if (on) el.scrollLeft = Math.max(0, on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2);
  }
}

/** Momentum touch scroll is native; add mouse-drag, wheel-to-horizontal and edge fades. */
function bindTabsScroller(el) {
  const fade = () => {
    el.classList.toggle('fade-left', el.scrollLeft > 4);
    el.classList.toggle('fade-right', el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  fade();
  el.addEventListener('scroll', fade, { passive: true });
  let down = false, startX = 0, startLeft = 0, moved = false;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    el.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => { down = false; });
  el.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  requestAnimationFrame(fade);
}

/* ---------- Avatar + badges ---------- */

export const avatar = (name, cls = '') => `<div class="row-avatar ${cls}" aria-hidden="true">${esc(initials(name))}</div>`;
export const categoryBadge = (b, extra = '') => `<span class="card-type-badge ${b.typeClass}" ${extra}>${esc(b.type)}</span>`;
export const statusPill = (b) => `<span class="status-pill ${b.statusClass}"><span class="dot"></span>${esc(b.status)}</span>`;

/* ---------- Row actions: Phone, WhatsApp, ⋮ ---------- */

export function rowActionButtons(b, size = 15, style = '') {
  const name = b.guest.name;
  return `${contactButtons({ id: b.id, name, phone: b.guest.phone, size, style })}${rowMenuButton({ id: b.id, name, size, attr: 'data-row-menu' })}`;
}

/** Items of the ⋮ menu, per page. */
export function rowMenuItems(b) {
  const common = [{ key: 'assign', label: 'Assign', icon: 'assign' }, { key: 'view', label: 'View details', icon: 'eye' }];
  if (b.kind === 'inquiry') {
    return [...common, { key: 'email', label: 'Email', icon: 'mail' }, { key: 'followup', label: 'Follow up', icon: 'calendar' }];
  }
  return [...common, b.status === 'Paid' ? { key: 'unpaid', label: 'Mark as Unpaid', icon: 'alertCircle' } : { key: 'paid', label: 'Mark as Paid', icon: 'checkCircle' }];
}

/** Items handed to the shared Assign sheet. */
export function assignItems(list) {
  return list.map((b) => ({
    id: b.id, title: b.title, name: b.guest.name,
    badge: b.kind === 'inquiry' ? b.status : '', badgeClass: b.kind === 'inquiry' ? b.statusClass : '',
  }));
}

/* ---------- Quick note (Inquiries only) ---------- */

export function quickNote(b, cls = '') {
  return `<form class="quick-note ${cls}" data-quick-note="${esc(b.id)}" autocomplete="off">
    <input type="text" maxlength="500" placeholder="Add a note..." enterkeyhint="send" aria-label="Quick note for ${esc(b.guest.name)}" />
    <button type="submit" class="quick-note-send card-circle-action-btn" aria-label="Send note">${icon('send', { size: 15 })}</button>
  </form>`;
}

/* ---------- Mobile row card (Bookings + Inquiries) ---------- */

export function mobileRowCard(b) {
  const inquiry = b.kind === 'inquiry';
  return `
    <div class="booking-card list-row-card ${inquiry ? 'is-inquiry' : ''} ${b.selected ? 'card-selected' : ''}" data-booking-id="${esc(b.id)}">
      <div class="row-lead-col">
        ${avatar(b.guest.name)}
        ${checkbox({ checked: b.selected, attr: 'data-select-id', id: b.id, label: `Select ${b.guest.name}` })}
      </div>
      <div class="card-info-col">
        <div class="row-name-line">
          <h3 class="card-title">${esc(b.guest.name)}</h3>
          ${categoryBadge(b)}
        </div>
        <p class="row-trip">${esc(b.title)}</p>
        <div class="card-meta-row">${icon('user', { size: 13 })}<span>${b.pax} Pax • ${esc(b.duration)}</span></div>
        <div class="card-meta-row">${icon('calendar', { size: 13 })}<span>${esc(b.dates)}</span></div>
      </div>
      <div class="card-right-col">
        <div class="card-action-btns-row">${rowActionButtons(b, 15)}</div>
        <div class="card-price-status-row">
          ${inquiry ? statusPill(b) : `<span class="card-price">${esc(b.price)}</span>${statusPill(b)}`}
        </div>
        ${inquiry ? quickNote(b) : ''}
      </div>
      ${inquiry ? quickNote(b, 'qn-row') : ''}
    </div>`;
}

/* ---------- Bulk bar: "N selected ▾" · search · filter · Assign ---------- */

export function bulkBar(prefix, { desktop = false } = {}) {
  return `
    <div class="mobile-selection-bar bulk-bar ${desktop ? 'desktop-selection-bar' : ''}" id="${prefix}-selection-bar" style="display:none;">
      <div class="bulk-count-wrap">
        <button type="button" class="bulk-count-btn" id="${prefix}-count-btn" aria-haspopup="menu" aria-expanded="false">
          <span id="${prefix}-selected-count">0 selected</span>${icon('chevronDown', { size: 14, stroke: 2.5 })}
        </button>
        <div class="bulk-more-dropdown" id="${prefix}-count-menu" role="menu" style="display:none;">
          <button class="dropdown-item-btn" role="menuitem" data-bulk-select-all>${icon('check', { size: 15 })}<span>Select all</span></button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item-btn item-danger" role="menuitem" data-bulk-clear>${icon('close', { size: 14 })}<span>Clear selection</span></button>
        </div>
      </div>
      <div class="bulk-actions">
        <button type="button" class="btn-primary-desktop bulk-assign-btn" data-bulk-assign>${icon('assign', { size: 16 })}<span>Assign</span></button>
      </div>
    </div>`;
}

/** Wire the bulk bar's count menu (Select all / Clear). Returns nothing; actions call back. */
export function bindBulkBar(root, prefix, { onSelectAll, onClear, onAssign }) {
  const btn = root.querySelector(`#${prefix}-count-btn`);
  const menu = root.querySelector(`#${prefix}-count-menu`);
  if (!btn) return;
  const set = (open) => { menu.style.display = open ? 'block' : 'none'; btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); set(menu.style.display === 'none'); });
  document.addEventListener('mousedown', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  menu.addEventListener('click', (e) => {
    set(false);
    if (e.target.closest('[data-bulk-select-all]')) onSelectAll();
    if (e.target.closest('[data-bulk-clear]')) onClear();
  });
  root.querySelector(`#${prefix}-selection-bar`).addEventListener('click', (e) => {
    if (e.target.closest('[data-bulk-assign]')) onAssign();
  });
}

export function updateBulkBar(root, prefix, selectedCount) {
  const bar = root.querySelector(`#${prefix}-selection-bar`);
  if (!bar) return;
  bar.style.display = selectedCount > 0 ? 'flex' : 'none';
  const c = root.querySelector(`#${prefix}-selected-count`);
  if (c) c.textContent = `${selectedCount} selected`;
}

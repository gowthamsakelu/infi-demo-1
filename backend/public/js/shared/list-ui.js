// List components shared by the Bookings and Inquiries pages (desktop + mobile):
// scrolling status tabs, avatar, mobile row card, desktop action cell, bulk bar, quick note, row menus.
import { icon } from './icons.js';
import { esc, initials, contactButtons, rowMenuButton, checkbox, openRowMenu } from './ui.js';

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

/**
 * Momentum touch scroll is native; add mouse-drag (mouse only), wheel-to-horizontal and edge fades.
 * The window listeners exist once for the whole app and act on whichever scroller the mouse went down on,
 * so re-rendering a tab row never adds more of them.
 */
let drag = null;
window.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.startX;
  if (Math.abs(dx) > 4) drag.moved = true;
  drag.el.scrollLeft = drag.startLeft - dx;
});
window.addEventListener('pointerup', () => { if (drag) { const d = drag; drag = null; if (d.moved) d.el.dataset.dragged = '1'; } });

function bindTabsScroller(el) {
  let fadeQueued = false;
  const fade = () => {
    fadeQueued = false;
    el.classList.toggle('fade-left', el.scrollLeft > 4);
    el.classList.toggle('fade-right', el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const queueFade = () => { if (!fadeQueued) { fadeQueued = true; requestAnimationFrame(fade); } };
  fade();
  el.addEventListener('scroll', queueFade, { passive: true });
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    drag = { el, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  });
  el.addEventListener('click', (e) => { if (el.dataset.dragged) { delete el.dataset.dragged; e.stopPropagation(); e.preventDefault(); } }, true);
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
    <input type="text" maxlength="500" placeholder="Type a quick note…" enterkeyhint="send" aria-label="Quick note for ${esc(b.guest.name)}" />
    <button type="submit" class="quick-note-send" aria-label="Send note" disabled>${icon('send', { size: 15 })}</button>
  </form>`;
}

/** Keep every Send button disabled while its note is empty. One listener per view root. */
export function bindQuickNotes(root) {
  root.addEventListener('input', (e) => {
    const input = e.target.closest?.('.quick-note input');
    if (input) input.form.querySelector('.quick-note-send').disabled = !input.value.trim();
  });
}

/* ---------- Row card (Bookings + Inquiries, phone list and PC split list) ---------- */

/** `split` = the card in the PC split list (own data attributes for its click and checkbox handlers); `active` = the open record. */
export function rowCard(b, { split = false, active = false } = {}) {
  const inquiry = b.kind === 'inquiry';
  return `
    <div class="booking-card list-row-card ${inquiry ? 'is-inquiry' : ''} ${b.selected ? 'card-selected' : ''} ${active ? 'active' : ''}" ${split ? 'data-compact-booking-id' : 'data-booking-id'}="${esc(b.id)}">
      <div class="row-lead-col">
        ${avatar(b.guest.name)}
        ${checkbox({ checked: b.selected, attr: split ? 'data-desktop-select-id' : 'data-select-id', id: b.id, label: `Select ${b.guest.name}` })}
      </div>
      <div class="card-info-col">
        <div class="row-name-line">
          <h3 class="card-title">${esc(b.guest.name)}</h3>
          ${inquiry ? statusPill(b) : categoryBadge(b)}
        </div>
        <p class="row-trip">${esc(b.title)}</p>
        <div class="card-meta-row">${icon('user', { size: 13 })}<span>${b.pax} Pax • ${esc(b.duration)}</span></div>
        <div class="card-meta-row">${icon('calendar', { size: 13 })}<span>${esc(b.dates)}</span></div>
      </div>
      <div class="card-right-col">
        <div class="card-action-btns-row">${rowActionButtons(b, 15)}</div>
        ${inquiry ? quickNote(b) : `<div class="card-price-status-row"><span class="card-price">${esc(b.price)}</span>${statusPill(b)}</div>`}
      </div>
    </div>`;
}

/* ---------- Bulk bar: "N selected ▾" · search · filter · Assign ---------- */

export function bulkBar(prefix, { desktop = false } = {}) {
  return `
    <div class="bulk-wrap" id="${prefix}-bulk-wrap" inert>
      <div class="bulk-collapse">
        <div class="mobile-selection-bar bulk-bar ${desktop ? 'desktop-selection-bar' : ''}" id="${prefix}-selection-bar">
          <button type="button" class="bulk-count-btn" id="${prefix}-count-btn" aria-haspopup="menu" aria-expanded="false">
            <span id="${prefix}-selected-count">0 selected</span>${icon('chevronDown', { size: 14, stroke: 2.5 })}
          </button>
          <div class="bulk-actions">
            <button type="button" class="btn-primary-desktop bulk-assign-btn" data-bulk-assign>${icon('assign', { size: 16 })}<span>Assign</span></button>
          </div>
        </div>
      </div>
    </div>`;
}

/** The same bar, inline: it overlays the split list's search row while rows are selected (same height, no layout shift). */
export function inlineSelectionBar(prefix) {
  return `
    <div class="mobile-selection-bar bulk-bar compact-selection-bar" id="${prefix}-selection-bar" inert>
      <button type="button" class="bulk-count-btn" id="${prefix}-count-btn" aria-haspopup="menu" aria-expanded="false">
        <span id="${prefix}-selected-count">0 selected</span>${icon('chevronDown', { size: 14, stroke: 2.5 })}
      </button>
      <div class="bulk-actions">
        <button type="button" class="btn-primary-desktop bulk-assign-btn" data-bulk-assign>${icon('assign', { size: 16 })}<span>Assign</span></button>
      </div>
    </div>`;
}

/** Show the inline bar (and hide the controls it covers) when something is selected; update its count in place. */
export function updateInlineBar(root, prefix, selectedCount) {
  const bar = root.querySelector(`#${prefix}-selection-bar`);
  if (!bar) return;
  const on = selectedCount > 0;
  const top = bar.parentElement;
  top.classList.toggle('is-selecting', on);
  bar.toggleAttribute('inert', !on);
  [...top.children].forEach((el) => { if (el !== bar && !el.matches('.btn-expand-full-table')) el.toggleAttribute('inert', on); });
  if (on) root.querySelector(`#${prefix}-selected-count`).textContent = `${selectedCount} selected`;
}

/** Wire the bulk bar: the count menu (Select all / Clear) and Assign. `selectAllLabel` can show the real count. */
export function bindBulkBar(root, prefix, { onSelectAll, onClear, onAssign, selectAllLabel = () => 'Select all' }) {
  const btn = root.querySelector(`#${prefix}-count-btn`);
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openRowMenu(btn, [
      { key: 'all', label: selectAllLabel(), icon: 'check' },
      { key: 'clear', label: 'Clear selection', icon: 'close', danger: true },
    ], (key) => (key === 'all' ? onSelectAll() : onClear()));
  });
  root.querySelector(`#${prefix}-selection-bar`).addEventListener('click', (e) => {
    if (e.target.closest('[data-bulk-assign]')) onAssign();
  });
}

/** Slide the bar in/out (grid-rows 0fr -> 1fr) and update the count in place. */
export function updateBulkBar(root, prefix, selectedCount) {
  const wrap = root.querySelector(`#${prefix}-bulk-wrap`);
  if (!wrap) return;
  const open = selectedCount > 0;
  if (open) wrap.removeAttribute('inert'); else wrap.setAttribute('inert', '');
  wrap.classList.toggle('is-open', open);
  if (open) {
    const c = root.querySelector(`#${prefix}-selected-count`);
    if (c) c.textContent = `${selectedCount} selected`;
  }
}

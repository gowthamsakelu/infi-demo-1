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
  const wrap = { mobile: 'category-filter-tabs', desktop: 'toolbar-tabs-group', compact: 'compact-tabs-nav' }[variant];
  const scroller = host.firstElementChild;
  const buttons = scroller ? [...scroller.children] : [];
  const label = (t) => variant === 'compact' ? t.short || t.label : t.label;
  // Data arrives after the first paint. Keep the scroller AND its buttons alive so
  // count/filter updates cannot cancel an in-progress touch or reset its momentum.
  if (scroller?.classList.contains(wrap) && buttons.length === tabs.length && buttons.every((b, i) => b.getAttribute(attr) === String(tabs[i].key))) {
    buttons.forEach((button, i) => {
      const t = tabs[i];
      const on = t.key === active;
      button.classList.toggle('active', on);
      if (button.getAttribute('aria-selected') !== String(on)) button.setAttribute('aria-selected', String(on));
      const caption = variant === 'mobile' ? `${label(t)}${t.count == null ? '' : ' '}` : `${label(t)}${t.count == null ? '' : ` (${t.count})`}`;
      const textNode = Array.from(button.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
      if (textNode) {
        if (textNode.nodeValue !== caption) textNode.nodeValue = caption;
      } else if (button.firstChild && button.firstChild.nodeType === Node.TEXT_NODE) {
        if (button.firstChild.nodeValue !== caption) button.firstChild.nodeValue = caption;
      }
      if (variant === 'mobile') {
        let badge = button.querySelector('.pill-badge');
        if (t.count == null) badge?.remove();
        else {
          if (!badge) { badge = document.createElement('span'); badge.className = 'pill-badge'; button.append(badge); }
          if (badge.textContent !== String(t.count)) badge.textContent = String(t.count);
        }
      }
    });
    return;
  }
  const item = (t) => {
    const on = t.key === active;
    if (variant === 'mobile') {
      return `<button class="tab-pill ${on ? 'active' : ''}" role="tab" aria-selected="${on}" ${attr}="${esc(t.key)}">${esc(t.label)}${t.count == null ? '' : ` <span class="pill-badge">${t.count}</span>`}</button>`;
    }
    const cls = variant === 'compact' ? 'compact-tab-btn' : 'desktop-tab-btn';
    const short = variant === 'compact' ? t.short || t.label : t.label;
    return `<button class="${cls} ${on ? 'active' : ''}" role="tab" aria-selected="${on}" ${attr}="${esc(t.key)}">${esc(short)}${t.count == null ? '' : ` (${t.count})`}</button>`;
  };
  host.innerHTML = `<div class="${wrap} tabs-scroller scroll-row" role="tablist">${tabs.map(item).join('')}</div>`;
  const el = host.firstElementChild;
  bindTabsScroller(el);
  // the active tab is kept in view by watchScrollRows (below)
}

/**
 * Keep the active item of every .scroll-row in view, with its row's 16px edge: when a tab, pill or chip becomes active (on load, on tap, after a
 * re-render) and is not fully visible, the row scrolls it into view smoothly. Manual scrolling never changes the selection or triggers a reveal.
 * Call once at start-up; it watches the whole page.
 */
export function watchScrollRows() {
  const ACTIVE = '.active, .is-selected, .is-on, [aria-selected="true"]';
  const selections = new WeakMap();
  const reveal = (row) => {
    const on = row.querySelector(ACTIVE);
    if (!on || row.scrollWidth <= row.clientWidth) return;
    const edge = 16;
    const r = row.getBoundingClientRect();
    const o = on.getBoundingClientRect();
    let dx = 0;
    if (o.left < r.left + edge) dx = o.left - r.left - edge;
    else if (o.right > r.right - edge) dx = o.right - r.right + edge;
    if (Math.abs(dx) > 1) row.scrollTo({ left: row.scrollLeft + dx, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const queued = new Set();
  const flush = () => {
    const rows = [...queued];
    queued.clear();
    rows.forEach((row) => {
      if (!row.isConnected) return;
      const selected = row.querySelector(ACTIVE);
      if (selections.get(row) === selected) return;
      selections.set(row, selected);
      reveal(row);
    });
  };
  const queue = (node) => {
    const el = node.nodeType === 1 ? node : node.parentElement;
    const row = el?.closest?.('.scroll-row');
    if (row) { if (!queued.size) requestAnimationFrame(() => requestAnimationFrame(flush)); queued.add(row); }
    if (el?.querySelectorAll) el.querySelectorAll('.scroll-row').forEach((r) => { if (!queued.size) requestAnimationFrame(() => requestAnimationFrame(flush)); queued.add(r); });
  };
  const selectedClasses = (value) => (value || '').split(/\s+/).filter((c) => ['active', 'is-selected', 'is-on'].includes(c)).sort().join(' ');
  new MutationObserver((list) => list.forEach((m) => {
    if (m.type === 'attributes') {
      // Edge fades change while scrolling. They must never scroll back to the active chip.
      if (m.attributeName === 'class' && selectedClasses(m.oldValue) === selectedClasses(m.target.getAttribute('class'))) return;
      queue(m.target);
    } else {
      queue(m.target);
      m.addedNodes.forEach(queue);
    }
  }))
    .observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'aria-selected'] });
  // A gesture can start before the initial reveal is painted; the user's scroll wins.
  const rememberSelection = (e) => {
    const row = e.target.closest?.('.scroll-row');
    if (row) selections.set(row, row.querySelector(ACTIVE));
  };
  document.addEventListener('pointerdown', rememberSelection, { capture: true, passive: true });
  document.addEventListener('wheel', rememberSelection, { capture: true, passive: true });
  queue(document.body);
  window.addEventListener('layout-changed', () => document.querySelectorAll('.scroll-row').forEach(reveal));
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
window.addEventListener('pointercancel', () => { drag = null; });
window.addEventListener('blur', () => { drag = null; });
// Run before the page's capture-phase tab handlers, so a mouse drag cannot also select a tab.
window.addEventListener('click', (e) => {
  const row = e.target.closest?.('.tabs-scroller[data-dragged]');
  if (!row || !e.detail) return;
  delete row.dataset.dragged;
  e.preventDefault();
  e.stopImmediatePropagation();
}, true);

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
  el.addEventListener('selectstart', (e) => e.preventDefault());
  el.addEventListener('pointerdown', (e) => {
    delete el.dataset.dragged;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { el, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  });
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { el.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  requestAnimationFrame(fade);
}

/* ---------- Avatar + badges ---------- */

export const avatar = (name, cls = '') => `<div class="row-avatar ${cls}" aria-hidden="true">${esc(initials(name))}</div>`;
export const categoryBadge = (b, extra = '') => `<span class="card-type-badge ${b.typeClass}" ${extra}>${esc(b.type)}</span>`;
export const statusPill = (b) => `<span class="status-pill ${b.statusClass}"><span class="dot"></span>${esc(b.status)}</span>`;

/** Route or Pax line */
export const paxLine = (b) => {
  if (b.freight_details || b.kind === 'inquiry') {
    const fd = b.freight_details || {};
    const req = fd.requirements || {};
    const mode = req.service_type || fd.mode || 'Sea Freight';
    const origin = req.pol_origin ? req.pol_origin.split('(')[0].trim() : (fd.origin || 'Mumbai');
    const dest = req.pod_destination ? req.pod_destination.split('(')[0].trim() : (fd.destination || 'Dubai');
    const container = req.shipment_mode || req.container_type || fd.container || (b.pax ? `${b.pax} TEU` : 'FCL 40ft');
    return `${mode} • ${origin} to ${dest} • ${container}`;
  }
  return (b.pax ? `${b.pax} Pax${b.duration ? ` • ${b.duration}` : ''}` : '—');
};

/** The tag an inquiry carries for a few seconds after it was added. */
export const justAddedTag = (b) => (b.justAdded ? '<span class="just-added-tag">JUST ADDED</span>' : '');

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
    <div class="booking-card list-row-card ${inquiry ? 'is-inquiry' : ''} ${b.selected ? 'card-selected' : ''} ${active ? 'active' : ''} ${b.justAdded ? 'is-fresh' : ''}" ${split ? 'data-compact-booking-id' : 'data-booking-id'}="${esc(b.id)}"${split ? ` id="opt-${esc(b.id)}" role="option" aria-selected="${!!active}"` : ''}>
      ${justAddedTag(b)}
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
        <div class="card-meta-row">${icon(b.kind === 'inquiry' || b.freight_details ? 'ship' : 'user', { size: 13 })}<span>${esc(paxLine(b))}</span></div>
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
  [...top.children].forEach((el) => { if (el !== bar) el.toggleAttribute('inert', on); });
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

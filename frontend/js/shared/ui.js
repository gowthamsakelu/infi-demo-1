// Shared list-page building blocks used by Bookings and Inquiries (desktop + mobile).
import { icon } from './icons.js';

/** Run `fn` after the browser has painted the start state (double rAF, with a timer fallback). */
export function afterPaint(fn) {
  let done = false;
  const run = () => { if (!done) { done = true; fn(); } };
  requestAnimationFrame(() => requestAnimationFrame(run));
  setTimeout(run, 60);
}

/** Resolve after a CSS transition on `el` ends (or after `ms` as a safety net). */
export function afterTransition(el, ms = 360) {
  return new Promise((resolve) => {
    let done = false;
    const end = () => { if (!done) { done = true; el.removeEventListener('transitionend', onEnd); resolve(); } };
    const onEnd = (e) => { if (e.target === el) end(); };
    el.addEventListener('transitionend', onEnd);
    setTimeout(end, ms);
  });
}

let lockCount = 0;
let lockedScroll = 0;
/** Lock page scroll for overlays without a layout jump (no scrollbar shift). Returns an unlock fn. */
export function lockScroll() {
  if (lockCount++ === 0) {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    lockedScroll = window.scrollY;
    document.body.style.setProperty('--sbw', `${sbw}px`);
    document.body.classList.add('scroll-locked');
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lockCount === 0) {
      document.body.classList.remove('scroll-locked');
      document.body.style.removeProperty('--sbw');
      window.scrollTo(0, lockedScroll);
    }
  };
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** `action` ({ label, onClick }) adds a link to the toast, e.g. "View". */
export function toast(message, type = 'info', action = null) {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type, action } }));
}

/** Text that is safe inside an HTML attribute and inside a quoted string of an inline handler (quotes and backslashes dropped). */
export const jsq = (v) => esc(String(v ?? '').replace(/[\\'"`$<>\r\n]/g, ' '));

/** What an inquiry saved without a name is called everywhere. */
export const UNNAMED_LEAD = 'Unnamed lead';

export function initials(name) {
  if (name === UNNAMED_LEAD) return '?';
  return (String(name || '').replace(/^(mr|mrs|ms|dr)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join('') || 'CU').toUpperCase();
}

/** Search box. variant: 'mobile' (page search row) | 'desktop' (table toolbar). */
export function searchBox({ id, placeholder, value = '', variant = 'desktop' }) {
  const wrap = variant === 'mobile' ? 'search-input-wrapper' : 'table-toolbar-search-box';
  const size = variant === 'mobile' ? 18 : 15;
  return `
    <div class="${wrap}">
      ${icon('search', { size })}
      <input type="text" id="${id}" placeholder="${esc(placeholder)}" value="${esc(value)}" aria-label="${esc(placeholder)}" />
    </div>`;
}

/**
 * Status tabs. variant 'mobile' = pills with count badge, 'desktop' = toolbar tabs with "(n)".
 * tabs: [{ key, label, count }]
 */
export function statusTabs({ tabs, active, variant = 'desktop', attr = 'data-tab' }) {
  if (variant === 'mobile') {
    return `<div class="category-filter-tabs scroll-row" role="tablist">${tabs.map((t) => `
      <button class="tab-pill ${t.key === active ? 'active' : ''}" role="tab" aria-selected="${t.key === active}" ${attr}="${esc(t.key)}">
        ${esc(t.label)} <span class="pill-badge">${t.count}</span>
      </button>`).join('')}</div>`;
  }
  return `<div class="toolbar-tabs-group" role="tablist">${tabs.map((t) => `
    <button class="desktop-tab-btn ${t.key === active ? 'active' : ''}" role="tab" aria-selected="${t.key === active}" ${attr}="${esc(t.key)}">
      ${esc(t.label)} (${t.count})
    </button>`).join('')}</div>`;
}

/**
 * Phone + WhatsApp row actions. Same markup, classes and icons everywhere.
 * attrs name the data-attributes the page's click handler listens to.
 */
export function contactButtons({ id, name, phone, size = 15, callAttr = 'data-action-call', waAttr = 'data-action-whatsapp', style = '' }) {
  const s = style ? ` style="${style}"` : '';
  return `
    <button class="card-circle-action-btn btn-action-call" ${callAttr}="${esc(id)}" title="Call ${esc(name)}${phone ? ` (${esc(phone)})` : ''}" aria-label="Call ${esc(name)}"${s}>${icon('phone', { size, stroke: 2.2 })}</button>
    <button class="card-circle-action-btn btn-action-whatsapp" ${waAttr}="${esc(id)}" title="WhatsApp ${esc(name)}${phone ? ` (${esc(phone)})` : ''}" aria-label="WhatsApp ${esc(name)}"${s}>${icon('whatsapp', { size })}</button>`;
}

/** ⋮ trigger for a row menu (neutral variant of the circle action button). */
export function rowMenuButton({ id, name, size = 15, attr = 'data-row-menu' }) {
  return `<button class="card-circle-action-btn btn-action-more" ${attr}="${esc(id)}" aria-haspopup="menu" aria-expanded="false" title="More options for ${esc(name)}" aria-label="More options for ${esc(name)}">${icon('more', { size, stroke: 2.4 })}</button>`;
}

export function openCall(name, phone) {
  if (!phone) return toast('Phone number not available.', 'warning');
  window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  toast(`Dialing ${name} (${phone})...`, 'info');
}

export function openWhatsApp(name, phone, text, { silent = false } = {}) {
  if (!phone) return toast('Phone number not available.', 'warning');
  const digits = phone.replace(/[^0-9]/g, '');
  const to = digits.startsWith('91') ? digits : digits.length === 10 ? `91${digits}` : digits;
  window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, '_blank');
  if (!silent) toast(`Opening WhatsApp chat with ${name}...`, 'success');
}

export function emptyState({ title, text, resetId = 'btn-reset-filters', colspanRow = 0 }) {
  const inner = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:#64748B;text-align:center;padding:${colspanRow ? '48px 20px' : '48px 20px'};">
      <div style="width:48px;height:48px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#94A3B8;">${icon('search', { size: 24 })}</div>
      <h4 style="font-size:15px;color:#0F172A;font-weight:700;margin:0;">${esc(title)}</h4>
      <p style="font-size:13px;color:#94A3B8;margin:0 0 6px;">${esc(text)}</p>
      <button class="btn-secondary-desktop" id="${resetId}" style="height:36px;font-size:12.5px;">Reset Filters</button>
    </div>`;
  return colspanRow ? `<tr><td colspan="${colspanRow}">${inner}</td></tr>` : inner;
}

/** Bulk selection bar (same markup as Bookings). */
export function selectionBar({ prefix, desktop }) {
  return `
    <div class="mobile-selection-bar ${desktop ? 'desktop-selection-bar' : ''}" id="${prefix}-selection-bar" style="display:none;">
      <div class="selection-left">
        <div class="custom-checkbox" id="${prefix}-select-all-box" role="checkbox" aria-checked="false" aria-label="Select all" tabindex="0">${icon('check', { size: 12, stroke: 3 })}</div>
        <span id="${prefix}-selected-count">0 selected</span>
      </div>
      <div class="selection-actions-right">
        <div style="position:relative;">
          <button class="action-more-btn" id="${prefix}-bulk-more-btn" title="More options" aria-label="Bulk actions" aria-haspopup="true" aria-expanded="false">${icon('more', { size: 18, stroke: 2.5 })}</button>
          <div class="bulk-more-dropdown" id="${prefix}-bulk-more-dropdown" role="menu" style="display:none;"></div>
        </div>
      </div>
    </div>`;
}

export function checkbox({ checked, attr, id, label }) {
  return `<div class="custom-checkbox card-select-checkbox ${checked ? 'checked' : ''}" ${attr}="${esc(id)}" role="checkbox" aria-checked="${!!checked}" aria-label="${esc(label)}" tabindex="0">${icon('check', { size: 12, stroke: 3 })}</div>`;
}

/** Close `el` on outside click or Esc. Returns a disposer. */
/** A layer opened by a tap ignores outside presses for this long, so the tap (or its ghost click) that opened it cannot close it. */
export const OPEN_GUARD_MS = 350;
export function armedAfterOpen() {
  const opened = performance.now();
  return () => performance.now() - opened > OPEN_GUARD_MS;
}

export function dismissOnOutside(el, onClose, ignore = []) {
  const armed = armedAfterOpen();
  const down = (e) => {
    if (!armed() || el.contains(e.target) || ignore.some((n) => n && n.contains(e.target))) return;
    onClose();
  };
  // Esc is used up by the open overlay, so nothing behind it (such as the detail pane) reacts to the same key press.
  const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } };
  document.addEventListener('mousedown', down, true);
  document.addEventListener('touchstart', down, true);
  document.addEventListener('keydown', key);
  return () => {
    document.removeEventListener('mousedown', down, true);
    document.removeEventListener('touchstart', down, true);
    document.removeEventListener('keydown', key);
  };
}

/**
 * Backdrop press-to-close: only when the press AND the click both began on the backdrop itself, and not during OPEN_GUARD_MS after opening.
 * A drag that starts inside the sheet and ends on the backdrop, or the tap that opened the layer, does not close it.
 */
export function backdropDismiss(overlay, onClose) {
  const armed = armedAfterOpen();
  let pressedOnBackdrop = false;
  const down = (e) => { pressedOnBackdrop = e.target === overlay; };
  const click = (e) => {
    const start = pressedOnBackdrop;
    pressedOnBackdrop = false;
    if (start && armed() && e.target === overlay) onClose();
  };
  overlay.addEventListener('pointerdown', down);
  overlay.addEventListener('click', click);
  return () => { overlay.removeEventListener('pointerdown', down); overlay.removeEventListener('click', click); };
}


/**
 * Floating menu anchored to a trigger. Fixed-positioned so scroll containers never clip it.
 * items: [{ key, label, icon, danger }]
 */
let activeMenu = null;
export function closeRowMenu(instant = false) { activeMenu?.close(instant); }

export function openRowMenu(trigger, items, onSelect) {
  closeRowMenu(true);
  const menu = document.createElement('div');
  menu.className = 'bulk-more-dropdown row-floating-menu';
  menu.setAttribute('role', 'menu');
  menu.tabIndex = -1;
  menu.innerHTML = items.map((it) => `
    <button class="dropdown-item-btn ${it.danger ? 'item-danger' : ''}" role="menuitem" data-menu-key="${it.key}">
      ${icon(it.icon, { size: 15 })}<span>${esc(it.label)}</span>
    </button>`).join('');
  const initialRect = trigger.getBoundingClientRect();
  // One dropdown for every screen size: fixed layer, right edge on the trigger's, downward (upward when there is no room), kept 8px inside the screen.
  menu.style.visibility = 'hidden';
  document.body.appendChild(menu);
  const r = initialRect;
  const mw = menu.offsetWidth;
  const mh = menu.offsetHeight;
  const left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
  const nav = document.querySelector('.mobile-bottom-nav');
  const navTop = nav && nav.getClientRects().length ? nav.getBoundingClientRect().top : window.innerHeight;
  const limit = Math.min(window.innerHeight, navTop) - 8;
  const up = r.bottom + 6 + mh > limit;
  const top = up ? Math.max(8, r.top - mh - 6) : r.bottom + 6;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  // Grow from the trigger: origin is the trigger centre relative to the menu.
  menu.style.transformOrigin = `${Math.round(r.left + r.width / 2 - left)}px ${up ? '100%' : '0'}`;
  menu.style.visibility = '';

  trigger.setAttribute('aria-expanded', 'true');
  afterPaint(() => menu.classList.add('open'));
  menu.focus({ preventScroll: true }); // focus stays on the menu, never an input

  const dispose = dismissOnOutside(menu, () => close(), [trigger]);
  // Close when the page scrolls the trigger away from where the menu was placed.
  const onScroll = () => {
    const now = trigger.getBoundingClientRect();
    if (Math.abs(now.top - initialRect.top) > 2 || Math.abs(now.left - initialRect.left) > 2) close();
  };
  window.addEventListener('resize', onScroll);
  window.addEventListener('scroll', onScroll, true);

  menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-menu-key]');
    if (!b) return;
    e.stopPropagation(); // the tap that picks an item is not a tap on anything under the menu
    close();
    onSelect(b.dataset.menuKey);
  });
  menu.addEventListener('keydown', (e) => {
    const btns = [...menu.querySelectorAll('button')];
    const i = btns.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); btns[(i + 1) % btns.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); btns[(i - 1 + btns.length) % btns.length].focus(); }
  });

  let closed = false;
  function close(instant = false) {
    if (closed) return;
    closed = true;
    dispose();
    window.removeEventListener('resize', onScroll);
    window.removeEventListener('scroll', onScroll, true);
    trigger.setAttribute('aria-expanded', 'false');
    if (activeMenu && activeMenu.menu === menu) activeMenu = null;
    if (instant) { menu.remove(); return; }
    menu.classList.remove('open');
    menu.classList.add('closing');
    afterTransition(menu, 220).then(() => menu.remove());
    if (document.activeElement === document.body || menu.contains(document.activeElement)) trigger.focus({ preventScroll: true });
  }
  activeMenu = { menu, close };
}

/**
 * Shared bottom-sheet behaviour: swipe the handle/header down to close, and keep the sheet inside
 * the visible area when the on-screen keyboard opens. Returns a disposer.
 */
export function bindSheet(overlay, panel, onClose, handleSelector = '.filter-handle, .asg-header, .fu-header') {
  let startY = null;
  const handle = (e) => (e.target.closest(handleSelector) ? e.touches[0].clientY : null);
  const down = (e) => { startY = handle(e); };
  const move = (e) => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) { panel.style.transition = 'none'; panel.style.transform = `translateY(${dy}px)`; }
  };
  const up = (e) => {
    if (startY === null) return;
    const dy = e.changedTouches[0].clientY - startY;
    startY = null;
    panel.style.transition = '';
    panel.style.transform = '';
    if (dy > 90) onClose();
  };
  panel.addEventListener('touchstart', down, { passive: true });
  panel.addEventListener('touchmove', move, { passive: true });
  panel.addEventListener('touchend', up);

  // Keyboard handling lives in shared/keyboard.js (CSS variables), so the sheet needs no viewport code here.
  return () => {};
}


/** Skeleton rows with the same dimensions as real rows. */
export function skeletonCards(n = 5) {
  return Array.from({ length: n }, () => `
    <div class="skel-card" aria-hidden="true">
      <div class="skel skel-avatar"></div>
      <div class="skel-lines"><div class="skel" style="width:70%"></div><div class="skel" style="width:90%"></div><div class="skel" style="width:55%"></div></div>
      <div class="skel-btns"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>
    </div>`).join('');
}
export function skeletonRows(cols, n = 8) {
  return Array.from({ length: n }, () => `<tr class="skel-row" aria-hidden="true">${Array.from({ length: cols }, () => '<td><div class="skel"></div></td>').join('')}</tr>`).join('');
}
/** The detail pane when nothing is selected (PC and tablet): "Select a booking" and one muted line. `noun` is "a booking", "an inquiry", "a package" ... */
export function selectEmptyState(noun, hint = 'Choose an item from the list to see its details here.') {
  return `<div class="state-box detail-empty"><div class="state-box-ico">${icon('eye', { size: 22 })}</div><h4>Select ${esc(noun)}</h4><p>${esc(hint)}</p></div>`;
}

/** The sentence under "Could not load ...": no answer from the server vs. a server error. Never the raw error text. */
export function loadErrorText(error, what = 'this') {
  if (error?.kind === 'network') return "Can't reach the server. Check your connection and try again.";
  if (error?.kind === 'server') return `Something went wrong loading ${what}. Try again.`;
  return 'Check your connection and try again.';
}

/**
 * The one "could not load" state: round icon, normal heading, one muted line, the white outlined "Try again" button.
 * `error` (an ApiError) picks the sentence; `what` is "settings", "packages" ...; `retryId` or `retryAttr` (e.g. 'data-st-retry') is the page's hook.
 */
export function errorState({ title, text, retryId = '', retryAttr = '', error = null, what = '' }) {
  const line = error || what ? loadErrorText(error, what) : text;
  const hook = retryAttr || `id="${esc(retryId)}"`;
  return `<div class="state-box is-error" role="alert"><div class="state-box-ico">${icon('alertCircle', { size: 22 })}</div><h4>${esc(title)}</h4><p>${esc(line)}</p><button type="button" class="btn-secondary-desktop" ${hook}>Try again</button></div>`;
}

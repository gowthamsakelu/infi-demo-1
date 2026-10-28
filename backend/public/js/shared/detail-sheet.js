// The detail sheet shell: the one header every detail view uses (Bookings, Inquiries, Destinations, Hotel, Vehicle ...).
// Phone: drag handle, round avatar, title with its pill, subtitle, one meta row, and the round X at the top right.
// The surrounding sheet, tabs, body and footer use the .bottom-sheet / .sheet-tabs-nav / .sheet-body-scroll / .sheet-sticky-footer classes.
import { icon } from './icons.js';
import { esc } from './ui.js';

export const META_ICONS = { people: 'user', time: 'clock', date: 'calendar', place: 'pin', money: 'chart', bed: 'bed', car: 'car' };

/** The grab handle at the top of a sheet. */
export const sheetHandleHtml = (id = '') => `<div class="sheet-drag-handle-bar" ${id ? `id="${esc(id)}"` : ''}><div class="sheet-handle"></div></div>`;

/** The round X at the top right of the header. `attrs` is the caller's hook (an id or a data attribute). */
export const sheetCloseHtml = (attrs = '', cls = '') => `<button type="button" class="sheet-close-btn mobile-sheet-close-pill ${cls}" ${attrs} title="Close" aria-label="Close">${icon('close', { size: 14, stroke: 2.5 })}</button>`;

/**
 * @param {{ avatar?: string, title: string, pill?: string, subtitle?: string, chips?: { icon?: string, text: string }[] } | string} h
 * @param {{ close?: string }} [opts]  `close` = attributes for the X button; leave out on PC (no X)
 */
export function detailHeaderHtml(h, { close, closeCls = '' } = {}) {
  if (typeof h === 'string') return h; // a page that draws its own header
  const chips = (h.chips || []).filter((c) => c && c.text);
  return `<div class="sheet-customer-header">
      <div class="customer-avatar-badge">${h.avatar || ''}</div>
      <div class="customer-header-info">
        <div class="customer-title-row"><h2 class="customer-name-title">${esc(h.title)}</h2>${h.pill || ''}</div>
        ${h.subtitle ? `<p class="customer-trip-subtitle">${esc(h.subtitle)}</p>` : ''}
        ${chips.length ? `<div class="customer-meta-chips">${chips.map((c) => `<span class="meta-chip">${icon(META_ICONS[c.icon] || c.icon || 'clock', { size: 14 })}${esc(c.text)}</span>`).join('<span class="meta-dot">•</span>')}</div>` : ''}
      </div>
      ${close !== undefined ? sheetCloseHtml(close, closeCls) : ''}
    </div>`;
}

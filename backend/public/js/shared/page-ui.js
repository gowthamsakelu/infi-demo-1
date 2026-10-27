// Small building blocks every catalog / website / system page uses, so a status, a tag, a stat card or a toggle looks the same everywhere.
import { icon } from './icons.js';
import { esc } from './ui.js';

const PILLS = {
  active: 'status-paid', published: 'status-paid', paid: 'status-paid', converted: 'status-paid', on: 'status-paid',
  draft: 'status-draft', inactive: 'status-draft', spam: 'status-draft', off: 'status-draft',
  scheduled: 'status-inq-new', new: 'status-inq-new',
  pending: 'status-pending', 'part-paid': 'status-part-paid',
  ongoing: 'status-inq-ongoing', warm: 'status-inq-warm', hot: 'status-inq-hot',
};
/** A status pill: Active, Draft, Scheduled, Published, Pending, Paid, Part paid, and the inquiry badges Hot, Warm, Ongoing, New. */
export const pill = (kind, label) => `<span class="status-pill ${PILLS[kind] || 'status-draft'}"><span class="dot"></span>${esc(label)}</span>`;

const TAGS = { tour: 'badge-tour', villa: 'badge-villa', activity: 'badge-activity', resort: 'badge-resort', transport: 'badge-transport' };
/** A category tag: TOUR (purple), VILLA (yellow), ACTIVITY (teal), RESORT (blue), TRANSPORT. */
export const tag = (kind, label = kind) => `<span class="card-type-badge ${TAGS[kind] || 'badge-tour'}">${esc(String(label).toUpperCase())}</span>`;

/** The soft-blue square holding an icon (list rows and detail headers). */
export const tile = (name, size = 20) => icon(name, { size, stroke: 2 });

/** A stat card: a coloured icon tile, a label, one big value. `tone`: blue | green | purple | amber. */
export const statCard = ({ icon: ico, label, value, tone = 'blue', title = '' }) => `
  <div class="sp-stat" ${title ? `title="${esc(title)}"` : ''}>
    <span class="sp-stat-ico tone-${tone}">${icon(ico, { size: 18 })}</span>
    <div class="sp-stat-text"><span class="sp-stat-label">${esc(label)}</span><b class="sp-stat-value">${esc(value)}</b></div>
  </div>`;

export const statRow = (cards) => `<div class="sp-stats">${cards.map(statCard).join('')}</div>`;

export const sectionTitle = (text, right = '') => `<div class="sp-section-title"><h4>${esc(text)}</h4>${right}</div>`;

/** Label / value pairs in two columns. */
export const detailGrid = (pairs) => `<dl class="sp-grid2">${pairs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v === '' || v == null ? '—' : esc(v)}</dd></div>`).join('')}</dl>`;

/** A rounded group of rows with dividers (packages under a destination, rates under a stay). */
export const rowGroup = (rows) => `<div class="sp-group">${rows.join('')}</div>`;
export const linkRow = ({ ico, title, sub, right = '', rightSub = '' }) => `
  <div class="sp-linkrow">
    <span class="sp-tile sp-tile-sm">${icon(ico, { size: 18 })}</span>
    <div class="sp-linkrow-text"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
    <div class="sp-linkrow-right">${rightSub ? `<small>${esc(rightSub)}</small>` : ''}${right ? `<b>${esc(right)}</b>` : ''}</div>
  </div>`;

export const chip = (text) => `<span class="sp-chip">${esc(text)}</span>`;

/** An on / off switch (the same control as in the itinerary dialogs). `id` is what the page's handler listens for. */
export const toggle = ({ id, label, on = false, hint = '' }) => `
  <div class="sp-toggle-row">
    <div class="sp-toggle-text"><b>${esc(label)}</b>${hint ? `<small>${esc(hint)}</small>` : ''}</div>
    <button type="button" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" class="bld-switch sp-switch ${on ? 'is-on' : ''}" data-sp-toggle="${esc(id)}"><span class="bld-switch-knob"></span></button>
  </div>`;

/** Flip a switch drawn by toggle() and return its new state. */
export function flipToggle(btn) {
  const on = btn.getAttribute('aria-checked') !== 'true';
  btn.setAttribute('aria-checked', String(on));
  btn.classList.toggle('is-on', on);
  return on;
}

export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
/** ₹45,000 as is; ₹1.2L / ₹3.4Cr from a lakh up, for tight places such as stat cards. */
export const moneyShort = (n) => { const v = Number(n || 0); return v >= 1e7 ? `₹${+(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${+(v / 1e5).toFixed(1)}L` : money(v); };
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The detail footer: a secondary button and a primary one, equal height (the shared dialog button styles). */
export const footButtons = ({ secondary, primary, primaryIcon = '', id = {} }) => `
  ${secondary ? `<button type="button" class="btn-secondary-desktop sp-foot-btn" ${id.secondary ? `data-sp-act="${esc(id.secondary)}"` : ''}>${esc(secondary)}</button>` : ''}
  ${primary ? `<button type="button" class="btn-primary-desktop sp-foot-btn" ${id.primary ? `data-sp-act="${esc(id.primary)}"` : ''}>${primaryIcon ? icon(primaryIcon, { size: 16, stroke: 2.4 }) : ''}${esc(primary)}</button>` : ''}`;

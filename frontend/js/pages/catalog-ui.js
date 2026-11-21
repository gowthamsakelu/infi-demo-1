// Small pieces shared by the Tour Packages, Transport, Stays and Adventures pages only (the shell's own pieces live in shared/page-ui.js).
import { icon } from '../shared/icons.js';
import { esc } from '../shared/ui.js';

/** A detail section as a card with a round icon and a title, the same card Destinations uses for "About this destination". */
export const card = (ico, title, inner, right = '') => `
  <section class="details-section-card">
    <div class="details-section-header"><div class="section-header-left"><div class="section-icon-circle blue-circle">${icon(ico, { size: 16 })}</div><h3>${esc(title)}</h3></div>${right}</div>
    ${inner}
  </section>`;

/** The picture at the top of a detail Overview: 16:9, rounded, the width of the card. Nothing when the record has no picture. */
export const heroImage = (src, alt = '') => (src ? `<div class="cat-hero"><img src="${esc(src)}" alt="${esc(alt)}" width="640" height="360" loading="lazy" decoding="async"></div>` : '');

/** The distinct, sorted values of a field, as the options of a split page's filter. */
export const optionsOf = (items, pick) => [...new Set(items.map(pick).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v }));

/** City and region without repeating themselves ("Goa, Goa"). */
export const place = (o) => [...new Set([o.city, o.region].filter(Boolean))].join(', ');

/* ---- Overview pieces shared by Tour Packages, Adventures and Stays. A section with no data is not drawn. ---- */

/** Only the label / value pairs that have a value (no row of dashes). */
export const filled = (pairs) => pairs.filter(([, v]) => v !== '' && v != null && v !== false);

/** A note card in the style of the Bookings "Short Details" card. */
export const noteCard = (ico, title, inner) => `
  <section class="short-details-card">
    <div class="short-details-header">${icon(ico, { size: 15 })}<span>${esc(title)}</span></div>
    ${inner}
  </section>`;

const list = (items, kind, cols = false) => `<ul class="ie-list${cols ? ' cols' : ''}">${items.map((t) => `<li><span class="ie-ico ${kind}">${kind === 'dot' ? '' : icon(kind === 'no' ? 'close' : 'check', { size: 12, stroke: 3 })}</span><span>${esc(t)}</span></li>`).join('')}</ul>`;

/** "Inclusions & Exclusions": one card, the two lists stacked on the phone and side by side on PC. */
export function inclusionsCard(inclusions = [], exclusions = []) {
  const inc = (inclusions || []).filter(Boolean);
  const exc = (exclusions || []).filter(Boolean);
  if (!inc.length && !exc.length) return '';
  return noteCard('check', 'Inclusions & Exclusions', `<div class="ie-lists">
    ${inc.length ? `<div><h4 class="ie-title">Inclusions</h4>${list(inc, 'check')}</div>` : ''}
    ${exc.length ? `<div><h4 class="ie-title">Exclusions</h4>${list(exc, 'no')}</div>` : ''}
  </div>`);
}

/** A card with a plain list (Highlights, Extra charges): neutral dots. */
export const bulletCard = (ico, title, items = []) => {
  const rows = (items || []).filter(Boolean);
  return rows.length ? noteCard(ico, title, list(rows, 'dot')) : '';
};

/** "Highlights": green checks, two columns on PC and one on the phone. */
export const highlightsCard = (items = [], title = 'Highlights') => {
  const rows = (items || []).filter(Boolean);
  return rows.length ? noteCard('star', title, list(rows, 'check', true)) : '';
};

/** The "Overview" description: one paragraph per blank line, text wraps. */
export const overviewCard = (text, title = 'Overview') => {
  const paras = String(text || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  return paras.length ? noteCard('info', title, `<div class="ov-text">${paras.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`) : '';
};

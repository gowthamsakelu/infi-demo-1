// Small pieces shared by the Tour Packages, Transport, Stays and Adventures pages only (the shell's own pieces live in shared/page-ui.js).
import { icon } from '../shared/icons.js';
import { esc } from '../shared/ui.js';

/** A detail section as a card with a round icon and a title, the same card Destinations uses for "About this destination". */
export const card = (ico, title, inner, right = '') => `
  <section class="details-section-card">
    <div class="details-section-header"><div class="section-header-left"><div class="section-icon-circle blue-circle">${icon(ico, { size: 16 })}</div><h3>${esc(title)}</h3></div>${right}</div>
    ${inner}
  </section>`;

/** The distinct, sorted values of a field, as the options of a split page's filter. */
export const optionsOf = (items, pick) => [...new Set(items.map(pick).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v }));

/** City and region without repeating themselves ("Goa, Goa"). */
export const place = (o) => [...new Set([o.city, o.region].filter(Boolean))].join(', ');

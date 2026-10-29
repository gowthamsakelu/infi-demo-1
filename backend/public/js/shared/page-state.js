// Query-string backed page state + tiny hash router.
// The URL is the source of truth for search, tab and filters, so refresh and Back/Forward restore them.

const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

import { NAV_ITEMS } from './nav.js';

const PAGES = NAV_ITEMS.map((i) => i.key);
const ALIASES = {
  enquiries: 'inquiries',
  enquiry: 'inquiries',
  inquiry: 'inquiries',
  operations: 'team',
  'operations-team': 'team',
  team: 'team'
};

export function currentPage() {
  const raw = location.hash.replace(/^#/, '').split('?')[0].toLowerCase();
  const page = ALIASES[raw] || raw;
  return PAGES.includes(page) ? page : 'dashboard'; // no (or an unknown) page in the address: the Dashboard is the home page
}

export function getParams() {
  return Object.fromEntries(new URLSearchParams(location.search));
}

function buildUrl(params, page) {
  const qs = params.toString();
  return location.pathname + (qs ? `?${qs}` : '') + (page ? `#${page}` : location.hash);
}

/** Merge a patch into the query string. null / '' removes a key. */
export function setParams(patch, { push = true, silent = false } = {}) {
  const params = new URLSearchParams(location.search);
  Object.entries(patch).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') params.delete(k);
    else params.set(k, v);
  });
  history[push ? 'pushState' : 'replaceState'](null, '', buildUrl(params));
  if (!silent) notify();
}

/** Go to another page; filters and search do not carry over (unless `params` sets them for the new page). */
export function navigate(page, params = {}) {
  if (page === currentPage() && !location.search && !Object.keys(params).length) return;
  // Route immediately. Async page mounts animate their content after it is styled;
  // a document snapshot here captures the loading frame and delays rapid taps.
  history.pushState(null, '', buildUrl(new URLSearchParams(params), page));
  notify();
}

/** Re-run every subscriber (used after a layout change). */
export const refresh = notify;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Arriving from the login form (a fresh navigation, not a reload) always starts on the Dashboard, whatever hash or query came along.
// A refresh keeps the page it was on; an address without a page gets the Dashboard written into it, so the nav item and the URL agree.
(() => {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  let fromLogin = false;
  try { fromLogin = !!document.referrer && new URL(document.referrer).pathname.replace(/\/+$/, '') === '/login'; } catch { /* no referrer */ }
  if (fromLogin && (!nav || nav.type === 'navigate')) history.replaceState(null, '', `${location.pathname}#dashboard`);
  else if (!location.hash) history.replaceState(null, '', `${location.pathname}${location.search}#dashboard`);
})();

// Old "#enquiries" links keep working.
const rawHash = location.hash.replace(/^#/, '').toLowerCase();
if (ALIASES[rawHash]) history.replaceState(null, '', buildUrl(new URLSearchParams(location.search), ALIASES[rawHash]));

window.addEventListener('popstate', notify);
window.addEventListener('hashchange', notify);

// Query-string backed page state + tiny hash router.
// The URL is the source of truth for search, tab and filters, so refresh and Back/Forward restore them.

const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const PAGES = ['bookings', 'inquiries', 'calendar', 'team'];
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
  return PAGES.includes(page) ? page : 'bookings';
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

/** Go to another page; filters and search do not carry over. */
export function navigate(page) {
  if (page === currentPage() && !location.search) return;
  const go = () => {
    history.pushState(null, '', buildUrl(new URLSearchParams(), page));
    notify();
  };
  // Short crossfade of the content (the shell is identical on every page). Falls back to an instant swap.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) document.startViewTransition(go);
  else go();
}

/** Re-run every subscriber (used after a layout change). */
export const refresh = notify;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Old "#enquiries" links keep working.
const rawHash = location.hash.replace(/^#/, '').toLowerCase();
if (ALIASES[rawHash]) history.replaceState(null, '', buildUrl(new URLSearchParams(location.search), ALIASES[rawHash]));

window.addEventListener('popstate', notify);
window.addEventListener('hashchange', notify);

// Mounts the pages that are not part of Bookings / Inquiries / Calendar (Destinations, Tour Packages, ... Settings) into the page
// host on PC and on the phone. A page is a module `js/pages/<key>.js` whose default export is `{ mount(host, ctx) }`; mount returns
// `{ destroy(), isDirty?() }`. A page with its own stylesheet (`css/pages/<key>.css`) sets `css: true` on its export; it loads once.
import { navItem } from './nav.js';
import { currentPage, getParams, setParams, navigate } from './page-state.js';
import { toast } from './ui.js';
import { confirmDialog } from './sheet.js';
import { setAddAction } from './add-button.js';
import { getJson } from './http.js';
import { updateSystemLogos, updateSystemCompanyTitle } from './branding.js';

let current = null; // { key, host, instance, token }
let token = 0;
const cssLoaded = new Map();
let mounting = null;

/** Load css/pages/<key>.css once. A page without its own stylesheet is fine. */
function loadPageCss(key) {
  if (cssLoaded.has(key)) return cssLoaded.get(key);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `./css/pages/${key}.css?v=${Date.now().toString(36).slice(0, 6)}`;
  const ready = new Promise((resolve) => {
    link.onload = resolve;
    link.onerror = () => { cssLoaded.delete(key); link.remove(); resolve(); };
  });
  cssLoaded.set(key, ready);
  document.head.appendChild(link);
  return ready;
}

/** The Add button of the open page (shared/add-button.js): its wording, and what it does; null hides it. */
const setAddButton = setAddAction;

/** Once the app is idle, fetch the other pages' scripts and styles one at a time, so the first visit to a page is as fast as the second. */
let prefetched = false;
const WARM_KEYS = ['dashboard', 'destinations', 'tour-packages', 'transport', 'stays', 'adventures', 'banners', 'blogs', 'users', 'settings'];
const WARM = { dashboard: '/api/dashboard?period=today', destinations: '/api/destinations', 'tour-packages': '/api/tour-packages', transport: '/api/transport', stays: '/api/stays', adventures: '/api/adventures', banners: '/api/banners', blogs: '/api/blogs', users: '/api/users' };
export function prefetchPages(except) {
  if (prefetched) return;
  if (navigator.connection?.saveData) return;
  prefetched = true;
  const keys = ['dashboard', 'destinations', 'tour-packages', 'transport', 'stays', 'adventures', 'banners', 'blogs', 'users', 'settings'].filter((k) => k !== except);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  const next = async () => {
    const key = keys.shift();
    if (!key) return;
    try {
      const m = await import(`../pages/${key}.js`);
      if (m.default?.css) await loadPageCss(key);
      if (WARM[key]) await getJson(WARM[key]);
    } catch { /* warming must never block navigation */ }
    idle(next);
  };
  idle(next);
}

/** One page change, everywhere: the old content fades out (100ms), the new content fades and slides up (200ms, css/ui-standard.css). The header and the bottom bar never move. */
let navId = 0;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Load a page's script, style and data ahead of its first visit (idle, or when its nav item is touched or hovered). */
export function warmPage(key) {
  if (!key || !WARM_KEYS.includes(key)) return;
  import(`../pages/${key}.js`).then((m) => { if (m.default?.css) loadPageCss(key); }).catch(() => {});
  if (WARM[key]) getJson(WARM[key]).catch(() => {});
}

export async function mountPage(key, host) {
  if (current && current.key === key && current.host === host) return; // already showing it
  if (mounting?.key === key && mounting.host === host) return;
  const item = navItem(key);
  if (!item) return;
  const nav = ++navId;
  mounting = { key, host };
  // the page's script and style load while the old content fades out
  const loading = (async () => {
    let m;
    try {
      m = (await import(item.kind === 'soon' ? '../pages/soon.js' : `../pages/${key}.js`)).default;
    } catch (err) {
      m = (await import('../pages/soon.js')).default; // the module is not there (yet): a calm placeholder instead of a blank page
    }
    if (m.css) await loadPageCss(key);
    return m;
  })();
  loading.catch(() => {});
  if (current && current.host === host && !reducedMotion()) {
    host.classList.add('is-leaving');
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (nav !== navId) return; // another page was asked for meanwhile: that call takes over
  }
  unmountPage();
  mounting = { key, host };
  host.classList.remove('is-leaving');
  host.scrollTop = 0; // the new page starts at its top, without a visible jump
  const mine = ++token;
  host.classList.add('is-entering');
  host.setAttribute('data-page', key);
  const mod = await loading;
  if (mine !== token) { host.classList.remove('is-entering'); return; } // the user moved on while it loaded
  const ctx = {
    key, item, params: getParams, setParams, navigate, toast, setAddButton,
    layout: () => document.documentElement.dataset.layout || 'desktop',
  };
  let instance;
  try {
    instance = await mod.mount(host, ctx);
  } catch (err) {
    if (mine === token) mounting = null;
    throw err;
  }
  if (mine !== token) { instance?.destroy?.(); return; }
  current = { key, host, instance };
  mounting = null;
  updateSystemLogos();
  updateSystemCompanyTitle();
  setTimeout(() => host.classList.remove('is-entering'), 260);
  prefetchPages(key);
}

export function unmountPage() {
  token += 1;
  mounting = null;
  document.querySelectorAll('#mobile-page-host, #desktop-page-host').forEach((h) => h.classList.remove('is-leaving', 'is-entering'));
  if (!current) return;
  try { current.instance?.destroy?.(); } catch { /* a page that fails to tidy up must not block the next one */ }
  current.host.innerHTML = '';
  current.host.removeAttribute('data-page');
  setAddButton(null);
  current = null;
}

/** False (after asking) when the open page has unsaved changes the user wants to keep editing. */
export async function mayLeavePage() {
  if (!current?.instance?.isDirty?.()) return true;
  return confirmDialog({ title: 'Discard your changes?', text: 'What you changed here has not been saved yet.', confirm: 'Discard', cancel: 'Keep editing', danger: true });
}

/** Go to another page, asking first when the current one has unsaved changes. Sidebar, More and the bottom bar all use this. */
export async function goToPage(key) {
  if (key === currentPage()) return;
  if (await mayLeavePage()) navigate(key);
}

export { setParams, currentPage };

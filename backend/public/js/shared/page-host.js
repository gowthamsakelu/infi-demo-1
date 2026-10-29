// Mounts the pages that are not part of Bookings / Inquiries / Calendar (Destinations, Tour Packages, ... Settings) into the page
// host on PC and on the phone. A page is a module `js/pages/<key>.js` whose default export is `{ mount(host, ctx) }`; mount returns
// `{ destroy(), isDirty?() }`. A page with its own stylesheet (`css/pages/<key>.css`) sets `css: true` on its export; it loads once.
import { navItem } from './nav.js';
import { currentPage, getParams, setParams, navigate } from './page-state.js';
import { toast } from './ui.js';
import { confirmDialog } from './sheet.js';
import { setAddAction } from './add-button.js';
import { getJson } from './http.js';

let current = null; // { key, host, instance, token }
let token = 0;
const cssLoaded = new Set();

/** Load css/pages/<key>.css once. A page without its own stylesheet is fine. */
function loadPageCss(key) {
  if (cssLoaded.has(key)) return;
  cssLoaded.add(key);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `./css/pages/${key}.css?v=${Date.now().toString(36).slice(0, 6)}`;
  link.onerror = () => link.remove();
  document.head.appendChild(link);
}

/** The Add button of the open page (shared/add-button.js): its wording, and what it does; null hides it. */
const setAddButton = setAddAction;

/** Once the app is idle, fetch the other pages' scripts and styles one at a time, so the first visit to a page is as fast as the second. */
let prefetched = false;
const WARM = { dashboard: '/api/dashboard?period=today', destinations: '/api/destinations', 'tour-packages': '/api/tour-packages', transport: '/api/transport', stays: '/api/stays', adventures: '/api/adventures', banners: '/api/banners', blogs: '/api/blogs', users: '/api/users' };
export function prefetchPages(except) {
  if (prefetched) return;
  prefetched = true;
  const keys = ['dashboard', 'destinations', 'tour-packages', 'transport', 'stays', 'adventures', 'banners', 'blogs', 'users', 'settings'].filter((k) => k !== except);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  const next = () => {
    const key = keys.shift();
    if (!key) return;
    if (WARM[key]) getJson(WARM[key]).catch(() => {}); // the page's data too, so its list is on screen the moment it opens
    import(`../pages/${key}.js`).then((m) => { if (m.default?.css) loadPageCss(key); }).catch(() => {}).finally(() => idle(next));
  };
  idle(next);
}

export async function mountPage(key, host) {
  if (current && current.key === key && current.host === host) return; // already showing it
  unmountPage();
  const mine = ++token;
  const item = navItem(key);
  if (!item) return;
  host.setAttribute('data-page', key);
  let mod;
  try {
    mod = (await import(item.kind === 'soon' ? '../pages/soon.js' : `../pages/${key}.js`)).default;
  } catch (err) {
    mod = (await import('../pages/soon.js')).default; // the module is not there (yet): a calm placeholder instead of a blank page
  }
  if (mine !== token) return; // the user moved on while it loaded
  if (mod.css) loadPageCss(key); // a page says `css: true` when it has css/pages/<key>.css
  const ctx = {
    key, item, params: getParams, setParams, navigate, toast, setAddButton,
    layout: () => document.documentElement.dataset.layout || 'desktop',
  };
  const instance = await mod.mount(host, ctx);
  if (mine !== token) { instance?.destroy?.(); return; }
  current = { key, host, instance };
  prefetchPages(key);
}

export function unmountPage() {
  token += 1;
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

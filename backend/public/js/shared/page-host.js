// Mounts the pages that are not part of Bookings / Inquiries / Calendar (Destinations, Tour Packages, ... Settings) into the page
// host on PC and on the phone. A page is a module `js/pages/<key>.js` whose default export is `{ mount(host, ctx) }`; mount returns
// `{ destroy(), isDirty?() }`. A page with its own stylesheet (`css/pages/<key>.css`) sets `css: true` on its export; it loads once.
import { navItem } from './nav.js';
import { currentPage, getParams, setParams, navigate } from './page-state.js';
import { toast } from './ui.js';
import { confirmDialog } from './sheet.js';

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

/** The Add button of the open page: its label in the top bar (PC) and on the floating button (phone); null hides both. It has no behaviour yet. */
function setAddButton(label) {
  ['#desktop-page-add', '#mobile-page-add'].forEach((sel) => {
    const b = document.querySelector(sel);
    if (!b) return;
    b.hidden = !label;
    const span = b.querySelector('.sp-add-label');
    if (span && label) span.textContent = label;
  });
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

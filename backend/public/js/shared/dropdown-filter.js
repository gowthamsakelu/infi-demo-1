// One dropdown component: a trigger that opens a plain option list anchored to it, in a fixed layer above everything (never clipped by a parent,
// never pushing the layout). The list is at least as wide as the trigger and at most 260px, aligns to the trigger's left edge, flips to the right
// edge when it would leave the screen, and opens upward when there is no room below. Used for every filter and every select in the app.
import { icon } from './icons.js';
import { esc, dismissOnOutside } from './ui.js';

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'TOUR', label: 'Tour Packages' },
  { value: 'VILLA', label: 'Villas & Resorts' },
  { value: 'ACTIVITY', label: 'Activities & Sports' },
  { value: 'TRANSPORT', label: 'Transports' },
];

let uid = 0;

/**
 * @param {{ options: {value:string,label:string}[]|(() => {value:string,label:string}[]), onChange: (v:string)=>void,
 *           variant?: 'labelled'|'icon', ariaLabel?: string }} cfg
 * variant 'icon' renders a square funnel button with an "active" dot instead of a label.
 */
export function createDropdown({ options, onChange, variant = 'labelled', ariaLabel = 'Filter', iconName = 'filter' }) {
  let value = '';
  const hosts = [];
  let open = null; // { host, dispose }
  const id = `dd-${++uid}`;
  const opts = () => (typeof options === 'function' ? options() : options);
  const selectedIcon = () => (opts().find((o) => o.value === value) || {}).icon;
  const labelOf = (v) => (opts().find((o) => o.value === v) || opts()[0])?.label || '';

  function render() {
    hosts.forEach((host) => {
      const isOpen = open?.host === host;
      const trigger = variant === 'icon'
        ? `<button type="button" class="dd-trigger dd-icon-trigger ${value ? 'has-value' : ''}" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}${value ? ': ' + esc(labelOf(value)) : ''}" title="${esc(ariaLabel)}">${icon('filter', { size: 16 })}${value ? '<span class="dd-dot" aria-hidden="true"></span>' : ''}</button>`
        : `<button type="button" class="dd-trigger" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}: ${esc(labelOf(value))}">${icon(selectedIcon() || iconName, { size: 15 })}<span class="dd-label">${esc(labelOf(value))}</span>${icon('chevronDown', { size: 13, stroke: 2.5 })}</button>`;
      host.innerHTML = `${trigger}
        <ul class="dd-list" role="listbox" id="${id}" ${isOpen ? '' : 'hidden'}>
          ${opts().map((o) => `<li role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === value}" class="${o.value === value ? 'selected' : ''}">${o.icon ? icon(o.icon, { size: 15 }) : ''}<span>${esc(o.label)}</span></li>`).join('')}
        </ul>`;
      if (isOpen) place(host);
    });
  }

  // Anchor the list to its trigger in a fixed layer and keep it inside the viewport (flip to the right edge, flip upward).
  const GAP = 6;
  const EDGE = 8;
  function place(host) {
    const trigger = host.querySelector('.dd-trigger');
    const list = host.querySelector('.dd-list');
    if (!trigger || !list) return;
    const r = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(260, vw - EDGE * 2);
    Object.assign(list.style, { position: 'fixed', right: 'auto', bottom: 'auto', margin: '0', zIndex: '1300', minWidth: `${Math.min(r.width, maxW)}px`, maxWidth: `${maxW}px`, width: 'max-content', maxHeight: '', overflowY: 'auto', left: '0px', top: '0px', visibility: 'hidden' });
    const lw = list.getBoundingClientRect().width;
    const lh = list.getBoundingClientRect().height;
    let left = r.left;
    if (left + lw > vw - EDGE) left = r.right - lw; // would leave the screen: align to the trigger's right edge
    left = Math.max(EDGE, Math.min(left, vw - EDGE - lw));
    let top = r.bottom + GAP;
    const roomBelow = vh - EDGE - top;
    const roomAbove = r.top - GAP - EDGE;
    if (lh > roomBelow && roomAbove > roomBelow) { // no room below, more above: open upward
      top = Math.max(EDGE, r.top - GAP - Math.min(lh, roomAbove));
      list.style.maxHeight = `${Math.min(lh, roomAbove)}px`;
      list.classList.add('dd-up');
    } else {
      list.style.maxHeight = `${Math.max(120, Math.min(lh, roomBelow))}px`;
      list.classList.remove('dd-up');
    }
    Object.assign(list.style, { left: `${left}px`, top: `${top}px`, visibility: '' });
  }

  function openList(host) {
    closeList(false);
    const stopOutside = dismissOnOutside(host, () => closeList(true));
    const move = () => { if (open) place(open.host); };
    window.addEventListener('resize', move);
    window.addEventListener('scroll', move, true);
    open = { host, dispose: () => { stopOutside(); window.removeEventListener('resize', move); window.removeEventListener('scroll', move, true); } };
    render();
    host.querySelector('li.selected')?.focus({ preventScroll: true });
  }
  function closeList(refocus) {
    if (!open) return;
    const { host, dispose } = open;
    dispose();
    open = null;
    render();
    if (refocus) host.querySelector('.dd-trigger')?.focus();
  }

  function bind(host) {
    host.addEventListener('click', (e) => {
      if (e.target.closest('.dd-trigger')) return open?.host === host ? closeList(false) : openList(host);
      const li = e.target.closest('li[data-value]');
      if (li) { closeList(true); if (li.dataset.value !== value) { value = li.dataset.value; render(); onChange(value); } }
    });
    host.addEventListener('keydown', (e) => {
      const items = [...host.querySelectorAll('li')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) openList(host); else items[Math.min(i + 1, items.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp' && open) { e.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.matches('li')) { e.preventDefault(); document.activeElement.click(); }
    });
  }

  return {
    /** Mount into `host`; call once per place the dropdown appears. */
    attach(host, extraClass = '') {
      host.classList.add('dd-filter');
      if (extraClass) host.classList.add(extraClass);
      hosts.push(host);
      bind(host);
      render();
    },
    setValue(v) { value = v || ''; render(); },
    getValue: () => value,
    refresh: render,
    close: () => closeList(false),
    /** Open on the first visible host. */
    openVisible() {
      const host = hosts.find((h) => h.offsetParent !== null);
      if (host) openList(host);
    },
  };
}

export const createCategoryFilter = ({ onChange }) => createDropdown({ options: CATEGORY_OPTIONS, onChange, ariaLabel: 'Category filter' });


/**
 * Replace a native <select> with the shared dropdown. The select stays in the DOM (hidden) as the source of truth,
 * so existing code that reads or sets `select.value` and listens for `change` keeps working.
 */
export function enhanceSelect(select) {
  if (!select || select.dataset.enhanced) return;
  select.dataset.enhanced = '1';
  const read = () => [...select.options].map((o) => ({ value: o.value, label: o.textContent.trim() }));
  const host = document.createElement('div');
  host.className = 'dd-block';
  select.after(host);
  select.style.display = 'none';

  const dd = createDropdown({
    options: read,
    ariaLabel: select.getAttribute('aria-label') || select.closest('.form-group')?.querySelector('label')?.textContent?.trim() || 'Choose',
    iconName: 'chevronDown',
    onChange: (v) => { setNative(v); select.dispatchEvent(new Event('change', { bubbles: true })); },
  });
  dd.attach(host);

  // Keep the shared dropdown in step with programmatic changes to the native select.
  const proto = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const setNative = (v) => proto.set.call(select, v);
  Object.defineProperty(select, 'value', {
    get() { return proto.get.call(select); },
    set(v) { proto.set.call(select, v); dd.setValue(proto.get.call(select)); },
  });
  new MutationObserver(() => { dd.setValue(proto.get.call(select)); }).observe(select, { childList: true });
  dd.setValue(proto.get.call(select));
}

export const enhanceSelects = (root = document) => root.querySelectorAll('select:not([data-enhanced])').forEach(enhanceSelect);

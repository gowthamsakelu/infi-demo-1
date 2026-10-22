// One dropdown component: a trigger that opens a plain option list directly below it.
// Used for the category filter on Bookings/Inquiries and for the filter in the Assign sheet.
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
  const labelOf = (v) => (opts().find((o) => o.value === v) || opts()[0])?.label || '';

  function render() {
    hosts.forEach((host) => {
      const isOpen = open?.host === host;
      const trigger = variant === 'icon'
        ? `<button type="button" class="dd-trigger dd-icon-trigger ${value ? 'has-value' : ''}" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}${value ? ': ' + esc(labelOf(value)) : ''}" title="${esc(ariaLabel)}">${icon('filter', { size: 16 })}${value ? '<span class="dd-dot" aria-hidden="true"></span>' : ''}</button>`
        : `<button type="button" class="dd-trigger" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}: ${esc(labelOf(value))}">${icon(iconName, { size: 15 })}<span class="dd-label">${esc(labelOf(value))}</span>${icon('chevronDown', { size: 13, stroke: 2.5 })}</button>`;
      host.innerHTML = `${trigger}
        <ul class="dd-list" role="listbox" id="${id}" ${isOpen ? '' : 'hidden'}>
          ${opts().map((o) => `<li role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === value}" class="${o.value === value ? 'selected' : ''}">${esc(o.label)}</li>`).join('')}
        </ul>`;
      if (isOpen) place(host);
    });
  }

  // Keep the list inside the viewport: flip above the trigger / align to the other edge when needed.
  function place(host) {
    const list = host.querySelector('.dd-list');
    const r = host.getBoundingClientRect();
    list.classList.remove('dd-up', 'dd-left');
    const lr = list.getBoundingClientRect();
    if (lr.bottom > window.innerHeight - 8 && r.top > lr.height + 12) list.classList.add('dd-up');
    if (lr.left < 8) list.classList.add('dd-left');
  }

  function openList(host) {
    closeList(false);
    open = { host, dispose: dismissOnOutside(host, () => closeList(true)) };
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

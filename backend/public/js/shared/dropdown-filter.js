// The one category filter used on Bookings and Inquiries: a trigger (funnel + label + chevron)
// that opens a plain option list directly below it. Selecting applies immediately.
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

export function createCategoryFilter({ onChange }) {
  let value = '';
  const hosts = [];
  let open = null; // { host, dispose }
  const id = `ddf-${++uid}`;
  const labelOf = (v) => CATEGORY_OPTIONS.find((o) => o.value === v)?.label || CATEGORY_OPTIONS[0].label;

  function render() {
    hosts.forEach((host) => {
      const isOpen = open?.host === host;
      host.innerHTML = `
        <button type="button" class="dd-trigger" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="Category filter: ${esc(labelOf(value))}">
          ${icon('filter', { size: 15 })}<span class="dd-label">${esc(labelOf(value))}</span>${icon('chevronDown', { size: 13, stroke: 2.5 })}
        </button>
        <ul class="dd-list" role="listbox" id="${id}" ${isOpen ? '' : 'hidden'}>
          ${CATEGORY_OPTIONS.map((o) => `<li role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === value}" class="${o.value === value ? 'selected' : ''}">${esc(o.label)}</li>`).join('')}
        </ul>`;
    });
  }

  function openList(host) {
    closeList(false);
    open = { host, dispose: dismissOnOutside(host, () => closeList(true)) };
    render();
    host.querySelector('li.selected')?.focus();
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
    /** Mount into `host` (a span/div). Call once per place the dropdown appears. */
    attach(host, extraClass = '') {
      host.classList.add('dd-filter');
      if (extraClass) host.classList.add(extraClass);
      hosts.push(host);
      bind(host);
      render();
    },
    setValue(v) { value = v || ''; render(); },
    getValue: () => value,
    /** Open the list on the first visible host (used by the bulk bar's filter icon). */
    openVisible() {
      const host = hosts.find((h) => h.offsetParent !== null);
      if (host) openList(host);
    },
  };
}

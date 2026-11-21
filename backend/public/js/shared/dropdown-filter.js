// One dropdown component: a trigger that opens an option list anchored to it, in a fixed layer above everything.
// Supports drilldown navigation (Image 1: Category list with right chevrons -> Image 2: Child options with back header).
// Strictly one view at a time (no horizontal flyouts, no awkward jumps, no overlapping).
import { icon } from './icons.js';
import { esc, dismissOnOutside } from './ui.js';

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'TOUR', label: 'Tour Packages' },
  { value: 'VILLA', label: 'Villas & Resorts' },
  { value: 'ACTIVITY', label: 'Activities & Sports' },
  { value: 'TRANSPORT', label: 'Transports' },
];

export const FREIGHT_FILTER_GROUPS = [
  {
    group: 'Service Type',
    options: [
      { value: 'Air Freight', label: 'Air Freight' },
      { value: 'Sea Freight', label: 'Sea Freight' },
      { value: 'Road Transport', label: 'Road Transport' },
      { value: 'Project Cargo', label: 'Project Cargo' },
      { value: 'Customs Clearance', label: 'Customs Clearance' },
    ],
  },
  {
    group: 'Shipment Direction',
    options: [
      { value: 'Import', label: 'Import' },
      { value: 'Export', label: 'Export' },
    ],
  },
  {
    group: 'Priority',
    options: [
      { value: 'Urgent', label: 'Urgent' },
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
    ],
  },
  {
    group: 'Lead Source',
    options: [
      { value: 'Website', label: 'Website' },
      { value: 'Referral', label: 'Referral' },
      { value: 'Email', label: 'Email' },
      { value: 'Phone', label: 'Phone' },
      { value: 'LinkedIn / Social Media', label: 'LinkedIn / Social Media' },
      { value: 'Existing Customer', label: 'Existing Customer' },
    ],
  },
];

export function findFreightOption(val) {
  if (!val) return null;
  const clean = String(val).toLowerCase().trim();
  for (const g of FREIGHT_FILTER_GROUPS) {
    const found = g.options.find((o) => o.value.toLowerCase() === clean);
    if (found) return { ...found, group: g.group };
  }
  return null;
}

function pluralName(group) {
  if (group === 'Service Type') return 'Service Types';
  if (group === 'Shipment Direction') return 'Shipment Directions';
  if (group === 'Priority') return 'Priorities';
  if (group === 'Lead Source') return 'Lead Sources';
  return `${group}s`;
}

let uid = 0;

/**
 * @param {{ options?: {value:string,label:string,icon?:string}[]|(() => {value:string,label:string,icon?:string}[]),
 *           groups?: {group:string,options:{value:string,label:string}[]}[],
 *           onChange: (v:string)=>void,
 *           variant?: 'labelled'|'icon', ariaLabel?: string, iconName?: string, defaultLabel?: string }} cfg
 */
export function createDropdown({ options, groups, onChange, variant = 'labelled', ariaLabel = 'Filter', iconName = 'filter', defaultLabel = 'Filter' }) {
  let value = '';
  let currentView = 'main'; // 'main' or group name (e.g. 'Service Type')
  const hosts = [];
  let open = null; // { host, dispose }
  const id = `dd-${++uid}`;
  const isNested = Array.isArray(groups) && groups.length > 0;

  const opts = () => (typeof options === 'function' ? options() : options || []);

  const getSelectedMeta = () => {
    if (isNested) {
      return findFreightOption(value);
    }
    return opts().find((o) => o.value === value) || null;
  };

  const getLabel = () => {
    if (!value) return defaultLabel;
    const meta = getSelectedMeta();
    return meta?.label || value;
  };

  function renderListHtml() {
    if (isNested) {
      if (currentView === 'main') {
        // Image 1: Main Category View
        return `
          <div class="dd-view-container dd-fade-in">
            <li role="option" tabindex="0" data-action="select" data-value="" aria-selected="${!value}" class="dd-drilldown-item dd-main-reset ${!value ? 'selected' : ''}">
              <span class="dd-item-text">All Categories</span>
              ${!value ? `<span class="dd-check-icon">${icon('check', { size: 14, stroke: 2.5 })}</span>` : ''}
            </li>
            <div class="dd-categories-list">
              ${groups.map((g) => {
                const activeChild = g.options.find((o) => o.value.toLowerCase() === value.toLowerCase());
                return `
                  <li role="button" tabindex="0" data-action="drilldown" data-group="${esc(g.group)}" class="dd-drilldown-item dd-category-row ${activeChild ? 'has-active-child' : ''}">
                    <span class="dd-category-label">${esc(g.group)}</span>
                    <div class="dd-category-meta">
                      ${activeChild ? `<span class="dd-active-badge">${esc(activeChild.label)}</span>` : ''}
                      <span class="dd-chevron-right">${icon('chevronRight', { size: 14, stroke: 2.2 })}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // Image 2: Drilldown Sub-options View for currentView
      const activeGroup = groups.find((g) => g.group === currentView) || groups[0];
      const activeChild = activeGroup.options.find((o) => o.value.toLowerCase() === value.toLowerCase());
      const isGroupSelected = !!activeChild;

      return `
        <div class="dd-view-container dd-fade-in">
          <li role="button" tabindex="0" data-action="back" class="dd-drilldown-back" title="Back to categories">
            <span class="dd-back-chevron">${icon('chevronLeft', { size: 15, stroke: 2.5 })}</span>
            <span class="dd-back-title">${esc(activeGroup.group)}</span>
          </li>
          <li role="option" tabindex="0" data-action="select" data-value="" aria-selected="${!isGroupSelected}" class="dd-drilldown-item dd-sub-reset ${!isGroupSelected ? 'selected' : ''}">
            <span class="dd-item-text">All ${esc(pluralName(activeGroup.group))}</span>
            ${!isGroupSelected ? `<span class="dd-check-icon">${icon('check', { size: 14, stroke: 2.5 })}</span>` : ''}
          </li>
          <div class="dd-sub-options-list">
            ${activeGroup.options.map((opt) => {
              const isSelected = opt.value.toLowerCase() === value.toLowerCase();
              return `
                <li role="option" tabindex="0" data-action="select" data-value="${esc(opt.value)}" aria-selected="${isSelected}" class="dd-drilldown-item dd-sub-option ${isSelected ? 'selected' : ''}">
                  <span class="dd-item-text">${esc(opt.label)}</span>
                  ${isSelected ? `<span class="dd-check-icon">${icon('check', { size: 14, stroke: 2.5 })}</span>` : ''}
                </li>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Flat options fallback
    return opts().map((o) => `
      <li role="option" tabindex="0" data-action="select" data-value="${esc(o.value)}" aria-selected="${o.value === value}" class="${o.value === value ? 'selected' : ''}">
        ${o.icon ? icon(o.icon, { size: 15 }) : ''}<span>${esc(o.label)}</span>
      </li>
    `).join('');
  }

  function render() {
    hosts.forEach((host) => {
      const isOpen = open?.host === host;
      const currentLabel = getLabel();

      const chevronIcon = icon(isOpen ? 'chevronUp' : 'chevronDown', { size: 13, stroke: 2.2 });

      const trigger = variant === 'icon'
        ? `<button type="button" class="dd-trigger dd-icon-trigger ${value ? 'has-value' : ''}" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}${value ? ': ' + esc(currentLabel) : ''}" title="${esc(ariaLabel)}">${icon(iconName, { size: 16 })}${value ? '<span class="dd-dot" aria-hidden="true"></span>' : ''}</button>`
        : `<button type="button" class="dd-trigger ${value ? 'has-active-filter' : ''}" aria-haspopup="listbox" aria-expanded="${isOpen}" aria-label="${esc(ariaLabel)}: ${esc(currentLabel)}">${icon(iconName, { size: 15 })}<span class="dd-label">${esc(currentLabel)}</span><span class="dd-trigger-chevron">${chevronIcon}</span></button>`;

      host.innerHTML = `${trigger}
        <ul class="dd-list dd-drilldown-card ${isNested ? 'dd-drilldown-nested' : ''}" role="listbox" id="${id}" ${isOpen ? '' : 'hidden'}>
          ${renderListHtml()}
        </ul>`;
      if (isOpen) place(host);
    });
  }

  const GAP = 6;
  const EDGE = 8;
  function place(host) {
    const trigger = host.querySelector('.dd-trigger');
    const list = host.querySelector('.dd-list');
    if (!trigger || !list) return;
    const r = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const targetW = isNested ? 230 : Math.min(230, vw - EDGE * 2);
    const maxW = Math.min(targetW, vw - EDGE * 2);

    Object.assign(list.style, {
      position: 'fixed',
      right: 'auto',
      bottom: 'auto',
      margin: '0',
      zIndex: '1300',
      minWidth: `${Math.min(r.width, maxW)}px`,
      maxWidth: `${maxW}px`,
      width: `${maxW}px`,
      maxHeight: '',
      overflowY: 'auto',
      left: '0px',
      top: '0px',
      visibility: 'hidden',
    });

    const lw = list.getBoundingClientRect().width;
    const lh = list.getBoundingClientRect().height;
    let left = r.left;
    if (left + lw > vw - EDGE) left = r.right - lw;
    left = Math.max(EDGE, Math.min(left, vw - EDGE - lw));
    let top = r.bottom + GAP;
    const roomBelow = vh - EDGE - top;
    const roomAbove = r.top - GAP - EDGE;
    if (lh > roomBelow && roomAbove > roomBelow) {
      top = Math.max(EDGE, r.top - GAP - Math.min(lh, roomAbove));
      list.style.maxHeight = `${Math.min(lh, roomAbove)}px`;
      list.classList.add('dd-up');
    } else {
      list.style.maxHeight = `${Math.max(160, Math.min(lh, roomBelow))}px`;
      list.classList.remove('dd-up');
    }

    Object.assign(list.style, { left: `${left}px`, top: `${top}px`, visibility: '' });
  }

  function openList(host) {
    closeList(false);
    currentView = 'main'; // Always open to main categories view (Image 1)
    const stopOutside = dismissOnOutside(host, () => closeList(true));
    const move = () => { if (open) place(open.host); };
    window.addEventListener('resize', move);
    window.addEventListener('scroll', move, true);
    open = { host, dispose: () => { stopOutside(); window.removeEventListener('resize', move); window.removeEventListener('scroll', move, true); } };
    render();
  }

  function closeList(refocus) {
    if (!open) return;
    const { host, dispose } = open;
    dispose();
    open = null;
    currentView = 'main';
    render();
    if (refocus) host.querySelector('.dd-trigger')?.focus();
  }

  function bind(host) {
    host.addEventListener('click', (e) => {
      // 1. Trigger button click
      if (e.target.closest('.dd-trigger')) {
        return open?.host === host ? closeList(false) : openList(host);
      }

      // 2. Back header click: return to main categories view (Image 2 -> Image 1)
      const backBtn = e.target.closest('[data-action="back"]');
      if (backBtn) {
        e.stopPropagation();
        e.preventDefault();
        currentView = 'main';
        render();
        return;
      }

      // 3. Drilldown category click: switch to child options view (Image 1 -> Image 2)
      const drillBtn = e.target.closest('[data-action="drilldown"]');
      if (drillBtn) {
        e.stopPropagation();
        e.preventDefault();
        const targetGroup = drillBtn.dataset.group;
        currentView = targetGroup;
        render();
        return;
      }

      // 4. Option select click: choose filter and close
      const selectItem = e.target.closest('[data-action="select"]');
      if (selectItem) {
        e.stopPropagation();
        const nextVal = selectItem.dataset.value || '';
        closeList(true);
        if (nextVal !== value) {
          value = nextVal;
          render();
          onChange(value);
        }
      }
    });

    host.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closeList(true);
        return;
      }

      // ArrowLeft or Backspace when in sub-view returns to main categories view
      if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && open && currentView !== 'main') {
        e.preventDefault();
        currentView = 'main';
        render();
        return;
      }

      const items = [...host.querySelectorAll('li[tabindex="0"]')];
      const i = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!open) openList(host);
        else items[Math.min(i + 1, items.length - 1)]?.focus();
      } else if (e.key === 'ArrowUp' && open) {
        e.preventDefault();
        items[Math.max(i - 1, 0)]?.focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement) {
        e.preventDefault();
        document.activeElement.click();
      } else if (e.key === 'ArrowRight' && document.activeElement?.matches('[data-action="drilldown"]')) {
        e.preventDefault();
        document.activeElement.click();
      }
    });
  }

  return {
    attach(host, extraClass = '') {
      host.classList.add('dd-filter');
      if (extraClass) host.classList.add(extraClass);
      hosts.push(host);
      bind(host);
      render();
    },
    setValue(v) {
      value = v || '';
      render();
    },
    getValue: () => value,
    refresh: render,
    close: () => closeList(false),
    openVisible() {
      const host = hosts.find((h) => h.offsetParent !== null);
      if (host) openList(host);
    },
  };
}

export const createCategoryFilter = ({ onChange }) => createDropdown({
  groups: FREIGHT_FILTER_GROUPS,
  onChange,
  ariaLabel: 'Filter',
  iconName: 'filter',
  defaultLabel: 'Filter',
});

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

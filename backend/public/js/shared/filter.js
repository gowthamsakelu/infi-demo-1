// One filter component for every list page.
// Page config: { title?, fields: [{ key, label, type: 'select', options: [{value,label}] }
//                              | { key: 'date', label, type: 'daterange', fromKey, toKey }] }
// Values are a flat { [paramKey]: string } object; the page persists them in the query string.
import { icon } from './icons.js';
import { esc, dismissOnOutside } from './ui.js';

let uid = 0;

export function createFilter({ config, onApply }) {
  const id = `filter-${++uid}`;
  let values = {};
  const slots = [];      // button mount points
  const chipHosts = [];  // chip row mount points
  let overlay = null;
  let disposeDismiss = null;
  let lastFocus = null;

  const keysOf = (f) => (f.type === 'daterange' ? [f.fromKey, f.toKey] : [f.key]);
  const isActive = (f) => keysOf(f).some((k) => values[k]);
  const active = () => config.fields.filter(isActive);
  const count = () => active().length;

  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  function valueLabel(f) {
    if (f.type === 'daterange') {
      const from = values[f.fromKey]; const to = values[f.toKey];
      if (from && to) return `${fmtDate(from)} – ${fmtDate(to)}`;
      return from ? `From ${fmtDate(from)}` : `Until ${fmtDate(to)}`;
    }
    return f.options.find((o) => o.value === values[f.key])?.label || values[f.key];
  }

  function buttonHTML() {
    const n = count();
    return `<button type="button" class="filter-btn ${n ? 'has-filters' : ''}" data-filter-open aria-haspopup="dialog" aria-label="Filters${n ? `, ${n} active` : ''}">
      ${icon('filter', { size: 15 })}<span class="filter-btn-label">Filter</span>${n ? `<span class="filter-badge">${n}</span>` : ''}
    </button>`;
  }

  function chipsHTML() {
    const list = active();
    if (!list.length) return '';
    return `${list.map((f) => `
      <span class="filter-chip">
        <span><strong>${esc(f.label)}:</strong> ${esc(valueLabel(f))}</span>
        <button type="button" data-filter-remove="${esc(f.type === 'daterange' ? 'date:' + f.key : f.key)}" aria-label="Remove ${esc(f.label)} filter">${icon('close', { size: 12, stroke: 2.5 })}</button>
      </span>`).join('')}
      <button type="button" class="filter-clear-all" data-filter-clear>Clear all</button>`;
  }

  function render() {
    slots.forEach((s) => { s.innerHTML = buttonHTML(); });
    chipHosts.forEach((c) => {
      c.innerHTML = chipsHTML();
      c.hidden = count() === 0;
    });
  }

  function apply(next) {
    values = next;
    render();
    onApply({ ...values });
  }

  function clearKeys(f) {
    const next = { ...values };
    keysOf(f).forEach((k) => delete next[k]);
    return next;
  }

  function onChipClick(e) {
    if (e.target.closest('[data-filter-clear]')) return apply({});
    const rm = e.target.closest('[data-filter-remove]');
    if (!rm) return;
    const f = config.fields.find((x) => (x.type === 'daterange' ? `date:${x.key}` : x.key) === rm.dataset.filterRemove);
    if (f) apply(clearKeys(f));
  }

  function fieldHTML(f) {
    if (f.type === 'daterange') {
      return `<fieldset class="filter-field">
        <legend>${esc(f.label)}</legend>
        <div class="filter-date-row">
          <label><span>From</span><input type="date" data-k="${f.fromKey}" value="${esc(values[f.fromKey] || '')}"></label>
          <label><span>To</span><input type="date" data-k="${f.toKey}" value="${esc(values[f.toKey] || '')}"></label>
        </div></fieldset>`;
    }
    return `<div class="filter-field"><label for="${id}-${f.key}">${esc(f.label)}</label>
      <select id="${id}-${f.key}" data-k="${f.key}">
        <option value="">All</option>
        ${f.options.map((o) => `<option value="${esc(o.value)}" ${values[f.key] === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
      </select></div>`;
  }

  function open() {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    overlay.innerHTML = `
      <aside class="filter-panel" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <div class="filter-handle" aria-hidden="true"></div>
        <header class="filter-header">
          <h3 id="${id}-title">${esc(config.title || 'Filters')}</h3>
          <button type="button" class="sheet-close-btn" data-filter-close aria-label="Close filters">${icon('close', { size: 16, stroke: 2.5 })}</button>
        </header>
        <form class="filter-body" novalidate>${config.fields.map(fieldHTML).join('')}</form>
        <footer class="filter-footer">
          <button type="button" class="btn-secondary-desktop" data-filter-reset>Reset</button>
          <button type="button" class="btn-primary-desktop" data-filter-apply>Apply</button>
        </footer>
      </aside>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay?.classList.add('open'));

    const panel = overlay.querySelector('.filter-panel');
    const draft = () => {
      const next = {};
      overlay.querySelectorAll('[data-k]').forEach((el) => { if (el.value) next[el.dataset.k] = el.value; });
      return next;
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-filter-close]')) return close();
      if (e.target.closest('[data-filter-apply]')) {
        const next = draft();
        const f = config.fields.find((x) => x.type === 'daterange');
        if (f && next[f.fromKey] && next[f.toKey] && next[f.fromKey] > next[f.toKey]) {
          [next[f.fromKey], next[f.toKey]] = [next[f.toKey], next[f.fromKey]];
        }
        close(); apply(next);
      }
      if (e.target.closest('[data-filter-reset]')) { close(); apply({}); }
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [...panel.querySelectorAll('button, select, input')].filter((n) => !n.disabled);
      if (!f.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    disposeDismiss = dismissOnOutside(panel, close);
    panel.querySelector('select, input')?.focus();
  }

  function close() {
    if (!overlay) return;
    disposeDismiss?.();
    const el = overlay;
    overlay = null;
    el.classList.remove('open');
    setTimeout(() => el.remove(), 180);
    lastFocus?.focus?.();
  }

  return {
    /** Render the Filter button into `el` and wire it. */
    attachButton(el) {
      slots.push(el);
      el.addEventListener('click', (e) => { if (e.target.closest('[data-filter-open]')) open(); });
      render();
    },
    /** Render removable active-filter chips into `el`. */
    attachChips(el) {
      chipHosts.push(el);
      el.addEventListener('click', onChipClick);
      render();
    },
    setValues(v) { values = { ...v }; render(); },
    getValues: () => ({ ...values }),
    count,
    close,
  };
}

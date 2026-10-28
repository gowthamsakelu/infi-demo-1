// The field pieces of the catalog wizard (shared/wizard.js). A field is described by config only:
//   { key, type, label, placeholder?, optional?, options?, multi?, max?, hint?, icon?, sub? }
// types: text, number, price, date, textarea, select, chips, toggle, list, image, rates, rows.
// `render` draws one field from its value; `bind` is called once per painted step to wire the pieces that need more than a delegated event
// (the dropdowns). The wizard owns events and state; nothing here keeps state.
import { icon } from './icons.js';
import { esc } from './ui.js';
import { createDropdown } from './dropdown-filter.js';
import { toggle } from './page-ui.js';

export const isEmpty = (v) => v == null || v === '' || v === false || (Array.isArray(v) && v.every((x) => isEmpty(typeof x === 'object' && x ? Object.values(x).find((y) => !isEmpty(y)) : x)));

const labelHtml = (f) => `${esc(f.label)}${f.optional === false ? '' : '<span class="bld-optional"> (optional)</span>'}`;
const wrap = (f, inner, error = '') => `<div class="fu-field" data-wf="${esc(f.key)}"><label for="wf-${esc(f.key)}">${labelHtml(f)}</label>${inner}${f.hint ? `<p class="wf-hint">${esc(f.hint)}</p>` : ''}<p class="fu-error" id="wf-${esc(f.key)}-err" role="alert" ${error ? '' : 'hidden'}>${esc(error)}</p></div>`;
const iconBtn = (attrs, name, label) => `<button type="button" class="wf-icon-btn" ${attrs} aria-label="${esc(label)}">${icon(name, { size: 16, stroke: 2.2 })}</button>`;

/** The select's options (a function when they depend on loaded data); "Not set" first when the field is optional. */
export const optionsOf = (f) => {
  const o = typeof f.options === 'function' ? f.options() : f.options || [];
  return f.optional === false ? o : [{ value: '', label: 'Not set' }, ...o];
};

const inputBox = (f, v, type, extra = '') => `<div class="bld-input">${f.type === 'price' ? '<span class="wiz-cur" aria-hidden="true">₹</span>' : f.icon ? icon(f.icon, { size: 17 }) : ''}<input id="wf-${esc(f.key)}" type="${type}" ${extra} data-wk="${esc(f.key)}" maxlength="${f.max || 160}" placeholder="${esc(f.placeholder || '')}" value="${esc(v ?? '')}" autocomplete="off"></div>`;

export function renderField(f, v, error = '') {
  switch (f.type) {
    case 'number': return wrap(f, inputBox(f, v, 'number', 'inputmode="numeric" min="0"'), error);
    case 'price': return wrap(f, inputBox(f, v, 'number', 'inputmode="decimal" min="0"'), error);
    case 'date': return wrap(f, inputBox(f, v, 'date'), error);
    case 'textarea': return wrap(f, `<textarea id="wf-${esc(f.key)}" class="bld-textarea" data-wk="${esc(f.key)}" rows="${f.rows || 4}" maxlength="${f.max || 2000}" placeholder="${esc(f.placeholder || '')}">${esc(v ?? '')}</textarea>`, error);
    case 'select': return wrap(f, `<div class="wf-select" data-wsel="${esc(f.key)}"></div>`, error);
    case 'chips': {
      const on = new Set(f.multi ? v || [] : [v]);
      return wrap(f, `<div class="bld-chips" role="group" aria-label="${esc(f.label)}">${(typeof f.options === 'function' ? f.options() : f.options).map((o) => `<button type="button" class="bld-chip ${on.has(o.value) ? 'is-on' : ''}" data-wchip="${esc(f.key)}" data-val="${esc(o.value)}" aria-pressed="${on.has(o.value)}">${esc(o.label)}</button>`).join('')}</div>`, error);
    }
    case 'toggle': return `<div class="fu-field" data-wf="${esc(f.key)}">${toggle({ id: f.key, label: f.label, on: !!v, hint: f.hint })}</div>`;
    case 'list': {
      const rows = Array.isArray(v) && v.length ? v : [];
      return wrap(f, `<div class="wf-list">${rows.map((t, i) => `<div class="wf-row"><div class="bld-input"><input type="text" data-wlist="${esc(f.key)}" data-i="${i}" maxlength="${f.max || 200}" placeholder="${esc(f.placeholder || 'Add an item')}" value="${esc(t)}" autocomplete="off" aria-label="${esc(f.label)} ${i + 1}"></div>${iconBtn(`data-wlist-del="${esc(f.key)}" data-i="${i}"`, 'trash', 'Remove item')}</div>`).join('')}
        <button type="button" class="btn-secondary-desktop wf-add" data-wlist-add="${esc(f.key)}">${icon('plus', { size: 15, stroke: 2.4 })}${esc(f.addLabel || 'Add item')}</button></div>`, error);
    }
    case 'rates': {
      const rows = Array.isArray(v) ? v : [];
      return wrap(f, `<div class="wf-list">${rows.map((r, i) => `<div class="wf-row wf-row-rate"><div class="bld-input"><input type="text" data-wrate="${esc(f.key)}" data-i="${i}" data-f="label" maxlength="80" placeholder="${esc(f.placeholder || 'Name')}" value="${esc(r.label ?? '')}" autocomplete="off" aria-label="Name ${i + 1}"></div><div class="bld-input"><span class="wiz-cur" aria-hidden="true">₹</span><input type="number" inputmode="decimal" min="0" data-wrate="${esc(f.key)}" data-i="${i}" data-f="amount" placeholder="Rate" value="${esc(r.amount ?? '')}" autocomplete="off" aria-label="Rate ${i + 1}"></div>${iconBtn(`data-wlist-del="${esc(f.key)}" data-i="${i}"`, 'trash', 'Remove row')}</div>`).join('')}
        <button type="button" class="btn-secondary-desktop wf-add" data-wlist-add="${esc(f.key)}">${icon('plus', { size: 15, stroke: 2.4 })}${esc(f.addLabel || 'Add rate')}</button></div>`, error);
    }
    case 'image': {
      const imgs = Array.isArray(v) ? v : [];
      return wrap(f, `<div class="wf-images">${imgs.map((src, i) => `<div class="wf-thumb"><img src="${esc(src)}" alt="" loading="lazy">${iconBtn(`data-wimg-del="${esc(f.key)}" data-i="${i}"`, 'close', 'Remove image')}</div>`).join('')}
        <label class="btn-secondary-desktop wf-add">${icon('plus', { size: 15, stroke: 2.4 })}${f.multi ? 'Add images' : imgs.length ? 'Change image' : 'Add image'}<input type="file" accept="image/*" ${f.multi ? 'multiple' : ''} data-wimg="${esc(f.key)}" hidden></label></div>`, error);
    }
    case 'rows': { // items with several fields, added and edited on a pushed screen (cfg.sub)
      const rows = Array.isArray(v) ? v : [];
      return wrap(f, `<div class="wf-list">${rows.map((r, i) => `<div class="wf-card"><div class="wf-card-text"><b>${esc(f.sub.rowLabel ? f.sub.rowLabel(i) : `${f.sub.title} ${i + 1}`)}${r[f.sub.fields[0].key] ? ` · ${esc(r[f.sub.fields[0].key])}` : ''}</b>${r[f.sub.fields[1]?.key] ? `<small>${esc(r[f.sub.fields[1].key])}</small>` : ''}</div>${iconBtn(`data-wrow-edit="${esc(f.key)}" data-i="${i}"`, 'edit', 'Edit')}${iconBtn(`data-wlist-del="${esc(f.key)}" data-i="${i}"`, 'trash', 'Remove')}</div>`).join('')}
        <button type="button" class="btn-secondary-desktop wf-add" data-wrow-add="${esc(f.key)}">${icon('plus', { size: 15, stroke: 2.4 })}${esc(f.addLabel || `Add ${f.sub.title.toLowerCase()}`)}</button></div>`, error);
    }
    default: return wrap(f, inputBox(f, v, 'text'), error);
  }
}

/** Wire the dropdowns of a painted step. Returns a disposer. */
export function bindSelects(root, fields, values, onChange) {
  const dds = [];
  fields.filter((f) => f.type === 'select').forEach((f) => {
    const host = root.querySelector(`[data-wsel="${f.key}"]`);
    if (!host) return;
    const dd = createDropdown({ options: () => optionsOf(f), ariaLabel: f.label, iconName: f.icon || 'chevronDown', onChange: (val) => onChange(f.key, val) });
    dd.attach(host, '');
    dd.setValue(values[f.key] ?? '');
    dds.push(dd);
  });
  return () => dds.forEach((d) => d.close?.());
}

/** How a value reads on the Review step. */
export function display(f, v) {
  if (isEmpty(v)) return '';
  if (f.type === 'price') return `₹${Number(v).toLocaleString('en-IN')}`;
  if (f.type === 'toggle') return 'Yes';
  if (f.type === 'select' || f.type === 'chips') {
    const opts = (typeof f.options === 'function' ? f.options() : f.options) || [];
    return (Array.isArray(v) ? v : [v]).map((x) => opts.find((o) => o.value === x)?.label ?? x).join(', ');
  }
  if (f.type === 'list') return v.filter(Boolean).join(' · ');
  if (f.type === 'rates') return v.filter((r) => r.label || r.amount).map((r) => `${r.label || 'Rate'} ₹${Number(r.amount || 0).toLocaleString('en-IN')}`).join(' · ');
  if (f.type === 'rows') return v.map((r) => r[f.sub.fields[0].key]).filter(Boolean).join(' · ') || `${v.length} added`;
  if (f.type === 'image') return `${v.length} image${v.length === 1 ? '' : 's'}`;
  return String(v);
}

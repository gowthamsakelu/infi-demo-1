// The catalog Add / Edit wizard: ONE step-by-step dialog (PC and tablets) / bottom sheet (phones) for every catalog page, described by config only.
// It is the Add Inquiry wizard's shell (the wiz-* markup and css) with the steps, fields and preview coming from the page's config:
//   {
//     noun: 'package',                       // "Add package" / the Review heading
//     requiredKey: 'name',                   // the only required field (inline error under it)
//     steps: [{ label, title, sub, fields: [{ key, type, label, ... }] }],   // see wizard-fields.js; a "Review" step is added last
//     preview: (values) => ({ title, lines: [] }),  // the live preview card on PC
//     defaults: () => ({ ... }),             // values of a new record
//     save: async (values, { mode, record }) => record,  // POST / PUT; throw an ApiError (with .errors) to show server messages inline
//   }
// openWizard(config, { mode: 'add' | 'edit', record?, values?, onSaved?, returnFocus? }). In Edit mode the dialog is titled "Edit <name>", every
// step is open from the start, the last button reads "Save changes" and nothing says "new".
import { icon } from './icons.js';
import { esc, toast } from './ui.js';
import { openSheet, openScreen, confirmDialog } from './sheet.js';
import { flipToggle } from './page-ui.js';
import { renderField, bindSelects, display, isEmpty } from './wizard-fields.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const clone = (v) => JSON.parse(JSON.stringify(v));

export function openWizard(cfg, { mode = 'add', record = null, values = null, onSaved, returnFocus } = {}) {
  const edit = mode === 'edit';
  const steps = [...cfg.steps, { label: 'Review', title: 'Review', sub: edit ? 'Check the changes, then save.' : 'Check what you filled in, then save.', review: true }];
  const last = steps.length - 1;
  const allFields = cfg.steps.flatMap((s) => s.fields);
  const v = Object.assign(cfg.defaults ? cfg.defaults() : {}, values ? clone(values) : {});
  const initial = JSON.stringify(v);
  const errors = {};
  let step = 0;
  let saving = false;
  let disposeSelects = () => {};

  const heading = () => (edit ? `Edit ${String(v[cfg.requiredKey] || cfg.noun).trim() || cfg.noun}` : `Add ${cfg.noun}`);
  const detailCount = () => allFields.filter((f) => !isEmpty(v[f.key]) && f.key !== cfg.requiredKey).length + (isEmpty(v[cfg.requiredKey]) ? 0 : 1);

  const dlg = openSheet({
    label: edit ? 'Edit' : `Add ${cfg.noun}`,
    cls: 'wiz-sheet',
    returnFocus,
    beforeClose: () => JSON.stringify(v) === initial || confirmDialog({ title: `Discard this ${cfg.noun}?`, text: 'What you entered has not been saved.', confirm: 'Discard', cancel: 'Keep editing', danger: true }),
    html: `<header class="asg-header wiz-header">
        <div class="wiz-title"><h3 data-dialog-title tabindex="-1" id="wz-title"></h3><p class="wiz-sub">${edit ? 'Change what you need. Everything except the name is optional.' : 'Fill in what you know. Only the name is required.'}</p></div>
        <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>
      <div class="wiz-progress"><p class="wiz-mstep" id="wz-mstep"></p><div class="wiz-seg" id="wz-seg" aria-hidden="true"></div></div>
      <div class="wiz-main">
        <nav class="wiz-rail" id="wz-rail" aria-label="Steps"></nav>
        <div class="wiz-pane">
          <div class="wiz-body" id="wz-body"></div>
          <footer class="fu-footer wiz-footer">
            <button type="button" class="bld-link wiz-early" id="wz-early"></button>
            <span class="wiz-spacer"></span>
            <button type="button" class="btn-secondary-desktop" id="wz-back">Back</button>
            <button type="button" class="btn-primary-desktop" id="wz-next">Next</button>
          </footer>
        </div>
      </div>`,
  });
  const $ = dlg.$;
  const bodyEl = $('#wz-body');

  /* ---------- chrome ---------- */
  function previewHtml() {
    const p = cfg.preview(v);
    return `<small>LIVE PREVIEW</small><b>${esc(p.title || `Untitled ${cfg.noun}`)}</b>${(p.lines || []).filter(Boolean).map((l) => `<span>${esc(l)}</span>`).join('')}`;
  }
  const earlyHtml = () => `${icon('check', { size: 16, stroke: 2.5 })}<span>Save with what I have</span><small>· ${plural(detailCount(), 'detail')} added</small>`;
  function paintChrome() {
    $('#wz-title').textContent = heading();
    $('#wz-rail').innerHTML = `${steps.map((t, i) => `
        <button type="button" class="wiz-step ${i === step ? 'is-current' : ''} ${!edit && i < step ? 'is-done' : ''}" data-go="${i}" ${i === step ? 'aria-current="step"' : ''}>
          <span class="bld-step-dot">${!edit && i < step ? icon('check', { size: 14, stroke: 3 }) : i + 1}</span><span class="wiz-step-label">${esc(t.label)}</span>
        </button>`).join('')}
      <div class="wiz-preview" id="wz-preview" aria-live="off">${previewHtml()}</div>`;
    $('#wz-mstep').textContent = `Step ${step + 1} of ${steps.length} · ${steps[step].label}`;
    $('#wz-seg').innerHTML = steps.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('');
    paintFooter();
  }
  function paintFooter() {
    $('#wz-early').hidden = step === last;
    $('#wz-early').innerHTML = earlyHtml();
    $('#wz-back').hidden = step === 0;
    $('#wz-next').textContent = saving ? 'Saving…' : step === last ? (edit ? 'Save changes' : `Save ${cfg.noun}`) : 'Next';
    dlg.sheet.querySelectorAll('#wz-back, #wz-next, #wz-early').forEach((b) => { b.disabled = saving; });
  }
  /** While typing: no re-render, so the cursor (and the phone's keyboard) stay where they are. */
  function paintLive() {
    const pv = $('#wz-preview');
    if (pv) pv.innerHTML = previewHtml();
    const early = $('#wz-early');
    if (early) early.innerHTML = earlyHtml();
    const title = $('#wz-title');
    if (title) title.textContent = heading();
  }

  /* ---------- steps ---------- */
  function reviewHtml() {
    const groups = cfg.steps.map((s, i) => {
      const rows = s.fields.map((f) => [f, display(f, v[f.key])]).filter(([, text]) => text);
      return `<section class="wz-review-group"><div class="wz-review-head"><h4>${esc(s.label)}</h4><button type="button" class="bld-link" data-go="${i}">Edit</button></div>
        ${rows.length ? `<dl class="wz-review">${rows.map(([f, text]) => `<div><dt>${esc(f.label)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>` : '<p class="wiz-help">Nothing added.</p>'}</section>`;
    }).join('');
    return errors[cfg.requiredKey] ? `<p class="fu-error" role="alert">${esc(errors[cfg.requiredKey])}</p>${groups}` : groups;
  }
  function renderStep() {
    disposeSelects();
    const s = steps[step];
    const html = s.review ? reviewHtml() : fieldsHtml(s.fields);
    bodyEl.innerHTML = `<section class="wiz-step-pane" aria-labelledby="wz-h"><h4 class="wiz-h" id="wz-h" tabindex="-1">${esc(s.title)}</h4><p class="wiz-help">${esc(s.sub || '')}</p>${html}</section>`;
    disposeSelects = s.review ? () => {} : bindSelects(bodyEl, s.fields, v, (k, val) => { v[k] = val; paintLive(); });
    bodyEl.scrollTop = 0;
  }
  /** Fields marked `half` sit two to a row (like Customer & trip). */
  function fieldsHtml(fields) {
    const one = (f) => renderField(f, v[f.key], errors[f.key]);
    const out = [];
    for (let i = 0; i < fields.length; i += 1) {
      if (fields[i].half && fields[i + 1]?.half) { out.push(`<div class="wiz-row">${one(fields[i])}${one(fields[i + 1])}</div>`); i += 1; } else out.push(one(fields[i]));
    }
    return out.join('');
  }

  function go(to) {
    if (saving || to === step) return;
    step = Math.max(0, Math.min(last, to));
    renderStep();
    paintChrome();
    $('#wz-h')?.focus({ preventScroll: true }); // a heading, never an input: no keyboard pops up
  }

  /* ---------- save ---------- */
  function validate() {
    Object.keys(errors).forEach((k) => delete errors[k]);
    if (String(v[cfg.requiredKey] ?? '').trim() === '') errors[cfg.requiredKey] = `Give the ${cfg.noun} a name.`;
    return Object.keys(errors).length === 0;
  }
  const stepOf = (key) => cfg.steps.findIndex((s) => s.fields.some((f) => f.key === key));

  async function save() {
    if (saving) return;
    if (!validate()) { step = stepOf(cfg.requiredKey); renderStep(); paintChrome(); $('#wz-h')?.focus({ preventScroll: true }); return; }
    const n = detailCount();
    saving = true;
    paintFooter();
    try {
      const saved = await cfg.save(clone(v), { mode, record });
      dlg.close();
      onSaved?.(saved, { mode });
      toast(n > 1 ? `Saved with ${plural(n, 'detail')}.` : 'Saved', 'success');
    } catch (e) {
      saving = false;
      const fieldErrors = e?.errors || {};
      let first = null;
      Object.entries(fieldErrors).forEach(([k, msgs]) => {
        const key = k.split('.')[0];
        if (allFields.some((f) => f.key === key) && !errors[key]) { errors[key] = [].concat(msgs)[0]; first ??= key; }
      });
      if (first !== null) { go(stepOf(first)); toast(errors[first], 'warning'); } else { paintFooter(); toast(e?.message || `Could not save the ${cfg.noun}.`, 'warning'); }
    }
  }

  /* ---------- sub screens (a day, a room type ...) on the shared push screen ---------- */
  function openRowScreen(f, index) {
    const sub = f.sub;
    const rows = v[f.key] || (v[f.key] = []);
    const current = index == null ? {} : { ...rows[index] };
    const screen = openScreen({
      title: index == null ? `Add ${sub.title.toLowerCase()}` : `Edit ${sub.title.toLowerCase()}`,
      body: sub.fields.map((sf) => renderField({ ...sf, key: `sub-${sf.key}` }, current[sf.key], '')).join(''),
      footer: '<button type="button" class="btn-secondary-desktop" data-sheet-close>Cancel</button><button type="button" class="btn-primary-desktop" data-sub-save>Save</button>',
    });
    screen.ov.addEventListener('input', (e) => {
      const k = e.target.dataset.wk?.replace(/^sub-/, '');
      if (k) { current[k] = e.target.value; const p = screen.$(`#wf-sub-${k}-err`); if (p) p.hidden = true; }
    });
    screen.ov.addEventListener('click', (e) => {
      if (!e.target.closest('[data-sub-save]')) return;
      const need = sub.fields.find((sf) => sf.required && String(current[sf.key] ?? '').trim() === '');
      if (need) { const p = screen.$(`#wf-sub-${need.key}-err`); if (p) { p.textContent = `Enter the ${need.label.toLowerCase()}.`; p.hidden = false; } return; }
      if (index == null) rows.push(current); else rows[index] = current;
      v[`${f.key}Touched`] = true;
      screen.close();
      renderStep();
      paintLive();
    });
  }

  /* ---------- events ---------- */
  dlg.ov.addEventListener('click', (e) => {
    const t = (sel) => e.target.closest(sel);
    let el;
    if (t('#wz-next')) { if (step === last) save(); else go(step + 1); return; }
    if (t('#wz-back')) { go(step - 1); return; }
    if (t('#wz-early')) { save(); return; }
    if ((el = t('[data-go]'))) { go(Number(el.dataset.go)); return; }
    if ((el = t('[data-wchip]'))) {
      const f = allFields.find((x) => x.key === el.dataset.wchip);
      const val = el.dataset.val;
      if (f.multi) { const set = new Set(v[f.key] || []); set.has(val) ? set.delete(val) : set.add(val); v[f.key] = [...set]; } else v[f.key] = v[f.key] === val ? '' : val;
      renderStep(); paintLive();
      return;
    }
    if ((el = t('[data-sp-toggle]'))) { v[el.dataset.spToggle] = flipToggle(el); paintLive(); return; }
    if ((el = t('[data-wlist-add]'))) {
      const f = allFields.find((x) => x.key === el.dataset.wlistAdd);
      (v[f.key] ||= []).push(f.type === 'rates' ? { label: '', amount: '' } : '');
      renderStep(); paintLive();
      return;
    }
    if ((el = t('[data-wlist-del]'))) {
      const k = el.dataset.wlistDel;
      v[k].splice(Number(el.dataset.i), 1);
      v[`${k}Touched`] = true;
      renderStep(); paintLive();
      return;
    }
    if ((el = t('[data-wimg-del]'))) { v[el.dataset.wimgDel].splice(Number(el.dataset.i), 1); renderStep(); paintLive(); return; }
    if ((el = t('[data-wrow-add]'))) { openRowScreen(allFields.find((x) => x.key === el.dataset.wrowAdd), null); return; }
    if ((el = t('[data-wrow-edit]'))) { openRowScreen(allFields.find((x) => x.key === el.dataset.wrowEdit), Number(el.dataset.i)); }
  });

  dlg.ov.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.wk && !el.dataset.wk.startsWith('sub-')) {
      v[el.dataset.wk] = el.value;
      if (errors[el.dataset.wk]) { delete errors[el.dataset.wk]; const p = $(`#wf-${el.dataset.wk}-err`); if (p) p.hidden = true; }
    } else if (el.dataset.wlist) { v[el.dataset.wlist][Number(el.dataset.i)] = el.value; }
    else if (el.dataset.wrate) { v[el.dataset.wrate][Number(el.dataset.i)][el.dataset.f] = el.value; }
    else return;
    paintLive();
  });

  dlg.ov.addEventListener('change', (e) => {
    const el = e.target;
    if (!el.dataset.wimg) return;
    const f = allFields.find((x) => x.key === el.dataset.wimg);
    const files = [...el.files];
    Promise.all(files.map((file) => new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(file); }))).then((urls) => {
      v[f.key] = f.multi ? [...(v[f.key] || []), ...urls] : urls.slice(0, 1);
      renderStep(); paintLive();
    });
  });

  paintChrome();
  renderStep();
  return { close: () => dlg.close(), values: v };
}

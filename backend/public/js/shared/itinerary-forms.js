// The small "Add to Day N" dialog for hotel stays, transport, activities, meals and notes (Bookings and Inquiries share it).
// It is the same card as "Add New Guest" (modal-card), opened on top of the itinerary popup: a back arrow instead of an X,
// a scrolling body and a footer that stays in view. One engine below; each kind of event only supplies its fields.
import { icon } from './icons.js';
import { esc, initials } from './ui.js';
import { openSheet, confirmDialog } from './sheet.js';
import { enhanceSelects } from './dropdown-filter.js';
import { openAssign } from './assign-sheet.js';
import * as M from './itinerary-builder.js';
import * as P from './places-client.js';

export const ROOM_TYPE_OPTIONS = ['Standard', 'Deluxe', 'Premium', 'Suite', 'Cottage', 'Dormitory', 'Other'];
const INCLUSION = [{ value: 'included', label: 'Included in package' }, { value: 'paid_extra', label: 'Paid extra' }];
const TRANSIENT = new Set(['tab', 'editRate', 'showMore', 'picked', 'touched', 'q', 'moveTouched', 'dropTouched']);

const rupee = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const num = (x) => { const n = Number(x); return x === '' || x === null || x === undefined || !Number.isFinite(n) ? null : n; };
const round2 = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------------------------------------
   Field pieces (all return markup; every input carries data-field so the engine can read it)
   ------------------------------------------------------------------------------------------------ */

const fid = (k) => `df-${k}`;
function group(label, inner, { key = '', optional = false, hint = '', cls = '' } = {}) {
  const lab = label ? `<label${key ? ` for="${fid(key)}"` : ''}>${esc(label)}${optional ? '<span class="bld-optional"> (optional)</span>' : ''}</label>` : '';
  return `<div class="form-group ${cls}" data-key="${key}">${lab}${inner}${hint ? `<p class="bld-hint" data-hint="${key}">${hint}</p>` : ''}${key ? `<p class="fu-error" data-error="${key}" role="alert" hidden></p>` : ''}</div>`;
}
const textField = (v, key, label, { ph = '', max = 120, type = 'text', optional = false, hint = '' } = {}) =>
  group(label, `<input id="${fid(key)}" type="${type}" maxlength="${max}" data-field="${key}" value="${esc(v[key] ?? '')}" placeholder="${esc(ph)}" autocomplete="off">`, { key, optional, hint });
const areaField = (v, key, label, { ph = '', max = 500, optional = true } = {}) =>
  group(label, `<textarea id="${fid(key)}" data-field="${key}" rows="3" maxlength="${max}" placeholder="${esc(ph)}">${esc(v[key] ?? '')}</textarea>`, { key, optional });
const moneyField = (v, key, label, { optional = false, hint = '', ariaLabel = '' } = {}) =>
  group(label, `<div class="bld-money"><span aria-hidden="true">₹</span><input id="${fid(key)}" type="number" inputmode="decimal" min="0" step="any" data-field="${key}" value="${esc(v[key] ?? '')}" placeholder="0" aria-label="${esc(ariaLabel || label)}"></div>`, { key, optional, hint });
function dateField(v, key, label, { min = '', max = '' } = {}) {
  const text = v[key] ? `${M.fmtShort(v[key])} ${M.parseYmd(v[key]).getFullYear()}` : 'Select date';
  return group(label, `<div class="fu-picker ${v[key] ? '' : 'is-empty'}"><span class="fu-picker-text">${esc(text)}</span>${icon('calendar', { size: 16 })}<input id="${fid(key)}" type="date" data-field="${key}" value="${esc(v[key] || '')}" ${min ? `min="${min}"` : ''} ${max ? `max="${max}"` : ''} aria-label="${esc(label)}"></div>`, { key });
}
function timeField(v, key, label, { optional = true } = {}) {
  const text = v[key] ? M.to12h(v[key]) : 'Set time';
  return group(label, `<div class="fu-picker ${v[key] ? '' : 'is-empty'}"><span class="fu-picker-text">${esc(text)}</span>${icon('clock', { size: 16 })}<input id="${fid(key)}" type="time" data-field="${key}" value="${esc(v[key] || '')}" aria-label="${esc(label)}"></div>`, { key, optional });
}
const stepper = (v, key, label, { min = 1, max = 99 } = {}) => group(label, `<div class="bld-count" role="group" aria-label="${esc(label)}">
    <button type="button" data-step="${key}:-1" data-min="${min}" data-max="${max}" aria-label="Fewer: ${esc(label)}" ${Number(v[key]) <= min ? 'disabled' : ''}>${icon('minus', { size: 16, stroke: 2.4 })}</button>
    <output aria-live="polite" data-count="${key}">${esc(v[key])}</output>
    <button type="button" data-step="${key}:1" data-min="${min}" data-max="${max}" aria-label="More: ${esc(label)}" ${Number(v[key]) >= max ? 'disabled' : ''}>${icon('plus', { size: 16, stroke: 2.4 })}</button>
  </div>`);
const selectField = (v, key, label, options) => group(label, `<select id="${fid(key)}" data-select="${key}" aria-label="${esc(label)}">${options.map((o) => `<option value="${esc(o.value ?? o)}" ${(o.value ?? o) === v[key] ? 'selected' : ''}>${esc(o.label ?? o)}</option>`).join('')}</select>`, { key });
const chipsField = (v, key, label, options) => group(label, `<div class="bld-chips" role="radiogroup" aria-label="${esc(label)}">${options.map((o) => `<button type="button" role="radio" aria-checked="${v[key] === o.value}" class="bld-chip ${v[key] === o.value ? 'is-on' : ''}" data-chip="${key}" data-value="${esc(o.value)}">${esc(o.label)}</button>`).join('')}</div>`, { key });
const segField = (v, key, label, options, { numeric = false, stack = false } = {}) => group(label, `<div class="fu-toggle bld-seg ${stack ? 'bld-seg-stack' : ''}" role="radiogroup" aria-label="${esc(label || key)}">${options.map((o) => `<button type="button" role="radio" aria-checked="${String(v[key]) === String(o.value)}" class="${String(v[key]) === String(o.value) ? 'active' : ''}" data-seg="${key}" data-value="${esc(o.value)}" ${numeric ? 'data-numeric' : ''}>${esc(o.label)}</button>`).join('')}</div>`, { key });
const switchField = (v, key, label, text) => group(label, `<button type="button" role="switch" aria-checked="${!!v[key]}" class="bld-switch ${v[key] ? 'is-on' : ''}" data-switch="${key}"><span class="bld-switch-knob"></span><span class="bld-switch-text">${esc(text)}</span></button>`, { key });
const checkField = (v, key, text) => `<label class="bld-check"><input type="checkbox" data-check="${key}" ${v[key] ? 'checked' : ''}><span>${esc(text)}</span></label>`;
const sectionTitle = (t) => `<h4 class="item-dialog-sub">${esc(t)}</h4>`;
const tabs = (v, list) => `<div class="sheet-tabs-nav item-dialog-tabs" role="tablist">${list.map(([key, label]) => `<button type="button" role="tab" aria-selected="${v.tab === key}" class="sheet-tab-btn ${v.tab === key ? 'active' : ''}" data-tab="${key}">${esc(label)}</button>`).join('')}</div>`;

/* ------------------------------------------------------------------------------------------------
   The dialog
   ------------------------------------------------------------------------------------------------ */

/**
 * @param {{ title: string, saveLabel: string, values: object, returnFocus?: () => Element|null,
 *           render: (v: object, ctx: object) => string, validate?: (v: object) => Record<string,string>,
 *           onInput?: (e: Event, ctx: object) => void, onClick?: (e: Event, ctx: object) => void, onChange?: (key: string, ctx: object) => void,
 *           onClose?: () => void, onSave: (v: object) => void }} cfg
 */
function openItemDialog({ title, saveLabel, values, returnFocus, render, validate, onInput, onClick, onChange, afterRender, onClose, onSave }) {
  const v = values; // the form's own object: its render() and handlers read the same state the engine edits
  const snap = () => JSON.stringify(v, (k, val) => (TRANSIENT.has(k) ? undefined : val));
  let initial = snap();

  const dlg = openSheet({
    modal: true,
    label: title,
    cls: 'item-dialog-card',
    returnFocus,
    onClose,
    beforeClose: async () => (snap() === initial
      || confirmDialog({ title: 'Discard this entry?', text: 'What you entered here has not been added yet.', confirm: 'Discard', cancel: 'Keep editing', danger: true })),
    html: `<header class="modal-header item-dialog-head">
        <button type="button" class="dialog-back" data-sheet-close aria-label="Back">${icon('arrowLeft', { size: 20, stroke: 2.2 })}</button>
        <h3 data-dialog-title tabindex="-1">${esc(title)}</h3>
      </header>
      <div class="modal-body item-dialog-body" role="group" aria-label="${esc(title)}"></div>
      <footer class="modal-footer item-dialog-foot">
        <button type="button" class="btn-secondary-desktop" data-sheet-close>Cancel</button>
        <button type="button" class="btn-primary-desktop" data-form-save>${esc(saveLabel)}</button>
      </footer>`,
  });
  const body = dlg.$('.item-dialog-body');

  const ctx = {
    v, dlg, body, $: (s) => body.querySelector(s),
    set(key, value) { v[key] = value; },
    rerender() {
      const y = body.scrollTop;
      const active = document.activeElement;
      const keep = active && body.contains(active) && active.matches('input[data-field], textarea[data-field]') ? { key: active.dataset.field, start: active.selectionStart, end: active.selectionEnd } : null;
      body.innerHTML = render(v, ctx);
      enhanceSelects(body);
      body.scrollTop = y;
      if (keep) {
        const el = body.querySelector(`[data-field="${keep.key}"]`);
        if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(keep.start, keep.end); } catch { /* number inputs have no selection */ } }
      }
      afterRender?.(ctx);
    },
    /** Update one text node / value without redrawing, so typing keeps its place. */
    patch(selector, text) { const el = body.querySelector(selector); if (el) el.textContent = text; },
    patchValue(selector, value) { const el = body.querySelector(selector); if (el) el.value = value; },
    close: () => dlg.close(),
    /** What is on screen now counts as "nothing entered yet" (used once defaults arrive late). */
    baseline() { initial = snap(); },
  };
  ctx.rerender();

  dlg.ov.addEventListener('input', (e) => {
    const el = e.target.closest('[data-field]');
    if (el && el.type !== 'date' && el.type !== 'time') v[el.dataset.field] = el.value;
    onInput?.(e, ctx);
    if (el && el.type !== 'date' && el.type !== 'time') onChange?.(el.dataset.field, ctx, 'input');
  });
  dlg.ov.addEventListener('change', (e) => {
    const field = e.target.closest('[data-field]');
    if (field && (field.type === 'date' || field.type === 'time')) { v[field.dataset.field] = field.value; onChange?.(field.dataset.field, ctx, 'change'); ctx.rerender(); return; }
    const sel = e.target.closest('[data-select]');
    if (sel) { v[sel.dataset.select] = sel.value; onChange?.(sel.dataset.select, ctx, 'change'); return; }
    const check = e.target.closest('[data-check]');
    if (check) { v[check.dataset.check] = check.checked; return; }
    onClick?.(e, ctx); // radios and other controls that report through change
  });
  dlg.ov.addEventListener('click', (e) => {
    const t = (s) => e.target.closest(s);
    let el;
    if ((el = t('[data-chip]'))) { v[el.dataset.chip] = el.dataset.value; onChange?.(el.dataset.chip, ctx, 'click'); ctx.rerender(); return; }
    if ((el = t('[data-seg]'))) { v[el.dataset.seg] = el.hasAttribute('data-numeric') ? Number(el.dataset.value) : el.dataset.value; onChange?.(el.dataset.seg, ctx, 'click'); ctx.rerender(); return; }
    if ((el = t('[data-switch]'))) { v[el.dataset.switch] = !v[el.dataset.switch]; onChange?.(el.dataset.switch, ctx, 'click'); ctx.rerender(); return; }
    if ((el = t('[data-step]'))) {
      const [key, delta] = el.dataset.step.split(':');
      v[key] = Math.min(Number(el.dataset.max), Math.max(Number(el.dataset.min), (Number(v[key]) || 0) + Number(delta)));
      onChange?.(key, ctx, 'click');
      ctx.rerender();
      return;
    }
    if ((el = t('[data-tab]'))) { v.tab = el.dataset.tab; onChange?.('tab', ctx, 'click'); ctx.rerender(); return; }
    if (t('[data-form-save]')) {
      const errors = validate?.(v) || {};
      body.querySelectorAll('[data-error]').forEach((p) => { p.hidden = true; });
      const keys = Object.keys(errors);
      keys.forEach((k) => { const p = body.querySelector(`[data-error="${k}"]`); if (p) { p.textContent = errors[k]; p.hidden = false; } });
      if (keys.length) { body.querySelector(`[data-error="${keys[0]}"]`)?.scrollIntoView({ block: 'center', behavior: 'auto' }); return; }
      dlg.close();
      onSave({ ...v });
      return;
    }
    onClick?.(e, ctx);
  });
  return ctx;
}

/* ------------------------------------------------------------------------------------------------
   Search + manual entry for hotels and activities (Google Places through our own endpoints)
   ------------------------------------------------------------------------------------------------ */

function placeThumb(photo, ico) {
  return `<span class="place-thumb">${photo ? `<img src="${esc(photo)}" alt="" width="44" height="44" loading="lazy">` : icon(ico, { size: 20 })}</span>`;
}
const ratingText = (p) => (p.rating ? `★ ${Number(p.rating).toFixed(1)}` : '');

/** The search side of a "Search | Add manually" dialog: box, recent places, results, and the chosen-place card. */
function placeSearch({ kind, noun, thumbIcon, v, ctx0, getLocation }) {
  const S = { enabled: null, status: 'idle', results: [], message: '', recent: [], loadingId: '' };
  const savedKind = kind === 'hotel' ? 'hotels' : 'activities';
  const searcher = P.createSearcher({ kind, getLocation, onState: (st) => { S.status = st.status; S.results = st.results; S.message = st.message || ''; if (st.status === 'off') S.enabled = false; paint(); } });
  let ctx = ctx0;

  const resultRow = (p, i, from) => `<button type="button" class="place-row" data-pick="${from}:${i}" ${S.loadingId === `${from}:${i}` ? 'aria-busy="true"' : ''}>
      ${placeThumb(p.photo, thumbIcon)}
      <span class="place-text"><b>${esc(p.name)}</b><small>${esc([ratingText(p), p.area ?? [p.city, p.address].filter(Boolean).join(', ')].filter(Boolean).join(' · '))}</small></span>
    </button>`;

  function resultsHtml() {
    if (S.status === 'loading') return '<div class="place-skel" aria-hidden="true"><i></i><i></i><i></i></div><p class="places-note" role="status">Searching…</p>';
    if (S.status === 'error') return `<p class="places-note is-error" role="alert">${esc(S.message)}</p><button type="button" class="bld-link" data-tab="manual">Add manually</button>`;
    if (S.status === 'ok') {
      return S.results.length
        ? `<div class="place-list" role="list">${S.results.map((p, i) => resultRow(p, i, 'r')).join('')}</div><p class="places-attrib">Powered by Google</p>`
        : `<p class="places-note">No ${noun}s found. Try another name, or </p><button type="button" class="bld-link" data-tab="manual">add it manually</button>`;
    }
    if (S.recent.length) return `<p class="places-head">Recently used</p><div class="place-list" role="list">${S.recent.map((p, i) => resultRow(p, i, 'h')).join('')}</div>`;
    return `<p class="places-note">Type at least two letters to search ${noun}s.</p>`;
  }
  function paint() { const box = ctx?.$('[data-results]'); if (box) box.innerHTML = resultsHtml(); }

  return {
    S,
    bind(c) {
      ctx = c;
      P.placesEnabled().then((on) => {
        S.enabled = on;
        if (!on && v.tab === 'search' && !v.touched) v.tab = 'manual';
        ctx.rerender();
      });
      P.loadRecent(savedKind).then((list) => { S.recent = list; paint(); });
    },
    notice() { return S.enabled === false ? `<p class="places-off" role="status">${icon('alertCircle', { size: 16 })}<span>${esc(noun[0].toUpperCase() + noun.slice(1))} search is not set up yet. Add it manually below.</span></p>` : ''; },
    html(placeholder) {
      if (S.enabled === false) return '';
      if (v.picked) {
        const p = v.picked;
        return `<div class="place-card">${placeThumb(p.photo, thumbIcon)}<span class="place-text"><b>${esc(p.name)}</b><small>${esc([ratingText(p), p.address || p.city].filter(Boolean).join(' · '))}</small></span><button type="button" class="bld-link" data-change-place>Change</button></div>${p.fromGoogle ? `<p class="places-attrib">Powered by Google${p.photoCredit ? ` · Photo: ${esc(p.photoCredit)}` : ''}</p>` : ''}`;
      }
      return `<div class="bld-input places-box">${icon('search', { size: 17 })}<input type="search" data-search placeholder="${esc(placeholder)}" maxlength="100" autocomplete="off" aria-label="${esc(placeholder)}" value="${esc(v.q || '')}"></div><div class="places-results" data-results>${resultsHtml()}</div>`;
    },
    onInput(e) { if (e.target.matches('[data-search]')) { v.q = e.target.value; searcher.query(e.target.value); } },
    async onClick(e, apply) {
      const pick = e.target.closest('[data-pick]');
      if (pick) {
        const [from, idx] = pick.dataset.pick.split(':');
        if (from === 'h') { apply({ ...S.recent[Number(idx)], fromGoogle: false }); return true; }
        const row = S.results[Number(idx)];
        S.loadingId = pick.dataset.pick; paint();
        try { apply({ ...(await searcher.pick(row.placeId)), fromGoogle: true }); }
        catch (err) { S.loadingId = ''; S.status = 'error'; S.message = err.message; paint(); }
        return true;
      }
      if (e.target.closest('[data-change-place]')) { v.picked = null; v.q = ''; S.status = 'idle'; S.results = []; ctx.rerender(); return true; }
      return false;
    },
    cancel: () => searcher.cancel(),
  };
}

/* ------------------------------------------------------------------------------------------------
   Hotel stay
   ------------------------------------------------------------------------------------------------ */

export function hotelForm({ model, i, existing, returnFocus, onSave }) {
  const day = model.days[i];
  const checkIn = day.iso || '';
  const here = M.locationAfter(model, i);
  const stay = existing || {};
  const v = {
    tab: 'search', picked: null, q: '', saveForLater: false, touched: !!existing,
    name: '', city: here, address: '', phone: '', placeId: '',
    checkIn, checkOut: checkIn ? M.addDaysIso(checkIn, 1) : '', checkInTime: '', checkOutTime: '',
    rooms: 1, roomType: 'Standard', plan: 'bb', planOther: '', price: '', inclusion: 'included', notes: '',
    ...stay,
  };
  if (existing) v.tab = 'manual';
  v.price = stay.price ?? '';
  v.checkIn = stay.checkIn || checkIn;
  v.checkOut = stay.checkOut || (checkIn ? M.addDaysIso(checkIn, 1) : '');

  const nights = () => (v.checkIn && v.checkOut ? Math.max(1, M.daysBetween(v.checkIn, v.checkOut)) : 1);
  const totalLine = () => {
    const price = num(v.price);
    return price === null ? 'Add a price to see the total.' : `${rupee(price * (Number(v.rooms) || 1) * nights())} · ${Number(v.rooms) || 1} room${Number(v.rooms) === 1 ? '' : 's'} × ${nights()} night${nights() === 1 ? '' : 's'}`;
  };
  const nightsHint = () => (v.checkIn && v.checkOut ? (v.checkOut > v.checkIn ? `${nights()} night${nights() === 1 ? '' : 's'}` : 'Check-out is before check-in, so one night is used.') : '');

  const search = placeSearch({ kind: 'hotel', noun: 'hotel', thumbIcon: 'bed', v, getLocation: () => here });

  const details = () => `${sectionTitle('Stay details')}
    <div class="fu-row">${dateField(v, 'checkIn', 'Check-in date')}${timeField(v, 'checkInTime', 'Check-in time')}</div>
    <div class="fu-row">${dateField(v, 'checkOut', 'Check-out date', { min: v.checkIn })}${timeField(v, 'checkOutTime', 'Check-out time')}</div>
    <p class="bld-hint bld-nights" data-nights>${esc(nightsHint())}</p>
    <div class="fu-row">${stepper(v, 'rooms', 'Rooms', { min: 1, max: 20 })}${selectField(v, 'roomType', 'Room type', ROOM_TYPE_OPTIONS)}</div>
    ${chipsField(v, 'plan', 'Meal plan', M.MEAL_PLANS.map((p) => ({ value: p.key, label: p.label })))}
    ${v.plan === 'other' ? textField(v, 'planOther', 'Meal plan details', { max: 40 }) : ''}
    ${moneyField(v, 'price', 'Price per room per night', { optional: true, hint: esc(totalLine()), ariaLabel: 'Price per room per night in rupees' })}
    ${segField(v, 'inclusion', 'Cost', INCLUSION)}
    ${areaField(v, 'notes', 'Notes', { max: 300 })}`;

  const manual = () => `${textField(v, 'name', 'Hotel name', { ph: 'Hotel name', max: 120 })}
    ${textField(v, 'city', 'City', { ph: 'City', max: 80, optional: true })}
    ${textField(v, 'address', 'Address', { ph: 'Address', max: 200, optional: true })}
    ${textField(v, 'phone', 'Phone', { ph: 'Hotel phone', max: 30, type: 'tel', optional: true })}
    ${checkField(v, 'saveForLater', 'Save this hotel for next time')}`;

  const apply = (p) => {
    Object.assign(v, { picked: p, name: p.name, city: p.city || v.city, address: p.address || '', phone: p.phone || '', placeId: p.placeId || '', touched: true });
    dlg.rerender();
  };

  const dlg = openItemDialog({
    title: existing ? 'Edit Hotel Stay' : 'Add Hotel Stay',
    saveLabel: existing ? 'Save changes' : `Add to Day ${i + 1}`,
    values: v,
    returnFocus,
    onClose: () => search.cancel(),
    render: () => `${search.notice()}${tabs(v, [['search', 'Search'], ['manual', 'Add manually']])}
      ${v.tab === 'search' ? search.html(`Search hotels in ${here || 'this area'}`) : manual()}
      ${v.tab === 'manual' || v.picked ? details() : ''}`,
    onInput: (e, ctx) => { search.onInput(e); if (e.target.matches('[data-field="name"],[data-field="city"]')) v.touched = true; if (e.target.matches('[data-field="price"]')) { ctx.patch('[data-hint="price"]', totalLine()); } },
    onChange: (key, ctx, how) => {
      if (key === 'rooms') return;
      if (key === 'checkIn' && how === 'change' && v.checkOut && v.checkOut <= v.checkIn) v.checkOut = M.addDaysIso(v.checkIn, 1);
      if (key === 'tab') v.touched = true;
    },
    onClick: (e, ctx) => { search.onClick(e, apply); },
    validate: (val) => {
      if (val.tab === 'search' && !val.picked) return { name: 'Choose a hotel from the results, or add it manually.' };
      return String(val.name || '').trim() ? {} : { name: 'Hotel name is required.' };
    },
    onSave: (val) => {
      const rooms = Number(val.rooms) || 1;
      const n = nights();
      const price = num(val.price);
      const placeId = val.picked && val.picked.name === val.name ? val.picked.placeId || '' : '';
      const place = { placeId: placeId || null, name: val.name.trim(), city: (val.city || '').trim() || null, address: (val.address || '').trim() || null, phone: (val.phone || '').trim() || null };
      if (placeId || val.saveForLater) P.saveRecent('hotels', place);
      const { tab, picked, q, saveForLater, touched, ...clean } = val;
      onSave({ ...clean, id: stay.id || M.newId('h'), name: place.name, placeId, rooms, price, currency: 'INR', totalPrice: price === null ? null : round2(price * rooms * n) }, n);
    },
  });
  search.bind(dlg);
  return dlg;
}

/* ------------------------------------------------------------------------------------------------
   Activity
   ------------------------------------------------------------------------------------------------ */

export function activityForm({ model, i, existing, returnFocus, onSave }) {
  const day = model.days[i];
  const here = M.locationAfter(model, i);
  const a = existing || {};
  const v = {
    tab: 'search', picked: null, q: '', saveForLater: false, touched: !!existing,
    title: '', place: here, meetingPoint: '', placeId: '', date: day.iso || '', time: '', duration: '', tickets: 1, price: '', inclusion: 'included', notes: '',
    ...a,
  };
  if (existing) v.tab = 'manual';
  v.price = a.price ?? '';
  v.date = a.date || day.iso || '';
  v.tickets = Number(a.tickets) || 1;

  const totalLine = () => {
    const price = num(v.price);
    return price === null ? 'Add a price to see the total.' : `${rupee(price * (Number(v.tickets) || 1))} · ${Number(v.tickets) || 1} guest${Number(v.tickets) === 1 ? '' : 's'} × ${rupee(price)}`;
  };
  const search = placeSearch({ kind: 'activity', noun: 'activity', thumbIcon: 'camera', v, getLocation: () => here });

  const details = () => `${sectionTitle('Activity details')}
    ${dateField(v, 'date', 'Date', { min: model.meta.start || '', max: model.meta.end || '' })}
    <div class="fu-row">${timeField(v, 'time', 'Start time')}${textField(v, 'duration', 'Duration', { ph: 'e.g. 3 hrs', max: 30, optional: true })}</div>
    ${stepper(v, 'tickets', 'Guests / tickets', { min: 1, max: 99 })}
    ${moneyField(v, 'price', 'Price per person', { optional: true, hint: esc(totalLine()), ariaLabel: 'Price per person in rupees' })}
    ${segField(v, 'inclusion', 'Cost', INCLUSION)}
    ${areaField(v, 'notes', 'Notes', { max: 300 })}`;

  const manual = () => `${textField(v, 'title', 'Activity name', { ph: 'Activity name', max: 120 })}
    ${textField(v, 'place', 'Place', { ph: 'Place', max: 100, optional: true })}
    ${textField(v, 'meetingPoint', 'Meeting point', { ph: 'Where guests meet', max: 160, optional: true })}
    ${checkField(v, 'saveForLater', 'Save this activity for next time')}`;

  const apply = (p) => {
    Object.assign(v, { picked: p, title: p.name, place: p.city || p.address || v.place, placeId: p.placeId || '', meetingPoint: p.meetingPoint || v.meetingPoint, touched: true });
    dlg.rerender();
  };

  const dlg = openItemDialog({
    title: existing ? 'Edit Activity' : 'Add Activity',
    saveLabel: existing ? 'Save changes' : `Add to Day ${i + 1}`,
    values: v,
    returnFocus,
    onClose: () => search.cancel(),
    render: () => `${search.notice()}${tabs(v, [['search', 'Search'], ['manual', 'Add manually']])}
      ${v.tab === 'search' ? search.html(`Search activities in ${here || 'this area'}`) : manual()}
      ${v.tab === 'manual' || v.picked ? details() : ''}`,
    onInput: (e, ctx) => { search.onInput(e); if (e.target.matches('[data-field="title"],[data-field="place"]')) v.touched = true; if (e.target.matches('[data-field="price"]')) ctx.patch('[data-hint="price"]', totalLine()); },
    onChange: (key) => { if (key === 'tab') v.touched = true; },
    onClick: (e) => { search.onClick(e, apply); },
    validate: (val) => {
      if (val.tab === 'search' && !val.picked) return { title: 'Choose an activity from the results, or add it manually.' };
      return String(val.title || '').trim() ? {} : { title: 'Activity name is required.' };
    },
    onSave: (val) => {
      const guests = Number(val.tickets) || 1;
      const price = num(val.price);
      const placeId = val.picked && val.picked.name === val.title ? val.picked.placeId || '' : '';
      const place = { placeId: placeId || null, name: val.title.trim(), city: (val.place || '').trim() || null, address: val.picked?.address || null, phone: val.picked?.phone || null, meetingPoint: (val.meetingPoint || '').trim() || null };
      if (placeId || val.saveForLater) P.saveRecent('activities', place);
      const { tab, picked, q, saveForLater, touched, ...clean } = val;
      onSave({ ...clean, id: a.id || M.newId('a'), title: place.name, placeId, tickets: guests, price, currency: 'INR', totalPrice: price === null ? null : round2(price * guests), durationMin: M.durationToMinutes(val.duration) });
    },
  });
  search.bind(dlg);
  return dlg;
}

/* ------------------------------------------------------------------------------------------------
   Transport ("Travelling")
   ------------------------------------------------------------------------------------------------ */

const vehicleSub = (x) => [x.seats ? `${x.seats} seats` : '', x.category === 'public' ? '' : (x.ac ? 'AC' : 'Non-AC')].filter(Boolean).join(' · ') || (x.category === 'public' ? 'Tickets' : '');
const modeOf = (x) => (x.category === 'boat' ? 'Boat' : x.icon === 'train' ? 'Train' : x.icon === 'plane' ? 'Flight' : x.icon === 'bus' ? 'Bus' : 'Cab');

export function transportForm({ model, i, existing, returnFocus, assigneeFor, onSave }) {
  const day = model.days[i];
  const from = M.locationBefore(model, i);
  const choices = M.placeChoices(model, i);
  const t = existing || {};
  const transit = day.locationMode === 'transit' && !!day.to;
  const v = {
    arrangedBy: 'package', plusDay: 0, dep: '', arr: '', driver: '', driverPhone: '', vehicleNumber: '', pickupTime: '', pickupPoint: '', notes: '', vehicle: '',
    ...t,
    moveMode: transit ? 'transit' : 'same',
    dest: transit ? day.to : (choices[0] || ''),
    moveTouched: false, dropTouched: !!existing,
    drop: existing ? (t.to ?? '') : (transit ? day.to : from),
    vehicleKey: t.vehicleKey || '', vehicleTypeId: t.vehicleTypeId ?? null,
    rate: t.price ?? '', baseRate: t.basePrice ?? null, rateOverridden: !!t.priceOverridden,
    days: Number(t.days) || 1, totalPrice: t.totalPrice ?? '',
    assigned: t.assigned ?? assigneeFor?.(t.id) ?? null, assignedStaffId: t.assignedStaffId ?? null,
    editRate: null, showMore: false, tab: '',
  };
  let vehicles = null; // null while loading, [] when the list cannot be loaded
  const recalc = () => { const r = num(v.rate); v.totalPrice = r === null ? '' : String(round2(r * (Number(v.days) || 1))); };
  const dropFor = () => (v.moveMode === 'transit' ? v.dest : from);
  const selected = () => vehicles?.find((x) => x.key === v.vehicleKey) || null;
  if (!existing) v.totalPrice = '';

  function choose(x) {
    v.vehicleKey = x.key; v.vehicleTypeId = x.id; v.vehicle = x.name;
    v.baseRate = x.baseRate; v.rate = x.baseRate ?? ''; v.rateOverridden = false; v.editRate = null;
    v.arrangedBy = x.category === 'public' ? 'customer' : 'package';
    if (x.rank > 3) v.showMore = true;
    recalc();
  }

  const priceCell = (x, on) => {
    if (x.baseRate === null || x.baseRate === undefined) return '<span class="veh-muted">Customer arranges</span>';
    if (v.editRate === x.key) return `<span class="bld-money veh-edit"><span aria-hidden="true">₹</span><input type="number" inputmode="decimal" min="0" step="any" data-rate-input value="${esc(v.rate)}" aria-label="Daily price for ${esc(x.name)}"></span>`;
    const shown = on ? num(v.rate) ?? x.baseRate : x.baseRate;
    const edited = on && v.rateOverridden;
    return `<span class="veh-amt"><span><b>${rupee(shown)}</b><small>/day</small></span>${edited ? '<em class="veh-edited">edited</em>' : ''}</span><button type="button" class="veh-pencil" data-edit-rate="${x.key}" aria-label="Edit price for ${esc(x.name)}">${icon('edit', { size: 14 })}</button>`;
  };
  const vehicleRow = (x) => {
    const on = v.vehicleKey === x.key;
    return `<label class="veh-row ${on ? 'is-on' : ''}"><input class="veh-input" type="radio" name="vehicle" value="${esc(x.key)}" data-vehicle="${esc(x.key)}" ${on ? 'checked' : ''}>
      <span class="bld-radio" aria-hidden="true"></span><span class="bld-ico veh-ico">${icon(x.icon, { size: 20 })}</span>
      <span class="veh-text">${x.rank === 1 ? '<span class="veh-tag">Most popular</span>' : ''}<b>${esc(x.name)}</b><small>${esc(vehicleSub(x))}</small></span>
      <span class="veh-price">${priceCell(x, on)}</span></label>`;
  };
  const vehicleList = () => {
    if (vehicles === null) return '<p class="places-note" role="status">Loading vehicles…</p>';
    if (!vehicles.length) return textField(v, 'vehicle', 'Vehicle', { ph: 'e.g. Innova Crysta', max: 80, optional: true, hint: 'The vehicle list could not be loaded, so type the vehicle instead.' });
    const top = vehicles.filter((x) => x.rank <= 3);
    const more = vehicles.filter((x) => x.rank > 3);
    const open = v.showMore || more.some((x) => x.key === v.vehicleKey);
    return `<div class="veh-list" role="radiogroup" aria-label="Vehicle">${top.map(vehicleRow).join('')}${open ? more.map(vehicleRow).join('') : ''}</div>
      ${more.length && !open ? `<button type="button" class="btn-secondary-desktop veh-more" data-show-more>Show more options</button>` : ''}`;
  };

  const totalHint = () => {
    const r = num(v.rate);
    return r === null ? 'Add a daily price, or type the total.' : `${rupee(r)} × ${Number(v.days) || 1} day${Number(v.days) === 1 ? '' : 's'}`;
  };
  const dest = () => (choices.length
    ? selectField(v, 'dest', 'Going to', choices.includes(v.dest) || !v.dest ? choices : [...choices, v.dest])
    : textField(v, 'dest', 'Going to', { ph: 'Place name', max: 80 }));
  const assignedLine = () => (v.assigned?.name
    ? `<span class="assign-who"><span class="row-avatar assign-avatar">${esc(initials(v.assigned.name))}</span><span class="assign-name">${esc(v.assigned.name)}</span></span>`
    : '<span class="assign-who assign-none">Not assigned</span>');

  const dlg = openItemDialog({
    title: 'Travelling',
    saveLabel: existing ? 'Save changes' : `Add to Day ${i + 1}`,
    values: v,
    returnFocus,
    render: () => `
      <div class="fu-row">${timeField(v, 'dep', 'Departs')}${timeField(v, 'arr', 'Arrives')}</div>
      ${segField(v, 'plusDay', 'Arrives on', [{ value: 0, label: 'Same day' }, { value: 1, label: '+1 day' }], { numeric: true })}
      ${segField(v, 'moveMode', '', [{ value: 'same', label: 'Travelling in the same location' }, { value: 'transit', label: 'Transit to other place' }], { stack: true })}
      ${v.moveMode === 'transit' ? dest() : ''}
      ${sectionTitle('Vehicle')}
      ${vehicleList()}
      ${sectionTitle('Trip details')}
      ${stepper(v, 'days', 'Number of days', { min: 1, max: 60 })}
      ${moneyField(v, 'totalPrice', 'Total', { optional: true, hint: esc(totalHint()), ariaLabel: 'Total price in rupees' })}
      <div class="fu-row">${timeField(v, 'pickupTime', 'Pickup time')}${textField(v, 'pickupPoint', 'Pickup point', { ph: 'Where to pick up', max: 120, optional: true })}</div>
      ${textField(v, 'drop', 'Drop point', { ph: 'Where to drop', max: 120, optional: true })}
      ${textField(v, 'driver', 'Driver name', { max: 80, optional: true })}
      <div class="fu-row">${textField(v, 'driverPhone', 'Driver phone', { max: 30, type: 'tel', optional: true })}${textField(v, 'vehicleNumber', 'Vehicle number', { max: 20, optional: true, ph: 'e.g. UK 07 AB 1234' })}</div>
      ${segField(v, 'arrangedBy', 'Who arranges and pays?', [{ value: 'package', label: 'Included in package' }, { value: 'customer', label: 'Customer arranges (not included)' }], { stack: true })}
      ${group('Assign to', `<div class="assign-field">${assignedLine()}<button type="button" class="btn-secondary-desktop btn-compact" data-assign>${v.assigned?.name ? 'Change' : 'Assign'}</button>${v.assigned?.name ? `<button type="button" class="bld-link" data-unassign>Remove</button>` : ''}</div>`, { optional: true })}
      ${areaField(v, 'notes', 'Notes', { max: 300 })}`,
    onInput: (e, ctx) => {
      if (e.target.matches('[data-rate-input]')) {
        v.rate = e.target.value;
        v.rateOverridden = num(v.rate) !== (v.baseRate ?? null);
        recalc();
        ctx.patchValue('[data-field="totalPrice"]', v.totalPrice);
        ctx.patch('[data-hint="totalPrice"]', totalHint());
      }
      if (e.target.matches('[data-field="drop"]')) v.dropTouched = true;
    },
    onChange: (key, ctx, how) => {
      if (key === 'moveMode' || key === 'dest') { v.moveTouched = true; if (!v.dropTouched) v.drop = dropFor(); }
      if (key === 'moveMode' && v.moveMode === 'transit' && !v.dest) v.dest = choices[0] || '';
      if (key === 'days') recalc();
      if (key === 'totalPrice') ctx.patch('[data-hint="totalPrice"]', 'Total set by hand.');
    },
    onClick: (e, ctx) => {
      const radio = e.target.closest('[data-vehicle]');
      if (radio && vehicles) { const x = vehicles.find((y) => y.key === radio.dataset.vehicle); if (x && x.key !== v.vehicleKey) { choose(x); ctx.rerender(); } return; }
      if (e.target.closest('[data-show-more]')) { v.showMore = true; ctx.rerender(); return; }
      const pencil = e.target.closest('[data-edit-rate]');
      if (pencil) {
        e.preventDefault();
        const x = vehicles?.find((y) => y.key === pencil.dataset.editRate);
        if (x && x.key !== v.vehicleKey) choose(x);
        v.editRate = pencil.dataset.editRate;
        ctx.rerender();
        ctx.$('[data-rate-input]')?.focus({ preventScroll: true }); // the user tapped the pencil, so the keyboard may open
        return;
      }
      if (e.target.matches('[data-rate-input]') && e.type === 'change') { v.editRate = null; ctx.rerender(); return; }
      if (e.target.closest('[data-unassign]')) { v.assigned = null; v.assignedStaffId = null; ctx.rerender(); return; }
      if (e.target.closest('[data-assign]')) {
        const title = v.vehicle || 'Transport';
        openAssign({
          kind: 'itinerary',
          items: [{ id: existing?.id || 'new-transport', title, name: title }],
          summary: { title, subtitle: `Day ${i + 1}`, badge: 'Transport', iconHtml: icon('bus', { size: 22 }) },
          onApply: (who) => { v.assigned = { isAssigned: true, name: who.name, avatar: who.avatar }; v.assignedStaffId = who.id || null; ctx.rerender(); },
          persist: async () => true, // saved with the itinerary, not on its own
        });
      }
    },
    validate: () => ({}),
    onSave: (val) => {
      const sel = selected();
      const to = val.moveMode === 'transit' ? (val.dest || '').trim() : from;
      const days = Number(val.days) || 1;
      const price = num(val.rate);
      const total = num(val.totalPrice);
      const {
        tab, editRate, showMore, moveTouched, dropTouched, moveMode, dest: destination, drop, rate, baseRate, rateOverridden, ...clean
      } = val;
      const item = {
        ...clean,
        id: t.id || M.newId('t'),
        mode: sel ? modeOf(sel) : (t.mode || 'Cab'),
        from, to: (drop || '').trim() || to,
        title: to && to !== from ? `${from || 'Start'} to ${to}` : `${from || 'Local'} local transport`,
        vehicle: sel ? sel.name : (val.vehicle || ''),
        price, basePrice: sel ? sel.baseRate : (baseRate ?? null), priceOverridden: !!rateOverridden && price !== null, days, currency: 'INR',
        totalPrice: total, plusDay: Number(val.plusDay) || 0,
      };
      onSave(item, v.moveTouched ? { locationMode: val.moveMode === 'transit' && to ? 'transit' : 'same', to: val.moveMode === 'transit' ? to : '' } : null);
    },
  });
  // The rate box closes on Enter, or shortly after it loses focus (unless focus moved to another rate box).
  dlg.dlg.ov.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-rate-input]')) { e.preventDefault(); e.target.blur(); } });
  dlg.dlg.ov.addEventListener('focusout', (e) => {
    if (!e.target.matches('[data-rate-input]')) return;
    setTimeout(() => { if (v.editRate && !document.activeElement?.matches('[data-rate-input]')) { v.editRate = null; dlg.rerender(); } }, 180);
  });

  P.loadVehicles().then((list) => {
    vehicles = list;
    if (existing && !v.vehicleKey && v.vehicle) { const hit = list.find((x) => x.name.toLowerCase() === String(v.vehicle).toLowerCase()); if (hit) { v.vehicleKey = hit.key; v.vehicleTypeId = hit.id; if (v.baseRate === null) v.baseRate = hit.baseRate; } }
    if (!existing && list.length) choose(list[0]); // the most popular option starts selected
    dlg.baseline();
    dlg.rerender();
  });
  return dlg;
}

/* ------------------------------------------------------------------------------------------------
   Meals and notes (same dialog, their current fields)
   ------------------------------------------------------------------------------------------------ */

export function mealForm({ model, i, existing, returnFocus, onSave }) {
  const m = existing || {};
  const v = { kind: 'Lunch', time: '', atHotel: false, place: '', diet: '', inclusion: 'included', ...m };
  return openItemDialog({
    title: existing ? 'Edit Meal' : 'Add Meal',
    saveLabel: existing ? 'Save changes' : `Add to Day ${i + 1}`,
    values: v,
    returnFocus,
    render: () => `${chipsField(v, 'kind', 'Meal', M.MEAL_KINDS.map((k) => ({ value: k, label: k })))}
      ${timeField(v, 'time', 'Time')}
      ${switchField(v, 'atHotel', 'Where', 'At the hotel')}
      ${v.atHotel ? '' : textField(v, 'place', 'Restaurant', { max: 100, optional: true })}
      ${textField(v, 'diet', 'Dietary notes', { max: 100, optional: true })}
      ${segField(v, 'inclusion', 'Cost', INCLUSION)}`,
    onSave: (val) => onSave({ ...val, id: m.id || M.newId('m') }),
  });
}

export function noteForm({ model, i, existing, returnFocus, onSave }) {
  const n = existing || {};
  const v = { text: '', visible: true, ...n };
  return openItemDialog({
    title: existing ? 'Edit Note' : 'Add Note',
    saveLabel: existing ? 'Save changes' : `Add to Day ${i + 1}`,
    values: v,
    returnFocus,
    render: () => `${areaField(v, 'text', 'Note', { ph: 'Write a note for this day', max: 500, optional: false }).replace('rows="3"', 'rows="5"')}
      ${switchField(v, 'visible', 'Who can see it', 'Visible to customer (off = staff only)')}`,
    validate: (val) => (String(val.text || '').trim() ? {} : { text: 'Note is required.' }),
    onSave: (val) => onSave({ ...val, id: n.id || M.newId('n') }),
  });
}

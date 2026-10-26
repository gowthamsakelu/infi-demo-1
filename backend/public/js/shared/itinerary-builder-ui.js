// Itinerary Builder: one dialog (PC) / bottom sheet (phone) for Bookings and Inquiries.
// Step 1 sets the route and dates, step 2 builds each day. "Done" saves everything and the Day-wise Schedule shows it.
import { icon } from './icons.js';
import { esc, toast, openRowMenu } from './ui.js';
import { openSheet, confirmDialog } from './sheet.js';
import { kindOf, daysOf, markSaved, snapshot, saveItinerary } from './itinerary.js';
import * as M from './itinerary-builder.js';
import { hotelForm, transportForm, activityForm, mealForm, noteForm } from './itinerary-forms.js';

const DRAFT_PREFIX = 'ruyi.itinerary-draft.';
const draftKey = (b) => `${DRAFT_PREFIX}${kindOf(b)}.${b.id}`;
const readDraft = (b) => { try { return JSON.parse(localStorage.getItem(draftKey(b)) || 'null'); } catch { return null; } };
const writeDraft = (b, v) => { try { localStorage.setItem(draftKey(b), JSON.stringify(v)); } catch { /* storage can be unavailable */ } };
const clearDraft = (b) => { try { localStorage.removeItem(draftKey(b)); } catch { /* ignore */ } };

const SECTION_ICON = { hotel: 'bed', transport: 'bus', activity: 'camera', meal: 'utensils', note: 'note', legacy: 'clock', pin: 'pin' };
const rupee = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const withTotal = (parts, total) => [...parts, total ? rupee(total) : ''].filter(Boolean).join(' · ');
const SECTION_TILE = { hotel: 'bed', transport: 'bus', activity: 'camera', meal: 'restaurant', note: 'note', legacy: 'camera', pin: 'bed' };

/* ------------------------------------------------------------------------------------------------
   The builder
   ------------------------------------------------------------------------------------------------ */

async function fetchSaved(b) {
  try {
    const res = await fetch(`/api/${kindOf(b)}/${encodeURIComponent(b.id)}/itinerary`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const j = await res.json();
    return { meta: j.meta };
  } catch { return null; }
}

/**
 * @param {object} b  booking or inquiry (as the list views hold it)
 * @param {{ day?: number|null, step?: 1|2|null, onChange: () => void }} opts  day = day index to open (0-based)
 */
export async function openItineraryBuilder(b, { day = null, step = null, onChange }) {
  const saved = await fetchSaved(b);
  let model = M.createModel(b, saved);
  const baseSig = M.signature(model);
  const draft = readDraft(b);
  if (draft && draft.base === baseSig && draft.model) model = draft.model;

  const hasSaved = daysOf(b).length > 0;
  let current = step || (hasSaved ? 2 : 1);
  let openDay = Math.min(day ?? 0, Math.max(0, model.days.length - 1));
  let draftTimer = null;
  let savedLabelTimer = null;

  const isDirty = () => M.signature(model) !== baseSig;
  const subtitle = () => {
    const range = model.meta.start && model.meta.end ? M.fmtRange(model.meta.start, model.meta.end) : (b.dates || '');
    return `${b.title} · ${range} · ${b.pax} pax`;
  };

  const dlg = openSheet({
    label: 'Add itinerary',
    cls: 'bld-sheet',
    returnFocus: () => document.querySelector('#desktop-add-event-btn, #mobile-add-event-btn'),
    beforeClose: async () => {
      if (!isDirty()) { clearDraft(b); return true; }
      const ok = await confirmDialog({ title: 'Discard changes?', text: 'Your itinerary changes have not been saved.', confirm: 'Discard', cancel: 'Keep editing', danger: true });
      if (ok) clearDraft(b);
      return ok;
    },
    html: `<header class="asg-header bld-header">
        <div class="bld-title"><h3>Add Itinerary</h3><p class="bld-sub" id="bld-sub"></p></div>
        <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>
      <ol class="bld-stepper" id="bld-stepper" aria-label="Steps"></ol>
      <div class="bld-body" id="bld-body"></div>
      <footer class="fu-footer itin-footer bld-footer">
        <button type="button" class="btn-cancel-assign" id="bld-back" data-bld="back"></button>
        <span class="bld-draft" id="bld-draft" aria-live="polite"></span>
        <button type="button" class="btn-primary-desktop" id="bld-next" data-bld="next"></button>
      </footer>`,
  });
  const $ = dlg.$;
  const bodyEl = $('#bld-body');

  /* ---------- drafts ---------- */
  function touch() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      if (!isDirty()) return;
      writeDraft(b, { base: baseSig, model });
      const el = $('#bld-draft');
      if (!el) return;
      el.textContent = 'Draft saved';
      clearTimeout(savedLabelTimer);
      savedLabelTimer = setTimeout(() => { el.textContent = ''; }, 1800);
    }, 300);
  }

  /* ---------- rendering ---------- */
  function renderChrome() {
    $('#bld-sub').textContent = subtitle();
    $('#bld-stepper').innerHTML = [['Route & Dates', 1], ['Itinerary', 2]].map(([label, n]) => `
      <li class="bld-step-item ${current === n ? 'is-current' : ''} ${current > n ? 'is-done' : ''}" ${current === n ? 'aria-current="step"' : ''}>
        <span class="bld-step-dot">${current > n ? icon('check', { size: 14, stroke: 3 }) : n}</span><span class="bld-step-label">${label}</span>
      </li>`).join('<li class="bld-step-line" aria-hidden="true"></li>');
    const back = $('#bld-back');
    back.textContent = current === 1 ? 'Cancel' : 'Back';
    if (current === 1) back.setAttribute('data-sheet-close', ''); else back.removeAttribute('data-sheet-close');
    $('#bld-next').innerHTML = current === 1 ? `Next: Itinerary ${icon('arrowLeft', { size: 16, stroke: 2.4, cls: 'bld-arrow-r' })}` : 'Done';
  }

  const picker = (key, label, value, min) => `
    <div class="fu-field"><label for="bld-${key}">${label}</label>
      <div class="fu-picker ${value ? '' : 'is-empty'}"><span class="fu-picker-text" data-picker-text="${key}">${value ? esc(M.fmtShort(value) + ' ' + M.parseYmd(value).getFullYear()) : 'Select date'}</span>${icon('calendar', { size: 16 })}
        <input id="bld-${key}" type="date" data-meta="${key}" value="${value}" ${min ? `min="${min}"` : ''} aria-label="${label}"></div></div>`;

  function step1Html() {
    const m = model.meta;
    const days = M.dayCount(m);
    const place = (key, label, ph) => `
      <div class="fu-field"><label for="bld-${key}">${label}</label>
        <div class="bld-input">${icon('pin', { size: 17 })}<input id="bld-${key}" type="text" data-meta="${key}" value="${esc(m[key])}" placeholder="${ph}" maxlength="120" autocomplete="off">
          <button type="button" class="bld-clear" data-clear="${key}" aria-label="Clear ${label}" ${m[key] ? '' : 'hidden'}>${icon('close', { size: 14, stroke: 2.5 })}</button></div></div>`;
    return `
      <section class="bld-step" aria-labelledby="bld-h1">
        <h4 class="bld-h" id="bld-h1">Where is the trip going?</h4>
        <p class="bld-help">Set the route and dates first.</p>
        ${place('origin', 'Trip starts from', 'City or state')}
        ${place('destination', 'Trip ends at', 'City or state')}
        <div class="fu-field"><label>Stops along the way<span class="bld-optional"> (optional)</span></label>
          <div class="bld-chips bld-stops" id="bld-stops">
            ${m.stops.map((s, k) => `<span class="bld-chip bld-chip-stop">${esc(s)}<button type="button" data-stop-remove="${k}" aria-label="Remove ${esc(s)}">${icon('close', { size: 12, stroke: 2.5 })}</button></span>`).join('')}
            <button type="button" class="bld-chip bld-chip-add" data-stop-add>${icon('plus', { size: 14, stroke: 2.5 })}Add stop</button>
          </div>
          <div class="bld-input bld-stop-input" id="bld-stop-input" hidden>${icon('pin', { size: 17 })}<input id="bld-stop-text" type="text" maxlength="80" placeholder="Stop name" autocomplete="off"><button type="button" class="bld-stop-ok" data-stop-save>Add</button></div>
        </div>
        <div class="fu-row">${picker('start', 'Start date', m.start)}${picker('end', 'End date', m.end, m.start)}</div>
        <p class="fu-error" id="bld-date-error" role="alert" hidden>End date must not be before the start date.</p>
        <div class="bld-summary" id="bld-summary">${icon('calendar', { size: 18 })}<span>${days ? `${days} day${days === 1 ? '' : 's'} · ${days - 1} night${days - 1 === 1 ? '' : 's'}` : 'Choose the trip dates'}</span></div>
      </section>`;
  }

  const rows = {
    hotel: (s, run) => ({ id: s.id, title: s.name, sub: withTotal([s.city, `${run?.nights || 1} night${(run?.nights || 1) === 1 ? '' : 's'} · ${M.planLabel(s)}`], s.price != null ? s.price * (Number(s.rooms) || 1) * (run?.nights || 1) : null) }),
    transport: (t) => ({ id: t.id, title: t.title || `${t.from || 'Start'} to ${t.to || 'Destination'}`, sub: withTotal([t.vehicle || t.mode, t.dep ? M.to12h(t.dep) : ''], t.arrangedBy === 'customer' ? null : t.totalPrice), notIncluded: t.arrangedBy === 'customer' }),
    activity: (a) => ({ id: a.id, title: a.title, sub: withTotal([a.time ? M.to12h(a.time) : '', a.place, a.duration], a.totalPrice), notIncluded: a.inclusion === 'paid_extra', pillText: 'Paid extra' }),
    meal: (m) => ({ id: m.id, title: `${m.kind}${m.atHotel ? ' at hotel' : m.place ? `: ${m.place}` : ''}`, sub: [m.time ? M.to12h(m.time) : '', m.diet].filter(Boolean).join(' · '), notIncluded: m.inclusion === 'paid_extra', pillText: 'Paid extra' }),
    note: (n) => ({ id: n.id, title: n.text, sub: n.visible === false ? 'Staff only' : 'Visible to customer', lock: n.visible === false }),
    legacy: (x) => ({ id: x.id, title: x.title, sub: x.subtitle || '', notIncluded: x.inclusion === 'not_included' }),
  };

  function rowHtml(section, r, { edit = true } = {}) {
    const pill = r.notIncluded ? `<span class="pill-not-included">${r.pillText || 'Not included'}</span>` : '';
    const lock = r.lock ? `<span class="pill-staff-only">${icon('lock', { size: 11, stroke: 2.4 })}Staff only</span>` : '';
    return `<div class="bld-row" data-row="${section}:${esc(r.id)}">
      <span class="bld-ico item-icon-box item-icon-${SECTION_TILE[section]}">${icon(SECTION_ICON[section], { size: 18 })}</span>
      <span class="bld-row-text"><span class="bld-row-title">${esc(r.title)}</span>${r.sub ? `<span class="bld-row-sub">${esc(r.sub)}</span>` : ''}</span>
      ${pill}${lock}
      ${edit ? `<button type="button" class="bld-link" data-edit="${section}:${esc(r.id)}">${icon('edit', { size: 14 })}Edit</button>` : ''}
      <button type="button" class="bld-kebab" data-kebab="${section}:${esc(r.id)}" aria-label="More options for ${esc(r.title)}" aria-haspopup="menu">${icon('more', { size: 16 })}</button>
    </div>`;
  }

  const sectionHead = (key, label, addLabel, ico) => `
    <div class="bld-sec-head"><span class="bld-sec-title"><span class="bld-ico item-icon-box item-icon-${SECTION_TILE[key]}">${icon(ico, { size: 18 })}</span>${label}</span>
      ${addLabel ? `<button type="button" class="bld-add" data-add="${key}" aria-label="Add ${esc(label)}">${icon('plus', { size: 14, stroke: 2.5 })}Add</button>` : ''}</div>`;

  function dayBody(i) {
    const d = model.days[i];
    const runs = M.stayRuns(model);
    const run = runs.find((r) => i >= r.from && i < r.from + r.nights);
    const here = M.locationBefore(model, i);
    const prev = i > 0 ? `Day ${i}` : '';
    const choices = M.placeChoices(model, i);
    const seg = (key, current2, a, bLabel) => `<div class="fu-toggle bld-seg" role="radiogroup">
      <button type="button" role="radio" aria-checked="${current2 === 'same'}" class="${current2 === 'same' ? 'active' : ''}" data-mode="${key}:same">${a}</button>
      <button type="button" role="radio" aria-checked="${current2 === 'different'}" class="${current2 === 'different' ? 'active' : ''}" data-mode="${key}:different">${bLabel}</button></div>`;

    const location = `
      <div class="bld-sec"><div class="bld-sec-head"><span class="bld-sec-title"><span class="bld-ico item-icon-box item-icon-bed">${icon('pin', { size: 18 })}</span>Location for this day</span></div>
        <div class="bld-opts">
          <button type="button" class="bld-opt ${d.locationMode === 'same' ? 'is-on' : ''}" data-loc="same"><span class="bld-radio"></span><span class="bld-opt-text"><b>Same location</b><small>${esc(here ? `Stay in ${here}` : 'Stay in one place')}</small></span></button>
          <button type="button" class="bld-opt ${d.locationMode === 'transit' ? 'is-on' : ''}" data-loc="transit"><span class="bld-radio"></span><span class="bld-opt-text"><b>Transit to another place</b><small>${esc(d.locationMode === 'transit' && d.to ? `${here || 'Start'} → ${d.to}` : 'Move to a new place')}</small></span></button>
        </div>
        ${d.locationMode === 'transit' ? `<div class="bld-chips bld-places" aria-label="Destination">
            ${choices.map((p) => `<button type="button" class="bld-chip ${d.to === p ? 'is-on' : ''}" data-place="${esc(p)}">${esc(p)}</button>`).join('')}
            <button type="button" class="bld-chip bld-chip-add" data-place-add>${icon('plus', { size: 14, stroke: 2.5 })}Add another place</button>
          </div>
          <div class="bld-input bld-place-input" data-place-input hidden>${icon('pin', { size: 17 })}<input type="text" maxlength="80" placeholder="Place name" autocomplete="off" data-place-text><button type="button" class="bld-stop-ok" data-place-save>Add</button></div>` : ''}
      </div>`;

    const hotelRows = [];
    if (d.hotel.mode === 'different' && d.hotel.stay) hotelRows.push(rowHtml('hotel', rows.hotel(d.hotel.stay, run)));
    if (d.hotel.mode === 'same' && run) hotelRows.push(`<p class="bld-note-line">Same hotel as ${esc(prev || 'the previous day')}: ${esc(run.stay.name)} (nights ${run.from + 1} to ${run.from + run.nights}).</p>`);
    const hotel = `<div class="bld-sec">${sectionHead('hotel', 'Hotel Stay', d.hotel.mode === 'different' && !d.hotel.stay ? 'Add' : '', 'bed')}
      ${i > 0 ? seg('hotel', d.hotel.mode, `Same as ${prev}`, 'A different hotel') : ''}${hotelRows.join('')}</div>`;

    const tRows = d.transport.items.map((t) => rowHtml('transport', rows.transport(t))).join('');
    const prevHasTransport = i > 0 && M.transportSource(model, i);
    const transport = `<div class="bld-sec">${sectionHead('transport', 'Transport', d.transport.mode === 'different' ? 'Add' : '', 'bus')}
      ${i > 0 ? seg('transport', d.transport.mode, `Same as ${prev}`, 'A different cab') : ''}
      ${d.transport.mode === 'same' && i > 0 ? `<p class="bld-note-line">${prevHasTransport ? 'The same vehicle continues from the previous day.' : 'No transport set on the previous day.'}</p>` : ''}${tRows}</div>`;

    const lists = {
      activity: `<div class="bld-sec">${sectionHead('activity', 'Activities', 'Add', 'camera')}${d.activities.map((a) => rowHtml('activity', rows.activity(a))).join('')}</div>`,
      meal: `<div class="bld-sec">${sectionHead('meal', 'Meals', 'Add', 'utensils')}${d.meals.map((m) => rowHtml('meal', rows.meal(m))).join('')}</div>`,
      note: `<div class="bld-sec">${sectionHead('note', 'Notes', 'Add', 'note')}${d.notes.map((n) => rowHtml('note', rows.note(n))).join('')}</div>`,
    };
    const legacy = d.legacy.length ? `<div class="bld-sec">${sectionHead('legacy', 'Other events', '', 'clock')}${d.legacy.map((x) => rowHtml('legacy', rows.legacy(x), { edit: false })).join('')}</div>` : '';
    const helpers = `<div class="bld-helpers">
      ${i > 0 ? '<button type="button" class="bld-link" data-copy-prev>Same as previous day</button>' : ''}
      ${model.days.length > 1 ? '<button type="button" class="bld-link" data-copy-to aria-haspopup="menu">Copy this day to…</button>' : ''}
      <label class="bld-title-edit"><span>Day title</span><input type="text" class="bld-text" data-day-title value="${esc(d.title)}" maxlength="80" placeholder="e.g. Arrival day" autocomplete="off"></label></div>`;
    return location + hotel + transport + lists.activity + lists.meal + lists.note + legacy + helpers;
  }

  function step2Html() {
    const warns = M.warnings(model);
    const chips = model.days.map((d, i) => `<button type="button" role="tab" aria-selected="${i === openDay}" class="bld-daychip ${i === openDay ? 'is-on' : ''}" data-chip-day="${i}"><span class="bld-dc-n">Day ${i + 1}</span><span class="bld-dc-d">${d.iso ? M.fmtShort(d.iso) : ''}</span>${M.hasContent(d) ? '<i class="bld-dc-dot" aria-label="Has content"></i>' : ''}</button>`).join('');
    const acc = model.days.map((d, i) => `
      <section class="bld-acc ${i === openDay ? 'is-open' : ''}" data-acc="${i}">
        <button type="button" class="bld-acc-head" data-acc-toggle="${i}" aria-expanded="${i === openDay}" aria-controls="bld-acc-body-${i}">
          <span class="bld-acc-n">${i + 1}</span>
          <span class="bld-acc-text"><b>Day ${i + 1}${d.iso ? ` · ${esc(M.fmtLong(d.iso))}` : ''}</b><small>${esc(M.routeLabel(model, i))}</small></span>
          ${icon('chevronDown', { size: 18, cls: 'bld-acc-chev' })}
        </button>
        <div class="bld-acc-collapse"><div class="bld-acc-body" id="bld-acc-body-${i}" role="region">${i === openDay ? dayBody(i) : ''}</div></div>
      </section>`).join('');
    return `
      <section class="bld-step" aria-labelledby="bld-h2">
        <h4 class="bld-h" id="bld-h2">Build your itinerary</h4>
        <p class="bld-help">Add or edit each day. You can add hotels, transport, activities and meals.</p>
        ${warns.length ? `<div class="bld-warn" role="status">${icon('alertCircle', { size: 16 })}<ul>${warns.slice(0, 6).map((w) => `<li>${esc(w.text)}</li>`).join('')}</ul></div>` : ''}
        ${model.days.length ? `<div class="bld-daychips" role="tablist" aria-label="Days">${chips}</div><div class="bld-accs">${acc}</div>` : '<div class="state-box"><h4>No days yet</h4><p>Set the trip dates in step 1.</p></div>'}
      </section>`;
  }

  function render({ keepScroll = true } = {}) {
    const y = keepScroll ? bodyEl.scrollTop : 0;
    renderChrome();
    bodyEl.innerHTML = current === 1 ? step1Html() : step2Html();
    bodyEl.scrollTop = y;
    if (current === 2) {
      const chip = bodyEl.querySelector('.bld-daychip.is-on');
      chip?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }

  /** Re-render one open day and the parts that summarise it (chips, header route, warnings). */
  const refresh = () => { render(); touch(); };

  /* ---------- actions ---------- */
  function setOpen(i, { scroll = true } = {}) {
    openDay = i;
    model.days.forEach((_, k) => {
      const acc = bodyEl.querySelector(`[data-acc="${k}"]`);
      if (!acc) return;
      const on = k === i;
      acc.classList.toggle('is-open', on);
      acc.querySelector('[data-acc-toggle]').setAttribute('aria-expanded', String(on));
      const bodyDiv = acc.querySelector('.bld-acc-body');
      if (on && !bodyDiv.innerHTML.trim()) bodyDiv.innerHTML = dayBody(k);
    });
    bodyEl.querySelectorAll('.bld-daychip').forEach((c) => { const on = Number(c.dataset.chipDay) === i; c.classList.toggle('is-on', on); c.setAttribute('aria-selected', String(on)); });
    if (scroll) setTimeout(() => bodyEl.querySelector(`[data-acc="${i}"]`)?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 30);
  }

  const find = (section, id) => {
    const d = model.days[openDay];
    if (section === 'hotel') return d.hotel.stay;
    if (section === 'transport') return d.transport.items.find((x) => x.id === id);
    if (section === 'activity') return d.activities.find((x) => x.id === id);
    if (section === 'meal') return d.meals.find((x) => x.id === id);
    if (section === 'note') return d.notes.find((x) => x.id === id);
    return null;
  };
  const listOf = (d, section) => ({ transport: d.transport.items, activity: d.activities, meal: d.meals, note: d.notes, legacy: d.legacy }[section]);

  function applyHotel(i, stay, nights) {
    const d = model.days[i];
    d.hotel = { mode: 'different', stay };
    // The nights it covers: following days stay with this hotel; the day it ends on has to choose again.
    for (let k = 1; k < nights && model.days[i + k]; k++) model.days[i + k].hotel.mode = 'same';
    const after = model.days[i + nights];
    if (after && after.hotel.mode === 'same') after.hotel = { mode: 'different', stay: null };
  }

  /** Where focus goes when the small dialog closes: the "+ Add" button (or the row's Edit link) that opened it. */
  const focusTarget = (section, id) => (id ? bodyEl.querySelector(`[data-edit="${section}:${id}"]`) : null)
    || bodyEl.querySelector(`[data-add="${section}"]`) || bodyEl.querySelector(`[data-edit^="${section}:"]`);

  function addOrEdit(section, id) {
    const i = openDay;
    const d = model.days[i];
    const existing = id ? find(section, id) : null;
    const returnFocus = () => focusTarget(section, id);
    // The dialog closes first, then the plan re-renders; put focus back on the button once the new markup is there.
    const done = () => { refresh(); requestAnimationFrame(() => returnFocus()?.focus?.({ preventScroll: true })); };
    const base = { model, i, existing, returnFocus };
    if (section === 'hotel') hotelForm({ ...base, onSave: (stay, nights) => { applyHotel(i, stay, nights); done(); } });
    else if (section === 'transport') {
      transportForm({
        ...base,
        assigneeFor: (tid) => model.keep[tid]?.assigned ?? null,
        onSave: (t, move) => {
          if (move) { d.locationMode = move.locationMode; d.to = move.to; } // the day's destination: one source of truth
          if (existing) Object.assign(existing, t); else { d.transport.items.push(t); d.transport.mode = 'different'; }
          done();
        },
      });
    } else if (section === 'activity') {
      activityForm({
        ...base,
        onSave: (a) => {
          const target = a.date && a.date !== d.iso ? model.days.findIndex((x) => x.iso === a.date) : -1;
          if (existing && target < 0) Object.assign(existing, a);
          else {
            if (existing) d.activities.splice(d.activities.indexOf(existing), 1);
            model.days[target >= 0 ? target : i].activities.push(a);
          }
          if (target >= 0) toast(`Moved to Day ${target + 1}`, 'success');
          done();
        },
      });
    } else if (section === 'meal') mealForm({ ...base, onSave: (m) => { if (existing) Object.assign(existing, m); else d.meals.push(m); done(); } });
    else if (section === 'note') noteForm({ ...base, onSave: (n) => { if (existing) Object.assign(existing, n); else d.notes.push(n); done(); } });
  }

  function removeItem(section, id) {
    const d = model.days[openDay];
    if (section === 'hotel') d.hotel.stay = null;
    else { const list = listOf(d, section); const k = list.findIndex((x) => x.id === id); if (k >= 0) list.splice(k, 1); }
    refresh();
  }

  function duplicateTo(section, id, target) {
    const src = find(section, id);
    if (!src || section === 'hotel') return;
    listOf(model.days[target], section).push({ ...src, id: M.newId('x') });
    refresh();
    toast(`Copied to Day ${target + 1}`, 'success');
  }

  function openKebab(trigger, section, id) {
    const items = [{ key: 'edit', label: 'Edit', icon: 'edit' }];
    if (section !== 'hotel' && section !== 'legacy' && model.days.length > 1) items.push({ key: 'dup', label: 'Duplicate to another day', icon: 'copy' });
    items.push({ key: 'del', label: 'Delete', icon: 'trash', danger: true });
    if (section === 'legacy') items.shift();
    openRowMenu(trigger, items, (key) => {
      if (key === 'edit') addOrEdit(section, id);
      else if (key === 'del') removeItem(section, id);
      else if (key === 'dup') {
        const others = model.days.map((x, k) => ({ key: `d${k}`, label: `Day ${k + 1}${x.iso ? ` · ${M.fmtShort(x.iso)}` : ''}`, icon: 'calendar' })).filter((x) => x.key !== `d${openDay}`);
        setTimeout(() => openRowMenu(trigger, others, (k) => duplicateTo(section, id, Number(k.slice(1)))), 0);
      }
    });
  }

  async function changeDates(key, value) {
    const meta = model.meta;
    const start = key === 'start' ? value : meta.start;
    const end = key === 'end' ? value : meta.end;
    const err = $('#bld-date-error');
    if (start && end && end < start) { err.hidden = false; return false; }
    err.hidden = true;
    const plan = M.planResize(model, start, end);
    if (plan.removing.length) {
      const ok = await confirmDialog({ title: 'Remove days?', text: `${plan.removing.length} day${plan.removing.length === 1 ? '' : 's'} with events will be removed from the end of the itinerary.`, confirm: 'Remove days', danger: true });
      if (!ok) return false;
    }
    M.applyResize(model, start, end);
    openDay = Math.min(openDay, Math.max(0, model.days.length - 1));
    return true;
  }

  async function finish() {
    const { start, end } = model.meta;
    if (start && end && end < start) { current = 1; render(); $('#bld-date-error').hidden = false; return; }
    const days = M.toDays(model);
    const meta = M.toMeta(model);
    const before = snapshot(b);
    b.itineraryDays = days;
    b.itineraryMeta = meta;
    clearDraft(b);
    dlg.close();
    onChange();
    requestAnimationFrame(() => document.querySelectorAll('#desktop-sheet-body, #sheet-body-content').forEach((el) => el.scrollTo({ top: 0 })));
    const ok = await saveItinerary(b, before, { meta, onRollback: onChange });
    if (ok) { markSaved(b); toast('Itinerary saved', 'success'); }
  }

  /* ---------- events ---------- */
  dlg.ov.addEventListener('click', async (e) => {
    const t = (s) => e.target.closest(s);
    if (t('[data-bld="next"]')) {
      if (current === 1) {
        if (model.meta.start && model.meta.end && model.meta.end < model.meta.start) { $('#bld-date-error').hidden = false; return; }
        current = 2; openDay = Math.min(openDay, Math.max(0, model.days.length - 1)); render({ keepScroll: false });
      } else finish();
      return;
    }
    if (t('[data-bld="back"]') && current === 2) { current = 1; render({ keepScroll: false }); return; }
    let el;
    if ((el = t('[data-clear]'))) { model.meta[el.dataset.clear] = ''; render(); touch(); return; }
    if (t('[data-stop-add]')) { const box = $('#bld-stop-input'); box.hidden = false; $('#bld-stop-text').focus(); return; }
    if (t('[data-stop-save]')) { const input = $('#bld-stop-text'); const v = input.value.trim(); if (v && !model.meta.stops.includes(v)) { model.meta.stops.push(v); refresh(); } return; }
    if ((el = t('[data-stop-remove]'))) { model.meta.stops.splice(Number(el.dataset.stopRemove), 1); refresh(); return; }
    if ((el = t('[data-chip-day]'))) { setOpen(Number(el.dataset.chipDay)); return; }
    if ((el = t('[data-acc-toggle]'))) {
      const i = Number(el.dataset.accToggle);
      if (i === openDay && el.getAttribute('aria-expanded') === 'true') { bodyEl.querySelector(`[data-acc="${i}"]`).classList.remove('is-open'); el.setAttribute('aria-expanded', 'false'); }
      else setOpen(i);
      return;
    }
    if ((el = t('[data-loc]'))) {
      const d = model.days[openDay];
      d.locationMode = el.dataset.loc;
      if (d.locationMode === 'transit' && !d.to) d.to = M.placeChoices(model, openDay)[0] || '';
      if (d.locationMode === 'same') d.to = '';
      refresh();
      return;
    }
    if ((el = t('[data-place]'))) { model.days[openDay].to = el.dataset.place; refresh(); return; }
    if (t('[data-place-add]')) { const box = bodyEl.querySelector('[data-place-input]'); box.hidden = false; box.querySelector('input').focus(); return; }
    if (t('[data-place-save]')) { const v = bodyEl.querySelector('[data-place-text]').value.trim(); if (v) { model.days[openDay].to = v; refresh(); } return; }
    if ((el = t('[data-mode]'))) { const [sec, mode] = el.dataset.mode.split(':'); model.days[openDay][sec === 'hotel' ? 'hotel' : 'transport'].mode = mode; if (sec === 'hotel' && mode === 'different') model.days[openDay].hotel.stay ??= null; refresh(); return; }
    if ((el = t('[data-add]'))) { addOrEdit(el.dataset.add); return; }
    if ((el = t('[data-edit]'))) { const [s, id] = el.dataset.edit.split(':'); addOrEdit(s, id); return; }
    if ((el = t('[data-kebab]'))) { const [s, id] = el.dataset.kebab.split(':'); openKebab(el, s, id); return; }
    if (t('[data-copy-prev]')) { M.copyDay(model, openDay - 1, openDay); refresh(); toast(`Copied from Day ${openDay}`, 'success'); return; }
    if ((el = t('[data-copy-to]'))) {
      const items = model.days.map((x, k) => ({ key: `d${k}`, label: `Day ${k + 1}${x.iso ? ` · ${M.fmtShort(x.iso)}` : ''}`, icon: 'calendar' })).filter((x) => x.key !== `d${openDay}`);
      openRowMenu(el, items, (k) => { M.copyDay(model, openDay, Number(k.slice(1))); refresh(); toast(`Copied to Day ${Number(k.slice(1)) + 1}`, 'success'); });
    }
  });

  dlg.ov.addEventListener('input', (e) => {
    const el = e.target.closest('[data-meta]');
    if (el && (el.dataset.meta === 'origin' || el.dataset.meta === 'destination')) {
      model.meta[el.dataset.meta] = el.value;
      const clear = bodyEl.querySelector(`[data-clear="${el.dataset.meta}"]`);
      if (clear) clear.hidden = !el.value;
      $('#bld-sub').textContent = subtitle();
      touch();
      return;
    }
    const title = e.target.closest('[data-day-title]');
    if (title) { model.days[openDay].title = title.value; touch(); }
  });
  dlg.ov.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.matches('#bld-stop-text')) { e.preventDefault(); bodyEl.querySelector('[data-stop-save]').click(); }
    if (e.target.matches('[data-place-text]')) { e.preventDefault(); bodyEl.querySelector('[data-place-save]').click(); }
  });
  dlg.ov.addEventListener('change', async (e) => {
    const el = e.target.closest('input[type="date"][data-meta]');
    if (!el) return;
    const key = el.dataset.meta;
    const prev = model.meta[key];
    const ok = await changeDates(key, el.value);
    if (!ok) { el.value = prev; }
    render();
    touch();
  });

  render({ keepScroll: false });
  if (current === 2) setOpen(openDay, { scroll: false });
}

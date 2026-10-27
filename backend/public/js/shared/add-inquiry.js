// Add Inquiry wizard: one dialog (PC and tablets) / bottom sheet (phones) in three steps, all optional:
// 1 Customer & trip, 2 Itinerary (the itinerary builder embedded), 3 Guests. Staff can save at any step.
// The inquiry does not exist until Save, so the itinerary stays a draft in this module and is saved together with it.
import { icon } from './icons.js';
import { esc, toast, UNNAMED_LEAD } from './ui.js';
import { openSheet, confirmDialog } from './sheet.js';
import { createInquiry, markJustAdded } from './inquiry-store.js';
import { builderShell, mountBuilder, newBuilderState } from './itinerary-builder-ui.js';
import * as M from './itinerary-builder.js';

/** Quick picks under "Preferred destination" (there is no destinations list elsewhere in the app). */
export const DESTINATION_CHIPS = ['Kashmir', 'Goa', 'Manali', 'Kerala', 'Bali', 'Rishikesh'];

const MAX_GUESTS = 30;
const FIELDS = ['name', 'phone', 'email', 'city', 'dest', 'budget', 'comment'];
const STEPS = [
  { label: 'Customer & trip', title: 'Customer & trip', sub: 'Who is on the call and where do they want to go?' },
  { label: 'Itinerary', title: 'Itinerary', sub: 'Build the trip plan: route, dates, hotels, activities and transport. You can skip this step.' },
  { label: 'Guests', title: 'Guests', sub: 'How many people are travelling? The customer is Guest 1 by default.' },
];

const blank = () => ({ name: '', phone: '', email: '', city: '', dest: '', budget: '', comment: '', itin: null, guests: [{ name: '', age: '', edited: false }] });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** What the itinerary summary shows: counts of what was planned (not the "stay continues" and check-out lines). */
function planCounts(days) {
  const c = { stay: 0, transport: 0, activity: 0, meal: 0, note: 0 };
  days.forEach((d) => d.items.forEach((it) => {
    const role = it.details?.b?.role;
    if (it.type === 'stay' && role === 'check_in') c.stay += 1;
    else if (it.type === 'transport' && role === 'transport') c.transport += 1;
    else if (it.type in c && it.type !== 'stay' && it.type !== 'transport') c[it.type] += 1;
  }));
  return c;
}

const rupee = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const field = (id, label, inner, { error = '', optional = false } = {}) => `<div class="fu-field"><label for="${id}">${esc(label)}${optional ? '<span class="bld-optional"> (optional)</span>' : ''}</label>${inner}<p class="fu-error" id="${id}-err" role="alert" ${error ? '' : 'hidden'}>${esc(error)}</p></div>`;

/**
 * @param {{ showRow?: (row: object) => void, returnFocus?: () => Element | null }} opts
 *   showRow brings the new row into view (the page clears its filters and scrolls to the top); it runs once after
 *   a save and again when "View" in the toast is pressed.
 */
export function openAddInquiry({ showRow, returnFocus, prefill = {} } = {}) {
  const s = Object.assign(blank(), prefill);
  let step = 0;
  let saving = false;
  let builder = null; // the mounted builder, while step 2 shows it
  let editing = false; // an itinerary that was already added is being changed
  let bs = null; // the builder's plan; kept while the user moves between steps
  const errors = {};

  /* ---------- derived values ---------- */
  const guestCount = () => s.guests.length;
  const syncGuestOne = () => { const g = s.guests[0]; if (!g.edited) g.name = s.name; };
  const filled = (k) => String(s[k]).trim() !== '';
  /** "Details added": filled fields, the itinerary, and guests that have an age (or, after the first, a name). */
  const detailCount = () => FIELDS.filter(filled).length + (s.itin ? 1 : 0)
    + s.guests.filter((g, i) => String(g.age).trim() !== '' || (i > 0 && g.name.trim() !== '')).length;
  const builderDirty = () => !!bs && M.signature(bs.model) !== bs.baseSig;
  const hasData = () => detailCount() > 0 || builderDirty();

  /** Nights and first travel day: from the added itinerary, else from the dates typed in the builder. */
  function trip() {
    const m = s.itin ? { start: s.itin.meta.startDate || '', end: s.itin.meta.endDate || '' } : bs ? bs.model.meta : null;
    const nights = m?.start && m?.end && m.end >= m.start ? M.nightCount(m) : (s.itin ? Math.max(0, s.itin.days.length - 1) : 0);
    return { start: m?.start || '', nights };
  }

  /** The record the builder plans for. It is not saved yet, so it carries only what step 1 and 3 already know. */
  const draftParent = (days = []) => ({
    kind: 'inquiry', id: 'new', title: s.dest.trim(), destination: s.dest.trim(), dates: '', pax: guestCount(),
    itineraryDays: days, customer: { location: s.city.trim(), preferredDestination: s.dest.trim() }, raw: { location: s.city.trim() },
  });

  /* ---------- markup ---------- */
  const dlg = openSheet({
    label: 'Add Inquiry',
    cls: 'wiz-sheet',
    returnFocus,
    beforeClose: () => !hasData() || confirmDialog({ title: 'Discard this inquiry?', text: 'What you entered has not been saved.', confirm: 'Discard', cancel: 'Keep editing', danger: true }),
    html: `<header class="asg-header wiz-header">
        <div class="wiz-title"><h3 data-dialog-title tabindex="-1">Add Inquiry</h3><p class="wiz-sub">Fill in what you know. Everything is optional.</p></div>
        <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>
      <div class="wiz-progress"><p class="wiz-mstep" id="wiz-mstep"></p><div class="wiz-seg" id="wiz-seg" aria-hidden="true"></div></div>
      <div class="wiz-main">
        <nav class="wiz-rail" id="wiz-rail" aria-label="Steps"></nav>
        <div class="wiz-pane">
          <div class="wiz-body" id="wiz-body"></div>
          <footer class="fu-footer wiz-footer">
            <button type="button" class="bld-link wiz-early" id="wiz-early"></button>
            <span class="wiz-spacer"></span>
            <button type="button" class="btn-secondary-desktop" id="wiz-back">Back</button>
            <button type="button" class="btn-primary-desktop" id="wiz-next">Next</button>
          </footer>
        </div>
      </div>`,
  });
  const $ = dlg.$;
  const bodyEl = $('#wiz-body');

  const detailLabel = () => `${icon('check', { size: 16, stroke: 2.5 })}<span>Save with what I have</span><small>· ${plural(detailCount(), 'detail')} added</small>`;

  function previewHtml() {
    const g = guestCount();
    const { nights } = trip();
    return `<small>LIVE PREVIEW</small><b>${esc(s.name.trim() || UNNAMED_LEAD)}</b><span>${esc(s.dest.trim() || 'No destination yet')}</span><span>${plural(g, 'guest')}${nights ? ` • ${plural(nights, 'night')}` : ''}</span>`;
  }

  /** Everything around the step content: rail, progress, footer buttons, the live preview and the details counter. */
  function paintChrome() {
    $('#wiz-rail').innerHTML = `${STEPS.map((t, i) => `
        <button type="button" class="wiz-step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}" data-go="${i}" ${i === step ? 'aria-current="step"' : ''}>
          <span class="bld-step-dot">${i < step ? icon('check', { size: 14, stroke: 3 }) : i + 1}</span><span class="wiz-step-label">${esc(t.label)}</span>
        </button>`).join('')}
      <div class="wiz-preview" id="wiz-preview" aria-live="off">${previewHtml()}</div>`;
    $('#wiz-mstep').textContent = `Step ${step + 1} of ${STEPS.length} · ${STEPS[step].label}`;
    $('#wiz-seg').innerHTML = STEPS.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('');
    paintFooter();
  }
  function paintFooter() {
    const early = $('#wiz-early');
    early.hidden = step === 2;
    early.innerHTML = detailLabel();
    $('#wiz-back').hidden = step === 0;
    $('#wiz-next').textContent = saving ? 'Saving…' : step === 2 ? 'Save Inquiry' : 'Next';
    dlg.sheet.querySelectorAll('#wiz-back, #wiz-next, #wiz-early').forEach((b) => { b.disabled = saving; });
  }
  /** Cheap updates while typing: no re-render, so the cursor and keyboard stay where they are. */
  function paintLive() {
    const pv = $('#wiz-preview');
    if (pv) pv.innerHTML = previewHtml();
    const early = $('#wiz-early');
    if (early) early.innerHTML = detailLabel();
  }

  const input = (k, id, label, ph, ico, { type = 'text', mode = '', max = 120, optional = false } = {}) => field(id, label,
    `<div class="bld-input">${ico === '₹' ? '<span class="wiz-cur" aria-hidden="true">₹</span>' : icon(ico, { size: 17 })}<input id="${id}" type="${type}" ${mode ? `inputmode="${mode}"` : ''} data-k="${k}" maxlength="${max}" placeholder="${esc(ph)}" value="${esc(s[k])}" autocomplete="off" ${errors[k] ? 'aria-invalid="true"' : ''}></div>`,
    { error: errors[k], optional });

  function step1Html() {
    const dest = s.dest.trim().toLowerCase();
    return `
      <div class="wiz-note" role="note">${icon('info', { size: 16 })}<p>Nothing is mandatory. Skip anything the customer hasn't shared yet.</p></div>
      <div class="wiz-row">${input('name', 'wiz-name', 'Full name', 'e.g. Arjun Mehra', 'user')}${input('phone', 'wiz-phone', 'Phone number', '98765 12345', 'phone', { type: 'tel', mode: 'tel', max: 30 })}</div>
      <div class="wiz-row">${input('email', 'wiz-email', 'Email', 'name@example.com', 'mail', { type: 'email', mode: 'email', max: 160, optional: true })}${input('city', 'wiz-city', 'City (where they are from)', 'e.g. Mumbai', 'pin')}</div>
      ${input('dest', 'wiz-dest', 'Preferred destination', 'e.g. Bali, Indonesia', 'pin', { max: 160 })}
      <div class="fu-field"><div class="bld-chips" role="group" aria-label="Popular destinations">${DESTINATION_CHIPS.map((d) => `<button type="button" class="bld-chip ${d.toLowerCase() === dest ? 'is-on' : ''}" data-chip="${esc(d)}" aria-pressed="${d.toLowerCase() === dest}">${esc(d)}</button>`).join('')}</div></div>
      ${input('budget', 'wiz-budget', 'Budget estimate', '2,50,000', '₹', { type: 'number', mode: 'numeric', max: 12 })}
      ${field('wiz-comment', 'Comment', `<textarea id="wiz-comment" class="bld-textarea" data-k="comment" rows="4" maxlength="2000" placeholder="Anything from the call: preferences, dates, special requests…">${esc(s.comment)}</textarea>`)}`;
  }

  function step2Html() {
    if (s.itin && !editing) {
      const { days, meta } = s.itin;
      const c = planCounts(days);
      const parts = [['hotel', c.stay], ['transport', c.transport], ['activity', c.activity], ['meal', c.meal], ['note', c.note]].filter(([, n]) => n > 0);
      const { nights } = trip();
      const route = [meta.origin, ...(meta.stops || []), meta.destination].filter(Boolean).join(' → ');
      const dates = meta.startDate && meta.endDate ? M.fmtRange(meta.startDate, meta.endDate) : '';
      return `
        <section class="wiz-itin" aria-labelledby="wiz-itin-h">
          <div class="wiz-itin-head"><span class="wiz-itin-ok">${icon('check', { size: 16, stroke: 3 })}</span><h4 id="wiz-itin-h" tabindex="-1">Itinerary added</h4></div>
          <dl class="wiz-itin-list">
            <div><dt>Route</dt><dd>${esc(route || 'Not set')}</dd></div>
            <div><dt>Dates</dt><dd>${esc(dates || 'Not set')}</dd></div>
            <div><dt>Nights</dt><dd>${nights ? plural(nights, 'night') : 'Not set'}</dd></div>
            <div><dt>Planned</dt><dd>${parts.length ? parts.map(([k, n]) => `${n} ${k}${n === 1 ? '' : 's'}`).join(' · ') : 'No events yet'}</dd></div>
          </dl>
          <div class="wiz-itin-actions"><button type="button" class="btn-secondary-desktop" data-itin="edit">${icon('edit', { size: 15 })}Edit itinerary</button><button type="button" class="bld-link wiz-danger" data-itin="remove">Remove itinerary</button></div>
        </section>`;
    }
    return `${editing ? '<div class="wiz-edit-bar"><span>Editing the added itinerary</span><button type="button" class="bld-link" data-itin="cancel">Cancel editing</button></div>' : ''}<div class="wiz-bld" id="wiz-bld">${builderShell({ embedded: true })}</div>`;
  }

  function step3Html() {
    const n = guestCount();
    return `
      <div class="fu-field"><label id="wiz-pax-l">Number of guests</label>
        <div class="bld-count wiz-count" role="group" aria-labelledby="wiz-pax-l">
          <button type="button" data-pax="-1" aria-label="Fewer guests" ${n <= 1 ? 'disabled' : ''}>${icon('minus', { size: 16, stroke: 2.4 })}</button>
          <output aria-live="polite" id="wiz-pax">${n}</output>
          <button type="button" data-pax="1" aria-label="More guests" ${n >= MAX_GUESTS ? 'disabled' : ''}>${icon('plus', { size: 16, stroke: 2.4 })}</button>
        </div></div>
      ${s.guests.map((g, i) => `
        <div class="wiz-guest">
          <p class="wiz-guest-title">Guest ${i + 1}${i === 0 ? '<small>· the customer, from step 1</small>' : ''}</p>
          <div class="fu-field"><label for="wiz-g${i}-name">Name</label><input id="wiz-g${i}-name" type="text" maxlength="120" data-g="${i}" data-f="name" placeholder="Full name" value="${esc(g.name)}" autocomplete="off"></div>
          <div class="fu-field"><label for="wiz-g${i}-age">Age</label><input id="wiz-g${i}-age" type="number" min="0" max="120" inputmode="numeric" data-g="${i}" data-f="age" placeholder="Age" value="${esc(g.age)}" autocomplete="off"></div>
        </div>`).join('')}`;
  }

  /* ---------- the builder inside step 2 ---------- */
  function mountStepBuilder() {
    const host = $('#wiz-bld');
    if (!host) return;
    if (!bs) bs = editing && s.itin
      ? newBuilderState(draftParent(s.itin.days), { meta: s.itin.meta }, { step: 2 })
      : newBuilderState(draftParent());
    builder = mountBuilder(host, bs, {
      embedded: true,
      scroller: bodyEl,
      onChange: paintLive,
      onDone: (days, meta) => {
        s.itin = { days, meta };
        editing = false;
        bs = null;
        builder?.destroy();
        builder = null;
        renderStep();
        paintChrome();
        $('#wiz-itin-h')?.focus({ preventScroll: true }); // the summary heading, never a field
      },
    });
  }
  function unmountBuilder() { builder?.destroy(); builder = null; }

  /** Leaving step 2: changes made in the builder count as done (as if Done was pressed). Returns false when the dates need fixing. */
  function settleBuilder() {
    if (!builder) return true;
    if (!builder.isDirty()) { if (editing) { editing = false; bs = null; } return true; }
    return builder.done();
  }

  function renderStep() {
    unmountBuilder();
    const html = [step1Html, step2Html, step3Html][step]();
    bodyEl.innerHTML = `<section class="wiz-step-pane" aria-labelledby="wiz-h"><h4 class="wiz-h" id="wiz-h" tabindex="-1">${esc(STEPS[step].title)}</h4><p class="wiz-help">${esc(STEPS[step].sub)}</p>${html}</section>`;
    if (step === 1) {
      // Not edited and not added yet: start again from the city and destination typed in step 1.
      if (!s.itin && !builderDirty()) bs = null;
      mountStepBuilder();
    }
    bodyEl.scrollTop = 0;
  }

  function go(to, { focusHeading = true } = {}) {
    if (saving || to === step) return;
    if (step === 1 && !settleBuilder()) return;
    step = Math.max(0, Math.min(STEPS.length - 1, to));
    syncGuestOne();
    renderStep();
    paintChrome();
    if (focusHeading) $('#wiz-h')?.focus({ preventScroll: true }); // a heading, never an input: no keyboard pops up
  }

  /* ---------- save ---------- */
  function validate() {
    Object.keys(errors).forEach((k) => delete errors[k]);
    if (s.phone.trim() && !/^[0-9+\-()\s.]+$/.test(s.phone.trim())) errors.phone = 'Phone can only contain digits, spaces, + and -.';
    if (s.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) errors.email = 'Enter a valid email address.';
    if (s.budget !== '' && !(Number(s.budget) >= 0)) errors.budget = 'Budget must be a number.';
    return Object.keys(errors).length === 0;
  }

  async function save() {
    if (saving) return;
    if (step === 1 && !settleBuilder()) return;
    syncGuestOne();
    if (!validate()) {
      step = 0;
      renderStep();
      paintChrome();
      toast(Object.values(errors)[0], 'warning');
      return;
    }
    const n = detailCount();
    saving = true;
    paintFooter();
    try {
      const row = await createInquiry({
        name: s.name.trim() || null,
        phone: s.phone.trim() || null,
        email: s.email.trim() || null,
        city: s.city.trim() || null,
        destination: s.dest.trim() || null,
        budget: s.budget === '' ? null : Number(s.budget),
        comment: s.comment.trim() || null,
        guests: s.guests.map((g) => ({ name: g.name.trim() || null, age: String(g.age).trim() === '' ? null : Number(g.age) })),
        itinerary: s.itin ? { days: s.itin.days, meta: s.itin.meta } : null,
      });
      unmountBuilder();
      dlg.close();
      showRow?.(row);
      markJustAdded(row.id);
      toast(n ? `Inquiry saved with ${plural(n, 'detail')}.` : 'Inquiry saved.', 'success', { label: 'View', onClick: () => showRow?.(row) });
    } catch (e) {
      saving = false;
      paintFooter();
      toast(e.message || 'Could not save the inquiry.', 'warning');
    }
  }

  /* ---------- events ---------- */
  dlg.ov.addEventListener('click', async (e) => {
    const t = (sel) => e.target.closest(sel);
    let el;
    if (t('#wiz-next')) { if (step === 2) save(); else go(step + 1); return; }
    if (t('#wiz-back')) { go(step - 1); return; }
    if (t('#wiz-early')) { save(); return; }
    if ((el = t('[data-go]'))) { go(Number(el.dataset.go)); return; }
    if ((el = t('[data-chip]'))) {
      s.dest = s.dest.trim().toLowerCase() === el.dataset.chip.toLowerCase() ? '' : el.dataset.chip; // tapping the lit chip clears it
      const box = $('#wiz-dest');
      box.value = s.dest;
      bodyEl.querySelectorAll('[data-chip]').forEach((c) => { const on = c.dataset.chip.toLowerCase() === s.dest.trim().toLowerCase(); c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      paintLive();
      return;
    }
    if ((el = t('[data-pax]'))) {
      const d = Number(el.dataset.pax);
      if (d > 0 && guestCount() < MAX_GUESTS) s.guests.push({ name: '', age: '', edited: false });
      if (d < 0 && guestCount() > 1) s.guests.pop();
      const keep = el.dataset.pax;
      renderStep();
      paintChrome();
      // keep focus on the button the user is pressing, unless it just became disabled
      const again = bodyEl.querySelector(`[data-pax="${keep}"]`);
      (again && !again.disabled ? again : bodyEl.querySelector('[data-pax]:not(:disabled)'))?.focus({ preventScroll: true });
      return;
    }
    if ((el = t('[data-itin]'))) {
      const what = el.dataset.itin;
      if (what === 'edit') { editing = true; bs = null; renderStep(); $('#wiz-h')?.focus({ preventScroll: true }); }
      else if (what === 'cancel') { unmountBuilder(); editing = false; bs = null; renderStep(); paintChrome(); }
      else if (what === 'remove') {
        if (!(await confirmDialog({ title: 'Remove itinerary?', text: 'The itinerary you added will be cleared.', confirm: 'Remove', cancel: 'Keep it', danger: true }))) return;
        s.itin = null; editing = false; bs = null; renderStep(); paintChrome();
        $('#wiz-h')?.focus({ preventScroll: true });
      }
    }
  });

  dlg.ov.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.g !== undefined) {
      const g = s.guests[Number(t.dataset.g)];
      g[t.dataset.f] = t.value;
      if (t.dataset.g === '0' && t.dataset.f === 'name') g.edited = true; // from now on guest 1 is no longer the customer's name
    } else if (t.dataset.k) {
      s[t.dataset.k] = t.value;
      if (errors[t.dataset.k]) { delete errors[t.dataset.k]; const p = $(`#${t.id}-err`); if (p) p.hidden = true; t.removeAttribute('aria-invalid'); }
      if (t.dataset.k === 'name') syncGuestOne();
      if (t.dataset.k === 'dest') {
        const v = s.dest.trim().toLowerCase();
        bodyEl.querySelectorAll('[data-chip]').forEach((c) => { const on = c.dataset.chip.toLowerCase() === v; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      }
    } else return;
    paintLive();
  });

  paintChrome();
  renderStep();
  return { close: () => dlg.close() };
}

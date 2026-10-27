// "Use as itinerary for an inquiry": pick an inquiry, then the existing itinerary builder opens with the package's days prefilled.
// The builder is mounted the way the Add Inquiry wizard mounts it (mountBuilder + newBuilderState on a parent that is not saved yet):
// here the plan lives in the dialog until "Done", and only then is it written to the chosen inquiry (PUT /api/inquiries/{id}/itinerary).
import { icon } from '../shared/icons.js';
import { esc, toast } from '../shared/ui.js';
import { openSheet, confirmDialog } from '../shared/sheet.js';
import { builderShell, mountBuilder, newBuilderState } from '../shared/itinerary-builder-ui.js';
import * as M from '../shared/itinerary-builder.js';
import { getJson, sendJson } from '../shared/http.js';

const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No travel date');

/** @param {object} pkg  the detail from GET /api/tour-packages/{id} (its `itinerary` days are in the builder's saved shape) */
export function useAsItinerary(pkg) {
  const dlg = openSheet({
    label: 'Choose an inquiry',
    cls: 'tp-chooser',
    html: `<header class="asg-header bld-header">
        <div class="bld-title"><h3 data-dialog-title tabindex="-1">Use as itinerary</h3><p class="bld-sub">${esc(pkg.name)} · choose the inquiry it is for</p></div>
        <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>
      <div class="tp-chooser-body" id="tp-chooser-body"><p class="sp-none">Loading inquiries…</p></div>`,
  });
  const body = dlg.$('#tp-chooser-body');
  let rows = [];

  const paint = () => {
    if (!rows.length) { body.innerHTML = '<p class="sp-none">There are no inquiries yet. Add an inquiry first.</p>'; return; }
    body.innerHTML = `<div class="sp-group">${rows.map((q, i) => `
      <button type="button" class="sp-linkrow tp-pick" data-pick="${i}">
        <span class="sp-tile sp-tile-sm">${icon('message', { size: 18 })}</span>
        <span class="sp-linkrow-text"><b>${esc(q.customer_name || 'Unnamed lead')}</b><small>${esc([q.trip, day(q.travel_date)].filter(Boolean).join(' · '))}</small></span>
        ${q.itinerary_days?.length ? '<span class="sp-chip tp-has">Has an itinerary</span>' : ''}
      </button>`).join('')}</div>`;
  };

  getJson('/api/inquiries').then((data) => { rows = (data || []).slice(0, 40); paint(); })
    .catch(() => { body.innerHTML = '<p class="sp-none">Could not load the inquiries. Close this and try again.</p>'; });

  body.addEventListener('click', async (e) => {
    const pick = e.target.closest('[data-pick]');
    if (!pick) return;
    const q = rows[Number(pick.dataset.pick)];
    if (q.itinerary_days?.length && !(await confirmDialog({ title: 'Replace the itinerary?', text: `${q.customer_name || 'This inquiry'} already has an itinerary. The package will replace it.`, confirm: 'Replace', cancel: 'Keep it', danger: true }))) return;
    dlg.close();
    openBuilder(pkg, q);
  });
}

function openBuilder(pkg, q) {
  const start = q.travel_date || '';
  const parent = {
    kind: 'inquiry', id: q.id, title: pkg.destination || pkg.name, destination: pkg.destination || '', dates: '', pax: q.pax || 0,
    itineraryDays: pkg.itinerary, customer: { location: q.location || '', preferredDestination: pkg.destination || '' }, raw: { location: q.location || '', nights: pkg.nights },
  };
  const saved = { meta: { origin: q.location || '', destination: pkg.destination || '', stops: [], startDate: start || null, endDate: start ? M.addDaysIso(start, pkg.itinerary.length - 1) : null } };
  const state = newBuilderState(parent, saved, { step: start ? 2 : 1 });
  let builder = null;
  let saving = false;

  const dlg = openSheet({
    label: 'Itinerary from package',
    cls: 'bld-sheet',
    beforeClose: async () => !builder?.isDirty() || confirmDialog({ title: 'Discard changes?', text: 'Your itinerary changes have not been saved.', confirm: 'Discard', cancel: 'Keep editing', danger: true }),
    html: `<header class="asg-header bld-header">
        <div class="bld-title"><h3>Add Itinerary</h3><p class="bld-sub" id="bld-sub"></p></div>
        <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>${builderShell()}`,
  });
  builder = mountBuilder(dlg.ov, state, {
    subtitle: () => [pkg.name, q.customer_name || 'Unnamed lead'].join(' · '),
    onDone: async (days, meta) => {
      if (saving) return;
      saving = true;
      try {
        await sendJson(`/api/inquiries/${encodeURIComponent(q.id)}/itinerary`, 'PUT', { days, meta });
        dlg.close();
        toast(`Itinerary from ${pkg.name} added to ${q.customer_name || 'the inquiry'}`, 'success');
      } catch (err) {
        toast(err.message || 'Could not save the itinerary.', 'warning');
      }
      saving = false;
    },
  });
}

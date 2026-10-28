// "Rename Day" dialog and the optimistic save helper for in-place itinerary edits (Bookings and Inquiries, phone and PC).
import { icon } from './icons.js';
import { esc, toast } from './ui.js';
import { openScreen } from './sheet.js';
import { daysOf, snapshot, saveItinerary, dayName, markSaved } from './itinerary.js';

/** Save a mutation optimistically; roll back (and re-render) if the server refuses. */
export async function commit(b, mutate, onChange, okMessage) {
  const before = snapshot(b);
  mutate();
  onChange();
  const ok = await saveItinerary(b, before, { onRollback: onChange });
  if (ok) markSaved(b);
  if (ok && okMessage) toast(okMessage, 'success');
  return ok;
}

export function openDayDialog(b, { index, onChange }) {
  const existing = daysOf(b)[index];
  if (!existing) return;
  const date = existing.date;

  // A screen pushed inside the open sheet (openScreen), not a popup on top of it.
  const dlg = openScreen({
    title: 'Rename Day',
    label: 'Rename day',
    bodyCls: 'itin-body',
    footCls: 'fu-footer itin-footer',
    body: `<p class="itin-hint"><strong>${dayName(index + 1)}${date && date !== 'TBD' ? ` · ${esc(date)}` : ''}</strong></p>
        <div class="fu-field"><label for="itin-day-title">Day title (optional)</label><input id="itin-day-title" type="text" maxlength="80" placeholder="e.g. Arrival in Rishikesh" value="${esc(existing.title || '')}" /></div>`,
    footer: `<button type="button" class="btn-secondary-desktop" data-sheet-close>Cancel</button>
        <button type="button" class="btn-primary-desktop" data-itin-save>Save</button>`,
  });

  dlg.ov.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-itin-save]')) return;
    const title = dlg.$('#itin-day-title').value.trim();
    dlg.close();
    await commit(b, () => { if (title) existing.title = title; else delete existing.title; }, onChange, 'Day renamed');
  });
}

// "Add Itinerary Event" and "Add / Rename Day" dialogs (one implementation for Bookings and Inquiries, phone and PC).
import { icon } from './icons.js';
import { esc, toast } from './ui.js';
import { openSheet } from './sheet.js';
import { createDropdown } from './dropdown-filter.js';
import { EVENT_TYPES, daysOf, makeDay, makeEvent, snapshot, saveItinerary, dateForDay, dayName, markSaved } from './itinerary.js';

const dayLabel = (d) => (d.date && d.date !== 'TBD' ? `${d.day} · ${d.date}` : d.day);

function header(title) {
  return `<header class="asg-header"><h3>${esc(title)}</h3><button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>`;
}

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

export function openEventDialog(b, { dayIndex = null, onChange }) {
  const days = daysOf(b);
  let day = days.length ? String(dayIndex ?? 0) : 'new';
  let type = EVENT_TYPES[0].value;

  const dlg = openSheet({
    label: 'Add itinerary event',
    cls: 'itin-sheet',
    html: `${header('Add Itinerary Event')}
      <div class="itin-body">
        <div class="fu-field"><label>Select Day</label><div class="dd-block" id="itin-day"></div></div>
        <div class="itin-newday" id="itin-newday" hidden>
          <div class="itin-newday-head">${icon('calendar', { size: 15 })}<strong id="itin-newday-label"></strong></div>
          <div class="fu-field"><label for="itin-newday-title">Day title (optional)</label><input id="itin-newday-title" type="text" maxlength="80" placeholder="e.g. Arrival in Rishikesh" /></div>
        </div>
        <div class="fu-field"><label for="itin-title">Event Title</label><input id="itin-title" type="text" maxlength="120" placeholder="e.g. Sunset Boat Cruise & Tea" /></div>
        <div class="fu-field"><label for="itin-sub">Time &amp; Subtitle / Location</label><input id="itin-sub" type="text" maxlength="200" placeholder="e.g. 05:30 PM • 1-hour cruise with DJ" /></div>
        <div class="fu-field"><label>Category / Icon</label><div class="dd-block" id="itin-type"></div></div>
        <p class="fu-error" id="itin-error" role="alert" hidden></p>
      </div>
      <footer class="fu-footer itin-footer">
        <button type="button" class="btn-cancel-assign" data-sheet-close>Cancel</button>
        <button type="button" class="btn-primary-desktop" data-itin-save>Add to Itinerary</button>
      </footer>`,
  });

  const showNewDay = () => {
    const n = daysOf(b).length + 1;
    const date = dateForDay(b, n);
    dlg.$('#itin-newday').hidden = day !== 'new';
    dlg.$('#itin-newday-label').textContent = `${dayName(n)}${date ? ` · ${date}` : ''}`;
  };

  const dayDd = createDropdown({
    options: () => [...daysOf(b).map((d, i) => ({ value: String(i), label: dayLabel(d) })), { value: 'new', label: 'Add new day', icon: 'plus' }],
    ariaLabel: 'Select day', iconName: 'calendar', onChange: (v) => { day = v; showNewDay(); },
  });
  dayDd.attach(dlg.$('#itin-day'));
  dayDd.setValue(day);
  showNewDay();

  const typeDd = createDropdown({
    options: EVENT_TYPES.map((t) => ({ value: t.value, label: t.label, icon: t.icon })),
    ariaLabel: 'Category', onChange: (v) => { type = v; },
  });
  typeDd.attach(dlg.$('#itin-type'));
  typeDd.setValue(type);

  dlg.ov.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-itin-save]')) return;
    const title = dlg.$('#itin-title').value.trim();
    const err = dlg.$('#itin-error');
    if (!title) { err.textContent = 'Please enter an event title.'; err.hidden = false; return; }
    err.hidden = true;
    const ev = makeEvent({ title, subtitle: dlg.$('#itin-sub').value, type });
    const newTitle = dlg.$('#itin-newday-title').value;
    dlg.close();
    await commit(b, () => {
      if (day === 'new') { const d = makeDay(b, newTitle); d.items.push(ev); daysOf(b).push(d); }
      else daysOf(b)[Number(day)]?.items.push(ev);
    }, onChange, `Added "${title}" to the itinerary`);
  });
}

export function openDayDialog(b, { index = null, onChange }) {
  const renaming = index !== null;
  const existing = renaming ? daysOf(b)[index] : null;
  const n = renaming ? index + 1 : daysOf(b).length + 1;
  const date = renaming ? existing.date : dateForDay(b, n);

  const dlg = openSheet({
    label: renaming ? 'Rename day' : 'Add day',
    cls: 'itin-sheet',
    html: `${header(renaming ? 'Rename Day' : 'Add Day')}
      <div class="itin-body">
        <div class="itin-newday"><div class="itin-newday-head">${icon('calendar', { size: 15 })}<strong>${dayName(n)}${date && date !== 'TBD' ? ` · ${esc(date)}` : ''}</strong></div></div>
        <div class="fu-field"><label for="itin-day-title">Day title (optional)</label><input id="itin-day-title" type="text" maxlength="80" placeholder="e.g. Arrival in Rishikesh" value="${esc(existing?.title || '')}" /></div>
      </div>
      <footer class="fu-footer itin-footer">
        <button type="button" class="btn-cancel-assign" data-sheet-close>Cancel</button>
        <button type="button" class="btn-primary-desktop" data-itin-save>${renaming ? 'Save' : 'Add Day'}</button>
      </footer>`,
  });

  dlg.ov.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-itin-save]')) return;
    const title = dlg.$('#itin-day-title').value.trim();
    dlg.close();
    await commit(b, () => {
      if (renaming) { if (title) existing.title = title; else delete existing.title; }
      else daysOf(b).push(makeDay(b, title));
    }, onChange, renaming ? 'Day renamed' : `${dayName(n)} added`);
  });
}

// Transport: the vehicle types the itinerary builder offers, with their daily rates. List on the left, detail on the right (Rates / Details).
// It reads and edits the builder's own vehicle list: "Most popular" and "Show in itinerary builder" are the two switches, saved with Save changes.
// The Add button and the Edit button are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast } from '../shared/ui.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, toggle, flipToggle, money, plural } from '../shared/page-ui.js';
import { card } from './catalog-ui.js';

const RENTALS = ['self_drive', 'scooter_bike'];
const kind = (v) => (RENTALS.includes(v.key) ? 'rental' : v.category === 'bus' || v.key === 'bus' ? 'bus' : v.category === 'car' || v.category === 'van' ? 'car' : 'other');
const KIND_LABEL = { car: 'Car', bus: 'Bus', rental: 'Rental', other: 'Other' };
const perDay = (v) => (v.baseRate == null ? 'Arranged by the customer' : v.key === 'boat' ? `${money(v.baseRate)} per night` : `${money(v.baseRate)} per day`);
const iconOf = (v) => (['car', 'suv', 'van', 'bus', 'bike', 'boat', 'train', 'plane'].includes(v.icon) ? v.icon : 'car');
const unit = { day: ' / day', km: ' / km', night: ' / night' };

const rateRow = (r) => `
  <div class="sp-linkrow">
    <div class="sp-linkrow-text"><b>${esc(r.label)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ''}</div>
    <div class="sp-linkrow-right"><b>${esc(money(r.amount) + (unit[r.unit] || ''))}</b></div>
  </div>`;

export default {
  css: true,
  mount(host, ctx) {
    const abort = new AbortController();
    let page = null;
    let draft = null; // { id, mostPopular, showInBuilder }: the open vehicle's switches while they differ from what is saved
    let saving = false;

    const changed = () => {
      const item = draft && page.api.items().find((i) => i.id === draft.id);
      return !!item && (draft.mostPopular !== item.mostPopular || draft.showInBuilder !== item.showInBuilder);
    };
    const valuesOf = (item) => (draft && draft.id === item.id ? draft : item);

    page = createSplitPage(host, ctx, {
      title: 'Transport',
      noun: 'vehicle',
      plural: 'vehicles',
      addLabel: 'Add Vehicle',
      searchPlaceholder: 'Search vehicles...',
      load: () => getJson('/api/transport'),
      subtitle: (items) => `Transport • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'cars', label: 'Cars', test: (v) => kind(v) === 'car' },
        { key: 'buses', label: 'Buses', test: (v) => kind(v) === 'bus' },
        { key: 'rentals', label: 'Rentals', test: (v) => kind(v) === 'rental' },
        { key: 'other', label: 'Other', test: (v) => kind(v) === 'other' },
      ],
      sorts: [
        { value: '', label: 'Default order' },
        { value: 'az', label: 'Name A–Z', compare: (a, b) => a.name.localeCompare(b.name) },
        { value: 'rate', label: 'Rate: low to high', compare: (a, b) => (a.baseRate ?? Infinity) - (b.baseRate ?? Infinity) },
        { value: 'trips', label: 'Most trips', compare: (a, b) => b.trips - a.trips },
      ],
      searchText: (v) => `${v.name} ${v.description || ''} ${KIND_LABEL[kind(v)]}`,
      isDirty: changed,
      discard: () => { draft = null; },
      row: (v) => ({
        tile: tile(iconOf(v)),
        name: v.name,
        pill: v.mostPopular ? tag('resort', 'Most popular') : '',
        sub: v.description || '',
        meta: `${perDay(v)}${v.trips ? `   ${plural(v.trips, 'trip')} this year` : ''}`,
      }),
      detail: (item, ui) => {
        const v = valuesOf(item);
        const tabs = [{ key: 'rates', label: 'Rates' }, { key: 'details', label: 'Details' }];
        let body;
        if (ui.tab === 'details') {
          body = card('car', 'Vehicle', detailGrid([
            ['Seats', item.seats ? String(item.seats) : ''], ['Air conditioning', item.ac ? 'AC' : 'Non-AC'],
            ['Type', KIND_LABEL[kind(item)]], ['Rate basis', item.rateUnit === 'per_day' ? 'Per day' : item.baseRate == null ? 'No rate (arranged by the customer)' : ''],
            ['Trips this year', String(item.trips)], ['Average days per trip', item.avgDays != null ? String(item.avgDays) : ''],
          ]));
        } else {
          body = `
            ${statRow([
              { icon: 'chart', label: 'Daily rate', value: item.baseRate == null ? '—' : money(item.baseRate), tone: 'blue' },
              { icon: 'briefcase', label: 'Trips this year', value: item.trips, tone: 'green' },
              { icon: 'calendar', label: 'Avg days per trip', value: item.avgDays != null ? item.avgDays : '—', tone: 'amber' },
            ])}
            <section>${sectionTitle('Rate card', '<span class="sp-hint">Agents can override the price per trip</span>')}
              ${item.rateCard.length ? rowGroup(item.rateCard.map(rateRow)) : '<p class="sp-none">No rates: the customer arranges this one.</p>'}
            </section>
            <section>${sectionTitle('In the itinerary builder')}${rowGroup([
              toggle({ id: 'mostPopular', label: 'Most popular', hint: 'Shown first in the builder', on: v.mostPopular }),
              toggle({ id: 'showInBuilder', label: 'Show in itinerary builder', hint: 'Available to agents', on: v.showInBuilder }),
            ])}</section>`;
        }
        return {
          head: {
            avatar: tile(iconOf(item), 26),
            title: item.name,
            pill: pill(item.active ? 'active' : 'inactive', item.active ? 'Active' : 'Inactive'),
            subtitle: [KIND_LABEL[kind(item)], item.description].filter(Boolean).join(' · '),
            chips: [item.seats ? { icon: 'people', text: `${item.seats} seats` } : null, { icon: 'car', text: item.ac ? 'AC' : 'Non-AC' }, item.baseRate != null ? { icon: 'money', text: perDay(item) } : null].filter(Boolean),
          },
          tabs,
          body,
          foot: {
            primary: { label: 'Save changes', icon: 'check', act: 'save' },
            quick: [{ label: 'Reset', icon: 'close', tone: 'msg', act: 'reset' }, { label: 'Edit', icon: 'edit', tone: 'fwd', act: 'edit' }],
          },
        };
      },
    });
    page.api.bindDirty(changed);

    async function save(item) {
      if (!changed()) { toast('No changes to save.', 'info'); return; }
      if (saving) return;
      saving = true;
      try {
        const res = await sendJson(`/api/transport/${encodeURIComponent(item.id)}`, 'PATCH', { mostPopular: draft.mostPopular, showInBuilder: draft.showInBuilder });
        Object.assign(item, res.data, { id: String(res.data.id) });
        draft = null;
        page.api.refresh();
        toast('Vehicle saved', 'success');
      } catch (err) {
        toast(err.message || 'Could not save. Try again.', 'warning');
      }
      saving = false;
    }

    host.addEventListener('click', (e) => {
      const item = page.api.current();
      if (!item) return;
      const sw = e.target.closest('[data-sp-toggle]');
      if (sw) {
        draft = draft && draft.id === item.id ? draft : { id: item.id, mostPopular: item.mostPopular, showInBuilder: item.showInBuilder };
        draft[sw.dataset.spToggle] = flipToggle(sw);
        if (!changed()) draft = null; // switched back: nothing to discard
        return;
      }
      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      if (act === 'save') save(item);
      if (act === 'reset') {
        if (!changed()) { toast('Nothing to reset.', 'info'); return; }
        draft = null;
        page.api.refresh();
      }
    }, { signal: abort.signal });

    return { destroy: () => { abort.abort(); page.destroy(); }, isDirty: () => changed() };
  },
};

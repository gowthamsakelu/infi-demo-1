// Transport: the vehicle types the itinerary builder offers, with their daily rates. List on the left, detail on the right (Rates / Details).
// It reads and edits the builder's own vehicle list: "Most popular" and "Show in itinerary builder" are the two switches, saved with Save changes.
// The Add button and the Edit button are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf } from '../shared/catalog-crud.js';
import { esc, toast } from '../shared/ui.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, toggle, flipToggle, money, plural } from '../shared/page-ui.js';
import { card, highlightsCard, overviewCard, inclusionsCard, bulletCard } from './catalog-ui.js';

const RENTALS = ['self_drive', 'scooter_bike'];
const kind = (v) => (RENTALS.includes(v.key) ? 'rental' : v.category === 'bus' || v.key === 'bus' ? 'bus' : v.category === 'car' || v.category === 'van' ? 'car' : 'other');
const KIND_LABEL = { car: 'Car', bus: 'Bus', rental: 'Rental', other: 'Other' };
const perDay = (v) => (v.baseRate == null ? 'Arranged by the customer' : v.key === 'boat' ? `${money(v.baseRate)} per night` : `${money(v.baseRate)} per day`);
const iconOf = (v) => (['car', 'suv', 'van', 'bus', 'bike', 'boat', 'train', 'plane'].includes(v.icon) ? v.icon : 'car');
const unit = { day: ' / day', km: ' / km', night: ' / night' };

/** Extra charges, read-only, from the rate card: everything after the base rate (extra distance, night halt, airport transfer ...). */
const extras = (v) => (v.rateCard || []).slice(1).map((r) => `${r.label}: ${money(r.amount)}${unit[r.unit] || ''}${r.note ? ` (${r.note})` : ''}`);

const rateRow = (r) => `
  <div class="sp-linkrow">
    <div class="sp-linkrow-text"><b>${esc(r.label)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ''}</div>
    <div class="sp-linkrow-right"><b>${esc(money(r.amount) + (unit[r.unit] || ''))}</b></div>
  </div>`;

/** Add / Edit a vehicle: the shared catalog wizard, described by config only (see shared/wizard.js). */
const VEHICLE_CATEGORIES = [{ value: 'car', label: 'Car' }, { value: 'van', label: 'Van' }, { value: 'bus', label: 'Bus' }, { value: 'other', label: 'Other' }];
function wizardConfig() {
  return {
    noun: 'vehicle',
    requiredKey: 'name',
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The vehicle, its size and what the builder shows.', fields: [
        { key: 'name', type: 'text', label: 'Vehicle name', placeholder: 'e.g. Sedan 4-seater AC', optional: false, max: 80 },
        { key: 'category', type: 'chips', label: 'Type', options: VEHICLE_CATEGORIES },
        { key: 'seats', type: 'number', label: 'Seats', placeholder: '4', half: true, max: 2 },
        { key: 'description', type: 'text', label: 'Examples', placeholder: 'e.g. Dzire, Etios or similar', max: 200 },
        { key: 'ac', type: 'toggle', label: 'Air conditioning' },
        { key: 'active', type: 'toggle', label: 'Active', hint: 'Available to book' },
        { key: 'mostPopular', type: 'toggle', label: 'Most popular', hint: 'Shown first in the builder' },
        { key: 'showInBuilder', type: 'toggle', label: 'Show in itinerary builder', hint: 'Available to agents' },
      ] },
      { label: 'Rates', title: 'Rates', sub: 'Leave the daily rate empty when the customer arranges this vehicle.', fields: [
        { key: 'rateUnit', type: 'chips', label: 'Rate basis', options: [{ value: 'per_day', label: 'Per day' }, { value: 'per_trip', label: 'Per trip' }] },
        { key: 'baseRate', type: 'price', label: 'Base rate', placeholder: '3,500', max: 9 },
        { key: 'rateCard', type: 'rates', label: 'Rate card', placeholder: 'e.g. Extra distance', addLabel: 'Add rate' },
      ] },
      { label: 'Overview', title: 'Overview & features', sub: 'What the vehicle is like, what the price covers, and what it does not.', fields: [
        { key: 'overview', type: 'textarea', label: 'Overview', placeholder: 'A few sentences about this vehicle', rows: 4, max: 2000 },
        { key: 'highlights', type: 'list', label: 'Features', placeholder: 'e.g. Push-back seats', addLabel: 'Add feature' },
        { key: 'inclusions', type: 'list', label: 'Included', placeholder: 'e.g. Fuel', addLabel: 'Add item' },
        { key: 'exclusions', type: 'list', label: 'Not included', placeholder: 'e.g. Entry tickets', addLabel: 'Add item' },
      ] },
    ],
    defaults: () => ({ name: '', category: 'car', seats: '', description: '', ac: true, active: true, mostPopular: false, showInBuilder: true, rateUnit: 'per_day', baseRate: '', rateCard: [], overview: '', highlights: [], inclusions: [], exclusions: [] }),
    preview: (v) => ({ title: String(v.name || '').trim(), lines: [VEHICLE_CATEGORIES.find((c) => c.value === v.category)?.label || '', v.seats ? `${v.seats} seats` : '', v.ac ? 'AC' : 'Non-AC', numOrNull(v.baseRate) != null ? `₹${Number(v.baseRate).toLocaleString('en-IN')} per day` : 'Arranged by the customer'] }),
  };
}

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

    const rateCardOf = (rows) => (rows || []).filter((r) => String(r.label || '').trim() || String(r.amount ?? '').trim() !== '')
      .map((r) => ({ label: String(r.label || '').trim() || 'Rate', note: r.note ?? null, amount: Number(r.amount || 0), unit: r.unit ?? 'day' }));

    const crud = createCatalogCrud({
      key: 'transport',
      endpoint: '/api/transport',
      wizard: () => wizardConfig(),
      toBody: (v) => ({
        name: v.name.trim(), category: v.category || 'car', seats: numOrNull(v.seats), ac: !!v.ac, active: !!v.active, mostPopular: !!v.mostPopular,
        showInBuilder: !!v.showInBuilder, description: textOrNull(v.description), rateUnit: v.rateUnit || 'per_day', baseRate: numOrNull(v.baseRate),
        rateCard: rateCardOf(v.rateCard), overview: textOrNull(v.overview), highlights: listOf(v.highlights), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions),
      }),
      local: (v, old) => ({
        ...(old || {}), name: v.name.trim(), category: v.category || 'car', icon: v.category === 'other' ? 'car' : (v.category || 'car'),
        seats: numOrNull(v.seats), ac: !!v.ac, active: !!v.active, mostPopular: !!v.mostPopular, showInBuilder: !!v.showInBuilder,
        description: textOrNull(v.description), rateUnit: v.rateUnit || 'per_day', baseRate: numOrNull(v.baseRate), rateCard: rateCardOf(v.rateCard),
        overview: textOrNull(v.overview), highlights: listOf(v.highlights), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions),
        key: old?.key ?? 'new', trips: old?.trips ?? 0, avgDays: old?.avgDays ?? null,
      }),
      values: (item) => ({
        name: item.name, category: item.category || 'car', seats: item.seats ?? '', ac: !!item.ac, active: !!item.active, mostPopular: !!item.mostPopular,
        showInBuilder: !!item.showInBuilder, description: item.description ?? '', rateUnit: item.rateUnit || 'per_day', baseRate: item.baseRate ?? '',
        rateCard: (item.rateCard || []).map((r) => ({ ...r, amount: r.amount ?? '' })), overview: item.overview ?? '',
        highlights: item.highlights || [], inclusions: item.inclusions || [], exclusions: item.exclusions || [],
      }),
      load: () => getJson('/api/transport'),
      onChange: (list, { id, added }) => {
        draft = null; // the saved record is what the switches show now
        page.api.setItems(list);
        if (added && id && document.documentElement.dataset.layout !== 'mobile') ctx.setParams({ selected: id, q: null, tab: null, filter: null }, { push: false });
      },
    });

    page = createSplitPage(host, ctx, {
      title: 'Transport',
      noun: 'vehicle',
      plural: 'vehicles',
      addLabel: 'Add Vehicle',
      onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }),
      rowMenu: () => [{ key: 'edit', label: 'Edit', icon: 'edit' }, { key: 'view', label: 'View details', icon: 'eye' }],
      onRowMenu: (key, item) => (key === 'edit' ? crud.edit(item) : page.api.select(item.id)),
      searchPlaceholder: 'Search vehicles...',
      load: () => crud.load(),
      subtitle: (items) => `Transport • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'cars', label: 'Cars', test: (v) => kind(v) === 'car' },
        { key: 'buses', label: 'Buses', test: (v) => kind(v) === 'bus' },
        { key: 'rentals', label: 'Rentals', test: (v) => kind(v) === 'rental' },
        { key: 'other', label: 'Other', test: (v) => kind(v) === 'other' },
      ],
      filter: {
        allLabel: 'Any AC',
        options: () => [{ value: 'ac', label: 'AC' }, { value: 'non-ac', label: 'Non-AC' }],
        test: (v, value) => (value === 'ac' ? !!v.ac : !v.ac),
      },
      searchText: (v) => `${v.name} ${v.description || ''} ${KIND_LABEL[kind(v)]}`,
      isDirty: changed,
      discard: () => { draft = null; },
      row: (v) => ({
        tile: tile(iconOf(v)),
        name: v.name,
        pill: `${v.mostPopular ? tag('resort', 'Most popular') : ''}${crud.isFresh(v.id) ? '<span class="just-added-tag">JUST ADDED</span>' : ''}`,
        sub: v.description || '',
        meta: `${perDay(v)}${v.trips ? `   ${plural(v.trips, 'trip')} this year` : ''}`,
      }),
      detail: (item, ui) => {
        const v = valuesOf(item);
        const tabs = [{ key: 'rates', label: 'Rates' }, { key: 'details', label: 'Details' }];
        let body;
        if (ui.tab === 'details') {
          body = `${card('car', 'Vehicle', detailGrid([
            ['Seats', item.seats ? String(item.seats) : ''], ['Air conditioning', item.ac ? 'AC' : 'Non-AC'],
            ['Type', KIND_LABEL[kind(item)]], ['Rate basis', item.rateUnit === 'per_day' ? 'Per day' : item.baseRate == null ? 'No rate (arranged by the customer)' : ''],
            ['Trips this year', String(item.trips)], ['Average days per trip', item.avgDays != null ? String(item.avgDays) : ''],
          ]))}
          ${overviewCard(item.overview)}
          ${highlightsCard(item.highlights)}
          ${inclusionsCard(item.inclusions, item.exclusions)}
          ${bulletCard('money', 'Extra charges', extras(item))}`;
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
      if (act === 'edit') crud.edit(item, { returnFocus: () => host.querySelector('[data-sp-act="edit"]') });
      else if (act === 'save') save(item);
      if (act === 'reset') {
        if (!changed()) { toast('Nothing to reset.', 'info'); return; }
        draft = null;
        page.api.refresh();
      }
    }, { signal: abort.signal });

    return { destroy: () => { abort.abort(); page.destroy(); }, isDirty: () => changed() };
  },
};

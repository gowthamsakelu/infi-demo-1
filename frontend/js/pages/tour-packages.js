// Tour Packages: the trips we sell. List on the left, detail on the right (Overview / Pricing).
// The overview holds About, Inclusions & Exclusions and the recent inquiries.
// Same shape as destinations.js. The Add and Edit buttons are drawn as designed and do nothing yet; "Use as itinerary for an inquiry"
// opens the itinerary builder prefilled with this package (see tour-packages-builder.js).
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { openWizard } from '../shared/wizard.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf, pictureOf } from '../shared/catalog-crud.js';
import { esc, errorState, toast } from '../shared/ui.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, linkRow, money, plural } from '../shared/page-ui.js';
import { card, optionsOf, filled, inclusionsCard, highlightsCard, heroImage } from './catalog-ui.js';
import { useAsItinerary } from './tour-packages-builder.js';

const TAGS = { tour: 'tour', group: 'tour', family: 'tour', honeymoon: 'tour', villa: 'villa', activity: 'activity' };
const TYPE = { tour: 'Tour', group: 'Group', family: 'Family', honeymoon: 'Honeymoon', villa: 'Villa stay', activity: 'Activity trip' };
const STATUS = { published: 'Published', draft: 'Draft' };
const trip = (p) => `${p.days}D / ${p.nights}N`;
const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date');


/** Add / Edit Tour Package: the shared catalog wizard described by config only (see shared/wizard.js). */
function wizardConfig(destOptions) {
  return {
    noun: 'package',
    requiredKey: 'name',
    required: ['name', 'destinationId', 'days'], // saved only when these are filled in
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The name, where it goes and how long it is.', fields: [
        { key: 'name', type: 'text', label: 'Package name', placeholder: 'e.g. Kashmir Valley & Gulmarg Tour', optional: false, max: 120 },
        { key: 'destinationId', type: 'select', label: 'Destination', options: destOptions, icon: 'pin' },
        { key: 'tag', type: 'chips', label: 'Type', options: [['tour', 'Tour'], ['group', 'Group'], ['family', 'Family'], ['honeymoon', 'Honeymoon']].map(([value, label]) => ({ value, label })) },
        { key: 'days', type: 'number', label: 'Days', placeholder: '5', half: true, max: 2 },
        { key: 'nights', type: 'number', label: 'Nights', placeholder: '4', half: true, max: 2 },
        { key: 'season', type: 'text', label: 'Season', placeholder: 'e.g. Mar - Jun', max: 60 },
        { key: 'status', type: 'chips', label: 'Status', options: [['published', 'Published'], ['draft', 'Draft'], ['seasonal', 'Seasonal']].map(([value, label]) => ({ value, label })) },
        { key: 'minPax', type: 'number', label: 'Minimum group size', placeholder: 'e.g. 2', max: 3 },
        { key: 'image', type: 'image', label: 'Image', hint: 'JPG, PNG or WebP · up to 5 MB' },
      ] },
      { label: 'Pricing', title: 'Pricing', sub: 'Per person, in rupees.', fields: [
        { key: 'price', type: 'price', label: 'From price per person', placeholder: '15,000', max: 9 },
        { key: 'groupPrice', type: 'price', label: 'Price per person for groups', placeholder: '12,500', max: 9 },
      ] },
      { label: 'Inclusions & Exclusions', title: 'Inclusions & Exclusions', sub: 'What the price covers, what it does not, and what makes the trip special.', fields: [
        { key: 'inclusions', type: 'list', label: 'Inclusions', placeholder: 'e.g. Daily breakfast', addLabel: 'Add inclusion' },
        { key: 'exclusions', type: 'list', label: 'Exclusions', placeholder: 'e.g. Flights', addLabel: 'Add exclusion' },
        { key: 'highlights', type: 'list', label: 'Highlights', placeholder: 'e.g. Shikara ride on Dal Lake', addLabel: 'Add highlight' },
      ] },
    ],
    defaults: () => ({ image: [], name: '', destinationId: '', tag: 'tour', days: '', nights: '', season: '', status: 'draft', minPax: '', price: '', groupPrice: '', inclusions: [], exclusions: [], highlights: [] }),
    preview: (v) => ({
      title: String(v.name || '').trim(),
      lines: [destOptions().find((o) => o.value === String(v.destinationId))?.label || 'No destination yet', v.days ? `${v.days}D / ${v.nights || 0}N` : 'No duration yet', v.price ? `From ${money(v.price)}` : 'No price yet', STATUS[v.status] || (v.status === 'seasonal' ? 'Seasonal' : 'Draft')],
    }),
  };
}

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/tour-packages/{id}, or { failed: true }
    const loading = new Set();
    const abort = new AbortController();
    let page = null;
    let destinations = null;

    async function ensureDetail(item, force = false) {
      const mine = crud.detail(item.id);
      if (mine) { cache.set(item.id, mine); return; }
      if (!force && (cache.has(item.id) || loading.has(item.id))) return;
      cache.delete(item.id);
      loading.add(item.id);
      try {
        cache.set(item.id, await getJson(`/api/tour-packages/${encodeURIComponent(item.id)}`));
      } catch (error) {
        cache.set(item.id, { failed: true, error });
      }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const destOptions = () => (destinations || []).map((d) => ({ value: String(d.id), label: d.name }));
    async function loadDestinations() {
      if (destinations) return;
      try { destinations = await getJson('/api/destinations'); } catch { destinations = []; }
    }
    const destLabel = (id) => destOptions().find((o) => o.value === String(id))?.label || '';
    const tiersOf = (v) => [
      numOrNull(v.price) != null ? { label: 'Per person', note: 'Starting price', price: Number(v.price) } : null,
      numOrNull(v.groupPrice) != null ? { label: 'Group', note: 'Per person, for groups', price: Number(v.groupPrice) } : null,
    ].filter(Boolean);
    const crud = createCatalogCrud({
      key: 'tour-packages',
      endpoint: '/api/tour-packages',
      wizard: () => wizardConfig(destOptions),
      toBody: (v) => ({
        name: v.name.trim(), image: pictureOf(v.image), destinationId: numOrNull(v.destinationId), destination: destLabel(v.destinationId) || undefined,
        tag: v.tag || undefined, status: v.status || undefined, days: numOrNull(v.days), nights: numOrNull(v.nights), season: textOrNull(v.season), minPax: numOrNull(v.minPax),
        price: numOrNull(v.price), groupPrice: numOrNull(v.groupPrice),
        inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions), highlights: listOf(v.highlights),
      }),
      local: (v, old) => {
        const days = numOrNull(v.days) ?? 1;
        return {
          ...(old || {}), name: v.name.trim(), image: pictureOf(v.image), destinationId: numOrNull(v.destinationId), destination: destLabel(v.destinationId), tag: v.tag || 'tour',
          status: v.status === 'seasonal' ? 'published' : v.status || 'draft', seasonal: v.status === 'seasonal', season: textOrNull(v.season),
          days, nights: numOrNull(v.nights) ?? Math.max(0, days - 1), price: numOrNull(v.price), minPax: numOrNull(v.minPax),
          bookings: old?.bookings ?? 0, priceTiers: tiersOf(v), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions), highlights: listOf(v.highlights),
          itinerary: old?.itinerary ?? [], // kept for "Use as itinerary for an inquiry"
          description: old?.description ?? null, inquiries: old?.inquiries ?? [],
        };
      },
      values: (d) => ({
        name: d.name, image: d.image ? [d.image] : [], destinationId: d.destinationId != null ? String(d.destinationId) : '', tag: d.tag || 'tour', days: d.days ?? '', nights: d.nights ?? '',
        season: d.season || '', status: d.seasonal ? 'seasonal' : d.status, minPax: d.minPax ?? '', price: d.price ?? '',
        groupPrice: (d.priceTiers || []).find((t) => t.label === 'Group')?.price ?? '',
        inclusions: d.inclusions || [], exclusions: d.exclusions || [], highlights: d.highlights || [],
      }),
      load: () => getJson('/api/tour-packages'),
      onChange: (list, { id, added }) => {
        if (id) cache.delete(id); // the detail is read again (the in-memory record wins over the server's)
        page.api.setItems(list);
        if (added && id && document.documentElement.dataset.layout !== 'mobile') ctx.setParams({ selected: id, q: null, tab: null, filter: null }, { push: false });
      },
    });

    async function openEdit(item) {
      await Promise.all([loadDestinations(), ensureDetail(item)]);
      const d = cache.get(item.id);
      if (!d || d.failed) { toast('Could not load this package. Try again.', 'warning'); return; }
      crud.edit({ ...item, ...d }, { returnFocus: () => host.querySelector('[data-sp-act="edit"]') });
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;
    const pending = (d, what) => (d?.failed ? errorState({ title: `Could not load ${what}`, error: d.error, what, retryAttr: 'data-tp-retry' }) : '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i></div>');

    function overview(item, d) {
      const ready = d && !d.failed;
      return `
        ${heroImage(item.image, item.name)}
        ${statRow([
          { icon: 'chart', label: 'From (per person)', value: money(item.price), tone: 'blue' },
          { icon: 'calendar', label: 'Duration', value: trip(item), tone: 'green' },
          { icon: 'briefcase', label: 'Bookings', value: item.bookings, tone: 'purple' },
          { icon: 'note', label: 'Inquiries', value: ready ? d.inquiries.length : '…', tone: 'amber' },
        ])}
        ${aboutCard(item, d)}
        ${ready ? highlightsCard(d.highlights) : ''}
        ${ready ? inclusionsCard(d.inclusions, d.exclusions) : ''}
        ${ready ? recent(d) : ''}`;
    }

    function aboutCard(item, d) {
      const ready = d && !d.failed;
      const grid = filled([
        ['Destination', item.destination || ''], ['Duration', `${plural(item.days, 'day')} / ${plural(item.nights, 'night')}`],
        ['Type', TYPE[item.tag] || ''], ['Season', item.season || (item.seasonal ? 'Seasonal' : 'All year')],
        ['Group size', ready && d.minPax ? `Min. ${plural(d.minPax, 'person')}` : ''],
      ]);
      const about = ready && d.description ? `<p class="tp-about">${esc(d.description)}</p>` : '';
      return card('layers', 'About this package', `${grid.length ? detailGrid(grid) : ''}${about}`);
    }

    /** The three newest inquiries for this destination; the full list is on the Inquiries page. */
    function recent(d) {
      if (!d.inquiries.length) return '';
      return `<section>${sectionTitle('Recent inquiries', '<a class="bld-link" href="#inquiries">View all</a>')}${rowGroup(d.inquiries.slice(0, 3).map((q) => linkRow({ ico: 'message', title: q.name, sub: [q.trip, day(q.travelDate)].filter(Boolean).join(' · '), right: q.status ? q.status[0].toUpperCase() + q.status.slice(1) : '' })))}</section>`;
    }

    page = createSplitPage(host, ctx, {
      title: 'Tour Packages',
      noun: 'package',
      plural: 'packages',
      addLabel: 'Add Package',
      searchPlaceholder: 'Search packages...',
      onAdd: () => { loadDestinations().then(() => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') })); },
      rowMenu: () => [{ key: 'edit', label: 'Edit', icon: 'edit' }, { key: 'view', label: 'View details', icon: 'eye' }],
      onRowMenu: (key, item) => (key === 'edit' ? openEdit(item) : page.api.select(item.id)),
      load: () => crud.load(),
      subtitle: (items) => `Tour Packages • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'published', label: 'Published', test: (i) => i.status === 'published' },
        { key: 'draft', label: 'Draft', test: (i) => i.status === 'draft' },
        { key: 'seasonal', label: 'Seasonal', test: (i) => i.seasonal },
      ],
      filter: {
        allLabel: 'All Destinations',
        options: (items) => optionsOf(items, (i) => i.destination),
        test: (i, value) => i.destination === value,
      },
      searchText: (i) => `${i.name} ${i.destination || ''} ${i.tag}`,
      row: (i) => ({
        tile: tile('layers'),
        thumb: true,
        image: i.image,
        name: i.name,
        pill: `${pill(i.status, STATUS[i.status] || i.status)}${crud.isFresh(i.id) ? '<span class="just-added-tag">JUST ADDED</span>' : ''}`,
        sub: [i.destination, trip(i)].filter(Boolean).join(' · '),
        meta: `${money(i.price)}   ${plural(i.bookings, 'booking')}`,
      }),
      detail: (item, ui) => {
        const d = cache.get(item.id);
        const ready = d && !d.failed;
        const tabs = [
          { key: 'overview', label: 'Overview' },
          { key: 'pricing', label: 'Pricing' },
        ];
        let body;
        if (ui.tab === 'pricing') body = ready ? (d.priceTiers.length ? `<section>${sectionTitle('Price per person', '<span class="sp-hint">By group size</span>')}${rowGroup(d.priceTiers.map((t) => linkRow({ ico: 'users', title: t.label, sub: t.note, right: money(t.price) })))}</section>` : empty('No price tiers yet.')) : pending(d, 'the pricing');
        else body = overview(item, d);
        return {
          head: {
            avatar: tile('layers', 26),
            title: item.name,
            pill: `${pill(item.status, STATUS[item.status] || item.status)}${tag(TAGS[item.tag] || 'tour', item.tag)}`,
            subtitle: [item.destination, `${item.days} days / ${item.nights} nights`].filter(Boolean).join(' · '),
            chips: [{ icon: 'money', text: `From ${money(item.price)} per person` }, { icon: 'briefcase', text: plural(item.bookings, 'booking') }],
          },
          tabs,
          body,
          foot: {
            primary: { label: 'Use as itinerary for an inquiry', icon: 'note', act: 'use-itinerary' },
            quick: [
              { label: 'Edit', icon: 'edit', tone: 'fwd', act: 'edit' },
              { label: 'Pricing', icon: 'chart', tone: 'call', act: 'tab-pricing' },
            ],
          },
        };
      },
      afterDetail: (_el, item) => { ensureDetail(item); },
    });

    host.addEventListener('click', async (e) => {
      const item = page.api.current();
      if (!item) return;
      if (e.target.closest('[data-tp-retry]')) { ensureDetail(item, true); page.api.refresh(); return; }
      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      if (act === 'edit') openEdit(item);
      else if (act === 'tab-pricing') page.api.setTab('pricing');
      else if (act === 'use-itinerary') {
        let d = cache.get(item.id);
        if (!d || d.failed) { await ensureDetail(item, true); d = cache.get(item.id); }
        if (!d || d.failed) { ctx.toast('Could not load this package. Try again.', 'warning'); return; }
        useAsItinerary(d);
      }
    }, { signal: abort.signal });

    return { destroy: () => { abort.abort(); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

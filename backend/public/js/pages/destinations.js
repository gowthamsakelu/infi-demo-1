// Destinations: the places we sell. List on the left, detail on the right (Overview / Packages / Inquiries).
// This is the reference page for the others: describe the data and what goes in each part, and createSplitPage does the rest.
// The Add Destination and Edit buttons are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf, pictureOf } from '../shared/catalog-crud.js';
import { openAddInquiry } from '../shared/add-inquiry.js';
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { card, highlightsCard, overviewCard, heroImage } from './catalog-ui.js';
import { pill, statRow, sectionTitle, detailGrid, rowGroup, linkRow, money, moneyShort, plural } from '../shared/page-ui.js';

const label = (s) => (s === 'active' ? 'Active' : 'Draft');
const stateOf = (region) => String(region || '').split(',')[0].trim();
const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date');
/** A photo when the destination has one, otherwise the map pin. */
const picture = (d, size) => (d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : icon('pin', { size, stroke: 2 }));

/** Add / Edit Destination: the shared catalog wizard, described by config only (see shared/wizard.js). */
function wizardConfig() {
  return {
    noun: 'destination',
    requiredKey: 'name',
    required: ['name', 'region'], // saved only when these are filled in
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The name, the state or region, and whether it is on the website.', fields: [
        { key: 'name', type: 'text', label: 'Destination name', placeholder: 'e.g. Kashmir', optional: false, max: 120 },
        { key: 'region', type: 'text', label: 'State / region', placeholder: 'e.g. Jammu & Kashmir, India', max: 120 },
        { key: 'status', type: 'chips', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] },
        { key: 'popular', type: 'toggle', label: 'Popular destination', hint: 'Shown first on the website' },
      ] },
      { label: 'Trip facts', title: 'Trip facts', sub: 'Shown in the About card of the destination.', fields: [
        { key: 'bestSeason', type: 'text', label: 'Best season', placeholder: 'e.g. Mar - Jun, Dec - Feb', max: 120 },
        { key: 'avgDays', type: 'number', label: 'Average trip (days)', placeholder: '5', half: true, max: 2 },
        { key: 'avgNights', type: 'number', label: 'Average trip (nights)', placeholder: '4', half: true, max: 2 },
        { key: 'idealDuration', type: 'text', label: 'Ideal duration', placeholder: 'e.g. 5 to 7 day trips', max: 120 },
        { key: 'nearestAirport', type: 'text', label: 'Nearest airport', placeholder: 'e.g. Srinagar (SXR)', max: 120 },
        { key: 'howToReach', type: 'textarea', label: 'How to reach', placeholder: 'Flights, trains and roads into the destination', rows: 3, max: 1000 },
      ] },
      { label: 'Overview', title: 'Overview & picture', sub: 'What the destination is, its top places, and a picture for the website.', fields: [
        { key: 'description', type: 'textarea', label: 'Overview', placeholder: 'A few sentences about the destination', rows: 5, max: 2000 },
        { key: 'highlights', type: 'list', label: 'Top places to see', placeholder: 'e.g. Dal Lake and shikara rides', addLabel: 'Add place' },
        { key: 'image', type: 'image', label: 'Image', hint: 'JPG, PNG or WebP · up to 5 MB' },
      ] },
    ],
    defaults: () => ({ name: '', region: '', status: 'draft', popular: false, bestSeason: '', avgDays: '', avgNights: '', idealDuration: '', nearestAirport: '', howToReach: '', description: '', highlights: [], image: [] }),
    preview: (v) => ({ title: String(v.name || '').trim(), lines: [v.region, v.status === 'active' ? 'Active' : 'Draft', v.popular ? 'Popular' : ''] }),
  };
}

export default {
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/destinations/{id}
    const loading = new Set();
    let page = null;

    async function ensureDetail(item) {
      const mine = crud.detail(item.id); // a record added or edited this session wins
      if (mine) { cache.set(item.id, mine); return; }
      if (cache.has(item.id) || loading.has(item.id)) return;
      loading.add(item.id);
      try {
        cache.set(item.id, await getJson(`/api/destinations/${encodeURIComponent(item.id)}`));
      } catch { /* the overview still shows what the list already knows */ }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;
    const packageRow = (p) => linkRow({ ico: 'layers', title: p.name, sub: [p.days ? `${p.days}D` : '', p.nights ? `${p.nights}N` : ''].filter(Boolean).join(' / '), rightSub: p.price ? 'From' : '', right: p.price ? money(p.price) : '' });

    /** "Available here": how many stays, tours and adventures are linked to this destination, each a link to its catalog page. */
    function availableHere(d) {
      const rows = d ? [['bed', 'Hotels & stays', d.stays?.length, 'stays'], ['layers', 'Tours', d.stats?.packages ?? d.packages?.length, 'tour-packages'], ['mountain', 'Adventures', d.activities?.length, 'adventures']].filter((r) => r[2]) : [];
      return rows.length ? `<section>${sectionTitle('Available here')}${rowGroup(rows.map(([ico, title, n, page]) => `<a class="sp-linkrow-a" href="#${page}">${linkRow({ ico, title, right: String(n) })}</a>`))}</section>` : '';
    }

    function overview(item, d) {
      const stats = d?.stats;
      const about = d?.about;
      const year = d?.year ?? new Date().getFullYear();
      return `
        ${heroImage(item.image, item.name)}
        ${statRow([
          { icon: 'layers', label: 'Packages', value: stats ? stats.packages : item.packages, tone: 'blue' },
          { icon: 'note', label: `Inquiries ${year}`, value: stats ? stats.inquiries : item.inquiries, tone: 'green' },
          { icon: 'briefcase', label: `Bookings ${year}`, value: stats ? stats.bookings : '…', tone: 'purple' },
          { icon: 'chart', label: 'Revenue', value: stats ? moneyShort(stats.revenue) : '…', tone: 'amber' },
        ])}
        ${card('pin', 'About this destination', detailGrid([
            ['State / region', item.region || ''], ['Best season', about?.bestSeason ?? ''], ['Average trip length', about?.averageTrip ?? ''],
            ['Ideal duration', about?.idealDuration ?? ''], ['Nearest airport', about?.nearestAirport ?? ''],
            ['Top lead source', about ? about.topLeadSource ?? '' : '…'], ['Peak travel month', about ? about.peakMonth ?? '' : '…'],
          ]))}
        ${overviewCard(d?.description)}
        ${overviewCard(d?.howToReach, 'How to reach')}
        ${highlightsCard(d?.highlights)}
        ${availableHere(d)}
        <section>${sectionTitle('Popular packages')}${d?.packages?.length ? rowGroup(d.packages.slice(0, 3).map(packageRow)) : empty(d ? 'No packages linked yet.' : 'Loading…')}</section>`;
    }

    const crud = createCatalogCrud({
      key: 'destinations',
      endpoint: '/api/destinations',
      wizard: () => wizardConfig(),
      toBody: (v) => ({
        name: v.name.trim(), region: textOrNull(v.region), status: v.status || 'draft', popular: !!v.popular,
        bestSeason: textOrNull(v.bestSeason), avgDays: numOrNull(v.avgDays), avgNights: numOrNull(v.avgNights), idealDuration: textOrNull(v.idealDuration),
        nearestAirport: textOrNull(v.nearestAirport), howToReach: textOrNull(v.howToReach), description: textOrNull(v.description),
        highlights: listOf(v.highlights), image: pictureOf(v.image),
      }),
      local: (v, old) => ({
        ...(old || {}), name: v.name.trim(), region: textOrNull(v.region), status: v.status || 'draft', popular: !!v.popular,
        image: pictureOf(v.image),
        packages: old?.packages ?? 0, inquiries: old?.inquiries ?? 0, description: textOrNull(v.description), highlights: listOf(v.highlights), howToReach: textOrNull(v.howToReach),
        about: { bestSeason: textOrNull(v.bestSeason), averageTrip: numOrNull(v.avgDays) ? `${v.avgDays} days / ${numOrNull(v.avgNights) ?? 0} nights` : null, idealDuration: textOrNull(v.idealDuration), nearestAirport: textOrNull(v.nearestAirport), topLeadSource: old?.about?.topLeadSource ?? null, peakMonth: old?.about?.peakMonth ?? null },
        stats: old?.stats ?? { packages: 0, inquiries: 0, bookings: 0, revenue: 0 }, packages: old?.packages ?? [], stays: old?.stays ?? [], activities: old?.activities ?? [], inquiriesList: old?.inquiriesList ?? [],
      }),
      values: (d) => {
        const m = /(\d+)\s*days?\s*\/\s*(\d+)/.exec(d.about?.averageTrip || '');
        return {
          name: d.name, region: d.region ?? '', status: d.status ?? 'draft', popular: !!d.popular, bestSeason: d.about?.bestSeason ?? '',
          avgDays: m ? m[1] : '', avgNights: m ? m[2] : '', idealDuration: d.about?.idealDuration ?? '', nearestAirport: d.about?.nearestAirport ?? '',
          howToReach: d.howToReach ?? '', description: d.description ?? '', highlights: d.highlights ?? [], image: d.image ? [d.image] : [],
        };
      },
      load: () => getJson('/api/destinations'),
      onChange: (list, { id, added }) => {
        if (id) cache.delete(id);
        page.api.setItems(list);
        if (added && id && document.documentElement.dataset.layout !== 'mobile') ctx.setParams({ selected: id, q: null, tab: null, filter: null }, { push: false });
      },
    });

    async function openEdit(item) {
      await ensureDetail(item);
      crud.edit({ ...item, ...cache.get(item.id) }, { returnFocus: () => host.querySelector('[data-sp-act="edit"]') });
    }

    page = createSplitPage(host, ctx, {
      title: 'Destinations',
      noun: 'destination',
      plural: 'destinations',
      addLabel: 'Add Destination',
      onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }),
      rowMenu: () => [{ key: 'edit', label: 'Edit', icon: 'edit' }, { key: 'view', label: 'View details', icon: 'eye' }],
      onRowMenu: (key, item) => (key === 'edit' ? openEdit(item) : page.api.select(item.id)),
      searchPlaceholder: 'Search destinations...',
      load: () => crud.load(),
      subtitle: (items) => `Destinations • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'active', label: 'Active', test: (i) => i.status === 'active' },
        { key: 'draft', label: 'Draft', test: (i) => i.status === 'draft' },
        { key: 'popular', label: 'Popular', test: (i) => i.popular },
      ],
      filter: {
        allLabel: 'All States',
        options: (items) => [...new Set(items.map((i) => stateOf(i.region)).filter(Boolean))].sort().map((s) => ({ value: s, label: s })),
        test: (i, value) => stateOf(i.region) === value,
      },
      searchText: (i) => `${i.name} ${i.region || ''}`,
      row: (i) => ({
        tile: picture(i, 22),
        thumb: true,
        image: i.image,
        name: i.name,
        pill: `${pill(i.status, label(i.status))}${crud.isFresh(i.id) ? '<span class="just-added-tag">JUST ADDED</span>' : ''}`,
        sub: i.region || '',
        meta: `${plural(i.packages, 'package')}   ${plural(i.inquiries, 'inquiry', 'inquiries')}`,
      }),
      detail: (item, ui) => {
        const d = cache.get(item.id);
        const body = ui.tab === 'packages'
          ? (d?.packages?.length ? rowGroup(d.packages.map(packageRow)) : empty(d ? 'No packages linked yet.' : 'Loading…'))
          : ui.tab === 'inquiries'
            ? (d?.inquiries?.length ? rowGroup(d.inquiries.map((q) => linkRow({ ico: 'message', title: q.name, sub: [q.trip, day(q.travelDate)].filter(Boolean).join(' · '), right: q.status ? q.status[0].toUpperCase() + q.status.slice(1) : '' }))) : empty(d ? 'No inquiries yet.' : 'Loading…'))
            : overview(item, d);
        return {
          head: {
            avatar: picture(item, 26),
            title: item.name,
            pill: pill(item.status, label(item.status)),
            subtitle: item.region || '',
            chips: [{ icon: 'layers', text: plural(item.packages, 'package') }, { icon: 'message', text: plural(item.inquiries, 'inquiry', 'inquiries') }],
          },
          tabs: [
            { key: 'overview', label: 'Overview' },
            { key: 'packages', label: `Packages (${d?.stats?.packages ?? item.packages})` },
            { key: 'inquiries', label: `Inquiries (${item.inquiries})` },
          ],
          body,
          foot: {
            primary: { label: `New inquiry for ${item.name}`, icon: 'plus', act: 'new-inquiry' },
            quick: [
              { label: 'Edit', icon: 'edit', tone: 'fwd', act: 'edit' },
              { label: 'Packages', icon: 'layers', tone: 'msg', act: 'tab-packages' },
              { label: 'Inquiries', icon: 'message', tone: 'call', act: 'tab-inquiries' },
            ],
          },
        };
      },
      afterDetail: (el, item) => { ensureDetail(item); },
    });

    // The footer: "New inquiry for ..." opens the existing Add Inquiry flow with the destination filled in; Edit does nothing yet.
    const onAct = (e) => {
      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      const item = page.api.current();
      if (!act || !item) return;
      if (act === 'new-inquiry') openAddInquiry({ prefill: { dest: item.name }, returnFocus: () => host.querySelector('[data-sp-act="new-inquiry"]'), showRow: () => ctx.navigate('inquiries') });
      else if (act === 'edit') openEdit(item);
      else if (act === 'tab-packages') page.api.setTab('packages');
      else if (act === 'tab-inquiries') page.api.setTab('inquiries');
    };
    host.addEventListener('click', onAct);

    return { destroy: () => { host.removeEventListener('click', onAct); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

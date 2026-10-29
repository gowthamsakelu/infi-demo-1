// Adventures: activities and trails, shared with the itinerary builder's activity search. List on the left, detail on the right
// (Overview / Pricing). Add, Edit and "`Add` to an itinerary" are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf, pictureOf } from '../shared/catalog-crud.js';
import { esc } from '../shared/ui.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, money } from '../shared/page-ui.js';
import { card, optionsOf, place, filled, inclusionsCard, highlightsCard, overviewCard, heroImage } from './catalog-ui.js';

// ADVENTURE is purple, SIGHTSEEING teal, WATER blue, CULTURE yellow, the rest green (the shared tag colours)
const TAG_KIND = { adventure: 'tour', sightseeing: 'activity', water: 'resort', culture: 'villa', food: 'transport', nature: 'transport' };
const MAIN = ['adventure', 'sightseeing', 'water', 'culture'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const duration = (m) => (m == null ? '' : m < 60 ? `${m} min` : m === 60 ? '1 hr' : `${+(m / 60).toFixed(1)} hrs`);

/** About this activity: only the facts the record has. */
function aboutCard(a) {
  const grid = filled([
    ['Duration', duration(a.minutes)], ['Difficulty', a.difficulty || ''], ['Best time', a.bestTime || ''], ['Meeting point', a.meetingPoint || ''],
    ['Min. age', a.minAge || ''], ['Partner', a.partner || ''],
  ]);
  return grid.length ? card('mountain', 'About this activity', detailGrid(grid)) : '';
}

const tierRow = (title, sub, price) => `
  <div class="sp-linkrow">
    <div class="sp-linkrow-text"><b>${esc(title)}</b><small>${esc(sub)}</small></div>
    <div class="sp-linkrow-right"><b>${esc(price != null ? money(price) : '—')}</b></div>
  </div>`;

/** Add / Edit an adventure: the shared catalog wizard, described by config only (see shared/wizard.js). */
const AD_TAGS = [{ value: 'adventure', label: 'Adventure' }, { value: 'sightseeing', label: 'Sightseeing' }, { value: 'water', label: 'Water' }, { value: 'culture', label: 'Culture' }, { value: 'food', label: 'Food' }, { value: 'nature', label: 'Nature' }];
function wizardConfig() {
  return {
    noun: 'adventure',
    requiredKey: 'name',
    required: ['name', 'city', 'price'], // saved only when these are filled in
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The activity, its kind and where it happens.', fields: [
        { key: 'name', type: 'text', label: 'Activity name', placeholder: 'e.g. Gulmarg Gondola', optional: false, max: 120 },
        { key: 'tag', type: 'chips', label: 'Type', options: AD_TAGS },
        { key: 'status', type: 'chips', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { key: 'city', type: 'text', label: 'City', placeholder: 'e.g. Gulmarg', half: true, max: 80 },
        { key: 'region', type: 'text', label: 'Region', placeholder: 'e.g. Jammu & Kashmir', half: true, max: 80 },
      ] },
      { label: 'Details', title: 'Details', sub: 'How long it takes, who can join and when to go.', fields: [
        { key: 'minutes', type: 'number', label: 'Duration (minutes)', placeholder: '180', half: true, max: 5 },
        { key: 'difficulty', type: 'select', label: 'Difficulty', options: [{ value: 'Easy', label: 'Easy' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Hard', label: 'Hard' }], half: true },
        { key: 'bestTime', type: 'text', label: 'Best time', placeholder: 'e.g. Dec - Feb (snow)', max: 120 },
        { key: 'meetingPoint', type: 'text', label: 'Meeting point', placeholder: 'e.g. Gondola base station', max: 160 },
        { key: 'minAge', type: 'text', label: 'Minimum age', placeholder: 'e.g. 3 years', half: true, max: 40 },
        { key: 'partner', type: 'text', label: 'Partner', placeholder: 'e.g. Gulmarg Ropeway Ltd.', half: true, max: 120 },
      ] },
      { label: 'Pricing', title: 'Pricing', sub: 'Rupees per person.', fields: [
        { key: 'price', type: 'price', label: 'Price per adult', placeholder: '1,800', max: 9 },
        { key: 'priceChild', type: 'price', label: 'Price per child', placeholder: '1,250', max: 9 },
        { key: 'priceGroup', type: 'price', label: 'Private group price', placeholder: '9,000', max: 9 },
        { key: 'groupSize', type: 'number', label: 'Private group size (up to)', placeholder: '6', max: 3 },
      ] },
      { label: 'Overview', title: 'Overview', sub: 'What the activity is, what it includes and what it does not.', fields: [
        { key: 'image', type: 'image', label: 'Image', hint: 'JPG, PNG or WebP · up to 5 MB' },
        { key: 'description', type: 'textarea', label: 'Description', placeholder: 'A few sentences about the activity', rows: 4, max: 2000 },
        { key: 'highlights', type: 'list', label: 'Highlights', placeholder: 'e.g. Views over the Pir Panjal', addLabel: 'Add highlight' },
        { key: 'inclusions', type: 'list', label: 'Inclusions', placeholder: 'e.g. Gondola tickets', addLabel: 'Add item' },
        { key: 'exclusions', type: 'list', label: 'Exclusions', placeholder: 'e.g. Transport to Gulmarg', addLabel: 'Add item' },
      ] },
    ],
    defaults: () => ({ image: [], name: '', tag: 'sightseeing', status: 'active', city: '', region: '', minutes: '', difficulty: '', bestTime: '', meetingPoint: '', minAge: '', partner: '', price: '', priceChild: '', priceGroup: '', groupSize: '', description: '', highlights: [], inclusions: [], exclusions: [] }),
    preview: (v) => ({ title: String(v.name || '').trim(), lines: [v.city, numOrNull(v.minutes) != null ? `${v.minutes} min` : '', numOrNull(v.price) != null ? `₹${Number(v.price).toLocaleString('en-IN')} / person` : ''] }),
  };
}

export default {
  css: true,
  mount(host, ctx) {
    const crud = createCatalogCrud({
      key: 'adventures',
      endpoint: '/api/adventures',
      wizard: () => wizardConfig(),
      toBody: (v) => ({
        name: v.name.trim(), image: pictureOf(v.image), tag: v.tag || 'sightseeing', status: v.status || 'active', city: textOrNull(v.city), region: textOrNull(v.region),
        minutes: numOrNull(v.minutes), difficulty: textOrNull(v.difficulty), bestTime: textOrNull(v.bestTime), meetingPoint: textOrNull(v.meetingPoint),
        minAge: textOrNull(v.minAge), partner: textOrNull(v.partner), price: numOrNull(v.price), priceChild: numOrNull(v.priceChild), priceGroup: numOrNull(v.priceGroup),
        groupSize: numOrNull(v.groupSize), description: textOrNull(v.description), highlights: listOf(v.highlights), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions),
      }),
      local: (v, old) => ({
        ...(old || {}), name: v.name.trim(), image: pictureOf(v.image), tag: v.tag || 'sightseeing', status: v.status || 'active', city: textOrNull(v.city), region: textOrNull(v.region),
        minutes: numOrNull(v.minutes), difficulty: textOrNull(v.difficulty), bestTime: textOrNull(v.bestTime), meetingPoint: textOrNull(v.meetingPoint),
        minAge: textOrNull(v.minAge), partner: textOrNull(v.partner), price: numOrNull(v.price), priceChild: numOrNull(v.priceChild), priceGroup: numOrNull(v.priceGroup),
        groupSize: numOrNull(v.groupSize), description: textOrNull(v.description), highlights: listOf(v.highlights), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions),
        bookings: old?.bookings ?? 0, rating: old?.rating ?? null, reviews: old?.reviews ?? 0,
      }),
      values: (a) => ({
        image: a.image ? [a.image] : [], name: a.name, tag: a.tag || 'sightseeing', status: a.status || 'active', city: a.city ?? '', region: a.region ?? '', minutes: a.minutes ?? '',
        difficulty: a.difficulty ?? '', bestTime: a.bestTime ?? '', meetingPoint: a.meetingPoint ?? '', minAge: a.minAge ?? '', partner: a.partner ?? '',
        price: a.price ?? '', priceChild: a.priceChild ?? '', priceGroup: a.priceGroup ?? '', groupSize: a.groupSize ?? '', description: a.description ?? '',
        highlights: a.highlights || [], inclusions: a.inclusions || [], exclusions: a.exclusions || [],
      }),
      load: () => getJson('/api/adventures'),
      onChange: (list, { id, added }) => {
        page.api.setItems(list);
        if (added && id && document.documentElement.dataset.layout !== 'mobile') ctx.setParams({ selected: id, q: null, tab: null, filter: null }, { push: false });
      },
    });

    const page = createSplitPage(host, ctx, {
      title: 'Adventures',
      noun: 'adventure',
      plural: 'adventures',
      addLabel: 'Add Adventure',
      onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }),
      rowMenu: () => [{ key: 'edit', label: 'Edit', icon: 'edit' }, { key: 'view', label: 'View details', icon: 'eye' }],
      onRowMenu: (key, item) => (key === 'edit' ? crud.edit(item) : page.api.select(item.id)),
      searchPlaceholder: 'Search activities...',
      load: () => crud.load(),
      subtitle: (items) => `Adventures • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'adventure', label: 'Adventure', test: (a) => a.tag === 'adventure' },
        { key: 'sightseeing', label: 'Sightseeing', test: (a) => a.tag === 'sightseeing' },
        { key: 'water', label: 'Water', test: (a) => a.tag === 'water' },
        { key: 'culture', label: 'Culture', test: (a) => a.tag === 'culture' },
        { key: 'other', label: 'Other', test: (a) => !MAIN.includes(a.tag) },
      ],
      filter: {
        allLabel: 'All Places',
        options: (items) => optionsOf(items, (a) => a.city),
        test: (a, value) => a.city === value,
      },
      searchText: (a) => `${a.name} ${a.city || ''} ${a.region || ''} ${a.tag}`,
      row: (a) => ({
        tile: tile('mountain'),
        thumb: true,
        image: a.image,
        name: a.name,
        pill: `${tag(TAG_KIND[a.tag] || 'activity', a.tag)}${crud.isFresh(a.id) ? '<span class="just-added-tag">JUST ADDED</span>' : ''}`,
        sub: place(a),
        meta: [duration(a.minutes), a.rating != null ? `★ ${a.rating}` : '', a.price != null ? `${money(a.price)} / person` : ''].filter(Boolean).join('   '),
      }),
      detail: (a, ui) => {
        const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'pricing', label: 'Pricing' }];
        const tiers = `<section>${sectionTitle('Pricing tiers', '<span class="sp-hint">Edit per trip when negotiating</span>')}${rowGroup([
          tierRow('Adult', '12 years and above', a.price),
          tierRow('Child', '3 to 11 years', a.priceChild),
          tierRow(`Private group${a.groupSize ? ` (up to ${a.groupSize})` : ''}`, 'Priority booking, fixed price', a.priceGroup),
        ])}</section>`;
        const body = ui.tab === 'pricing' ? tiers : `
          ${heroImage(a.image, a.name)}
          ${statRow([
            { icon: 'chart', label: 'Price per person', value: a.price != null ? money(a.price) : '—', tone: 'blue' },
            { icon: 'briefcase', label: 'Bookings', value: a.bookings, tone: 'green' },
            { icon: 'star', label: 'Rating', value: a.rating != null ? a.rating : '—', tone: 'amber' },
          ])}
          ${aboutCard(a)}
          ${overviewCard(a.description)}
          ${highlightsCard(a.highlights)}
          ${inclusionsCard(a.inclusions, a.exclusions)}`;
        return {
          head: {
            avatar: tile('mountain', 26),
            title: a.name,
            pill: `${pill(a.status, a.status === 'active' ? 'Active' : 'Inactive')}${tag(TAG_KIND[a.tag] || 'activity', cap(a.tag))}`,
            subtitle: place(a),
            chips: [a.minutes != null ? { icon: 'time', text: duration(a.minutes) } : null, a.rating != null ? { icon: 'star', text: `${a.rating}${a.reviews ? ` (${a.reviews})` : ''}` } : null, a.price != null ? { icon: 'money', text: `${money(a.price)} / person` } : null].filter(Boolean),
          },
          tabs,
          body,
          foot: {
            primary: { label: 'Add to an itinerary', icon: 'plus', act: 'add-to-itinerary' },
            quick: [{ label: 'Edit', icon: 'edit', tone: 'fwd', act: 'edit' }, { label: 'Pricing', icon: 'chart', tone: 'call', act: 'tab-pricing' }],
          },
        };
      },
    });

    const onAct = (e) => {
      if (e.target.closest('[data-sp-act="tab-pricing"]')) page.api.setTab('pricing');
      if (e.target.closest('[data-sp-act="edit"]') && page.api.current()) crud.edit(page.api.current(), { returnFocus: () => host.querySelector('[data-sp-act="edit"]') });
    };
    host.addEventListener('click', onAct);
    return { destroy: () => { host.removeEventListener('click', onAct); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

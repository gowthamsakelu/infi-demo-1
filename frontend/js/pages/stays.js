// Stays: hotels, villas and resorts, shared with the itinerary builder's hotel search. List on the left, detail on the right
// (Overview / Rooms & Rates; the meal plans sit under the rooms). Add room type and Edit are drawn as designed and do nothing yet; Call opens the phone's dialler.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf, pictureOf } from '../shared/catalog-crud.js';
import { esc, errorState } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, linkRow, chip, money, moneyShort, plural } from '../shared/page-ui.js';
import { card, optionsOf, place, filled, inclusionsCard, bulletCard, overviewCard, heroImage } from './catalog-ui.js';

// HOTEL is blue, VILLA yellow, RESORT teal (the shared tag colours)
const TAG_KIND = { hotel: 'resort', villa: 'villa', resort: 'activity', pg: 'villa', rent: 'villa' };
const TAG_LABEL = { hotel: 'Hotel', villa: 'Villa', resort: 'Resort', pg: 'PG', rent: 'Rental' };
const PLANS = [['stay', 'Only stay'], ['breakfast', '+ Breakfast'], ['map', '+ Breakfast & Dinner'], ['all', 'All meals']];
const rating = (s) => (s.rating != null ? `★ ${s.rating}` : '');

/** Add / Edit a stay: the shared catalog wizard, described by config only (see shared/wizard.js). */
const STAY_TAGS = [{ value: 'hotel', label: 'Hotel' }, { value: 'villa', label: 'Villa' }, { value: 'resort', label: 'Resort' }];
function wizardConfig() {
  return {
    noun: 'stay',
    requiredKey: 'name',
    required: ['name', 'city', 'price'], // saved only when these are filled in
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The name, the kind of stay and where it is.', fields: [
        { key: 'name', type: 'text', label: 'Stay name', placeholder: 'e.g. Hotel Lake View', optional: false, max: 120 },
        { key: 'tag', type: 'chips', label: 'Type', options: STAY_TAGS },
        { key: 'status', type: 'chips', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { key: 'city', type: 'text', label: 'City', placeholder: 'e.g. Srinagar', half: true, max: 80 },
        { key: 'region', type: 'text', label: 'Region', placeholder: 'e.g. Jammu & Kashmir', half: true, max: 80 },
        { key: 'address', type: 'text', label: 'Address', placeholder: 'Street and area', max: 200 },
        { key: 'phone', type: 'text', label: 'Phone', placeholder: '+91 98765 43210', half: true, max: 30 },
        { key: 'email', type: 'text', label: 'Email', placeholder: 'stay@example.com', half: true, max: 160 },
      ] },
      { label: 'Price & rooms', title: 'Price & rooms', sub: 'The starting rate per room per night, and how many rooms.', fields: [
        { key: 'price', type: 'price', label: 'Price per night from', placeholder: '4,200', max: 9 },
        { key: 'roomsCount', type: 'number', label: 'Number of rooms', placeholder: '24', max: 3 },
        { key: 'priceNote', type: 'text', label: 'Price note', placeholder: 'e.g. Price may vary, please confirm before booking', max: 255 },
      ] },
      { label: 'Details', title: 'Details', sub: 'What the stay is like, and what is and is not included.', fields: [
        { key: 'image', type: 'image', label: 'Image', hint: 'JPG, PNG or WebP · up to 5 MB' },
        { key: 'description', type: 'textarea', label: 'About the stay', placeholder: 'A few sentences about the stay', rows: 4, max: 2000 },
        { key: 'amenities', type: 'list', label: 'Amenities', placeholder: 'e.g. Wi-Fi', addLabel: 'Add amenity' },
        { key: 'inclusions', type: 'list', label: 'Included', placeholder: 'e.g. Breakfast', addLabel: 'Add item' },
        { key: 'exclusions', type: 'list', label: 'Not included', placeholder: 'e.g. Lunch and dinner', addLabel: 'Add item' },
        { key: 'extraCharges', type: 'list', label: 'Extra charges', placeholder: 'e.g. Extra mattress: ₹800 per night', addLabel: 'Add charge' },
      ] },
    ],
    defaults: () => ({ image: [], name: '', tag: 'hotel', status: 'active', city: '', region: '', address: '', phone: '', email: '', price: '', roomsCount: '', priceNote: '', description: '', amenities: [], inclusions: [], exclusions: [], extraCharges: [] }),
    preview: (v) => ({ title: String(v.name || '').trim(), lines: [v.city, numOrNull(v.price) != null ? `From ₹${Number(v.price).toLocaleString('en-IN')} / night` : 'No price yet', v.status === 'inactive' ? 'Inactive' : 'Active'] }),
  };
}

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/stays/{id}, or { failed: true }
    const loading = new Set();
    const abort = new AbortController();
    let page = null;

    async function ensureDetail(item, force = false) {
      const mine = crud.detail(item.id); // a record added or edited this session wins
      if (mine) { cache.set(item.id, mine); return; }
      if (!force && (cache.has(item.id) || loading.has(item.id))) return;
      cache.delete(item.id);
      loading.add(item.id);
      try {
        cache.set(item.id, await getJson(`/api/stays/${encodeURIComponent(item.id)}`));
      } catch (error) {
        cache.set(item.id, { failed: true, error });
      }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;
    const pending = (d, what) => (d?.failed ? errorState({ title: `Could not load ${what}`, error: d.error, what, retryAttr: 'data-st-retry' }) : '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i></div>');

    function roomCard(r) {
      return `<div class="st-room">
        <div class="st-room-head"><b>${esc(r.name)}</b><small>${esc(r.occupancy || '')}</small></div>
        <div class="st-rates">${PLANS.map(([k, label]) => `<div><small>${esc(label)}</small><b>${r.rates[k] != null ? esc(money(r.rates[k])) : '—'}</b></div>`).join('')}</div>
      </div>`;
    }

    function overview(item, d) {
      const ready = d && !d.failed;
      return `
        ${heroImage(item.image, item.name)}
        ${statRow([
          { icon: 'briefcase', label: 'Bookings', value: item.bookings, tone: 'blue' },
          { icon: 'bed', label: 'Room types', value: ready ? d.rooms.length : '…', tone: 'green' },
          { icon: 'chart', label: 'Revenue', value: ready ? moneyShort(d.revenue) : '…', tone: 'amber' },
        ])}
        ${about(item, d)}
        ${ready ? overviewCard(d.description) : ''}
        ${ready && d.priceNote ? `<p class="st-note">${icon('info', { size: 16 })}<span>${esc(d.priceNote)}</span></p>` : ''}
        ${card('phone', 'Contact', detailGrid([
          ['Phone', ready ? d.phone || '' : '…'], ['Email', ready ? d.email || '' : '…'],
          ['City', item.city || ''], ['Address', ready ? d.address || '' : '…'],
        ]))}
        ${ready && d.amenities.length ? `<div class="sp-chips scroll-row"><span class="sp-chips-label">Amenities</span>${d.amenities.map(chip).join('')}</div>` : ''}
        ${ready ? inclusionsCard(d.inclusions, d.exclusions) : ''}
        ${ready ? bulletCard('chart', 'Extra charges', d.extraCharges) : ''}`;
    }

    /** About this stay: type, location with a map link, description and the price note. Only what the record has. */
    function about(item, d) {
      const ready = d && !d.failed;
      const where = [ready ? d.address : '', place(item)].filter(Boolean).join(', ');
      const map = where ? `<a class="bld-link st-map" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name}, ${where}`)}" target="_blank" rel="noopener">Show on map</a>` : '';
      const grid = filled([['Type', TAG_LABEL[item.tag] || item.tag || '']]);
      const parts = [
        grid.length ? detailGrid(grid) : '',
        where ? `<p class="st-where">${icon('pin', { size: 14 })}<span>${esc(where)}</span>${map}</p>` : '',
      ].filter(Boolean).join('');
      return parts ? card('bed', 'About this stay', parts) : '';
    }

    const crud = createCatalogCrud({
      key: 'stays',
      endpoint: '/api/stays',
      wizard: () => wizardConfig(),
      toBody: (v) => ({
        name: v.name.trim(), image: pictureOf(v.image), tag: v.tag || 'hotel', status: v.status || 'active', city: textOrNull(v.city), region: textOrNull(v.region), address: textOrNull(v.address),
        phone: textOrNull(v.phone), email: textOrNull(v.email), price: numOrNull(v.price), roomsCount: numOrNull(v.roomsCount), priceNote: textOrNull(v.priceNote),
        description: textOrNull(v.description), amenities: listOf(v.amenities), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions), extraCharges: listOf(v.extraCharges),
      }),
      local: (v, old) => ({
        ...(old || {}), name: v.name.trim(), image: pictureOf(v.image), tag: v.tag || 'hotel', status: v.status || 'active', city: textOrNull(v.city), region: textOrNull(v.region),
        price: numOrNull(v.price), roomsCount: numOrNull(v.roomsCount), bookings: old?.bookings ?? 0, rating: old?.rating ?? null, reviews: old?.reviews ?? 0,
        address: textOrNull(v.address), phone: textOrNull(v.phone), email: textOrNull(v.email), description: textOrNull(v.description),
        amenities: listOf(v.amenities), inclusions: listOf(v.inclusions), exclusions: listOf(v.exclusions), extraCharges: listOf(v.extraCharges),
        priceNote: textOrNull(v.priceNote), revenue: old?.revenue ?? 0, rooms: old?.rooms ?? [],
      }),
      values: (d) => ({
        image: d.image ? [d.image] : [], name: d.name, tag: d.tag || 'hotel', status: d.status || 'active', city: d.city ?? '', region: d.region ?? '', address: d.address ?? '', phone: d.phone ?? '',
        email: d.email ?? '', price: d.price ?? '', roomsCount: d.roomsCount ?? '', priceNote: d.priceNote ?? '', description: d.description ?? '',
        amenities: d.amenities || [], inclusions: d.inclusions || [], exclusions: d.exclusions || [], extraCharges: d.extraCharges || [],
      }),
      load: () => getJson('/api/stays'),
      onChange: (list, { id, added }) => {
        if (id) cache.delete(id);
        page.api.setItems(list);
        if (added && id && document.documentElement.dataset.layout !== 'mobile') ctx.setParams({ selected: id, q: null, tab: null, filter: null }, { push: false });
      },
    });

    async function openEdit(item) {
      await ensureDetail(item, false);
      crud.edit({ ...item, ...cache.get(item.id) }, { returnFocus: () => host.querySelector('[data-sp-act="edit"]') });
    }

    page = createSplitPage(host, ctx, {
      title: 'Stays',
      noun: 'stay',
      plural: 'stays',
      addLabel: 'Add Stay',
      onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }),
      rowMenu: () => [{ key: 'edit', label: 'Edit', icon: 'edit' }, { key: 'view', label: 'View details', icon: 'eye' }],
      onRowMenu: (key, item) => (key === 'edit' ? openEdit(item) : page.api.select(item.id)),
      searchPlaceholder: 'Search stays...',
      load: () => crud.load(),
      subtitle: (items) => `Stays • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'hotels', label: 'Hotels', test: (s) => s.tag === 'hotel' },
        { key: 'villas', label: 'Villas', test: (s) => s.tag === 'villa' },
        { key: 'resorts', label: 'Resorts', test: (s) => s.tag === 'resort' },
        { key: 'pg', label: 'PG', test: (s) => s.tag === 'pg' },
      ],
      filter: {
        allLabel: 'All Cities',
        options: (items) => optionsOf(items, (s) => s.city),
        test: (s, value) => s.city === value,
      },
      searchText: (s) => `${s.name} ${s.city || ''} ${s.region || ''} ${TAG_LABEL[s.tag] || ''}`,
      row: (s) => ({
        tile: tile('bed'),
        thumb: true,
        image: s.image,
        name: s.name,
        pill: `${tag(TAG_KIND[s.tag] || 'resort', TAG_LABEL[s.tag] || s.tag)}${crud.isFresh(s.id) ? '<span class="just-added-tag">JUST ADDED</span>' : ''}`,
        sub: place(s),
        meta: [rating(s), s.roomsCount ? plural(s.roomsCount, 'room') : '', s.price ? `${money(s.price)} / night` : ''].filter(Boolean).join('   '),
      }),
      detail: (item, ui) => {
        const d = cache.get(item.id);
        const ready = d && !d.failed;
        const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'rooms', label: 'Rooms & Rates' }];
        let body;
        if (ui.tab === 'rooms') {
          const plans = ready && d.rooms.length
            ? `<section>${sectionTitle('Meal plans', '<span class="sp-hint">Starting rate per room per night</span>')}${rowGroup(PLANS.map(([k, label]) => linkRow({ ico: 'utensils', title: label, right: money(Math.min(...d.rooms.map((r) => r.rates[k]).filter((x) => x != null))), rightSub: 'From' })))}</section>`
            : '';
          body = ready ? (d.rooms.length
            ? `${d.rooms.map(roomCard).join('')}<p class="st-note">${icon('info', { size: 16 })}<span>Rates are per room per night. When an agent adds this hotel in the itinerary builder, these rates fill in automatically and can be edited per trip.</span></p>${plans}`
            : empty('No rooms and rates yet.')) : pending(d, 'the rooms');
        } else body = overview(item, d);
        return {
          head: {
            avatar: tile('bed', 26),
            title: item.name,
            pill: `${pill(item.status, item.status === 'active' ? 'Active' : 'Inactive')}${tag(TAG_KIND[item.tag] || 'resort', TAG_LABEL[item.tag] || item.tag)}`,
            subtitle: place(item),
            chips: [item.rating != null ? { icon: 'star', text: `${item.rating} (${item.reviews} reviews)` } : null, item.roomsCount ? { icon: 'bed', text: plural(item.roomsCount, 'room') } : null, item.price ? { icon: 'money', text: `${money(item.price)} / night` } : null].filter(Boolean),
          },
          tabs,
          body,
          foot: {
            primary: { label: 'Add room type', icon: 'plus', act: 'add-room' },
            quick: [{ label: 'Edit', icon: 'edit', tone: 'fwd', act: 'edit' }, { label: 'Call', icon: 'phone', tone: 'call', act: 'call' }],
          },
        };
      },
      afterDetail: (_el, item) => { ensureDetail(item); },
    });

    host.addEventListener('click', (e) => {
      const item = page.api.current();
      if (!item) return;
      if (e.target.closest('[data-st-retry]')) { ensureDetail(item, true); page.api.refresh(); return; }
      if (e.target.closest('[data-sp-act="edit"]')) { openEdit(item); return; }
      if (e.target.closest('[data-sp-act="call"]')) {
        const phone = cache.get(item.id)?.phone;
        if (phone) window.location.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
        else ctx.toast('No phone number saved for this stay.', 'info');
      }
    }, { signal: abort.signal });

    return { destroy: () => { abort.abort(); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

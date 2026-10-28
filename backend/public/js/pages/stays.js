// Stays: hotels, villas and resorts, shared with the itinerary builder's hotel search. List on the left, detail on the right
// (Overview / Rooms & Rates; the meal plans sit under the rooms). Add room type and Edit are drawn as designed and do nothing yet; Call opens the phone's dialler.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { esc, errorState } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, linkRow, chip, money, moneyShort, plural } from '../shared/page-ui.js';
import { card, optionsOf, place, filled, inclusionsCard, bulletCard } from './catalog-ui.js';

// HOTEL is blue, VILLA yellow, RESORT teal (the shared tag colours)
const TAG_KIND = { hotel: 'resort', villa: 'villa', resort: 'activity' };
const TAG_LABEL = { hotel: 'Hotel', villa: 'Villa', resort: 'Resort' };
const PLANS = [['stay', 'Only stay'], ['breakfast', '+ Breakfast'], ['map', '+ Breakfast & Dinner'], ['all', 'All meals']];
const rating = (s) => (s.rating != null ? `★ ${s.rating}` : '');

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/stays/{id}, or { failed: true }
    const loading = new Set();
    const abort = new AbortController();
    let page = null;

    async function ensureDetail(item, force = false) {
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
        ${statRow([
          { icon: 'briefcase', label: 'Bookings', value: item.bookings, tone: 'blue' },
          { icon: 'bed', label: 'Room types', value: ready ? d.rooms.length : '…', tone: 'green' },
          { icon: 'chart', label: 'Revenue', value: ready ? moneyShort(d.revenue) : '…', tone: 'amber' },
        ])}
        ${about(item, d)}
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
        ready && d.description ? `<p class="st-about">${esc(d.description)}</p>` : '',
        ready && d.priceNote ? `<p class="st-note">${icon('info', { size: 16 })}<span>${esc(d.priceNote)}</span></p>` : '',
      ].filter(Boolean).join('');
      return parts ? card('bed', 'About this stay', parts) : '';
    }

    page = createSplitPage(host, ctx, {
      title: 'Stays',
      noun: 'stay',
      plural: 'stays',
      addLabel: 'Add Stay',
      searchPlaceholder: 'Search stays...',
      load: () => getJson('/api/stays'),
      subtitle: (items) => `Stays • ${items.length} Total`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'hotels', label: 'Hotels', test: (s) => s.tag === 'hotel' },
        { key: 'villas', label: 'Villas', test: (s) => s.tag === 'villa' },
        { key: 'resorts', label: 'Resorts', test: (s) => s.tag === 'resort' },
      ],
      filter: {
        allLabel: 'All Cities',
        options: (items) => optionsOf(items, (s) => s.city),
        test: (s, value) => s.city === value,
      },
      searchText: (s) => `${s.name} ${s.city || ''} ${s.region || ''} ${TAG_LABEL[s.tag] || ''}`,
      row: (s) => ({
        tile: tile('bed'),
        name: s.name,
        pill: tag(TAG_KIND[s.tag] || 'resort', TAG_LABEL[s.tag] || s.tag),
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
      if (e.target.closest('[data-sp-act="call"]')) {
        const phone = cache.get(item.id)?.phone;
        if (phone) window.location.href = `tel:${phone.replace(/[^+\d]/g, '')}`;
        else ctx.toast('No phone number saved for this stay.', 'info');
      }
    }, { signal: abort.signal });

    return { destroy: () => { abort.abort(); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

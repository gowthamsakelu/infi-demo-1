// Stays: hotels, villas and resorts, shared with the itinerary builder's hotel search. List on the left, detail on the right
// (Overview / Rooms & Rates / Meal plans). Add room type and Edit are drawn as designed and do nothing yet; Call opens the phone's dialler.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, linkRow, chip, money, moneyShort, plural } from '../shared/page-ui.js';
import { card, optionsOf, place } from './catalog-ui.js';

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
      } catch {
        cache.set(item.id, { failed: true });
      }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;
    const pending = (d, what) => (d?.failed ? `<p class="sp-none">Could not load ${what}. <button type="button" class="bld-link" data-st-retry>Try again</button></p>` : empty('Loading…'));

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
        ${card('phone', 'Contact', detailGrid([
          ['Phone', ready ? d.phone || '' : '…'], ['Email', ready ? d.email || '' : '…'],
          ['City', item.city || ''], ['Address', ready ? d.address || '' : '…'],
        ]))}
        ${ready && d.description ? `<p class="st-about">${esc(d.description)}</p>` : ''}
        ${ready && d.amenities.length ? `<div class="sp-chips"><span class="sp-chips-label">Amenities</span>${d.amenities.map(chip).join('')}</div>` : ''}`;
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
        const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'rooms', label: 'Rooms & Rates' }, { key: 'plans', label: 'Meal plans' }];
        let body;
        if (ui.tab === 'rooms') {
          body = ready ? (d.rooms.length
            ? `${d.rooms.map(roomCard).join('')}<p class="st-note">${icon('info', { size: 16 })}<span>Rates are per room per night. When an agent adds this hotel in the itinerary builder, these rates fill in automatically and can be edited per trip.</span></p>`
            : empty('No rooms and rates yet.')) : pending(d, 'the rooms');
        } else if (ui.tab === 'plans') {
          body = ready ? (d.rooms.length
            ? `<section>${sectionTitle('Starting rate per room per night')}${rowGroup(PLANS.map(([k, label]) => linkRow({ ico: 'utensils', title: label, right: money(Math.min(...d.rooms.map((r) => r.rates[k]).filter((x) => x != null))), rightSub: 'From' })))}</section>`
            : empty('No meal plan rates yet.')) : pending(d, 'the meal plans');
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

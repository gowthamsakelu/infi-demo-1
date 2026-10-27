// Adventures: activities and trails, shared with the itinerary builder's activity search. List on the left, detail on the right
// (Overview / Pricing). Add, Edit and "Add to an itinerary" are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { esc } from '../shared/ui.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, money } from '../shared/page-ui.js';
import { card, optionsOf, place } from './catalog-ui.js';

// ADVENTURE is purple, SIGHTSEEING teal, WATER blue, CULTURE yellow, the rest green (the shared tag colours)
const TAG_KIND = { adventure: 'tour', sightseeing: 'activity', water: 'resort', culture: 'villa', food: 'transport', nature: 'transport' };
const MAIN = ['adventure', 'sightseeing', 'water', 'culture'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const duration = (m) => (m == null ? '' : m < 60 ? `${m} min` : m === 60 ? '1 hr' : `${+(m / 60).toFixed(1)} hrs`);

const tierRow = (title, sub, price) => `
  <div class="sp-linkrow">
    <div class="sp-linkrow-text"><b>${esc(title)}</b><small>${esc(sub)}</small></div>
    <div class="sp-linkrow-right"><b>${esc(price != null ? money(price) : '—')}</b></div>
  </div>`;

export default {
  css: true,
  mount(host, ctx) {
    const page = createSplitPage(host, ctx, {
      title: 'Adventures',
      noun: 'adventure',
      plural: 'adventures',
      addLabel: 'Add Adventure',
      searchPlaceholder: 'Search activities...',
      load: () => getJson('/api/adventures'),
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
        name: a.name,
        pill: tag(TAG_KIND[a.tag] || 'activity', a.tag),
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
          ${statRow([
            { icon: 'chart', label: 'Price per person', value: a.price != null ? money(a.price) : '—', tone: 'blue' },
            { icon: 'briefcase', label: 'Bookings', value: a.bookings, tone: 'green' },
            { icon: 'star', label: 'Rating', value: a.rating != null ? a.rating : '—', tone: 'amber' },
          ])}
          ${card('mountain', 'Details', `${detailGrid([
            ['Duration', duration(a.minutes)], ['Difficulty', a.difficulty || ''], ['Best time', a.bestTime || ''], ['Meeting point', a.meetingPoint || ''],
            ['Min. age', a.minAge || ''], ['Partner', a.partner || ''],
          ])}${a.description ? `<p class="ad-about">${esc(a.description)}</p>` : ''}`)}
          ${tiers}`;
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

    const onAct = (e) => { if (e.target.closest('[data-sp-act="tab-pricing"]')) page.api.setTab('pricing'); };
    host.addEventListener('click', onAct);
    return { destroy: () => { host.removeEventListener('click', onAct); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

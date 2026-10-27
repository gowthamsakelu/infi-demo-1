// Tour Packages: the trips we sell. List on the left, detail on the right (Overview / Itinerary / Pricing / Inclusions / Inquiries).
// Same shape as destinations.js. The Add and Edit buttons are drawn as designed and do nothing yet; "Use as itinerary for an inquiry"
// opens the itinerary builder prefilled with this package (see tour-packages-builder.js).
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { itemIconHtml, itemPills } from '../shared/itinerary.js';
import { pill, tag, tile, statRow, sectionTitle, detailGrid, rowGroup, linkRow, money, plural } from '../shared/page-ui.js';
import { card, optionsOf } from './catalog-ui.js';
import { useAsItinerary } from './tour-packages-builder.js';

const TAGS = { tour: 'tour', villa: 'villa', activity: 'activity' };
const TYPE = { tour: 'Tour', villa: 'Villa stay', activity: 'Activity trip' };
const STATUS = { published: 'Published', draft: 'Draft' };
const trip = (p) => `${p.days}D / ${p.nights}N`;
const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date');

/** "11:30 AM • Private cab": the time gets its own weight, as in the Day-wise Schedule. */
function subtitle(item) {
  const sub = item.subtitle || '';
  return item.time && sub.startsWith(item.time) ? `<span class="item-time">${esc(item.time)}</span>${esc(sub.slice(item.time.length))}` : esc(sub);
}

/** The Day-wise Schedule look (narrow day column, line and dot, wide cards) without its edit controls. */
function timeline(days) {
  if (!days.length) return '<div class="state-box"><h4>No itinerary yet</h4><p>This package has no days planned.</p></div>';
  return `<div class="itinerary-v2-container tp-timeline">${days.map((d) => `
    <div class="itinerary-day-section">
      <div class="timeline-day-col"><div class="day-head"><span class="day-badge-text">${esc(d.day)}</span></div></div>
      <div class="timeline-track-col"><div class="timeline-line-track"></div><div class="timeline-dot-node"></div></div>
      <div class="timeline-items-col">
        ${d.title ? `<p class="tp-day-title">${esc(d.title)}</p>` : ''}
        ${(d.items || []).map((it) => `
          <div class="itinerary-card-item">
            <div class="item-left-content">${itemIconHtml(it, 22)}
              <div class="item-text-info"><h4 class="item-text-title">${esc(it.title)}</h4><p class="item-text-sub">${subtitle(it)}</p>${itemPills(it) ? `<div class="item-badges">${itemPills(it)}</div>` : ''}</div>
            </div>
          </div>`).join('') || '<p class="day-empty">No events yet</p>'}
      </div>
    </div>`).join('')}</div>`;
}

const checks = (list, ico) => (list.length
  ? `<ul class="tp-list">${list.map((t) => `<li><span class="tp-list-ico ${ico}">${icon(ico === 'no' ? 'close' : 'check', { size: 14, stroke: 3 })}</span><span>${esc(t)}</span></li>`).join('')}</ul>`
  : '<p class="sp-none">Nothing listed.</p>');

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/tour-packages/{id}, or { failed: true }
    const loading = new Set();
    const abort = new AbortController();
    let page = null;

    async function ensureDetail(item, force = false) {
      if (!force && (cache.has(item.id) || loading.has(item.id))) return;
      cache.delete(item.id);
      loading.add(item.id);
      try {
        cache.set(item.id, await getJson(`/api/tour-packages/${encodeURIComponent(item.id)}`));
      } catch {
        cache.set(item.id, { failed: true });
      }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;
    const pending = (d, what) => (d?.failed ? `<p class="sp-none">Could not load ${what}. <button type="button" class="bld-link" data-tp-retry>Try again</button></p>` : empty('Loading…'));

    function overview(item, d) {
      const ready = d && !d.failed;
      return `
        ${statRow([
          { icon: 'chart', label: 'From (per person)', value: money(item.price), tone: 'blue' },
          { icon: 'calendar', label: 'Duration', value: trip(item), tone: 'green' },
          { icon: 'briefcase', label: 'Bookings', value: item.bookings, tone: 'purple' },
          { icon: 'note', label: 'Inquiries', value: ready ? d.inquiries.length : '…', tone: 'amber' },
        ])}
        ${card('layers', 'About this package', `${detailGrid([
          ['Destination', item.destination || ''], ['Duration', `${plural(item.days, 'day')} / ${plural(item.nights, 'night')}`],
          ['Type', TYPE[item.tag] || ''], ['Season', item.seasonal ? 'Seasonal' : 'All year'],
        ])}${ready && d.description ? `<p class="tp-about">${esc(d.description)}</p>` : ''}`)}`;
    }

    page = createSplitPage(host, ctx, {
      title: 'Tour Packages',
      noun: 'package',
      plural: 'packages',
      addLabel: 'Add Package',
      searchPlaceholder: 'Search packages...',
      load: () => getJson('/api/tour-packages'),
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
        name: i.name,
        pill: pill(i.status, STATUS[i.status] || i.status),
        sub: [i.destination, trip(i)].filter(Boolean).join(' · '),
        meta: `${money(i.price)}   ${plural(i.bookings, 'booking')}`,
      }),
      detail: (item, ui) => {
        const d = cache.get(item.id);
        const ready = d && !d.failed;
        const tabs = [
          { key: 'overview', label: 'Overview' },
          { key: 'itinerary', label: 'Itinerary' },
          { key: 'pricing', label: 'Pricing' },
          { key: 'inclusions', label: 'Inclusions' },
          { key: 'inquiries', label: `Inquiries${ready ? ` (${d.inquiries.length})` : ''}` },
        ];
        let body;
        if (ui.tab === 'itinerary') body = ready ? card('calendar', 'Day-wise Schedule', timeline(d.itinerary)) : pending(d, 'the itinerary');
        else if (ui.tab === 'pricing') body = ready ? (d.priceTiers.length ? `<section>${sectionTitle('Price per person', '<span class="sp-hint">By group size</span>')}${rowGroup(d.priceTiers.map((t) => linkRow({ ico: 'users', title: t.label, sub: t.note, right: money(t.price) })))}</section>` : empty('No price tiers yet.')) : pending(d, 'the pricing');
        else if (ui.tab === 'inclusions') body = ready ? `${card('check', 'Included', checks(d.inclusions, 'check'))}${card('close', 'Not included', checks(d.exclusions, 'no'))}` : pending(d, 'the inclusions');
        else if (ui.tab === 'inquiries') body = ready ? (d.inquiries.length ? rowGroup(d.inquiries.map((q) => linkRow({ ico: 'message', title: q.name, sub: [q.trip, day(q.travelDate)].filter(Boolean).join(' · '), right: q.status ? q.status[0].toUpperCase() + q.status.slice(1) : '' }))) : empty('No inquiries yet.')) : pending(d, 'the inquiries');
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
              { label: 'Itinerary', icon: 'calendar', tone: 'msg', act: 'tab-itinerary' },
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
      if (act === 'tab-itinerary') page.api.setTab('itinerary');
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

// Destinations: the places we sell. List on the left, detail on the right (Overview / Packages / Inquiries).
// This is the reference page for the others: describe the data and what goes in each part, and createSplitPage does the rest.
// The Add Destination and Edit buttons are drawn as designed and do nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { openAddInquiry } from '../shared/add-inquiry.js';
import { esc } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, statRow, sectionTitle, detailGrid, rowGroup, linkRow, money, moneyShort, plural } from '../shared/page-ui.js';

const label = (s) => (s === 'active' ? 'Active' : 'Draft');
const stateOf = (region) => String(region || '').split(',')[0].trim();
const day = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date');
/** A photo when the destination has one, otherwise the map pin. */
const picture = (d, size) => (d.image ? `<img src="${esc(d.image)}" alt="" loading="lazy">` : icon('pin', { size, stroke: 2 }));

export default {
  mount(host, ctx) {
    const cache = new Map(); // id -> detail from /api/destinations/{id}
    const loading = new Set();
    let page = null;

    async function ensureDetail(item) {
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

    function overview(item, d) {
      const stats = d?.stats;
      const about = d?.about;
      const year = d?.year ?? new Date().getFullYear();
      return `
        ${statRow([
          { icon: 'layers', label: 'Packages', value: stats ? stats.packages : item.packages, tone: 'blue' },
          { icon: 'note', label: `Inquiries ${year}`, value: stats ? stats.inquiries : item.inquiries, tone: 'green' },
          { icon: 'briefcase', label: `Bookings ${year}`, value: stats ? stats.bookings : '…', tone: 'purple' },
          { icon: 'chart', label: 'Revenue', value: stats ? moneyShort(stats.revenue) : '…', tone: 'amber' },
        ])}
        <section class="details-section-card">
          <div class="details-section-header"><div class="section-header-left"><div class="section-icon-circle blue-circle">${icon('pin', { size: 16 })}</div><h3>About this destination</h3></div></div>
          ${detailGrid([
            ['Best season', about?.bestSeason ?? ''], ['Average trip length', about?.averageTrip ?? ''],
            ['Ideal duration', about?.idealDuration ?? ''], ['Nearest airport', about?.nearestAirport ?? ''],
            ['Top lead source', about ? about.topLeadSource ?? '' : '…'], ['Peak travel month', about ? about.peakMonth ?? '' : '…'],
          ])}
        </section>
        <section>${sectionTitle('Popular packages')}${d?.packages?.length ? rowGroup(d.packages.slice(0, 3).map(packageRow)) : empty(d ? 'No packages linked yet.' : 'Loading…')}</section>`;
    }

    page = createSplitPage(host, ctx, {
      title: 'Destinations',
      noun: 'destination',
      plural: 'destinations',
      addLabel: 'Add Destination',
      searchPlaceholder: 'Search destinations...',
      load: () => getJson('/api/destinations'),
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
        name: i.name,
        pill: pill(i.status, label(i.status)),
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
      else if (act === 'tab-packages') page.api.setTab('packages');
      else if (act === 'tab-inquiries') page.api.setTab('inquiries');
    };
    host.addEventListener('click', onAct);

    return { destroy: () => { host.removeEventListener('click', onAct); page.destroy(); }, isDirty: () => page.isDirty() };
  },
};

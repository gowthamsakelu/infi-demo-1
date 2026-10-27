// Blogs: the articles and what they bring in. Four stat cards, tabs All / Published / Draft / Scheduled, search, and a table (cards on the phone).
// The row menu publishes an article or moves it back to draft. The Write Blog button is drawn as designed and does nothing yet.
import { pageFrame } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, searchBox, skeletonCards, errorState, emptyState, openRowMenu } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { renderTabs } from '../shared/list-ui.js';
import { pill, tag, tile, statRow, plural } from '../shared/page-ui.js';

const LABEL = { published: 'Published', draft: 'Draft', scheduled: 'Scheduled' };
const CAT = { guide: 'tour', itinerary: 'villa', tips: 'activity' }; // the shared tag colours
const CAT_LABEL = { guide: 'Guide', itinerary: 'Itinerary', tips: 'Tips' };
const full = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const num = (n) => Number(n || 0).toLocaleString('en-IN');

function dateLine(p) {
  if (p.status === 'published') return `Published ${full(p.publishedAt)}`;
  if (p.status === 'scheduled') return `Scheduled for ${full(p.publishedAt)}`;
  return `Last edited ${full(p.updatedAt)}`;
}

const row = (p) => `<div class="bg-row" role="row" data-bg-id="${esc(p.id)}">
  <span class="bg-tile sp-tile sp-tile-sm">${tile('note', 20)}</span>
  <div class="bg-art"><b title="${esc(p.title)}">${esc(p.title)}</b><small>${esc(dateLine(p))}</small></div>
  <span class="bg-author">${esc(p.author)}</span>
  <span class="bg-cat">${tag(CAT[p.category] || 'tour', CAT_LABEL[p.category] || p.category)}</span>
  <span class="bg-nums"><span class="bg-views" data-unit="views">${num(p.views)}</span><span class="bg-leads" data-unit="leads">${num(p.leads)}</span></span>
  <span class="bg-status">${pill(p.status, LABEL[p.status] || p.status)}</span>
  <button type="button" class="sp-icon-btn bg-menu" data-bg-menu="${esc(p.id)}" aria-haspopup="menu" aria-label="More options for ${esc(p.title)}">${icon('more', { size: 18 })}</button>
</div>`;

export default {
  css: true,
  mount(host, ctx) {
    const state = { posts: [], stats: null, status: 'loading', tab: 'all', q: '' };
    let alive = true;
    let timer = null;
    const frame = pageFrame(host, ctx, { title: 'Blogs', subtitle: '', addLabel: 'Write Blog' });
    frame.body.innerHTML = `
      <div class="bg-stats"></div>
      <div class="bg-bar">
        <div class="bg-tabs sp-tabs"></div>
        <div class="bg-search">${searchBox({ id: 'bg-search', placeholder: 'Search blogs...', variant: 'desktop' })}</div>
        <button type="button" class="btn-secondary-desktop bg-categories">Categories</button>
      </div>
      <div class="bg-table" role="table" aria-label="Articles">
        <div class="bg-head" role="row"><span></span><span>Article</span><span>Author</span><span>Category</span><span>Views</span><span>Leads</span><span>Status</span><span></span></div>
        <div class="bg-list"></div>
      </div>`;
    const $ = (s) => frame.body.querySelector(s);
    const list = $('.bg-list');
    const input = $('.bg-search input');

    const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Draft'], ['scheduled', 'Scheduled']];
    const searched = () => {
      const n = state.q.toLowerCase();
      return n ? state.posts.filter((p) => `${p.title} ${p.author} ${CAT_LABEL[p.category] || ''}`.toLowerCase().includes(n)) : state.posts;
    };

    function render() {
      const ready = state.status === 'ready';
      const s = state.stats;
      frame.setTitle('Blogs', ready ? `${plural(s.total, 'article')} · see which stories bring in inquiries` : '', ready ? `${plural(s.total, 'article')} · ${plural(s.leads, 'lead')}` : '');
      $('.bg-stats').innerHTML = ready ? statRow([
        { icon: 'note', label: 'Total articles', value: num(s.total), tone: 'blue' },
        { icon: 'eye', label: 'Views (30 days)', value: num(s.views), tone: 'green' },
        { icon: 'user', label: 'Leads from blogs', value: num(s.leads), tone: 'purple' },
        { icon: 'check', label: 'Converted to bookings', value: num(s.converted), tone: 'green' },
      ]) : '';
      const base = searched();
      renderTabs($('.bg-tabs'), { tabs: TABS.map(([key, label]) => ({ key, label, count: key === 'all' ? base.length : base.filter((p) => p.status === key).length })), active: state.tab, variant: 'mobile', attr: 'data-bg-tab' });
      const table = $('.bg-table');
      table.classList.toggle('is-plain', state.status !== 'ready' || !state.posts.length);
      if (state.status === 'loading') { list.innerHTML = skeletonCards(5); return; }
      if (state.status === 'error') { list.innerHTML = errorState({ title: 'Could not load blogs', text: 'Check your connection and try again.', retryId: 'bg-retry' }); return; }
      if (!state.posts.length) { list.innerHTML = emptyState({ title: 'No articles yet', text: 'Articles you write will show up here.', resetId: 'bg-reset' }); return; }
      const rows = base.filter((p) => state.tab === 'all' || p.status === state.tab);
      table.classList.toggle('is-plain', !rows.length);
      list.innerHTML = rows.length ? rows.map(row).join('') : emptyState({ title: 'No articles found', text: 'Nothing matches your search. Try resetting the filters.', resetId: 'bg-reset' });
    }

    async function load() {
      state.status = 'loading'; render();
      try {
        const d = await getJson('/api/blogs');
        state.posts = d.posts; state.stats = d.stats; state.status = 'ready';
      } catch { state.status = 'error'; }
      if (alive) render();
    }

    async function setStatus(id, status) {
      try {
        await sendJson(`/api/blogs/${encodeURIComponent(id)}`, 'PATCH', { status });
        toast(status === 'published' ? 'Article published' : status === 'draft' ? 'Moved to draft' : 'Article scheduled', 'success');
        await load();
      } catch (e) { toast(e.message || 'Could not save.', 'warning'); }
    }

    frame.body.querySelector('.bg-categories').addEventListener('click', () => toast('Categories are not set up yet.', 'info'));
    input.addEventListener('input', (e) => { clearTimeout(timer); const v = e.target.value.trim(); timer = setTimeout(() => { state.q = v; render(); }, 200); });
    frame.body.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-bg-tab]');
      if (tab) { state.tab = tab.dataset.bgTab; render(); return; }
      const menu = e.target.closest('[data-bg-menu]');
      if (menu) {
        const p = state.posts.find((x) => String(x.id) === menu.dataset.bgMenu); if (!p) return;
        openRowMenu(menu, [
          ...(p.status !== 'published' ? [{ key: 'published', label: 'Publish now', icon: 'check' }] : []),
          ...(p.status !== 'draft' ? [{ key: 'draft', label: 'Move to draft', icon: 'edit' }] : []),
          { key: 'copy', label: 'Copy link', icon: 'copy' },
        ], async (key) => {
          if (key !== 'copy') { setStatus(p.id, key); return; }
          try { await navigator.clipboard.writeText(`/blog/${p.slug}`); toast('Link copied', 'success'); } catch { toast(`/blog/${p.slug}`, 'info'); }
        });
        return;
      }
      if (e.target.closest('#bg-reset')) { state.q = ''; state.tab = 'all'; input.value = ''; render(); return; }
      if (e.target.closest('#bg-retry')) load();
    });

    load();
    return { destroy() { alive = false; clearTimeout(timer); frame.destroy(); }, isDirty: () => false };
  },
};

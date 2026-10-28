// Blogs: the articles and what they bring in. Four stat cards, tabs All / Published / Draft / Scheduled, search, and a table (cards on the phone).
// The row menu publishes an article or moves it back to draft. The Write Blog button is drawn as designed and does nothing yet.
import { pageFrame } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { createCatalogCrud, numOrNull, textOrNull, listOf } from '../shared/catalog-crud.js';
const today = () => new Date().toISOString().slice(0, 10);
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

const row = (p, fresh = false) => `<div class="bg-row" role="row" data-bg-id="${esc(p.id)}">
  <span class="bg-tile sp-tile sp-tile-sm">${tile('note', 20)}</span>
  <div class="bg-art"><b title="${esc(p.title)}">${esc(p.title)}</b><small>${esc(dateLine(p))}</small></div>
  <span class="bg-author">${esc(p.author)}</span>
  <span class="bg-cat">${tag(CAT[p.category] || 'tour', CAT_LABEL[p.category] || p.category)}</span>
  <span class="bg-nums"><span class="bg-views" data-unit="views">${num(p.views)}</span><span class="bg-leads" data-unit="leads">${num(p.leads)}</span></span>
  <span class="bg-status">${pill(p.status, LABEL[p.status] || p.status)}${fresh ? '<span class="just-added-tag">JUST ADDED</span>' : ''}</span>
  <button type="button" class="sp-icon-btn bg-menu" data-bg-menu="${esc(p.id)}" aria-haspopup="menu" aria-label="More options for ${esc(p.title)}">${icon('more', { size: 18 })}</button>
</div>`;

/** Add / Edit an article: the shared catalog wizard, described by config only (see shared/wizard.js). */
const BG_CATS = [{ value: 'guide', label: 'Guide' }, { value: 'itinerary', label: 'Itinerary' }, { value: 'tips', label: 'Tips' }];
function wizardConfig() {
  return {
    noun: 'article',
    requiredKey: 'title',
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The title, who wrote it and what it is about.', fields: [
        { key: 'title', type: 'text', label: 'Article title', placeholder: 'e.g. Top 10 places to visit in Kashmir in winter', optional: false, max: 160 },
        { key: 'author', type: 'text', label: 'Author', placeholder: 'e.g. Riya Sharma', max: 80 },
        { key: 'category', type: 'chips', label: 'Category', options: BG_CATS },
      ] },
      { label: 'Publishing', title: 'Publishing', sub: 'Publish now, keep it as a draft, or schedule it.', fields: [
        { key: 'status', type: 'chips', label: 'Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }] },
        { key: 'publishedAt', type: 'date', label: 'Publish date', hint: 'Used for scheduled articles and shown on the article' },
      ] },
    ],
    defaults: () => ({ title: '', author: '', category: 'guide', status: 'draft', publishedAt: '' }),
    preview: (v) => ({ title: String(v.title || '').trim(), lines: [BG_CATS.find((c) => c.value === v.category)?.label, v.status ? v.status[0].toUpperCase() + v.status.slice(1) : '', v.author] }),
  };
}

export default {
  css: true,
  mount(host, ctx) {
    const state = { posts: [], stats: null, status: 'loading', tab: 'all', q: '' };
    let alive = true;
    let timer = null;
    const frame = pageFrame(host, ctx, { title: 'Blogs', subtitle: '', addLabel: 'Write Blog', onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }) });
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
      renderTabs($('.bg-tabs'), { tabs: TABS.map(([key, label]) => ({ key, label, count: state.status !== 'ready' ? null : key === 'all' ? base.length : base.filter((p) => p.status === key).length })), active: state.tab, variant: 'mobile', attr: 'data-bg-tab' });
      const table = $('.bg-table');
      table.classList.toggle('is-plain', state.status !== 'ready' || !state.posts.length);
      if (state.status === 'loading') { list.innerHTML = skeletonCards(5); return; }
      if (state.status === 'error') { list.innerHTML = errorState({ title: 'Could not load blogs', error: state.error, what: 'blogs', retryId: 'bg-retry' }); return; }
      if (!state.posts.length) { list.innerHTML = emptyState({ title: 'No articles yet', text: 'Articles you write will show up here.', resetId: 'bg-reset' }); return; }
      const rows = base.filter((p) => state.tab === 'all' || p.status === state.tab);
      table.classList.toggle('is-plain', !rows.length);
      list.innerHTML = rows.length ? rows.map((p) => row(p, crud.isFresh(p.id))).join('') : emptyState({ title: 'No articles found', text: 'Nothing matches your search. Try resetting the filters.', resetId: 'bg-reset' });
    }

    const crud = createCatalogCrud({
      key: 'blogs',
      endpoint: '/api/blogs',
      wizard: () => wizardConfig(),
      toBody: (v) => ({ title: v.title.trim(), author: textOrNull(v.author), category: v.category || 'guide', status: v.status || 'draft', publishedAt: textOrNull(v.publishedAt) }),
      local: (v, old) => {
        const status = v.status || 'draft';
        const publishedAt = textOrNull(v.publishedAt) ?? (status === 'draft' ? null : today());
        return {
          ...(old || {}), title: v.title.trim(), author: textOrNull(v.author) ?? '', category: v.category || 'guide', status, publishedAt,
          updatedAt: today(), slug: old?.slug ?? v.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          views: old?.views ?? 0, leads: old?.leads ?? 0, converted: old?.converted ?? 0,
        };
      },
      values: (p) => ({ title: p.title, author: p.author ?? '', category: p.category || 'guide', status: p.status || 'draft', publishedAt: p.publishedAt ?? '' }),
      load: async () => {
        const d = await getJson('/api/blogs');
        state.stats = d.stats;
        return d.posts;
      },
      onChange: (list) => { state.posts = list; state.stats = { ...state.stats, total: list.length }; render(); },
    });

    async function load() {
      state.status = 'loading'; render();
      try {
        state.posts = await crud.load();
        state.status = 'ready';
      } catch (err) { state.status = 'error'; state.error = err; }
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
    input.addEventListener('input', (e) => { clearTimeout(timer); const v = e.target.value.trim(); timer = setTimeout(() => { state.q = v; render(); }, 300); });
    frame.body.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-bg-tab]');
      if (tab) { state.tab = tab.dataset.bgTab; render(); return; }
      const menu = e.target.closest('[data-bg-menu]');
      if (menu) {
        const p = state.posts.find((x) => String(x.id) === menu.dataset.bgMenu); if (!p) return;
        openRowMenu(menu, [
          { key: 'edit', label: 'Edit', icon: 'edit' },
          ...(p.status !== 'published' ? [{ key: 'published', label: 'Publish now', icon: 'check' }] : []),
          ...(p.status !== 'draft' ? [{ key: 'draft', label: 'Move to draft', icon: 'edit' }] : []),
          { key: 'copy', label: 'Copy link', icon: 'copy' },
        ], async (key) => {
          if (key === 'edit') { crud.edit(p, { returnFocus: () => menu }); return; }
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

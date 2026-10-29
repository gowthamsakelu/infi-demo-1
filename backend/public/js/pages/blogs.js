// Blogs: the articles as a card grid (cover, category, title, excerpt, author, date) under a "Trending Blogs" heading, with "Load More".
// One column on the phone, two on a tablet, three on a desktop. A card opens the article in a bottom sheet; the ⋮ menu has Edit, View and Delete.
// Add and Edit are the shared catalog sheet (shared/wizard.js).
import { pageFrame } from '../shared/split-page.js';
import { getJson } from '../shared/http.js';
import { createCatalogCrud, textOrNull, pictureOf } from '../shared/catalog-crud.js';
import { esc, toast, searchBox, skeletonCards, errorState, emptyState, openRowMenu } from '../shared/ui.js';
import { openSheet, confirmDialog } from '../shared/sheet.js';
import { icon } from '../shared/icons.js';
import { renderTabs } from '../shared/list-ui.js';
import { pill, tag } from '../shared/page-ui.js';
import { heroImage } from './catalog-ui.js';

const today = () => new Date().toISOString().slice(0, 10);
const LABEL = { published: 'Published', draft: 'Draft', scheduled: 'Scheduled' };
const CAT = { guide: 'tour', itinerary: 'villa', tips: 'activity' }; // the shared tag colours
const CAT_LABEL = { guide: 'Guide', itinerary: 'Itinerary', tips: 'Tips' };
const PAGE = 9; // cards per "Load More"
const full = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const num = (n) => Number(n || 0).toLocaleString('en-IN');
const dateOf = (p) => full(p.status === 'draft' ? p.updatedAt : p.publishedAt || p.updatedAt);
const paragraphs = (text) => String(text || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);

/** The cover: the picture (fixed 16:10 box, lazy) or the shared placeholder when the article has none. */
const cover = (p) => (p.cover
  ? `<img src="${esc(p.cover)}" alt="" width="640" height="400" loading="lazy" decoding="async">`
  : `<span class="bg-cover-empty">${icon('camera', { size: 28, stroke: 1.6 })}</span>`);

const card = (p, fresh = false) => `<article class="bg-card" data-bg-id="${esc(p.id)}">
  <div class="bg-cover">${cover(p)}
    <button type="button" class="sp-icon-btn bg-menu" data-bg-menu="${esc(p.id)}" aria-haspopup="menu" aria-label="More options for ${esc(p.title)}">${icon('more', { size: 18 })}</button>
  </div>
  <div class="bg-card-body">
    <div class="bg-tags">${tag(CAT[p.category] || 'tour', CAT_LABEL[p.category] || p.category)}${pill(p.status, LABEL[p.status] || p.status)}${fresh ? '<span class="just-added-tag">JUST ADDED</span>' : ''}</div>
    <h3 class="bg-card-title" title="${esc(p.title)}">${esc(p.title)}</h3>
    <p class="bg-excerpt">${esc(p.excerpt || '')}</p>
    <div class="bg-card-foot"><span class="bg-author">${esc(p.author || '')}</span><span class="bg-date">${esc(dateOf(p))}</span></div>
    <button type="button" class="bg-read" data-bg-view="${esc(p.id)}">Read More</button>
  </div>
</article>`;

/** Add / Edit an article: the shared catalog sheet, described by config only (see shared/wizard.js). */
const BG_CATS = [{ value: 'guide', label: 'Guide' }, { value: 'itinerary', label: 'Itinerary' }, { value: 'tips', label: 'Tips' }];
function wizardConfig() {
  return {
    noun: 'article',
    requiredKey: 'title',
    required: ['title', 'category', 'content'], // saved only when these are filled in
    steps: [
      { label: 'Basics', title: 'Basics', sub: 'The cover, the title, who wrote it and what it is about.', fields: [
        { key: 'cover', type: 'image', label: 'Cover image', hint: 'JPG, PNG or WebP · up to 5 MB' },
        { key: 'title', type: 'text', label: 'Article title', placeholder: 'e.g. Top 10 places to visit in Kashmir in winter', optional: false, max: 160 },
        { key: 'category', type: 'chips', label: 'Category', options: BG_CATS },
        { key: 'author', type: 'text', label: 'Author', placeholder: 'e.g. Riya Sharma', max: 80 },
      ] },
      { label: 'Content', title: 'Content', sub: 'A short excerpt for the card, then the full article.', fields: [
        { key: 'excerpt', type: 'textarea', label: 'Excerpt', placeholder: 'One or two sentences shown on the card', rows: 3, max: 300 },
        { key: 'content', type: 'textarea', label: 'Content', placeholder: 'Write the article. Leave a blank line between paragraphs.', rows: 9, max: 20000 },
      ] },
      { label: 'Publishing', title: 'Publishing', sub: 'Publish now or keep it as a draft.', fields: [
        { key: 'status', type: 'chips', label: 'Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
        { key: 'publishedAt', type: 'date', label: 'Date', hint: 'Shown on the article' },
      ] },
    ],
    defaults: () => ({ cover: [], title: '', category: 'guide', author: '', excerpt: '', content: '', status: 'draft', publishedAt: '' }),
    preview: (v) => ({ title: String(v.title || '').trim(), lines: [BG_CATS.find((c) => c.value === v.category)?.label, v.status ? v.status[0].toUpperCase() + v.status.slice(1) : '', v.author] }),
  };
}

export default {
  css: true,
  mount(host, ctx) {
    const state = { posts: [], stats: null, status: 'loading', tab: 'all', q: '', shown: PAGE };
    let alive = true;
    let timer = null;
    const frame = pageFrame(host, ctx, { title: 'Blogs', subtitle: '', addLabel: 'Write Blog', onAdd: () => crud.add({ returnFocus: () => document.querySelector('#desktop-page-add, #mobile-page-add') }) });
    frame.body.innerHTML = `
      <div class="bg-bar">
        <div class="bg-tabs sp-tabs"></div>
        <div class="bg-search">${searchBox({ id: 'bg-search', placeholder: 'Search blogs...', variant: 'desktop' })}</div>
      </div>
      <div class="bg-grid" role="list" aria-label="Articles"></div>
      <div class="bg-more" hidden><button type="button" class="btn-secondary-desktop" data-bg-more>Load More</button></div>`;
    const $ = (s) => frame.body.querySelector(s);
    const grid = $('.bg-grid');
    const input = $('.bg-search input');

    const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Draft'], ['scheduled', 'Scheduled']];
    const searched = () => {
      const n = state.q.toLowerCase();
      return n ? state.posts.filter((p) => `${p.title} ${p.author} ${p.excerpt || ''} ${CAT_LABEL[p.category] || ''}`.toLowerCase().includes(n)) : state.posts;
    };
    const find = (id) => state.posts.find((x) => String(x.id) === String(id));

    function render() {
      const ready = state.status === 'ready';
      frame.setTitle('Blogs', `Blogs • ${num(state.posts.length)} Total`);
      const base = searched();
      renderTabs($('.bg-tabs'), { tabs: TABS.map(([key, label]) => ({ key, label, count: !ready ? null : key === 'all' ? base.length : base.filter((p) => p.status === key).length })), active: state.tab, variant: 'mobile', attr: 'data-bg-tab' });
      const more = $('.bg-more');
      more.hidden = true;
      grid.classList.toggle('is-plain', !ready || !state.posts.length);
      if (state.status === 'loading') { grid.innerHTML = skeletonCards(6); return; }
      if (state.status === 'error') { grid.innerHTML = errorState({ title: 'Could not load blogs', error: state.error, what: 'blogs', retryId: 'bg-retry' }); return; }
      if (!state.posts.length) { grid.innerHTML = emptyState({ title: 'No articles yet', text: 'Articles you write will show up here.', resetId: 'bg-reset' }); return; }
      const rows = base.filter((p) => state.tab === 'all' || p.status === state.tab);
      grid.classList.toggle('is-plain', !rows.length);
      if (!rows.length) { grid.innerHTML = emptyState({ title: 'No articles found', text: 'Nothing matches your search. Try resetting the filters.', resetId: 'bg-reset' }); return; }
      grid.innerHTML = rows.slice(0, state.shown).map((p) => card(p, crud.isFresh(p.id))).join('');
      more.hidden = rows.length <= state.shown;
    }

    const crud = createCatalogCrud({
      key: 'blogs',
      endpoint: '/api/blogs',
      wizard: () => wizardConfig(),
      toBody: (v) => ({
        title: v.title.trim(), author: textOrNull(v.author), category: v.category || 'guide', status: v.status || 'draft', publishedAt: textOrNull(v.publishedAt),
        excerpt: textOrNull(v.excerpt), content: textOrNull(v.content), cover: pictureOf(v.cover),
      }),
      local: (v, old) => {
        const status = v.status || 'draft';
        const publishedAt = textOrNull(v.publishedAt) ?? (status === 'draft' ? null : today());
        return {
          ...(old || {}), title: v.title.trim(), author: textOrNull(v.author) ?? '', category: v.category || 'guide', status, publishedAt,
          excerpt: textOrNull(v.excerpt), content: textOrNull(v.content), cover: pictureOf(v.cover),
          updatedAt: today(), slug: old?.slug ?? v.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          views: old?.views ?? 0, leads: old?.leads ?? 0, converted: old?.converted ?? 0,
        };
      },
      values: (p) => ({
        cover: p.cover ? [p.cover] : [], title: p.title, author: p.author ?? '', category: p.category || 'guide', excerpt: p.excerpt ?? '', content: p.content ?? '',
        status: p.status || 'draft', publishedAt: p.publishedAt ?? '',
      }),
      load: async () => {
        const d = await getJson('/api/blogs');
        state.stats = d.stats;
        return d.posts;
      },
      onChange: (list) => { if (!alive) return; state.posts = list; state.stats = { ...state.stats, total: list.length }; render(); },
    });

    async function load() {
      state.status = 'loading'; render();
      try {
        state.posts = await crud.load();
        state.status = 'ready';
      } catch (err) { state.status = 'error'; state.error = err; }
      if (alive) render();
    }

    /** The article in a normal bottom sheet: cover, category, author and date, the excerpt and the full text. */
    function view(p, returnFocus) {
      const text = paragraphs(p.content);
      const dlg = openSheet({
        label: p.title,
        cls: 'bg-view-sheet',
        returnFocus,
        html: `<header class="asg-header">
            <h3 class="bg-view-title" data-dialog-title tabindex="-1">${esc(p.title)}</h3>
            <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
          </header>
          <div class="bg-view-body">
            ${heroImage(p.cover, p.title)}
            <div class="bg-tags">${tag(CAT[p.category] || 'tour', CAT_LABEL[p.category] || p.category)}${pill(p.status, LABEL[p.status] || p.status)}</div>
            <p class="bg-meta">${esc([p.author, dateOf(p)].filter(Boolean).join(' · '))}</p>
            ${p.excerpt ? `<p class="bg-lede">${esc(p.excerpt)}</p>` : ''}
            ${text.length ? text.map((t) => `<p class="bg-text">${esc(t)}</p>`).join('') : '<p class="sp-none">No content yet.</p>'}
          </div>
          <footer class="asg-footer bg-view-foot">
            <button type="button" class="btn-secondary-desktop" data-sheet-close>Close</button>
            <button type="button" class="btn-primary-desktop" data-bg-edit>Edit</button>
          </footer>`,
      });
      dlg.ov.addEventListener('click', (e) => {
        if (!e.target.closest('[data-bg-edit]')) return;
        dlg.close();
        crud.edit(p, { returnFocus });
      });
    }

    async function remove(p) {
      const ok = await confirmDialog({ title: 'Delete this article?', text: `"${p.title}" will be removed from the list.`, confirm: 'Delete', cancel: 'Keep', danger: true });
      if (!ok) return;
      try {
        await crud.remove(p);
        toast('Article deleted', 'success');
      } catch (e) { toast(e.message || 'Could not delete the article.', 'warning'); }
    }

    input.addEventListener('input', (e) => { clearTimeout(timer); const v = e.target.value.trim(); timer = setTimeout(() => { state.q = v; state.shown = PAGE; render(); }, 300); });
    frame.body.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-bg-tab]');
      if (tab) { state.tab = tab.dataset.bgTab; state.shown = PAGE; render(); return; }
      if (e.target.closest('[data-bg-more]')) { state.shown += PAGE; render(); return; }
      const menu = e.target.closest('[data-bg-menu]');
      if (menu) {
        const p = find(menu.dataset.bgMenu); if (!p) return;
        openRowMenu(menu, [
          { key: 'edit', label: 'Edit', icon: 'edit' },
          { key: 'view', label: 'View', icon: 'eye' },
          { key: 'delete', label: 'Delete', icon: 'trash', danger: true },
        ], (key) => {
          if (key === 'edit') crud.edit(p, { returnFocus: () => menu });
          else if (key === 'view') view(p, () => menu);
          else remove(p);
        });
        return;
      }
      const open = e.target.closest('.bg-card');
      if (open) { const p = find(open.dataset.bgId); if (p) view(p, () => open.querySelector('.bg-read')); return; }
      if (e.target.closest('#bg-reset')) { state.q = ''; state.tab = 'all'; state.shown = PAGE; input.value = ''; render(); return; }
      if (e.target.closest('#bg-retry')) load();
    });

    load();
    return { destroy() { alive = false; clearTimeout(timer); frame.destroy(); }, isDirty: () => false };
  },
};

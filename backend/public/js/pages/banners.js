// Banners: the pictures on the website, as a card grid (or a simple order list). Tabs All / Active / Scheduled / Draft, an on / off switch per card
// that saves at once, and Move earlier / later to change the order. The Add Banner button is drawn as designed and does nothing yet.
import { pageFrame } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, skeletonCards, errorState, emptyState, openRowMenu } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { renderTabs } from '../shared/list-ui.js';
import { pill, plural } from '../shared/page-ui.js';

const LABEL = { active: 'Active', scheduled: 'Scheduled', draft: 'Draft' };
const short = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');
const num = (n) => Number(n || 0).toLocaleString('en-IN');

/** "Home hero, slot 1 · 1 Nov - 28 Feb" / "Not placed yet · No dates" */
function meta(b) {
  const place = b.slot ? `${b.placement}, slot ${b.slot}` : b.placement;
  let when;
  if (b.startsAt && b.endsAt) when = `${short(b.startsAt)} – ${short(b.endsAt)}`;
  else if (b.status === 'scheduled') when = `Starts ${short(b.startsAt)}`;
  else if (b.status === 'active') when = 'Ongoing';
  else when = 'No dates';
  return `${place} · ${when}`;
}

const stats = (b) => `<div class="bn-stats"><span><b>${num(b.clicks)}</b> clicks</span><span><b>${num(b.leads)}</b> leads</span><span><b>${num(b.converted)}</b> converted</span></div>`;
const toggleBtn = (b) => `<button type="button" role="switch" aria-checked="${b.active}" aria-label="${esc(b.name)} on the website" class="bld-switch sp-switch ${b.active ? 'is-on' : ''}" data-bn-toggle="${esc(b.id)}"><span class="bld-switch-knob"></span></button>`;

function hero(b, { thumb = false } = {}) {
  const img = b.image ? `<img src="${esc(b.image)}" alt="${esc(`${b.headline} banner`)}" loading="lazy" decoding="async" />` : '';
  return `<div class="bn-hero bn-tone-${esc(b.tone)} ${thumb ? 'bn-thumb' : ''}">${img}<span class="bn-shade"></span>
    ${thumb ? '' : `<span class="bn-pill">${pill(b.status, LABEL[b.status])}</span>
    <button type="button" class="bn-more" data-bn-more="${esc(b.id)}" aria-haspopup="menu" aria-label="More options for ${esc(b.name)}">${icon('more', { size: 18 })}</button>
    <div class="bn-copy"><h3>${esc(b.headline)}</h3>${b.cta ? `<p>${esc(b.cta)}</p>` : ''}</div>`}</div>`;
}

const card = (b) => `<article class="bn-card" data-bn-id="${esc(b.id)}">${hero(b)}
  <div class="bn-info">
    <div class="bn-row"><div class="bn-name"><b>${esc(b.name)}</b><small>${esc(meta(b))}</small></div>${toggleBtn(b)}</div>
    ${stats(b)}
  </div></article>`;

const orderRow = (b, i, n) => `<div class="bn-order-row" data-bn-id="${esc(b.id)}">
  <span class="bn-order-no">${i + 1}</span>${hero(b, { thumb: true })}
  <div class="bn-order-text"><b>${esc(b.name)}</b><small>${esc(meta(b))}</small></div>
  ${pill(b.status, LABEL[b.status])}
  <div class="bn-order-btns">
    <button type="button" class="sp-icon-btn bn-up" data-bn-move="up" data-bn-id-move="${esc(b.id)}" aria-label="Move ${esc(b.name)} earlier" ${i === 0 ? 'disabled' : ''}>${icon('chevronDown', { size: 18 })}</button>
    <button type="button" class="sp-icon-btn" data-bn-move="down" data-bn-id-move="${esc(b.id)}" aria-label="Move ${esc(b.name)} later" ${i === n - 1 ? 'disabled' : ''}>${icon('chevronDown', { size: 18 })}</button>
  </div>
</div>`;

export default {
  css: true,
  mount(host, ctx) {
    const state = { items: [], status: 'loading', tab: 'all', mode: 'grid' };
    let alive = true;
    const frame = pageFrame(host, ctx, { title: 'Banners', subtitle: '', addLabel: 'Add Banner' });
    frame.body.innerHTML = `
      <div class="bn-bar">
        <div class="bn-tabs sp-tabs"></div>
        <div class="bn-tools">
          <button type="button" class="btn-secondary-desktop bn-preview">${icon('eye', { size: 16 })}Preview website</button>
          <div class="bn-seg" role="group" aria-label="View">
            <button type="button" data-bn-mode="grid">Grid</button><button type="button" data-bn-mode="order">Order</button>
          </div>
        </div>
      </div>
      <div class="bn-content"></div>`;
    const tabsEl = frame.body.querySelector('.bn-tabs');
    const content = frame.body.querySelector('.bn-content');

    const TABS = [['all', 'All'], ['active', 'Active'], ['scheduled', 'Scheduled'], ['draft', 'Draft']];
    const inTab = (b) => state.tab === 'all' || b.status === state.tab;
    const live = () => state.items.filter((b) => b.status === 'active').length;

    function render() {
      const ready = state.status === 'ready';
      frame.setTitle('Banners', ready ? `${plural(state.items.length, 'banner')} · ${live()} live on the website · leads are tracked per banner` : '', ready ? `${plural(state.items.length, 'banner')} · ${live()} live` : '');
      renderTabs(tabsEl, { tabs: TABS.map(([key, label]) => ({ key, label, count: state.status !== 'ready' ? null : key === 'all' ? state.items.length : state.items.filter((b) => b.status === key).length })), active: state.tab, variant: 'mobile', attr: 'data-bn-tab' });
      frame.body.querySelectorAll('[data-bn-mode]').forEach((b) => { const on = b.dataset.bnMode === state.mode; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
      if (state.status === 'loading') { content.innerHTML = skeletonCards(6); return; }
      if (state.status === 'error') { content.innerHTML = errorState({ title: 'Could not load banners', error: state.error, what: 'banners', retryId: 'bn-retry' }); return; }
      if (!state.items.length) { content.innerHTML = emptyState({ title: 'No banners yet', text: 'Banners you add will show up here.', resetId: 'bn-reset' }); return; }
      const rows = state.items.filter(inTab);
      if (!rows.length) { content.innerHTML = emptyState({ title: 'No banners found', text: 'Nothing in this tab yet.', resetId: 'bn-reset' }); return; }
      content.innerHTML = state.mode === 'order'
        ? `<div class="bn-order">${state.items.map((b, i) => orderRow(b, i, state.items.length)).join('')}</div>`
        : `<div class="bn-grid">${rows.map(card).join('')}</div>`;
    }

    async function load() {
      state.status = 'loading'; render();
      try { state.items = await getJson('/api/banners'); state.status = 'ready'; } catch (err) { state.status = 'error'; state.error = err; }
      if (alive) render();
    }

    const find = (id) => state.items.find((b) => String(b.id) === String(id));

    async function setActive(id, on) {
      const b = find(id); if (!b) return;
      const before = { ...b };
      b.active = on; // the switch moves at once; the server confirms (or the switch goes back)
      try {
        Object.assign(b, (await sendJson(`/api/banners/${encodeURIComponent(id)}`, 'PATCH', { is_active: on })).data);
        toast(on ? `${b.name} is on` : `${b.name} is off`, 'success');
      } catch (e) {
        Object.assign(b, before);
        toast(e.message || 'Could not save. The switch was put back.', 'warning');
      }
      if (alive) render();
    }

    async function move(id, dir) {
      const i = state.items.findIndex((b) => String(b.id) === String(id));
      const j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= state.items.length) return;
      const before = [...state.items];
      [state.items[i], state.items[j]] = [state.items[j], state.items[i]];
      render();
      try {
        state.items = (await sendJson('/api/banners/reorder', 'POST', { ids: state.items.map((b) => b.id) })).data;
      } catch (e) {
        state.items = before;
        toast(e.message || 'Could not save the order.', 'warning');
      }
      if (alive) render();
    }

    frame.body.querySelector('.bn-preview').addEventListener('click', () => toast('Website preview is not connected yet.', 'info'));
    frame.body.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-bn-tab]');
      if (tab) { state.tab = tab.dataset.bnTab; render(); return; }
      const mode = e.target.closest('[data-bn-mode]');
      if (mode) { state.mode = mode.dataset.bnMode; render(); return; }
      const sw = e.target.closest('[data-bn-toggle]');
      if (sw) { setActive(sw.dataset.bnToggle, sw.getAttribute('aria-checked') !== 'true'); return; }
      const mv = e.target.closest('[data-bn-move]');
      if (mv) { move(mv.dataset.bnIdMove, mv.dataset.bnMove); return; }
      const more = e.target.closest('[data-bn-more]');
      if (more) {
        const b = find(more.dataset.bnMore); if (!b) return;
        const i = state.items.indexOf(b);
        openRowMenu(more, [
          { key: 'toggle', label: b.active ? 'Switch off' : 'Switch on', icon: 'check' },
          ...(i > 0 ? [{ key: 'up', label: 'Move earlier', icon: 'chevronDown' }] : []),
          ...(i < state.items.length - 1 ? [{ key: 'down', label: 'Move later', icon: 'chevronDown' }] : []),
        ], (key) => { if (key === 'toggle') setActive(b.id, !b.active); else move(b.id, key); });
        return;
      }
      if (e.target.closest('#bn-reset')) { state.tab = 'all'; render(); return; }
      if (e.target.closest('#bn-retry')) load();
    });
    // A picture that fails to load is dropped, so the banner's gradient shows instead of a broken icon.
    frame.body.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);

    load();
    return { destroy() { alive = false; frame.destroy(); }, isDirty: () => false };
  },
};

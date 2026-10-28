// The list + detail page used by Destinations, Tour Packages, Transport, Stays, Adventures, Users and Settings.
// It is built from the same markup and classes as Inquiries and Bookings (the white list card with its compact header, the row cards,
// the detail pane with its header, tabs, body and footer bar; on the phone the brand header, the search row and the card list),
// so a new page is the same product, not a lookalike. A page only describes its data and what goes in each part.
// PC: the first record is selected on load and the pane is never empty; the choice lives in the URL (?selected=ID).
// Phone: tapping a card opens the detail as the same bottom sheet as the Bookings detail (X or backdrop closes it; the browser Back button too).
import { icon } from './icons.js';
import { esc, searchBox, skeletonCards, errorState, emptyState, selectEmptyState, rowMenuButton, openRowMenu } from './ui.js';
import { renderTabs } from './list-ui.js';
import { createDropdown } from './dropdown-filter.js';
import { confirmDialog } from './sheet.js';
import { detailHeaderHtml, sheetHandleHtml } from './detail-sheet.js';
import { bindListKeys } from './split-view.js';
import { hasOpenLayer } from './sheet.js';
import { getParams, setParams, subscribe } from './page-state.js';

const isPhone = () => document.documentElement.dataset.layout === 'mobile';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------------------------------------
   Parts shared with the Inquiries / Bookings markup
   ------------------------------------------------------------------------------------------------ */

/** The phone header: brand icon, "Ruyi Admin", this page's line, the bell and the account badge (as on every phone page). */
const phoneHeader = (line) => `
  <div class="mobile-app-header">
    <div class="app-brand-left">
      <div class="brand-icon-box">${icon('plane', { size: 24, stroke: 2.2 })}</div>
      <div class="brand-text-col"><h2>Ruyi Admin</h2><p class="sp-header-line">${esc(line)}</p></div>
    </div>
    <div class="app-header-right">
      <button class="icon-bell-btn" type="button" data-sp-bell aria-label="Notifications">${icon('bell', { size: 22 })}<span class="bell-dot"></span></button>
      <button type="button" class="ks-avatar-badge" title="Karan Sapalia" aria-haspopup="menu" aria-label="Account menu">KS</button>
    </div>
  </div>`;


/** The detail header: the shared sheet header (shared/detail-sheet.js), with the round X on the phone. */
const headerHtml = (h) => detailHeaderHtml(h, isPhone() ? { close: 'data-sp-back', closeCls: 'sp-back' } : {});

const TONES = ['call', 'msg', 'fwd', 'more'];
/** The footer bar, the same as Confirm + Call / Message / Forward / More: one full-width primary button over a row of quick actions. */
function footerHtml(f) {
  if (!f) return '';
  if (typeof f === 'string') return f; // a page that draws its own footer
  const quick = (f.quick || []).slice(0, 4);
  return `${f.primary ? `<button type="button" class="btn-confirm-booking" ${f.primary.act ? `data-sp-act="${esc(f.primary.act)}"` : ''} ${f.primary.disabled ? 'disabled' : ''}>${f.primary.icon ? icon(f.primary.icon, { size: 16, stroke: 2.4 }) : ''}${esc(f.primary.label)}</button>` : ''}
    ${quick.length ? `<div class="sheet-quick-actions-grid sp-quick" style="--sp-cols:${quick.length}">${quick.map((q, i) => `<button type="button" class="quick-action-col-btn btn-act-${q.tone || TONES[i % 4]}" ${q.act ? `data-sp-act="${esc(q.act)}"` : ''} ${q.disabled ? 'disabled' : ''} title="${esc(q.label)}">${icon(q.icon || 'more', { size: 20, stroke: 2.2 })}<span>${esc(q.label)}</span></button>`).join('')}</div>` : ''}`;
}

/* ------------------------------------------------------------------------------------------------
   The frame, for pages that are not split (Banners, Blogs ...): the phone header, or nothing above the content on PC
   ------------------------------------------------------------------------------------------------ */

/**
 * @param {HTMLElement} host
 * @param {object} ctx  from page-host
 * @param {{ title: string, subtitle?: string, addLabel?: string }} cfg
 * The Add button is the shared one (shared/add-button.js): top bar on PC, floating on the phone. `onAdd` is what it does.
 */
export function pageFrame(host, ctx, cfg) {
  ctx.setAddButton?.(cfg.addLabel || null, cfg.onAdd);
  host.innerHTML = `<section class="sp sp-frame" data-sp="${esc(ctx.key)}">${isPhone() ? phoneHeader(cfg.subtitle || cfg.title) : ''}<div class="sp-body"></div></section>`;
  host.querySelector('[data-sp-bell]')?.addEventListener('click', () => document.querySelector('#mobile-bell-btn')?.click());
  return {
    root: host.firstElementChild,
    body: host.querySelector('.sp-body'),
    setTitle(title, subtitle = '') { const el = host.querySelector('.sp-header-line'); if (el) el.textContent = subtitle || title; document.title = `${title} - Ruyi Admin`; },
    destroy() { ctx.setAddButton?.(null); document.body.classList.remove('sp-detail-open'); },
  };
}

/* ------------------------------------------------------------------------------------------------
   The split page
   ------------------------------------------------------------------------------------------------ */

/**
 * @param {HTMLElement} host
 * @param {object} ctx
 * @param {{
 *   title: string, noun: string, plural: string, addLabel?: string, searchPlaceholder: string,
 *   subtitle: (items: object[]) => string, subtitleShort?: (items: object[]) => string,
 *   load: () => Promise<object[]>,
 *   tabs: { key: string, label: string, test: (item: object) => boolean }[],
 *   filter?: { allLabel: string, options: (items: object[]) => { value: string, label: string }[], test: (item: object, value: string) => boolean },
 *   sorts?: { value: string, label: string, compare?: (a: object, b: object) => number }[],
 *   searchText: (item: object) => string,
 *   row: (item: object) => { tile: string, name: string, pill?: string, sub?: string, meta?: string },
 *   detail: (item: object, ui: { tab: string }) => {
 *     head: { avatar: string, title: string, pill?: string, subtitle?: string, chips?: { icon: string, text: string }[] } | string,
 *     tabs?: { key: string, label: string }[], body: string,
 *     foot?: { primary?: { label: string, icon?: string, act?: string }, quick?: { label: string, icon?: string, act?: string }[] } | string },
 *   afterDetail?: (el: HTMLElement, item: object, api: object) => void,
 *   isDirty?: () => boolean, discard?: () => void,
 *   onAdd?: () => void, rowMenu?: (item: object) => { key: string, label: string, icon: string, danger?: boolean }[], onRowMenu?: (key: string, item: object) => void,
 * }} cfg
 * The filter dropdown beside the search box is `filter` (a real filter, like All Categories on Inquiries) or, when a page has none, its `sorts`.
 */
export function createSplitPage(host, ctx, cfg) {
  ctx.setAddButton?.(cfg.addLabel || null, cfg.onAdd);
  const state = { items: [], status: 'loading', q: '', tab: cfg.tabs[0].key, filter: '', sort: '', selected: null, dtab: '' };
  let pushed = false; // did we add a history entry when the phone opened a detail?
  let timer = null;
  let alive = true;
  let phone = isPhone();
  let dirtyApi = { isDirty: () => !!cfg.isDirty?.() };
  let dd = null;

  const $ = (s) => host.querySelector(s);
  const searchInput = () => (phone ? $('.search-input-wrapper input') : $('.compact-search-bar input'));

  /* ---------- derived ---------- */
  const tabDef = () => cfg.tabs.find((t) => t.key === state.tab) || cfg.tabs[0];
  const searched = () => {
    const needle = state.q.trim().toLowerCase();
    let rows = needle ? state.items.filter((i) => cfg.searchText(i).toLowerCase().includes(needle)) : state.items;
    if (cfg.filter && state.filter) rows = rows.filter((i) => cfg.filter.test(i, state.filter));
    return rows;
  };
  const visible = () => {
    const rows = searched().filter(tabDef().test);
    const sort = cfg.sorts?.find((s) => s.value === state.sort);
    return sort?.compare ? [...rows].sort(sort.compare) : rows;
  };
  const byId = (id) => state.items.find((i) => String(i.id) === String(id)) || null;
  const current = () => byId(state.selected);
  const dropdownValue = () => (cfg.filter ? state.filter : state.sort);

  /* ---------- the shell, built for the layout in use ---------- */
  function buildShell() {
    phone = isPhone();
    const key = esc(ctx.key);
    host.innerHTML = phone
      ? `<section class="sp sp-phone" data-sp="${key}">
          ${phoneHeader('')}
          <div class="mobile-search-row">${searchBox({ id: `sp-search-${key}`, placeholder: cfg.searchPlaceholder, variant: 'mobile' })}<span class="sp-filter-slot"></span></div>
          <div class="sp-tabs"></div>
          <div class="bookings-cards-list row-list sp-list" role="listbox" tabindex="0" aria-label="${esc(cfg.plural)}"></div>
          <div class="sheet-backdrop sp-sheet-backdrop" data-sp-back></div>
          <div class="sp-detail sp-detail-screen" aria-live="polite">
            ${sheetHandleHtml()}
            <div class="sp-detail-head"></div><div class="sheet-tabs-nav sp-detail-tabs scroll-row" role="tablist"></div>
            <div class="sheet-body-scroll sp-detail-body"></div><div class="sheet-sticky-footer sp-detail-foot"></div>
          </div>
        </section>`
      : `<section class="sp sp-desk desktop-workspace-split has-open-detail" data-sp="${key}">
          <div class="desktop-table-container">
            <div class="desktop-compact-list-view">
              <div class="compact-list-header">
                ${cfg.listTitle ? `<div class="compact-header-title-row"><h3 class="compact-header-title">${esc(cfg.listTitle)}</h3></div>` : ''}
                <div class="compact-header-top">
                  <div class="compact-search-bar">${icon('search', { size: 15 })}<input type="text" id="sp-search-${key}" placeholder="${esc(cfg.searchPlaceholder)}" aria-label="${esc(cfg.searchPlaceholder)}" /></div>
                  <span class="sp-filter-slot"></span>
                </div>
                <div class="sp-tabs"></div>
              </div>
              <div class="compact-list-items row-list sp-list" role="listbox" tabindex="0" aria-label="${esc(cfg.plural)}"></div>
            </div>
          </div>
          <aside class="desktop-details-drawer open sp-detail" aria-live="polite">
            <div class="desktop-drawer-header-box sp-detail-head"></div>
            <div class="sheet-tabs-nav desktop-tabs-nav sp-detail-tabs scroll-row" role="tablist"></div>
            <div class="sheet-body-scroll desktop-body-scroll sp-detail-body"></div>
            <div class="sheet-sticky-footer desktop-drawer-footer sp-detail-foot"></div>
          </aside>
        </section>`;
    $('[data-sp-bell]')?.addEventListener('click', () => document.querySelector('#mobile-bell-btn')?.click());

    // the filter beside the search box: the same labelled dropdown as the category filter on Inquiries
    dd = null;
    if (cfg.filter || cfg.sorts) {
      const options = () => (cfg.filter
        ? [{ value: '', label: cfg.filter.allLabel }, ...cfg.filter.options(state.items)]
        : cfg.sorts.map(({ value, label }) => ({ value, label })));
      dd = createDropdown({ options, ariaLabel: cfg.filter ? 'Filter' : 'Sort', onChange: (v) => setParams(cfg.filter ? { filter: v || null } : { sort: v || null }, { push: false }) });
      dd.attach($('.sp-filter-slot'), phone ? '' : 'dd-compact');
      dd.setValue(dropdownValue());
    }

    const input = searchInput();
    input.value = state.q;
    input.addEventListener('input', (e) => {
      clearTimeout(timer);
      const v = e.target.value.trim();
      timer = setTimeout(() => setParams({ q: v || null }, { push: false }), 300);
    });
    bindListKeys($('.sp-list'), { getList: visible, getActiveId: () => state.selected, onSelect: (item) => select(item.id, { push: false }) });
  }

  /* ---------- guard: unsaved changes ---------- */
  async function mayLeaveRecord() {
    if (!dirtyApi.isDirty()) return true;
    const ok = await confirmDialog({ title: 'Discard your changes?', text: 'What you changed here has not been saved yet.', confirm: 'Discard', cancel: 'Keep editing', danger: true });
    if (ok) cfg.discard?.();
    return ok;
  }

  /* ---------- rendering ---------- */
  function renderTabsRow() {
    const base = searched();
    // While the list is loading there is nothing to count: the tabs show only their names, never "(0)".
    const tabs = cfg.tabs.map((t) => ({ key: t.key, label: t.label, count: state.status === 'ready' ? base.filter(t.test).length : null }));
    renderTabs($('.sp-tabs'), { tabs, active: state.tab, variant: phone ? 'mobile' : 'compact', attr: 'data-sp-tab' });
  }

  function renderList() {
    const listEl = $('.sp-list');
    if (state.status === 'loading') { listEl.innerHTML = skeletonCards(6); return; }
    if (state.status === 'error') { listEl.innerHTML = errorState({ title: `Could not load ${cfg.plural}`, error: state.error, what: cfg.plural, retryId: 'sp-retry' }); return; }
    const rows = visible();
    if (!state.items.length) { listEl.innerHTML = `<div class="sp-empty-all">${emptyState({ title: `No ${cfg.plural} yet`, text: `${cap(cfg.plural)} you add will show up here.`, resetId: 'sp-reset' })}</div>`; return; }
    if (!rows.length) { listEl.innerHTML = emptyState({ title: `No ${cfg.plural} found`, text: 'Nothing matches your search. Try resetting the filters.', resetId: 'sp-reset' }); return; }
    listEl.innerHTML = rows.map((item) => {
      const r = cfg.row(item);
      const on = String(item.id) === String(state.selected) && !phone;
      if (r.custom) {
        return `<div class="booking-card list-row-card sp-row ${on ? 'active' : ''}" role="option" id="sp-opt-${esc(item.id)}" aria-selected="${on}" data-sp-id="${esc(item.id)}">
          ${r.custom}
        </div>`;
      }
      return `<div class="booking-card list-row-card sp-row ${on ? 'active' : ''}" role="option" id="sp-opt-${esc(item.id)}" aria-selected="${on}" data-sp-id="${esc(item.id)}">
        <div class="row-lead-col"><div class="row-avatar" aria-hidden="true">${r.tile}</div></div>
        <div class="card-info-col">
          <div class="row-name-line"><h3 class="card-title">${esc(r.name)}</h3>${r.pill || ''}</div>
          ${r.sub ? `<p class="row-trip">${r.raw ? r.sub : esc(r.sub)}</p>` : ''}
          ${r.meta ? `<div class="card-meta-row">${r.raw ? r.meta : `<span>${esc(r.meta)}</span>`}</div>` : ''}
        </div>
        ${cfg.rowMenu ? `<div class="card-right-col"><div class="card-action-btns-row">${rowMenuButton({ id: item.id, name: r.name, size: 15, attr: 'data-sp-menu' })}</div></div>` : ''}
      </div>`;
    }).join('');
    listEl.setAttribute('aria-activedescendant', state.selected ? `sp-opt-${state.selected}` : '');
    // the rows fade up once, when the list first appears (not on every search or filter)
    if (!state.entered) { state.entered = true; listEl.classList.add('is-entering'); setTimeout(() => listEl.classList.remove('is-entering'), 400); }
  }

  function renderDetail({ keepScroll = false } = {}) {
    const item = current();
    const scroller = $('.sp-detail-body');
    const detailEl = $('.sp-detail');
    const y = keepScroll && scroller ? scroller.scrollTop : 0;
    const clear = () => { $('.sp-detail-head').innerHTML = ''; $('.sp-detail-tabs').innerHTML = ''; $('.sp-detail-foot').innerHTML = ''; };
    detailEl.classList.toggle('is-empty', !item);
    if (state.status !== 'ready') {
      detailEl.classList.add('is-empty');
      clear();
      scroller.innerHTML = state.status === 'loading' ? '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' : '';
      return;
    }
    if (!item) {
      clear();
      scroller.innerHTML = selectEmptyState(/^(?!us)[aeiou]/i.test(cfg.noun) ? `an ${cfg.noun}` : `a ${cfg.noun}`);
      return;
    }
    let d = cfg.detail(item, { tab: state.dtab });
    if (d.tabs?.length && !d.tabs.some((t) => t.key === state.dtab)) { state.dtab = d.tabs[0].key; d = cfg.detail(item, { tab: state.dtab }); }
    $('.sp-detail-head').innerHTML = headerHtml(d.head);
    const tabsEl = $('.sp-detail-tabs');
    tabsEl.innerHTML = (d.tabs || []).map((t) => `<button type="button" role="tab" aria-selected="${t.key === state.dtab}" class="sheet-tab-btn ${t.key === state.dtab ? 'active' : ''}" data-sp-dtab="${esc(t.key)}">${esc(t.label)}</button>`).join('');
    tabsEl.hidden = !(d.tabs || []).length;
    scroller.innerHTML = `<div class="sp-content">${d.body}</div>`;
    scroller.scrollTop = y;
    const foot = $('.sp-detail-foot');
    foot.innerHTML = footerHtml(d.foot);
    foot.hidden = !d.foot;
    cfg.afterDetail?.(detailEl, item, api);
  }

  function renderHeader() {
    const line = state.status === 'ready' ? (cfg.subtitleShort || cfg.subtitle)(state.items) : '';
    const el = $('.sp-header-line');
    if (el) el.textContent = line;
    document.title = `${cfg.title} - Ruyi Admin`;
  }

  function renderAll() {
    renderHeader();
    renderTabsRow();
    renderList();
    renderDetail();
    syncPhoneView();
  }

  function syncPhoneView() {
    const open = phone && !!current();
    $('.sp-detail')?.classList.toggle('is-open', open);
    document.body.classList.toggle('sp-detail-open', open);
  }

  /* ---------- selection ---------- */
  /** The record the pane should show: the URL's, else the one already open, else none: the pane says "Select ..." until a row is clicked. */
  function reconcile() {
    if (state.status !== 'ready') return;
    const rows = visible();
    if (phone) {
      const wanted = getParams().selected;
      state.selected = wanted && rows.some((i) => String(i.id) === String(wanted)) ? wanted : null;
      return;
    }
    const keep = [getParams().selected, state.selected].filter(Boolean).map(String).map((id) => rows.find((i) => String(i.id) === id)).find(Boolean);
    state.selected = keep ? keep.id : null;
    if ((getParams().selected || null) !== (state.selected ? String(state.selected) : null)) setParams({ selected: state.selected }, { push: false, silent: true });
  }

  /** PC: back to the empty pane (Esc). */
  async function deselect() {
    if (phone || state.selected == null || !(await mayLeaveRecord())) return;
    state.selected = null;
    state.dtab = '';
    setParams({ selected: null }, { push: false, silent: true });
    renderList();
    renderDetail();
  }

  async function select(id, { push = true } = {}) {
    if (String(id) === String(state.selected)) { if (phone) { renderDetail(); syncPhoneView(); } return; }
    if (!(await mayLeaveRecord())) return;
    state.selected = id;
    state.dtab = '';
    setParams({ selected: id }, { push, silent: true });
    pushed = push && phone;
    renderList();
    renderDetail();
    syncPhoneView();
    if (!phone) $('.sp-list').querySelector('.list-row-card.active')?.scrollIntoView({ block: 'nearest' });
  }

  async function closePhoneDetail() {
    if (!(await mayLeaveRecord())) return;
    if (pushed) { pushed = false; history.back(); return; } // popstate re-reads the URL and closes it
    setParams({ selected: null }, { push: false });
  }

  function readParams() {
    const p = getParams();
    state.q = p.q || '';
    state.tab = cfg.tabs.some((t) => t.key === p.tab) ? p.tab : cfg.tabs[0].key;
    state.filter = cfg.filter ? (p.filter || '') : '';
    state.sort = cfg.sorts?.some((s) => s.value === p.sort) ? p.sort : '';
  }

  /** Back / forward / a link: read the URL again. */
  function onParams() {
    if (!alive) return;
    readParams();
    const input = searchInput();
    if (input && document.activeElement !== input) input.value = state.q;
    dd?.setValue(dropdownValue());
    const before = state.selected;
    reconcile();
    renderTabsRow();
    renderList();
    if (String(before) !== String(state.selected)) { state.dtab = ''; renderDetail(); } else renderDetail({ keepScroll: true });
    syncPhoneView();
  }

  /* ---------- events (on the host, so they survive a re-built shell) ---------- */
  function onClick(e) {
    const more = e.target.closest('[data-sp-menu]');
    if (more) { // the ⋮ of a row: the shared row menu (Edit first); it does not select the row
      const item = byId(more.dataset.spMenu);
      if (item) openRowMenu(more, cfg.rowMenu(item), (key) => cfg.onRowMenu(key, item));
      return;
    }
    const row = e.target.closest('[data-sp-id]');
    if (row) { select(byId(row.dataset.spId)?.id ?? row.dataset.spId); return; }
    const tab = e.target.closest('[data-sp-tab]');
    if (tab) { setParams({ tab: tab.dataset.spTab === cfg.tabs[0].key ? null : tab.dataset.spTab }, { push: false }); return; }
    const dtab = e.target.closest('[data-sp-dtab]');
    if (dtab) { state.dtab = dtab.dataset.spDtab; renderDetail(); return; }
    if (e.target.closest('[data-sp-back]')) { closePhoneDetail(); return; }
    if (e.target.closest('#sp-reset')) { setParams({ q: null, tab: null, sort: null, filter: null }, { push: false }); return; }
    if (e.target.closest('#sp-retry')) load();
  }
  host.addEventListener('click', onClick);
  const unsub = subscribe(onParams);
  const onLayout = () => {
    if (!alive || isPhone() === phone) return;
    buildShell();
    onParams();
    renderHeader();
  };
  window.addEventListener('layout-changed', onLayout);
  // Esc belongs to an open sheet or dialog first, and to a field being typed in; otherwise it deselects the record
  const onEsc = (e) => { if (e.key === 'Escape' && !e.defaultPrevented && alive && !phone && !hasOpenLayer() && !e.target.closest?.('input, textarea, select')) deselect(); };
  window.addEventListener('keydown', onEsc);

  /* ---------- data ---------- */
  async function load() {
    state.status = 'loading';
    readParams();
    buildShell();
    renderAll();
    try {
      state.items = (await cfg.load()).map((i) => ({ ...i, id: String(i.id) })); // ids are strings everywhere: the URL's are
      state.status = 'ready';
    } catch (err) {
      state.status = 'error';
      state.error = err;
    }
    if (!alive) return;
    readParams();
    dd?.setValue(dropdownValue());
    const input = searchInput();
    if (input) input.value = state.q;
    reconcile();
    renderAll();
  }

  const api = {
    items: () => state.items,
    current,
    reload: load,
    /** Replace the list (a record was added or edited in memory) and show it. */
    setItems(items) { state.items = items.map((i) => ({ ...i, id: String(i.id) })); state.status = 'ready'; reconcile(); renderAll(); },
    /** Open a record (PC: in the pane; phone: its sheet). */
    select: (id) => select(String(id)),
    /** A page that edits the open record reports whether it has unsaved changes. */
    bindDirty(fn) { dirtyApi = { isDirty: fn }; },
    /** Open one of the detail tabs. */
    setTab(key) { state.dtab = key; renderDetail(); },
    /** After saving or changing a record: show it again without losing the scroll position. */
    refresh() { renderHeader(); renderTabsRow(); renderList(); renderDetail({ keepScroll: true }); },
  };

  load();

  return {
    api,
    isDirty: () => dirtyApi.isDirty(),
    destroy() {
      alive = false;
      clearTimeout(timer);
      unsub();
      host.removeEventListener('click', onClick);
      window.removeEventListener('layout-changed', onLayout);
      window.removeEventListener('keydown', onEsc);
      ctx.setAddButton?.(null);
      document.body.classList.remove('sp-detail-open');
    },
  };
}

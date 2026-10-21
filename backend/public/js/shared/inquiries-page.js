// Inquiries page. Same shell, classes and components as Bookings; rendered for either the
// desktop table layout or the mobile card layout.
import { INITIAL_BOOKINGS, STAFF_MEMBERS } from '../data.js';
import { icon } from './icons.js';
import { getParams, setParams, subscribe } from './page-state.js';
import { createFilter } from './filter.js';
import { openFollowUpModal } from './followup-modal.js';
import { journeyFor, renderJourneyItems, subscribeFollowUps, phoneKey } from './followups.js';
import {
  esc, toast, initials, searchBox, statusTabs, contactButtons, rowMenuButton, openCall, openWhatsApp,
  emptyState, selectionBar, checkbox, openRowMenu, closeRowMenu, dismissOnOutside,
} from './ui.js';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'warm', label: 'Warm' },
  { key: 'hot', label: 'Hot' },
];
const STATUS_LABEL = Object.fromEntries(TABS.map((t) => [t.key, t.label]));

export const INQUIRY_FILTERS = {
  title: 'Filter inquiries',
  fields: [
    { key: 'status', label: 'Status', type: 'select', options: TABS.filter((t) => t.key !== 'all').map((t) => ({ value: t.key, label: t.label })) },
    { type: 'daterange', key: 'date', label: 'Travel date', fromKey: 'from', toKey: 'to' },
    {
      key: 'assigned', label: 'Assigned to', type: 'select',
      options: [{ value: 'none', label: 'Unassigned' }, ...STAFF_MEMBERS.map((s) => ({ value: s.id, label: s.name }))],
    },
  ],
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const paxNights = (i) => `${i.pax} Pax • ${i.nights}N`;
const statusPill = (s) => `<span class="status-pill status-inq-${s}"><span class="dot"></span>${STATUS_LABEL[s] || s}</span>`;

/** Existing journey entries for a customer, taken from a booking that shares the phone number. */
function baselineFlow(phone) {
  const key = phoneKey(phone);
  const b = INITIAL_BOOKINGS.find((x) => phoneKey(x.customer?.phone || x.guest?.phone) === key);
  return b?.customer?.leadFlow || [];
}

export function createInquiriesPage(slot, { variant }) {
  const isDesktop = variant === 'desktop';
  const p = isDesktop ? 'dinq' : 'minq';
  let inquiries = [];
  let loaded = false;
  let failed = false;
  let visible = false;
  const selected = new Set();
  let detailId = null;

  const filter = createFilter({
    config: INQUIRY_FILTERS,
    onApply: (v) => setParams({ tab: v.status || null, assigned: v.assigned || null, from: v.from || null, to: v.to || null }),
  });

  // ---- skeleton -----------------------------------------------------------
  slot.innerHTML = isDesktop ? `
    <div class="desktop-body">
      <div class="desktop-content-col">
        <div class="desktop-workspace-split">
          <div class="desktop-table-container">
            <div class="desktop-full-table-view">
              <div class="table-toolbar">
                <div id="${p}-tabs"></div>
                <div class="toolbar-actions-group">
                  <div id="${p}-search">${searchBox({ id: `${p}-search-input`, placeholder: 'Search inquiries...', variant: 'desktop' })}</div>
                  <span id="${p}-filter-slot"></span>
                </div>
              </div>
              <div class="filter-chips" id="${p}-chips" hidden></div>
              ${selectionBar({ prefix: p, desktop: true })}
              <table class="bookings-table">
                <thead><tr>
                  <th style="width:44px;padding-left:20px;padding-right:0;"><div class="custom-checkbox" id="${p}-th-select-all" role="checkbox" aria-checked="false" aria-label="Select all inquiries" tabindex="0">${icon('check', { size: 12, stroke: 3 })}</div></th>
                  <th style="min-width:240px;padding-left:14px;">Customer</th>
                  <th>Trip</th>
                  <th>Pax &amp; Nights</th>
                  <th>Travel Date</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th style="text-align:right;padding-right:24px;min-width:160px;">Action</th>
                </tr></thead>
                <tbody id="${p}-list"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>` : `
    <div class="mobile-search-row">
      ${searchBox({ id: `${p}-search-input`, placeholder: 'Search inquiries...', variant: 'mobile' })}
      <span id="${p}-filter-slot"></span>
    </div>
    <div class="filter-chips" id="${p}-chips" hidden></div>
    <div id="${p}-tabs"></div>
    ${selectionBar({ prefix: p, desktop: false })}
    <div class="bookings-cards-list" id="${p}-list"></div>`;

  const $ = (s) => slot.querySelector(s);
  filter.attachButton($(`#${p}-filter-slot`));
  filter.attachChips($(`#${p}-chips`));

  // ---- state from the URL ----------------------------------------------------
  const params = () => {
    const q = getParams();
    return {
      q: q.q || '', tab: TABS.some((t) => t.key === q.tab) ? q.tab : 'all',
      assigned: q.assigned || '', from: q.from || '', to: q.to || '',
    };
  };

  const matches = (i, s, withTab) => {
    if (withTab && s.tab !== 'all' && i.status !== s.tab) return false;
    if (s.q) {
      const hay = `${i.customer_name} ${i.trip} ${i.customer_phone} ${i.id}`.toLowerCase();
      if (!hay.includes(s.q.toLowerCase())) return false;
    }
    if (s.assigned && (s.assigned === 'none' ? i.assigned_to_id : i.assigned_to_id !== s.assigned)) return false;
    if (s.from && (!i.travel_date || i.travel_date < s.from)) return false;
    if (s.to && (!i.travel_date || i.travel_date > s.to)) return false;
    return true;
  };

  // ---- rendering -------------------------------------------------------------
  function render() {
    if (!visible) return;
    const s = params();
    filter.setValues({ status: s.tab === 'all' ? '' : s.tab, assigned: s.assigned, from: s.from, to: s.to });

    const input = $(`#${p}-search-input`);
    if (input && document.activeElement !== input) input.value = s.q;

    const tabs = TABS.map((t) => ({ ...t, count: inquiries.filter((i) => matches(i, { ...s, tab: 'all' }, true) && (t.key === 'all' || i.status === t.key)).length }));
    $(`#${p}-tabs`).innerHTML = statusTabs({ tabs, active: s.tab, variant: isDesktop ? 'desktop' : 'mobile', attr: 'data-inq-tab' });

    const rows = inquiries.filter((i) => matches(i, s, true));
    for (const id of [...selected]) if (!inquiries.some((i) => i.id === id)) selected.delete(id);

    const list = $(`#${p}-list`);
    if (!loaded) {
      list.innerHTML = isDesktop ? '<tr><td colspan="8" style="text-align:center;padding:48px;color:#94A3B8;">Loading inquiries...</td></tr>'
        : '<p style="text-align:center;padding:48px 0;color:#94A3B8;">Loading inquiries...</p>';
    } else if (failed) {
      list.innerHTML = isDesktop ? '<tr><td colspan="8" style="text-align:center;padding:48px;color:#B91C1C;">Could not load inquiries.</td></tr>'
        : '<p style="text-align:center;padding:48px 0;color:#B91C1C;">Could not load inquiries.</p>';
    } else if (!rows.length) {
      list.innerHTML = emptyState({ title: 'No inquiries found', text: 'No results matching your query. Try resetting filters.', resetId: `${p}-reset`, colspanRow: isDesktop ? 8 : 0 });
    } else {
      list.innerHTML = rows.map(isDesktop ? rowDesktop : rowMobile).join('');
    }

    const n = selected.size;
    $(`#${p}-selected-count`).textContent = `${n} selected`;
    $(`#${p}-selection-bar`).style.display = n ? 'flex' : 'none';
    [`#${p}-select-all-box`, `#${p}-th-select-all`].forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      el.classList.toggle('checked', n > 0);
      el.setAttribute('aria-checked', n > 0);
    });
    renderBulkMenu();
    updateHeaderTotal();
    if (detailId) renderDetail();
  }

  const nameCell = (i) => `
    <div class="table-booking-cell">
      <div class="table-thumb inq-avatar">${esc(initials(i.customer_name))}</div>
      <div class="table-booking-info"><h4>${esc(i.customer_name)}</h4><p>${esc(i.customer_phone)}</p></div>
    </div>`;

  const actions = (i, size, style = '') => `${contactButtons({ id: i.id, name: i.customer_name, phone: i.customer_phone, size, callAttr: 'data-inq-call', waAttr: 'data-inq-wa', style })}${rowMenuButton({ id: i.id, name: i.customer_name, size })}`;

  function rowDesktop(i) {
    const sel = selected.has(i.id);
    return `
      <tr class="${sel ? 'row-checked' : ''}" data-inq-row="${esc(i.id)}" style="cursor:pointer;">
        <td style="width:44px;padding-left:20px;padding-right:0;" class="td-checkbox-cell">${checkbox({ checked: sel, attr: 'data-inq-select', id: i.id, label: `Select ${i.customer_name}` })}</td>
        <td style="padding-left:14px;">${nameCell(i)}</td>
        <td><span style="font-weight:600;color:#0F172A;">${esc(i.trip)}</span><div style="font-size:12px;color:#64748B;">${esc(i.id)}</div></td>
        <td><span style="font-weight:600;color:#0F172A;">${i.pax} Pax</span><div style="font-size:12px;color:#64748B;">${i.nights} Night${i.nights === 1 ? '' : 's'}</div></td>
        <td><span style="font-weight:500;color:#334155;">${fmtDate(i.travel_date)}</span></td>
        <td><span style="font-size:13px;font-weight:500;color:#1E293B;">${esc(i.assigned_to_name || 'Unassigned')}</span></td>
        <td>${statusPill(i.status)}</td>
        <td style="text-align:right;padding-right:20px;"><div class="desktop-action-btn-group">${actions(i, 14)}</div></td>
      </tr>`;
  }

  function rowMobile(i) {
    const sel = selected.has(i.id);
    return `
      <div class="booking-card ${sel ? 'card-selected' : ''}" data-inq-card="${esc(i.id)}">
        ${checkbox({ checked: sel, attr: 'data-inq-select', id: i.id, label: `Select ${i.customer_name}` })}
        <div class="card-thumb-wrapper inq-avatar">${esc(initials(i.customer_name))}</div>
        <div class="card-info-col">
          <h3 class="card-title">${esc(i.customer_name)}</h3>
          <div class="card-meta-row">${icon('send', { size: 13 })}<span class="card-meta-text">${esc(i.trip)}</span></div>
          <div class="card-meta-row">${icon('user', { size: 13 })}<span>${paxNights(i)}</span></div>
          <div class="card-meta-row">${icon('calendar', { size: 13 })}<span>${fmtDate(i.travel_date)}</span></div>
        </div>
        <div class="card-right-col">
          <div class="card-action-btns-row">${actions(i, 15)}</div>
          <div class="card-price-status-row">${statusPill(i.status)}</div>
        </div>
      </div>`;
  }

  function updateHeaderTotal() {
    const el = document.getElementById('mobile-header-subtitle');
    if (!isDesktop && el) el.textContent = `Inquiries • ${inquiries.length} Total`;
    const badge = document.getElementById('sidebar-inquiries-badge');
    if (isDesktop && badge && loaded) badge.textContent = inquiries.length;
  }

  // ---- bulk selection + assign ------------------------------------------------
  let bulkOpen = false;
  function renderBulkMenu() {
    const menu = $(`#${p}-bulk-more-dropdown`);
    if (!menu) return;
    if (!selected.size) { bulkOpen = false; menu.style.display = 'none'; return; }
    menu.innerHTML = `
      <button class="dropdown-item-btn" role="menuitem" data-inq-bulk="assign">${icon('assign', { size: 15 })}<span>Assign</span></button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item-btn item-danger" role="menuitem" data-inq-bulk="clear">${icon('close', { size: 14 })}<span>Clear Selection</span></button>`;
    menu.style.display = bulkOpen ? 'block' : 'none';
    $(`#${p}-bulk-more-btn`).setAttribute('aria-expanded', bulkOpen);
  }

  function openAssignModal(ids) {
    let staffId = STAFF_MEMBERS[0].id;
    const ov = document.createElement('div');
    ov.className = 'modal-overlay open inq-assign-overlay';
    ov.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="${p}-assign-title">
        <div class="modal-header"><h3 id="${p}-assign-title">Assign ${ids.length} inquir${ids.length === 1 ? 'y' : 'ies'}</h3>
          <button class="sheet-close-btn" data-x aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:8px;align-items:stretch;" role="radiogroup" aria-label="Team member">
          ${STAFF_MEMBERS.map((m, k) => `
            <div class="vendor-item-card ${k === 0 ? 'selected' : ''}" data-staff="${m.id}" role="radio" aria-checked="${k === 0}" tabindex="0" style="padding:8px 12px;cursor:pointer;">
              <div class="vendor-item-left" style="gap:10px;">
                <div class="custom-radio ${k === 0 ? 'checked' : ''}"></div>
                <img src="${esc(m.avatar)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />
                <div class="vendor-info"><h4 style="font-size:13.5px;margin:0;">${esc(m.name)}</h4><p style="font-size:12px;color:#64748B;margin:0;">${esc(m.role)}</p></div>
              </div>
            </div>`).join('')}
        </div>
        <div class="modal-footer"><button class="btn-secondary-desktop" data-x>Cancel</button><button class="btn-primary-desktop" data-ok>Assign</button></div>
      </div>`;
    document.body.appendChild(ov);
    const stop = dismissOnOutside(ov.querySelector('.modal-card'), close);
    const pick = (card) => {
      staffId = card.dataset.staff;
      ov.querySelectorAll('[data-staff]').forEach((c) => {
        const on = c === card;
        c.classList.toggle('selected', on);
        c.setAttribute('aria-checked', on);
        c.querySelector('.custom-radio').classList.toggle('checked', on);
      });
    };
    ov.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-staff]')) { e.preventDefault(); pick(e.target.closest('[data-staff]')); } });
    ov.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-staff]');
      if (card) return pick(card);
      if (e.target.closest('[data-x]')) return close();
      if (!e.target.closest('[data-ok]')) return;
      try {
        const res = await fetch('/api/inquiries/assign', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ids, staff_id: staffId }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error();
        body.data.forEach((u) => { const k = inquiries.findIndex((x) => x.id === u.id); if (k > -1) inquiries[k] = u; });
        selected.clear();
        close();
        toast(body.message, 'success');
        render();
      } catch { toast('Could not assign. Try again.', 'warning'); }
    });
    function close() { stop(); ov.remove(); }
    ov.querySelector('[data-staff]').focus();
  }

  // ---- detail (customer details + lead journey) ---------------------------------
  let detailEl = null;
  function openDetail(id) {
    detailId = id;
    if (!detailEl) {
      detailEl = document.createElement('div');
      detailEl.className = 'modal-overlay open inq-detail-overlay';
      document.body.appendChild(detailEl);
      detailEl.addEventListener('click', (e) => {
        if (e.target === detailEl || e.target.closest('[data-x]')) return closeDetail();
        if (e.target.closest('[data-inq-add-followup]')) openFollowUpModal(inquiries.find((i) => i.id === detailId), { onSaved: refresh });
      });
    }
    renderDetail();
    detailEl.querySelector('[data-x]')?.focus();
  }
  function closeDetail() {
    detailId = null;
    detailEl?.remove();
    detailEl = null;
  }
  function renderDetail() {
    const i = inquiries.find((x) => x.id === detailId);
    if (!i || !detailEl) return closeDetail();
    const steps = journeyFor({ phone: i.customer_phone, leadFlow: baselineFlow(i.customer_phone) });
    const cell = (label, v) => `<div class="info-cell"><span class="info-label">${label}</span><span class="info-value-text">${esc(v || '—')}</span></div>`;
    detailEl.innerHTML = `
      <div class="modal-card inq-detail-card" role="dialog" aria-modal="true" aria-labelledby="${p}-detail-title">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div class="table-thumb inq-avatar">${esc(initials(i.customer_name))}</div>
            <div style="min-width:0;"><h3 id="${p}-detail-title" style="margin:0;">${esc(i.customer_name)}</h3>
              <p style="font-size:12.5px;color:#64748B;margin:2px 0 0;">${esc(i.trip)}</p></div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">${statusPill(i.status)}
            <button class="sheet-close-btn" data-x aria-label="Close" style="position:static;">${icon('close', { size: 16, stroke: 2.5 })}</button></div>
        </div>
        <div class="modal-body inq-detail-body">
          <div class="details-section-card">
            <div class="details-section-header"><div class="section-header-left">
              <div class="section-icon-circle blue-circle">${icon('user', { size: 16 })}</div><h3>Customer Information</h3></div></div>
            <div class="customer-info-grid">
              ${cell('Primary Contact', i.customer_phone)}${cell('Email', i.customer_email)}
              ${cell('Location', i.location)}${cell('Lead Source', i.lead_source)}
              ${cell('Travel Date', fmtDate(i.travel_date))}${cell('Pax & Nights', paxNights(i))}
              ${cell('Assigned To', i.assigned_to_name || 'Unassigned')}${cell('Inquiry ID', i.id)}
            </div>
            ${i.notes ? `<p class="journey-desc" style="margin-top:12px;">${esc(i.notes)}</p>` : ''}
          </div>
          <div class="details-section-card">
            <div class="details-section-header">
              <div class="section-header-left"><div class="section-icon-circle blue-circle">${icon('send', { size: 16 })}</div><h3>Lead Flow / Journey</h3></div>
              <button class="btn-add-followup" data-inq-add-followup>${icon('calendar', { size: 14, stroke: 2.5 })} Add Follow-up</button>
            </div>
            <div class="lead-journey-timeline">${renderJourneyItems(steps)}</div>
          </div>
        </div>
      </div>`;
  }

  // ---- events -------------------------------------------------------------------
  const find = (id) => inquiries.find((i) => i.id === id);
  const toggleSelect = (id) => { selected.has(id) ? selected.delete(id) : selected.add(id); render(); };

  slot.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-inq-tab]');
    if (tab) return setParams({ tab: tab.dataset.inqTab === 'all' ? null : tab.dataset.inqTab });

    if (e.target.closest(`#${p}-reset`)) return setParams({ q: null, tab: null, assigned: null, from: null, to: null });

    const sel = e.target.closest('[data-inq-select]');
    if (sel) { e.stopPropagation(); return toggleSelect(sel.dataset.inqSelect); }
    if (e.target.closest(`#${p}-select-all-box`) || e.target.closest(`#${p}-th-select-all`)) {
      const s = params();
      const visibleIds = inquiries.filter((i) => matches(i, s, true)).map((i) => i.id);
      if (selected.size) selected.clear(); else visibleIds.forEach((id) => selected.add(id));
      return render();
    }

    const call = e.target.closest('[data-inq-call]');
    if (call) { e.stopPropagation(); const i = find(call.dataset.inqCall); return openCall(i.customer_name, i.customer_phone); }
    const wa = e.target.closest('[data-inq-wa]');
    if (wa) {
      e.stopPropagation();
      const i = find(wa.dataset.inqWa);
      return openWhatsApp(i.customer_name, i.customer_phone, `Hi ${i.customer_name}, this is Ruyi Travel Operations regarding your inquiry ${i.id} (${i.trip}).`);
    }
    const more = e.target.closest('[data-row-menu]');
    if (more) {
      e.stopPropagation();
      const i = find(more.dataset.rowMenu);
      return openRowMenu(more, [
        { key: 'email', label: 'Email', icon: 'mail' },
        { key: 'calendar', label: 'Calendar', icon: 'calendar' },
      ], (key) => {
        if (key === 'email') {
          if (!i.customer_email) return toast('No email on file for this customer.', 'warning');
          window.location.href = `mailto:${i.customer_email}?subject=${encodeURIComponent(`Your inquiry ${i.id}: ${i.trip}`)}`;
          toast(`Drafting email to ${i.customer_email}...`, 'info');
        } else {
          openFollowUpModal(i, { onSaved: refresh });
        }
      });
    }

    if (e.target.closest(`#${p}-bulk-more-btn`)) { bulkOpen = !bulkOpen; return renderBulkMenu(); }
    const bulk = e.target.closest('[data-inq-bulk]');
    if (bulk) {
      bulkOpen = false;
      if (bulk.dataset.inqBulk === 'clear') { selected.clear(); return render(); }
      return openAssignModal([...selected]);
    }

    const row = e.target.closest('[data-inq-row], [data-inq-card]');
    if (row) openDetail(row.dataset.inqRow || row.dataset.inqCard);
  });

  slot.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.custom-checkbox')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Escape' && bulkOpen) { bulkOpen = false; renderBulkMenu(); }
  });
  document.addEventListener('mousedown', (e) => {
    if (bulkOpen && !e.target.closest(`#${p}-bulk-more-btn, #${p}-bulk-more-dropdown`)) { bulkOpen = false; renderBulkMenu(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detailEl && !document.querySelector('.fu-overlay, .row-floating-menu, .inq-assign-overlay')) closeDetail(); });

  slot.addEventListener('input', (e) => {
    if (e.target.id === `${p}-search-input`) setParams({ q: e.target.value.trim() }, { push: false });
  });

  subscribe(render);
  subscribeFollowUps(() => { if (detailId) renderDetail(); });

  async function refresh() {
    try {
      const res = await fetch('/api/inquiries', { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      inquiries = (await res.json()).data;
      failed = false;
    } catch {
      failed = !loaded;
    }
    loaded = true;
    render();
  }

  refresh();

  return {
    show() { visible = true; closeRowMenu(); render(); if (loaded) refresh(); },
    hide() { visible = false; closeDetail(); closeRowMenu(); filter.close(); },
    total: () => inquiries.length,
  };
}

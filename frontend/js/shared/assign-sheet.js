// The one Assign flow for Bookings and Inquiries (single from the ⋮ menu, many from the bulk bar).
// Bottom sheet on phones, centered modal on larger screens (CSS decides); same markup everywhere.
import { STAFF_MEMBERS, VENDORS_LIST, CONTACTS_LIST } from '../data.js';
import { icon } from './icons.js';
import { esc, toast, initials, dismissOnOutside, openWhatsApp, bindSheet } from './ui.js';
import { createDropdown } from './dropdown-filter.js';
import { applyInquiryUpdates } from './inquiry-store.js';

const TABS = ['Team Members', 'Vendors', 'Contacts'];
const ADD_LABEL = { 'Team Members': 'Add New Team Member', Vendors: 'Add New Vendor', Contacts: 'Add New Contact' };
const SEARCH_HINT = { 'Team Members': 'Search team member by name, role or phone...', Vendors: 'Search vendor by name, service or phone...', Contacts: 'Search contact by name, role or phone...' };

const FILTERS = {
  'Team Members': [
    { value: '', label: 'All roles' }, { value: 'role:operations', label: 'Operations' }, { value: 'role:coordinator', label: 'Coordinators' },
    { value: 'role:dispatch', label: 'Dispatch' }, { value: 'sort:fewest', label: 'Fewest trips' }, { value: 'sort:most', label: 'Most trips' },
  ],
  Vendors: [
    { value: '', label: 'All services' }, { value: 'role:rafting', label: 'Rafting' }, { value: 'role:trekking', label: 'Trekking' }, { value: 'sort:az', label: 'Name A–Z' },
  ],
  Contacts: [
    { value: '', label: 'All roles' }, { value: 'role:driver', label: 'Drivers' }, { value: 'role:guide', label: 'Guides' }, { value: 'sort:az', label: 'Name A–Z' },
  ],
};

// Local, session-only additions from "Add New ..."
const added = { 'Team Members': [], Vendors: [], Contacts: [] };

function people(tab) {
  if (tab === 'Team Members') return [...added[tab], ...STAFF_MEMBERS.map((m) => ({ id: m.id, name: m.name, sub: `${m.role} • ${m.phone}`, hay: m.role, phone: m.phone, avatar: m.avatar, role: m.role, badge: `${m.activeTrips} Trips`, n: m.activeTrips }))];
  if (tab === 'Vendors') return [...added[tab], ...VENDORS_LIST.map((v) => ({ id: v.id, name: v.name, sub: `${v.service} • ${v.phone}`, hay: v.service, phone: v.phone, avatar: v.image, role: v.service, badge: '', n: 0 }))];
  return [...added[tab], ...CONTACTS_LIST.map((c) => ({ id: c.id, name: c.name, sub: `${c.role} • ${c.phone}`, hay: c.role, phone: c.phone, avatar: c.avatar, role: c.role, badge: '', n: 0 }))];
}

let current = null;

/**
 * @param {{ kind: 'booking'|'inquiry', items: Array<{id:string,title:string,name:string,badge?:string,badgeClass?:string,image?:string}>,
 *           onDone?: () => void }} cfg
 */
export function openAssign({ kind, items, onDone }) {
  closeAssign();
  if (!items.length) return;
  let tab = 'Team Members';
  let query = '';
  let filter = '';
  let selected = people(tab)[0];
  let adding = false;

  const noun = kind === 'inquiry' ? 'Inquiries' : 'Bookings';
  const first = items[0];
  const ov = document.createElement('div');
  ov.className = 'asg-overlay';
  ov.innerHTML = `
    <div class="asg-sheet" role="dialog" aria-modal="true" aria-labelledby="asg-title">
      <div class="filter-handle" aria-hidden="true"></div>
      <header class="asg-header"><h3 id="asg-title">Assign to</h3>
        <button type="button" class="sheet-close-btn" data-asg-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
      <div class="asg-summary">
        ${first.image ? `<div class="asg-thumb"><img src="${esc(first.image)}" alt="" /></div>` : `<div class="row-avatar">${esc(initials(first.name))}</div>`}
        <div class="asg-summary-info"><h4>${items.length} ${noun} Selected</h4><p>${esc(items.map((i) => i.id).join(', '))}</p></div>
        ${items.length === 1 && first.badge ? `<span class="status-pill ${esc(first.badgeClass || '')}"><span class="dot"></span>${esc(first.badge)}</span>` : ''}
      </div>
      <div class="assign-tabs-row asg-tabs" role="tablist">${TABS.map((t) => `<button type="button" role="tab" class="assign-tab-btn ${t === tab ? 'active' : ''}" aria-selected="${t === tab}" data-asg-tab="${t}">${t}</button>`).join('')}</div>
      <div class="asg-search-row">
        <div class="vendor-search-input-box">${icon('search', { size: 16 })}<input type="text" id="asg-search" aria-label="Search" /></div>
        <span id="asg-filter"></span>
      </div>
      <div class="asg-scroll">
        <div class="vendor-list-scroll asg-list" id="asg-list" role="radiogroup" aria-label="Assignee"></div>
        <button type="button" class="btn-add-new-vendor" data-asg-add>${icon('assign', { size: 16 })}<span id="asg-add-label"></span></button>
        <form class="asg-add-form" id="asg-add-form" hidden>
          <input type="text" name="name" placeholder="Full name" aria-label="Full name" required maxlength="80" />
          <input type="tel" name="phone" placeholder="Phone" aria-label="Phone" maxlength="30" />
          <button type="submit" class="btn-primary-desktop">Add</button>
        </form>
        <div class="optional-note-box">
          <div class="optional-note-label">${icon('alertCircle', { size: 14 })} Optional Note</div>
          <input type="text" class="optional-note-input" id="asg-note" maxlength="200" placeholder="e.g. Confirm timing and group size" aria-label="Optional note" />
        </div>
      </div>
      <div class="assign-footer-actions asg-footer">
        <button type="button" class="btn-cancel-assign" data-asg-close>Cancel</button>
        <button type="button" class="btn-whatsapp-assign" data-asg-submit>${icon('whatsapp', { size: 18 })}<span>Assign &amp; Send on WhatsApp</span></button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => ov.classList.add('open'), 10);

  const $ = (s) => ov.querySelector(s);
  const dd = createDropdown({ options: () => FILTERS[tab], onChange: (v) => { filter = v; renderList(); }, variant: 'icon', ariaLabel: 'Filter list' });
  dd.attach($('#asg-filter'));

  function renderList() {
    $('#asg-search').placeholder = SEARCH_HINT[tab];
    $('#asg-add-label').textContent = ADD_LABEL[tab];
    let list = people(tab).filter((p) => !query || `${p.name} ${p.sub}`.toLowerCase().includes(query.toLowerCase()));
    if (filter.startsWith('role:')) list = list.filter((p) => p.hay.toLowerCase().includes(filter.slice(5)));
    if (filter === 'sort:fewest') list = [...list].sort((a, b) => a.n - b.n);
    if (filter === 'sort:most') list = [...list].sort((a, b) => b.n - a.n);
    if (filter === 'sort:az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    $('#asg-list').innerHTML = list.length ? list.map((p) => {
      const on = selected?.id === p.id;
      return `<div class="vendor-item-card ${on ? 'selected' : ''}" role="radio" aria-checked="${on}" tabindex="0" data-asg-pick="${esc(p.id)}">
        <div class="vendor-item-left">
          <div class="custom-radio ${on ? 'checked' : ''}">${on ? icon('check', { size: 10, stroke: 3 }) : ''}</div>
          ${p.avatar ? `<img src="${esc(p.avatar)}" class="vendor-avatar" style="border-radius:50%;" alt="" />` : `<div class="row-avatar asg-mini-avatar">${esc(initials(p.name))}</div>`}
          <div class="vendor-info"><h4>${esc(p.name)}</h4><p>${esc(p.sub)}</p></div>
        </div>
        ${p.badge ? `<span class="asg-badge">${esc(p.badge)}</span>` : ''}
      </div>`;
    }).join('') : '<p class="asg-empty">No matches. Try another search or filter.</p>';
  }
  renderList();

  const stopOutside = dismissOnOutside($('.asg-sheet'), closeAssign);
  const stopSheet = bindSheet(ov, $('.asg-sheet'), closeAssign);
  const stop = () => { stopOutside(); stopSheet(); };

  ov.addEventListener('click', (e) => {
    if (e.target === ov || e.target.closest('[data-asg-close]')) return closeAssign();
    const t = e.target.closest('[data-asg-tab]');
    if (t) {
      tab = t.dataset.asgTab; query = ''; filter = ''; $('#asg-search').value = '';
      ov.querySelectorAll('[data-asg-tab]').forEach((b) => { const on = b === t; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
      selected = people(tab)[0];
      dd.setValue('');
      renderList();
      return;
    }
    const pick = e.target.closest('[data-asg-pick]');
    if (pick) { selected = people(tab).find((p) => p.id === pick.dataset.asgPick); renderList(); return; }
    if (e.target.closest('[data-asg-add]')) { adding = !adding; $('#asg-add-form').hidden = !adding; if (adding) $('#asg-add-form input').focus(); return; }
    if (e.target.closest('[data-asg-submit]')) submit();
  });
  ov.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-asg-pick]')) { e.preventDefault(); e.target.click(); }
    if (e.key !== 'Tab') return;
    const f = [...$('.asg-sheet').querySelectorAll('button, input, [tabindex="0"]')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  $('#asg-search').addEventListener('input', (e) => { query = e.target.value.trim(); renderList(); });
  $('#asg-add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = String(fd.get('name') || '').trim();
    if (!name) return;
    const phone = String(fd.get('phone') || '').trim();
    const p = { id: `NEW-${Date.now()}`, name, sub: phone || ADD_LABEL[tab].replace('Add New ', ''), hay: '', phone, avatar: '', role: ADD_LABEL[tab].replace('Add New ', ''), badge: '', n: 0 };
    added[tab].unshift(p);
    selected = p; adding = false; e.target.reset(); e.target.hidden = true;
    renderList();
  });
  $('#asg-search').focus({ preventScroll: true });

  async function submit() {
    if (!selected) return toast('Choose who to assign to.', 'info');
    const a = selected;
    const note = $('#asg-note').value.trim();
    const btn = $('[data-asg-submit]');
    btn.disabled = true;
    // Open WhatsApp in the click gesture so browsers don't block it.
    if (a.phone) {
      const what = items.length === 1 ? `${first.title} (${first.id})` : `${items.length} ${noun.toLowerCase()} (${items.map((i) => i.id).join(', ')})`;
      openWhatsApp(a.name, a.phone, `Hi ${a.name}, you have been assigned ${what}.${note ? ` Note: ${note}` : ''}`, { silent: true });
    }
    try {
      const body = kind === 'inquiry'
        ? { ids: items.map((i) => i.id), assignee_id: a.id, assignee_name: a.name }
        : { ids: items.map((i) => i.id), assignee: { id: a.id, name: a.name, type: tab, avatar: a.avatar, role: a.role } };
      const res = await fetch(kind === 'inquiry' ? '/api/inquiries/assign' : '/api/bookings/assign', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body),
      });
      const out = await res.json();
      if (!res.ok) throw new Error();
      if (kind === 'inquiry') applyInquiryUpdates(out.data);
      closeAssign();
      toast(`Assigned ${a.name} to ${items.length} ${items.length === 1 ? (kind === 'inquiry' ? 'inquiry' : 'booking') : noun.toLowerCase()}`, 'success');
      onDone?.({ id: a.id, name: a.name, avatar: a.avatar, role: a.role });
    } catch {
      btn.disabled = false;
      toast('Could not assign. Try again.', 'warning');
    }
  }

  current = { ov, stop, dd };
}

export function closeAssign() {
  if (!current) return;
  current.stop();
  current.dd.close();
  const { ov } = current;
  current = null;
  ov.classList.remove('open');
  setTimeout(() => ov.remove(), 200);
}

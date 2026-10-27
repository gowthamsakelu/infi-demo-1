// Users & Permissions: the team on the left; on the right the person's numbers and a module access matrix (View / Edit / Delete).
// The matrix is edited in place and saved with Save changes (PUT); until then the page reports unsaved changes so the shared discard
// confirm appears when switching person or leaving. Deactivate user changes the person's status. Invite User and Reset password are drawn only.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, initials } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { confirmDialog } from '../shared/sheet.js';
import { pill, statRow, detailGrid, rowGroup, linkRow, plural } from '../shared/page-ui.js';

const ACTIONS = ['view', 'edit', 'delete'];
const STATUS = { active: 'Active', pending: 'Pending', inactive: 'Inactive' };

/** "Online", "5 min ago", "1 hr ago", "Yesterday", "3 days ago". */
function ago(iso, fallback = 'Never') {
  if (!iso) return fallback;
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 2) return 'Online';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'Yesterday' : days < 31 ? `${days} days ago` : new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
const lastSeen = (u) => ago(u.lastActiveAt, u.status === 'pending' ? 'Invite sent' : 'Never');
const tone = (u) => `us-t${(Number(u.id) || 0) % 6}`;
const avatar = (u) => `<span class="us-av ${tone(u)}" aria-hidden="true">${esc(initials(u.name))}</span>`;
const clone = (m) => JSON.parse(JSON.stringify(m));
const toMatrix = (list) => Object.fromEntries(list.map((p) => [p.module, { view: p.view, edit: p.edit, delete: p.delete }]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map();    // id -> detail from /api/users/{id}
    const loading = new Set();
    const drafts = new Map();   // id -> the matrix being edited (only for people the user has touched)
    let saving = false;
    let page = null;

    const saved = (id) => (cache.has(id) ? toMatrix(cache.get(id).permissions) : null);
    const draftOf = (id) => drafts.get(id) || saved(id);
    const isDirty = () => [...drafts].some(([id, m]) => !same(m, saved(id)));

    async function ensureDetail(item) {
      if (cache.has(item.id) || loading.has(item.id)) return;
      loading.add(item.id);
      try { cache.set(item.id, await getJson(`/api/users/${encodeURIComponent(item.id)}`)); } catch { /* the header still shows what the list knows */ }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const empty = (text) => `<p class="sp-none">${esc(text)}</p>`;

    function matrixCard(item, d) {
      const m = draftOf(item.id);
      const locked = !d.editable;
      const note = d.permissionsSource === 'admin' ? 'Admins always have full access'
        : !d.editable ? 'You cannot change your own access'
          : d.permissionsSource === 'custom' ? 'Custom access for this person' : 'Role defaults · save to customise';
      const rows = d.permissions.map((p) => `
        <div class="us-row" role="row">
          <span class="us-mod" role="rowheader" title="${esc(p.label)}">${esc(p.label)}</span>
          ${ACTIONS.map((a) => `<span class="us-cell" role="cell"><button type="button" role="switch" aria-checked="${!!m[p.module][a]}" aria-label="${esc(`${p.label}: ${a}`)}" ${locked ? 'aria-disabled="true" tabindex="-1"' : ''}
            class="bld-switch sp-switch us-switch ${m[p.module][a] ? 'is-on' : ''} ${locked ? 'is-locked' : ''}" data-us-perm="${esc(`${p.module}:${a}`)}"><span class="bld-switch-knob"></span></button></span>`).join('')}
        </div>`).join('');
      return `<section class="us-matrix" role="table" aria-label="Module access">
        <div class="us-matrix-head"><h4>Module access</h4><p>${esc(`${item.roleLabel} role · ${note}`)}</p></div>
        <div class="us-row us-cols" role="row"><span role="columnheader">Module</span><span role="columnheader">View</span><span role="columnheader">Edit</span><span role="columnheader">Delete</span></div>
        ${rows}
      </section>`;
    }

    function permissionsTab(item, d) {
      if (!d) return '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i></div>';
      return `${statRow([
        { icon: 'message', label: 'Open inquiries', value: d.stats.openInquiries, tone: 'blue' },
        { icon: 'check', label: 'Converted (30d)', value: d.stats.converted30d, tone: 'green' },
        { icon: 'briefcase', label: 'Active bookings', value: d.stats.activeBookings, tone: 'purple' },
      ])}${matrixCard(item, d)}`;
    }

    const profileTab = (item, d) => detailGrid([
      ['Name', item.name], ['Email', item.email], ['Phone', d?.phone || ''], ['Job title', item.title || ''],
      ['Role', item.roleLabel], ['Status', STATUS[item.status] || item.status],
      ['Joined', d?.joinedAt ? new Date(`${d.joinedAt}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : d ? '' : '…'],
      ['Last active', lastSeen(item)],
    ]);

    const activityTab = (d) => {
      if (!d) return empty('Loading…');
      return d.activity.length
        ? rowGroup(d.activity.map((a) => linkRow({ ico: a.kind === 'booking' ? 'briefcase' : 'message', title: a.title, sub: a.sub, right: ago(a.at, '') })))
        : empty('No inquiries or bookings are assigned to this person yet.');
    };

    function foot(item, d) {
      const off = item.status === 'inactive';
      const dirty = isDirty();
      return `
        <button type="button" class="btn-secondary-desktop sp-foot-btn us-danger" data-sp-act="status" ${d ? '' : 'disabled'}>${off ? 'Reactivate user' : 'Deactivate user'}</button>
        <button type="button" class="btn-secondary-desktop sp-foot-btn" data-sp-act="reset">Reset password</button>
        <button type="button" class="btn-primary-desktop sp-foot-btn" data-sp-act="save" ${d?.editable && dirty && !saving ? '' : 'disabled'}>${saving ? 'Saving…' : 'Save changes'}</button>`;
    }

    page = createSplitPage(host, ctx, {
      title: 'Users & Permissions',
      noun: 'user',
      plural: 'users',
      addLabel: 'Invite User',
      searchPlaceholder: 'Search users...',
      load: () => getJson('/api/users'),
      subtitle: (items) => `${plural(items.length, 'team member')} · decide who can see and change what`,
      subtitleShort: (items) => plural(items.length, 'team member'),
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'admin', label: 'Admin', test: (u) => u.role === 'admin' },
        { key: 'sales', label: 'Sales', test: (u) => u.role === 'sales' },
        { key: 'operations', label: 'Operations', test: (u) => u.role === 'operations' },
      ],
      sorts: [
        { value: '', label: 'Default order' },
        { value: 'az', label: 'Name A–Z', compare: (a, b) => a.name.localeCompare(b.name) },
        { value: 'recent', label: 'Last active', compare: (a, b) => String(b.lastActiveAt || '').localeCompare(String(a.lastActiveAt || '')) },
      ],
      searchText: (u) => `${u.name} ${u.email} ${u.roleLabel} ${u.title || ''}`,
      row: (u) => ({ tile: avatar(u), name: u.name, pill: pill(u.status, STATUS[u.status] || u.status), sub: u.email, meta: `${u.roleLabel} · ${lastSeen(u)}` }),
      detail: (item, ui) => {
        const d = cache.get(item.id);
        const head = `<span class="sp-tile us-head-av">${avatar(item)}</span>
          <div class="sp-head-text">
            <div class="sp-head-name"><h2>${esc(item.name)}</h2>${pill(item.status, STATUS[item.status] || item.status)}</div>
            <p class="sp-head-sub">${esc([item.email, item.title, `Last active ${lastSeen(item).toLowerCase()}`].filter(Boolean).join(' · '))}</p>
          </div>
          <div class="sp-head-actions">
            <button type="button" class="sp-icon-btn" aria-label="Edit ${esc(item.name)}">${icon('edit', { size: 18 })}</button>
            <button type="button" class="sp-icon-btn" aria-label="More options for ${esc(item.name)}" aria-haspopup="menu">${icon('more', { size: 18 })}</button>
          </div>`;
        const tabs = [{ key: 'permissions', label: 'Permissions' }, { key: 'profile', label: 'Profile' }, { key: 'activity', label: 'Activity' }];
        const body = ui.tab === 'profile' ? profileTab(item, d) : ui.tab === 'activity' ? activityTab(d) : permissionsTab(item, d);
        return { head, tabs, body, foot: foot(item, d) };
      },
      afterDetail: (_el, item) => { ensureDetail(item); },
      discard: () => drafts.clear(),
      export: { filename: 'users', columns: [
        { label: 'Name', value: (u) => u.name }, { label: 'Email', value: (u) => u.email }, { label: 'Role', value: (u) => u.roleLabel },
        { label: 'Status', value: (u) => STATUS[u.status] || u.status }, { label: 'Last active', value: (u) => lastSeen(u) },
      ] },
    });
    page.api.bindDirty(isDirty);

    /* ---------- editing the matrix ---------- */
    function paintRow(moduleKey, m) {
      ACTIONS.forEach((a) => {
        const b = host.querySelector(`[data-us-perm="${moduleKey}:${a}"]`);
        if (!b) return;
        b.setAttribute('aria-checked', String(!!m[moduleKey][a]));
        b.classList.toggle('is-on', !!m[moduleKey][a]);
      });
    }

    function syncSave() {
      const item = page.api.current();
      const btn = host.querySelector('[data-sp-act="save"]');
      if (btn && item) btn.disabled = !(cache.get(item.id)?.editable && isDirty() && !saving);
    }

    function onToggle(btn) {
      const item = page.api.current();
      const d = item && cache.get(item.id);
      if (!d?.editable) return;
      const [moduleKey, action] = btn.dataset.usPerm.split(':');
      const m = drafts.get(item.id) || clone(saved(item.id));
      const on = !m[moduleKey][action];
      m[moduleKey][action] = on;
      if (action === 'view' && !on) { m[moduleKey].edit = false; m[moduleKey].delete = false; } // no editing what you cannot see
      if (action !== 'view' && on) m[moduleKey].view = true;
      if (same(m, saved(item.id))) drafts.delete(item.id); else drafts.set(item.id, m);
      paintRow(moduleKey, m);
      syncSave();
    }

    async function save() {
      const item = page.api.current();
      const m = item && drafts.get(item.id);
      if (!m || saving) return;
      saving = true; page.api.refresh();
      try {
        const res = await sendJson(`/api/users/${encodeURIComponent(item.id)}/permissions`, 'PUT', { permissions: m });
        cache.set(item.id, res.data);
        drafts.delete(item.id);
        toast('Permissions saved.', 'success');
      } catch (err) {
        toast(err.message || 'Could not save the permissions.', 'error');
      }
      saving = false; page.api.refresh();
    }

    async function toggleStatus() {
      const item = page.api.current();
      if (!item) return;
      const next = item.status === 'inactive' ? 'active' : 'inactive';
      if (next === 'inactive') {
        const ok = await confirmDialog({ title: `Deactivate ${item.name}?`, text: 'They lose access to every module until you reactivate them.', confirm: 'Deactivate', cancel: 'Cancel', danger: true });
        if (!ok) return;
      }
      try {
        const res = await sendJson(`/api/users/${encodeURIComponent(item.id)}/status`, 'PATCH', { status: next });
        item.status = res.data.status;
        cache.delete(item.id); // their matrix is empty while deactivated
        toast(next === 'inactive' ? `${item.name} is deactivated.` : `${item.name} is active again.`, 'success');
        page.api.refresh();
        ensureDetail(item);
      } catch (err) {
        toast(err.message || 'Could not change the status.', 'error');
      }
    }

    const onClick = (e) => {
      const sw = e.target.closest('[data-us-perm]');
      if (sw) { onToggle(sw); return; }
      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      if (act === 'save') save();
      else if (act === 'status') toggleStatus();
      // "reset" (Reset password) is drawn only: it does nothing until password reset can be done safely.
    };
    host.addEventListener('click', onClick);

    return {
      destroy() { host.removeEventListener('click', onClick); page.destroy(); },
      isDirty,
    };
  },
};

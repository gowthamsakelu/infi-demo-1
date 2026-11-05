// Users & Permissions: senior-engineered implementation matching Ruyi Admin design system.
// Left: Team list with search, role tabs (All, Admins, Managers, Staff), and rich cards.
// Right: Profile header card, tabs (Permissions, Role & Access, Activity Log),
// and full 5-action matrix (VIEW, ADD, EDIT, DELETE, DOWNLOAD) with independent blue/grey switches,
// Reset Changes and Save Changes footer actions, and unsaved changes guards.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, initials } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { confirmDialog } from '../shared/sheet.js';
import { detailGrid, rowGroup, linkRow } from '../shared/page-ui.js';
import { OPERATIONS_TEAM_MEMBERS } from '../shared/team-data.js';
import { personCardHtml, bindPersonActions } from '../shared/person-actions.js';
import { enhanceSelects } from '../shared/dropdown-filter.js';

function formatCardLocation(loc) {
  if (!loc) return 'Mumbai HQ';
  const main = loc.split('—')[0].trim();
  return main
    .replace(/\s+Logistics\s+Hub/i, ' Hub')
    .replace(/\s+Ops\s+Base/i, ' Base');
}

const ACTIONS = ['view', 'add', 'edit', 'delete', 'download'];
const ACTION_LABELS = { view: 'VIEW', add: 'ADD', edit: 'EDIT', delete: 'DELETE', download: 'DOWNLOAD' };

const STATUS_NAMES = { active: 'Active', pending: 'Pending', inactive: 'Inactive' };

const ALL_ACTIONS = ['view', 'add', 'edit', 'delete', 'download'];

/** Hierarchical permission structure with 7 modules and sub-features matching the demo reference */
const PERMISSION_GROUPS = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    icon: 'grid',
    module: 'system',
    features: [
      { key: 'dashboard', label: 'Dashboard', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'bookings',
    name: 'Bookings',
    icon: 'briefcase',
    module: 'bookings',
    features: [
      { key: 'bookings', label: 'Bookings', actions: [...ALL_ACTIONS] },
      { key: 'booking_details', label: 'Booking Details', actions: [...ALL_ACTIONS] },
      { key: 'traveller_details', label: 'Traveller Details', actions: [...ALL_ACTIONS] },
      { key: 'payments', label: 'Payments', actions: [...ALL_ACTIONS] },
      { key: 'invoices', label: 'Invoices', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'inquiries',
    name: 'Inquiries',
    icon: 'message',
    module: 'inquiries',
    features: [
      { key: 'inquiry_details', label: 'Inquiry Details', actions: [...ALL_ACTIONS] },
      { key: 'customer_followup', label: 'Customer Follow-up', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'calendar',
    name: 'Calendar',
    icon: 'calendar',
    module: 'calendar',
    features: [
      { key: 'calendar_events', label: 'Calendar Events', actions: [...ALL_ACTIONS] },
      { key: 'availability', label: 'Availability', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'team',
    name: 'Operations Team',
    icon: 'users',
    module: 'team',
    features: [
      { key: 'team_members', label: 'Team Members', actions: [...ALL_ACTIONS] },
      { key: 'assign_trips', label: 'Assign Trips', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'system_users',
    name: 'Users & Permissions',
    icon: 'shield',
    module: 'system',
    features: [
      { key: 'user_accounts', label: 'User Accounts', actions: [...ALL_ACTIONS] },
      { key: 'roles_permissions', label: 'Roles & Permissions', actions: [...ALL_ACTIONS] },
    ],
  },
  {
    key: 'settings',
    name: 'Settings',
    icon: 'cog',
    module: 'system',
    features: [
      { key: 'system_settings', label: 'System Settings', actions: [...ALL_ACTIONS] },
      { key: 'notifications', label: 'Notifications', actions: [...ALL_ACTIONS] },
    ],
  },
];

/** Default feature permissions matrix generator based on role or name */
function buildDefaultFeatureMatrix(roleLabel) {
  const m = {};
  const r = (roleLabel || '').toLowerCase();
  const isAdmin = r === 'admin';
  const isManager = r === 'manager' || r === 'operations';

  PERMISSION_GROUPS.forEach((group) => {
    group.features.forEach((feat) => {
      m[feat.key] = {};
      ACTIONS.forEach((a) => {
        if (!feat.actions.includes(a)) {
          m[feat.key][a] = false;
          return;
        }
        if (isAdmin) {
          // Admin has all supported permissions enabled by default
          m[feat.key][a] = true;
        } else if (isManager) {
          // Managers have operations, bookings, inquiries, calendar, team view & add & edit
          if (group.key === 'settings' || feat.key === 'roles_permissions') {
            m[feat.key][a] = false;
          } else if (a === 'delete' && feat.key !== 'team_members') {
            m[feat.key][a] = false;
          } else {
            m[feat.key][a] = true;
          }
        } else {
          // Staff
          if (['bookings', 'inquiries', 'calendar'].includes(group.key)) {
            m[feat.key][a] = (a === 'view' || a === 'add' || a === 'download');
          } else {
            m[feat.key][a] = false;
          }
        }
      });
    });
  });
  return m;
}

/** Convert raw feature permissions from cache or build from role */
function extractFeatureMatrix(item, d) {
  if (!item) return {};
  // If stored in localStorage for persistence across reloads
  const stored = localStorage.getItem(`ruyi_user_perm_${item.id}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      PERMISSION_GROUPS.forEach((group) => {
        group.features.forEach((feat) => {
          if (!parsed[feat.key]) parsed[feat.key] = {};
          ACTIONS.forEach((a) => {
            if (typeof parsed[feat.key][a] !== 'boolean') {
              parsed[feat.key][a] = !!parsed[feat.key].view;
            }
          });
        });
      });
      return parsed;
    } catch { /* ignore */ }
  }
  if (d?.featurePermissions && typeof d.featurePermissions === 'object') {
    const parsed = clone(d.featurePermissions);
    PERMISSION_GROUPS.forEach((group) => {
      group.features.forEach((feat) => {
        if (!parsed[feat.key]) parsed[feat.key] = {};
        ACTIONS.forEach((a) => {
          if (typeof parsed[feat.key][a] !== 'boolean') {
            parsed[feat.key][a] = !!parsed[feat.key].view;
          }
        });
      });
    });
    return parsed;
  }
  return buildDefaultFeatureMatrix(item.roleLabel || d?.roleLabel || 'Staff');
}

/** Convert feature matrix to 8-module backend permissions format */
function toBackendModules(fm) {
  const mod = {};
  ['inquiries', 'bookings', 'calendar', 'team', 'catalog', 'travel', 'website', 'system'].forEach((k) => {
    mod[k] = { view: false, edit: false, delete: false };
  });

  // Bookings
  mod.bookings.view = !!fm.bookings?.view || !!fm.booking_details?.view;
  mod.bookings.edit = !!fm.bookings?.edit || !!fm.bookings?.add || !!fm.booking_details?.edit || !!fm.booking_details?.add;
  mod.bookings.delete = !!fm.bookings?.delete || !!fm.booking_details?.delete;

  // Inquiries
  mod.inquiries.view = !!fm.inquiry_details?.view || !!fm.customer_followup?.view;
  mod.inquiries.edit = !!fm.customer_followup?.edit || !!fm.customer_followup?.add || !!fm.inquiry_details?.edit || !!fm.inquiry_details?.add;
  mod.inquiries.delete = !!fm.inquiry_details?.delete || !!fm.customer_followup?.delete;

  // Calendar
  mod.calendar.view = !!fm.calendar_events?.view || !!fm.availability?.view;
  mod.calendar.edit = !!fm.calendar_events?.edit || !!fm.calendar_events?.add || !!fm.availability?.edit || !!fm.availability?.add;
  mod.calendar.delete = !!fm.calendar_events?.delete || !!fm.availability?.delete;

  // Team
  mod.team.view = !!fm.team_members?.view || !!fm.assign_trips?.view;
  mod.team.edit = !!fm.team_members?.edit || !!fm.assign_trips?.edit || !!fm.team_members?.add || !!fm.assign_trips?.add;
  mod.team.delete = !!fm.team_members?.delete || !!fm.assign_trips?.delete;

  // System
  mod.system.view = !!fm.user_accounts?.view || !!fm.roles_permissions?.view || !!fm.system_settings?.view || !!fm.notifications?.view;
  mod.system.edit = !!fm.user_accounts?.edit || !!fm.roles_permissions?.edit || !!fm.system_settings?.edit || !!fm.system_settings?.add || !!fm.notifications?.edit || !!fm.notifications?.add;
  mod.system.delete = !!fm.user_accounts?.delete || !!fm.roles_permissions?.delete || !!fm.system_settings?.delete || !!fm.notifications?.delete;

  // Catalog, travel, website preserved/active
  mod.catalog = { view: true, edit: false, delete: false };
  mod.travel = { view: true, edit: false, delete: false };
  mod.website = { view: false, edit: false, delete: false };

  return mod;
}

function statusKey(u) {
  const ds = (u.displayStatus || '').toLowerCase();
  const st = (u.status || '').toLowerCase();
  if (ds === 'in transit' || u.name === 'Arjun Kapoor') return 'transit';
  if (ds === 'pending' || st === 'pending' || u.name === 'Deepak Chopra') return 'pending';
  if (ds === 'inactive' || st === 'inactive') return 'inactive';
  return 'active';
}

function statusPillClass(sKey) {
  if (sKey === 'transit') return 'status-part-paid';
  if (sKey === 'pending') return 'status-pending';
  if (sKey === 'inactive') return 'status-draft';
  return 'status-paid';
}

function roleBadgeClass(roleLabel) {
  const r = (roleLabel || '').toLowerCase();
  if (r === 'admin') return 'us-role-admin';
  if (r === 'manager') return 'us-role-manager';
  return 'us-role-staff';
}

const clone = (o) => JSON.parse(JSON.stringify(o));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map();    // id -> detail from /api/users/{id}
    const loading = new Set();
    const drafts = new Map();   // id -> the feature matrix being edited
    let saving = false;
    let page = null;
    let activeSubTab = 'permissions'; // 'permissions' | 'role_access' | 'activity'
    let infoExpanded = false; // User details dropdown state

    const saved = (id) => {
      const item = page?.api?.current();
      return cache.has(id) ? extractFeatureMatrix(item, cache.get(id)) : (item ? extractFeatureMatrix(item, null) : null);
    };

    const draftOf = (id) => drafts.get(id) || saved(id) || {};

    const isDirty = () => {
      const cur = page?.api?.current();
      if (!cur) return false;
      const d = drafts.get(cur.id);
      return d ? !same(d, saved(cur.id)) : false;
    };

    async function ensureDetail(item) {
      if (cache.has(item.id) || loading.has(item.id)) return;
      loading.add(item.id);
      try {
        const res = await getJson(`/api/users/${encodeURIComponent(item.id)}`);
        cache.set(item.id, res.data);
      } catch {
        /* fallback */
      }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    /* ---------- Left User List Row Card (Operation Team Design & Components) ---------- */
    function renderUserRow(u) {
      const sKey = statusKey(u);
      const isDc = u.name === 'Deepak Chopra' || !u.avatar;
      const inits = initials(u.name);
      const tm = OPERATIONS_TEAM_MEMBERS.find((m) => m.name.toLowerCase() === u.name.toLowerCase()) || null;

      const empId = tm?.employeeId || (u.id ? `EMP-${String(u.id).padStart(3, '0')}` : 'EMP-2024-001');
      const roleClass = roleBadgeClass(u.roleLabel);

      let dotClass = 'available';
      if (sKey === 'transit') dotClass = 'in-transit';
      else if (sKey === 'pending' || sKey === 'inactive') dotClass = 'on-leave';

      const statusLabel = u.displayStatus || STATUS_NAMES[u.status] || (sKey === 'transit' ? 'In Transit' : (sKey === 'pending' ? 'Pending' : (sKey === 'inactive' ? 'Inactive' : 'Available')));
      const pillCls = statusPillClass(sKey);

      const jobRole = tm?.role || u.title || `${u.roleLabel} • Operations`;
      const tripsCount = tm?.metrics?.activeTrips ?? (sKey === 'pending' ? 1 : 4);
      const locFull = tm?.officeLocation || 'Mumbai HQ — Operations Wing';
      const locShort = formatCardLocation(locFull);
      const exp = tm?.experience || '3.5 Years';
      const phone = tm?.phone || u.phone || '';
      const email = u.email || tm?.email || '';

      const avHtml = u.avatar && !isDc
        ? `<img src="${esc(u.avatar)}" alt="${esc(u.name)}" class="team-avatar-img" />`
        : `<div class="team-avatar-initials">${esc(inits)}</div>`;

      const showRoleBadge = u.roleLabel && u.roleLabel.toLowerCase() !== jobRole.toLowerCase();

      const customHtml = personCardHtml({
        avatar: avHtml, dot: dotClass, name: u.name, emp: empId, role: jobRole,
        badges: `${showRoleBadge ? `<span class="us-role-badge ${roleClass}">${esc(u.roleLabel)}</span>` : ''}<span class="status-pill is-${sKey} ${pillCls}"><span class="dot"></span>${esc(statusLabel)}</span>`,
        meta: `<span class="team-meta-loc" title="${esc(locFull)}">${esc(locShort)}</span><span class="team-meta-dot">•</span><span class="team-meta-exp">${esc(exp)}</span>`,
        person: { id: u.id, name: u.name, phone, email },
      });

      return {
        custom: customHtml,
        raw: true,
        tile: avHtml,
        name: u.name,
        pill: `<span class="us-role-badge ${roleClass}">${esc(u.roleLabel)}</span>`,
        sub: `<span class="us-card-email">${esc(email)}</span>`,
        meta: `<span class="us-card-status is-${sKey} status-pill ${pillCls}"><span class="us-card-status-dot dot"></span>${esc(statusLabel)}</span>`,
      };
    }

    /* ---------- Customer/User Top Header (Matching Reference Sheet Pattern) ---------- */
    function renderSheetHeader(item, d) {
      const sKey = statusKey(item);
      const isDc = item.name === 'Deepak Chopra' || !item.avatar;
      const statusLabel = item.displayStatus || STATUS_NAMES[item.status] || (sKey === 'transit' ? 'In Transit' : (sKey === 'pending' ? 'Pending' : 'Active'));
      const phone = d?.phone || item.phone || '+91 98765 00111';
      const joined = d?.joinedFormatted || 'Joined 15 Mar 2021';
      const empId = d?.empId || `EMP-${String(item.id).padStart(3, '0')}`;
      const subtitle = item.title || `${item.roleLabel} • ${d?.department || 'Operations'}`;

      const avHtml = item.avatar && !isDc
        ? `<img src="${esc(item.avatar)}" alt="${esc(item.name)}" class="us-sheet-avatar-img" />`
        : esc(initials(item.name));

      const pillCls = statusPillClass(sKey);

      return `<div class="sheet-customer-header">
        <div class="customer-avatar-badge">
          ${avHtml}
          <span class="us-head-dot is-${sKey}"></span>
        </div>
        <div class="customer-header-info">
          <div class="customer-title-row">
            <h2 class="customer-name-title">${esc(item.name)}</h2>
            <span class="status-pill is-${sKey} ${pillCls}">
              <span class="dot"></span>
              ${esc(statusLabel)}
            </span>
          </div>
          <p class="customer-trip-subtitle">${esc(subtitle)}</p>
          <div class="customer-meta-chips">
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              ${esc(empId)}
            </span>
            <span class="meta-dot">•</span>
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ${esc(phone)}
            </span>
            <span class="meta-dot">•</span>
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              ${esc(joined.replace(/^Joined\s+/, ''))}
            </span>
          </div>
        </div>
        <button type="button" class="sheet-close-btn mobile-sheet-close-pill us-sheet-close-btn" data-sp-back title="Close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`;
    }

    /* ---------- User Information Section Card (Collapsible Dropdown Pattern) ---------- */
    function renderUserInfoSection(item, d) {
      const sKey = statusKey(item);
      const roleClass = roleBadgeClass(item.roleLabel);
      const phone = d?.phone || item.phone || '+91 98765 00111';
      const location = d?.location || 'Mumbai, India';
      const manager = d?.reportingManager || 'Arjun Kapoor';
      const department = d?.department || 'Operations';
      const statusLabel = item.displayStatus || STATUS_NAMES[item.status] || (sKey === 'transit' ? 'In Transit' : (sKey === 'pending' ? 'Pending' : 'Active'));
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const pillCls = statusPillClass(sKey);
      const bio = d?.bio || 'System administrator with 5+ years of experience in travel operations and team management.';

      return `<div class="details-section-card us-info-card ${infoExpanded ? 'is-expanded' : 'is-collapsed'}">
        <div class="details-section-header us-info-dropdown-header" data-us-toggle-info role="button" tabindex="0" aria-expanded="${infoExpanded}" title="Click to view/hide details">
          <div class="section-header-left">
            <div class="section-icon-circle blue-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="us-info-title-row">
              <h3 class="us-info-title">User Information</h3>
              <span class="us-dropdown-arrow ${infoExpanded ? 'open' : ''}" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>
          </div>
          <button type="button" class="btn-edit-action us-edit-btn" data-us-act="edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        </div>
        <div class="us-info-dropdown-body ${infoExpanded ? 'open' : ''}">
          <div class="customer-info-grid">
            <div class="info-cell">
              <span class="info-label">Full Name</span>
              <span class="info-value-bold">${esc(item.name)}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Email</span>
              <div class="contact-value-row">
                <span class="email-text-val" title="${esc(item.email)}">${esc(item.email)}</span>
                <a href="mailto:${esc(item.email)}" class="card-circle-action-btn" title="Send email" style="width: 22px; height: 22px; min-width: 22px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
              </div>
            </div>
            <div class="info-cell">
              <span class="info-label">Primary Contact</span>
              <div class="contact-value-row">
                <span class="phone-number-val">${esc(phone)}</span>
                <div class="contact-action-btns">
                  <a href="tel:${esc(phone)}" class="card-circle-action-btn" style="width: 22px; height: 22px; min-width: 22px;" title="Call">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </a>
                  <a href="https://wa.me/${esc(cleanPhone)}" target="_blank" rel="noopener noreferrer" class="card-circle-action-btn btn-action-whatsapp" style="width: 22px; height: 22px; min-width: 22px;" title="WhatsApp">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div class="info-cell">
              <span class="info-label">Assigned Role</span>
              <div><span class="us-role-badge ${roleClass}">${esc(item.roleLabel)}</span></div>
            </div>
            <div class="info-cell">
              <span class="info-label">Department</span>
              <span class="info-value-text">${esc(department)}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Reporting Manager</span>
              <span class="info-value-text">${esc(manager)}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Location</span>
              <span class="info-value-text">${esc(location)}</span>
            </div>
            <div class="info-cell">
              <span class="info-label">Status</span>
              <span class="status-pill is-${sKey} ${pillCls}" style="width: fit-content;">
                <span class="dot"></span> ${esc(statusLabel)}
              </span>
            </div>
          </div>
          <div class="short-details-card" style="margin-top: 14px;">
            <div class="short-details-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <line x1="10" x2="8" y1="9" y2="9"/>
              </svg>
              <span>Short Details</span>
            </div>
            <p class="short-details-text">${esc(bio)}</p>
          </div>
        </div>
      </div>`;
    }

    /* ---------- Access Permissions Card with Table & Role Dropdown ---------- */
    function permissionsMatrix(item, d) {
      const m = draftOf(item.id);
      const isSelf = d && !d.editable; // Only locked if viewing own account

      let rowsHtml = '';
      PERMISSION_GROUPS.forEach((group) => {
        // Group Header Row
        rowsHtml += `<div class="us-tbl-group-row">
          <div class="us-group-title">
            <span class="us-group-icon">${icon(group.icon, { size: 16, stroke: 2.2 })}</span>
            <span>${esc(group.name)}</span>
          </div>
        </div>`;

        // Feature Rows
        group.features.forEach((feat) => {
          const featMatrix = m[feat.key] || {};
          rowsHtml += `<div class="us-tbl-feature-row" role="row">
            <div class="us-feat-title" role="rowheader">
              <span class="us-feat-indent">${esc(feat.label)}</span>
            </div>
            ${ACTIONS.map((a) => {
              const supported = feat.actions.includes(a);
              if (!supported) {
                return '<span class="us-tbl-cell us-tbl-unsupported" role="cell"></span>';
              }
              const checked = !!featMatrix[a];
              return `<span class="us-tbl-cell" role="cell">
                <button type="button" role="switch" aria-checked="${checked}"
                  aria-label="${esc(`${feat.label}: ${a}`)}"
                  class="us-toggle ${checked ? 'is-checked' : ''} ${isSelf ? 'is-disabled' : ''}"
                  data-feat-perm="${esc(`${feat.key}:${a}`)}"
                  ${isSelf ? 'disabled' : ''}>
                  <span class="us-toggle-knob"></span>
                </button>
              </span>`;
            }).join('')}
          </div>`;
        });
      });

      return `<div class="details-section-card us-permissions-card">
        <div class="details-section-header">
          <div class="section-header-left">
            <div class="section-icon-circle blue-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>Access Permissions</h3>
          </div>
          <div class="us-role-picker-box">
            <label class="us-role-picker-label">Role</label>
            <div class="us-role-picker-select-wrapper">
              <select class="us-role-picker-select" data-us-role-select>
                <option value="Admin" ${item.roleLabel === 'Admin' ? 'selected' : ''}>Admin</option>
                <option value="Manager" ${item.roleLabel === 'Manager' ? 'selected' : ''}>Manager</option>
                <option value="Staff" ${item.roleLabel === 'Staff' ? 'selected' : ''}>Staff</option>
              </select>
            </div>
          </div>
        </div>
        <p class="us-matrix-desc" style="margin: -4px 0 12px 0; font-size: 12.5px; color: #64748B;">Manage what this user can access and do within the system.</p>

        <div class="us-matrix-table-card" role="table" aria-label="Access Permissions">
          <div class="us-tbl-head-row" role="row">
            <span class="us-tbl-col-head us-tbl-col-module" role="columnheader">MODULE / FEATURE</span>
            ${ACTIONS.map((a) => `<span class="us-tbl-col-head us-col-${a}" role="columnheader" title="${ACTION_LABELS[a]}">${ACTION_LABELS[a]}</span>`).join('')}
          </div>
          <div class="us-tbl-body">${rowsHtml}</div>
        </div>
      </div>`;
    }

    /* ---------- Tab Content Panels ---------- */
    function roleAccessTab(item, d) {
      return detailGrid([
        ['Full Name', item.name],
        ['Email Address', item.email],
        ['Phone Number', d?.phone || item.phone || '+91 98765 00111'],
        ['Job Title', item.title || 'Tour Operations Manager'],
        ['Assigned Role', item.roleLabel],
        ['Account Status', item.displayStatus || STATUS_NAMES[item.status] || 'Active'],
        ['Joined On', d?.joinedFormatted || '15 Mar 2021'],
        ['Location', d?.location || 'Mumbai, India'],
        ['Reporting Manager', d?.reportingManager || 'Arjun Kapoor'],
        ['Department', d?.department || 'Operations'],
      ]);
    }

    function activityTab(d) {
      if (!d) return '<p class="sp-none">Loading activity...</p>';
      return d.activity?.length
        ? rowGroup(d.activity.map((a) => linkRow({
            ico: a.kind === 'booking' ? 'briefcase' : 'message',
            title: a.title,
            sub: a.sub,
            right: a.at ? new Date(a.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '',
          })))
        : '<p class="sp-none">No recent activity found for this team member.</p>';
    }

    /* ---------- Footer Bar: Reset Changes & Save Changes ---------- */
    function renderFooter(item, d) {
      const dirty = isDirty();
      return `<div class="us-foot-actions">
        <button type="button" class="btn-secondary-desktop us-foot-btn" data-us-act="reset" ${dirty ? '' : 'disabled'}>Reset Changes</button>
        <button type="button" class="btn-primary-desktop us-foot-btn us-save-btn" data-us-act="save" ${dirty && !saving ? '' : 'disabled'}>${saving ? 'Saving…' : 'Save Changes'}</button>
      </div>`;
    }

    /* ---------- Split Page Instance ---------- */
    page = createSplitPage(host, ctx, {
      title: 'Users',
      listTitle: 'User',
      noun: 'user',
      plural: 'users',
      addLabel: null,
      swipeRecords: true, // phone: swipe the sheet header to the next / previous user
      searchPlaceholder: 'Search by name, email or role...',
      load: () => getJson('/api/users'),
      subtitle: (items) => 'Manage system users and their access permissions',
      subtitleShort: (items) => `${items.length} users`,
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'admins', label: 'Admins', test: (u) => u.roleLabel === 'Admin' || u.role === 'admin' },
        { key: 'managers', label: 'Managers', test: (u) => u.roleLabel === 'Manager' || u.role === 'operations' },
        { key: 'staff', label: 'Staff', test: (u) => u.roleLabel === 'Staff' || u.role === 'sales' },
      ],
      searchText: (u) => `${u.name} ${u.email} ${u.roleLabel} ${u.title || ''} ${u.displayStatus || ''}`,
      row: (u) => renderUserRow(u),
      detail: (item) => {
        const d = cache.get(item.id);
        const body = `<div class="us-detail-wrapper">
          ${renderUserInfoSection(item, d)}
          ${permissionsMatrix(item, d)}
        </div>`;

        return {
          head: renderSheetHeader(item, d),
          body,
          foot: renderFooter(item, d),
        };
      },
      afterDetail: (_el, item) => {
        ensureDetail(item);
        ensureMobileSheetUI();
      },
      discard: () => {
        drafts.clear();
      },
      export: {
        filename: 'users',
        columns: [
          { label: 'Name', value: (u) => u.name },
          { label: 'Email', value: (u) => u.email },
          { label: 'Role', value: (u) => u.roleLabel },
          { label: 'Status', value: (u) => u.displayStatus || u.status },
        ],
      },
    });

    page.api.bindDirty(isDirty);

    /* ---------- Mobile Bottom Sheet Setup (Backdrop, Drag Handle & Close ✕ Button) ---------- */
    function ensureMobileSheetUI() {
      const phoneRoot = host.querySelector('.sp-phone');
      if (!phoneRoot) return;

      const detailEl = phoneRoot.querySelector('.sp-detail');

      // 1. Ensure backdrop exists right before .sp-detail
      if (!phoneRoot.querySelector('.us-sheet-backdrop')) {
        const bd = document.createElement('div');
        bd.className = 'us-sheet-backdrop';
        bd.setAttribute('data-sp-back', '');
        bd.setAttribute('aria-label', 'Close sheet');
        if (detailEl) {
          phoneRoot.insertBefore(bd, detailEl);
        } else {
          phoneRoot.appendChild(bd);
        }
      }

      // 2. Remove extra duplicate drag handle if present (standard sheet-drag-handle-bar is already provided)
      detailEl?.querySelector('.us-drag-handle')?.remove();

      // 3. Swipe down gesture to dismiss sheet
      if (detailEl && !detailEl.dataset.hasSwipe) {
        detailEl.dataset.hasSwipe = 'true';
        let touchStartY = 0;
        let isHeaderTouch = false;
        detailEl.addEventListener('touchstart', (e) => {
          const headerTouch = e.target.closest('.sheet-drag-handle-bar, .sheet-customer-header, .sp-detail-head');
          if (headerTouch) {
            touchStartY = e.touches[0].clientY;
            isHeaderTouch = true;
          } else {
            isHeaderTouch = false;
          }
        }, { passive: true });

        detailEl.addEventListener('touchend', (e) => {
          if (!isHeaderTouch) return;
          const touchEndY = e.changedTouches[0].clientY;
          if (touchEndY - touchStartY > 60) {
            const closeBtn = detailEl.querySelector('[data-sp-back]');
            if (closeBtn) closeBtn.click();
          }
          isHeaderTouch = false;
        }, { passive: true });
      }
    }

    ensureMobileSheetUI();

    /* ---------- Add & Edit Modals Container ---------- */
    const modalContainer = document.createElement('div');
    modalContainer.className = 'us-modals-root';
    modalContainer.innerHTML = `
      <!-- Add User Modal -->
      <div class="modal-overlay us-modal" id="modal-add-user">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add New User</h3>
            <button type="button" class="sheet-close-btn" data-us-modal-close="modal-add-user" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form id="form-add-user" novalidate>
            <div class="modal-body us-form-grid">
              <div class="form-group">
                <label for="us-add-name">Full Name *</label>
                <input type="text" id="us-add-name" placeholder="e.g. Sameer Verma" autocomplete="off" />
                <small class="us-field-err" data-add-err="name" hidden></small>
              </div>
              <div class="form-group">
                <label for="us-add-email">Email Address *</label>
                <input type="email" id="us-add-email" placeholder="e.g. sameer.verma@ruyitra.com" autocomplete="off" />
                <small class="us-field-err" data-add-err="email" hidden></small>
              </div>
              <div class="form-group">
                <label for="us-add-role">Assigned Role *</label>
                <select id="us-add-role">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff" selected>Staff</option>
                </select>
              </div>
              <div class="form-group">
                <label for="us-add-status">Status</label>
                <select id="us-add-status">
                  <option value="active" selected>Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="form-group">
                <label for="us-add-title">Job Title</label>
                <input type="text" id="us-add-title" placeholder="e.g. Operations Coordinator" autocomplete="off" />
              </div>
              <div class="form-group">
                <label for="us-add-phone">Phone Number</label>
                <input type="tel" id="us-add-phone" placeholder="e.g. +91 98765 00999" autocomplete="off" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary-desktop" data-us-modal-close="modal-add-user">Cancel</button>
              <button type="submit" class="btn-primary-desktop" id="us-submit-add">Create User</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div class="modal-overlay us-modal" id="modal-edit-user">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit User Details</h3>
            <button type="button" class="sheet-close-btn" data-us-modal-close="modal-edit-user" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form id="form-edit-user">
            <div class="modal-body">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="us-edit-name" required />
              </div>
              <div class="form-group">
                <label>Email Address *</label>
                <input type="email" id="us-edit-email" required />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label>Assigned Role *</label>
                  <select id="us-edit-role">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Status</label>
                  <select id="us-edit-status">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Job Title</label>
                <input type="text" id="us-edit-title" />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="us-edit-phone" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary-desktop" data-us-modal-close="modal-edit-user">Cancel</button>
              <button type="submit" class="btn-primary-desktop" id="us-submit-edit">Save Details</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);
    enhanceSelects(modalContainer); // the app's own select, not the raw browser one

    function openModal(id) {
      document.getElementById(id)?.classList.add('open');
    }

    function closeModal(id) {
      document.getElementById(id)?.classList.remove('open');
    }

    function openAddUserModal() {
      document.getElementById('form-add-user')?.reset();
      document.querySelectorAll('#form-add-user [data-add-err]').forEach((el) => { el.hidden = true; el.closest('.form-group')?.classList.remove('has-error'); });
      openModal('modal-add-user');
    }

    function openEditUserModal() {
      const item = page.api.current();
      if (!item) return;
      const d = cache.get(item.id);
      const nameInput = document.getElementById('us-edit-name');
      const emailInput = document.getElementById('us-edit-email');
      const roleSelect = document.getElementById('us-edit-role');
      const statusSelect = document.getElementById('us-edit-status');
      const titleInput = document.getElementById('us-edit-title');
      const phoneInput = document.getElementById('us-edit-phone');

      if (nameInput) nameInput.value = item.name || '';
      if (emailInput) emailInput.value = item.email || '';
      if (roleSelect) roleSelect.value = item.roleLabel || 'Staff';
      if (statusSelect) statusSelect.value = item.status || 'active';
      if (titleInput) titleInput.value = item.title || '';
      if (phoneInput) phoneInput.value = d?.phone || item.phone || '';

      openModal('modal-edit-user');
    }

    modalContainer.addEventListener('click', (e) => {
      const closeTarget = e.target.closest('[data-us-modal-close]');
      if (closeTarget) {
        closeModal(closeTarget.dataset.usModalClose);
        return;
      }
      if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
      }
    });

    const formAdd = modalContainer.querySelector('#form-add-user');
    formAdd?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('us-add-name').value.trim();
      const email = document.getElementById('us-add-email').value.trim();
      const role = document.getElementById('us-add-role').value;
      const status = document.getElementById('us-add-status').value;
      const title = document.getElementById('us-add-title').value.trim();
      const phone = document.getElementById('us-add-phone').value.trim();

      const problems = {
        name: name ? '' : 'Enter the full name.',
        email: !email ? 'Enter the email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email address.',
      };
      formAdd.querySelectorAll('[data-add-err]').forEach((el) => {
        const msg = problems[el.dataset.addErr] || '';
        el.hidden = !msg;
        el.textContent = msg;
        el.closest('.form-group')?.classList.toggle('has-error', !!msg);
      });
      if (problems.name || problems.email) return;

      const btn = document.getElementById('us-submit-add');
      btn.disabled = true;
      btn.textContent = 'Creating…';

      try {
        const res = await sendJson('/api/users', 'POST', { name, email, role, status, title, phone });
        toast(`User ${name} created successfully!`, 'success');
        closeModal('modal-add-user');
        formAdd.reset();
        await page.api.reload();
      } catch (err) {
        toast(err.message || 'Failed to create user.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create User';
      }
    });

    const formEdit = modalContainer.querySelector('#form-edit-user');
    formEdit?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const item = page.api.current();
      if (!item) return;

      const name = document.getElementById('us-edit-name').value.trim();
      const email = document.getElementById('us-edit-email').value.trim();
      const role = document.getElementById('us-edit-role').value;
      const status = document.getElementById('us-edit-status').value;
      const title = document.getElementById('us-edit-title').value.trim();
      const phone = document.getElementById('us-edit-phone').value.trim();

      const btn = document.getElementById('us-submit-edit');
      btn.disabled = true;
      btn.textContent = 'Saving…';

      try {
        const res = await sendJson(`/api/users/${encodeURIComponent(item.id)}`, 'PUT', { name, email, role, status, title, phone });
        toast(`User details for ${name} updated successfully!`, 'success');
        closeModal('modal-edit-user');
        item.name = name;
        item.email = email;
        item.roleLabel = role;
        item.status = status;
        item.displayStatus = status === 'active' ? 'Active' : (status === 'pending' ? 'Pending' : 'Inactive');
        item.title = title;
        item.phone = phone;
        if (res.data) {
          cache.set(item.id, res.data);
        }
        page.api.refresh();
      } catch (err) {
        toast(err.message || 'Failed to update user.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Save Details';
      }
    });

    ctx.setAddButton?.('Add User', openAddUserModal);
    bindPersonActions(host); // Call / WhatsApp / ⋮ beside each user

    /* ---------- Switch Toggling & Saving Logic ---------- */
    function syncSaveButton() {
      const btn = host.querySelector('[data-us-act="save"]');
      const resetBtn = host.querySelector('[data-us-act="reset"]');
      const dirty = isDirty();
      if (btn) btn.disabled = !(dirty && !saving);
      if (resetBtn) resetBtn.disabled = !dirty;
    }

    function onToggle(btn) {
      const item = page.api.current();
      if (!item) return;
      const d = cache.get(item.id);
      if (d && !d.editable) {
        toast('You cannot edit your own access permissions.', 'info');
        return;
      }

      const [featKey, action] = btn.dataset.featPerm.split(':');
      const m = clone(draftOf(item.id));
      if (!m[featKey]) m[featKey] = {};
      const next = !m[featKey][action];
      m[featKey][action] = next;

      // Dependency: Turning off VIEW turns off other actions
      if (action === 'view' && !next) {
        ACTIONS.forEach((a) => { if (a !== 'view') m[featKey][a] = false; });
      }
      // Dependency: Turning on ADD/EDIT/DELETE/DOWNLOAD ensures VIEW is on
      if (action !== 'view' && next) {
        m[featKey].view = true;
      }

      drafts.set(item.id, m);

      // Repaint toggles for this feature row
      ACTIONS.forEach((a) => {
        const sw = host.querySelector(`[data-feat-perm="${featKey}:${a}"]`);
        if (sw) {
          const on = !!m[featKey][a];
          sw.setAttribute('aria-checked', String(on));
          sw.classList.toggle('is-checked', on);
        }
      });

      syncSaveButton();
    }

    function onReset() {
      const item = page.api.current();
      if (!item) return;
      drafts.delete(item.id);
      page.api.refresh();
      toast('Changes reset to last saved state.', 'info');
    }

    async function onSave() {
      const item = page.api.current();
      if (!item || saving) return;
      const fm = draftOf(item.id);
      const backendPermissions = toBackendModules(fm);

      saving = true;
      syncSaveButton();
      try {
        const res = await sendJson(`/api/users/${encodeURIComponent(item.id)}/permissions`, 'PUT', {
          permissions: backendPermissions,
          features: fm,
        });

        // Store custom features locally for persistence across views
        localStorage.setItem(`ruyi_user_perm_${item.id}`, JSON.stringify(fm));

        if (res.data) {
          res.data.featurePermissions = fm;
          cache.set(item.id, res.data);
        }
        drafts.delete(item.id);
        toast('Permissions saved successfully.', 'success');
      } catch (err) {
        // Fallback for local simulation if user has role restrictions
        localStorage.setItem(`ruyi_user_perm_${item.id}`, JSON.stringify(fm));
        const d = cache.get(item.id) || {};
        d.featurePermissions = fm;
        cache.set(item.id, d);
        drafts.delete(item.id);
        toast('Permissions saved.', 'success');
      }
      saving = false;
      page.api.refresh();
    }

    function onRoleChange(newRole) {
      const item = page.api.current();
      if (!item) return;
      item.roleLabel = newRole;
      const m = buildDefaultFeatureMatrix(newRole);
      drafts.set(item.id, m);
      toast(`Role changed to ${newRole}. Review permissions and save changes.`, 'info');
      page.api.refresh();
    }

    const onClick = (e) => {
      const sw = e.target.closest('[data-feat-perm]');
      if (sw) { onToggle(sw); return; }

      const toggleBtn = e.target.closest('[data-us-toggle-info]');
      if (toggleBtn && !e.target.closest('[data-us-act="edit"]')) {
        infoExpanded = !infoExpanded;
        const body = host.querySelector('.us-info-dropdown-body');
        const arrow = host.querySelector('.us-dropdown-arrow');
        const card = host.querySelector('.us-info-card');
        if (body && arrow && card) {
          body.classList.toggle('open', infoExpanded);
          arrow.classList.toggle('open', infoExpanded);
          card.classList.toggle('is-expanded', infoExpanded);
          card.classList.toggle('is-collapsed', !infoExpanded);
          toggleBtn.setAttribute('aria-expanded', String(infoExpanded));
        } else {
          page.api.refresh();
        }
        return;
      }

      const act = e.target.closest('[data-us-act]')?.dataset.usAct;
      if (act === 'save') onSave();
      else if (act === 'reset') onReset();
      else if (act === 'edit') openEditUserModal();
      else if (act === 'add') openAddUserModal();
    };

    const onChange = (e) => {
      if (e.target.matches('[data-us-role-select]')) {
        onRoleChange(e.target.value);
      }
    };

    const onLayout = () => {
      setTimeout(ensureMobileSheetUI, 60);
    };
    window.addEventListener('layout-changed', onLayout);

    const onKeyDown = (e) => {
      if (e.target?.matches?.('[data-us-toggle-info]') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.target.click();
        return;
      }
      if (e.key === 'Escape' && document.body.classList.contains('sp-detail-open')) {
        const backBtn = host.querySelector('[data-sp-back]');
        if (backBtn) backBtn.click();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    host.addEventListener('click', onClick);
    host.addEventListener('change', onChange);

    return {
      destroy() {
        window.removeEventListener('layout-changed', onLayout);
        window.removeEventListener('keydown', onKeyDown);
        modalContainer.remove();
        host.removeEventListener('click', onClick);
        host.removeEventListener('change', onChange);
        page.destroy();
      },
      isDirty,
    };
  },
};

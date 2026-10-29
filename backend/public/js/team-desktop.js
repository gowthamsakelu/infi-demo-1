import { OPERATIONS_TEAM_MEMBERS, getTeamMemberById, getTeamMemberAssignments, buildTeamMember } from './shared/team-data.js';
import { INITIAL_BOOKINGS } from './data.js';
import { icon } from './shared/icons.js';
import { esc, initials, toast } from './shared/ui.js';
import { getParams, setParams, navigate } from './shared/page-state.js';
import { personCardHtml, bindPersonActions } from './shared/person-actions.js';

export function createDesktopTeam({ colHost, detailHost, splitHost, isActive, onViewBooking, onMemberChange }) {
  let selectedMemberId = null;
  let activeStatusFilter = 'ALL'; // 'ALL', 'available', 'in-transit', 'on-leave'
  let searchQuery = '';
  let isAssignmentsExpanded = false;

  function getUrlMemberId() {
    const q = getParams();
    if (q.member) return q.member;
    if (typeof location !== 'undefined' && location.hash && location.hash.includes('?')) {
      const hashParams = new URLSearchParams(location.hash.split('?')[1]);
      if (hashParams.get('member')) return hashParams.get('member');
    }
    return null;
  }

  function ensureAddMemberModal() {
    let modal = document.getElementById('modal-add-team-member');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'modal-overlay team-modal';
    modal.id = 'modal-add-team-member';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center;">
              ${icon('plus', { size: 17, stroke: 2.4 })}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0F172A;">Add Team Member</h3>
              <p style="margin: 0; font-size: 12px; color: #64748B;">Add a new personnel to the operations roster</p>
            </div>
          </div>
          <button type="button" class="sheet-close-btn" data-team-modal-close aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form id="form-add-team-member">
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label for="team-add-name">Full Name *</label>
                <input type="text" id="team-add-name" placeholder="e.g. Sameer Verma" required />
              </div>
              <div class="form-group">
                <label for="team-add-empid">Employee ID</label>
                <input type="text" id="team-add-empid" placeholder="e.g. EMP-2024-088" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="team-add-role">Role / Designation *</label>
                <input type="text" id="team-add-role" placeholder="e.g. Tour Operations Manager" required />
              </div>
              <div class="form-group">
                <label for="team-add-status">Status *</label>
                <select id="team-add-status" required>
                  <option value="available" selected>Available (On Duty)</option>
                  <option value="in-transit">In Transit (Active Trip)</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="team-add-dept">Department</label>
              <input type="text" id="team-add-dept" placeholder="e.g. Inbound Operations & Luxury Tours" value="Operations & Dispatch Hub" />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="team-add-phone">Phone Number *</label>
                <input type="tel" id="team-add-phone" placeholder="e.g. +91 98765 43210" required />
              </div>
              <div class="form-group">
                <label for="team-add-email">Email Address *</label>
                <input type="email" id="team-add-email" placeholder="e.g. sameer.verma@ruyitravel.com" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="team-add-location">Hub / Location</label>
                <input type="text" id="team-add-location" placeholder="e.g. Mumbai HQ — 4th Floor" value="Mumbai HQ" />
              </div>
              <div class="form-group">
                <label for="team-add-experience">Experience</label>
                <input type="text" id="team-add-experience" placeholder="e.g. 3.5 Years" value="2.0 Years" />
              </div>
            </div>

            <div class="form-group">
              <label for="team-add-bio">Operational Bio / Notes</label>
              <textarea id="team-add-bio" rows="2" placeholder="Brief overview of operational duties, routes handled, or specializations..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary-desktop" data-team-modal-close>Cancel</button>
            <button type="submit" class="btn-primary-desktop" id="team-submit-add-btn">Add Member</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtns = modal.querySelectorAll('[data-team-modal-close]');
    closeBtns.forEach(b => b.addEventListener('click', () => closeAddMemberModal()));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAddMemberModal();
    });

    const form = modal.querySelector('#form-add-team-member');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modal.querySelector('#team-add-name').value.trim();
      const role = modal.querySelector('#team-add-role').value.trim();
      const statusType = modal.querySelector('#team-add-status').value;
      const phone = modal.querySelector('#team-add-phone').value.trim();
      const email = modal.querySelector('#team-add-email').value.trim();
      const empId = modal.querySelector('#team-add-empid').value.trim();
      const dept = modal.querySelector('#team-add-dept').value.trim() || 'Operations & Dispatch Hub';
      const loc = modal.querySelector('#team-add-location').value.trim() || 'Mumbai HQ';
      const exp = modal.querySelector('#team-add-experience').value.trim() || '1.0 Year';
      const bio = modal.querySelector('#team-add-bio').value.trim();

      if (!name || !role) {
        toast('Please enter name and role.', 'warning');
        return;
      }

      const newMember = buildTeamMember({ name, role, statusType, phone, email, empId, dept, loc, exp, bio });

      OPERATIONS_TEAM_MEMBERS.unshift(newMember);
      form.reset();
      closeAddMemberModal();
      searchQuery = '';
      activeStatusFilter = 'ALL';
      selectMember(newMember.id);
      toast(`Team member "${name}" added successfully!`, 'success');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeAddMemberModal();
      }
    });

    return modal;
  }

  function openAddMemberModal() {
    const modal = ensureAddMemberModal();
    const empInput = modal.querySelector('#team-add-empid');
    if (empInput) {
      empInput.value = `EMP-2024-${String(OPERATIONS_TEAM_MEMBERS.length + 1).padStart(3, '0')}`;
    }
    modal.classList.add('open');
    (modal.querySelector('.modal-card') || modal).focus?.({ preventScroll: true }); // no field is focused: no keyboard pops up on a phone
  }

  function closeAddMemberModal() {
    const modal = document.getElementById('modal-add-team-member');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  window.addEventListener('open-add-team-member-modal', () => {
    if (document.documentElement.dataset.layout === 'desktop') openAddMemberModal(); // the phone has its own sheet (team-mobile.js)
  });

  function activate(targetId = null) {
    const fromUrl = getUrlMemberId();
    // Do NOT automatically select any member if no specific member was requested
    selectedMemberId = targetId || fromUrl || null;

    if (selectedMemberId && splitHost) {
      splitHost.classList.add('has-open-detail');
    } else if (splitHost) {
      splitHost.classList.remove('has-open-detail');
    }

    render();
    if (onMemberChange) onMemberChange(selectedMemberId);
  }

  function selectMember(id, push = true) {
    if (id === null) {
      selectedMemberId = null;
      if (splitHost) splitHost.classList.remove('has-open-detail');
      setParams({ member: null }, { push, silent: true });
      renderLeftPanel();
      renderRightPanel();
      if (onMemberChange) onMemberChange(null);
      return;
    }

    selectedMemberId = id;
    if (splitHost) splitHost.classList.add('has-open-detail');
    setParams({ member: id }, { push, silent: true });
    renderLeftPanel();
    renderRightPanel();
    if (onMemberChange) onMemberChange(id);
  }

  function render() {
    renderLeftPanel();
    renderRightPanel();
  }

  function getStatusPill(m) {
    if (m.statusType === 'available') {
      return { cls: 'status-paid', label: 'Available' };
    }
    if (m.statusType === 'in-transit') {
      return { cls: 'status-part-paid', label: 'In Transit' };
    }
    return { cls: 'status-pending', label: 'On Leave' };
  }

  function formatCardLocation(loc) {
    if (!loc) return '';
    const main = loc.split('—')[0].trim();
    return main
      .replace(/\s+Logistics\s+Hub/i, ' Hub')
      .replace(/\s+Ops\s+Base/i, ' Base');
  }

  // ==========================================
  // LEFT PANEL: Team Member List
  // ==========================================
  function renderLeftPanel() {
    if (!colHost) return;

    const filtered = OPERATIONS_TEAM_MEMBERS.filter(m => {
      if (activeStatusFilter !== 'ALL' && m.statusType !== activeStatusFilter) {
        return false;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.officeLocation.toLowerCase().includes(q) ||
        (m.employeeId && m.employeeId.toLowerCase().includes(q))
      );
    });

    const counts = {
      ALL: OPERATIONS_TEAM_MEMBERS.length,
      available: OPERATIONS_TEAM_MEMBERS.filter(m => m.statusType === 'available').length,
      'in-transit': OPERATIONS_TEAM_MEMBERS.filter(m => m.statusType === 'in-transit').length,
      'on-leave': OPERATIONS_TEAM_MEMBERS.filter(m => m.statusType === 'on-leave').length,
    };

    const statusTabs = [
      { key: 'ALL', label: 'All', count: counts.ALL },
      { key: 'available', label: 'Available', count: counts.available },
      { key: 'in-transit', label: 'In Transit', count: counts['in-transit'] },
      { key: 'on-leave', label: 'On Leave', count: counts['on-leave'] },
    ];

    colHost.innerHTML = `
      <div class="team-roster-header">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0;">Operations Team</h3>
            <span style="font-size: 11.5px; font-weight: 600; color: #2563EB; background: #EFF6FF; padding: 2px 8px; border-radius: 9999px;">${filtered.length} active</span>
          </div>
        </div>

        <div class="team-search-row">
          <div class="compact-search-bar">
            ${icon('search', { size: 14 })}
            <input type="text" id="team-roster-search-input" placeholder="Search team members..." value="${esc(searchQuery)}" aria-label="Search team members" />
            ${searchQuery ? `<button id="team-roster-search-clear" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 13px; padding: 0 4px;" title="Clear search">✕</button>` : ''}
          </div>
        </div>

        <div class="compact-tabs-nav tabs-scroller" id="team-status-tabs-row" style="margin: 0; padding-bottom: 2px;">
          ${statusTabs.map(t => {
            const isActiveTab = activeStatusFilter === t.key;
            return `
              <button type="button" class="compact-tab-btn ${isActiveTab ? 'active' : ''}" data-team-status-filter="${t.key}">
                ${t.label} (${t.count})
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="team-roster-list" id="team-roster-list-scroll">
        ${filtered.map(m => {
          const isSelected = m.id === selectedMemberId;
          const status = getStatusPill(m);
          const inits = initials(m.name);

          return `
            <div class="team-roster-card ${isSelected ? 'active' : ''}" data-team-id="${esc(m.id)}" role="button" tabindex="0" aria-selected="${isSelected}">
              ${personCardHtml({
                avatar: m.avatar ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}" class="team-avatar-img" />` : `<div class="team-avatar-initials">${esc(inits)}</div>`,
                dot: m.statusType, name: m.name, emp: m.employeeId, role: m.role,
                badges: `<span class="status-pill ${status.cls}"><span class="dot"></span>${esc(status.label)}</span>`,
                meta: `<span class="badge-trips-pill">${m.metrics.activeTrips} Trips</span><span class="team-meta-dot">•</span><span class="team-meta-loc" title="${esc(m.officeLocation)}">${esc(formatCardLocation(m.officeLocation))}</span><span class="team-meta-dot">•</span><span class="team-meta-exp">${esc(m.experience)}</span>`,
                person: { id: m.id, name: m.name, phone: m.phone, email: m.email },
              })}
            </div>
          `;
        }).join('')}

        ${filtered.length === 0 ? `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 16px;">
            <p style="font-size: 13.5px; color: #64748B; margin-bottom: 12px;">No team members match the selected filter.</p>
            <button type="button" class="btn-secondary-desktop" id="team-reset-filters-btn" style="height: 34px; font-size: 12.5px;">Show All Staff</button>
          </div>
        ` : ''}
      </div>
    `;

    bindLeftPanelEvents();
  }

  function bindLeftPanelEvents() {
    const searchInput = colHost.querySelector('#team-roster-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderLeftPanel();
        const fresh = colHost.querySelector('#team-roster-search-input');
        if (fresh) {
          fresh.focus();
          fresh.setSelectionRange(fresh.value.length, fresh.value.length);
        }
      });
    }

    const clearBtn = colHost.querySelector('#team-roster-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchQuery = '';
        renderLeftPanel();
      });
    }

    const resetBtn = colHost.querySelector('#team-reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchQuery = '';
        activeStatusFilter = 'ALL';
        renderLeftPanel();
      });
    }

    colHost.querySelectorAll('[data-team-status-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeStatusFilter = btn.dataset.teamStatusFilter;
        renderLeftPanel();
      });
    });

    bindPersonActions(colHost);
    colHost.querySelectorAll('.team-roster-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.dataset.teamId;
        if (id) selectMember(id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.dataset.teamId;
          if (id) selectMember(id);
        }
      });
    });
  }

  // ==========================================
  // RIGHT PANEL: Empty State or Member Details
  // ==========================================
  function renderRightPanel() {
    if (!detailHost) return;

    // Centered empty-state message required by user
    const emptyStateHtml = `
      <div class="team-empty-state-view" style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 24px; color: #64748B;">
        <h4 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 8px; letter-spacing: 0.3px;">SELECT MEMBER TO KNOW DETAILS</h4>
        <p style="font-size: 13.5px; color: #64748B; margin: 0; max-width: 380px; line-height: 1.5;">Choose a team member from the list to view their profile, performance, assignments, and operational details.</p>
      </div>
    `;

    if (!selectedMemberId) {
      detailHost.innerHTML = emptyStateHtml;
      if (splitHost) splitHost.classList.remove('has-open-detail');
      return;
    }

    const member = getTeamMemberById(selectedMemberId);
    if (!member) {
      detailHost.innerHTML = emptyStateHtml;
      if (splitHost) splitHost.classList.remove('has-open-detail');
      return;
    }

    if (splitHost) splitHost.classList.add('has-open-detail');

    const assignedBookings = getTeamMemberAssignments(member, INITIAL_BOOKINGS);

    detailHost.innerHTML = `
      <div class="team-details-scroll-container" id="team-details-scroll-container">
        <!-- SECTION A: Employee Profile at the Top (Exact match to Screenshot 2) -->
        <div class="team-profile-header-card">
          <div class="team-profile-top-row">
            <div class="team-profile-left">
              <div class="team-profile-avatar-box">
                <img src="${esc(member.avatar)}" alt="${esc(member.name)}" class="team-profile-avatar-img" />
                <span class="team-avatar-dot ${member.statusType}"></span>
              </div>
              <div class="team-profile-info">
                <div class="team-profile-name-row">
                  <h2 class="team-profile-name">${esc(member.name)}</h2>
                  ${member.employeeId ? `<span class="team-profile-emp-pill">${esc(member.employeeId)}</span>` : ''}
                  <span class="team-profile-status-pill ${member.statusType}">
                    <span class="dot"></span>
                    ${esc(member.status)}
                  </span>
                </div>
                <div class="team-profile-sub-line">
                  <span class="team-profile-role">${esc(member.role)}</span>
                  <span class="team-profile-bullet">•</span>
                  <span class="team-profile-dept">${esc(member.department)}</span>
                  <span class="team-profile-bullet">•</span>
                  <span class="team-profile-loc">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${esc(member.officeLocation.split('—')[0].trim())}
                  </span>
                </div>
                <p class="team-profile-bio">${esc(member.bio)}</p>

                <div class="team-profile-chips-row">
                  <div class="team-info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>Email: <strong>${esc(member.email)}</strong></span>
                    <button type="button" class="chip-copy-btn" data-copy-text="${esc(member.email)}" title="Copy email">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <div class="team-info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>Phone: <strong>${esc(member.phone)}</strong></span>
                    <button type="button" class="chip-copy-btn" data-copy-text="${esc(member.phone)}" title="Copy phone">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <div class="team-info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span>Joined: <strong>${esc(member.joiningDate)} (${esc(member.experience)})</strong></span>
                  </div>
                  <div class="team-info-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Manager: <strong>${esc(member.reportingManager)}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Top Action Buttons -->
            <div class="team-profile-actions">
              <button type="button" class="team-action-btn btn-email-outline" data-action-mail="${esc(member.email)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </button>
              <button type="button" class="team-action-btn btn-call-outline" data-action-call="${esc(member.phone)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call
              </button>
              <button type="button" class="team-action-btn btn-assign-primary" data-action-assign-trip="${esc(member.id)}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Assign Trip
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION B: Performance Overview (Exact match to Screenshot 2) -->
        <div class="team-performance-section">
          <div class="team-section-header-line">
            <h3 class="team-section-title">Performance Overview</h3>
            <span class="team-section-subtitle">Live Operational KPIs</span>
          </div>
          <div class="team-kpi-grid">
            <!-- Card 1: Total Assigned Trips -->
            <div class="team-kpi-card">
              <div class="team-kpi-card-header">
                <span class="team-kpi-title">Total Assigned Trips</span>
                <div class="team-kpi-icon-box bg-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
              <div class="team-kpi-value-row">
                <span class="team-kpi-number">${member.metrics.totalTrips}</span>
                <span class="team-kpi-badge badge-green">All-time</span>
              </div>
              <p class="team-kpi-subtext">Across Northern & Inbound routes</p>
            </div>

            <!-- Card 2: Active Trips -->
            <div class="team-kpi-card">
              <div class="team-kpi-card-header">
                <span class="team-kpi-title">Active Trips</span>
                <div class="team-kpi-icon-box bg-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                </div>
              </div>
              <div class="team-kpi-value-row">
                <span class="team-kpi-number">${member.metrics.activeTrips}</span>
                <span class="team-kpi-badge badge-blue">Live On-Ground</span>
              </div>
              <p class="team-kpi-subtext">Active coordination & dispatch</p>
            </div>

            <!-- Card 3: Completed Trips -->
            <div class="team-kpi-card">
              <div class="team-kpi-card-header">
                <span class="team-kpi-title">Completed Trips</span>
                <div class="team-kpi-icon-box bg-purple">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
              </div>
              <div class="team-kpi-value-row">
                <span class="team-kpi-number">${member.metrics.completedTrips}</span>
                <span class="team-kpi-badge badge-green">${member.metrics.onTimeDelivery}</span>
              </div>
              <p class="team-kpi-subtext">Delivered with zero critical SLA breach</p>
            </div>

            <!-- Card 4: Average Rating -->
            <div class="team-kpi-card">
              <div class="team-kpi-card-header">
                <span class="team-kpi-title">Average Rating</span>
                <div class="team-kpi-icon-box bg-yellow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
              </div>
              <div class="team-kpi-value-row">
                <span class="team-kpi-number">${member.metrics.avgRating} <span style="color: #F59E0B; font-size: 20px;">★</span></span>
                <span class="team-kpi-badge badge-green">${member.metrics.reviewCount} Reviews</span>
              </div>
              <p class="team-kpi-subtext">Based on verified guest feedback</p>
            </div>
          </div>
        </div>

        <!-- SECTION C: Current Assignments (Collapsible Dropdown Accordion) -->
        <div class="team-assignments-card ${isAssignmentsExpanded ? 'is-expanded' : ''}" id="team-assignments-card">
          <div class="team-assignments-header">
            <div class="team-assignments-header-left" id="team-assignments-toggle-trigger" role="button" tabindex="0" aria-expanded="${isAssignmentsExpanded}" title="${isAssignmentsExpanded ? 'Collapse current assignments' : 'Click arrow to view current assignments dropdown'}">
              <div class="team-assignments-title-row">
                <h3 class="team-assignments-title">
                  Current Assignments
                  <button type="button" class="team-assignments-dropdown-arrow-btn ${isAssignmentsExpanded ? 'is-expanded' : ''}" id="team-assignments-dropdown-toggle" aria-label="${isAssignmentsExpanded ? 'Collapse assignments' : 'Expand assignments dropdown'}" title="${isAssignmentsExpanded ? 'Collapse assignments' : 'Expand assignments dropdown'}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="accordion-arrow-icon"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </h3>
              </div>
              <p class="team-assignments-subtitle">
                <span>Trips currently coordinated and dispatched by ${esc(member.name)}</span>
                <span class="team-assignments-collapsed-pill" id="team-assignments-collapsed-pill" style="${isAssignmentsExpanded ? 'display: none;' : ''}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  ${assignedBookings.length} assignments folded • Click arrow to view
                </span>
              </p>
            </div>
            <div class="team-assignments-header-right">
              <span class="team-assignments-count-badge">${assignedBookings.length} Trips Assigned</span>
            </div>
          </div>

          <div class="team-assignments-collapse-body ${isAssignmentsExpanded ? 'is-expanded' : ''}" id="team-assignments-collapse-body">
            <div class="team-assignments-table-wrap">
            <table class="team-assignments-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Travel Dates</th>
                  <th>Pax</th>
                  <th>Status</th>
                  <th>Assigned Responsibility</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${assignedBookings.map(b => {
                  const cust = b.customer || b.guest || {};
                  const inits = initials(cust.name || 'Customer');
                  const task = (member.taskAssignments && member.taskAssignments[b.id])
                    ? member.taskAssignments[b.id]
                    : (b.title || 'Ground Operations & Dispatch');
                  const dest = cust.preferredDestination || b.destination || b.title;
                  const statusCls = b.statusClass || (b.status === 'Paid' ? 'status-paid' : (b.status === 'Part Paid' ? 'status-part-paid' : 'status-pending'));

                  return `
                    <tr>
                      <td>
                        <div class="team-table-cust-cell">
                          <div class="team-table-avatar">${esc(inits)}</div>
                          <div class="team-table-cust-info">
                            <strong class="team-table-cust-name">${esc(cust.name || b.id)}</strong>
                            <span class="team-table-cust-phone">${esc(cust.phone || '')}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="team-table-dest-cell">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>${esc(dest)}</span>
                        </div>
                      </td>
                      <td>
                        <div class="team-table-dates-cell">
                          <span class="team-table-dates-bold">${esc(b.dates)}</span>
                          <span class="team-table-dates-sub">${esc(b.duration)}</span>
                        </div>
                      </td>
                      <td>
                        <span class="team-table-pax-badge">${esc(b.pax)} Pax</span>
                      </td>
                      <td>
                        <span class="status-pill ${statusCls}">
                          <span class="dot"></span>
                          ${esc(b.status)}
                        </span>
                      </td>
                      <td>
                        <span class="team-table-task-desc" title="${esc(task)}">${esc(task)}</span>
                      </td>
                      <td style="text-align: right;">
                        <button type="button" class="team-table-view-btn" data-view-booking-id="${esc(b.id)}">
                          View Booking
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}

                ${assignedBookings.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 36px 16px; color: #64748B;">
                      <p style="margin: 0; font-size: 13.5px;">No active trip assignments for ${esc(member.name)} at this time.</p>
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- SECTION D: Core Responsibilities & Skills -->
        <div class="team-extra-grid">
          <div class="team-extra-card">
            <div class="team-extra-card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <h4>Core Responsibilities & Skills</h4>
            </div>

            <div class="team-skills-layout-grid">
              <div>
                <span class="team-skills-subheading">Operational Responsibilities</span>
                <ul class="team-resp-list">
                  ${(member.responsibilities || []).map(r => `
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>${esc(r)}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <div>
                ${(member.expertise && member.expertise.length > 0) ? `
                  <span class="team-skills-subheading">Regional Expertise & Circuits</span>
                  <div class="team-skills-chips" style="margin-bottom: 14px;">
                    ${member.expertise.map(e => `
                      <span class="team-skill-tag tag-expertise">${esc(e)}</span>
                    `).join('')}
                  </div>
                ` : ''}

                <span class="team-skills-subheading">Specialized Skills & Certifications</span>
                <div class="team-skills-chips" style="${(member.servicesHandled && member.servicesHandled.length > 0) ? 'margin-bottom: 14px;' : ''}">
                  ${(member.skills || []).map(s => `
                    <span class="team-skill-tag">${esc(s)}</span>
                  `).join('')}
                </div>

                ${(member.servicesHandled && member.servicesHandled.length > 0) ? `
                  <span class="team-skills-subheading">Travel Services Handled</span>
                  <div class="team-skills-chips">
                    ${member.servicesHandled.map(svc => `
                      <span class="team-skill-tag tag-service">${esc(svc)}</span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindRightPanelEvents(member);
  }

  function bindRightPanelEvents(member) {
    if (!detailHost) return;

    // Toggle Current Assignments collapsible dropdown
    const cardEl = detailHost.querySelector('#team-assignments-card');
    const toggleTrigger = detailHost.querySelector('#team-assignments-toggle-trigger');
    const toggleBtn = detailHost.querySelector('#team-assignments-dropdown-toggle');
    const collapseBody = detailHost.querySelector('#team-assignments-collapse-body');
    const collapsedPill = detailHost.querySelector('#team-assignments-collapsed-pill');

    function toggleAssignments(e) {
      if (e) e.stopPropagation();
      isAssignmentsExpanded = !isAssignmentsExpanded;
      if (cardEl) cardEl.classList.toggle('is-expanded', isAssignmentsExpanded);
      if (collapseBody) collapseBody.classList.toggle('is-expanded', isAssignmentsExpanded);
      if (toggleBtn) {
        toggleBtn.classList.toggle('is-expanded', isAssignmentsExpanded);
        toggleBtn.setAttribute('aria-label', isAssignmentsExpanded ? 'Collapse assignments' : 'Expand assignments dropdown');
        toggleBtn.title = isAssignmentsExpanded ? 'Collapse assignments' : 'Expand assignments dropdown';
      }
      if (toggleTrigger) {
        toggleTrigger.setAttribute('aria-expanded', isAssignmentsExpanded);
        toggleTrigger.title = isAssignmentsExpanded ? 'Collapse current assignments' : 'Click arrow to view current assignments dropdown';
      }
      if (collapsedPill) {
        collapsedPill.style.display = isAssignmentsExpanded ? 'none' : 'inline-flex';
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleAssignments);
    }
    if (toggleTrigger) {
      toggleTrigger.addEventListener('click', (e) => {
        if (!e.target.closest('#team-assignments-dropdown-toggle')) {
          toggleAssignments(e);
        }
      });
      toggleTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAssignments(e);
        }
      });
    }

    // Copy buttons
    detailHost.querySelectorAll('[data-copy-text]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copyText;
        if (navigator && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            toast(`Copied: ${text}`, 'success');
          }).catch(() => {
            toast(`Copied: ${text}`, 'success');
          });
        } else {
          toast(`Copied: ${text}`, 'success');
        }
      });
    });

    // Call buttons
    detailHost.querySelectorAll('[data-action-call]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const phone = btn.dataset.actionCall;
        window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
        toast(`Calling ${phone}...`, 'info');
      });
    });

    // Email buttons
    detailHost.querySelectorAll('[data-action-mail]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const email = btn.dataset.actionMail;
        window.location.href = `mailto:${email}`;
        toast(`Composing email to ${email}...`, 'info');
      });
    });

    // Assign Trip button
    detailHost.querySelectorAll('[data-action-assign-trip]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toast(`Opening trip assignment modal for ${member.name}...`, 'info');
        window.dispatchEvent(new CustomEvent('open-assign-staff-modal', {
          detail: { staffId: member.id, staffName: member.name }
        }));
      });
    });

    // View Booking buttons
    detailHost.querySelectorAll('[data-view-booking-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bId = btn.dataset.viewBookingId;
        if (onViewBooking) {
          onViewBooking(bId);
        } else {
          navigate('bookings', { q: bId });
        }
      });
    });
  }

  return {
    activate,
    selectMember,
    render,
    getSelectedMemberId: () => selectedMemberId,
    setSearchQuery: (q) => {
      searchQuery = q;
      renderLeftPanel();
    },
    setStatusFilter: (s) => {
      activeStatusFilter = s;
      renderLeftPanel();
    }
  };
}

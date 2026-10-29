import { OPERATIONS_TEAM_MEMBERS, getTeamMemberById, getTeamMemberAssignments, buildTeamMember } from './shared/team-data.js';
import { openSheet } from './shared/sheet.js';
import { enhanceSelects } from './shared/dropdown-filter.js';
import { INITIAL_BOOKINGS } from './data.js';
import { icon } from './shared/icons.js';
import { esc, initials, toast, searchBox } from './shared/ui.js';
import { renderTabs } from './shared/list-ui.js';
import { personCardHtml, bindPersonActions } from './shared/person-actions.js';
import { bindSwipe, bindChipSwipe, slideIn } from './shared/swipe.js';

export function createMobileTeam(host, { onViewBooking } = {}) {
  let searchQuery = '';
  let activeStatusFilter = 'ALL'; // 'ALL', 'available', 'in-transit', 'on-leave'
  let selectedMemberId = null;
  let activeDetailTab = 'overview'; // 'overview', 'assignments', 'skills'
  let isDetailSheetOpen = false;
  let assignmentViewMode = 'cards'; // 'cards' | 'table'

  // Mount the basic DOM structure
  host.innerHTML = `
    <div class="mobile-team-page">
      <div class="mobile-search-row">
        ${searchBox({ id: 'mobile-team-search-input', placeholder: 'Search team members...', value: searchQuery, variant: 'mobile' })}
      </div>
      <div id="mobile-team-filter-tabs"></div>

      <div class="team-roster-list" id="mobile-team-cards-list">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Employee Detail Bottom Sheet Backdrop -->
    <div class="sheet-backdrop" id="mobile-team-backdrop" hidden></div>

    <!-- Employee Detail Bottom Sheet Modal -->
    <div class="bottom-sheet" id="mobile-team-sheet" role="dialog" aria-label="Team Member Details" hidden>
      <div class="sheet-drag-handle-bar">
        <div class="sheet-handle"></div>
      </div>

      <!-- Sheet Header Card -->
      <div id="mobile-team-sheet-header">
        <!-- Populated dynamically -->
      </div>

      <!-- Sheet Navigation Tabs (Overview & KPIs, Assignments, Skills & Info) -->
      <div class="sheet-tabs-nav" id="mobile-team-sheet-tabs">
        <!-- Populated dynamically -->
      </div>

      <!-- Sheet Body Scroll Content -->
      <div class="sheet-body-scroll" id="mobile-team-sheet-body">
        <!-- Populated dynamically -->
      </div>

      <!-- Sheet Sticky Footer Actions -->
      <div class="sheet-sticky-footer" id="mobile-team-sheet-footer">
        <!-- Populated dynamically -->
      </div>
    </div>
  `;

  const $ = (sel) => host.querySelector(sel);
  const searchInput = $('#mobile-team-search-input');
  const clearSearchBtn = $('#mobile-team-search-clear');
  const filterTabsContainer = $('#mobile-team-filter-tabs');
  const cardsListContainer = $('#mobile-team-cards-list');
  const backdropEl = $('#mobile-team-backdrop');
  const sheetEl = $('#mobile-team-sheet');

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

  function getFilteredMembers() {
    return OPERATIONS_TEAM_MEMBERS.filter((m) => {
      // Filter by status tab
      if (activeStatusFilter !== 'ALL' && m.statusType !== activeStatusFilter) {
        return false;
      }
      // Filter by search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          m.officeLocation.toLowerCase().includes(q) ||
          (m.employeeId && m.employeeId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  function renderFilterTabs() {
    const counts = {
      ALL: OPERATIONS_TEAM_MEMBERS.length,
      available: OPERATIONS_TEAM_MEMBERS.filter((m) => m.statusType === 'available').length,
      'in-transit': OPERATIONS_TEAM_MEMBERS.filter((m) => m.statusType === 'in-transit').length,
      'on-leave': OPERATIONS_TEAM_MEMBERS.filter((m) => m.statusType === 'on-leave').length,
    };

    const tabs = [
      { key: 'ALL', label: 'All', count: counts.ALL },
      { key: 'available', label: 'Available', count: counts.available },
      { key: 'in-transit', label: 'In Transit', count: counts['in-transit'] },
      { key: 'on-leave', label: 'On Leave', count: counts['on-leave'] },
    ];

    renderTabs(filterTabsContainer, { tabs, active: activeStatusFilter, variant: 'mobile', attr: 'data-team-filter' });

    filterTabsContainer.querySelectorAll('[data-team-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeStatusFilter = btn.dataset.teamFilter;
        renderFilterTabs();
        renderCards();
      });
    });
  }

  function renderCards() {
    const list = getFilteredMembers();

    if (list.length === 0) {
      cardsListContainer.innerHTML = `
        <div class="team-empty-state" style="padding: 40px 16px; text-align: center; color: #64748B;">
          <p style="font-size: 14px; margin: 0 0 10px;">No team members found matching "<strong>${esc(searchQuery)}</strong>"</p>
          <button type="button" class="btn-secondary-desktop" id="mobile-team-reset-filter" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; border-radius: 8px; padding: 6px 14px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
            Show All Members
          </button>
        </div>
      `;
      $('#mobile-team-reset-filter')?.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        activeStatusFilter = 'ALL';
        renderFilterTabs();
        renderCards();
      });
      return;
    }

    cardsListContainer.innerHTML = list
      .map((m) => {
        const status = getStatusPill(m);
        const inits = initials(m.name);
        const isSelected = m.id === selectedMemberId;

        return `
          <div class="team-roster-card ${isSelected ? 'active' : ''}" data-member-id="${esc(m.id)}" role="button" tabindex="0">
            ${personCardHtml({
              avatar: m.avatar ? `<img src="${esc(m.avatar)}" alt="${esc(m.name)}" class="team-avatar-img" />` : `<div class="team-avatar-initials">${esc(inits)}</div>`,
              dot: m.statusType, name: m.name, emp: m.employeeId, role: m.role,
              badges: `<span class="status-pill ${status.cls}"><span class="dot"></span>${esc(status.label)}</span>`,
              meta: `<span class="badge-trips-pill">${m.metrics?.activeTrips ?? 0} Trips</span><span class="team-meta-dot">•</span><span class="team-meta-loc" title="${esc(m.officeLocation)}">${esc(formatCardLocation(m.officeLocation))}</span><span class="team-meta-dot">•</span><span class="team-meta-exp">${esc(m.experience)}</span>`,
              person: { id: m.id, name: m.name, phone: m.phone, email: m.email },
            })}
          </div>
        `;
      })
      .join('');

    cardsListContainer.querySelectorAll('.team-roster-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.circle-action-btn') && !e.target.closest('.is-chevron')) {
          return;
        }
        const id = card.dataset.memberId;
        if (id) openDetailSheet(id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = card.dataset.memberId;
          if (id) openDetailSheet(id);
        }
      });
    });

    bindPersonActions(cardsListContainer);
  }

  function openDetailSheet(memberId) {
    selectedMemberId = memberId;
    activeDetailTab = 'overview';
    isDetailSheetOpen = true;

    renderSheetHeader();
    renderSheetTabs();
    renderSheetBody();
    renderSheetFooter();

    backdropEl.hidden = false;
    backdropEl.classList.add('open');
    sheetEl.hidden = false;
    sheetEl.classList.add('open');

    // Scroll sheet to top
    const bodyEl = $('#mobile-team-sheet-body');
    if (bodyEl) bodyEl.scrollTop = 0;
  }

  function closeDetailSheet() {
    isDetailSheetOpen = false;
    backdropEl.classList.remove('open');
    sheetEl.classList.remove('open');
    setTimeout(() => {
      if (!isDetailSheetOpen) {
        backdropEl.hidden = true;
        sheetEl.hidden = true;
      }
    }, 280);
  }

  function renderSheetHeader() {
    const member = getTeamMemberById(selectedMemberId);
    if (!member) return;

    const statusPillClass =
      member.statusType === 'available'
        ? 'pill-available'
        : member.statusType === 'in-transit'
          ? 'pill-in-transit'
          : 'pill-on-leave';

    $('#mobile-team-sheet-header').innerHTML = `
      <div class="sheet-customer-header">
        <img src="${member.avatar}" alt="${esc(member.name)}" class="customer-avatar-badge" style="object-fit: cover; border: 2px solid #E2E8F0;" />
        <div class="customer-header-info">
          <div class="customer-title-row">
            <h2 class="customer-name-title">${esc(member.name)}</h2>
            <span class="team-status-pill ${statusPillClass}">${esc(member.status)}</span>
          </div>
          <p class="customer-trip-subtitle">${esc(member.role)}</p>
          <div class="customer-meta-chips">
            <span class="team-emp-id-badge">${esc(member.employeeId)}</span>
            <span class="meta-dot">•</span>
            <span>${esc(member.department)}</span>
          </div>
        </div>
        <button class="sheet-close-btn mobile-sheet-close-pill" id="close-team-detail-sheet-btn" title="Close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    $('#close-team-detail-sheet-btn')?.addEventListener('click', closeDetailSheet);
  }

  function renderSheetTabs() {
    const member = getTeamMemberById(selectedMemberId);
    if (!member) return;
    const assignments = getTeamMemberAssignments(member, INITIAL_BOOKINGS);

    const tabs = [
      { key: 'overview', label: 'Overview & KPIs' },
      { key: 'assignments', label: `Assignments (${assignments.length})` },
      { key: 'skills', label: 'Skills & Info' },
    ];

    $('#mobile-team-sheet-tabs').innerHTML = tabs
      .map(
        (t) => `
        <button type="button" class="sheet-tab-btn ${activeDetailTab === t.key ? 'active' : ''}" data-team-tab="${t.key}">
          ${t.label}
        </button>
      `
      )
      .join('');

    $('#mobile-team-sheet-tabs')
      .querySelectorAll('[data-team-tab]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          activeDetailTab = btn.dataset.teamTab;
          renderSheetTabs();
          renderSheetBody();
        });
      });
  }

  function renderSheetBody() {
    const member = getTeamMemberById(selectedMemberId);
    if (!member) return;
    const bodyEl = $('#mobile-team-sheet-body');
    if (!bodyEl) return;

    if (activeDetailTab === 'overview') {
      bodyEl.innerHTML = `
        <div class="customer-details-tab-content team-mobile-skills-section">
          <!-- Section 1: Contact & Workplace Info -->
          <div class="team-mobile-section-card">
            <div class="team-mobile-section-header">
              <div class="team-mobile-section-header-left">
                <div class="team-icon-circle theme-blue">
                  ${icon('user', { size: 15 })}
                </div>
                <h3 class="team-mobile-section-title">Contact &amp; Workplace</h3>
              </div>
              <span class="team-mobile-section-badge">Directory</span>
            </div>

            <div class="customer-info-grid">
              <!-- Work Email -->
              <div class="info-cell">
                <span class="info-label">WORK EMAIL</span>
                <div class="contact-value-row">
                  <span class="info-value-bold" style="font-size: 13px; word-break: break-all;">${esc(member.email)}</span>
                  <button type="button" class="mini-icon-btn btn-mail-blue" data-copy-text="${esc(member.email)}" title="Copy Email">
                    ${icon('copy', { size: 12 })}
                  </button>
                </div>
              </div>

              <!-- Direct Phone -->
              <div class="info-cell">
                <span class="info-label">DIRECT PHONE</span>
                <div class="contact-value-row">
                  <span class="info-value-bold">${esc(member.phone)}</span>
                  <div class="contact-action-btns">
                    <a href="tel:${esc(member.phone)}" class="mini-icon-btn btn-call-green" title="Call">
                      ${icon('phone', { size: 11, stroke: 2.5 })}
                    </a>
                    <a href="https://wa.me/${member.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" class="mini-icon-btn btn-wa-green" title="WhatsApp">
                      ${icon('whatsapp', { size: 12 })}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Reporting Manager -->
              <div class="info-cell">
                <span class="info-label">REPORTING MANAGER</span>
                <span class="info-value-bold">${esc(member.reportingManager)}</span>
              </div>

              <!-- Base Office -->
              <div class="info-cell">
                <span class="info-label">BASE OFFICE</span>
                <span class="info-value-bold">${esc(member.officeLocation)}</span>
              </div>
            </div>
          </div>

          <!-- Section 2: About & Responsibilities -->
          <div class="team-mobile-section-card">
            <div class="team-mobile-section-header">
              <div class="team-mobile-section-header-left">
                <div class="team-icon-circle theme-purple">
                  ${icon('note', { size: 15 })}
                </div>
                <h3 class="team-mobile-section-title">About &amp; Responsibilities</h3>
              </div>
            </div>
            <p style="font-size: 13px; line-height: 1.55; color: #475569; margin: 0; padding: 2px 2px;">
              ${esc(member.bio)}
            </p>
          </div>

          <!-- Section 3: Performance Overview -->
          <div class="team-mobile-section-card">
            <div class="team-mobile-section-header">
              <div class="team-mobile-section-header-left">
                <div class="team-icon-circle theme-emerald">
                  ${icon('calendar', { size: 15 })}
                </div>
                <h3 class="team-mobile-section-title">Performance Overview</h3>
              </div>
              <span class="badge-pill-live" style="font-size: 11px; background: #ECFDF5; color: #047857; font-weight: 700; padding: 2px 8px; border-radius: 10px;">Live KPIs</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">Total Trips</span>
                  <div class="metric-icon-box bg-blue" style="width: 24px; height: 24px;">${icon('calendar', { size: 12 })}</div>
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">${member.metrics.totalTrips}</div>
                <span class="metric-trend trend-positive" style="font-size: 10.5px; margin-top: 2px; display: inline-block;">All-time</span>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">Active Trips</span>
                  <div class="metric-icon-box bg-emerald" style="width: 24px; height: 24px;">${icon('send', { size: 12 })}</div>
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">${member.metrics.activeTrips}</div>
                <span class="metric-trend trend-live" style="font-size: 10.5px; margin-top: 2px; display: inline-block;">On-Ground</span>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">Completed</span>
                  <div class="metric-icon-box bg-purple" style="width: 24px; height: 24px;">${icon('checkCircle', { size: 12 })}</div>
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">${member.metrics.completedTrips}</div>
                <span class="metric-trend trend-positive" style="font-size: 10.5px; margin-top: 2px; display: inline-block;">${member.metrics.onTimeDelivery}</span>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 11px; font-weight: 600; color: #64748B;">Rating</span>
                  <div class="metric-icon-box bg-amber" style="width: 24px; height: 24px;">★</div>
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">${member.metrics.avgRating} <span style="font-size: 14px; color: #F59E0B;">★</span></div>
                <span class="metric-trend trend-positive" style="font-size: 10.5px; margin-top: 2px; display: inline-block;">${member.metrics.reviewCount} Reviews</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (activeDetailTab === 'assignments') {
      const assignments = getTeamMemberAssignments(member, INITIAL_BOOKINGS);

      if (assignments.length === 0) {
        bodyEl.innerHTML = `
          <div class="customer-details-tab-content team-mobile-assignments-section">
            <div class="team-mobile-assignments-header-card">
              <div class="team-mobile-assignments-header-top">
                <div class="team-mobile-assignments-title-wrap">
                  <h3 class="team-mobile-assignments-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span>Current Assignments</span>
                  </h3>
                  <p class="team-mobile-assignments-subtitle">
                    Trips currently coordinated and dispatched by ${esc(member.name)}
                  </p>
                </div>
                <span class="team-assignments-count-badge">0 Trips Assigned</span>
              </div>
            </div>
            <div class="team-empty-state" style="padding: 36px 16px; text-align: center; color: #64748B;">
              <p style="font-size: 13.5px; margin: 0 0 4px; font-weight: 600; color: #334155;">No Active Assignments</p>
              <p style="font-size: 12px; margin: 0;">No trips currently linked to ${esc(member.name)}.</p>
            </div>
          </div>
        `;
      } else {
        bodyEl.innerHTML = `
          <div class="customer-details-tab-content team-mobile-assignments-section">
            <!-- Section Header (Exact Match to Desktop Current Assignments Header) -->
            <div class="team-mobile-assignments-header-card">
              <div class="team-mobile-assignments-header-top">
                <div class="team-mobile-assignments-title-wrap">
                  <h3 class="team-mobile-assignments-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span>Current Assignments</span>
                  </h3>
                  <p class="team-mobile-assignments-subtitle">
                    Trips currently coordinated and dispatched by ${esc(member.name)}
                  </p>
                </div>
                <span class="team-assignments-count-badge">${assignments.length} Trips Assigned</span>
              </div>

              <div class="team-mobile-header-toolbar">
                <span class="team-mobile-toolbar-label">Layout Mode</span>
                <div class="team-mobile-view-toggle" role="group" aria-label="Assignments Layout">
                  <button type="button" class="team-mobile-toggle-btn ${assignmentViewMode === 'cards' ? 'active' : ''}" data-view-mode="cards" aria-pressed="${assignmentViewMode === 'cards'}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Cards</span>
                  </button>
                  <button type="button" class="team-mobile-toggle-btn ${assignmentViewMode === 'table' ? 'active' : ''}" data-view-mode="table" aria-pressed="${assignmentViewMode === 'table'}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/></svg>
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>

            ${assignmentViewMode === 'cards' ? `
              <!-- Card View: Every Card Incorporates All Components from Screenshot 2 -->
              <div class="team-mobile-cards-stack">
                ${assignments
                  .map((b) => {
                    const cust = b.customer || b.guest || {};
                    const custName = cust.name || b.guest?.name || 'Customer';
                    const custPhone = cust.phone || b.guest?.phone || '';
                    const inits = initials(custName);
                    const task = (member.taskAssignments && member.taskAssignments[b.id])
                      ? member.taskAssignments[b.id]
                      : (b.assignedTask || b.title || 'Ground Operations & Dispatch');
                    const dest = cust.preferredDestination || b.destination || b.title;
                    const statusCls = b.statusClass || (b.status === 'Paid' ? 'status-paid' : (b.status === 'Part Paid' ? 'status-part-paid' : 'status-pending'));
                    const statusText = b.status || (statusCls === 'status-paid' ? 'Paid' : (statusCls === 'status-part-paid' ? 'Part Paid' : 'Pending'));

                    return `
                      <div class="team-mobile-assignment-card" data-booking-card-id="${esc(b.id)}">
                        <!-- Component 1: Customer (Avatar, Name, Booking ID tag, Phone) & Component 5: Status with Dot -->
                        <div class="team-mobile-card-top-row">
                          <div class="team-mobile-cust-group">
                            <div class="team-table-avatar" title="${esc(custName)}">${esc(inits)}</div>
                            <div class="team-mobile-cust-info">
                              <div class="team-mobile-cust-name-row">
                                <strong class="team-mobile-cust-name">${esc(custName)}</strong>
                                <span class="team-mobile-bkid-pill">${esc(b.id)}</span>
                              </div>
                              ${custPhone ? `
                                <a href="tel:${esc(custPhone)}" class="team-mobile-cust-phone" title="Call ${esc(custName)}">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                  <span>${esc(custPhone)}</span>
                                </a>
                              ` : ''}
                            </div>
                          </div>
                          <div class="team-mobile-status-cell">
                            <span class="status-pill ${statusCls}">
                              <span class="dot"></span>
                              ${esc(statusText)}
                            </span>
                          </div>
                        </div>

                        <!-- Component 2: Destination & Component 3: Travel Dates + Component 4: Pax Badge -->
                        <div class="team-mobile-trip-details">
                          <div class="team-mobile-dest-row">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span class="team-mobile-dest-text">${esc(dest)}</span>
                          </div>
                          <div class="team-mobile-dates-pax-row">
                            <div class="team-mobile-dates-wrap">
                              <span class="team-table-dates-bold">${esc(b.dates || 'Trip Dates')}</span>
                              <span class="team-meta-dot">•</span>
                              <span class="team-table-dates-sub">${esc(b.duration || 'Duration')}</span>
                            </div>
                            <span class="team-table-pax-badge">${esc(b.pax || 2)} Pax</span>
                          </div>
                        </div>

                        <!-- Component 6: Assigned Responsibility (Dedicated Box) -->
                        <div class="team-mobile-responsibility-box">
                          <div class="team-mobile-resp-header">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                            <span class="team-mobile-resp-label">ASSIGNED RESPONSIBILITY</span>
                          </div>
                          <p class="team-mobile-resp-text">${esc(task)}</p>
                        </div>

                        <!-- Component 7: Action (View Booking Details) -->
                        <button type="button" class="team-mobile-view-btn team-btn-view-booking" data-booking-id="${esc(b.id)}">
                          <span>View Booking Details</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            ` : `
              <!-- Table View: Exact Screenshot 2 Table Component Adapted for Mobile Scroll -->
              <div class="team-assignments-card" style="padding: 0; overflow: hidden; border-radius: 12px;">
                <div class="team-mobile-table-scroll-hint">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="8 8 4 12 8 16"/><polyline points="16 8 20 12 16 16"/></svg>
                  <span>Swipe horizontally to inspect full table</span>
                </div>
                <div class="team-assignments-table-wrap" style="border: none; border-radius: 0;">
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
                      ${assignments
                        .map((b) => {
                          const cust = b.customer || b.guest || {};
                          const custName = cust.name || b.guest?.name || 'Customer';
                          const custPhone = cust.phone || b.guest?.phone || '';
                          const inits = initials(custName);
                          const task = (member.taskAssignments && member.taskAssignments[b.id])
                            ? member.taskAssignments[b.id]
                            : (b.assignedTask || b.title || 'Ground Operations & Dispatch');
                          const dest = cust.preferredDestination || b.destination || b.title;
                          const statusCls = b.statusClass || (b.status === 'Paid' ? 'status-paid' : (b.status === 'Part Paid' ? 'status-part-paid' : 'status-pending'));
                          const statusText = b.status || (statusCls === 'status-paid' ? 'Paid' : (statusCls === 'status-part-paid' ? 'Part Paid' : 'Pending'));

                          return `
                            <tr>
                              <td>
                                <div class="team-table-cust-cell">
                                  <div class="team-table-avatar">${esc(inits)}</div>
                                  <div class="team-table-cust-info">
                                    <strong class="team-table-cust-name">${esc(custName)}</strong>
                                    ${custPhone ? `<span class="team-table-cust-phone">${esc(custPhone)}</span>` : ''}
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
                                  <span class="team-table-dates-bold">${esc(b.dates || 'Trip Dates')}</span>
                                  <span class="team-table-dates-sub">${esc(b.duration || 'Duration')}</span>
                                </div>
                              </td>
                              <td>
                                <span class="team-table-pax-badge">${esc(b.pax || 2)} Pax</span>
                              </td>
                              <td>
                                <span class="status-pill ${statusCls}">
                                  <span class="dot"></span>
                                  ${esc(statusText)}
                                </span>
                              </td>
                              <td>
                                <span class="team-table-task-desc" title="${esc(task)}">${esc(task)}</span>
                              </td>
                              <td style="text-align: right;">
                                <button type="button" class="team-table-view-btn team-btn-view-booking" data-booking-id="${esc(b.id)}">
                                  View Booking
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                              </td>
                            </tr>
                          `;
                        })
                        .join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `}
          </div>
        `;

        // Bind view mode toggle buttons
        bodyEl.querySelectorAll('[data-view-mode]').forEach((btn) => {
          btn.addEventListener('click', () => {
            assignmentViewMode = btn.dataset.viewMode;
            renderSheetBody();
          });
        });

        // Bind view booking buttons
        bodyEl.querySelectorAll('.team-btn-view-booking').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bId = btn.dataset.bookingId;
            const b = INITIAL_BOOKINGS.find((item) => item.id === bId) || { id: bId, title: 'Trip Booking', guest: { name: 'Guest' } };
            closeDetailSheet();
            if (onViewBooking) onViewBooking(bId || b.id || b);
          });
        });
      }
    } else if (activeDetailTab === 'skills') {
      bodyEl.innerHTML = `
        <div class="customer-details-tab-content team-mobile-skills-section">
          <!-- Card 1: Core Responsibilities & Skills (Exact Desktop Component from Image 2) -->
          <div class="team-extra-card team-mobile-core-card">
            <div class="team-extra-card-header">
              <div class="team-extra-card-header-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <h4>Core Responsibilities &amp; Skills</h4>
              </div>
              <span class="team-skills-verified-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Verified Profile</span>
              </span>
            </div>

            <div class="team-skills-layout-mobile">
              <!-- Subheading 1: Operational Responsibilities -->
              <div class="team-skills-section-block">
                <div class="team-skills-subheading-wrap">
                  <span class="team-skills-subheading">Operational Responsibilities</span>
                  <span class="team-skills-subheading-count">${(member.responsibilities || []).length} Duties</span>
                </div>
                <ul class="team-resp-list">
                  ${(member.responsibilities || [])
                    .map(
                      (r) => `
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>${esc(r)}</span>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>

              <!-- Subheading 2: Regional Expertise & Circuits -->
              ${(member.expertise && member.expertise.length > 0) ? `
                <div class="team-skills-section-block">
                  <div class="team-skills-subheading-wrap">
                    <span class="team-skills-subheading">Regional Expertise &amp; Circuits</span>
                    <span class="team-skills-subheading-count">${member.expertise.length} Circuits</span>
                  </div>
                  <div class="team-skills-chips">
                    ${member.expertise.map((e) => `
                      <span class="team-skill-tag tag-expertise">${esc(e)}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Subheading 3: Specialized Skills & Certifications -->
              ${(member.skills && member.skills.length > 0) ? `
                <div class="team-skills-section-block">
                  <div class="team-skills-subheading-wrap">
                    <span class="team-skills-subheading">Specialized Skills &amp; Certifications</span>
                    <span class="team-skills-subheading-count">${member.skills.length} Skills</span>
                  </div>
                  <div class="team-skills-chips">
                    ${member.skills.map((s) => `
                      <span class="team-skill-tag">${esc(s)}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Subheading 4: Travel Services Handled -->
              ${(member.servicesHandled && member.servicesHandled.length > 0) ? `
                <div class="team-skills-section-block">
                  <div class="team-skills-subheading-wrap">
                    <span class="team-skills-subheading">Travel Services Handled</span>
                    <span class="team-skills-subheading-count">${member.servicesHandled.length} Services</span>
                  </div>
                  <div class="team-skills-chips">
                    ${member.servicesHandled.map((svc) => `
                      <span class="team-skill-tag tag-service">${esc(svc)}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Card 2: Operational Deployment & Credentials (Uniform Structured Companion Card for Info Tab) -->
          <div class="team-extra-card team-mobile-core-card">
            <div class="team-extra-card-header">
              <div class="team-extra-card-header-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <h4>Operational Deployment &amp; Field Info</h4>
              </div>
              <span class="badge-pill-live" style="font-size: 11px; background: #ECFDF5; color: #047857; font-weight: 700; padding: 2px 8px; border-radius: 10px;">Active Roster</span>
            </div>

            <div class="customer-info-grid">
              <div class="info-cell">
                <span class="info-label">INDUSTRY EXPERIENCE</span>
                <span class="info-value-bold">${esc(member.experience || '5+ Years')}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">JOINING DATE</span>
                <span class="info-value-bold">${esc(member.joiningDate || 'Active')}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">ACTIVE SHIFT</span>
                <span class="info-value-bold">${esc(member.workload?.shift || 'Day Shift')}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">DUTY HOURS</span>
                <span class="info-value-bold" style="font-size: 12px;">${esc(member.workload?.workingHours || '09:00 AM – 06:30 PM')}</span>
              </div>
              <div class="info-cell" style="grid-column: span 2;">
                <span class="info-label">BASE DESK LOCATION</span>
                <span class="info-value-bold" style="font-size: 12px;">${esc(member.officeLocation || 'Mumbai HQ Operations Wing')}</span>
              </div>
              ${member.workload?.upcomingAssignment ? `
                <div class="info-cell" style="grid-column: span 2;">
                  <span class="info-label">UPCOMING DEPLOYMENT</span>
                  <span class="info-value-bold" style="color: #1D4ED8; font-size: 12px;">${esc(member.workload.upcomingAssignment)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Bind copy buttons in body
    bodyEl.querySelectorAll('[data-copy-text]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copyText;
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            toast(`Copied "${text}" to clipboard`, 'success');
          });
        }
      });
    });
  }

  function renderSheetFooter() {
    const member = getTeamMemberById(selectedMemberId);
    if (!member) return;

    $('#mobile-team-sheet-footer').innerHTML = `
      <button class="btn-confirm-booking" id="mobile-team-btn-assign-trip" style="height: 44px; font-size: 14px;">
        ${icon('assign', { size: 16 })}
        <span>Assign New Trip to ${esc(member.name)}</span>
      </button>

      <div class="sheet-quick-actions-grid" style="margin-top: 10px;">
        <button type="button" class="quick-action-col-btn btn-act-call" id="mobile-team-btn-call" title="Call ${esc(member.name)}">
          ${icon('phone', { size: 20, stroke: 2.2 })}
          <span>Call</span>
        </button>
        <button type="button" class="quick-action-col-btn btn-act-msg" id="mobile-team-btn-msg" title="Message ${esc(member.name)}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Message</span>
        </button>
        <button type="button" class="quick-action-col-btn btn-act-fwd" id="mobile-team-btn-forward" title="Forward Staff Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
          <span>Forward</span>
        </button>
        <button type="button" class="quick-action-col-btn btn-act-more" id="mobile-team-btn-more" title="More Options">
          ${icon('more', { size: 20, stroke: 2.2 })}
          <span>More</span>
        </button>
      </div>
    `;

    $('#mobile-team-btn-assign-trip')?.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('open-assign-staff-modal', {
          detail: { staffId: member.id, staffName: member.name },
        })
      );
      toast(`Trip assignment for ${member.name}`, 'info');
    });

    $('#mobile-team-btn-call')?.addEventListener('click', () => {
      window.location.href = `tel:${member.phone}`;
      toast(`Calling ${member.name} (${member.phone})...`, 'info');
    });

    $('#mobile-team-btn-msg')?.addEventListener('click', () => {
      window.location.href = `mailto:${member.email}`;
      toast(`Opening message to ${member.name}...`, 'info');
    });

    $('#mobile-team-btn-forward')?.addEventListener('click', () => {
      const summary = `Staff: ${member.name}\nRole: ${member.role}\nID: ${member.employeeId}\nPhone: ${member.phone}\nEmail: ${member.email}`;
      if (navigator.share) {
        navigator.share({ title: member.name, text: summary }).catch(() => { });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
          toast(`Staff details copied for forwarding`, 'success');
        });
      }
    });

    $('#mobile-team-btn-more')?.addEventListener('click', () => {
      const summary = `${member.name} (${member.role})\nEmail: ${member.email}\nPhone: ${member.phone}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(summary).then(() => {
          toast(`Copied full contact details to clipboard`, 'success');
        });
      }
    });
  }

  // Bind Backdrop tap to close sheet
  backdropEl.addEventListener('click', closeDetailSheet);

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderCards();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderCards();
    });
  }

  /** Add Member (the shared floating Add button): a bottom sheet with the essentials; nothing is focused, so no keyboard pops up. */
  function openAddMember() {
    const dlg = openSheet({
      label: 'Add team member',
      html: `<header class="asg-header"><h3 data-dialog-title tabindex="-1">Add Team Member</h3>
          <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
        <form class="tm-add-form" id="tm-add-form" novalidate>
          <div class="form-group"><label for="tm-name">Full Name *</label><input type="text" id="tm-name" placeholder="e.g. Sameer Verma" autocomplete="off" /></div>
          <div class="form-group"><label for="tm-role">Role *</label><input type="text" id="tm-role" placeholder="e.g. Trip Coordinator" autocomplete="off" /></div>
          <div class="form-group"><label for="tm-phone">Phone</label><input type="tel" id="tm-phone" placeholder="+91 98765 43210" autocomplete="off" /></div>
          <div class="form-group"><label for="tm-email">Email</label><input type="email" id="tm-email" placeholder="name@ruyi.in" autocomplete="off" /></div>
          <div class="form-group"><label for="tm-status">Status</label><select id="tm-status"><option value="available">Available</option><option value="in-transit">In Transit</option><option value="on-leave">On Leave</option></select></div>
        </form>
        <footer class="fu-footer"><button type="button" class="btn-secondary-desktop" data-sheet-close>Cancel</button><button type="button" class="btn-primary-desktop" id="tm-save">Add Member</button></footer>`,
    });
    enhanceSelects(dlg.sheet);
    dlg.$('#tm-save').addEventListener('click', () => {
      const val = (id) => dlg.$(id).value.trim();
      if (!val('#tm-name') || !val('#tm-role')) { toast('Please enter name and role.', 'warning'); return; }
      const member = buildTeamMember({ name: val('#tm-name'), role: val('#tm-role'), statusType: val('#tm-status'), phone: val('#tm-phone'), email: val('#tm-email'), empId: '', dept: 'Operations & Dispatch Hub', loc: 'Mumbai HQ', exp: '1.0 Year', bio: '' });
      OPERATIONS_TEAM_MEMBERS.unshift(member);
      dlg.close();
      searchQuery = '';
      activeStatusFilter = 'ALL';
      renderFilterTabs();
      renderCards();
      toast(`Team member "${member.name}" added successfully!`, 'success');
    });
  }
  window.addEventListener('open-add-team-member-modal', () => { if (document.documentElement.dataset.layout === 'mobile') openAddMember(); });

  // Swipe the member sheet's content: next / previous tab (Overview, Assignments, Skills & Info); stops at the ends.
  const DETAIL_TABS = ['overview', 'assignments', 'skills'];
  function stepDetailTab(step) {
    const to = DETAIL_TABS[DETAIL_TABS.indexOf(activeDetailTab) + step];
    if (!to) return;
    activeDetailTab = to;
    renderSheetTabs();
    renderSheetBody();
    $('#mobile-team-sheet-tabs .sheet-tab-btn.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    slideIn($('#mobile-team-sheet-body'), step);
  }
  bindChipSwipe(cardsListContainer, filterTabsContainer);
  bindSwipe($('#mobile-team-sheet-body'), { enabled: () => isDetailSheetOpen && !document.querySelector('.asg-overlay, .modal-overlay.open, .row-floating-menu'), onNext: () => stepDetailTab(1), onPrev: () => stepDetailTab(-1) });

  // Initial render
  renderFilterTabs();
  renderCards();

  return {
    activate: () => {
      renderFilterTabs();
      renderCards();
    },
    render: () => {
      renderFilterTabs();
      renderCards();
    },
    openMember: (id) => openDetailSheet(id),
    closeModal: () => closeDetailSheet(),
  };
}

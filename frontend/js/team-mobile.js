import { OPERATIONS_TEAM_MEMBERS, getTeamMemberById, getTeamMemberAssignments } from './shared/team-data.js';
import { INITIAL_BOOKINGS } from './data.js';
import { icon } from './shared/icons.js';
import { esc, initials, toast, searchBox } from './shared/ui.js';

export function createMobileTeam(host, { onViewBooking } = {}) {
  let searchQuery = '';
  let activeStatusFilter = 'ALL'; // 'ALL', 'available', 'in-transit', 'on-leave'
  let selectedMemberId = null;
  let activeDetailTab = 'overview'; // 'overview', 'assignments', 'skills'
  let isDetailSheetOpen = false;

  // Mount the basic DOM structure
  host.innerHTML = `
    <div class="mobile-team-page">
      <!-- Search Row -->
      <div class="mobile-team-search-row">
        ${searchBox({ id: 'mobile-team-search-input', placeholder: 'Search members by name or role...', value: searchQuery, variant: 'mobile' })}
      </div>

      <!-- Status Filter Tabs / Pills -->
      <div class="mobile-team-tabs-scroller" id="mobile-team-filter-tabs">
        <!-- Rendered dynamically -->
      </div>

      <!-- Team Members Cards List -->
      <div class="mobile-team-cards-list" id="mobile-team-cards-list">
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
  const filterTabsContainer = $('#mobile-team-filter-tabs');
  const cardsListContainer = $('#mobile-team-cards-list');
  const backdropEl = $('#mobile-team-backdrop');
  const sheetEl = $('#mobile-team-sheet');

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
          m.officeLocation.toLowerCase().includes(q)
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
      { key: 'ALL', label: 'All' },
      { key: 'available', label: 'Available' },
      { key: 'in-transit', label: 'In Transit' },
      { key: 'on-leave', label: 'On Leave' },
    ];

    filterTabsContainer.innerHTML = tabs
      .map(
        (t) => `
        <button type="button" class="mobile-team-tab-btn ${activeStatusFilter === t.key ? 'active' : ''}" data-team-filter="${t.key}">
          <span>${t.label}</span>
          <span class="mobile-team-tab-count">${counts[t.key] || 0}</span>
        </button>
      `
      )
      .join('');

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
          <button type="button" class="team-btn-reset-search" id="mobile-team-reset-filter" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #2563EB; border-radius: 8px; padding: 6px 14px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
            Show All Members
          </button>
        </div>
      `;
      $('#mobile-team-reset-filter')?.addEventListener('click', () => {
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        activeStatusFilter = 'ALL';
        renderFilterTabs();
        renderCards();
      });
      return;
    }

    cardsListContainer.innerHTML = list
      .map((m) => {
        const statusDotClass =
          m.statusType === 'available'
            ? 'status-dot-green'
            : m.statusType === 'in-transit'
              ? 'status-dot-blue'
              : 'status-dot-amber';
        const statusPillClass =
          m.statusType === 'available'
            ? 'pill-available'
            : m.statusType === 'in-transit'
              ? 'pill-in-transit'
              : 'pill-on-leave';

        return `
          <div class="mobile-team-member-card" data-member-id="${m.id}" role="button" tabindex="0">
            <div class="mobile-team-card-left">
              <div class="mobile-team-avatar-box">
                <img src="${m.avatar}" alt="${esc(m.name)}" class="mobile-team-avatar" />
                <span class="mobile-team-status-dot ${statusDotClass}" title="${esc(m.status)}"></span>
              </div>
              <div class="mobile-team-info">
                <div class="mobile-team-name-row">
                  <h4 class="mobile-team-name">${esc(m.name)}</h4>
                  <span class="team-emp-id-badge">${esc(m.id)}</span>
                  <span class="team-status-pill ${statusPillClass}">${esc(m.status)}</span>
                </div>
                <p class="mobile-team-role">${esc(m.role)}</p>
                <div class="mobile-team-meta-row">
                  <span class="team-trips-count-badge">${m.metrics.activeTrips} trips</span>
                  <span>•</span>
                  <span>${esc(m.officeLocation.split('—')[0].trim())}</span>
                  <span>•</span>
                  <span>${esc(m.experience)}</span>
                </div>
              </div>
            </div>

            <div class="mobile-team-card-actions">
              <a href="tel:${esc(m.phone)}" class="mobile-team-action-icon-btn btn-call" title="Call ${esc(m.phone)}" onclick="event.stopPropagation();">
                ${icon('phone', { size: 16 })}
              </a>
              <a href="mailto:${esc(m.email)}" class="mobile-team-action-icon-btn btn-mail" title="Email ${esc(m.email)}" onclick="event.stopPropagation();">
                ${icon('mail', { size: 16 })}
              </a>
              <button type="button" class="mobile-team-action-icon-btn btn-view" title="View Profile" aria-label="View Profile">
                ${icon('chevronRight', { size: 15 })}
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    cardsListContainer.querySelectorAll('.mobile-team-member-card').forEach((card) => {
      card.addEventListener('click', () => {
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
        <div class="customer-details-tab-content">
          <!-- Section 1: Contact & Workplace Info -->
          <div class="details-section-card">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle blue-circle">
                  ${icon('user', { size: 15 })}
                </div>
                <h3>Contact &amp; Workplace</h3>
              </div>
              <span class="team-section-badge" style="font-size: 11px;">Directory</span>
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
          <div class="details-section-card" style="margin-top: 14px;">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle purple-circle">
                  ${icon('note', { size: 15 })}
                </div>
                <h3>About &amp; Responsibilities</h3>
              </div>
            </div>
            <p style="font-size: 13px; line-height: 1.55; color: #475569; margin: 0; padding: 2px 2px;">
              ${esc(member.bio)}
            </p>
          </div>

          <!-- Section 3: Performance Overview -->
          <div class="details-section-card" style="margin-top: 14px;">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle emerald-circle">
                  ${icon('calendar', { size: 15 })}
                </div>
                <h3>Performance Overview</h3>
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
          <div class="team-empty-state" style="padding: 40px 16px; text-align: center; color: #64748B;">
            <p>No active assignments currently linked to ${esc(member.name)}.</p>
          </div>
        `;
      } else {
        bodyEl.innerHTML = `
          <div class="customer-details-tab-content">
            <div class="details-section-card">
              <div class="details-section-header">
                <div class="section-header-left">
                  <div class="section-icon-circle blue-circle">
                    ${icon('briefcase', { size: 15 })}
                  </div>
                  <h3>Active Assignments (${assignments.length})</h3>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${assignments
            .map((b) => {
              const custName = b.guest?.name || b.customer?.name || 'Customer';
              const statusClass =
                b.status === 'Confirmed'
                  ? 'badge-confirmed'
                  : b.status === 'Completed'
                    ? 'badge-completed'
                    : 'badge-pending';

              return `
                      <div class="mobile-assign-item-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
                        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div class="team-cust-avatar" style="width: 32px; height: 32px; font-size: 11px;">${initials(custName)}</div>
                            <div style="min-width: 0;">
                              <h4 style="font-size: 13.5px; font-weight: 700; color: #0F172A; margin: 0;">${esc(custName)}</h4>
                              <div style="font-size: 11.5px; color: #64748B; margin-top: 1px;">${esc(b.id)} • ${b.pax || 2} Pax</div>
                            </div>
                          </div>
                          <span class="status-badge ${statusClass}" style="font-size: 11px;">${esc(b.status || 'Active')}</span>
                        </div>

                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #334155;">
                          <div style="display: flex; align-items: center; gap: 5px; font-weight: 600; color: #0F172A;">
                            <span style="color: #EF4444;">${icon('pin', { size: 12 })}</span>
                            <span>${esc(b.destination || b.title)}</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px; font-size: 11.5px; color: #64748B;">
                            <span>${esc(b.dates || 'Trip Dates')}</span>
                            <span>•</span>
                            <span>${esc(b.duration || 'Duration')}</span>
                          </div>
                        </div>

                        <div style="margin-top: 8px; font-size: 11.5px; color: #475569;">
                          <strong style="color: #334155;">Task:</strong> ${esc(b.assignedTask || 'On-ground operational coordination')}
                        </div>

                        <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
                          <button type="button" class="team-btn-view-booking" data-booking-id="${b.id}" style="width: 100%; justify-content: center; height: 34px;">
                            <span>View Booking Details</span>
                            ${icon('chevronRight', { size: 13 })}
                          </button>
                        </div>
                      </div>
                    `;
            })
            .join('')}
              </div>
            </div>
          </div>
        `;

        bodyEl.querySelectorAll('.team-btn-view-booking').forEach((btn) => {
          btn.addEventListener('click', () => {
            const bId = btn.dataset.bookingId;
            const b = INITIAL_BOOKINGS.find((item) => item.id === bId) || { id: bId, title: 'Trip Booking', guest: { name: 'Guest' } };
            closeDetailSheet();
            if (onViewBooking) onViewBooking(b);
          });
        });
      }
    } else if (activeDetailTab === 'skills') {
      bodyEl.innerHTML = `
        <div class="customer-details-tab-content">
          <!-- Primary Responsibilities -->
          <div class="details-section-card">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle blue-circle">
                  ${icon('checkCircle', { size: 15 })}
                </div>
                <h3>Primary Responsibilities</h3>
              </div>
            </div>
            <ul class="team-checklist">
              ${member.responsibilities
          .map(
            (r) => `
                <li>
                  <span class="checklist-bullet">${icon('check', { size: 11, stroke: 2.5 })}</span>
                  <span style="font-size: 12.5px;">${esc(r)}</span>
                </li>
              `
          )
          .join('')}
            </ul>
          </div>

          <!-- Areas of Expertise -->
          <div class="details-section-card" style="margin-top: 14px;">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle purple-circle">
                  ${icon('pin', { size: 15 })}
                </div>
                <h3>Areas of Expertise</h3>
              </div>
            </div>
            <div class="team-tag-cloud">
              ${member.expertise.map((exp) => `<span class="team-tag tag-expertise">${esc(exp)}</span>`).join('')}
            </div>
          </div>

          <!-- Skills & Certifications -->
          <div class="details-section-card" style="margin-top: 14px;">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle emerald-circle">
                  ${icon('note', { size: 15 })}
                </div>
                <h3>Skills &amp; Certifications</h3>
              </div>
            </div>
            <div class="team-tag-cloud">
              ${member.skills.map((skill) => `<span class="team-tag tag-skill">${esc(skill)}</span>`).join('')}
            </div>
          </div>

          <!-- Travel Services Handled -->
          <div class="details-section-card" style="margin-top: 14px;">
            <div class="details-section-header">
              <div class="section-header-left">
                <div class="section-icon-circle amber-circle">
                  ${icon('calendar', { size: 15 })}
                </div>
                <h3>Travel Services Handled</h3>
              </div>
            </div>
            <div class="team-tag-cloud">
              ${member.servicesHandled.map((svc) => `<span class="team-tag tag-service">${esc(svc)}</span>`).join('')}
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
      renderCards();
    });
  }

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

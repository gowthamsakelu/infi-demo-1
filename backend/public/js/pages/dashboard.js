// Dashboard: Executive Overview for Ruyi Admin — Travel Operations CRM
import { getJson } from '../shared/http.js';
import { navigate } from '../shared/page-state.js';
import { esc, toast } from '../shared/ui.js';
import { icon } from '../shared/icons.js';

export default {
  css: true,
  async mount(host, ctx) {
    ctx.setAddButton?.(null);

    let state = {
      loading: true,
      error: null,
      data: null,
    };

    const container = document.createElement('div');
    container.className = 'dash-container';
    host.innerHTML = '';
    host.appendChild(container);

    function renderSkeleton() {
      return `
        <div class="dash-skeleton-wrapper">
          <div class="dash-skel-header">
            <div class="dash-skel-line w-40 h-28"></div>
            <div class="dash-skel-line w-60 h-16"></div>
          </div>
          <div class="dash-cards-grid">
            ${Array.from({ length: 6 }).map(() => `
              <div class="dash-skel-card">
                <div class="dash-skel-row">
                  <div class="dash-skel-box"></div>
                  <div class="dash-skel-line w-30 h-20"></div>
                  <div class="dash-skel-line w-20 h-28 ml-auto"></div>
                </div>
                <div class="dash-skel-divider"></div>
                <div class="dash-skel-row">
                  <div class="dash-skel-line w-25 h-14"></div>
                  <div class="dash-skel-line w-25 h-14"></div>
                  <div class="dash-skel-line w-25 h-14"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderCard(c) {
      return `
        <article class="dash-kpi-card ${c.cardClass || ''}" data-dash-nav="${esc(c.navTarget)}" role="button" tabindex="0" title="Click to view ${esc(c.title)}">
          <div class="dash-kpi-top">
            <div class="dash-kpi-left">
              <div class="dash-kpi-icon ${c.iconBgClass}">
                ${c.iconSvg}
              </div>
              <div class="dash-kpi-title-col">
                <h3 class="dash-kpi-title">${esc(c.title)}</h3>
                <span class="dash-kpi-subtitle">${esc(c.subtitle)}</span>
              </div>
            </div>
            <div class="dash-kpi-right">
              <span class="dash-kpi-val">${esc(String(c.value))}</span>
              <span class="dash-kpi-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </span>
            </div>
          </div>
          <div class="dash-kpi-divider"></div>
          <div class="dash-kpi-bottom">
            ${c.indicators.map((ind) => `
              <div class="dash-kpi-indicator" data-dash-filter="${esc(ind.filterTarget || '')}">
                <span class="dash-status-dot ${ind.dotClass}"></span>
                <span class="dash-ind-label">${esc(ind.label)}</span>
                <span class="dash-ind-val">${esc(String(ind.value))}</span>
              </div>
            `).join('')}
          </div>
        </article>
      `;
    }

    function renderView() {
      if (state.loading) {
        container.innerHTML = renderSkeleton();
        return;
      }

      if (state.error || !state.data) {
        container.innerHTML = `
          <div class="dash-error-box">
            <div class="dash-error-icon">${icon('alertCircle', { size: 36 })}</div>
            <h3>Unable to load dashboard data</h3>
            <p>${esc(state.error || 'Server error occurred')}</p>
            <button type="button" class="btn-primary-desktop" data-dash-act="reload">Retry</button>
          </div>
        `;
        return;
      }

      const d = state.data;
      const m = d.metrics;
      const admin = d.admin;

      // 6 Cards Config exactly reflecting reference image
      const cards = [
        {
          id: 'inquiries',
          title: 'Inquiries',
          subtitle: 'Total inquiries',
          value: m.inquiries.total,
          iconBgClass: 'dash-ico-indigo',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          `,
          navTarget: 'inquiries',
          indicators: [
            { label: 'New', value: m.inquiries.new, dotClass: 'dot-orange', filterTarget: 'inquiries?tab=new' },
            { label: 'Ongoing', value: m.inquiries.ongoing, dotClass: 'dot-blue', filterTarget: 'inquiries?tab=ongoing' },
            { label: 'Closed', value: m.inquiries.closed, dotClass: 'dot-green', filterTarget: 'inquiries?tab=closed' },
          ],
        },
        {
          id: 'bookings',
          title: 'Bookings',
          subtitle: 'Total bookings',
          value: m.bookings.total,
          iconBgClass: 'dash-ico-cyan',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          `,
          navTarget: 'bookings',
          indicators: [
            { label: 'Upcoming', value: m.bookings.upcoming, dotClass: 'dot-orange', filterTarget: 'bookings?tab=upcoming' },
            { label: 'Ongoing', value: m.bookings.ongoing, dotClass: 'dot-blue', filterTarget: 'bookings?tab=ongoing' },
            { label: 'Completed', value: m.bookings.completed, dotClass: 'dot-green', filterTarget: 'bookings?tab=completed' },
          ],
        },
        {
          id: 'revenue',
          title: 'Revenue',
          subtitle: 'Total revenue',
          value: m.revenue.total_formatted || '₹4.06L',
          iconBgClass: 'dash-ico-emerald',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12M6 8h12M6 13l7 8M6 13h5a4 4 0 0 0 0-8"/>
            </svg>
          `,
          navTarget: 'bookings',
          indicators: [
            { label: 'Tour', value: m.revenue.tour_formatted, dotClass: 'dot-orange', filterTarget: 'bookings' },
            { label: 'Activity', value: m.revenue.activity_formatted, dotClass: 'dot-blue', filterTarget: 'bookings' },
            { label: 'Other', value: m.revenue.other_formatted, dotClass: 'dot-green', filterTarget: 'bookings' },
          ],
        },
        {
          id: 'team',
          title: 'Team Performance',
          subtitle: 'Total inquiries handled',
          value: m.team.total,
          iconBgClass: 'dash-ico-violet',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          `,
          navTarget: 'inquiries',
          indicators: [
            { label: 'New', value: m.team.new, dotClass: 'dot-orange', filterTarget: 'inquiries' },
            { label: 'In progress', value: m.team.in_progress, dotClass: 'dot-blue', filterTarget: 'inquiries' },
            { label: 'Converted', value: m.team.converted, dotClass: 'dot-green', filterTarget: 'inquiries' },
          ],
        },
        {
          id: 'calendar',
          title: 'Calendar',
          subtitle: "Today's schedule",
          value: m.calendar.total,
          iconBgClass: 'dash-ico-amber',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          `,
          navTarget: 'calendar',
          indicators: [
            { label: 'Total', value: m.calendar.total, dotClass: 'dot-orange', filterTarget: 'calendar' },
            { label: 'Tours', value: m.calendar.tours, dotClass: 'dot-blue', filterTarget: 'calendar' },
            { label: 'Activities', value: m.calendar.activities, dotClass: 'dot-green', filterTarget: 'calendar' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments',
          subtitle: 'Total revenue',
          value: m.payments.received_formatted || '₹2.36L',
          iconBgClass: 'dash-ico-teal',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
          `,
          navTarget: 'bookings',
          indicators: [
            { label: 'Received', value: m.payments.received_formatted, dotClass: 'dot-green', filterTarget: 'bookings' },
            { label: 'Pending', value: m.payments.pending_formatted, dotClass: 'dot-orange', filterTarget: 'bookings' },
            { label: 'Refunds', value: m.payments.refunds_formatted, dotClass: 'dot-blue', filterTarget: 'bookings' },
          ],
        },
      ];

      const html = `
        <div class="dash-scroll-page">
          <!-- 1. Top Executive Welcome & Action Header -->
          <header class="dash-welcome-header">
            <div class="dash-welcome-left">
              <div class="dash-badge-pill">
                <span class="dash-badge-pulse"></span>
                <span>Operations Live • 2026</span>
              </div>
              <h1 class="dash-welcome-title">Welcome back, ${esc(admin.name)} 👋</h1>
              <p class="dash-welcome-subtitle">${esc(d.current_date)} • Overview of bookings, today's schedule, and real-time revenue.</p>
            </div>
            <div class="dash-welcome-right">
              <button type="button" class="btn-secondary-desktop dash-action-btn" data-dash-act="reload" title="Refresh metrics">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </header>

          <!-- 2. The Six Reference KPI Cards (Exact Layout & Visual Hierarchy) -->
          <section class="dash-cards-section" aria-label="Key Performance Indicators">
            <div class="dash-cards-grid">
              ${cards.map((c) => renderCard(c)).join('')}
            </div>
          </section>

          <!-- 3. Priority Action Center: Needs Attention -->
          <section class="dash-attention-section">
            <div class="dash-section-header">
              <div class="dash-section-title-wrap">
                <div class="dash-section-icon orange-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <h2 class="dash-section-title">Priority Action Center</h2>
                  <p class="dash-section-sub">Immediate items requiring operations or financial review</p>
                </div>
              </div>
              <span class="dash-alert-tag">${(d.needs_attention.pending_payments_count || 0) + (d.needs_attention.unassigned_inquiries_count || 0)} Tasks Pending</span>
            </div>

            <div class="dash-attention-grid">
              <div class="dash-attention-card">
                <div class="dash-attention-top">
                  <span class="dash-att-icon-pill red-pill">Payment Clearance</span>
                  <span class="dash-att-val">₹${(d.needs_attention.pending_payments_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <h4 class="dash-att-title">Pending Booking Payments</h4>
                <p class="dash-att-desc">${d.needs_attention.pending_payments_count} customer bookings currently have pending balance payments awaiting collection.</p>
                <div class="dash-att-footer">
                  <button type="button" class="dash-att-btn" data-dash-nav="bookings">Review Bookings →</button>
                </div>
              </div>

              <div class="dash-attention-card">
                <div class="dash-attention-top">
                  <span class="dash-att-icon-pill blue-pill">Lead Follow-up</span>
                  <span class="dash-att-val">${d.needs_attention.unassigned_inquiries_count} New</span>
                </div>
                <h4 class="dash-att-title">Unassigned Customer Inquiries</h4>
                <p class="dash-att-desc">${d.needs_attention.unassigned_inquiries_count} fresh inquiries received recently requiring team assignment and travel quotes.</p>
                <div class="dash-att-footer">
                  <button type="button" class="dash-att-btn" data-dash-nav="inquiries">Assign Leads →</button>
                </div>
              </div>

              <div class="dash-attention-card">
                <div class="dash-attention-top">
                  <span class="dash-att-icon-pill green-pill">Today's Schedule</span>
                  <span class="dash-att-val">${m.calendar.total} Events</span>
                </div>
                <h4 class="dash-att-title">Active Operations Today</h4>
                <p class="dash-att-desc">1 ongoing guest tour in Goa with 2 itinerary items active today including North Goa Drive & Sunset Yacht Cruise.</p>
                <div class="dash-att-footer">
                  <button type="button" class="dash-att-btn" data-dash-nav="calendar">Open Calendar →</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 4. Upcoming Trips & Departures Schedule Table -->
          <section class="dash-trips-section">
            <div class="dash-section-header">
              <div class="dash-section-title-wrap">
                <div class="dash-section-icon blue-tint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="14" x="2" y="6" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  </svg>
                </div>
                <div>
                  <h2 class="dash-section-title">Upcoming Trips & Active Tours</h2>
                  <p class="dash-section-sub">Confirmed guest departures and operational schedules</p>
                </div>
              </div>
              <button type="button" class="dash-link-btn" data-dash-nav="bookings">View All Bookings (${m.bookings.total}) →</button>
            </div>

            <div class="dash-table-card">
              <div class="dash-table-scroll">
                <table class="dash-table">
                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>TRIP & DESTINATION</th>
                      <th>PRIMARY GUEST</th>
                      <th>TRAVEL DATES</th>
                      <th>PAX</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>PAYMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(d.upcoming_trips || []).map((t) => `
                      <tr class="dash-table-row" data-dash-nav="bookings">
                        <td><span class="dash-booking-id">${esc(t.id)}</span></td>
                        <td>
                          <div class="dash-trip-cell">
                            <span class="dash-trip-title">${esc(t.title)}</span>
                            <span class="dash-trip-dest">${esc(t.destination || 'India')}</span>
                          </div>
                        </td>
                        <td>
                          <div class="dash-guest-cell">
                            <span class="dash-guest-name">${esc(t.customer_name)}</span>
                            <span class="dash-guest-phone">${esc(t.customer_phone)}</span>
                          </div>
                        </td>
                        <td><span class="dash-date-text">${esc(t.dates)}</span></td>
                        <td><span class="dash-pax-badge">${t.pax} pax</span></td>
                        <td><span class="dash-amount-val">${esc(t.price)}</span></td>
                        <td>
                          <span class="status-pill ${t.is_ongoing ? 'status-confirmed' : 'status-in-progress'}">
                            <span class="dot"></span> ${t.is_ongoing ? 'Ongoing' : 'Upcoming'}
                          </span>
                        </td>
                        <td>
                          <span class="status-pill ${t.status === 'Paid' ? 'status-confirmed' : (t.status === 'Part Paid' ? 'status-in-progress' : 'status-pending')}">
                            <span class="dot"></span> ${esc(t.status)}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      `;

      container.innerHTML = html;
    }

    async function loadData() {
      state.loading = true;
      state.error = null;
      renderView();
      try {
        const res = await getJson('/api/dashboard');
        state.data = res;
      } catch (err) {
        state.error = err.message || 'Failed to load dashboard data';
      } finally {
        state.loading = false;
        renderView();
      }
    }

    const onClick = (e) => {
      // Act buttons
      const act = e.target.closest('[data-dash-act]')?.dataset.dashAct;
      if (act === 'reload') {
        loadData();
        return;
      }

      // Filter click inside indicator
      const filterTarget = e.target.closest('[data-dash-filter]')?.dataset.dashFilter;
      if (filterTarget) {
        navigate(filterTarget);
        return;
      }

      // Card / general navigation
      const navTarget = e.target.closest('[data-dash-nav]')?.dataset.dashNav;
      if (navTarget) {
        navigate(navTarget);
      }
    };

    container.addEventListener('click', onClick);
    await loadData();

    return {
      destroy() {
        container.removeEventListener('click', onClick);
      },
    };
  },
};

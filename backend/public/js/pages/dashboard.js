// Dashboard: Executive Overview for Ruyi Admin — Travel Operations CRM
import { getJson } from '../shared/http.js';
import { navigate, getParams, setParams } from '../shared/page-state.js';
import { esc, toast } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { openSheet } from '../shared/sheet.js';

export default {
  css: true,
  async mount(host, ctx) {
    ctx.setAddButton?.(null);

    const initialParams = getParams();
    const validPeriods = ['today', '7days', '30days', 'year'];
    const initialPeriod = validPeriods.includes(initialParams.period) ? initialParams.period : '30days';

    let state = {
      loading: true,
      error: null,
      data: null,
      period: initialPeriod,
    };

    let clockTimer = null;
    let currentFetchId = 0;

    const container = document.createElement('div');
    container.className = 'dash-container';
    host.innerHTML = '';
    host.appendChild(container);

    function formatLocalTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    function startClock() {
      stopClock();
      clockTimer = setInterval(() => {
        const clockEl = container.querySelector('#dash-live-clock');
        if (clockEl) {
          clockEl.textContent = formatLocalTime();
        }
      }, 60000);
    }

    function stopClock() {
      if (clockTimer) {
        clearInterval(clockTimer);
        clockTimer = null;
      }
    }

    function renderTimeFilter() {
      return `
        <div class="dash-time-filter" role="group" aria-label="Time period filter">
          <button type="button" class="dash-filter-btn ${state.period === 'today' ? 'active' : ''}" data-dash-period="today">Today</button>
          <button type="button" class="dash-filter-btn ${state.period === '7days' ? 'active' : ''}" data-dash-period="7days">7 Days</button>
          <button type="button" class="dash-filter-btn ${state.period === '30days' ? 'active' : ''}" data-dash-period="30days">30 Days</button>
          <button type="button" class="dash-filter-btn ${state.period === 'year' ? 'active' : ''}" data-dash-period="year">Year</button>
        </div>
      `;
    }

    function renderMobileAppHeader(adminName) {
      return `
        <div class="mobile-app-header dash-mobile-header">
          <div class="app-brand-left">
            <div class="brand-icon-box">
              ${icon('plane', { size: 24, stroke: 2.2 })}
            </div>
            <div class="brand-text-col">
              <h2>Ruyi Admin</h2>
              <p class="dash-header-subtitle">Dashboard • Operations</p>
            </div>
          </div>
          <div class="app-header-right">
            <button class="icon-bell-btn" type="button" data-dash-bell aria-label="Notifications">
              ${icon('bell', { size: 22 })}
              <span class="bell-dot"></span>
            </button>
            <button type="button" class="ks-avatar-badge" title="${esc(adminName || 'Karan Sapalia')}" aria-haspopup="menu" aria-label="Account menu">KS</button>
          </div>
        </div>
      `;
    }

    function renderWelcomeLeftInner(adminName, d) {
      const timeStr = formatLocalTime();
      return `
        <h1 class="dash-welcome-title">Welcome back, ${esc(adminName || 'Karan Sapalia')} 👋</h1>
        <p class="dash-welcome-msg">Here's your travel business overview for today.</p>
        <div class="dash-welcome-meta">
          <span class="dash-welcome-date">${esc(d?.current_date || 'Tuesday, 27 October 2026')}</span>
          <span>•</span>
          <span class="dash-live-time" title="Current Local Time (updates every minute)">
            <span class="dash-live-time-dot"></span>
            <span id="dash-live-clock">${esc(timeStr)}</span>
          </span>
          <span>•</span>
          <span class="dash-welcome-subtitle">${esc(d?.period_label || "Overview of bookings and real-time revenue.")}</span>
        </div>
      `;
    }

    function renderWelcomeLeft(adminName, d) {
      return `
        <div class="dash-welcome-left">
          ${renderWelcomeLeftInner(adminName, d)}
        </div>
      `;
    }

    function renderWelcomeRight() {
      return `
        <div class="dash-welcome-right">
          ${renderTimeFilter()}
          <button type="button" class="btn-secondary-desktop dash-action-btn" data-dash-act="export" title="Export CSV report for ${esc(state.period)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export</span>
          </button>
          <button type="button" class="btn-secondary-desktop dash-action-btn" data-dash-act="reload" title="Refresh metrics">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      `;
    }

    function renderSkeleton() {
      return `
        ${renderMobileAppHeader()}
        <div class="dash-scroll-page">
          <header class="dash-welcome-header">
            <div class="dash-welcome-left">
              <div class="dash-skel-line w-40 h-28"></div>
              <div class="dash-skel-line w-60 h-16" style="margin-top: 6px;"></div>
            </div>
            ${renderWelcomeRight()}
          </header>
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

    function renderTripRow(t) {
      return `
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
      `;
    }

    function renderAttentionSection(d, m) {
      return `
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
      `;
    }

    function renderTripsSection(d, m) {
      return `
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
                  ${(d.upcoming_trips || []).map((t) => renderTripRow(t)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      `;
    }

    function getCardsConfig(m) {
      return [
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
          subtitle: 'Total revenue • Click to view trend',
          value: m.revenue.total_formatted || '₹4.06L',
          iconBgClass: 'dash-ico-emerald',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12M6 8h12M6 13l7 8M6 13h5a4 4 0 0 0 0-8"/>
            </svg>
          `,
          navTarget: 'revenue-trend',
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

    function renderRevenueChartSvg(trend) {
      if (!trend || !trend.length) {
        return `<div style="padding: 40px 20px; text-align: center; color: #94A3B8; font-size: 13px;">No revenue points recorded for this range.</div>`;
      }

      const w = 620;
      const h = 180;
      const padL = 55;
      const padR = 25;
      const padT = 20;
      const padB = 30;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      const maxVal = Math.max(...trend.map((t) => Math.max(t.revenue || 0, t.received || 0)), 1000);

      const pts = trend.map((t, idx) => {
        const x = padL + (idx / Math.max(trend.length - 1, 1)) * plotW;
        const yRev = padT + plotH - ((t.revenue || 0) / maxVal) * plotH;
        const yRec = padT + plotH - ((t.received || 0) / maxVal) * plotH;
        return { x, yRev, yRec, ...t };
      });

      const revLineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yRev.toFixed(1)}`).join(' ');
      const revAreaD = `${revLineD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
      const recLineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yRec.toFixed(1)}`).join(' ');

      const y0 = padT + plotH;
      const y50 = padT + plotH / 2;
      const y100 = padT;

      const formatShort = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v / 1000)}k`);

      return `
        <svg class="dash-rev-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#059669" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#059669" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="${padL}" y1="${y100}" x2="${w - padR}" y2="${y100}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="${padL}" y1="${y50}" x2="${w - padR}" y2="${y50}" stroke="#F1F5F9" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="${padL}" y1="${y0}" x2="${w - padR}" y2="${y0}" stroke="#E2E8F0" stroke-width="1" />

          <!-- Y-Axis labels -->
          <text x="${padL - 8}" y="${y100 + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">${formatShort(maxVal)}</text>
          <text x="${padL - 8}" y="${y50 + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">${formatShort(maxVal / 2)}</text>
          <text x="${padL - 8}" y="${y0 + 4}" text-anchor="end" font-size="10" font-weight="600" fill="#94A3B8">₹0</text>

          <!-- Area fill -->
          <path d="${revAreaD}" fill="url(#dashRevGrad)" />

          <!-- Received line (Blue dashed) -->
          <path d="${recLineD}" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4,3" />

          <!-- Revenue line (Emerald solid) -->
          <path d="${revLineD}" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Data Points & Labels -->
          ${pts.map((p) => `
            <g class="dash-chart-point">
              <circle cx="${p.x.toFixed(1)}" cy="${p.yRev.toFixed(1)}" r="4.5" fill="#059669" stroke="#FFFFFF" stroke-width="2">
                <title>${esc(p.label)}: Total ${esc(p.revenue_formatted)} (Received: ${esc(p.received_formatted)})</title>
              </circle>
              <text x="${p.x.toFixed(1)}" y="${padT + plotH + 18}" text-anchor="middle" font-size="11" font-weight="500" fill="#64748B">${esc(p.label)}</text>
            </g>
          `).join('')}
        </svg>
      `;
    }

    function openRevenueModal(d, period) {
      const m = d.metrics;
      const rev = m.revenue;
      const pay = m.payments;
      const trend = rev.trend || [];

      const html = `
        <header class="dash-rev-header">
          <div class="dash-rev-header-left">
            <div class="dash-rev-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3h12M6 8h12M6 13l7 8M6 13h5a4 4 0 0 0 0-8"/>
              </svg>
            </div>
            <div>
              <h3 class="dash-rev-header-title">Revenue Trend & Breakdown</h3>
              <p class="dash-rev-header-sub">
                <span class="dash-rev-period-pill">${esc(period.toUpperCase())}</span>
                <span>${esc(d.period_label || 'Operations overview')}</span>
              </p>
            </div>
          </div>
          <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close modal">
            ${icon('close', { size: 16, stroke: 2.5 })}
          </button>
        </header>

        <div class="dash-rev-body">
          <div class="dash-rev-stats-grid">
            <div class="dash-rev-stat-card stat-total">
              <span class="dash-rev-stat-label">Total Booking Value</span>
              <span class="dash-rev-stat-val">${esc(rev.total_formatted)}</span>
              <span class="dash-rev-stat-sub">Across all bookings</span>
            </div>
            <div class="dash-rev-stat-card stat-collected">
              <span class="dash-rev-stat-label">Collected Payments</span>
              <span class="dash-rev-stat-val">${esc(pay.received_formatted)}</span>
              <span class="dash-rev-stat-sub">Received in bank</span>
            </div>
            <div class="dash-rev-stat-card stat-pending">
              <span class="dash-rev-stat-label">Pending Balance</span>
              <span class="dash-rev-stat-val">${esc(pay.pending_formatted)}</span>
              <span class="dash-rev-stat-sub">Awaiting clearance</span>
            </div>
            <div class="dash-rev-stat-card">
              <span class="dash-rev-stat-label">Refunds Issued</span>
              <span class="dash-rev-stat-val">${esc(pay.refunds_formatted || '₹0.00')}</span>
              <span class="dash-rev-stat-sub">Processed cancellations</span>
            </div>
          </div>

          <div class="dash-rev-chart-wrap">
            <div class="dash-rev-chart-header">
              <h4 class="dash-rev-chart-title">Revenue Trajectory (${esc(period.toUpperCase())})</h4>
              <div class="dash-rev-legend">
                <span class="dash-legend-item">
                  <span class="dash-legend-line line-revenue"></span> Total Volume
                </span>
                <span class="dash-legend-item">
                  <span class="dash-legend-line line-received"></span> Collected
                </span>
              </div>
            </div>
            <div class="dash-rev-svg-container">
              ${renderRevenueChartSvg(trend)}
            </div>
          </div>
        </div>

        <footer class="dash-rev-footer">
          <button type="button" class="btn-secondary-desktop dash-action-btn" data-rev-act="export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download CSV Report</span>
          </button>
          <button type="button" class="btn-primary-desktop" data-rev-act="bookings">
            <span>View Bookings (${esc(String(m.bookings.total))}) →</span>
          </button>
        </footer>
      `;

      const sheet = openSheet({
        html,
        label: 'Revenue Trend',
        modal: true,
        cls: 'dash-rev-sheet',
      });

      sheet.ov.addEventListener('click', (e) => {
        if (e.target.closest('[data-rev-act="export"]')) {
          triggerExport();
        }
        if (e.target.closest('[data-rev-act="bookings"]')) {
          sheet.close();
          navigate('bookings');
        }
      });
    }

    function triggerExport() {
      const downloadUrl = `/api/dashboard/export?period=${encodeURIComponent(state.period)}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.setAttribute('download', `Ruyi_Dashboard_Report_${state.period}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast(`Exporting ${state.period} report...`, 'success');
    }

    function updateDynamicContent(d) {
      const m = d.metrics;

      // 1. Update Welcome Greeting & Live Clock
      const welcomeLeft = container.querySelector('.dash-welcome-left');
      if (welcomeLeft) {
        welcomeLeft.innerHTML = renderWelcomeLeftInner(d.admin?.name, d);
      }

      // 2. Ensure filter buttons match state.period
      container.querySelectorAll('.dash-filter-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.dashPeriod === state.period);
      });

      // 3. Update export button title
      const exportBtn = container.querySelector('[data-dash-act="export"]');
      if (exportBtn) {
        exportBtn.title = `Export CSV report for ${state.period}`;
      }

      // 4. Update 6 KPI cards in place
      const cardsGrid = container.querySelector('.dash-cards-grid');
      if (cardsGrid) {
        const cards = getCardsConfig(m);
        cardsGrid.innerHTML = cards.map((c) => renderCard(c)).join('');
      }

      // 5. Update Priority Action Center in place
      const attSection = container.querySelector('.dash-attention-section');
      if (attSection) {
        attSection.outerHTML = renderAttentionSection(d, m);
      }

      // 6. Update Upcoming Trips table in place
      const tripsSection = container.querySelector('.dash-trips-section');
      if (tripsSection) {
        tripsSection.outerHTML = renderTripsSection(d, m);
      }
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
      const cards = getCardsConfig(m);

      const html = `
        ${renderMobileAppHeader(admin.name)}
        <div class="dash-scroll-page">
          <!-- 1. Top Executive Welcome & Action Header -->
          <header class="dash-welcome-header">
            ${renderWelcomeLeft(admin.name, d)}
            ${renderWelcomeRight()}
          </header>

          <!-- 2. The Six Reference KPI Cards (Exact Layout & Visual Hierarchy) -->
          <section class="dash-cards-section" aria-label="Key Performance Indicators">
            <div class="dash-cards-grid">
              ${cards.map((c) => renderCard(c)).join('')}
            </div>
          </section>

          <!-- 3. Priority Action Center: Needs Attention -->
          ${renderAttentionSection(d, m)}

          <!-- 4. Upcoming Trips & Departures Schedule Table -->
          ${renderTripsSection(d, m)}
        </div>
      `;

      container.innerHTML = html;
      startClock();
    }

    async function loadData({ isFilter = false } = {}) {
      const fetchId = ++currentFetchId;
      const isInitial = !state.data;

      if (isInitial) {
        state.loading = true;
        state.error = null;
        renderView();
      } else {
        container.classList.add('dash-is-updating');
      }

      try {
        const query = state.period ? `?period=${encodeURIComponent(state.period)}` : '';
        const res = await getJson(`/api/dashboard${query}`);
        if (fetchId !== currentFetchId) return;

        state.data = res;
        state.error = null;
        state.loading = false;

        if (isInitial) {
          renderView();
        } else {
          updateDynamicContent(res);
        }
      } catch (err) {
        if (fetchId !== currentFetchId) return;
        if (isInitial) {
          state.loading = false;
          state.error = err.message || 'Failed to load dashboard data';
          renderView();
        } else {
          toast(err.message || 'Failed to update dashboard data', 'error');
        }
      } finally {
        if (fetchId === currentFetchId) {
          requestAnimationFrame(() => {
            container.classList.remove('dash-is-updating');
          });
        }
      }
    }

    const onClick = (e) => {
      // Bell notification button in mobile header
      if (e.target.closest('[data-dash-bell]')) {
        document.querySelector('#mobile-bell-btn')?.click();
        return;
      }

      // Time period filter buttons
      const periodBtn = e.target.closest('[data-dash-period]');
      if (periodBtn) {
        const selected = periodBtn.dataset.dashPeriod;
        if (selected && selected !== state.period) {
          state.period = selected;
          // Instant active toggle feedback
          container.querySelectorAll('.dash-filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.dashPeriod === selected);
          });
          setParams({ period: selected }, { push: false });
          loadData({ isFilter: true });
        }
        return;
      }

      // Act buttons
      const act = e.target.closest('[data-dash-act]')?.dataset.dashAct;
      if (act === 'reload') {
        loadData({ isFilter: Boolean(state.data) });
        return;
      }
      if (act === 'export') {
        triggerExport();
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
        if (navTarget === 'revenue-trend') {
          if (state.data) {
            openRevenueModal(state.data, state.period);
          }
          return;
        }
        navigate(navTarget);
      }
    };

    container.addEventListener('click', onClick);
    await loadData();

    return {
      destroy() {
        stopClock();
        container.removeEventListener('click', onClick);
      },
    };
  },
};

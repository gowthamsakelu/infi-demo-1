// Dashboard: Executive Overview for Ruyi Admin — Travel Operations CRM
import { getJson } from '../shared/http.js';
import { navigate, getParams, setParams } from '../shared/page-state.js';
import { esc, toast } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { openSheet } from '../shared/sheet.js';
import { renderTabs } from '../shared/list-ui.js';
import { bindChipSwipe } from '../shared/swipe.js';

export default {
  css: true,
  async mount(host, ctx) {
    ctx.setAddButton?.(null);

    const initialParams = getParams();
    const RANGES = [['today', 'Today'], ['1w', '1 Week'], ['1m', '1 Month'], ['6m', '6 Months'], ['year', 'Year'], ['custom', 'Custom']];
    const LEGACY = { '7days': '1w', '30days': '1m' };
    const validPeriods = RANGES.map(([k]) => k);
    const wanted = LEGACY[initialParams.period] || initialParams.period;
    const isoDay = (d) => d.toISOString().slice(0, 10);
    const customFrom = /^\d{4}-\d{2}-\d{2}$/.test(initialParams.from || '') ? initialParams.from : '';
    const customTo = /^\d{4}-\d{2}-\d{2}$/.test(initialParams.to || '') ? initialParams.to : '';
    const initialPeriod = wanted === 'custom' ? (customFrom && customTo ? 'custom' : 'today') : (validPeriods.includes(wanted) ? wanted : 'today');

    let state = {
      loading: true,
      error: null,
      data: null,
      period: initialPeriod,
      custom: { from: customFrom, to: customTo },
    };

    let clockTimer = null;
    let currentFetchId = 0;

    const container = document.createElement('div');
    container.className = 'dash-container';
    host.innerHTML = '';
    host.appendChild(container);


    /* ---------- ranges: which data each chip shows ---------- */
    // One small function gives every range its numbers: the figures of the server's "today" data are the base, scaled by the length of the range
    // (about days^0.8, so a longer range is always bigger and the ratios between the cards stay the same). The revenue trend chart borrows the
    // server's own series for the nearest period. Each range is remembered for the session: switching back is instant.
    const TREND_PERIOD = { '1w': '7days', '1m': '30days', '6m': 'year', year: 'year' };
    const rangeCache = new Map();
    const dayMs = 86400000;
    const parseDay = (iso) => new Date(`${iso}T00:00:00`);
    const fmtDay = (d, withYear) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });

    /** [from, to] dates of the range, today being the last day. */
    function rangeDates(period = state.period) {
      const to = new Date(); to.setHours(0, 0, 0, 0);
      if (period === 'custom' && state.custom.from && state.custom.to) return [parseDay(state.custom.from), parseDay(state.custom.to)];
      const back = { today: 0, '1w': 6, '1m': 29, '6m': 181, year: 364 }[period] ?? 0;
      return [new Date(to.getTime() - back * dayMs), to];
    }
    function rangeText(period = state.period) {
      const [from, to] = rangeDates(period);
      return from.getTime() === to.getTime() ? fmtDay(to, true) : `${fmtDay(from, from.getFullYear() !== to.getFullYear())} – ${fmtDay(to, true)}`;
    }
    const rangeDays = (period) => { const [from, to] = rangeDates(period); return Math.max(1, Math.round((to - from) / dayMs) + 1); };
    const keyOf = (period) => (period === 'custom' ? `custom:${state.custom.from}:${state.custom.to}` : period);

    /** Scale every count and rupee amount by `f` (lists such as trips and attention items are not touched). */
    function scaleMetrics(value, f) {
      if (typeof value === 'number') return Math.round(value * f);
      if (typeof value === 'string' && value.startsWith('₹')) {
        const n = Number(value.replace(/[^0-9.]/g, ''));
        return Number.isFinite(n) ? `₹${Math.round(n * f).toLocaleString('en-IN')}` : value;
      }
      if (Array.isArray(value)) return value.map((v) => scaleMetrics(v, f));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scaleMetrics(v, f)]));
      return value;
    }

    async function fetchRange(period, { fresh = false } = {}) {
      const key = keyOf(period);
      if (!fresh && rangeCache.has(key)) return structuredClone(rangeCache.get(key));
      const days = rangeDays(period);
      const trendKey = period === 'custom' ? (days <= 7 ? '7days' : days <= 30 ? '30days' : 'year') : TREND_PERIOD[period];
      const [base, trendSource] = await Promise.all([
        getJson('/api/dashboard?period=today', { fresh }),
        trendKey ? getJson(`/api/dashboard?period=${trendKey}`, { fresh }) : null,
      ]);
      const data = structuredClone(base);
      if (days > 1) data.metrics = scaleMetrics(base.metrics, Math.round(days ** 0.8 * 10) / 10);
      if (trendSource?.metrics?.revenue?.trend && data.metrics?.revenue) data.metrics.revenue.trend = trendSource.metrics.revenue.trend;
      rangeCache.set(key, structuredClone(data));
      return data;
    }

    /** The chip row (the shared Bookings pill row: swipes sideways, a swipe never selects) and the range line under it. */
    function paintRange() {
      const hostEl = container.querySelector('.dash-range-host');
      if (hostEl) {
        renderTabs(hostEl, { tabs: RANGES.map(([key, label]) => ({ key, label })), active: state.period, variant: 'mobile', attr: 'data-dash-period' });
        hostEl.querySelector('[data-dash-period="custom"]')?.insertAdjacentHTML('afterbegin', icon('calendar', { size: 14, stroke: 2.2 }));
      }
      const line = container.querySelector('.dash-range-line');
      if (line) line.innerHTML = `${icon('calendar', { size: 14, stroke: 2 })}<span>${esc(rangeText())}</span>${icon('chevronDown', { size: 14, stroke: 2.2 })}`;
    }

    /** Custom range: a centred popup with a start and an end date. Nothing is focused on open. */
    function openCustomRange() {
      const today = isoDay(new Date());
      const dlg = openSheet({
        modal: true, label: 'Custom range', overlayCls: 'popup-center',
        html: `<header class="modal-header"><div><h3 data-dialog-title tabindex="-1">Custom range</h3><p class="popup-sub">Pick the first and the last day.</p></div>
            <button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
          <div class="modal-body">
            <div class="form-group"><label for="dash-from">Start date</label><input type="date" id="dash-from" max="${today}" value="${esc(state.custom.from)}"></div>
            <div class="form-group"><label for="dash-to">End date</label><input type="date" id="dash-to" max="${today}" value="${esc(state.custom.to)}"></div>
            <p class="fu-error" id="dash-range-err" role="alert" hidden></p>
          </div>
          <footer class="modal-footer popup-actions"><button type="button" class="btn-secondary-desktop" data-sheet-close>Cancel</button><button type="button" class="btn-primary-desktop" id="dash-range-apply">Apply</button></footer>`,
      });
      const err = dlg.$('#dash-range-err');
      dlg.$('#dash-range-apply').addEventListener('click', () => {
        const from = dlg.$('#dash-from').value;
        const to = dlg.$('#dash-to').value;
        const bad = !from || !to ? 'Choose both dates.' : to < from ? 'The end date cannot be before the start date.' : to > today ? 'The end date cannot be in the future.' : '';
        err.hidden = !bad;
        err.textContent = bad;
        if (bad) return;
        state.custom = { from, to };
        state.period = 'custom';
        setParams({ period: 'custom', from, to }, { push: false });
        dlg.close();
        paintRange();
        loadData({ isFilter: true });
      });
    }

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

    function getTimeGreeting() {
      const hr = new Date().getHours();
      if (hr < 12) return 'Good morning';
      if (hr < 17) return 'Good afternoon';
      return 'Good evening';
    }

    function renderMobileAppHeader(adminName) {
      return `
        <div class="mobile-app-header">
          <div class="app-brand-left">
            <div class="brand-icon-box">
              ${icon('plane', { size: 24, stroke: 2.2 })}
            </div>
            <div class="brand-text-col">
              <h2>Ruyi Admin</h2>
              <p>Dashboard</p>
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
      const greeting = getTimeGreeting();
      const name = adminName || 'Karan Sapalia';
      const dateText = d?.current_date ? d.current_date.replace(/^[A-Za-z]+,\s*/, '') : '28 Oct 2026';
      return `
        <div class="dash-welcome-title-row">
          <div class="dash-welcome-sun" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4" fill="#FEF3C7"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </div>
          <h1 class="dash-welcome-title">${esc(greeting)}, ${esc(name)} 👋</h1>
        </div>
        <p class="dash-welcome-msg">Here's your travel business overview for today.</p>
        <div class="dash-welcome-meta-bar">
          <div class="dash-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span class="dash-welcome-date">${esc(dateText)}</span>
          </div>
          <span class="dash-meta-divider" aria-hidden="true">|</span>
          <div class="dash-meta-item" title="Current Local Time (updates every minute)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span id="dash-live-clock">${esc(timeStr)}</span>
          </div>
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
          <div class="dash-range-host"></div>
          <div class="dash-range-line" aria-live="polite"></div>
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
          <div class="dash-skel-section" aria-hidden="true"></div>
          <div class="dash-skel-section" aria-hidden="true"></div>
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
      const att = d.needs_attention || {};
      const totalPendingTasks = (att.pending_payments_count || 0) + (att.unassigned_inquiries_count || 0);

      return `
        <section class="dash-attention-section">
          <!-- Desktop Header -->
          <div class="dash-section-header dash-desktop-att-header">
            <div class="dash-section-title-wrap">
              <div class="dash-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h2 class="dash-section-title">Priority Action Center</h2>
                <p class="dash-section-sub">Immediate items requiring operations or financial review</p>
              </div>
            </div>
            <span class="dash-alert-tag">${totalPendingTasks} Tasks Pending</span>
          </div>

          <!-- Mobile Header (Exact match to reference) -->
          <div class="dash-section-header dash-mobile-att-header">
            <div class="dash-section-title-wrap">
              <div class="dash-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #2563EB)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h2 class="dash-section-title">Needs Attention</h2>
                <p class="dash-section-sub">Items that require your immediate attention</p>
              </div>
            </div>
            <button type="button" class="dash-view-all-link" data-dash-nav="inquiries">
              <span>View All</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Desktop Grid -->
          <div class="dash-attention-grid dash-desktop-att">
            <div class="dash-attention-card">
              <div class="dash-attention-top">
                <span class="dash-att-icon-pill red-pill">Payment Clearance</span>
                <span class="dash-att-val">₹${(att.pending_payments_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <h4 class="dash-att-title">Pending Booking Payments</h4>
              <p class="dash-att-desc">${att.pending_payments_count} customer bookings currently have pending balance payments awaiting collection.</p>
              <div class="dash-att-footer">
                <button type="button" class="dash-att-btn" data-dash-nav="bookings">Review Bookings →</button>
              </div>
            </div>

            <div class="dash-attention-card">
              <div class="dash-attention-top">
                <span class="dash-att-icon-pill blue-pill">Lead Follow-up</span>
                <span class="dash-att-val">${att.unassigned_inquiries_count} New</span>
              </div>
              <h4 class="dash-att-title">Unassigned Customer Inquiries</h4>
              <p class="dash-att-desc">${att.unassigned_inquiries_count} fresh inquiries received recently requiring team assignment and travel quotes.</p>
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

          <!-- Mobile Unified Card with 3 Rows (Exact match to reference) -->
          <div class="dash-attention-card-wrap dash-mobile-att">
            <div class="dash-att-row" data-dash-nav="inquiries">
              <div class="dash-att-row-left">
                <div class="dash-att-row-ico">
                  ${icon('calendar', { size: 22, stroke: 2 })}
                </div>
                <div class="dash-att-row-text">
                  <h4 class="dash-att-item-title">Follow-ups due today</h4>
                  <p class="dash-att-item-sub">Inquiries that need a response</p>
                </div>
              </div>
              <div class="dash-att-row-right">
                <button type="button" class="dash-att-row-view-btn" data-dash-nav="inquiries" aria-label="View follow-ups">
                  <span>View</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            <div class="dash-att-row" data-dash-nav="bookings">
              <div class="dash-att-row-left">
                <div class="dash-att-row-ico">
                  ${icon('creditCard', { size: 22, stroke: 2 })}
                </div>
                <div class="dash-att-row-text">
                  <h4 class="dash-att-item-title">Pending payments</h4>
                  <p class="dash-att-item-sub">Payments awaiting confirmation</p>
                </div>
              </div>
              <div class="dash-att-row-right">
                <button type="button" class="dash-att-row-view-btn" data-dash-nav="bookings" aria-label="View pending payments">
                  <span>View</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            <div class="dash-att-row" data-dash-nav="bookings">
              <div class="dash-att-row-left">
                <div class="dash-att-row-ico">
                  ${icon('users', { size: 22, stroke: 2 })}
                </div>
                <div class="dash-att-row-text">
                  <h4 class="dash-att-item-title">Unassigned trips</h4>
                  <p class="dash-att-item-sub">Upcoming trips without team member</p>
                </div>
              </div>
              <div class="dash-att-row-right">
                <button type="button" class="dash-att-row-view-btn" data-dash-nav="bookings" aria-label="View unassigned trips">
                  <span>View</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    function renderTripsSection(d, m) {
      const trips = d.upcoming_trips || [];

      return `
        <section class="dash-trips-section">
          <!-- Desktop Header -->
          <div class="dash-section-header dash-desktop-trips-header">
            <div class="dash-section-title-wrap">
              <div class="dash-section-icon">
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

          <!-- Mobile Header (Exact match to reference) -->
          <div class="dash-section-header dash-mobile-trips-header">
            <div class="dash-section-title-wrap">
              <div class="dash-section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #2563EB)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                </svg>
              </div>
              <div>
                <h2 class="dash-section-title">Upcoming Trips</h2>
                <p class="dash-section-sub">Next scheduled trips</p>
              </div>
            </div>
            <button type="button" class="dash-view-all-link" data-dash-nav="bookings">
              <span>View All</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Desktop Table Card -->
          <div class="dash-table-card dash-desktop-trips">
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
                  ${trips.map((t) => renderTripRow(t)).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Phone: stacked rows like the other list cards -->
          <div class="dash-mobile-trips dash-trip-list">
            ${trips.slice(0, 3).map((t) => {
              const confirmed = t.status === 'Paid' || t.status === 'Confirmed';
              return `
              <div class="dash-trip-row" data-dash-nav="bookings" data-booking-id="${esc(t.id)}" role="button" tabindex="0">
                <span class="row-avatar" aria-hidden="true">${esc(t.customer_initials || 'G')}</span>
                <div class="dash-trip-main">
                  <b class="dash-trip-name">${esc(t.customer_name)}</b>
                  <span class="dash-trip-dest-line">${esc(t.destination)}</span>
                </div>
                <div class="dash-trip-side">
                  <span class="dash-trip-date">${esc(t.dates || '')}</span>
                  <span class="status-pill ${confirmed ? 'status-confirmed' : 'status-pending'}"><span class="dot"></span>${confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
                <svg class="dash-trip-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </div>`;
            }).join('')}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #2563EB)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          `,
          navTarget: 'inquiries',
          indicators: [
            { label: 'New', value: m.inquiries.new, dotClass: 'dot-orange', filterTarget: 'inquiries' },
            { label: 'Ongoing', value: m.inquiries.ongoing, dotClass: 'dot-blue', filterTarget: 'inquiries' },
            { label: 'Closed', value: m.inquiries.closed, dotClass: 'dot-green', filterTarget: 'inquiries' },
          ],
        },
        {
          id: 'bookings',
          title: 'Bookings',
          subtitle: 'Total bookings',
          value: m.bookings.total,
          iconBgClass: 'dash-ico-cyan',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          `,
          navTarget: 'bookings',
          indicators: [
            { label: 'Upcoming', short: 'Next', value: m.bookings.upcoming, dotClass: 'dot-orange', filterTarget: 'bookings' },
            { label: 'Ongoing', value: m.bookings.ongoing, dotClass: 'dot-blue', filterTarget: 'bookings' },
            { label: 'Completed', short: 'Done', value: m.bookings.completed, dotClass: 'dot-green', filterTarget: 'bookings' },
          ],
        },
        {
          id: 'revenue',
          title: 'Revenue',
          subtitle: 'Total revenue',
          value: m.revenue.total_formatted || '₹90,000',
          iconBgClass: 'dash-ico-emerald',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12M6 8h12M6 13l7 8M6 13h5a4 4 0 0 0 0-8"/>
            </svg>
          `,
          navTarget: 'revenue-trend',
          indicators: [
            { label: 'Tour revenue', short: 'Tour', value: m.revenue.tour_formatted, dotClass: 'dot-orange', filterTarget: 'bookings' },
            { label: 'Activity revenue', short: 'Activity', value: m.revenue.activity_formatted, dotClass: 'dot-blue', filterTarget: 'bookings' },
            { label: 'Other revenue', short: 'Other', value: m.revenue.other_formatted, dotClass: 'dot-green', filterTarget: 'bookings' },
          ],
        },
        {
          id: 'team',
          title: 'Team Performance',
          titleShort: 'Team',
          subtitle: 'Total leads handled',
          subtitleShort: 'Leads handled',
          value: m.team.total,
          iconBgClass: 'dash-ico-violet',
          iconSvg: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          `,
          navTarget: 'inquiries',
          indicators: [
            { label: 'New leads', short: 'New', value: m.team.new, dotClass: 'dot-orange', filterTarget: 'inquiries' },
            { label: 'In progress', short: 'Active', value: m.team.in_progress, dotClass: 'dot-blue', filterTarget: 'inquiries' },
            { label: 'Converted', short: 'Won', value: m.team.converted, dotClass: 'dot-green', filterTarget: 'inquiries' },
          ],
        },
        {
          id: 'calendar',
          title: 'Calendar',
          subtitle: "Today's schedule",
          subtitleShort: 'Today',
          value: m.calendar.total,
          iconBgClass: 'dash-ico-amber',
          iconSvg: icon('calendar', { size: 24, stroke: 2 }),
          navTarget: 'calendar',
          indicators: [
            { label: 'Total events', short: 'Events', value: m.calendar.total, dotClass: 'dot-orange', filterTarget: 'calendar' },
            { label: 'Tours', value: m.calendar.tours, dotClass: 'dot-blue', filterTarget: 'calendar' },
            { label: 'Activities', short: 'Activity', value: m.calendar.activities, dotClass: 'dot-green', filterTarget: 'calendar' },
          ],
        },
        {
          id: 'payments',
          title: 'Payments',
          subtitle: 'Total revenue received',
          subtitleShort: 'Received',
          value: m.payments.received_formatted || '₹79,000',
          iconBgClass: 'dash-ico-teal',
          iconSvg: icon('creditCard', { size: 24, stroke: 2 }),
          navTarget: 'bookings',
          indicators: [
            { label: 'Received', short: 'Paid', value: m.payments.received_formatted, dotClass: 'dot-orange', filterTarget: 'bookings' },
            { label: 'Pending', short: 'Due', value: m.payments.pending_formatted, dotClass: 'dot-blue', filterTarget: 'bookings' },
            { label: 'Refunds', short: 'Refund', value: m.payments.refunds_formatted || '₹0.00', dotClass: 'dot-green', filterTarget: 'bookings' },
          ],
        },
      ];
    }

    /** "₹36,000" -> "₹36K" (sub-stats only, so three amounts always fit one card); plain counts stay as they are. */
    function compactAmount(v, decimals = 1) {
      const text = String(v ?? '');
      if (!text.startsWith('₹')) return text;
      const unit = /(Cr|L|K)\s*$/.exec(text)?.[1];
      const n = Number(text.replace(/[^0-9.]/g, '')) * ({ Cr: 1e7, L: 1e5, K: 1e3 }[unit] || 1);
      if (!Number.isFinite(n)) return text;
      const k = 10 ** decimals;
      const f = (x, u) => `₹${String(Math.round(x * k) / k).replace(/\.0$/, '')}${u}`;
      return n >= 1e7 ? f(n / 1e7, 'Cr') : n >= 1e5 ? f(n / 1e5, 'L') : n >= 1e3 ? f(n / 1e3, 'K') : `₹${Math.round(n)}`;
    }

    function renderCard(c) {
      return `
        <article class="dash-kpi-card ${c.cardClass || ''}" data-dash-nav="${esc(c.navTarget)}" role="button" tabindex="0">
          <div class="dash-kpi-top">
            <div class="dash-kpi-left">
              <div class="dash-kpi-icon ${c.iconBgClass}">
                ${c.iconSvg}
              </div>
              <div class="dash-kpi-title-col">
                <h3 class="dash-kpi-title"><span class="t-full">${esc(c.title)}</span><span class="t-short">${esc(c.titleShort || c.title)}</span></h3>
                <span class="dash-kpi-subtitle"><span class="t-full">${esc(c.subtitle)}</span><span class="t-short">${esc(c.subtitleShort || c.subtitle)}</span></span>
              </div>
            </div>
            <div class="dash-kpi-arrow" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
          <div class="dash-kpi-val-row">
            <span class="dash-kpi-val">${esc(compactAmount(c.value))}</span>
          </div>
          <div class="dash-kpi-divider"></div>
          <div class="dash-kpi-bottom">
            ${c.indicators.map((ind) => `
              <div class="dash-kpi-indicator" data-dash-filter="${esc(ind.filterTarget || '')}">
                <div class="dash-ind-label-wrap">
                  <span class="dash-status-dot ${ind.dotClass}"></span>
                  <span class="dash-ind-label"><span class="t-full">${esc(ind.label)}</span><span class="t-short">${esc(ind.short || ind.label)}</span></span>
                </div>
                <span class="dash-ind-val"><span class="t-full">${esc(compactAmount(ind.value))}</span><span class="t-short">${esc(compactAmount(ind.value, 0))}</span></span>
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

          <!-- Received line (Themed dashed) -->
          <path d="${recLineD}" fill="none" stroke="var(--primary, #2563EB)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4,3" />

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

    /** The Revenue trend popup's own "export" link (the page-level Export button is gone). */
    function triggerExport() {
      const a = document.createElement('a');
      a.href = `/api/dashboard/export?period=${encodeURIComponent(TREND_PERIOD[state.period] || 'today')}`;
      a.setAttribute('download', `Ruyi_Dashboard_Report_${state.period}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    /** New numbers fade in over the old layout (opacity only: nothing moves, nothing flashes). */
    function swapFade(el) {
      if (!el) return;
      el.classList.remove('dash-swap');
      void el.offsetWidth;
      el.classList.add('dash-swap');
    }

    function updateDynamicContent(d) {
      const m = d.metrics;

      // 1. Update Welcome Greeting & Live Clock
      const welcomeLeft = container.querySelector('.dash-welcome-left');
      if (welcomeLeft) {
        welcomeLeft.innerHTML = renderWelcomeLeftInner(d.admin?.name, d);
      }

      // 2. The chips and the range line follow the selected range
      paintRange();

      // 4. Update 6 KPI cards in place
      const cardsGrid = container.querySelector('.dash-cards-grid');
      if (cardsGrid) {
        const cards = getCardsConfig(m);
        cardsGrid.innerHTML = cards.map((c) => renderCard(c)).join('');
        swapFade(cardsGrid);
      }

      // 5. Update Priority Action Center in place
      const attSection = container.querySelector('.dash-attention-section');
      if (attSection) {
        attSection.outerHTML = renderAttentionSection(d, m);
        swapFade(container.querySelector('.dash-attention-section'));
      }

      // 6. Update Upcoming Trips table in place
      const tripsSection = container.querySelector('.dash-trips-section');
      if (tripsSection) {
        tripsSection.outerHTML = renderTripsSection(d, m);
        swapFade(container.querySelector('.dash-trips-section'));
      }
    }

    function renderView() {
      if (state.loading) {
        container.innerHTML = renderSkeleton();
        paintRange();
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
      paintRange();
      bindChipSwipe(container.querySelector('.dash-cards-grid'), container);
      startClock();
    }

    async function loadData({ isFilter = false, fresh = false } = {}) {
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
        const res = await fetchRange(state.period, { fresh });
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

      // Range chips: a tap selects (Custom opens its popup first); a swipe on the row never gets here
      const periodBtn = e.target.closest('[data-dash-period]');
      if (periodBtn) {
        const selected = periodBtn.dataset.dashPeriod;
        if (selected === 'custom') { openCustomRange(); return; }
        if (selected && selected !== state.period) {
          state.period = selected;
          paintRange();
          setParams({ period: selected, from: null, to: null }, { push: false });
          loadData({ isFilter: true });
        }
        return;
      }

      // Act buttons
      const act = e.target.closest('[data-dash-act]')?.dataset.dashAct;
      if (act === 'reload') {
        loadData({ isFilter: Boolean(state.data), fresh: true }); // the Refresh button always asks the server
        return;
      }

      // Filter click inside indicator
      const filterTarget = e.target.closest('[data-dash-filter]')?.dataset.dashFilter;
      if (filterTarget) {
        navigate(filterTarget);
        return;
      }

      // Open revenue trend modal
      if (e.target.closest('[data-dash-act="open-revenue-trend"]')) {
        if (state.data) {
          openRevenueModal(state.data, state.period);
        }
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

    // Hide floating add button on mobile while on dashboard
    const mobileAddBtn = document.getElementById('mobile-page-add');
    if (mobileAddBtn) mobileAddBtn.style.setProperty('display', 'none', 'important');

    await loadData();

    return {
      destroy() {
        stopClock();
        container.removeEventListener('click', onClick);
        if (mobileAddBtn) mobileAddBtn.style.removeProperty('display');
      },
    };
  },
};

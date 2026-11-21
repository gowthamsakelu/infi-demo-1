// Calendar, desktop layout: month grid, category tabs and agenda in the left column of the workspace.
// The selected booking opens in the same detail pane Bookings and Inquiries use (owned by desktop.js).
import { icon } from './shared/icons.js';
import { renderTabs } from './shared/list-ui.js';
import * as store from './shared/calendar-store.js';
import { categoryTabs, dateSection, loadingAgenda, emptyAgenda, errorAgenda, findBooking } from './shared/calendar-ui.js';

const GRID_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export function createDesktopCalendar(host, { onOpen, isActive }) {
  let activeId = null; // selected agenda event
  const collapsed = new Set();

  host.innerHTML = `
    <div class="compact-list-header cal-head">
      <div class="cal-nav">
        <div class="cal-nav-group">
          <button type="button" class="cal-arrow" data-cal-month="-1" aria-label="Previous month">${icon('chevronRight', { size: 15, stroke: 2.5, cls: 'cal-flip' })}</button>
          <span class="cal-nav-label" id="cal-month-name"></span>
          <button type="button" class="cal-arrow" data-cal-month="1" aria-label="Next month">${icon('chevronRight', { size: 15, stroke: 2.5 })}</button>
        </div>
        <span class="cal-count" id="cal-booking-count"></span>
        <div class="cal-nav-group">
          <button type="button" class="cal-arrow" data-cal-month="-12" aria-label="Previous year">${icon('chevronRight', { size: 15, stroke: 2.5, cls: 'cal-flip' })}</button>
          <span class="cal-nav-label" id="cal-year-name"></span>
          <button type="button" class="cal-arrow" data-cal-month="12" aria-label="Next year">${icon('chevronRight', { size: 15, stroke: 2.5 })}</button>
        </div>
      </div>
      <div class="cal-grid" role="grid" aria-label="Month">
        <div class="cal-weekdays">${GRID_DAYS.map((d) => `<span>${d}</span>`).join('')}</div>
        <div class="cal-days" id="cal-days"></div>
      </div>
      <div class="cal-foot">
        <span class="cal-foot-date"><span class="dot"></span><span id="cal-foot-date"></span></span>
        <button type="button" class="cal-today" id="cal-today">Go to Today</button>
      </div>
      <div id="cal-tabs"></div>
    </div>
    <div class="compact-list-items cal-agenda" id="cal-agenda"></div>`;

  const $ = (s) => host.querySelector(s);
  const agenda = $('#cal-agenda');

  function renderGrid() {
    const s = store.getState();
    const density = store.densityByDate();
    const today = store.todayYmd();
    $('#cal-days').innerHTML = store.monthWeeks(s.year, s.month).flat().map((d) => {
      const key = store.ymd(d);
      const out = d.getMonth() !== s.month;
      const dot = density[key] ? `<i class="cal-dot is-${density[key]}"></i>` : '';
      return `<button type="button" role="gridcell" class="cal-day ${out ? 'is-out' : ''} ${key === s.selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''}" data-cal-day="${key}" aria-label="${d.toDateString()}" aria-selected="${key === s.selected}" tabindex="${key === s.selected ? 0 : -1}">${d.getDate()}${dot}</button>`;
    }).join('');
  }

  function renderAgenda() {
    const s = store.getState();
    if (s.status === 'error') { agenda.innerHTML = errorAgenda(); return; }
    const groups = store.groupedByDate();
    if (s.status === 'loading' && ![...groups.values()].some((l) => l.length)) { agenda.innerHTML = loadingAgenda(); return; }
    if (![...groups.values()].some((l) => l.length)) { agenda.innerHTML = emptyAgenda(); return; }
    const dates = [...groups.keys()].filter((d) => groups.get(d)?.length).sort();
    agenda.innerHTML = dates.map((d) => dateSection(d, groups.get(d), { activeId, selected: d === s.selected, collapsed: collapsed.has(d) })).join('');
  }

  function scrollToSelected(smooth) {
    const targetDate = store.getState().selected;
    let el = agenda.querySelector(`[data-cal-date="${targetDate}"]`);
    if (!el) {
      const sections = [...agenda.querySelectorAll('.cal-section[data-cal-date]')];
      if (sections.length) {
        el = sections.find((s) => s.dataset.calDate >= targetDate) || sections[sections.length - 1];
        if (el) {
          const nextDate = el.dataset.calDate;
          store.getState().selected = nextDate;
          $('#cal-days').querySelectorAll('.cal-day').forEach((b) => {
            const on = b.dataset.calDay === nextDate;
            b.classList.toggle('is-selected', on);
            b.setAttribute('aria-selected', String(on));
            b.tabIndex = on ? 0 : -1;
          });
          agenda.querySelectorAll('.cal-section').forEach((sec) => {
            sec.classList.toggle('is-selected', sec === el);
          });
          $('#cal-foot-date').textContent = store.parseYmd(nextDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
    }
    if (el) agenda.scrollTo({ top: el.offsetTop - agenda.offsetTop - 4, behavior: smooth ? 'smooth' : 'auto' });
  }

  function render({ scroll = false } = {}) {
    if (!isActive()) return;
    const s = store.getState();
    const sum = store.monthSummary();
    $('#cal-month-name').textContent = store.MONTH_NAMES[s.month];
    $('#cal-year-name').textContent = s.year;
    $('#cal-booking-count').textContent = `${sum.bookings} ${sum.bookings === 1 ? 'Booking' : 'Bookings'}`;
    $('#cal-foot-date').textContent = store.parseYmd(s.selected).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    renderGrid();
    renderTabs($('#cal-tabs'), { tabs: categoryTabs(sum.counts), active: s.category, variant: 'compact', attr: 'data-cal-cat' });
    renderAgenda();
    if (scroll) scrollToSelected(false);
  }

  store.subscribe(() => render());

  host.addEventListener('click', (e) => {
    const month = e.target.closest('[data-cal-month]');
    if (month) { store.shiftMonth(Number(month.dataset.calMonth)); return; }
    const day = e.target.closest('[data-cal-day]');
    if (day) { store.select(day.dataset.calDay).then(() => scrollToSelected(true)); return; }
    if (e.target.closest('#cal-today')) { store.goToToday().then(() => scrollToSelected(true)); return; }
    const cat = e.target.closest('[data-cal-cat]');
    if (cat) { store.setCategory(cat.dataset.calCat); return; }
    const toggle = e.target.closest('[data-cal-toggle]');
    if (toggle) {
      const d = toggle.dataset.calToggle;
      collapsed.has(d) ? collapsed.delete(d) : collapsed.add(d);
      toggle.closest('.cal-section').classList.toggle('is-collapsed', collapsed.has(d));
      toggle.setAttribute('aria-expanded', String(!collapsed.has(d)));
      return;
    }
    const card = e.target.closest('[data-cal-event]');
    if (card) {
      activeId = card.dataset.calEvent;
      const booking = findBooking(card.dataset.bookingIdRef);
      agenda.querySelectorAll('.cal-card.active').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      if (booking) onOpen(booking);
      return;
    }
    if (e.target.closest('#btn-retry-calendar')) store.load({ force: true });
  });

  // Arrow keys move the selected day (left / right: one day, up / down: one week) while the calendar is showing.
  window.addEventListener('keydown', (e) => {
    if (!isActive() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable], [role="dialog"], .row-floating-menu')) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    store.select(store.ymd(store.addDays(store.parseYmd(store.getState().selected), step))).then(() => {
      scrollToSelected(true);
      host.querySelector('.cal-day.is-selected')?.focus({ preventScroll: true });
    });
  });

  return {
    /** Called when the Calendar page becomes the visible page. */
    activate() { render({ scroll: true }); store.load().then(() => requestAnimationFrame(() => scrollToSelected(false))); },
    /** The detail pane was closed: nothing is selected any more. */
    clearSelection() { activeId = null; agenda.querySelectorAll('.cal-card.active').forEach((c) => c.classList.remove('active')); },
    render,
  };
}

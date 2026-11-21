// Calendar, phone layout: week strip, category tabs and one swipeable pane per category.
// Tapping an item opens the booking in the app's bottom sheet (owned by mobile.js).
import { icon } from './shared/icons.js';
import { renderTabs } from './shared/list-ui.js';
import { openSheet } from './shared/sheet.js';
import { esc } from './shared/ui.js';
import * as store from './shared/calendar-store.js';
import { categoryTabs, dateSection, loadingAgenda, emptyAgenda, errorAgenda, findBooking } from './shared/calendar-ui.js';

export function createMobileCalendar(host, { onOpen, isActive }) {
  const collapsed = new Set();
  let paneIndex = 0;
  let programmatic = false; // true while we scroll the panes ourselves (tab tap)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  host.innerHTML = `
    <section class="cal-week">
      <div class="cal-week-bar">
        <span class="cal-week-label" id="cal-week-label"></span>
        <div class="cal-nav-group">
          <button type="button" class="cal-arrow" data-cal-week="-1" aria-label="Previous week">${icon('chevronRight', { size: 15, stroke: 2.5, cls: 'cal-flip' })}</button>
          <button type="button" class="cal-arrow" data-cal-week="1" aria-label="Next week">${icon('chevronRight', { size: 15, stroke: 2.5 })}</button>
        </div>
      </div>
      <div class="cal-week-row">
        <div class="cal-week-viewport" id="cal-week-viewport"></div>
        <button type="button" class="cal-month-btn" id="cal-month-btn" aria-haspopup="dialog"><span id="cal-month-short"></span>${icon('chevronDown', { size: 14, stroke: 2.5 })}</button>
      </div>
    </section>
    <div id="cal-tabs"></div>
    <div class="cal-panes" id="cal-panes">
      ${store.CATEGORIES.map((c, i) => `<div class="cal-pane" data-cal-pane="${i}" id="cal-pane-${c.key}" role="tabpanel"></div>`).join('')}
    </div>`;

  const $ = (s) => host.querySelector(s);
  const weekVp = $('#cal-week-viewport');
  const panes = $('#cal-panes');

  const weekOfSelected = () => {
    const s = store.getState();
    return store.monthWeeks(s.year, s.month).findIndex((w) => w.some((d) => store.ymd(d) === s.selected));
  };

  function renderWeeks() {
    const s = store.getState();
    const density = store.densityByDate();
    const today = store.todayYmd();
    weekVp.innerHTML = store.monthWeeks(s.year, s.month).map((week, i) => `
      <div class="cal-week-slide" data-week="${i}">
        ${week.map((d) => {
          const key = store.ymd(d);
          const dot = density[key] ? `is-${density[key]}` : '';
          return `<button type="button" class="cal-pill ${key === s.selected ? 'is-selected' : ''} ${key === today ? 'is-today' : ''} ${d.getMonth() !== s.month ? 'is-out' : ''}" data-cal-day="${key}" aria-pressed="${key === s.selected}" aria-label="${d.toDateString()}">
            <span class="cal-pill-day">${store.WEEKDAYS[d.getDay()]}</span><span class="cal-pill-date">${d.getDate()}</span><i class="cal-dot ${dot}"></i>
          </button>`;
        }).join('')}
      </div>`).join('');
  }

  function weekLabel(i) {
    const s = store.getState();
    const week = store.monthWeeks(s.year, s.month)[Math.max(0, i)];
    const fmt = (d) => `${d.getDate()} ${store.MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
    return `Week ${i + 1} • ${fmt(week[0])} – ${fmt(week[6])}`;
  }

  const currentWeek = () => Math.round(weekVp.scrollLeft / (weekVp.clientWidth || 1));

  /**
   * Smooth programmatic scroll on a snapping pager. Snapping is switched off while it animates (smooth scrolling and
   * mandatory snapping fight each other) and back on when it ends.
   */
  function glideX(el, left, smooth, done) {
    if (!smooth || reduced.matches || Math.abs(el.scrollLeft - left) < 1) { el.scrollTo({ left, behavior: 'auto' }); done?.(); return; }
    el.style.scrollSnapType = 'none';
    let timer;
    const end = () => { clearTimeout(timer); el.removeEventListener('scrollend', end); el.style.scrollSnapType = ''; done?.(); };
    el.addEventListener('scrollend', end);
    timer = setTimeout(end, 700);
    el.scrollTo({ left, behavior: 'smooth' });
  }

  const showWeek = (i, smooth) => {
    $('#cal-week-label').textContent = weekLabel(i);
    if (currentWeek() !== i || !smooth) glideX(weekVp, i * weekVp.clientWidth, smooth);
  };

  function renderPanes() {
    const s = store.getState();
    store.CATEGORIES.forEach((c) => {
      const pane = $(`#cal-pane-${c.key}`);
      if (s.status === 'error') { pane.innerHTML = errorAgenda(); return; }
      const groups = store.groupedByDate(c.key);
      if (s.status === 'loading' && ![...groups.values()].some((l) => l.length)) { pane.innerHTML = loadingAgenda(); return; }
      if (![...groups.values()].some((l) => l.length)) { pane.innerHTML = emptyAgenda(`No ${c.label.toLowerCase()} this month`); return; }
      pane.innerHTML = [...groups.keys()].filter((d) => groups.get(d)?.length).sort().map((d) => dateSection(d, groups.get(d), { selected: d === s.selected, collapsed: collapsed.has(d) })).join('');
    });
  }

  let isScrollingProgrammatically = false;
  let programmaticScrollTimer = null;
  let scrollTicking = false;

  function onPaneScroll(e) {
    if (isScrollingProgrammatically || scrollTicking) return;
    scrollTicking = true;

    requestAnimationFrame(() => {
      scrollTicking = false;
      if (isScrollingProgrammatically) return;

      const pane = e.target;
      const sections = pane.querySelectorAll('.cal-section[data-cal-date]');
      if (!sections.length) return;

      const scrollTop = pane.scrollTop;
      let activeSection = sections[0];

      if (pane.scrollHeight - pane.scrollTop <= pane.clientHeight + 15) {
        activeSection = sections[sections.length - 1];
      } else {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          if (sec.offsetTop - pane.offsetTop <= scrollTop + 50) {
            activeSection = sec;
          } else {
            break;
          }
        }
      }

      const activeDate = activeSection?.dataset.calDate;
      if (!activeDate) return;

      const s = store.getState();
      if (activeDate !== s.selected) {
        lastSelected = activeDate;
        s.selected = activeDate;

        weekVp.querySelectorAll('.cal-pill').forEach((p) => {
          const on = p.dataset.calDay === activeDate;
          p.classList.toggle('is-selected', on);
          p.setAttribute('aria-pressed', String(on));
        });

        pane.querySelectorAll('.cal-section').forEach((sec) => {
          sec.classList.toggle('is-selected', sec.dataset.calDate === activeDate);
        });

        const targetWeek = weekOfSelected();
        if (targetWeek !== -1 && targetWeek !== currentWeek()) {
          showWeek(targetWeek, true);
        }
      }
    });
  }

  function scrollPaneToSelected(smooth) {
    const pane = panes.children[paneIndex];
    if (!pane) return;
    const targetDate = store.getState().selected;
    let el = pane.querySelector(`[data-cal-date="${targetDate}"]`);
    if (!el) {
      const sections = [...pane.querySelectorAll('.cal-section[data-cal-date]')];
      if (sections.length) {
        el = sections.find((s) => s.dataset.calDate >= targetDate) || sections[sections.length - 1];
        if (el) {
          const nextDate = el.dataset.calDate;
          store.getState().selected = nextDate;
          lastSelected = nextDate;
          weekVp.querySelectorAll('.cal-pill').forEach((p) => {
            const on = p.dataset.calDay === nextDate;
            p.classList.toggle('is-selected', on);
            p.setAttribute('aria-pressed', String(on));
          });
          pane.querySelectorAll('.cal-section').forEach((sec) => {
            sec.classList.toggle('is-selected', sec === el);
          });
          const targetWeek = weekOfSelected();
          if (targetWeek !== -1 && targetWeek !== currentWeek()) {
            showWeek(targetWeek, true);
          }
        }
      }
    }
    if (el) {
      if (smooth) {
        isScrollingProgrammatically = true;
        clearTimeout(programmaticScrollTimer);
        programmaticScrollTimer = setTimeout(() => { isScrollingProgrammatically = false; }, 700);
      }
      pane.scrollTo({ top: el.offsetTop - pane.offsetTop, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  function goToPane(i, smooth = true) {
    paneIndex = i;
    programmatic = true;
    glideX(panes, i * panes.clientWidth, smooth, () => { programmatic = false; });
  }

  function renderCategoryTabs() {
    const s = store.getState();
    renderTabs($('#cal-tabs'), { tabs: categoryTabs(store.monthSummary().counts), active: s.category, variant: 'mobile', attr: 'data-cal-cat' });
  }

  function render() {
    if (!isActive()) return;
    const s = store.getState();
    const sum = store.monthSummary();
    $('#cal-month-short').textContent = store.MONTH_NAMES[s.month].slice(0, 3);
    paneIndex = store.CATEGORIES.findIndex((c) => c.key === s.category);
    renderWeeks();
    observeWeeks();
    showWeek(Math.max(0, weekOfSelected()), false);
    renderCategoryTabs();
    renderPanes();
    goToPane(paneIndex, false);
  }

  // Selection changes re-render only what moved: the strip highlight, the section highlight and the scroll.
  let lastSelected = null;
  let lastMonth = null;
  store.subscribe(() => {
    if (!isActive()) return;
    const s = store.getState();
    const monthKey = `${s.year}-${s.month}-${s.status}-${s.events.length}-${store.query()}`;
    if (monthKey !== lastMonth) { lastMonth = monthKey; lastSelected = s.selected; render(); scrollPaneToSelected(false); return; }
    if (s.selected !== lastSelected) {
      lastSelected = s.selected;
      weekVp.querySelectorAll('.cal-pill').forEach((p) => { const on = p.dataset.calDay === s.selected; p.classList.toggle('is-selected', on); p.setAttribute('aria-pressed', String(on)); });
      renderPanes();
      showWeek(Math.max(0, weekOfSelected()), true);
      scrollPaneToSelected(true);
    }
    renderCategoryTabs();
    const idx = store.CATEGORIES.findIndex((c) => c.key === s.category);
    if (idx !== paneIndex) goToPane(idx, true); // a tab was tapped: slide to its pane
  });

  function openMonthPicker() {
    const s = store.getState();
    let year = s.year;
    const dlg = openSheet({
      label: 'Select month',
      cls: 'cal-month-sheet',
      html: `<header class="asg-header"><h3>Select Month</h3><button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
        <div class="cal-month-body">
          <div class="cal-year-row">
            <button type="button" class="cal-arrow" data-year="-1" aria-label="Previous year">${icon('chevronRight', { size: 15, stroke: 2.5, cls: 'cal-flip' })}</button>
            <strong id="cal-pick-year"></strong>
            <button type="button" class="cal-arrow" data-year="1" aria-label="Next year">${icon('chevronRight', { size: 15, stroke: 2.5 })}</button>
          </div>
          <div class="cal-month-grid" id="cal-month-grid"></div>
        </div>`,
    });
    const draw = () => {
      dlg.$('#cal-pick-year').textContent = year;
      dlg.$('#cal-month-grid').innerHTML = store.MONTH_NAMES.map((m, i) => `<button type="button" class="cal-month-opt ${i === s.month && year === s.year ? 'is-selected' : ''}" data-month="${i}">${esc(m.slice(0, 3))}</button>`).join('');
    };
    draw();
    dlg.ov.addEventListener('click', (e) => {
      const y = e.target.closest('[data-year]');
      if (y) { year += Number(y.dataset.year); draw(); return; }
      const m = e.target.closest('[data-month]');
      if (m) { dlg.close(); store.setMonth(year, Number(m.dataset.month), { selectDay: 1 }); }
    });
  }

  host.addEventListener('click', (e) => {
    const day = e.target.closest('[data-cal-day]');
    if (day) {
      isScrollingProgrammatically = true;
      clearTimeout(programmaticScrollTimer);
      programmaticScrollTimer = setTimeout(() => { isScrollingProgrammatically = false; }, 700);
      store.select(day.dataset.calDay);
      return;
    }
    const week = e.target.closest('[data-cal-week]');
    if (week) {
      const n = currentWeek() + Number(week.dataset.calWeek);
      const total = weekVp.children.length;
      if (n < 0) store.shiftMonth(-1); else if (n >= total) store.shiftMonth(1); else showWeek(n, true);
      return;
    }
    if (e.target.closest('#cal-month-btn')) { openMonthPicker(); return; }
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
    if (card) { const b = findBooking(card.dataset.bookingIdRef); if (b) onOpen(b); return; }
    if (e.target.closest('#btn-retry-calendar')) store.load({ force: true });
  });

  // Which week and which category pane is in view is read from IntersectionObserver, not from scroll events, so
  // swiping does no work on the main thread until a page is actually mostly visible.
  const weekSeen = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) $('#cal-week-label').textContent = weekLabel(Number(en.target.dataset.week)); });
  }, { root: weekVp, threshold: 0.6 });
  const observeWeeks = () => { weekSeen.disconnect(); weekVp.querySelectorAll('.cal-week-slide').forEach((el) => weekSeen.observe(el)); };

  const paneSeen = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting || programmatic) return;
      const i = Number(en.target.dataset.calPane);
      if (i !== paneIndex && store.CATEGORIES[i]) { paneIndex = i; store.setCategory(store.CATEGORIES[i].key); }
    });
  }, { root: panes, threshold: 0.6 });
  panes.querySelectorAll('.cal-pane').forEach((el) => {
    paneSeen.observe(el);
    el.addEventListener('scroll', onPaneScroll, { passive: true });
  });

  return {
    activate() { lastMonth = null; lastSelected = null; render(); store.load().then(() => requestAnimationFrame(() => scrollPaneToSelected(false))); },
    render,
  };
}

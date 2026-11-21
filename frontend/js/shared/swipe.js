// Horizontal swipes inside a phone sheet: the one place that decides what counts as a swipe.
//   bindSwipe(el, { onNext, onPrev })  swipe left = next, swipe right = previous
// A swipe is a clearly horizontal move (more than 60px, and more than 1.5x the vertical move). It is ignored when it starts on a field, a button,
// a dropdown, a chip row or any other sideways-scrolling element, so those keep their own behaviour.
const IGNORE = 'input, textarea, select, button, a, [contenteditable], [role="slider"], .scroll-row, .tabs-scroller, .category-filter-tabs, .sheet-tabs-nav, .item-dropdown-menu, .row-floating-menu, .dd-menu';

function scrollsSideways(from, root) {
  for (let n = from; n && n !== root; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 2 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true;
  }
  return false;
}

export function bindSwipe(el, { onNext, onPrev, enabled = () => true, preventClick = false } = {}) {
  if (!el || el.dataset.swipeBound) return;
  el.dataset.swipeBound = '1';
  let start = null;
  el.addEventListener('touchstart', (e) => {
    start = null;
    if (e.touches.length !== 1 || !enabled()) return;
    const t = e.target;
    if (t.closest?.(IGNORE) || scrollsSideways(t, el)) return;
    start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  if (preventClick) el.addEventListener('touchmove', (e) => {
    if (!start || e.touches.length !== 1) { start = null; return; }
    const dx = e.touches[0].clientX - start.x;
    const dy = e.touches[0].clientY - start.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > 1.5 * Math.abs(dy) && e.cancelable) e.preventDefault();
  }, { passive: false });
  el.addEventListener('touchend', (e) => {
    if (!start || !enabled() || !e.changedTouches.length) { start = null; return; }
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
      if (preventClick && e.cancelable) e.preventDefault();
      (dx < 0 ? onNext : onPrev)?.();
    }
  }, { passive: !preventClick });
  el.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}

/** A quick slide + fade for new content (transform and opacity only; nothing when the person asked for less motion). `dir` 1 = from the right. */
const slideAnimations = new WeakMap();
export function slideIn(el, dir = 1) {
  if (!el?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  slideAnimations.get(el)?.cancel();
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-base')) || 200;
  slideAnimations.set(el, el.animate([{ opacity: 0.75, transform: `translateX(${dir * 12}px)` }, { opacity: 1, transform: 'none' }], { duration: ms, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }));
}

/**
 * Phone lists with a pill chip row: swiping the LIST sideways moves to the next / previous chip (the chip is tapped for you, so the page's own
 * filter runs: no second code path). Stops at the first and last chip. The chip row itself, fields, buttons and sideways-scrolling parts are ignored by bindSwipe.
 */
export function bindChipSwipe(listEl, rowHost, { enabled = () => true } = {}) {
  const phone = () => document.documentElement.dataset.layout === 'mobile';
  const blocked = () => document.body.classList.contains('sp-detail-open') || !!document.querySelector('.asg-overlay, .fu-overlay, .sheet-overlay, .modal-overlay.open, .row-floating-menu, #mobile-bottom-sheet.open, #mobile-team-sheet.open, .notifications-panel:not([hidden])');
  const step = (dir) => {
    const pills = [...rowHost.querySelectorAll('.tab-pill')];
    const to = pills[pills.findIndex((p) => p.classList.contains('active')) + dir];
    if (!to || pills.findIndex((p) => p.classList.contains('active')) === -1) return;
    to.click();
    slideIn(listEl, dir);
  };
  bindSwipe(listEl, { enabled: () => phone() && !blocked() && enabled(), preventClick: true, onNext: () => step(1), onPrev: () => step(-1) });
}

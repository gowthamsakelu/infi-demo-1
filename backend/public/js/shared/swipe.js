// Horizontal swipes inside a phone sheet: the one place that decides what counts as a swipe.
//   bindSwipe(el, { onNext, onPrev })  swipe left = next, swipe right = previous
// A swipe is a clearly horizontal move (more than 60px, and more than 1.5x the vertical move). It is ignored when it starts on a field, a button,
// a dropdown, a chip row or any other sideways-scrolling element, so those keep their own behaviour. Passive listeners, bound once per element.
const IGNORE = 'input, textarea, select, button, a, [contenteditable], [role="slider"], .scroll-row, .tabs-scroller, .category-filter-tabs, .sheet-tabs-nav, .item-dropdown-menu, .row-floating-menu, .dd-menu';

function scrollsSideways(from, root) {
  for (let n = from; n && n !== root; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 2 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true;
  }
  return false;
}

export function bindSwipe(el, { onNext, onPrev, enabled = () => true } = {}) {
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
  el.addEventListener('touchend', (e) => {
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) (dx < 0 ? onNext : onPrev)?.();
  }, { passive: true });
  el.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}

/** A quick slide + fade for new content (transform and opacity only; nothing when the person asked for less motion). `dir` 1 = from the right. */
export function slideIn(el, dir = 1) {
  if (!el?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-base')) || 200;
  el.animate([{ opacity: 0.35, transform: `translateX(${dir * 18}px)` }, { opacity: 1, transform: 'none' }], { duration: ms, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
}

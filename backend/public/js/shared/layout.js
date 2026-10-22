// The one place that decides which layout is active. Two layouts only: "mobile" and "desktop".
// CSS keys off <html data-layout="…">; JS listens for the 'layout-changed' event.

/** Below this width (CSS px) the mobile layout is used. */
export const MOBILE_MAX_WIDTH = 699;
/** A touch phone turned sideways is wider than the breakpoint but still a phone: its short screen side is below this. */
const PHONE_SHORT_SIDE = 500;

const narrow = matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
const touch = matchMedia('(pointer: coarse)');

// screen.* does not change when the on-screen keyboard opens, so typing on a tablet never flips the layout.
const shortSide = () => Math.min(screen.width, screen.height);

export const layoutKind = () => (narrow.matches || (touch.matches && shortSide() < PHONE_SHORT_SIDE) ? 'mobile' : 'desktop');

export function applyLayout() {
  const next = layoutKind();
  if (document.documentElement.dataset.layout === next) return false;
  document.documentElement.dataset.layout = next;
  return true;
}

/** Set the layout now and keep it in step with resize, rotate, fold and unfold. `onChange` runs only when it flips. */
export function initLayout(onChange) {
  applyLayout();
  const check = () => { if (applyLayout()) onChange?.(layoutKind()); };
  narrow.addEventListener('change', check);
  touch.addEventListener('change', check);
  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', () => setTimeout(check, 200));
}

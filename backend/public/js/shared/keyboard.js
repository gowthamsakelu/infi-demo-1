// One keyboard-aware layer for the whole app.
// - Publishes the visible height (--vvh) and the keyboard height (--kb-inset) as CSS variables.
// - Toggles html.is-keyboard-open while a field is focused and the visible viewport is clearly smaller than the layout viewport.
// - Keeps the focused field visible above the keyboard.
// Overlays and sheets size themselves from these variables in CSS, so nothing needs per-component keyboard code.

const FIELD = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select, [contenteditable=""], [contenteditable="true"]';
const root = document.documentElement;
let timer = null;

function measure() {
  const vv = window.visualViewport;
  const layoutH = root.clientHeight; // layout viewport (shrinks itself when the browser resizes content)
  const visibleH = vv ? vv.height : window.innerHeight;
  const inset = vv ? Math.max(0, Math.round(layoutH - visibleH - vv.offsetTop)) : 0;
  root.style.setProperty('--vvh', `${Math.round(visibleH)}px`);
  root.style.setProperty('--kb-inset', `${inset}px`);

  const focused = document.activeElement && document.activeElement.matches?.(FIELD);
  // Browsers that resize the layout viewport report inset 0, so also compare with the largest height seen.
  const shrunk = visibleH < maxH - 120;
  root.classList.toggle('is-keyboard-open', !!focused && (inset > 80 || shrunk));
}

let maxH = window.innerHeight;
function track() {
  if (!document.querySelector(':focus') || !document.activeElement.matches?.(FIELD)) maxH = Math.max(maxH, window.visualViewport ? window.visualViewport.height : window.innerHeight);
  measure();
}

function reveal() {
  const el = document.activeElement;
  if (!el || !el.matches?.(FIELD)) return;
  clearTimeout(timer);
  // Wait for the viewport to settle after the keyboard animation, then centre the field once (no bouncing).
  timer = setTimeout(() => {
    if (document.activeElement === el) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
  }, 220);
}

export function initKeyboard() {
  const vv = window.visualViewport;
  vv?.addEventListener('resize', () => { track(); reveal(); });
  vv?.addEventListener('scroll', measure);
  window.addEventListener('resize', () => { track(); reveal(); });
  document.addEventListener('focusin', () => { measure(); reveal(); });
  document.addEventListener('focusout', () => setTimeout(measure, 50));
  // Only a real portrait/landscape flip resets the baseline; some browsers fire this event when the keyboard opens.
  // screen.orientation ignores the keyboard (a 375x334 visible area is still portrait); innerWidth/innerHeight do not.
  const isLandscape = () => (screen.orientation ? screen.orientation.type.startsWith('landscape') : screen.width > screen.height);
  let landscape = isLandscape();
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const now = isLandscape();
      if (now === landscape) return;
      landscape = now; maxH = window.innerHeight; measure();
    }, 300);
  });
  measure();
}

// One rule for every sheet or dialog that is opened from inside another one ("Assign to", "Add Follow-up", the Bookings edit forms ...):
// it is not a second popup. It takes exactly the place of the sheet it came from (same box, no second backdrop), enters from the right and
// leaves to the right, and its header is the standard one: back arrow at the left, the title, the round X at the right.
// Screens built with openScreen (shared/sheet.js) do the same from the inside; this module does it for overlays that are built elsewhere.
import { icon } from './icons.js';
import { closeScreens } from './sheet.js';

/** Everything that can be the sheet underneath: the phone's detail sheet, a sheet or dialog, the in-place builder, a pushed screen. */
const HOSTS = '.bottom-sheet.open, .sp-detail-screen.is-open, .asg-overlay.open > .asg-sheet, .bld-inplace, .push-screen.is-in, .modal-overlay.open > .modal-card, .desktop-details-drawer.open:not(.is-empty)';

/** On the phone these open as a centred mid-screen popup, not as a screen pushed into the sheet they came from (the itinerary event's Assign / View Details / Edit). */
const CENTERED = '.asg-overlay[data-centered], #mobile-activity-details-modal, #mobile-edit-activity-modal, #mobile-special-req-modal, #mobile-edit-customer-modal, #modal-add-guest';

/** The sheet or dialog that `ov` was opened from (null when it was opened from a page: then it is an ordinary sheet). */
export function hostOf(ov) {
  const hosts = [...document.querySelectorAll(HOSTS)].filter((h) => !ov.contains(h) && h.getClientRects().length);
  return hosts[hosts.length - 1] || null;
}

const backButton = () => `<button type="button" class="dialog-back" data-push-back aria-label="Back">${icon('arrowLeft', { size: 20, stroke: 2.2 })}</button>`;

/**
 * Put `ov` (an overlay with one card inside) in the place of the sheet it was opened from, as a screen pushed on top of it.
 * Does nothing when there is no such sheet. Returns true when it did.
 */
export function placeAsPushed(ov) {
  if (document.documentElement.dataset.layout === 'mobile' && ov.matches(CENTERED)) return false;
  if (ov.matches('#modal-add-user')) return false; // Add User: a centred dialog on a PC, a bottom sheet on a phone (never a screen pushed into the user panel)
  const host = hostOf(ov);
  const card = ov.firstElementChild;
  if (!host || !card) return false;
  const r = host.getBoundingClientRect();
  ov.classList.add('is-pushed');
  // (!important: the phone's static modals are pinned with inset: 0 !important)
  Object.entries({ left: r.left, top: r.top, width: r.width, height: r.height }).forEach(([k, v]) => ov.style.setProperty(k, `${v}px`, 'important'));
  ['right', 'bottom'].forEach((k) => ov.style.setProperty(k, 'auto', 'important'));
  ov.style.setProperty('--push-radius', getComputedStyle(host).borderRadius);
  // the header: back arrow first, then the title; the round X stays where the card has it, on the right
  const head = card.querySelector(':scope > header, :scope > .asg-header, :scope > .modal-header, :scope > .fu-header, :scope > .sheet-header');
  if (head && !head.querySelector('.dialog-back')) head.insertAdjacentHTML('afterbegin', backButton());
  if (!ov.dataset.pushBound) {
    ov.dataset.pushBound = '1';
    ov.addEventListener('click', (e) => {
      // Back: the screen's own way of closing it (its X / Cancel handler), so it returns with whatever it already does on close
      if (e.target.closest('[data-push-back]')) {
        ov.dataset.backing = '1';
        ov.querySelector('[data-asg-close], .sheet-close-btn:not(.dialog-back)')?.click();
        delete ov.dataset.backing;
        return;
      }
      // The round X: the screen's own close runs first, then the whole flow goes
      if (!flowClosing && !ov.dataset.backing && e.target.closest('.sheet-close-btn:not(.dialog-back)')) closeFlow();
    });
  }
  return true;
}

/** Undo placeAsPushed (a static overlay that is reused: Bookings' edit forms). */
export function releasePushed(ov) {
  if (!ov.classList.contains('is-pushed')) return;
  ov.classList.remove('is-pushed');
  ['left', 'top', 'width', 'height', 'right', 'bottom'].forEach((p) => ov.style.removeProperty(p));
  ov.style.removeProperty('--push-radius');
}

/** Static modals in the page (Bookings' edit forms): pushed whenever one is opened from inside a sheet. */
export function watchStaticOverlays() {
  const seen = new WeakMap();
  new MutationObserver((list) => {
    list.forEach((m) => {
      const ov = m.target;
      if (!(ov instanceof HTMLElement) || !ov.classList.contains('modal-overlay') || ov.classList.contains('item-dialog-overlay') || ov.classList.contains('confirm-overlay')) return;
      const open = ov.classList.contains('open');
      if (open && !seen.get(ov)) { seen.set(ov, true); placeAsPushed(ov); } else if (!open && seen.get(ov)) { seen.set(ov, false); releasePushed(ov); }
    });
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
}

/**
 * The round X on a pushed screen closes the whole flow, not just the screen: every pushed screen goes (without asking), then the root sheet closes
 * the way its own X closes it. The back arrow only goes back one screen.
 */
let flowClosing = false;
export function closeFlow() {
  if (flowClosing) return;
  flowClosing = true;
  [...document.querySelectorAll('.is-pushed')].reverse().forEach((ov) => ov.querySelector('[data-asg-close], .sheet-close-btn:not(.dialog-back)')?.click());
  closeScreens();
  // the root sheet ignores its X while an Assign sheet is still leaving: wait for it to be gone (at most about 1 second)
  const closeRoot = (tries = 0) => {
    if (tries < 16 && document.querySelector('.asg-overlay:not(.sheet-overlay)')) { setTimeout(() => closeRoot(tries + 1), 60); return; }
    flowClosing = false;
    const roots = [...document.querySelectorAll('.bottom-sheet.open, .sp-detail-screen.is-open, .asg-overlay.open > .asg-sheet, .modal-overlay.open > .modal-card')].filter((h) => !h.closest('.is-pushed'));
    const root = roots[roots.length - 1];
    const x = root && (root.querySelector('#mobile-sheet-close-btn, .mobile-sheet-close-pill') || [...root.querySelectorAll('.sheet-close-btn')].find((b) => !b.closest('.push-screen, .is-pushed, .bld-inplace')));
    x?.click();
  };
  setTimeout(closeRoot, 100);
}

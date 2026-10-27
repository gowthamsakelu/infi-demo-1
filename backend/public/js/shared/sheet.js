// Generic sheet/dialog built on the shared overlay (same motion, scroll lock, keyboard handling as Assign and Follow-up).
// Phones: bottom sheet. Larger screens: centered dialog. Nothing is focused on open.
// Sheets stack: only the top one reacts to Esc, outside clicks and swipes, and Tab stays inside it.
import { esc, dismissOnOutside, bindSheet, afterPaint, afterTransition, lockScroll } from './ui.js';
import { icon } from './icons.js';

const stack = [];

// Small dialogs push one history entry so the browser Back button acts as the dialog's Back arrow.
// `swallow` counts popstate events we caused ourselves (closing by button) so the page never reacts to them.
let swallow = 0;
/** Call just before history.back() to close a layer of your own: the page must not react to that popstate. */
export const swallowNextPop = () => { swallow += 1; };
/** Is a sheet or dialog open that handles Esc and Back itself? */
export const hasOpenLayer = () => stack.length > 0 || !!document.querySelector('.asg-overlay.open');
window.addEventListener('popstate', (e) => {
  if (swallow > 0) { swallow -= 1; e.stopImmediatePropagation(); return; }
  const owner = [...stack].reverse().find((s) => s.hasHistory);
  if (!owner) return;
  e.stopImmediatePropagation();
  const top = stack[stack.length - 1];
  if (top === owner) { owner.fromHistory(); return; }
  // A confirm sits on top of the dialog: Back means "keep editing". The dialog's history entry is put back.
  top.close();
  history.pushState({ ruyiDialog: true }, '');
}, true);
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {{ html: string, cls?: string, label?: string, beforeClose?: () => boolean | Promise<boolean>, returnFocus?: () => Element | null }} cfg
 *   html = header / body / footer markup of the sheet. `beforeClose` runs when the user dismisses the sheet
 *   (Esc, backdrop, swipe, a [data-sheet-close] button); return false to keep it open. close() never asks.
 * @returns {{ ov: HTMLElement, sheet: HTMLElement, $: (s: string) => HTMLElement, close: () => void }}
 */
export function openSheet({ html, cls = '', label = 'Dialog', beforeClose = null, returnFocus = null, modal = false, onClose = null, overlayCls = '', cardCls = 'item-dialog', history: useHistory = modal }) {
  const trigger = document.activeElement;
  const ov = document.createElement('div');
  // `modal` = the small centred dialog (same card as "Add New Guest") that sits on top of a sheet; otherwise a sheet.
  ov.className = modal ? `modal-overlay item-dialog-overlay sheet-overlay ${overlayCls}` : 'asg-overlay sheet-overlay';
  ov.innerHTML = modal
    ? `<div class="modal-card ${cardCls} ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${html}</div>`
    : `<div class="asg-sheet ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><div class="filter-handle" aria-hidden="true"></div>${html}</div>`;
  document.body.appendChild(ov);
  const sheet = ov.querySelector(modal ? '.modal-card' : '.asg-sheet');
  const unlock = lockScroll();
  afterPaint(() => ov.classList.add('open'));
  // Focus goes to the dialog (or its title), never to a field, so no keyboard pops up on a phone.
  (ov.querySelector('[data-initial-focus]') || ov.querySelector('[data-dialog-title]') || sheet).focus({ preventScroll: true });

  // What opened the sheet; if the page re-rendered it meanwhile, ask the caller where focus belongs.
  const focusBack = () => (trigger?.isConnected ? trigger : returnFocus?.())?.focus?.({ preventScroll: true });

  const api = { ov, sheet, $: (s) => ov.querySelector(s), close, isModal: modal, hasHistory: useHistory, fromHistory };
  stack.push(api);
  let historyOpen = false;
  if (useHistory) { history.pushState({ ruyiDialog: true }, ''); historyOpen = true; }
  const isTop = () => stack[stack.length - 1] === api;

  let closed = false;
  let asking = false;
  async function request() {
    if (closed || asking || !isTop()) return;
    if (document.querySelector('.asg-overlay:not(.sheet-overlay)')) return; // the Assign sheet opened from here handles Esc and taps itself
    if (beforeClose) {
      asking = true;
      const ok = await beforeClose();
      asking = false;
      if (!ok) return;
    }
    close();
  }

  // The browser Back button already took our history entry away; ask like any other dismissal, and put it back if refused.
  async function fromHistory() {
    historyOpen = false;
    await request();
    if (!closed) { history.pushState({ ruyiDialog: true }, ''); historyOpen = true; }
  }

  // A press inside another layer (the Assign sheet, a confirm that is closing) is not a press outside this one.
  const stopOutside = dismissOnOutside(sheet, request, [{ contains: (t) => { const layer = t.closest?.('.sheet-overlay, .asg-overlay'); return !!layer && layer !== ov; } }]);
  const stopSheet = modal ? () => {} : bindSheet(ov, sheet, request);
  ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-sheet-close]')) request(); });
  ov.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isTop()) return;
    const items = [...sheet.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function close() {
    if (closed) return;
    closed = true;
    onClose?.();
    if (historyOpen && history.state?.ruyiDialog) { swallow += 1; history.back(); }
    historyOpen = false;
    stack.splice(stack.indexOf(api), 1);
    stopOutside();
    stopSheet();
    ov.classList.remove('open');
    ov.classList.add('closing');
    afterTransition(sheet, 380).then(() => {
      ov.remove();
      unlock();
      // Removing the sheet can drop focus to the page; put it back on what opened the sheet.
      if (!document.activeElement || document.activeElement === document.body) focusBack();
    });
    focusBack();
  }
  return api;
}

/**
 * The one confirm dialog (Discard this entry?, Remove days?, ...): the compact "Add New Guest" card, no close button, two buttons of
 * equal size. "Keep editing" (cancel) has focus; Esc, the backdrop and the browser Back button all mean cancel.
 * Only one can be open: asking again while it is open returns the same answer. Resolves true when confirmed.
 */
let pendingConfirm = null;
export function confirmDialog({ title, text = '', confirm = 'Confirm', cancel = 'Cancel', danger = false }) {
  if (pendingConfirm) return pendingConfirm;
  pendingConfirm = new Promise((resolve) => {
    let answer = false;
    const dlg = openSheet({
      modal: true,
      history: false,
      label: title,
      cls: 'confirm-card',
      cardCls: '',
      overlayCls: 'confirm-overlay',
      onClose: () => { pendingConfirm = null; resolve(answer); },
      html: `<header class="modal-header item-dialog-head confirm-head"><h3 data-dialog-title tabindex="-1">${esc(title)}</h3></header>
        <div class="modal-body confirm-body"><p>${esc(text)}</p></div>
        <footer class="modal-footer confirm-foot">
          <button type="button" class="btn-secondary-desktop" data-confirm="no" data-initial-focus>${esc(cancel)}</button>
          <button type="button" class="btn-primary-desktop ${danger ? 'btn-danger' : ''}" data-confirm="yes">${esc(confirm)}</button>
        </footer>`,
    });
    dlg.ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-confirm]');
      if (!b) return;
      answer = b.dataset.confirm === 'yes';
      dlg.close(); // closing twice (a double click) does nothing the second time
    });
  });
  return pendingConfirm;
}

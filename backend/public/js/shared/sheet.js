// Generic sheet/dialog built on the shared overlay (same motion, scroll lock, keyboard handling as Assign and Follow-up).
// Phones: bottom sheet. Larger screens: centered dialog. Nothing is focused on open.
// Sheets stack: only the top one reacts to Esc, outside clicks and swipes, and Tab stays inside it.
import { esc, dismissOnOutside, bindSheet, backdropDismiss, afterPaint, afterTransition, lockScroll } from './ui.js';
import { icon } from './icons.js';
import { placeAsPushed, closeFlow } from './push.js';

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
  if (!modal) placeAsPushed(ov);
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
  const stopBackdrop = modal ? () => {} : backdropDismiss(ov, request);
  ov.addEventListener('click', (e) => { if (e.target.closest('[data-sheet-close]')) request(); });
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
 * The one "push screen": an add / edit form that opens INSIDE the sheet or dialog that is already open, never as a second popup on top of it.
 * It is the same mechanism the in-place builder uses ("Add Event"): a layer over the host that enters from the right, with a back arrow and the
 * title in its header and a footer with the primary action and Cancel. Back, Cancel, Esc and the browser Back button slide it out to the right;
 * the screen underneath is left untouched (state and scroll position included).
 * Where there is no host sheet (a page-level call), it falls back to the one centred dialog, so callers never need to know.
 * @param {{ title: string, label?: string, cls?: string, headCls?: string, bodyCls?: string, bodyAttrs?: string, footCls?: string, body?: string, footer?: string,
 *           beforeClose?: () => boolean | Promise<boolean>, onClose?: () => void, returnFocus?: () => Element | null }} cfg
 *   Buttons carrying [data-sheet-close] (the back arrow, Cancel) ask to leave; `beforeClose` may refuse (false).
 * @returns the same shape as openSheet: { ov, sheet, $, close }
 */
export function openScreen({ title, label = title, cls = '', headCls = 'item-dialog-head', bodyCls = 'item-dialog-body', bodyAttrs = '', footCls = 'item-dialog-foot', body = '', footer = '', beforeClose = null, onClose = null, returnFocus = null }) {
  const trigger = document.activeElement;
  const hosts = [...document.querySelectorAll('.bld-inplace, .asg-overlay.open .asg-sheet')].filter((h) => !h.classList.contains('closing'));
  const host = trigger?.closest?.('.bld-inplace, .asg-sheet') || hosts[hosts.length - 1] || null;
  if (!host) {
    return openSheet({
      modal: true, label, cls: `item-dialog-card ${cls}`, returnFocus, onClose, beforeClose,
      html: `<header class="modal-header ${headCls}"><h3 data-dialog-title tabindex="-1">${esc(title)}</h3><button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
        <div class="modal-body ${bodyCls}" ${bodyAttrs}>${body}</div><footer class="modal-footer ${footCls}">${footer}</footer>`,
    });
  }

  const layer = document.createElement('section');
  layer.className = `push-screen item-dialog item-dialog-card ${cls}`;
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-label', label);
  layer.tabIndex = -1;
  layer.innerHTML = `<header class="modal-header ${headCls}"><button type="button" class="dialog-back" data-sheet-close aria-label="Back">${icon('arrowLeft', { size: 20, stroke: 2.2 })}</button><h3 data-dialog-title tabindex="-1">${esc(title)}</h3><button type="button" class="sheet-close-btn push-x" data-flow-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
    <div class="modal-body ${bodyCls}" role="group" aria-label="${esc(title)}" ${bodyAttrs}>${body}</div>
    <footer class="modal-footer ${footCls}">${footer}</footer>`;
  const underneath = [...host.children];
  underneath.forEach((el) => el.setAttribute('inert', ''));
  host.appendChild(layer);
  host.classList.add('has-push-screen');
  afterPaint(() => layer.classList.add('is-in'));
  layer.querySelector('[data-dialog-title]').focus({ preventScroll: true }); // the title, never a field: no keyboard on a phone

  const api = { ov: layer, sheet: layer, $: (s) => layer.querySelector(s), close, isModal: true, isScreen: true, hasHistory: true, fromHistory };
  stack.push(api);
  history.pushState({ ruyiDialog: true }, '');
  let historyOpen = true;
  let closed = false;
  let asking = false;
  const isTop = () => stack[stack.length - 1] === api;

  async function request() {
    if (closed || asking || !isTop()) return;
    if (beforeClose) {
      asking = true;
      const ok = await beforeClose();
      asking = false;
      if (!ok) return;
    }
    close();
  }
  async function fromHistory() {
    historyOpen = false;
    await request();
    if (!closed) { history.pushState({ ruyiDialog: true }, ''); historyOpen = true; }
  }
  const onKey = (e) => { if (e.key === 'Escape' && isTop()) { e.preventDefault(); e.stopPropagation(); request(); } };
  document.addEventListener('keydown', onKey, true);
  layer.addEventListener('click', (e) => {
    if (e.target.closest('[data-flow-close]')) { closeFlow(); return; } // the round X: the whole flow, not only this screen
    if (e.target.closest('[data-sheet-close]')) request();
  });
  layer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isTop()) return;
    const items = [...layer.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length);
    if (!items.length) { e.preventDefault(); return; }
    if (e.shiftKey && (document.activeElement === items[0] || document.activeElement === layer)) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); items[0].focus(); }
  });

  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    onClose?.();
    if (historyOpen && history.state?.ruyiDialog) { swallow += 1; history.back(); }
    historyOpen = false;
    stack.splice(stack.indexOf(api), 1);
    // The screen underneath is usable at once; the layer only finishes sliding out (it takes no touches meanwhile).
    layer.style.pointerEvents = 'none';
    underneath.forEach((el) => el.removeAttribute('inert'));
    layer.classList.remove('is-in');
    afterTransition(layer, 380).then(() => {
      layer.remove();
      if (!host.querySelector(':scope > .push-screen')) host.classList.remove('has-push-screen');
    });
    (trigger?.isConnected ? trigger : returnFocus?.())?.focus?.({ preventScroll: true });
  }
  return api;
}

/** Close every pushed screen at once, without asking (the round X of a pushed screen closes the whole flow). */
export function closeScreens() {
  [...stack].reverse().filter((s) => s.isScreen).forEach((s) => s.close());
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

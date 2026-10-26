// Generic sheet/dialog built on the shared overlay (same motion, scroll lock, keyboard handling as Assign and Follow-up).
// Phones: bottom sheet. Larger screens: centered dialog. Nothing is focused on open.
// Sheets stack: only the top one reacts to Esc, outside clicks and swipes, and Tab stays inside it.
import { esc, dismissOnOutside, bindSheet, afterPaint, afterTransition, lockScroll } from './ui.js';
import { icon } from './icons.js';

const stack = [];

// Small dialogs push one history entry so the browser Back button acts as the dialog's Back arrow.
// `swallow` counts popstate events we caused ourselves (closing by button) so the page never reacts to them.
let swallow = 0;
window.addEventListener('popstate', (e) => {
  if (swallow > 0) { swallow -= 1; e.stopImmediatePropagation(); return; }
  const top = stack[stack.length - 1];
  if (top?.isModal) { e.stopImmediatePropagation(); top.fromHistory(); }
}, true);
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {{ html: string, cls?: string, label?: string, beforeClose?: () => boolean | Promise<boolean>, returnFocus?: () => Element | null }} cfg
 *   html = header / body / footer markup of the sheet. `beforeClose` runs when the user dismisses the sheet
 *   (Esc, backdrop, swipe, a [data-sheet-close] button); return false to keep it open. close() never asks.
 * @returns {{ ov: HTMLElement, sheet: HTMLElement, $: (s: string) => HTMLElement, close: () => void }}
 */
export function openSheet({ html, cls = '', label = 'Dialog', beforeClose = null, returnFocus = null, modal = false, onClose = null }) {
  const trigger = document.activeElement;
  const ov = document.createElement('div');
  // `modal` = the small centred dialog (same card as "Add New Guest") that sits on top of a sheet; otherwise a sheet.
  ov.className = modal ? 'modal-overlay item-dialog-overlay sheet-overlay' : 'asg-overlay sheet-overlay';
  ov.innerHTML = modal
    ? `<div class="modal-card item-dialog ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${html}</div>`
    : `<div class="asg-sheet ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><div class="filter-handle" aria-hidden="true"></div>${html}</div>`;
  document.body.appendChild(ov);
  const sheet = ov.querySelector(modal ? '.modal-card' : '.asg-sheet');
  const unlock = lockScroll();
  afterPaint(() => ov.classList.add('open'));
  // Focus goes to the dialog (or its title), never to a field, so no keyboard pops up on a phone.
  (ov.querySelector('[data-dialog-title]') || sheet).focus({ preventScroll: true });

  // What opened the sheet; if the page re-rendered it meanwhile, ask the caller where focus belongs.
  const focusBack = () => (trigger?.isConnected ? trigger : returnFocus?.())?.focus?.({ preventScroll: true });

  const api = { ov, sheet, $: (s) => ov.querySelector(s), close, isModal: modal, fromHistory };
  stack.push(api);
  let historyOpen = false;
  if (modal) { history.pushState({ ruyiDialog: true }, ''); historyOpen = true; }
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

  const stopOutside = dismissOnOutside(sheet, request, [{ contains: (t) => !!t.closest?.('.asg-overlay:not(.sheet-overlay)') }]);
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
      if (!stack.length && (!document.activeElement || document.activeElement === document.body)) focusBack();
    });
    focusBack();
  }
  return api;
}

/** A small confirm dialog in the same sheet style. Resolves true when the action is confirmed. */
export function confirmDialog({ title, text = '', confirm = 'Confirm', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    let answer = false;
    const dlg = openSheet({
      label: title,
      cls: 'confirm-sheet',
      html: `<header class="asg-header"><h3>${esc(title)}</h3><button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
        <div class="confirm-body"><p>${esc(text)}</p></div>
        <footer class="fu-footer itin-footer">
          <button type="button" class="btn-cancel-assign" data-confirm="no">${esc(cancel)}</button>
          <button type="button" class="btn-primary-desktop ${danger ? 'btn-danger' : ''}" data-confirm="yes">${esc(confirm)}</button>
        </footer>`,
    });
    dlg.ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-confirm]');
      if (!b) return;
      answer = b.dataset.confirm === 'yes';
      dlg.close();
    });
    const watch = setInterval(() => { if (!dlg.ov.isConnected) { clearInterval(watch); resolve(answer); } }, 60);
  });
}

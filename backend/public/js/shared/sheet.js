// Generic sheet/dialog built on the shared overlay (same motion, scroll lock, keyboard handling as Assign and Follow-up).
// Phones: bottom sheet. Larger screens: centered dialog. Nothing is focused on open.
// Sheets stack: only the top one reacts to Esc, outside clicks and swipes, and Tab stays inside it.
import { esc, dismissOnOutside, bindSheet, afterPaint, afterTransition, lockScroll } from './ui.js';
import { icon } from './icons.js';

const stack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {{ html: string, cls?: string, label?: string, beforeClose?: () => boolean | Promise<boolean>, returnFocus?: () => Element | null }} cfg
 *   html = header / body / footer markup of the sheet. `beforeClose` runs when the user dismisses the sheet
 *   (Esc, backdrop, swipe, a [data-sheet-close] button); return false to keep it open. close() never asks.
 * @returns {{ ov: HTMLElement, sheet: HTMLElement, $: (s: string) => HTMLElement, close: () => void }}
 */
export function openSheet({ html, cls = '', label = 'Dialog', beforeClose = null, returnFocus = null }) {
  const trigger = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'asg-overlay sheet-overlay';
  ov.innerHTML = `<div class="asg-sheet ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><div class="filter-handle" aria-hidden="true"></div>${html}</div>`;
  document.body.appendChild(ov);
  const sheet = ov.querySelector('.asg-sheet');
  const unlock = lockScroll();
  afterPaint(() => ov.classList.add('open'));
  sheet.focus({ preventScroll: true }); // the dialog itself, never a field

  // What opened the sheet; if the page re-rendered it meanwhile, ask the caller where focus belongs.
  const focusBack = () => (trigger?.isConnected ? trigger : returnFocus?.())?.focus?.({ preventScroll: true });

  const api = { ov, sheet, $: (s) => ov.querySelector(s), close };
  stack.push(api);
  const isTop = () => stack[stack.length - 1] === api;

  let closed = false;
  let asking = false;
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

  const stopOutside = dismissOnOutside(sheet, request);
  const stopSheet = bindSheet(ov, sheet, request);
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

// Generic sheet/dialog built on the shared overlay (same motion, scroll lock, keyboard handling as Assign and Follow-up).
// Phones: bottom sheet. Larger screens: centered dialog. Nothing is focused on open.
import { dismissOnOutside, bindSheet, afterPaint, afterTransition, lockScroll } from './ui.js';

/**
 * @param {{ html: string, cls?: string, label?: string }} cfg  html = header / body / footer markup of the sheet
 * @returns {{ ov: HTMLElement, sheet: HTMLElement, $: (s: string) => HTMLElement, close: () => void }}
 */
export function openSheet({ html, cls = '', label = 'Dialog' }) {
  const trigger = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'asg-overlay sheet-overlay';
  ov.innerHTML = `<div class="asg-sheet ${cls}" role="dialog" aria-modal="true" aria-label="${label}" tabindex="-1"><div class="filter-handle" aria-hidden="true"></div>${html}</div>`;
  document.body.appendChild(ov);
  const sheet = ov.querySelector('.asg-sheet');
  const unlock = lockScroll();
  afterPaint(() => ov.classList.add('open'));
  sheet.focus({ preventScroll: true }); // the dialog itself, never a field

  let closed = false;
  const stopOutside = dismissOnOutside(sheet, () => close());
  const stopSheet = bindSheet(ov, sheet, () => close());
  ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-sheet-close]')) close(); });

  function close() {
    if (closed) return;
    closed = true;
    stopOutside();
    stopSheet();
    ov.classList.remove('open');
    ov.classList.add('closing');
    afterTransition(sheet, 380).then(() => { ov.remove(); unlock(); });
    trigger?.focus?.({ preventScroll: true });
  }
  return { ov, sheet, $: (s) => ov.querySelector(s), close };
}

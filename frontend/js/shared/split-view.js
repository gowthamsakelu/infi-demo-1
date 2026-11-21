// The list + detail "reading pane" (Outlook style) shared by every page that has it (Bookings and Inquiries today).
// This module holds the rules; desktop.js and split-page.js only call it. Rules: on the PC / tablet layout the list is always shown with the detail
// pane beside it, and nothing is selected by itself: the pane says "Select ..." until a row is clicked (the URL's ?selected=ID is honoured on load).
// The arrow keys move through the list. Phones keep their own tap-to-open behaviour and never use any of this.
import { getParams, setParams } from './page-state.js';

/** The PC layout is the only one with a reading pane. */
export const paneLayout = () => document.documentElement.dataset.layout === 'desktop';

export const selectedParam = () => getParams().selected || null;

/** Keep the chosen record in the address bar. `push` adds a history entry (a click), otherwise it replaces (an automatic pick). */
export function writeSelected(id, { push = false } = {}) {
  if ((id || null) === selectedParam()) return;
  setParams({ selected: id }, { push, silent: true });
}

/** The record an arrow key moves to (Up / Down by one, Home / End to the ends), or null when the key does nothing. */
export function stepRecord(list, currentId, key) {
  if (!list.length) return null;
  const i = list.findIndex((b) => b.id === currentId);
  if (key === 'Home') return list[0];
  if (key === 'End') return list[list.length - 1];
  if (key === 'ArrowDown') return list[Math.min(i + 1, list.length - 1)];
  if (key === 'ArrowUp') return list[Math.max(i - 1, 0)];
  return null;
}

/**
 * Arrow-key navigation for the list. Only acts when the list itself has focus, never when focus is in a field or on a button,
 * so it cannot steal typing or move focus into an input.
 */
export function bindListKeys(listEl, { getList, getActiveId, onSelect }) {
  listEl.addEventListener('keydown', (e) => {
    if (e.target !== listEl || e.altKey || e.ctrlKey || e.metaKey) return;
    const next = stepRecord(getList(), getActiveId(), e.key);
    if (!next) return;
    e.preventDefault();
    if (next.id !== getActiveId()) onSelect(next);
  });
}

/** The record to show: the first of the preferred ids that is still in the list, else the first record. null when the list is empty. */
export function chooseRecord(list, ...preferredIds) {
  for (const id of preferredIds) {
    const hit = id && list.find((b) => b.id === id);
    if (hit) return hit;
  }
  return list[0] || null;
}

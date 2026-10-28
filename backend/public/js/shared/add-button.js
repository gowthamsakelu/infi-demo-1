// The one "Add" button: in the top bar on PC, a floating button above the bottom bar on the phone. Its label is always just "Add";
// the page says what it adds (aria-label "Add inquiry", tooltip on PC) and what it does. Every page uses setAddAction; none draws its own.
import { icon } from './icons.js';

let action = null;
let bound = false;

/** The button's markup (one in the PC top bar, one on the phone); it starts hidden until a page gives it an action. */
export function addButtonHtml(id, phone = false) {
  return `<button type="button" class="ui-add-btn${phone ? ' ui-add-fab' : ''}" id="${id}" data-add-button hidden aria-label="Add">${icon('plus', { size: phone ? 18 : 16, stroke: 2.5 })}<span>Add</span></button>`;
}

const sentence = (label) => label.replace(/^\s*(add|new|write)\s+/i, '').trim().toLowerCase(); // "Add Package" -> "package"

/**
 * Show the Add button for the open page and say what it does. `label` is the page's own wording ("Add Package", "Write Blog");
 * null hides it. `onClick` runs when it is pressed (a page that cannot add yet passes nothing: the button is shown but quiet).
 */
export function setAddAction(label, onClick = null) {
  action = label ? onClick : null;
  document.querySelectorAll('[data-add-button]').forEach((b) => {
    b.hidden = !label;
    if (!label) return;
    const noun = sentence(label) || 'item';
    b.setAttribute('aria-label', `Add ${noun}`);
    b.title = `Add ${noun}`;
  });
  if (!bound) {
    bound = true;
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add-button]');
      if (b && action) action(b);
    });
  }
}

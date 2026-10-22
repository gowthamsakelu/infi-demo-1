// Schedule / Follow-up: the same shared sheet as Assign (bottom sheet below 1100px, centered modal above).
import { icon } from './icons.js';
import { esc, toast, dismissOnOutside, bindSheet, afterPaint, afterTransition, lockScroll } from './ui.js';
import { createDropdown } from './dropdown-filter.js';
import { addFollowUpLocal } from './followups.js';

const OUTCOMES = ['Connected', 'No answer', 'Busy', 'Call back later', 'Wrong number'];
const MAX = 500;
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

let overlay = null;
let dispose = null;
let recognition = null;
let lastFocus = null;
let unlockScroll = null;

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(`${v}T00:00:00`);
  return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtTime = (v) => {
  if (!v) return '';
  const [h, m] = v.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export function openFollowUpModal(inquiry, { onSaved } = {}) {
  closeFollowUpModal();
  lastFocus = document.activeElement;
  let type = 'follow_up';

  // Sensible defaults: today, next full hour (tomorrow 9:00 AM if that would pass midnight).
  const now = new Date();
  let when = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
  if (when.getDate() !== now.getDate()) when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
  const defDate = isoDate(when);
  const defTime = `${pad(when.getHours())}:00`;

  overlay = document.createElement('div');
  overlay.className = 'fu-overlay asg-overlay';
  overlay.innerHTML = `
    <div class="fu-card asg-sheet" role="dialog" aria-modal="true" aria-labelledby="fu-title">
      <div class="filter-handle" aria-hidden="true"></div>
      <header class="fu-header">
        <div style="min-width:0;">
          <h3 id="fu-title">Schedule / Follow-up</h3>
          <p class="fu-sub">${esc(inquiry.customer_name)} • ${esc(inquiry.trip)}</p>
        </div>
        <button type="button" class="sheet-close-btn" data-fu-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button>
      </header>
      <form class="fu-body" novalidate>
        <div class="fu-toggle" role="radiogroup" aria-label="Entry type">
          <button type="button" role="radio" aria-checked="true" class="active" data-fu-type="follow_up">Follow-up</button>
          <button type="button" role="radio" aria-checked="false" data-fu-type="called">Called ${icon('chevronDown', { size: 14, stroke: 2.5 })}</button>
          <button type="button" role="radio" aria-checked="false" data-fu-type="cc">CC</button>
        </div>
        <div class="fu-field" data-fu-outcome-row hidden>
          <label>Call outcome</label>
          <div class="fu-outcome" id="fu-outcome"></div>
        </div>
        <div class="fu-row">
          <div class="fu-field"><label for="fu-date">Follow-up Date</label>
            <div class="fu-picker"><span class="fu-picker-text" id="fu-date-text"></span>${icon('calendar', { size: 16 })}
              <input id="fu-date" type="date" value="${defDate}" min="${isoDate(now)}" aria-label="Follow-up date" required></div></div>
          <div class="fu-field"><label for="fu-time">Time</label>
            <div class="fu-picker"><span class="fu-picker-text" id="fu-time-text"></span>${icon('clock', { size: 16 })}
              <input id="fu-time" type="time" value="${defTime}" aria-label="Follow-up time" required></div></div>
        </div>
        <div class="fu-field">
          <label for="fu-comment">Comment</label>
          <div class="fu-textarea">
            <textarea id="fu-comment" rows="4" maxlength="${MAX}" placeholder="Add a note for this follow-up..."></textarea>
            ${Speech ? `<button type="button" class="fu-mic" data-fu-mic aria-label="Dictate comment" aria-pressed="false">${icon('mic', { size: 18 })}</button>` : ''}
            <span class="fu-count" id="fu-count" aria-live="polite">0/${MAX}</span>
          </div>
        </div>
        <p class="fu-error" id="fu-error" role="alert" hidden></p>
      </form>
      <footer class="fu-footer">
        <button type="button" class="btn-primary-desktop fu-save" data-fu-save>Save Follow-up</button>
      </footer>
    </div>`;
  document.body.appendChild(overlay);
  unlockScroll = lockScroll();
  const shown = overlay;
  afterPaint(() => shown.classList.add('open'));

  const $ = (s) => overlay.querySelector(s);
  const comment = $('#fu-comment');
  const err = $('#fu-error');
  const showError = (msg) => { err.textContent = msg; err.hidden = !msg; };
  const syncCount = () => { $('#fu-count').textContent = `${comment.value.length}/${MAX}`; };
  const syncPickers = () => {
    $('#fu-date-text').textContent = fmtDate($('#fu-date').value) || 'Select date';
    $('#fu-time-text').textContent = fmtTime($('#fu-time').value) || 'Select time';
    overlay.querySelectorAll('.fu-picker').forEach((p) => p.classList.toggle('is-empty', !p.querySelector('input').value));
  };
  syncPickers();
  comment.addEventListener('input', syncCount);
  ['#fu-date', '#fu-time'].forEach((id) => {
    $(id).addEventListener('input', syncPickers);
    $(id).addEventListener('change', syncPickers);
    // Open the native picker anywhere on the field (where supported).
    $(id).addEventListener('click', (e) => { try { e.target.showPicker?.(); } catch { /* needs a user gesture on some browsers */ } });
  });

  const outcome = createDropdown({ options: OUTCOMES.map((o) => ({ value: o, label: o })), onChange: () => {}, ariaLabel: 'Call outcome', iconName: 'phone' });
  outcome.attach($('#fu-outcome'));
  outcome.setValue(OUTCOMES[0]);

  overlay.addEventListener('click', async (e) => {
    if (e.target === overlay || e.target.closest('[data-fu-close]')) return closeFollowUpModal();

    const t = e.target.closest('[data-fu-type]');
    if (t) {
      type = t.dataset.fuType;
      overlay.querySelectorAll('[data-fu-type]').forEach((b) => {
        const on = b === t;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', on);
      });
      $('[data-fu-outcome-row]').hidden = type !== 'called';
      return;
    }

    if (e.target.closest('[data-fu-mic]')) return toggleDictation(comment, e.target.closest('[data-fu-mic]'), syncCount);
    if (e.target.closest('[data-fu-save]')) return save();
  });
  overlay.addEventListener('keydown', trapTab);
  const stopOutside = dismissOnOutside($('.fu-card'), closeFollowUpModal);
  const stopSheet = bindSheet(overlay, $('.fu-card'), closeFollowUpModal);
  dispose = () => { stopOutside(); stopSheet(); outcome.close(); };
  $('.fu-card').tabIndex = -1;
  $('.fu-card').focus({ preventScroll: true }); // the dialog, not a field

  async function save() {
    const date = $('#fu-date').value;
    const time = $('#fu-time').value;
    if (!date || !time) return showError(!date ? 'Pick a follow-up date.' : 'Pick a follow-up time.');
    if (comment.value.length > MAX) return showError(`Comment can be at most ${MAX} characters.`);
    showError('');

    const btn = $('[data-fu-save]');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      const res = await fetch(`/api/inquiries/${encodeURIComponent(inquiry.id)}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          type, date, time,
          call_outcome: type === 'called' ? outcome.getValue() : null,
          comment: comment.value.trim() || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422) {
        showError(Object.values(body.errors || {}).flat()[0] || 'Please check the form.');
      } else if (!res.ok) {
        showError(res.status === 403 ? 'You are not allowed to add follow-ups.' : 'Could not save the follow-up. Try again.');
      } else {
        addFollowUpLocal(body.data);
        closeFollowUpModal();
        toast('Follow-up saved', 'success');
        onSaved?.(body);
        return;
      }
    } catch {
      showError('Network error. Try again.');
    }
    btn.disabled = false;
    btn.textContent = 'Save Follow-up';
  }
}

export function closeFollowUpModal() {
  if (!overlay) return;
  recognition?.stop();
  recognition = null;
  dispose?.();
  const el = overlay;
  const unlock = unlockScroll;
  overlay = null;
  unlockScroll = null;
  el.classList.remove('open');
  el.classList.add('closing');
  afterTransition(el.querySelector('.fu-card'), 380).then(() => { el.remove(); unlock?.(); });
  lastFocus?.focus?.({ preventScroll: true });
}

function trapTab(e) {
  if (e.key !== 'Tab') return;
  const f = [...overlay.querySelectorAll('button, select, input, textarea')].filter((n) => !n.disabled && n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0]; const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function toggleDictation(textarea, btn, syncCount) {
  if (recognition) { recognition.stop(); return; }
  recognition = new Speech();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.onresult = (ev) => {
    const text = [...ev.results].map((r) => r[0].transcript).join(' ').trim();
    textarea.value = `${textarea.value}${textarea.value && !textarea.value.endsWith(' ') ? ' ' : ''}${text}`.slice(0, MAX);
    syncCount();
  };
  recognition.onend = () => { recognition = null; btn.classList.remove('listening'); btn.setAttribute('aria-pressed', 'false'); };
  recognition.onerror = () => toast('Voice input is not available right now.', 'warning');
  btn.classList.add('listening');
  btn.setAttribute('aria-pressed', 'true');
  recognition.start();
}

// Follow-up store + the one Lead Flow / Journey renderer used by every customer-details view.
import { icon } from './icons.js';
import { esc } from './ui.js';

const state = { items: [], loaded: false };
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

export const subscribeFollowUps = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const phoneKey = (p) => { const d = String(p || '').replace(/\D+/g, ''); return d.length > 10 ? d.slice(-10) : d; };

export async function loadFollowUps() {
  try {
    const res = await fetch('/api/follow-ups', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    state.items = (await res.json()).data || [];
  } catch {
    state.items = []; // standalone / offline: journey simply shows the static entries
  }
  state.loaded = true;
  notify();
}

export function addFollowUpLocal(fu) {
  state.items = [fu, ...state.items.filter((x) => x.id !== fu.id)];
  notify();
}

export const followUpsFor = (phone) => {
  const key = phoneKey(phone);
  return key ? state.items.filter((f) => f.customer_phone === key) : [];
};

const TYPE_META = {
  follow_up: { type: 'followup', iconBg: 'icon-blue', title: 'Follow-up scheduled' },
  called: { type: 'call', iconBg: 'icon-green', title: 'Called' },
  cc: { type: 'cc', iconBg: 'icon-blue', title: 'CC' },
};

/** API follow-up -> the journey step shape the timeline already renders. */
export function toJourneyStep(f) {
  const meta = TYPE_META[f.type] || TYPE_META.follow_up;
  const d = new Date(f.scheduled_at);
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: meta.type,
    iconBg: meta.iconBg,
    title: f.type === 'called' && f.call_outcome ? `Called: ${f.call_outcome}` : meta.title,
    desc: f.comment || 'No comment added.',
    author: `By ${f.created_by_name}`,
    _ts: d.getTime(),
    _id: f.id,
  };
}

/** Saved follow-ups (newest first) followed by the customer's existing journey entries. */
export function journeyFor(customer) {
  const saved = followUpsFor(customer?.phone)
    .map(toJourneyStep)
    .sort((a, b) => b._ts - a._ts);
  return [...saved, ...(customer?.leadFlow || [])];
}

const STEP_ICON = { call: 'phone', whatsapp: 'whatsapp', email: 'mail', followup: 'calendar', cc: 'message' };

export function renderJourneyItems(steps) {
  if (!steps.length) {
    return '<p style="font-size: 13px; color: #94A3B8; text-align: center; padding: 16px 0;">No journey follow-ups recorded yet.</p>';
  }
  return steps.map((step, idx) => `
    <div class="journey-item" ${step._id ? `data-followup-id="${step._id}"` : ''}>
      <div class="journey-time-col">
        <span class="journey-date">${esc(step.date)}</span>
        <span class="journey-time">${esc(step.time)}</span>
      </div>
      <div class="journey-track-col">
        <div class="journey-dot-icon ${step.iconBg || 'icon-blue'}">${icon(STEP_ICON[step.type] || 'mail', { size: 14, stroke: 2.2 })}</div>
        ${idx < steps.length - 1 ? '<div class="journey-line"></div>' : ''}
      </div>
      <div class="journey-content-col">
        <div class="journey-item-header">
          <h4>${esc(step.title)}</h4>
          <span class="journey-author">${esc(step.author || 'By Ruyi Admin')}</span>
        </div>
        <p class="journey-desc">${esc(step.desc)}</p>
      </div>
    </div>`).join('');
}

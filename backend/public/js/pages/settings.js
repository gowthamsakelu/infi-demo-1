// Settings: the sections on the left, the open section on the right. Company, Lead sources, Bookings and payments and Notifications can be edited
// and saved (PUT); Inquiry stages and Integrations are read only; Message templates and Data and backup have nothing to configure yet.
// Edits are kept per section as a draft, so the page reports unsaved changes and the shared discard confirm appears when switching or leaving.
// The Google Places key never reaches the browser: the server only says whether one is configured.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, sectionTitle, detailGrid, rowGroup, linkRow, toggle, flipToggle } from '../shared/page-ui.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (v) => JSON.parse(JSON.stringify(v));
const glyph = (id, size = 20) => (id === 'rupee' ? '<b class="st-glyph" aria-hidden="true">₹</b>' : icon(id, { size, stroke: 2 }));

const PREFERENCES = [
  ['autoAssign', 'Auto-assign new inquiries', 'Share new website inquiries across the sales team in turn'],
  ['sendQuoteWhatsapp', 'Send quote by WhatsApp', 'Use the WhatsApp template when sending a quote'],
  ['dailySummary', 'Daily follow-up summary', 'Email every morning at 8:30 AM'],
  ['showGst', 'Show prices with GST', 'Add GST on customer-facing totals'],
];
const ALERTS = [
  ['payment', 'Payments', 'A payment arrives or is due'],
  ['inquiry', 'New inquiries', 'An inquiry arrives or is assigned to you'],
  ['followup', 'Follow-ups', 'A follow-up is due or a quote is viewed'],
  ['trip', 'Trips', 'A trip starts tomorrow or has just ended'],
];
const COMPANY_FIELDS = [['name', 'Company name'], ['phone', 'Phone'], ['email', 'Email'], ['website', 'Website']];
const PAYMENT_FIELDS = [['gstPercent', 'GST (%)', 'Added to customer-facing totals when "Show prices with GST" is on'], ['advancePercent', 'Advance to confirm (%)', 'Share of the trip price asked for up front'], ['dueDays', 'Balance due (days before travel)', 'When the rest of the payment is due']];
const STATUS_KIND = { active: 'active', demo: 'scheduled', inactive: 'inactive' };

export default {
  css: true,
  mount(host, ctx) {
    const cache = new Map();   // section id -> payload from /api/settings/{id}
    const loading = new Set();
    const failed = new Set();
    const drafts = new Map();  // section id -> the editable part, only after the person changed something
    const errors = new Map();  // section id -> { 'values.name': 'message' } from the last failed save
    let saving = false;
    let page = null;

    /* ---------- what is editable in each section ---------- */
    const EDIT = {
      company: { get: (d) => ({ values: d.values, preferences: d.preferences }), body: (x) => x },
      'lead-sources': { get: (d) => ({ sources: d.sources }), body: (x) => x },
      'bookings-payments': { get: (d) => ({ values: d.values }), body: (x) => x },
      notifications: { get: (d) => ({ types: d.types }), body: (x) => x },
    };
    const savedPart = (id) => (cache.has(id) && EDIT[id] ? EDIT[id].get(cache.get(id)) : null);
    const draftOf = (id) => drafts.get(id) || savedPart(id);
    const isDirty = () => [...drafts].some(([id, d]) => !same(d, savedPart(id)));
    const touch = (id) => { if (!drafts.has(id)) drafts.set(id, clone(savedPart(id))); return drafts.get(id); };
    const settle = (id) => { if (drafts.has(id) && same(drafts.get(id), savedPart(id))) drafts.delete(id); };

    async function ensureDetail(item) {
      if (cache.has(item.id) || loading.has(item.id)) return;
      loading.add(item.id); failed.delete(item.id);
      try { cache.set(item.id, await getJson(`/api/settings/${encodeURIComponent(item.id)}`)); } catch { failed.add(item.id); }
      loading.delete(item.id);
      if (page && page.api.current()?.id === item.id) page.api.refresh();
    }

    const HEAD_SUB = {
      company: 'Shown on quotes, invoices and itineraries sent to guests',
      'lead-sources': 'Where inquiries come from',
      'inquiry-stages': 'How inquiries move along, with how many sit in each',
      'bookings-payments': 'Instalments, GST and currency',
      'message-templates': 'WhatsApp and email replies',
      notifications: 'What alerts you receive',
      integrations: 'Connected services and where their keys live',
      'data-backup': 'Export, import and backups',
    };

    /* ---------- markup ---------- */
    const fieldError = (id, path) => `<p class="st-error" data-st-error="${esc(path)}" ${errors.get(id)?.[path] ? '' : 'hidden'} role="alert">${esc(errors.get(id)?.[path] || '')}</p>`;
    const field = (id, path, label, value, { wide = false, hint = '', inputmode = 'text' } = {}) => `
      <div class="form-group ${wide ? 'st-wide' : ''}">
        <label for="st-${esc(path)}">${esc(label)}</label>
        <input id="st-${esc(path)}" type="text" inputmode="${inputmode}" autocomplete="off" value="${esc(value ?? '')}" data-st-field="${esc(path)}" ${errors.get(id)?.[path] ? 'aria-invalid="true"' : ''}>
        ${hint ? `<small class="st-hint">${esc(hint)}</small>` : ''}${fieldError(id, path)}
      </div>`;
    const card = (title, sub, inner) => `<section class="st-card"><div class="st-card-head"><h4>${esc(title)}</h4>${sub ? `<p>${esc(sub)}</p>` : ''}</div><div class="st-card-body">${inner}</div></section>`;
    const none = (title, text) => `<div class="state-box st-nothing"><h4>${esc(title)}</h4><p>${esc(text)}</p></div>`;
    const readOnly = (text) => `<p class="st-note">${esc(text)}</p>`;

    function services(list) {
      return rowGroup(list.map((s) => `
        <div class="sp-linkrow st-service">
          <span class="sp-tile sp-tile-sm st-svc-ico st-svc-${esc(s.key)}">${icon(s.key === 'email' ? 'mail' : s.key === 'whatsapp' ? 'phone' : 'pin', { size: 18 })}</span>
          <div class="sp-linkrow-text"><b>${esc(s.name)}</b><small>${esc(s.description)}</small></div>
          ${pill(STATUS_KIND[s.status] || 'inactive', s.statusLabel)}
        </div>`));
    }

    function placesDetails(list) {
      const p = list.find((s) => s.key === 'google-places')?.details;
      if (!p) return '';
      return `<section>${sectionTitle('Places provider')}${detailGrid([
        ['PLACES_PROVIDER', p.mode], ['Answering with', p.using === 'google' ? 'Google Places' : 'Demo data'], ['Google API key', p.keyConfigured ? 'Configured' : 'Not configured'],
      ])}${readOnly('Set in the server settings (.env). The key stays on the server and is never shown here.')}</section>`;
    }

    const bodies = {
      company(id, d) {
        const x = draftOf(id);
        return `
          <div class="st-form">
            ${COMPANY_FIELDS.map(([k, label]) => field(id, `values.${k}`, label, x.values[k], { inputmode: k === 'phone' ? 'tel' : k === 'email' ? 'email' : 'text' })).join('')}
            ${field(id, 'values.address', 'Address', x.values.address, { wide: true })}
          </div>
          ${card('Quick preferences', 'Applied across the CRM', PREFERENCES.map(([k, label, hint]) => toggle({ id: `preferences.${k}`, label, hint, on: x.preferences[k] })).join(''))}
          ${card('Connected services', 'API keys stay on the server', services(d.services))}`;
      },
      'lead-sources'(id) {
        const x = draftOf(id);
        return `${readOnly('The places your inquiries come from. Rename a source or switch it off.')}
          <section class="st-card"><div class="st-card-body">
            ${x.sources.map((s, i) => `
              <div class="st-source">
                <input type="text" value="${esc(s.name)}" maxlength="60" autocomplete="off" aria-label="Lead source ${i + 1}" data-st-field="sources.${i}.name" ${errors.get(id)?.[`sources.${i}.name`] ? 'aria-invalid="true"' : ''}>
                <button type="button" role="switch" aria-checked="${!!s.active}" aria-label="${esc(`${s.name} is on`)}" class="bld-switch sp-switch ${s.active ? 'is-on' : ''}" data-sp-toggle="sources.${i}.active"><span class="bld-switch-knob"></span></button>
                ${fieldError(id, `sources.${i}.name`)}
              </div>`).join('')}
          </div></section>`;
      },
      'inquiry-stages'(_id, d) {
        return `${rowGroup(d.stages.map((s) => linkRow({ ico: 'filter', title: s.label, sub: s.description, right: String(s.count), rightSub: s.count === 1 ? 'inquiry' : 'inquiries' })))}
          ${readOnly('These stages are fixed for now. Reports counts "Quote sent" as every stage after New, and "Negotiating" as Warm and Hot.')}`;
      },
      'bookings-payments'(id) {
        const x = draftOf(id);
        return `<div class="st-form">${PAYMENT_FIELDS.map(([k, label, hint]) => field(id, `values.${k}`, label, x.values[k], { hint, inputmode: 'decimal' })).join('')}</div>
          ${readOnly('Amounts are shown in Indian rupees (₹).')}`;
      },
      notifications(id) {
        const x = draftOf(id);
        return card('Alerts you receive', 'Choose which kinds show up in your feed', ALERTS.map(([k, label, hint]) => toggle({ id: `types.${k}`, label, hint, on: x.types[k] })).join(''));
      },
      integrations(_id, d) { return `${services(d.services)}${placesDetails(d.services)}`; },
      'message-templates': () => none('Nothing to configure yet', 'Message templates will live here once WhatsApp and email are connected.'),
      'data-backup': () => none('Nothing to configure yet', 'Export, import and backups will live here when they are ready.'),
    };

    /* ---------- the page ---------- */
    page = createSplitPage(host, ctx, {
      title: 'Settings',
      noun: 'setting',
      plural: 'settings',
      searchPlaceholder: 'Search settings...',
      load: () => getJson('/api/settings'),
      subtitle: () => 'Company details, inquiry stages, payments and connected services',
      subtitleShort: () => 'Company, stages, payments, services',
      tabs: [{ key: 'all', label: 'All', test: () => true }],
      searchText: (s) => `${s.name} ${s.description}`,
      row: (s) => ({ tile: `<span class="st-ico st-${esc(s.id)}">${glyph(s.icon)}</span>`, name: s.name, sub: s.description }),
      detail: (item) => {
        const d = cache.get(item.id);
        const head = `<span class="sp-tile st-head-ico"><span class="st-ico st-${esc(item.id)}">${glyph(item.icon, 26)}</span></span>
          <div class="sp-head-text"><div class="sp-head-name"><h2>${esc(item.name)}</h2></div><p class="sp-head-sub">${esc(HEAD_SUB[item.id] || item.description)}</p></div>`;
        let body;
        if (d) body = bodies[item.id](item.id, d);
        else if (failed.has(item.id)) body = `<div class="state-box is-error" role="alert"><h4>Could not load ${esc(item.name)}</h4><p>Check your connection and try again.</p><button type="button" class="btn-secondary-desktop" data-st-retry style="height:36px;">Try again</button></div>`;
        else body = '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i></div>';
        const dirty = drafts.has(item.id) && !same(drafts.get(item.id), savedPart(item.id));
        const foot = d && EDIT[item.id] ? `
          <button type="button" class="btn-secondary-desktop sp-foot-btn" data-sp-act="discard" ${dirty && !saving ? '' : 'disabled'}>Discard</button>
          <button type="button" class="btn-primary-desktop sp-foot-btn" data-sp-act="save" ${dirty && !saving ? '' : 'disabled'}>${saving ? 'Saving…' : 'Save changes'}</button>` : '';
        return { head, body, foot };
      },
      afterDetail: (_el, item) => { ensureDetail(item); },
      discard: () => { drafts.clear(); errors.clear(); },
    });
    page.api.bindDirty(isDirty);
    host.querySelector('.sp-export')?.remove(); // settings are not a list to export


    /* ---------- editing ---------- */
    const current = () => page.api.current();
    function pathSet(obj, path, value) {
      const keys = path.split('.');
      const last = keys.pop();
      keys.reduce((o, k) => o[k], obj)[last] = value;
    }

    function syncFoot() {
      const item = current();
      if (!item) return;
      const dirty = drafts.has(item.id) && !same(drafts.get(item.id), savedPart(item.id));
      host.querySelectorAll('[data-sp-act="save"], [data-sp-act="discard"]').forEach((b) => { b.disabled = !dirty || saving; });
    }

    const numeric = (path, v) => (/gstPercent|advancePercent|dueDays/.test(path) && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v);

    function onInput(e) {
      const el = e.target.closest('[data-st-field]');
      const item = current();
      if (!el || !item || !cache.has(item.id)) return;
      const path = el.dataset.stField;
      pathSet(touch(item.id), path, numeric(path, el.value));
      settle(item.id);
      if (errors.get(item.id)?.[path]) { delete errors.get(item.id)[path]; el.removeAttribute('aria-invalid'); const p = host.querySelector(`[data-st-error="${CSS.escape(path)}"]`); if (p) p.hidden = true; }
      syncFoot();
    }

    function onToggle(btn) {
      const item = current();
      if (!item || !cache.has(item.id)) return;
      const path = btn.dataset.spToggle;
      const on = flipToggle(btn);
      pathSet(touch(item.id), path, on);
      settle(item.id);
      syncFoot();
    }

    async function save() {
      const item = current();
      const draft = item && drafts.get(item.id);
      if (!draft || saving) return;
      saving = true; errors.delete(item.id); page.api.refresh();
      try {
        const res = await sendJson(`/api/settings/${encodeURIComponent(item.id)}`, 'PUT', EDIT[item.id].body(draft));
        cache.set(item.id, res.data);
        drafts.delete(item.id);
        toast('Settings saved.', 'success');
      } catch (err) {
        if (err.status === 422 && err.errors) {
          errors.set(item.id, Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, [].concat(v)[0]])));
          toast('Please check the highlighted fields.', 'error');
        } else toast(err.message || 'Could not save the settings.', 'error');
      }
      saving = false; page.api.refresh();
    }

    function discard() {
      const item = current();
      if (!item) return;
      drafts.delete(item.id); errors.delete(item.id);
      page.api.refresh();
    }

    const onClick = (e) => {
      const sw = e.target.closest('[data-sp-toggle]');
      if (sw) { onToggle(sw); return; }
      if (e.target.closest('[data-st-retry]')) { const item = current(); if (item) { failed.delete(item.id); page.api.refresh(); ensureDetail(item); } return; }
      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      if (act === 'save') save(); else if (act === 'discard') discard();
    };
    host.addEventListener('click', onClick);
    host.addEventListener('input', onInput);

    return {
      destroy() { host.removeEventListener('click', onClick); host.removeEventListener('input', onInput); page.destroy(); },
      isDirty,
    };
  },
};

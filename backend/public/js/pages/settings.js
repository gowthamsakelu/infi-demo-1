// Settings: the sections on the left, the open section on the right. Company, Lead sources, Bookings and payments and Notifications can be edited
// and saved (PUT); Inquiry stages and Integrations are read only; Message templates and Data and backup have nothing to configure yet.
// Edits are kept per section as a draft, so the page reports unsaved changes and the shared discard confirm appears when switching or leaving.
// The Google Places key never reaches the browser: the server only says whether one is configured.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, errorState } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, sectionTitle, detailGrid, rowGroup, linkRow, toggle, flipToggle } from '../shared/page-ui.js';
import { detectDominantColor, isValidHex } from '../shared/color-detector.js';
import { applyBranding, DEFAULT_BRAND_COLOR, calculateThemeShades, isLightColor } from '../shared/branding.js';

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
    const failed = new Map(); // section id -> the ApiError (picks the sentence under "Could not load")
    const drafts = new Map();  // section id -> the editable part, only after the person changed something
    const errors = new Map();  // section id -> { 'values.name': 'message' } from the last failed save
    let saving = false;
    let page = null;

    /* ---------- what is editable in each section ---------- */
    const EDIT = {
      company: { get: (d) => ({ values: d.values, preferences: d.preferences, branding: d.branding || { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null } }), body: (x) => x },
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
      if (cache.has(item.id) || loading.has(item.id) || failed.has(item.id)) return; // a failed section waits for "Try again" instead of refetching on every redraw
      loading.add(item.id);
      try { cache.set(item.id, await getJson(`/api/settings/${encodeURIComponent(item.id)}`)); } catch (err) { failed.set(item.id, err); }
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

    function brandingCard(id) {
      const x = draftOf(id);
      const b = x.branding || { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
      const currentBrandColor = b.color || DEFAULT_BRAND_COLOR;
      const currentThemeColor = b.themeColor || currentBrandColor;
      const detectedBrand = b.detectedColor;
      const detectedTheme = b.detectedThemeColor || detectedBrand;
      const detectedPalette = b.detectedPalette || (detectedBrand ? [detectedBrand] : []);
      const brandShades = calculateThemeShades(currentBrandColor);
      const themeShades = calculateThemeShades(currentThemeColor);
      const presets = [
        ['#2563EB', 'Default Blue'],
        ['#4F46E5', 'Indigo'],
        ['#7C3AED', 'Purple'],
        ['#059669', 'Emerald'],
        ['#0284C7', 'Sky'],
        ['#EA580C', 'Orange'],
        ['#E11D48', 'Rose'],
        ['#0F172A', 'Slate'],
      ];

      const logoHtml = b.logo ? `
        <div class="st-brand-logo-preview">
          <div class="st-brand-logo-thumb-box" style="background:${esc(currentBrandColor)};">
            <img src="${esc(b.logo)}" alt="Company logo preview" class="st-brand-logo-thumb" id="st-logo-img-preview">
          </div>
          <div class="st-brand-logo-meta">
            <b>Custom logo uploaded</b>
            <small>PNG, JPG or WebP image</small>
            <div class="st-brand-logo-actions">
              <button type="button" class="btn-secondary-desktop btn-sm" data-st-brand-act="replace-logo">${icon('upload', { size: 14 })} Replace</button>
              <button type="button" class="btn-secondary-desktop btn-sm st-btn-danger" data-st-brand-act="remove-logo">${icon('trash', { size: 14 })} Reset to default</button>
            </div>
          </div>
        </div>` : `
        <div class="st-brand-dropzone" data-st-brand-act="upload-logo" tabindex="0" role="button" aria-label="Upload company logo">
          <div class="st-brand-dz-icon">${icon('image', { size: 28 })}</div>
          <div class="st-brand-dz-text">
            <b>Upload company logo</b>
            <small>PNG, JPG/JPEG or WebP up to 2MB (transparent background recommended)</small>
          </div>
          <button type="button" class="btn-secondary-desktop btn-sm">${icon('upload', { size: 14 })} Browse file</button>
        </div>`;

      const detectedBanner = detectedBrand ? `
        <div class="st-brand-detected-bar">
          <div class="st-brand-detected-group">
            <span class="st-brand-detected-pill">
              ${icon('sparkles', { size: 14 })}
              <span>Brand Color:</span>
              <span class="st-color-swatch-sm" style="background:${esc(detectedBrand)};"></span>
              <code>${esc(detectedBrand)}</code>
            </span>
            ${detectedBrand.toUpperCase() !== currentBrandColor.toUpperCase() ? `
              <button type="button" class="st-use-detected-btn" data-st-brand-act="use-detected-brand" title="Apply detected brand color">
                ${icon('refreshCcw', { size: 12 })} Apply
              </button>` : '<span class="st-badge-active-tag">Active</span>'}
          </div>

          <div class="st-brand-detected-group">
            <span class="st-brand-detected-pill">
              ${icon('sparkles', { size: 14 })}
              <span>Theme Color:</span>
              <span class="st-color-swatch-sm" style="background:${esc(detectedTheme)};"></span>
              <code>${esc(detectedTheme)}</code>
            </span>
            ${detectedTheme.toUpperCase() !== currentThemeColor.toUpperCase() ? `
              <button type="button" class="st-use-detected-btn" data-st-brand-act="use-detected-theme" title="Apply detected theme color">
                ${icon('refreshCcw', { size: 12 })} Apply
              </button>` : '<span class="st-badge-active-tag">Active</span>'}
          </div>
        </div>` : (b.logo ? '' : `
        <p class="st-hint st-brand-hint">Upload a company logo above to automatically detect and adapt the brand and theme colors.</p>`);

      const paletteRow = detectedPalette.length > 1 ? `
        <div class="st-logo-palette-box">
          <span class="st-logo-palette-label">Logo Palette:</span>
          <div class="st-brand-presets">
            ${detectedPalette.map((hex) => `
              <button type="button" class="st-color-swatch-btn ${hex.toUpperCase() === currentThemeColor.toUpperCase() ? 'is-active' : ''}" data-st-color-preset="${esc(hex)}" data-st-color-target="theme" style="background:${esc(hex)};" title="Use ${esc(hex)} as theme color" aria-label="Theme ${esc(hex)}">
                ${hex.toUpperCase() === currentThemeColor.toUpperCase() ? icon('check', { size: 13, stroke: 3 }) : ''}
              </button>`).join('')}
          </div>
        </div>` : '';

      return `
        <section class="st-card st-brand-card">
          <div class="st-card-head">
            <h4>Company Branding & Theme</h4>
            <p>Logo, brand identity color, CRM theme color and real-time live preview</p>
          </div>
          <div class="st-card-body">
            <input type="file" id="st-logo-file-input" accept="image/png,image/jpeg,image/webp" style="display:none;" aria-label="Upload logo file">
            <div id="st-logo-error-msg" class="st-error" hidden role="alert" style="margin-bottom:10px;"></div>

            <!-- Logo Section -->
            <div class="st-brand-section">
              <label class="st-brand-label">Company Logo</label>
              ${logoHtml}
            </div>

            <!-- Detected from Logo Banner -->
            ${detectedBanner}
            ${paletteRow}

            <!-- 2-Color Gradient Combination Side-by-Side -->
            <div class="st-brand-section">
              <div class="st-brand-color-header" style="margin-bottom:10px;">
                <div>
                  <label class="st-brand-label">Brand & Theme Gradient Colors</label>
                  <span class="st-brand-sublabel">2 colors extracted from the logo to create the CRM's gradient theme</span>
                </div>
                <button type="button" class="st-reset-color-btn" data-st-brand-act="reset-colors" title="Reset both colors to default">
                  ${icon('refreshCcw', { size: 13 })} Reset to default
                </button>
              </div>

              <div class="st-brand-colors-grid">
                <!-- 1. Gradient Color 1 Column -->
                <div class="st-brand-color-col">
                  <div class="st-brand-color-header">
                    <div>
                      <label class="st-brand-label">Gradient Color 1 (Start)</label>
                      <span class="st-brand-sublabel">Primary logo mark & gradient start</span>
                    </div>
                  </div>

                  <div class="st-brand-color-controls">
                    <div class="st-color-input-wrap">
                      <input type="color" id="st-brand-color-picker" class="st-color-picker" value="${esc(currentBrandColor)}" aria-label="Pick gradient color 1">
                      <input type="text" id="st-brand-hex-input" class="st-hex-input" value="${esc(currentBrandColor)}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Gradient color 1 hex code">
                    </div>

                    <div class="st-brand-presets">
                      ${presets.map(([hex, label]) => `
                        <button type="button" class="st-color-swatch-btn ${hex.toUpperCase() === currentBrandColor.toUpperCase() ? 'is-active' : ''}" data-st-color-preset="${esc(hex)}" data-st-color-target="brand" style="background:${esc(hex)};" title="${esc(label)} (${esc(hex)})" aria-label="${esc(label)}">
                          ${hex.toUpperCase() === currentBrandColor.toUpperCase() ? icon('check', { size: 13, stroke: 3 }) : ''}
                        </button>`).join('')}
                    </div>
                  </div>
                </div>

                <!-- 2. Gradient Color 2 Column (nxt to Color 1) -->
                <div class="st-brand-color-col">
                  <div class="st-brand-color-header">
                    <div>
                      <label class="st-brand-label">Gradient Color 2 (End)</label>
                      <span class="st-brand-sublabel">Accent color & gradient end</span>
                    </div>
                    <button type="button" class="st-match-brand-btn" data-st-brand-act="match-brand" title="Set gradient color 2 to match color 1">
                      ${icon('palette', { size: 12 })} Match Color 1
                    </button>
                  </div>

                  <div class="st-brand-color-controls">
                    <div class="st-color-input-wrap">
                      <input type="color" id="st-theme-color-picker" class="st-color-picker" value="${esc(currentThemeColor)}" aria-label="Pick gradient color 2">
                      <input type="text" id="st-theme-hex-input" class="st-hex-input" value="${esc(currentThemeColor)}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Gradient color 2 hex code">
                    </div>

                    <div class="st-brand-presets">
                      ${presets.map(([hex, label]) => `
                        <button type="button" class="st-color-swatch-btn ${hex.toUpperCase() === currentThemeColor.toUpperCase() ? 'is-active' : ''}" data-st-color-preset="${esc(hex)}" data-st-color-target="theme" style="background:${esc(hex)};" title="${esc(label)} (${esc(hex)})" aria-label="${esc(label)}">
                          ${hex.toUpperCase() === currentThemeColor.toUpperCase() ? icon('check', { size: 13, stroke: 3 }) : ''}
                        </button>`).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Blended Gradient Bar -->
              <div class="st-brand-gradient-bar" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);">
                <span>Start: ${esc(currentBrandColor)}</span>
                <span>✦ Active Theme Gradient ✦</span>
                <span>End: ${esc(currentThemeColor)}</span>
              </div>
            </div>

            <!-- Live System Preview -->
            <div class="st-brand-section">
              <label class="st-brand-label">Live System Preview</label>
              <p class="st-hint">Preview how the custom logo and 2-color gradient combination power all components across the CRM</p>

              <div class="st-brand-preview-frame">
                <!-- Desktop Sidebar Mockup -->
                <div class="st-prev-desktop">
                  <div class="st-prev-header-label">Desktop Sidebar Preview</div>
                  <div class="st-prev-sidebar-box">
                    <div class="sidebar-brand">
                      <div class="brand-icon-box" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);box-shadow:0 4px 12px ${esc(brandShades.primaryShadow)};">
                        ${b.logo ? `<img src="${esc(b.logo)}" alt="Logo" class="brand-logo-img">` : icon('plane', { size: 22, stroke: 2.2 })}
                      </div>
                      <div class="brand-text-col">
                        <h2>${esc(x.values?.name || 'Ruyi Admin')}</h2>
                        <p>Travel Operations</p>
                      </div>
                    </div>

                    <div class="st-prev-nav-item active" style="background:linear-gradient(135deg, ${esc(brandShades.primaryLight)} 0%, ${esc(themeShades.primaryLight)} 100%);color:${esc(currentBrandColor)};box-shadow:inset 3.5px 0 0 ${esc(currentBrandColor)};">
                      <span class="st-prev-nav-left">
                        ${icon('calendar', { size: 18 })}
                        <span>Bookings</span>
                      </span>
                      <span class="st-prev-badge" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);color:#fff;">12</span>
                    </div>
                    <div class="st-prev-nav-item">
                      <span class="st-prev-nav-left">${icon('users', { size: 18 })}<span>Inquiries</span></span>
                    </div>
                  </div>
                </div>

                <!-- Mobile Header & Interactive Elements Mockup -->
                <div class="st-prev-mobile">
                  <div class="st-prev-header-label">Mobile Header & UI Theme Preview</div>
                  <div class="st-prev-mobile-box">
                    <div class="mobile-app-header">
                      <div class="app-brand-left">
                        <div class="brand-icon-box" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);box-shadow:0 4px 12px ${esc(brandShades.primaryShadow)};">
                          ${b.logo ? `<img src="${esc(b.logo)}" alt="Logo" class="brand-logo-img">` : icon('plane', { size: 22, stroke: 2.2 })}
                        </div>
                        <div class="brand-text-col">
                          <h2>${esc(x.values?.name || 'Ruyi Admin')}</h2>
                          <p>Bookings • 28 Total</p>
                        </div>
                      </div>
                      <div class="icon-bell-btn">
                        ${icon('bell', { size: 20 })}
                        <span class="bell-dot" style="background:${esc(currentBrandColor)};"></span>
                      </div>
                    </div>

                    <div class="st-prev-btn-sample">
                      <button type="button" class="btn-primary-desktop" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);box-shadow:0 3px 10px ${esc(brandShades.primaryShadow)};pointer-events:none;">
                        ${icon('check', { size: 16 })} Primary Action
                      </button>
                      <span class="tab-pill active st-prev-tab-pill" style="background:linear-gradient(135deg, ${esc(currentBrandColor)} 0%, ${esc(currentThemeColor)} 100%);color:#fff;pointer-events:none;">
                        Active Tab
                      </span>
                      <span class="asg-badge st-prev-asg-badge" style="background:linear-gradient(135deg, ${esc(brandShades.primaryLight)} 0%, ${esc(themeShades.primaryLight)} 100%);color:${esc(currentBrandColor)};border:1px solid ${esc(brandShades.primaryBorder)};">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>`;
    }

    const bodies = {
      company(id, d) {
        const x = draftOf(id);
        return `
          <div class="st-form">
            ${COMPANY_FIELDS.map(([k, label]) => field(id, `values.${k}`, label, x.values[k], { inputmode: k === 'phone' ? 'tel' : k === 'email' ? 'email' : 'text' })).join('')}
            ${field(id, 'values.address', 'Address', x.values.address, { wide: true })}
          </div>
          ${brandingCard(id)}
          ${card('Quick preferences', 'Applied across the CRM', PREFERENCES.map(([k, label, hint]) => toggle({ id: `preferences.${k}`, label, hint, on: x.preferences[k] })).join(''))}
          ${card('Connected services', 'API keys stay on the server', services(d.services))}`;
      },
      'lead-sources'(id) {
        const x = draftOf(id);
        return `${readOnly('The places your inquiries come from. Rename a source or switch it off.')}
          <section class="st-card"><div class="st-card-body">
            ${x.sources.map((s, i) => `
              <div class="st-source">
                <div class="form-group"><input type="text" value="${esc(s.name)}" maxlength="60" autocomplete="off" aria-label="Lead source ${i + 1}" data-st-field="sources.${i}.name" ${errors.get(id)?.[`sources.${i}.name`] ? 'aria-invalid="true"' : ''}></div>
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
        const head = { avatar: `<span class="st-ico st-${esc(item.id)}">${glyph(item.icon, 24)}</span>`, title: item.name, subtitle: HEAD_SUB[item.id] || item.description };
        let body;
        if (d) body = bodies[item.id](item.id, d);
        else if (failed.has(item.id)) body = errorState({ title: `Could not load ${item.name.toLowerCase()}`, error: failed.get(item.id), what: 'settings', retryAttr: 'data-st-retry' });
        else body = '<div class="sp-detail-skel" aria-hidden="true"><i></i><i></i><i></i></div>';
        const dirty = drafts.has(item.id) && !same(drafts.get(item.id), savedPart(item.id));
        const foot = d && EDIT[item.id] ? {
          primary: { label: saving ? 'Saving…' : 'Save changes', icon: 'check', act: 'save', disabled: !dirty || saving },
          quick: [{ label: 'Discard changes', icon: 'close', tone: 'more', act: 'discard', disabled: !dirty || saving }],
        } : '';
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

    function updateLivePreview(brandColor, themeColor, logo) {
      const bColor = isValidHex(brandColor) ? brandColor : DEFAULT_BRAND_COLOR;
      const tColor = isValidHex(themeColor) ? themeColor : bColor;
      const brandShades = calculateThemeShades(bColor);
      const themeShades = calculateThemeShades(tColor);

      // Apply dynamic styles globally so the current session sees the changes
      applyTheme(bColor, tColor);

      const prevBoxes = host.querySelectorAll('.st-brand-preview-frame .brand-icon-box');
      prevBoxes.forEach((b) => {
        b.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;
        b.style.boxShadow = `0 4px 10px ${brandShades.primaryShadow}`;
      });
      const logoThumb = host.querySelector('.st-brand-logo-thumb-box');
      if (logoThumb) logoThumb.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;

      const gradientBar = host.querySelector('.st-brand-gradient-bar');
      if (gradientBar) {
        gradientBar.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;
        gradientBar.innerHTML = `<span>Start: ${bColor}</span><span>✦ Active Theme Gradient ✦</span><span>End: ${tColor}</span>`;
      }

      const activeNav = host.querySelector('.st-prev-nav-item.active');
      if (activeNav) {
        activeNav.style.background = `linear-gradient(135deg, ${brandShades.primaryLight} 0%, ${themeShades.primaryLight} 100%)`;
        activeNav.style.color = bColor;
        const badge = activeNav.querySelector('.st-prev-badge');
        if (badge) badge.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;
      }
      const prevBtn = host.querySelector('.st-prev-btn-sample .btn-primary-desktop');
      if (prevBtn) {
        prevBtn.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;
        prevBtn.style.boxShadow = `0 2px 6px ${brandShades.primaryShadow}`;
      }
      const bellDot = host.querySelector('.st-prev-mobile .bell-dot');
      if (bellDot) bellDot.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;

      const prevPill = host.querySelector('.st-prev-tab-pill');
      if (prevPill) prevPill.style.background = `linear-gradient(135deg, ${bColor} 0%, ${tColor} 100%)`;

      const prevBadge = host.querySelector('.st-prev-asg-badge');
      if (prevBadge) {
        prevBadge.style.background = `linear-gradient(135deg, ${brandShades.primaryLight} 0%, ${themeShades.primaryLight} 100%)`;
        prevBadge.style.color = bColor;
      }

      host.querySelectorAll('.st-brand-color-col [data-st-color-preset]').forEach((b) => {
        const target = b.dataset.stColorTarget;
        const targetColor = target === 'theme' ? tColor : bColor;
        b.classList.toggle('is-active', b.dataset.stColorPreset?.toUpperCase() === targetColor.toUpperCase());
      });
    }

    async function processLogoFile(file) {
      const item = current();
      if (!item || item.id !== 'company' || !file) return;
      const errEl = host.querySelector('#st-logo-error-msg');
      if (errEl) errEl.hidden = true;

      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        if (errEl) { errEl.textContent = 'Please choose a PNG, JPG or WebP image.'; errEl.hidden = false; }
        toast('Please choose a PNG, JPG or WebP image.', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        if (errEl) { errEl.textContent = 'Image size must be 2 MB or less.'; errEl.hidden = false; }
        toast('Image size must be 2 MB or less.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const d = touch(item.id);
        if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
        d.branding.logo = dataUrl;

        try {
          const detected = await detectDominantColor(dataUrl);
          if (detected) {
            const brand = detected.brandColor || String(detected);
            const theme = detected.themeColor || brand;
            d.branding.detectedColor = brand;
            d.branding.detectedThemeColor = theme;
            d.branding.detectedPalette = detected.palette || [brand];
            d.branding.color = brand;
            d.branding.themeColor = theme;
            toast(`Extracted 2-color gradient theme (${brand} → ${theme}) from logo.`, 'info');
          }
        } catch (err) {
          console.warn('Dominant color detection failed:', err);
        }

        settle(item.id);
        syncFoot();
        applyBranding(d.branding);
        page.api.refresh();
      };
      reader.readAsDataURL(file);
    }

    function handleBrandAction(act) {
      const item = current();
      if (!item || item.id !== 'company') return;

      if (act === 'upload-logo' || act === 'replace-logo') {
        host.querySelector('#st-logo-file-input')?.click();
      } else if (act === 'remove-logo') {
        const d = touch(item.id);
        if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
        d.branding.logo = null;
        d.branding.detectedColor = null;
        d.branding.detectedThemeColor = null;
        d.branding.detectedPalette = [];
        settle(item.id);
        syncFoot();
        applyBranding(d.branding);
        page.api.refresh();
      } else if (act === 'use-detected-brand') {
        const d = touch(item.id);
        if (d.branding?.detectedColor) {
          d.branding.color = d.branding.detectedColor;
          settle(item.id);
          syncFoot();
          applyBranding(d.branding);
          page.api.refresh();
        }
      } else if (act === 'use-detected-theme') {
        const d = touch(item.id);
        if (d.branding?.detectedThemeColor) {
          d.branding.themeColor = d.branding.detectedThemeColor;
          settle(item.id);
          syncFoot();
          applyBranding(d.branding);
          page.api.refresh();
        }
      } else if (act === 'match-brand') {
        const d = touch(item.id);
        if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
        d.branding.themeColor = d.branding.color || DEFAULT_BRAND_COLOR;
        settle(item.id);
        syncFoot();
        applyBranding(d.branding);
        page.api.refresh();
      } else if (act === 'reset-colors' || act === 'reset-color') {
        const d = touch(item.id);
        if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
        d.branding.color = DEFAULT_BRAND_COLOR;
        d.branding.themeColor = DEFAULT_BRAND_COLOR;
        settle(item.id);
        syncFoot();
        applyBranding(d.branding);
        page.api.refresh();
      }
    }

    function handleColorPreset(hex, target = 'brand') {
      const item = current();
      if (!item || item.id !== 'company' || !isValidHex(hex)) return;
      const d = touch(item.id);
      if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };
      if (target === 'theme') {
        d.branding.themeColor = hex;
      } else {
        d.branding.color = hex;
      }
      settle(item.id);
      syncFoot();
      applyBranding(d.branding);
      page.api.refresh();
    }

    function handleColorChange(target, el) {
      const item = current();
      if (!item || item.id !== 'company') return;
      let val = el.value.trim();
      if ((el.id === 'st-brand-hex-input' || el.id === 'st-theme-hex-input') && !val.startsWith('#') && val.length > 0) val = '#' + val;

      const d = touch(item.id);
      if (!d.branding) d.branding = { logo: null, color: DEFAULT_BRAND_COLOR, themeColor: DEFAULT_BRAND_COLOR, detectedColor: null, detectedThemeColor: null };

      if (target === 'brand') {
        if (el.id === 'st-brand-color-picker') {
          d.branding.color = val;
          const hexEl = host.querySelector('#st-brand-hex-input');
          if (hexEl) hexEl.value = val;
        } else if (el.id === 'st-brand-hex-input') {
          if (isValidHex(val)) {
            d.branding.color = val;
            const pickEl = host.querySelector('#st-brand-color-picker');
            if (pickEl) pickEl.value = val;
          }
        }
      } else if (target === 'theme') {
        if (el.id === 'st-theme-color-picker') {
          d.branding.themeColor = val;
          const hexEl = host.querySelector('#st-theme-hex-input');
          if (hexEl) hexEl.value = val;
        } else if (el.id === 'st-theme-hex-input') {
          if (isValidHex(val)) {
            d.branding.themeColor = val;
            const pickEl = host.querySelector('#st-theme-color-picker');
            if (pickEl) pickEl.value = val;
          }
        }
      }

      settle(item.id);
      syncFoot();
      updateLivePreview(d.branding.color, d.branding.themeColor, d.branding.logo);
    }

    function onInput(e) {
      const brandHex = e.target.closest('#st-brand-hex-input');
      const brandPicker = e.target.closest('#st-brand-color-picker');
      if (brandHex || brandPicker) {
        handleColorChange('brand', brandHex || brandPicker);
        return;
      }

      const themeHex = e.target.closest('#st-theme-hex-input');
      const themePicker = e.target.closest('#st-theme-color-picker');
      if (themeHex || themePicker) {
        handleColorChange('theme', themeHex || themePicker);
        return;
      }

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
        if (item.id === 'company' && res.data?.branding) {
          applyBranding(res.data.branding);
        }
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
      if (item.id === 'company') {
        const saved = savedPart('company');
        if (saved?.branding) applyBranding(saved.branding);
      }
      page.api.refresh();
    }

    const onClick = (e) => {
      const sw = e.target.closest('[data-sp-toggle]');
      if (sw) { onToggle(sw); return; }
      if (e.target.closest('[data-st-retry]')) { const item = current(); if (item) { failed.delete(item.id); page.api.refresh(); ensureDetail(item); } return; }

      const brandAct = e.target.closest('[data-st-brand-act]')?.dataset.stBrandAct;
      if (brandAct) {
        handleBrandAction(brandAct);
        return;
      }

      const presetBtn = e.target.closest('[data-st-color-preset]');
      if (presetBtn) {
        handleColorPreset(presetBtn.dataset.stColorPreset, presetBtn.dataset.stColorTarget || 'brand');
        return;
      }

      const act = e.target.closest('[data-sp-act]')?.dataset.spAct;
      if (act === 'save') save(); else if (act === 'discard') discard();
    };

    const onChange = (e) => {
      if (e.target.id === 'st-logo-file-input') {
        const file = e.target.files?.[0];
        if (file) processLogoFile(file);
      }
    };

    const onDragOver = (e) => {
      const dz = e.target.closest('.st-brand-dropzone');
      if (!dz) return;
      e.preventDefault();
      dz.classList.add('is-dragover');
    };

    const onDragLeave = (e) => {
      const dz = e.target.closest('.st-brand-dropzone');
      if (!dz) return;
      dz.classList.remove('is-dragover');
    };

    const onDrop = (e) => {
      const dz = e.target.closest('.st-brand-dropzone');
      if (!dz) return;
      e.preventDefault();
      dz.classList.remove('is-dragover');
      const file = e.dataTransfer?.files?.[0];
      if (file) processLogoFile(file);
    };

    host.addEventListener('click', onClick);
    host.addEventListener('input', onInput);
    host.addEventListener('change', onChange);
    host.addEventListener('dragover', onDragOver);
    host.addEventListener('dragleave', onDragLeave);
    host.addEventListener('drop', onDrop);

    return {
      destroy() {
        host.removeEventListener('click', onClick);
        host.removeEventListener('input', onInput);
        host.removeEventListener('change', onChange);
        host.removeEventListener('dragover', onDragOver);
        host.removeEventListener('dragleave', onDragLeave);
        host.removeEventListener('drop', onDrop);
        page.destroy();
      },
      isDirty,
    };
  },
};

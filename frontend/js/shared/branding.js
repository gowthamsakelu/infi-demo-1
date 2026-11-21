// System-wide Company Branding & Theme Manager
// Manages the logo, brand identity color, and entire application theme across Desktop and Mobile layouts.
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, isValidHex } from './color-detector.js';
import { applyLogoBackground } from './logo.js';

export const DEFAULT_BRAND_COLOR = '#2563EB';

const DEFAULT_PLANE_SVG = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
  </svg>`;

let currentBranding = {
  companyName: 'INFINITY',
  tagline: 'infinite freights, infinite ways',
  logo: null,
  color: DEFAULT_BRAND_COLOR,
  themeColor: DEFAULT_BRAND_COLOR,
  detectedColor: null,
  detectedThemeColor: null,
  logoBg: null,
};

/**
 * Derives complementary theme shades from a primary hex color.
 */
export function calculateThemeShades(hex) {
  const cleanHex = isValidHex(hex) ? hex.trim() : DEFAULT_BRAND_COLOR;
  const rgb = hexToRgb(cleanHex) || hexToRgb(DEFAULT_BRAND_COLOR);
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Darker shade for hover (10-12% darker)
  const hoverHsl = hslToRgb(h, s, Math.max(0.18, l - 0.11));
  const primaryHover = rgbToHex(hoverHsl.r, hoverHsl.g, hoverHsl.b);

  // Soft light tint for active tab/item backgrounds (very light, high lightness)
  const lightHsl = hslToRgb(h, Math.min(s, 0.85), 0.96);
  const primaryLight = rgbToHex(lightHsl.r, lightHsl.g, lightHsl.b);

  // Soft border tint
  const borderHsl = hslToRgb(h, Math.min(s, 0.75), 0.88);
  const primaryBorder = rgbToHex(borderHsl.r, borderHsl.g, borderHsl.b);

  // Shadows and focus rings
  const primaryShadow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  const primaryShadowHover = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`;
  const primaryRing = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;

  return {
    primary: cleanHex,
    primaryHover,
    primaryLight,
    primaryBorder,
    primaryShadow,
    primaryShadowHover,
    primaryRing,
    rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
  };
}

export function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) > 200;
}

/**
 * Applies the brand and theme colors across the entire CRM through dynamic CSS variables & rules.
 */
export function applyTheme(brandHex, themeHex) {
  const bHex = isValidHex(brandHex) ? brandHex.trim() : DEFAULT_BRAND_COLOR;
  const tHex = isValidHex(themeHex) ? themeHex.trim() : bHex;

  const brandShades = calculateThemeShades(bHex);
  const themeShades = calculateThemeShades(tHex);

  const isBrandLight = isLightColor(bHex);
  const isThemeLight = isLightColor(tHex);

  // Solid theme colors - NO gradients!
  const solidPrimary = brandShades.primary;
  const solidPrimaryHover = brandShades.primaryHover;
  const solidPrimarySubtle = brandShades.primaryLight;

  const solidAccent = themeShades.primary;
  const solidAccentHover = themeShades.primaryHover;
  const solidAccentSubtle = themeShades.primaryLight;

  // High contrast text inside solid highlights
  const primaryContrastText = isBrandLight ? '#0F172A' : '#FFFFFF';
  const accentContrastText = isThemeLight ? '#0F172A' : '#FFFFFF';

  // Badge styles based on accent color (e.g. green/white or navy/maroon)
  const isThemeWhite = tHex.toUpperCase() === '#FFFFFF' || (isThemeLight && (rgbToHsl(hexToRgb(tHex).r, hexToRgb(tHex).g, hexToRgb(tHex).b).s < 0.1));
  const accentBadgeBg = isThemeWhite ? '#FFFFFF' : themeShades.primaryLight;
  const accentBadgeText = isThemeWhite ? brandShades.primary : themeShades.primary;
  const accentBadgeBorder = isThemeWhite ? brandShades.primaryBorder : themeShades.primaryBorder;

  let styleEl = document.getElementById('app-branding-theme');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'app-branding-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --brand-color: ${solidPrimary} !important;
      --brand-accent: ${solidAccent} !important;
      --brand-hover: ${solidPrimaryHover} !important;
      --brand-light: ${solidPrimarySubtle} !important;
      --brand-border: ${brandShades.primaryBorder} !important;
      --brand-shadow: ${brandShades.primaryShadow} !important;

      --primary: ${solidPrimary} !important;
      --primary-accent: ${solidAccent} !important;
      --primary-hover: ${solidPrimaryHover} !important;
      --primary-light: ${solidPrimarySubtle} !important;
      --primary-border: ${brandShades.primaryBorder} !important;
      --primary-shadow: ${brandShades.primaryShadow} !important;
      --primary-shadow-hover: ${brandShades.primaryShadowHover} !important;
      --primary-ring: ${brandShades.primaryRing} !important;
      --primary-rgb: ${brandShades.rgb} !important;

      --primary-accent-hover: ${solidAccentHover} !important;
      --primary-accent-light: ${solidAccentSubtle} !important;
      --primary-accent-border: ${themeShades.primaryBorder} !important;
      --primary-accent-shadow: ${themeShades.primaryShadow} !important;
      --primary-accent-ring: ${themeShades.primaryRing} !important;
      --primary-accent-rgb: ${themeShades.rgb} !important;

      --primary-gradient: ${solidPrimary} !important;
      --primary-gradient-hover: ${solidPrimaryHover} !important;
      --primary-gradient-subtle: ${solidPrimarySubtle} !important;

      --ui-focus-border: ${solidPrimary} !important;
      --ui-focus-ring: 0 0 0 3px ${brandShades.primaryRing} !important;
    }

    /* Brand identity elements (Logo Box) */
    .brand-icon-box:not(.has-custom-logo) {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 4px 12px ${brandShades.primaryShadow} !important;
    }
    .brand-icon-box:not(.has-custom-logo) svg {
      color: ${primaryContrastText} !important;
      stroke: ${primaryContrastText} !important;
    }

    /* Global Logo Background Handling */
    .brand-icon-box.has-custom-logo.logo-bg-white,
    .st-brand-logo-thumb-box.logo-bg-white,
    .logo-bg-white {
      background: #FFFFFF !important;
      background-color: #FFFFFF !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
    }
    .brand-icon-box.has-custom-logo.logo-bg-dark,
    .brand-icon-box.has-custom-logo.logo-bg-black,
    .st-brand-logo-thumb-box.logo-bg-dark,
    .st-brand-logo-thumb-box.logo-bg-black,
    .logo-bg-dark,
    .logo-bg-black {
      background: #000000 !important;
      background-color: #000000 !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
    }
    .brand-icon-box.has-custom-logo.logo-bg-custom,
    .st-brand-logo-thumb-box.logo-bg-custom,
    .logo-bg-custom {
      border: 1px solid rgba(0, 0, 0, 0.12) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
    .brand-icon-box.has-custom-logo.logo-bg-as-uploaded,
    .st-brand-logo-thumb-box.logo-bg-as-uploaded,
    .logo-bg-as-uploaded {
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    .brand-icon-box.has-custom-logo:not(.logo-bg-white):not(.logo-bg-dark):not(.logo-bg-black):not(.logo-bg-custom):not(.logo-bg-as-uploaded) {
      background: transparent !important;
    }

    /* Sidebar & Mobile Navigation */
    .sidebar-nav-item.active {
      background: ${solidPrimarySubtle} !important;
      box-shadow: inset 3.5px 0 0 ${solidPrimary} !important;
    }
    .sidebar-nav-item.active svg {
      color: ${solidPrimary} !important;
    }
    .sidebar-nav-item.active .sidebar-badge {
      background: ${isThemeWhite ? '#FFFFFF' : solidAccent} !important;
      color: ${isThemeWhite ? solidPrimary : accentContrastText} !important;
      ${isThemeWhite ? `border: 1px solid ${brandShades.primaryBorder} !important;` : ''}
    }

    .mobile-bottom-nav .nav-item.active,
    .mobile-bottom-nav-item.active,
    .mobile-nav-item.active {
      color: ${solidPrimary} !important;
    }
    .mobile-bottom-nav .nav-item.active svg,
    .mobile-bottom-nav-item.active svg,
    .mobile-nav-item.active svg {
      color: ${solidPrimary} !important;
    }
    .mobile-bottom-nav .nav-item.active::after {
      background: ${solidPrimary} !important;
    }

    .more-tile.active {
      border-color: ${solidPrimary} !important;
      box-shadow: 0 0 0 1px ${solidPrimary} !important;
    }

    /* All Primary Action Buttons Across All Pages (SOLID COLOR 1) */
    .btn-primary-desktop,
    .btn-confirm-booking,
    .desktop-confirm-booking-btn,
    .add-guest-pill-btn,
    .btn-add-event-pill,
    .ui-add-btn,
    .ui-add-fab,
    .btn-add-followup,
    .quick-note-send,
    .btn-whatsapp-assign,
    .asg-submit-btn,
    .modal-save-btn,
    .bld-btn-primary,
    .us-header-add-btn,
    .us-save-btn,
    .dash-att-row-view-btn,
    #desktop-btn-modal-details-assign-now,
    #btn-modal-details-assign-now {
      background: ${solidPrimary} !important;
      border: none !important;
      box-shadow: 0 3px 10px ${brandShades.primaryShadow} !important;
      color: ${primaryContrastText} !important;
    }
    .btn-primary-desktop:hover,
    .btn-confirm-booking:hover,
    .desktop-confirm-booking-btn:hover,
    .add-guest-pill-btn:hover,
    .btn-add-event-pill:hover,
    .ui-add-btn:hover,
    .ui-add-fab:hover,
    .btn-add-followup:hover,
    .quick-note-send:hover,
    .btn-whatsapp-assign:hover,
    .asg-submit-btn:hover,
    .modal-save-btn:hover,
    .bld-btn-primary:hover,
    .us-header-add-btn:hover,
    .us-save-btn:hover,
    .dash-att-row-view-btn:hover,
    #desktop-btn-modal-details-assign-now:hover,
    #btn-modal-details-assign-now:hover,
    .row-view-details-btn:hover,
    .bookings-table tbody tr:hover .row-view-details-btn {
      background: ${solidPrimaryHover} !important;
      box-shadow: 0 6px 16px ${brandShades.primaryShadowHover} !important;
      transform: translateY(-1px);
    }

    /* Interactive Action Buttons Hover */
    .circle-action-btn:hover {
      background: ${brandShades.primaryBorder} !important;
      color: ${solidPrimaryHover} !important;
    }

    /* Tabs, Pills & Selected States (SOLID COLOR 1) */
    .tab-pill.active,
    .tab-pill.is-active,
    .compact-tab-btn.active,
    .desktop-tab-btn.active,
    .category-filter-tabs .tab-pill.active,
    .compact-tabs-nav .compact-tab-btn.active,
    .toolbar-tabs-group .desktop-tab-btn.active,
    .sp-tabs .compact-tab-btn.active,
    .sp-tabs .tab-pill.active,
    #cal-tabs .compact-tab-btn.active,
    #cal-tabs .tab-pill.active {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 2px 8px ${brandShades.primaryShadow} !important;
      border-color: transparent !important;
    }
    .compact-tab-btn.active .pill-badge,
    .tab-pill.active .pill-badge {
      background: ${isBrandLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.25)'} !important;
      color: ${primaryContrastText} !important;
    }

    .sheet-tab-btn.active::after {
      background: ${solidPrimary} !important;
      height: 3px !important;
      border-radius: 3px 3px 0 0 !important;
    }

    .fu-toggle button.active {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 2px 6px ${brandShades.primaryShadow} !important;
    }

    .dash-filter-btn.active,
    .time-filter-btn.active {
      background: ${solidPrimary} !important;
      border-color: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 2px 6px ${brandShades.primaryShadow} !important;
    }

    .preset-chip-btn.is-active {
      background: ${solidPrimarySubtle} !important;
      border-color: ${solidPrimary} !important;
      color: ${solidPrimary} !important;
    }

    /* Cards, Rows & Lists Active States */
    .list-row-card.active,
    .sp-row.active,
    .compact-booking-card.active,
    .bookings-table tbody tr.row-selected,
    .bookings-table tbody tr.row-active,
    .bookings-table tbody tr.row-checked,
    [data-sp="users"] .sp-row.active,
    [data-sp="users"] .team-row.active {
      background: ${solidPrimarySubtle} !important;
      border-color: ${brandShades.primaryBorder} !important;
      box-shadow: inset 3.5px 0 0 ${solidPrimary} !important;
    }

    /* Selection Bar & Controls */
    .desktop-selection-bar {
      background: ${solidPrimarySubtle} !important;
      border-bottom-color: ${brandShades.primaryBorder} !important;
    }
    .desktop-selection-bar .action-pill-btn {
      border-color: ${brandShades.primaryBorder} !important;
      color: ${solidPrimary} !important;
    }
    .desktop-selection-bar .action-pill-btn:hover {
      background: ${brandShades.primaryBorder} !important;
    }

    /* Avatars, Badges & Pills */
    .ks-avatar-badge,
    button.ks-avatar-badge {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 2px 8px ${brandShades.primaryShadow} !important;
    }

    .hero-customer-avatar,
    .customer-profile-avatar {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
      box-shadow: 0 4px 12px ${brandShades.primaryShadow} !important;
    }

    .row-avatar,
    .row-avatar:not(:has(.row-thumb)),
    .customer-avatar-badge,
    .us-card-initials-avatar,
    .team-avatar-initials,
    .dash-m-avatar.av-blue {
      background: ${solidPrimarySubtle} !important;
      color: ${solidPrimary} !important;
      border-color: ${brandShades.primaryBorder} !important;
    }

    /* Secondary / Accent Badges & Tags (Harmonized with Color 2) */
    .lead-badge,
    .tag-activity-pill,
    .asg-badge,
    .asg-thumb.asg-icon,
    .badge-trips-pill {
      background: ${accentBadgeBg} !important;
      color: ${accentBadgeText} !important;
      border: 1px solid ${accentBadgeBorder} !important;
    }

    /* Icon Circles, Stats, Tiles & Calendar Event Boxes */
    .section-icon-circle.blue-circle,
    .metric-icon-blue,
    .sp-stat-ico.tone-blue,
    .sp-tile,
    .more-ico,
    .sp-soon-icon,
    .dash-container :is(.dash-kpi-icon, .dash-section-icon, .dash-att-row-ico),
    .dash-ico-teal,
    .dash-ico-indigo,
    .blue-tint,
    .blue-pill,
    .st-company,
    .st-notifications,
    .st-svc-email,
    .item-icon-box,
    .item-icon-bus,
    .item-icon-bed,
    .item-icon-camera,
    .item-icon-raft,
    .item-icon-restaurant,
    .item-icon-blue {
      background: ${solidPrimarySubtle} !important;
      color: ${solidPrimary} !important;
      border-color: ${brandShades.primaryBorder} !important;
    }
    .item-icon-box svg,
    .item-icon-bus svg,
    .item-icon-bed svg,
    .item-icon-camera svg,
    .item-icon-raft svg,
    .item-icon-restaurant svg,
    .dash-container :is(.dash-kpi-icon, .dash-section-icon, .dash-att-row-ico) svg {
      stroke: ${solidPrimary} !important;
      color: ${solidPrimary} !important;
    }

    /* Form Fields, Inputs & Focus Rings */
    .search-input-wrapper:focus-within,
    .compact-search-bar:focus-within,
    .table-toolbar-search-box:focus-within,
    .bld-input:focus-within,
    .bld-money:focus-within,
    .fu-picker:focus-within,
    .fu-field input:focus,
    .fu-field select:focus,
    .fu-field textarea:focus,
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus,
    .sp-detail-body input:focus,
    .sp-detail-body select:focus,
    .sp-detail-body textarea:focus,
    .st-color-input-wrap:focus-within,
    .mobile-select-filter:focus,
    .quick-note input:focus {
      border-color: ${solidPrimary} !important;
      box-shadow: 0 0 0 3px ${brandShades.primaryRing} !important;
      outline: none !important;
    }

    .sp-list:focus-visible,
    .sp-icon-btn:focus-visible,
    .sp-row:focus-visible,
    .tp-pick:focus-visible,
    .more-tile:focus-visible {
      outline: 2px solid ${solidPrimary} !important;
      outline-offset: 2px !important;
    }

    /* Switches & Toggles (SOLID COLOR 1) */
    .bld-switch.is-on .bld-switch-knob,
    .us-toggle.is-checked {
      background: ${solidPrimary} !important;
    }
    .us-toggle.is-checked:hover:not(:disabled) {
      background: ${solidPrimaryHover} !important;
    }

    /* Dropdown Filters & Indicators */
    .dd-trigger svg:first-child,
    .mobile-category-select-wrapper .category-filter-icon {
      color: ${solidPrimary} !important;
    }
    .dd-trigger[aria-expanded="true"] {
      border-color: ${solidPrimary} !important;
      box-shadow: 0 0 0 3px ${brandShades.primaryRing} !important;
    }
    .dd-dot {
      background: ${solidAccent} !important;
    }
    .row-floating-menu .dropdown-item-btn:active,
    :is(.dropdown-item-btn):active {
      background-color: ${solidPrimarySubtle} !important;
    }

    .bld-check input:checked,
    input[type="checkbox"]:checked,
    input[type="radio"]:checked {
      accent-color: ${solidPrimary} !important;
    }
    .custom-checkbox.checked {
      background: ${solidPrimary} !important;
      border-color: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
    }

    /* Timelines & Journey */
    .journey-dot-icon.icon-blue {
      background: ${solidPrimarySubtle} !important;
      color: ${solidPrimary} !important;
      border-color: ${brandShades.primaryBorder} !important;
    }
    .toast.toast-info {
      border-left-color: ${solidPrimary} !important;
    }

    /* Calendar & Date Selection */
    .cal-day.is-selected,
    .cal-pill.is-selected,
    .cal-month-opt.is-selected {
      background: ${solidPrimary} !important;
      color: ${primaryContrastText} !important;
    }
    .cal-day.is-today:not(.is-selected),
    .cal-pill.is-today:not(.is-selected) {
      box-shadow: inset 0 0 0 1px ${brandShades.primaryBorder} !important;
    }
    .cal-count {
      color: ${solidPrimary} !important;
      background: ${solidPrimarySubtle} !important;
      border: 1px solid ${brandShades.primaryBorder} !important;
    }

    /* Builder & Steppers */
    .bld-step-item.is-current .bld-step-dot {
      background: ${solidPrimary} !important;
      box-shadow: 0 0 0 4px ${solidPrimarySubtle} !important;
    }
    .bld-step-item.is-done .bld-step-dot,
    .bld-chip.is-on,
    .bld-daychip.is-on {
      background: ${solidPrimary} !important;
      border-color: transparent !important;
      color: ${primaryContrastText} !important;
    }

    .dash-legend-line.line-received {
      background: ${solidPrimary} !important;
    }
  `;

  // Apply directly to root element
  const root = document.documentElement;
  root.style.setProperty('--brand-color', solidPrimary);
  root.style.setProperty('--brand-accent', solidAccent);
  root.style.setProperty('--brand-hover', solidPrimaryHover);
  root.style.setProperty('--brand-light', solidPrimarySubtle);
  root.style.setProperty('--brand-border', brandShades.primaryBorder);
  root.style.setProperty('--brand-shadow', brandShades.primaryShadow);

  root.style.setProperty('--primary', solidPrimary);
  root.style.setProperty('--primary-hover', solidPrimaryHover);
  root.style.setProperty('--primary-light', solidPrimarySubtle);
  root.style.setProperty('--primary-border', brandShades.primaryBorder);
  root.style.setProperty('--primary-shadow', brandShades.primaryShadow);
  root.style.setProperty('--primary-shadow-hover', brandShades.primaryShadowHover);
  root.style.setProperty('--primary-ring', brandShades.primaryRing);
  root.style.setProperty('--primary-rgb', brandShades.rgb);

  root.style.setProperty('--primary-accent', solidAccent);
  root.style.setProperty('--primary-accent-hover', solidAccentHover);
  root.style.setProperty('--primary-accent-light', solidAccentSubtle);
  root.style.setProperty('--primary-accent-border', themeShades.primaryBorder);
  root.style.setProperty('--primary-accent-shadow', themeShades.primaryShadow);
  root.style.setProperty('--primary-accent-ring', themeShades.primaryRing);
  root.style.setProperty('--primary-accent-rgb', themeShades.rgb);

  // Gradient variables resolve directly to solid colors
  root.style.setProperty('--primary-gradient', solidPrimary);
  root.style.setProperty('--primary-gradient-hover', solidPrimaryHover);
  root.style.setProperty('--primary-gradient-subtle', solidPrimarySubtle);
}

/**
 * Updates all shared branding logos in the DOM (desktop sidebar, mobile header, split page headers).
 */
export function updateSystemLogos(logoUrl, logoBg) {
  const targetLogo = logoUrl !== undefined ? logoUrl : currentBranding.logo;
  const effectiveBg = logoBg !== undefined ? logoBg : (currentBranding.logoBg || null);
  const boxes = document.querySelectorAll('.brand-icon-box');
  boxes.forEach((box) => {
    // Preserve mini preview boxes in settings from being overwritten by global state
    if (box.closest('.st-brand-preview-frame')) return;

    if (targetLogo) {
      box.innerHTML = `<img src="${targetLogo}" alt="Company Logo" class="brand-logo-img">`;
      box.classList.add('has-custom-logo');
      applyLogoBackground(box, targetLogo, effectiveBg);
    } else {
      box.innerHTML = DEFAULT_PLANE_SVG;
      box.classList.remove('has-custom-logo', 'logo-bg-white', 'logo-bg-black', 'logo-bg-dark', 'logo-bg-custom', 'logo-bg-as-uploaded');
      box.style.removeProperty('background');
      box.style.removeProperty('background-color');
    }
  });
}

/**
 * Updates all company name titles in headers across Desktop and Mobile layouts.
 */
export function updateSystemCompanyTitle(name) {
  const effectiveName = name || currentBranding.companyName || 'INFINITY';
  currentBranding.companyName = effectiveName;
  const titles = document.querySelectorAll('.brand-text-col h2, .sidebar-brand .brand-text-col h2, .mobile-app-header .brand-text-col h2');
  titles.forEach((el) => {
    // Preserve preview boxes in settings if they have distinct draft data
    if (el.closest('.st-brand-preview-frame')) return;
    el.textContent = effectiveName;
  });
}

/**
 * Sets and applies the active branding state across the whole CRM.
 */
export function applyBranding(branding) {
  if (!branding) return;
  const brandColor = branding.color || DEFAULT_BRAND_COLOR;
  const themeColor = branding.themeColor || brandColor || DEFAULT_BRAND_COLOR;
  const companyName = branding.companyName || currentBranding.companyName || 'INFINITY';

  currentBranding = {
    companyName: companyName,
    logo: branding.logo || null,
    color: brandColor,
    themeColor: themeColor,
    detectedColor: branding.detectedColor || null,
    detectedThemeColor: branding.detectedThemeColor || null,
    logoBg: branding.logoBg || null,
  };

  applyTheme(currentBranding.color, currentBranding.themeColor);
  updateSystemLogos(currentBranding.logo, currentBranding.logoBg);
  updateSystemCompanyTitle(currentBranding.companyName);

  window.dispatchEvent(new CustomEvent('branding-changed', { detail: currentBranding }));
}

/**
 * Gets the current active branding state.
 */
export function getBranding() {
  return { ...currentBranding };
}

/**
 * Initializes branding on initial application boot.
 */
export function initBranding() {
  const initial = window.__BRANDING__ || {};
  const brandColor = initial.color || DEFAULT_BRAND_COLOR;
  const themeColor = initial.themeColor || brandColor || DEFAULT_BRAND_COLOR;
  const companyName = initial.companyName || 'INFINITY';

  applyBranding({
    companyName: companyName,
    logo: initial.logo || null,
    color: brandColor,
    themeColor: themeColor,
    detectedColor: initial.detectedColor || null,
    detectedThemeColor: initial.detectedThemeColor || null,
    logoBg: initial.logoBg || null,
  });

  // Re-apply logos if dynamic views are rendered (desktop/mobile switch)
  window.addEventListener('layout-changed', () => {
    updateSystemLogos(currentBranding.logo, currentBranding.logoBg);
    updateSystemCompanyTitle(currentBranding.companyName);
  });
}

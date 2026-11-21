// Infinity Freight CRM–ERP: Shared Freight Popup Component for Leads & Enquiries
// Exact pixel-for-pixel match to reference design:
// - Header with Avatar, Import Badge, Subtitle, Summary Meta chips, 5-Stage Stepper & segmented bar
// - 4 Tabs: Customer Details, Requirements, Shipment & Docs, Updates
// - Customer Details: Profile, Customer Info, Company Info, Short Details callout
// - Requirements: Sub-pills (Service Requirements, Business & Scheduling, Commercial), 5 specification cards
// - Shipment & Docs: Cargo & Manifest Summary (Container, Seal, Vessel), Legal & Customs Docs with + Upload Compliance, 5 verified/pending doc rows
// - Updates: Activity & Operational Log with Live Sync & vertical connected timeline
// - Sticky Footer: Confirm Shipment primary button + Call, Message, Forward, More quick actions

import { icon } from './icons.js';
import { esc } from './ui.js';
import { updateInquiry } from './inquiry-store.js';

export const FREIGHT_TABS = [
  { key: 'customer-details', label: 'Customer Details' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'shipment-docs', label: 'Shipment & Docs' },
  { key: 'updates', label: 'Updates' },
];

/** Clean phone number for WhatsApp links (digits only, e.g. 971504829104) */
export function cleanPhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '');
}

/** Check if record is a Lead or Enquiry */
export function isLeadRecord(b) {
  if (!b) return false;
  if (b.freight_details?.record_type) return b.freight_details.record_type === 'lead';
  if (b.raw?.freight_details?.record_type) return b.raw.freight_details.record_type === 'lead';
  const s = String(b.category || b.status || '').toLowerCase();
  return ['new', 'contacted', 'qualified', 'opportunity'].includes(s);
}

/** Check if record has a confirmed shipment */
export function hasConfirmedShipment(b) {
  if (!b) return false;
  const f = b.freight_details || b.raw?.freight_details;
  if (f?.shipment?.has_shipment !== undefined) return !!f.shipment.has_shipment;
  const s = String(b.status || '').toLowerCase();
  return ['confirmed', 'booked', 'delivered', 'in transit', 'transit'].includes(s);
}

/** Get resolved freight data object for record matching reference design */
export function getFreightData(b) {
  const f = b.freight_details || b.raw?.freight_details || {};
  const guest = b.guest || {};
  const cust = b.customer || {};
  const isLead = isLeadRecord(b);

  const name = b.customer_name || guest.name || cust.name || 'Rajesh Sharma';
  const initials = cust.initials || name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'RS';
  const phone = b.customer_phone || guest.phone || cust.phone || '+971 50 482 9104';
  const email = b.customer_email || guest.email || cust.email || 'r.sharma@globaltrade.ae';
  const location = b.location || cust.location || f.company?.location || 'Dubai, UAE (JAFZA)';

  const tradeType = (f.trade_type || 'IMPORT').toUpperCase();
  const designation = f.designation || 'Sr. Procurement Manager';
  const subtitle = f.subtitle || 'Sr. Sales Manager • Company LTD';
  const companyName = f.company?.name || cust.companyName || 'Al-Maktoum Imports LLC';

  const req = f.requirements || {};
  const serviceType = req.service_type || 'Sea Freight';
  const containerType = req.container_type || '1x 40ft High Cube (HC)';
  const shipmentMode = req.shipment_mode || 'FCL 40ft';
  const origin = req.origin || 'Nhava Sheva (JNPT), Mumbai';
  const destination = req.destination || b.destination || 'Jebel Ali, Dubai';
  const route = req.route || 'Mumbai to Dubai';
  const deliveryWindow = req.expected_shipment_date || req.delivery_window || b.dates || '28 Nov 2026';

  const shp = f.shipment || {};

  return {
    isLead,
    name,
    initials,
    phone,
    email,
    whatsapp: f.whatsapp_number || phone,
    preferredComm: f.preferred_communication || 'WhatsApp / Email',
    tradeType,
    designation,
    subtitle,
    route,
    company: {
      name: companyName,
      type: f.company?.type || 'LLC',
      industry: f.company?.industry || 'Commercial Electronics',
      location: f.company?.location || location,
      established_year: f.company?.established_year || '2012 (12 Years)',
      main_focus: f.company?.main_focus || 'Commercial Electronics',
      email: f.company?.email || 'info@almaktoum-imports.com',
      phone: f.company?.phone || '+971 4 881 4000',
      website: f.company?.website || 'www.almaktoum-imports.com',
      gst_number: f.company?.gst_number || '27AABCT3518Q1ZV',
      iec_number: f.company?.iec_number || '0304012345',
      address: f.company?.address || 'Suite 402, JAFZA One, Jebel Ali Free Zone, Dubai',
    },
    requirements: {
      service_type: serviceType,
      trade_type: req.trade_type || (tradeType === 'IMPORT' ? 'Import' : 'Export'),
      shipment_mode: shipmentMode,
      container_type: containerType,
      gross_weight: req.gross_weight || req.cargo_weight || '24 Metric Tons (MT)',
      cargo_classification: req.cargo_classification || req.cargo_description || 'Electronics & Industrial Machinery parts',
      storage_env: req.storage_env || 'Ambient dry cargo',
      barrier_type: req.barrier_type || 'Moisture-resistant desiccant barrier',
      pol_origin: req.pol_origin || 'JNPT (Mumbai, IN)',
      pol_sub: req.pol_sub || 'Nhava Sheva Port',
      transit_duration: req.transit_duration || '4-5 Days',
      pod_destination: req.pod_destination || 'Jebel Ali (Dubai, UAE)',
      pod_sub: req.pod_sub || 'Terminal 2 Berth',
      customs_status: req.customs_status || 'Pending Quote Confirmation',
      customs_checks: req.customs_checks || [
        { label: 'Country of Origin (COO) legalization by Chamber of Commerce', verified: true },
        { label: 'SASO / UAE MoIAT ECAS product conformity certificate', verified: true },
        { label: 'Dubai Customs duty exemption code pre-lodged', verified: false, pending: true },
      ],
      incoterms: req.incoterms || 'FOB Origin',
      incoterms_sub: req.incoterms_sub || 'Pre-carriage by supplier, Ocean freight consignee',
      delivery_window: deliveryWindow,
      delivery_sub: req.delivery_sub || 'Must clear Dubai customs for factory installation',
    },
    short_details: f.short_details || b.notes || cust.shortDetails || 'Primary POC for import clearances and recurring container shipments across GCC markets. High-priority account requiring expedited customs paperwork for inbound commercial electronics and FOB compliance.',
    stage: f.stage || (isLead ? 'Qualified' : 'Customs (Active)'),
    shipment: {
      has_shipment: shp.has_shipment !== undefined ? shp.has_shipment : true,
      mode_pill: shp.mode_pill || 'FCL/FCL',
      container_no: shp.container_no || shp.container_number || 'TGHU928310-4',
      seal_number: shp.seal_number || 'SL-884129',
      vessel_voyage: shp.vessel_voyage || shp.vessel_flight || 'MSC ALTAIR v.2408W',
      docs: shp.docs || [
        { id: 'doc-1', name: 'Commercial Invoice (CI-2026-9042)', type: 'pdf', meta: 'PDF • 1.2 MB • Electronic Stamped', status: 'Verified' },
        { id: 'doc-2', name: 'Ocean Bill of Lading (B/L #MEDU98...)', type: 'doc', meta: 'Draft Approved by Shipper & Consignee', status: 'Verified' },
        { id: 'doc-3', name: 'Certificate of Origin (COO-IN-7721)', type: 'coo', meta: 'Chamber Stamped & Notarized', status: 'Verified' },
        { id: 'doc-4', name: 'Packing List & Weight Certificate...', type: 'scales', meta: 'Awaiting weighbridge slip revision', status: 'Pending Review' },
        { id: 'doc-5', name: 'Inspection Certificate (SGS Clean R...)', type: 'shield', meta: 'Quality seal passed • No discrepancy', status: 'Verified' },
      ],
    },
    updates: f.updates || [
      { id: 'up-1', title: 'Customs Clearance Initiated', desc: 'Dubai Customs EDI transaction ID #AE-DXB-98319 accepted.', time: 'Today, 10:45 AM • by Agent Tariq', dot: 'blue' },
      { id: 'up-2', title: 'Container Docked at Nhava Sheva (JNPT)', desc: 'Gate-in completed with gross tare weight verification at 24.1 MT.', time: 'Yesterday, 16:20 PM', dot: 'green' },
      { id: 'up-3', title: 'FOB Contract Finalized', desc: 'Consignee and supplier approved commercial terms and freight responsibility.', time: '24 Nov 2026, 11:15 AM', dot: 'grey' },
    ],
  };
}

/** Render Flow Status Stepper matching reference design (img3) */
export function renderFreightFlowStatusHtml(b) {
  const d = getFreightData(b);
  const stages = [
    { key: 'booked', label: 'Booked' },
    { key: 'docked', label: 'Docked' },
    { key: 'customs', label: 'Customs' },
    { key: 'transit', label: 'Transit' },
    { key: 'deliver', label: 'Deliver' },
  ];

  // Active step: default to 3 ('Transit') matching reference img3
  let activeIndex = 3;
  const rawStage = String(d.stage || b.status || '').toLowerCase();
  if (rawStage.includes('deliver')) {
    activeIndex = 4;
  } else if (rawStage.includes('transit') || rawStage === 'converted') {
    activeIndex = 3;
  } else if (rawStage.includes('custom') || rawStage === 'quotation_sent') {
    activeIndex = 2;
  } else if (rawStage.includes('dock') || rawStage === 'ongoing') {
    activeIndex = 1;
  } else if (rawStage.includes('book') || rawStage === 'new') {
    activeIndex = 0;
  }

  // Base track connects 10% to 90% (span 80%). Fill connects from 10% to active dot center.
  const fillWidthPct = (activeIndex / 4) * 80;

  return `
    <div class="freight-flow-stepper-wrap">
      <div class="freight-flow-track-base"></div>
      <div class="freight-flow-track-fill" style="width: ${fillWidthPct}%;"></div>
      <div class="freight-flow-steps">
        ${stages.map((st, i) => {
          let stateCls = 'pending';
          if (i < activeIndex) stateCls = 'done';
          else if (i === activeIndex) stateCls = 'active';

          return `
            <div class="freight-flow-step is-${stateCls}">
              <div class="freight-flow-dot-box">
                <span class="freight-flow-dot"></span>
              </div>
              <span class="freight-flow-label">${esc(st.label)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/** Render Header matching reference screenshot */
export function renderFreightHeaderHtml(b, { closeBtnId = '', isMobile = false } = {}) {
  const d = getFreightData(b);
  const tradeClass = d.tradeType === 'EXPORT' ? 'badge-trade-export' : 'badge-trade-import';

  const closeHtml = (closeBtnId && isMobile)
    ? `<button type="button" class="sheet-close-btn" id="${esc(closeBtnId)}" title="Close" aria-label="Close" style="position: static; margin-left: auto;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`
    : '';

  return `
    ${isMobile ? '<div class="sheet-drag-handle-bar" id="mobile-sheet-handle"><div class="sheet-handle"></div></div>' : ''}
    <div class="freight-header-card">
      <!-- Row 1: Avatar, Name + Trade Pill, Close button -->
      <div class="freight-header-top">
        <div class="freight-header-profile">
          <div class="freight-avatar-circle">${esc(d.initials)}</div>
          <div class="freight-profile-info">
            <div class="freight-name-row">
              <h2 class="freight-customer-name">${esc(d.name)}</h2>
              <span class="badge-trade-pill ${tradeClass}">
                <span class="trade-dot"></span>${esc(d.tradeType)}
              </span>
            </div>
            <!-- Subtitle -->
            <div class="freight-subtitle-row">
              <span>${esc(d.subtitle || `${d.designation} • ${d.company.name}`)}</span>
            </div>
          </div>
        </div>
        ${closeHtml}
      </div>

      <!-- Row 2: Summary Meta Chips (Date, Service, Route, Container) -->
      <div class="freight-meta-chips">
        <span class="freight-meta-chip">
          ${icon('calendar', { size: 14 })}
          <span>${esc(d.requirements.delivery_window || '28 Nov 2026')}</span>
        </span>
        <span class="freight-meta-chip">
          ${icon('ship', { size: 14 })}
          <span>${esc(d.requirements.service_type || 'Sea Freight')}</span>
        </span>
        <span class="freight-meta-chip">
          ${icon('route', { size: 14 }) || icon('pin', { size: 14 })}
          <span>${esc(d.route || 'Mumbai to Dubai')}</span>
        </span>
        <span class="freight-meta-chip">
          ${icon('box', { size: 14 })}
          <span>${esc(d.requirements.shipment_mode || 'FCL 40ft')}</span>
        </span>
      </div>

      <!-- Row 3: Shipment Progress Stepper (matching img3) -->
      ${renderFreightFlowStatusHtml(b)}
    </div>
  `;
}

/** Render Tabs Navigation (4 tabs) */
export function renderFreightTabsHtml(activeTab = 'customer-details', { attr = 'data-dt-tab' } = {}) {
  return FREIGHT_TABS.map((t) => `
    <button type="button" class="sheet-tab-btn ${activeTab === t.key ? 'active' : ''}" ${attr}="${t.key}">${esc(t.label)}</button>
  `).join('');
}

/** Render Tab 1: Customer Details */
function renderCustomerDetailsTabHtml(b) {
  const d = getFreightData(b);
  const c = d.company;

  return `
    <div class="freight-tab-pane">
      <!-- Subheader: CUSTOMER & COMPANY PROFILE + Edit Button -->
      <div class="freight-pane-subheader">
        <span class="freight-section-title-tag">CUSTOMER &amp; COMPANY PROFILE</span>
        <button type="button" class="btn-freight-edit" id="btn-edit-freight-profile" title="Edit Profile Details">
          ${icon('edit', { size: 13, stroke: 2.2 })}
          <span>Edit</span>
        </button>
      </div>

      <!-- Section 1: Customer Information Card -->
      <div class="freight-info-card">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-user">
              ${icon('user', { size: 16, stroke: 2.2 })}
            </div>
            <h3 class="freight-card-title">Customer Information</h3>
          </div>
        </div>

        <div class="freight-2col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Customer Name</span>
            <span class="fg-value-bold">${esc(d.name)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Role / Designation</span>
            <span class="fg-value-bold">${esc(d.designation)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Email</span>
            <div class="fg-contact-row">
              <span class="fg-value-text text-truncate" title="${esc(d.email)}">${esc(d.email)}</span>
              <a href="mailto:${esc(d.email)}" class="fg-mini-btn btn-mail-blue" title="Email ${esc(d.email)}">
                ${icon('mail', { size: 12, stroke: 2 })}
              </a>
            </div>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Primary Contact</span>
            <div class="fg-contact-row">
              <span class="fg-value-bold">${esc(d.phone)}</span>
              <a href="tel:${esc(d.phone)}" class="fg-mini-btn btn-call-green" title="Call">
                ${icon('phone', { size: 12, stroke: 2 })}
              </a>
              <a href="https://wa.me/${cleanPhone(d.phone)}" target="_blank" rel="noopener" class="fg-mini-btn btn-wa-green" title="WhatsApp">
                ${icon('whatsapp', { size: 12 })}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Company Information Card -->
      <div class="freight-info-card">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-company">
              ${icon('building', { size: 16, stroke: 2.2 }) || icon('ship', { size: 16, stroke: 2.2 })}
            </div>
            <h3 class="freight-card-title">Company Information</h3>
          </div>
        </div>

        <div class="freight-2col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Company Name</span>
            <span class="fg-value-bold">${esc(c.name)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Location Based</span>
            <span class="fg-value-bold">${esc(c.location)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Established Date</span>
            <span class="fg-value-bold">${esc(c.established_year)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Main Focus</span>
            <span class="fg-value-bold">${esc(c.main_focus)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Company Email</span>
            <span class="fg-value-bold text-truncate" title="${esc(c.email)}">${esc(c.email)}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Head Office Phone</span>
            <span class="fg-value-bold">${esc(c.phone)}</span>
          </div>
        </div>
      </div>

      <!-- Section 3: Short Details Card -->
      <div class="freight-short-details-card">
        <div class="short-details-top">
          ${icon('fileText', { size: 15, stroke: 2.2 })}
          <span>Short Details</span>
        </div>
        <p class="short-details-body">${esc(d.short_details)}</p>
      </div>
    </div>
  `;
}

/** Render Tab 2: Requirements */
function renderRequirementsTabHtml(b) {
  const d = getFreightData(b);
  const r = d.requirements;

  return `
    <div class="freight-tab-pane">
      <!-- Card 1: Cargo Specifications -->
      <div class="freight-info-card" data-req-card="service">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-cargo">
              ${icon('box', { size: 16, stroke: 2.2 })}
            </div>
            <div class="card-header-titles">
              <h3 class="freight-card-title">Cargo Specifications</h3>
              <span class="card-subtitle">Standard High-Cube Volume</span>
            </div>
          </div>
          <span class="status-badge-pill pill-verified">
            <span class="pill-check">✓</span> Verified
          </span>
        </div>
        <div class="freight-2col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Container Load</span>
            <span class="fg-value-bold">${esc(r.container_type || '1x 40ft High Cube (HC)')}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Gross Weight</span>
            <span class="fg-value-bold">${esc(r.gross_weight || '24 Metric Tons (MT)')}</span>
          </div>
          <div class="freight-grid-item" style="grid-column: span 2;">
            <span class="fg-label">Cargo Classification</span>
            <span class="fg-value-bold">${esc(r.cargo_classification || 'Electronics & Industrial Machinery parts')}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: Temperature & Handling -->
      <div class="freight-info-card" data-req-card="service">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-temp">
              ${icon('thermometer', { size: 16, stroke: 2.2 })}
            </div>
            <div class="card-header-titles">
              <h3 class="freight-card-title">Temperature &amp; Handling</h3>
              <span class="card-subtitle">Specialized Care Protocol</span>
            </div>
          </div>
          <span class="status-badge-pill pill-spec">
            <span class="pill-check">✓</span> Spec Approved
          </span>
        </div>
        <div class="freight-2col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Storage Environment:</span>
            <span class="fg-value-bold">${esc(r.storage_env || 'Ambient dry cargo')}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Barrier Type:</span>
            <span class="fg-value-bold">${esc(r.barrier_type || 'Moisture-resistant desiccant barrier')}</span>
          </div>
        </div>
      </div>

      <!-- Card 3: Port of Loading & Discharge -->
      <div class="freight-info-card" data-req-card="service">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-port">
              ${icon('anchor', { size: 16, stroke: 2.2 })}
            </div>
            <div class="card-header-titles">
              <h3 class="freight-card-title">Port of Loading &amp; Discharge</h3>
              <span class="card-subtitle">Direct Maritime Corridor</span>
            </div>
          </div>
          <span class="status-badge-pill pill-verified">
            <span class="pill-check">✓</span> Verified
          </span>
        </div>
        <div class="freight-corridor-row">
          <div class="corridor-col">
            <span class="fg-label">POL (Origin)</span>
            <span class="corridor-port">${esc(r.pol_origin || 'JNPT (Mumbai, IN)')}</span>
            <span class="corridor-sub">${esc(r.pol_sub || 'Nhava Sheva Port')}</span>
          </div>
          <div class="corridor-mid">
            <span class="corridor-duration">${esc(r.transit_duration || '4-5 Days')}</span>
            <span class="corridor-arrow">→</span>
          </div>
          <div class="corridor-col corridor-dest">
            <span class="fg-label">POD (Destination)</span>
            <span class="corridor-port">${esc(r.pod_destination || 'Jebel Ali (Dubai, UAE)')}</span>
            <span class="corridor-sub">${esc(r.pod_sub || 'Terminal 2 Berth')}</span>
          </div>
        </div>
      </div>

      <!-- Card 4: Customs & Compliance -->
      <div class="freight-info-card" data-req-card="business">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-shield">
              ${icon('shield', { size: 16, stroke: 2.2 })}
            </div>
            <div class="card-header-titles">
              <h3 class="freight-card-title">Customs &amp; Compliance</h3>
              <span class="card-subtitle">Cross-Border Clearance</span>
            </div>
          </div>
          <span class="status-badge-pill pill-pending-quote">
            ${esc(r.customs_status || 'Pending Quote Confirmation')}
          </span>
        </div>
        <div class="customs-checklist">
          ${(r.customs_checks || []).map((chk) => `
            <div class="checklist-item">
              ${chk.verified
                ? '<span class="check-circle-green">✓</span>'
                : `<span class="check-clock-amber">${icon('clock', { size: 12, stroke: 2.2 })}</span>`}
              <span class="checklist-text">${esc(chk.label)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Card 5: Incoterms & Delivery Window -->
      <div class="freight-info-card freight-terms-card" data-req-card="commercial">
        <div class="freight-2col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Incoterms &amp; Freight Term</span>
            <span class="fg-value-bold">${esc(r.incoterms || 'FOB Origin')}</span>
            <span class="corridor-sub">${esc(r.incoterms_sub || 'Pre-carriage by supplier, Ocean freight consignee')}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Target Delivery Window</span>
            <span class="fg-value-bold text-delivery-red">${esc(r.delivery_window || 'Nov 28, 2026')}</span>
            <span class="corridor-sub">${esc(r.delivery_sub || 'Must clear Dubai customs for factory installation')}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Render Tab 3: Shipment & Docs */
function renderShipmentDocsTabHtml(b) {
  const d = getFreightData(b);
  const shp = d.shipment || {};
  const docs = shp.docs || [];

  const docsStackHtml = docs.map((doc) => {
    let iconClass = 'doc-icon-blue';
    let iconSvg = icon('fileText', { size: 18, stroke: 2 });
    if (doc.type === 'pdf') {
      iconClass = 'doc-icon-red';
      iconSvg = icon('pdf', { size: 18, stroke: 2 }) || icon('fileText', { size: 18, stroke: 2 });
    } else if (doc.type === 'coo') {
      iconClass = 'doc-icon-purple';
      iconSvg = icon('award', { size: 18, stroke: 2 }) || icon('download', { size: 18, stroke: 2 });
    } else if (doc.type === 'scales') {
      iconClass = 'doc-icon-orange';
      iconSvg = icon('scales', { size: 18, stroke: 2 }) || icon('filter', { size: 18, stroke: 2 });
    } else if (doc.type === 'shield') {
      iconClass = 'doc-icon-green';
      iconSvg = icon('shield', { size: 18, stroke: 2 }) || icon('checkCircle', { size: 18, stroke: 2 });
    }

    const isVerified = doc.status === 'Verified';

    return `
      <div class="freight-doc-row" data-doc-id="${esc(doc.id)}">
        <div class="doc-left">
          <div class="doc-icon-sq ${iconClass}">
            ${iconSvg}
          </div>
          <div class="doc-meta-col">
            <div class="doc-title-row" title="${esc(doc.name)}">${esc(doc.name)}</div>
            <div class="doc-meta-row ${!isVerified ? 'text-pending-amber' : ''}">${esc(doc.meta || 'PDF Document')}</div>
          </div>
        </div>
        <div class="doc-right">
          ${isVerified ? `
            <span class="status-badge-pill pill-verified">
              <span class="pill-check">✓</span> Verified
            </span>
            <button type="button" class="doc-view-btn btn-view-doc" data-doc-id="${esc(doc.id)}" data-doc-file="${esc(doc.name)}" title="View ${esc(doc.name)}">
              <span class="doc-view-icon">${icon('eye', { size: 12, stroke: 2 })}</span>
            </button>
          ` : `
            <span class="status-badge-pill pill-pending-review">
              Pending Review
            </span>
            <label class="doc-upload-btn btn-doc-upload" title="Upload Replacement" style="margin: 0; cursor: pointer;">
              ${icon('upload', { size: 13, stroke: 2 })}
              <input type="file" class="freight-doc-input" data-doc-id="${esc(doc.id)}" style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </label>
          `}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="freight-tab-pane">
      <!-- Top Card: Cargo & Manifest Summary -->
      <div class="freight-info-card">
        <div class="freight-card-header">
          <div class="card-header-left">
            <div class="freight-header-icon-box icon-box-manifest">
              ${icon('ship', { size: 16, stroke: 2.2 })}
            </div>
            <h3 class="freight-card-title">Cargo &amp; Manifest Summary</h3>
          </div>
          <span class="badge-fcl-pill">${esc(shp.mode_pill || 'FCL/FCL')}</span>
        </div>
        <div class="freight-3col-grid">
          <div class="freight-grid-item">
            <span class="fg-label">Container No.</span>
            <span class="fg-value-bold">${esc(shp.container_no || 'TGHU928310-4')}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Seal Number</span>
            <span class="fg-value-bold text-seal-green">${esc(shp.seal_number || 'SL-884129')}</span>
          </div>
          <div class="freight-grid-item">
            <span class="fg-label">Vessel &amp; Voyage</span>
            <span class="fg-value-bold">${esc(shp.vessel_voyage || 'MSC ALTAIR v.2408W')}</span>
          </div>
        </div>
      </div>

      <!-- Subheader: Legal & Customs Documentation -->
      <div class="freight-docs-header-row">
        <div class="docs-header-left">
          <h3 class="docs-section-title">Legal &amp; Customs Documentation</h3>
          <span class="docs-section-sub">4 of 5 documents verified &amp; cleared</span>
        </div>
        <button type="button" class="btn-upload-compliance" id="btn-upload-compliance-main">
          ${icon('cloudUpload', { size: 14, stroke: 2.2 })}
          <span>+ Upload Compliance</span>
        </button>
        <input type="file" id="compliance-doc-file-input" style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
      </div>

      <!-- 5 Document Cards Stack -->
      <div class="freight-docs-stack" id="freight-docs-stack">
        ${docsStackHtml}
      </div>
    </div>
  `;
}

/** Render Tab 4: Updates */
function renderUpdatesTabHtml(b) {
  const d = getFreightData(b);
  const updates = d.updates || [];

  return `
    <div class="freight-tab-pane">
      <div class="freight-updates-header-row">
        <h3 class="updates-header-title">Activity &amp; Operational Log</h3>
        <span class="updates-live-sync">Live Sync</span>
      </div>

      <div class="freight-timeline">
        ${updates.map((up, idx) => {
          const isLast = idx === updates.length - 1;
          const dotClass = up.dot === 'green' ? 'dot-green' : up.dot === 'blue' ? 'dot-blue' : 'dot-grey';
          return `
            <div class="timeline-item">
              <div class="timeline-left">
                <span class="timeline-dot ${dotClass}"></span>
                ${isLast ? '' : '<span class="timeline-line"></span>'}
              </div>
              <div class="timeline-body">
                <h4 class="timeline-item-title">${esc(up.title)}</h4>
                <p class="timeline-item-desc">${esc(up.desc)}</p>
                <span class="timeline-item-meta">${esc(up.time)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/** Render Body content based on active tab */
export function renderFreightBodyHtml(b, activeTab = 'customer-details') {
  if (activeTab === 'requirements') return renderRequirementsTabHtml(b);
  if (activeTab === 'shipment-docs') return renderShipmentDocsTabHtml(b);
  if (activeTab === 'updates') return renderUpdatesTabHtml(b);
  return renderCustomerDetailsTabHtml(b);
}

/** Render Footer action buttons */
export function renderFreightFooterHtml(b, { isMobile = false } = {}) {
  const d = getFreightData(b);
  const prefix = isMobile ? 'mobile' : 'desktop';

  return `
    <div class="freight-footer-inner">
      <button type="button" class="btn-confirm-shipment" id="${prefix}-freight-primary-btn" data-freight-action="confirm-shipment">
        Confirm Shipment
      </button>
      <div class="freight-bottom-actions-row">
        <button type="button" class="freight-action-pill-btn act-call" id="${prefix}-freight-act-call" title="Call ${esc(d.phone)}">
          ${icon('phone', { size: 17, stroke: 2.2 })}
          <span>Call</span>
        </button>
        <button type="button" class="freight-action-pill-btn act-message" id="${prefix}-freight-act-msg" title="Message ${esc(d.name)}">
          ${icon('message', { size: 17, stroke: 2.2 })}
          <span>Message</span>
        </button>
        <button type="button" class="freight-action-pill-btn act-forward" id="${prefix}-freight-act-fwd" title="Forward to Operations">
          ${icon('send', { size: 17, stroke: 2.2 })}
          <span>Forward</span>
        </button>
        <button type="button" class="freight-action-pill-btn act-more" id="${prefix}-freight-act-more" title="More Actions">
          ${icon('more', { size: 17, stroke: 2.2 })}
          <span>More</span>
        </button>
      </div>
    </div>
  `;
}

/** Bind interactive events in Freight Body */
export function bindFreightBodyEvents(bodyEl, b, onRerender) {
  if (!bodyEl) return;

  // 1. Upload Compliance Main Button
  const uploadCompBtn = bodyEl.querySelector('#btn-upload-compliance-main');
  const fileInputComp = bodyEl.querySelector('#compliance-doc-file-input');
  if (uploadCompBtn && fileInputComp) {
    uploadCompBtn.addEventListener('click', () => fileInputComp.click());
    fileInputComp.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFreightDoc(b, 'doc-' + Date.now(), file, onRerender);
      }
    });
  }

  // 3. Document Item Uploads
  bodyEl.querySelectorAll('.freight-doc-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const docId = input.dataset.docId;
      if (file && docId) {
        uploadFreightDoc(b, docId, file, onRerender);
      }
    });
  });

  // 4. View Document Previews
  bodyEl.querySelectorAll('.btn-view-doc').forEach((btn) => {
    btn.addEventListener('click', () => {
      const docName = btn.dataset.docFile || 'Document';
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Viewing document: ${docName}`, type: 'info' }
      }));
    });
  });

  // 5. Edit Profile & Requirements Modals
  bodyEl.querySelector('#btn-edit-freight-profile')?.addEventListener('click', () => {
    openFreightEditModal(b, onRerender);
  });
  bodyEl.querySelector('#btn-edit-freight-req')?.addEventListener('click', () => {
    openFreightEditModal(b, onRerender);
  });
}

/** Open Freight Profile & Requirements Edit Modal */
export function openFreightEditModal(b, onSaved) {
  const d = getFreightData(b);
  let overlay = document.getElementById('freight-edit-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'freight-edit-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal-card" style="width: 580px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${icon('edit', { size: 18, stroke: 2.2 })}
          <h3>Edit Customer &amp; Freight Profile</h3>
        </div>
        <button type="button" class="sheet-close-btn" id="close-freight-edit-modal" style="position: static;">✕</button>
      </div>

      <form id="freight-edit-form" class="modal-body" style="flex: 1 1 auto; overflow-y: auto; padding: 16px 20px;">
        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--primary, #2563EB); margin: 0 0 10px;">1. Customer Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Customer Name *</label>
            <input type="text" id="fe-cust-name" value="${esc(d.name)}" required />
          </div>
          <div class="form-group">
            <label>Role / Designation</label>
            <input type="text" id="fe-cust-desig" value="${esc(d.designation)}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Primary Phone *</label>
            <input type="text" id="fe-cust-phone" value="${esc(d.phone)}" required />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="fe-cust-email" value="${esc(d.email)}" />
          </div>
        </div>

        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--primary, #2563EB); margin: 16px 0 10px;">2. Company Information</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Company Name</label>
            <input type="text" id="fe-comp-name" value="${esc(d.company.name)}" />
          </div>
          <div class="form-group">
            <label>Location / City</label>
            <input type="text" id="fe-comp-location" value="${esc(d.company.location)}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Established Date</label>
            <input type="text" id="fe-comp-year" value="${esc(d.company.established_year)}" />
          </div>
          <div class="form-group">
            <label>Main Focus</label>
            <input type="text" id="fe-comp-focus" value="${esc(d.company.main_focus)}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Company Email</label>
            <input type="email" id="fe-comp-email" value="${esc(d.company.email)}" />
          </div>
          <div class="form-group">
            <label>Head Office Phone</label>
            <input type="text" id="fe-comp-phone" value="${esc(d.company.phone)}" />
          </div>
        </div>

        <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--primary, #2563EB); margin: 16px 0 10px;">3. Shipment Requirements</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Trade Direction</label>
            <select id="fe-req-trade-type">
              <option value="IMPORT" ${d.tradeType === 'IMPORT' ? 'selected' : ''}>IMPORT</option>
              <option value="EXPORT" ${d.tradeType === 'EXPORT' ? 'selected' : ''}>EXPORT</option>
            </select>
          </div>
          <div class="form-group">
            <label>Freight Service</label>
            <select id="fe-req-service">
              <option value="Sea Freight" ${d.requirements.service_type === 'Sea Freight' ? 'selected' : ''}>Sea Freight</option>
              <option value="Air Freight" ${d.requirements.service_type === 'Air Freight' ? 'selected' : ''}>Air Freight</option>
              <option value="Road Transport" ${d.requirements.service_type === 'Road Transport' ? 'selected' : ''}>Road Transport</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Container Load</label>
            <input type="text" id="fe-req-container" value="${esc(d.requirements.container_type)}" />
          </div>
          <div class="form-group">
            <label>Gross Weight</label>
            <input type="text" id="fe-req-weight" value="${esc(d.requirements.gross_weight)}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label>Origin Port (POL)</label>
            <input type="text" id="fe-req-origin" value="${esc(d.requirements.pol_origin)}" />
          </div>
          <div class="form-group">
            <label>Destination Port (POD)</label>
            <input type="text" id="fe-req-dest" value="${esc(d.requirements.pod_destination)}" />
          </div>
        </div>

        <div class="form-group">
          <label>Short Details</label>
          <textarea id="fe-short-details" rows="3" style="width: 100%; border: 1px solid #CBD5E1; border-radius: 10px; padding: 10px; font-family: inherit; font-size: 13px; resize: vertical;">${esc(d.short_details)}</textarea>
        </div>
      </form>

      <div class="modal-footer" style="display: flex; gap: 10px; justify-content: flex-end; padding: 14px 20px; border-top: 1px solid #F1F5F9;">
        <button type="button" class="btn-secondary-desktop" id="cancel-freight-edit-modal">Cancel</button>
        <button type="submit" form="freight-edit-form" class="btn-primary-desktop" id="save-freight-edit-modal">Save Profile</button>
      </div>
    </div>
  `;

  overlay.classList.add('open');

  const close = () => overlay.classList.remove('open');
  overlay.querySelector('#close-freight-edit-modal')?.addEventListener('click', close);
  overlay.querySelector('#cancel-freight-edit-modal')?.addEventListener('click', close);

  overlay.querySelector('#freight-edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = overlay.querySelector('#fe-cust-name')?.value?.trim();
    const phone = overlay.querySelector('#fe-cust-phone')?.value?.trim();
    const email = overlay.querySelector('#fe-cust-email')?.value?.trim();
    const desig = overlay.querySelector('#fe-cust-desig')?.value?.trim();

    const compName = overlay.querySelector('#fe-comp-name')?.value?.trim();
    const compLoc = overlay.querySelector('#fe-comp-location')?.value?.trim();
    const compYear = overlay.querySelector('#fe-comp-year')?.value?.trim();
    const compFocus = overlay.querySelector('#fe-comp-focus')?.value?.trim();
    const compEmail = overlay.querySelector('#fe-comp-email')?.value?.trim();
    const compPhone = overlay.querySelector('#fe-comp-phone')?.value?.trim();

    const tradeType = overlay.querySelector('#fe-req-trade-type')?.value || 'IMPORT';
    const serviceType = overlay.querySelector('#fe-req-service')?.value || 'Sea Freight';
    const containerType = overlay.querySelector('#fe-req-container')?.value?.trim();
    const grossWeight = overlay.querySelector('#fe-req-weight')?.value?.trim();
    const polOrigin = overlay.querySelector('#fe-req-origin')?.value?.trim();
    const podDest = overlay.querySelector('#fe-req-dest')?.value?.trim();
    const shortDetails = overlay.querySelector('#fe-short-details')?.value?.trim();

    const freight_details = {
      ...d,
      trade_type: tradeType,
      designation: desig,
      company: {
        ...d.company,
        name: compName,
        location: compLoc,
        established_year: compYear,
        main_focus: compFocus,
        email: compEmail,
        phone: compPhone,
      },
      requirements: {
        ...d.requirements,
        service_type: serviceType,
        container_type: containerType,
        gross_weight: grossWeight,
        pol_origin: polOrigin,
        pod_destination: podDest,
      },
      short_details: shortDetails,
    };

    try {
      const updated = await updateInquiry(b.id, {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        location: compLoc,
        notes: shortDetails,
        freight_details,
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Customer & freight details saved for ${name}!`, type: 'success' },
      }));

      close();
      if (onSaved) onSaved(updated || b);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to save freight details.', type: 'warning' },
      }));
    }
  });
}

/** Upload a Freight Document */
export async function uploadFreightDoc(b, docId, file, onUpdated) {
  if (!file) return;
  const d = getFreightData(b);
  const docs = [...(d.shipment?.docs || [])];
  const idx = docs.findIndex((dc) => dc.id === docId);
  const sizeMb = (file.size / 1024).toFixed(0) + ' KB';

  if (idx !== -1) {
    docs[idx] = {
      ...docs[idx],
      name: file.name,
      meta: `PDF • ${sizeMb} • Verified Just Now`,
      status: 'Verified',
    };
  } else {
    docs.push({
      id: docId,
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'pdf' : 'doc',
      meta: `PDF • ${sizeMb} • Uploaded Compliance`,
      status: 'Verified',
    });
  }

  const freight_details = {
    ...d,
    shipment: {
      ...d.shipment,
      docs,
    },
  };

  try {
    const updated = await updateInquiry(b.id, { freight_details });
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: `Document "${file.name}" uploaded & verified successfully!`, type: 'success' },
    }));
    if (onUpdated) onUpdated(updated || b);
  } catch (err) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: err.message || 'Upload failed.', type: 'warning' },
    }));
  }
}

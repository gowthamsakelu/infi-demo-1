// Draws the navigation from shared/nav.js: the PC sidebar groups and the phone "More" sheet, and keeps their active state and badges.
import { icon } from './icons.js';
import { esc } from './ui.js';
import { openSheet } from './sheet.js';
import { NAV, NAV_ITEMS, BOTTOM_BAR } from './nav.js';
import { goToPage } from './page-host.js';
import { currentPage } from './page-state.js';

/** The sidebar's four groups (Menu, Catalog, Website, System). */
export function sidebarNavHtml(active) {
  return NAV.map((group) => `
    <span class="nav-section-title">${esc(group.title)}</span>
    ${group.items.map((i) => `
      <a class="sidebar-nav-item ${i.key === active ? 'active' : ''}" href="#${i.key}" id="nav-${i.key}" data-nav="${i.key}" ${i.key === active ? 'aria-current="page"' : ''}>
        <div class="nav-left">${icon(i.icon, { size: 20, stroke: 2 })}<span>${esc(i.label)}</span></div>
        ${i.badgeId ? `<span class="sidebar-badge" id="${i.badgeId}">${esc(i.badge)}</span>` : ''}
      </a>`).join('')}`).join('');
}

/** Mark the open page in every place the navigation is drawn. */
export function syncNavActive(page = currentPage()) {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    const on = el.dataset.nav === page;
    el.classList.toggle('active', on);
    if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
  });
  // On the phone, "More" lights up for any page the bottom bar does not show.
  document.querySelectorAll('.mobile-bottom-nav [data-more]').forEach((el) => el.classList.toggle('active', !BOTTOM_BAR.includes(page)));
}

/** Sidebar links go through goToPage, which asks before leaving a page with unsaved changes. */
export function bindSidebar(root) {
  root.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-nav]');
    if (!link) return;
    e.preventDefault();
    goToPage(link.dataset.nav);
  });
}

/** The phone's "More" screen: every page the bottom bar does not show, in the same four groups. */
export function openMoreSheet({ returnFocus } = {}) {
  const groups = NAV.map((g) => ({ title: g.title === 'Menu' ? 'Operations' : g.title, items: g.items.filter((i) => !BOTTOM_BAR.includes(i.key)) })).filter((g) => g.items.length);
  const dlg = openSheet({
    label: 'More',
    cls: 'more-sheet',
    returnFocus,
    html: `<header class="asg-header"><h3>More</h3><button type="button" class="sheet-close-btn" data-sheet-close aria-label="Close">${icon('close', { size: 16, stroke: 2.5 })}</button></header>
      <div class="more-body">${groups.map((g) => `
        <section class="more-group"><h4>${esc(g.title)}</h4>
          <div class="more-grid">${g.items.map((i) => `
            <button type="button" class="more-tile ${i.key === currentPage() ? 'active' : ''}" data-nav="${i.key}">
              <span class="more-ico">${icon(i.icon, { size: 20 })}</span><span class="more-label">${esc(i.label)}</span>
            </button>`).join('')}</div>
        </section>`).join('')}</div>`,
  });
  dlg.ov.addEventListener('click', (e) => {
    const tile = e.target.closest('.more-tile');
    if (!tile) return;
    dlg.close();
    goToPage(tile.dataset.nav);
  });
  return dlg;
}

export { NAV_ITEMS };

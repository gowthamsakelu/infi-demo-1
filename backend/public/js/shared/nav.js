// The one list of pages: the PC sidebar, the phone bottom bar and the router all read it.
// `kind`: 'app' = the pages built into desktop.js / mobile.js; 'page' = a module in js/pages/<key>.js, mounted into the page host.

export const NAV = [
  {
    title: 'Menu',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'grid', kind: 'page' },
      { key: 'inquiries', label: 'Enquirey & Leads', icon: 'message', kind: 'app', badgeId: 'sidebar-inquiries-badge', badge: '8' },
      { key: 'customers', label: 'Customers', icon: 'users', kind: 'app', badgeId: 'sidebar-customers-badge', badge: '14' },
      { key: 'quotation', label: 'Quotation', icon: 'briefcase', kind: 'app', badgeId: 'sidebar-quotation-badge', badge: '12' },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((g) => g.items);
export const navItem = (key) => NAV_ITEMS.find((i) => i.key === key) || null;
/** Pages that live in the page host (a module each, or the "coming soon" card). */
export const isHostedPage = (key) => { const i = navItem(key); return !!i && i.kind !== 'app'; };
/** The four pages the phone's bottom bar and navigation show. */
export const BOTTOM_BAR = ['dashboard', 'inquiries', 'customers', 'quotation'];

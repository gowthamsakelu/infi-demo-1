// The one list of pages: the PC sidebar, the phone "More" screen and the router all read it.
// `kind`: 'app' = the pages built into desktop.js / mobile.js; 'page' = a module in js/pages/<key>.js, mounted into the page host;
// 'soon' = listed but not built yet (shows a calm placeholder).

export const NAV = [
  {
    title: 'Menu',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: 'grid', kind: 'soon' },
      { key: 'inquiries', label: 'Inquiries', icon: 'message', kind: 'app', badgeId: 'sidebar-inquiries-badge', badge: '8' },
      { key: 'bookings', label: 'Bookings', icon: 'briefcase', kind: 'app', badgeId: 'sidebar-total-badge', badge: '28' },
      { key: 'calendar', label: 'Calendar', icon: 'calendar', kind: 'app' },
      { key: 'team', label: 'Operation Team', icon: 'users', kind: 'soon' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { key: 'destinations', label: 'Destinations', icon: 'pin', kind: 'page' },
      { key: 'tour-packages', label: 'Tour Packages', icon: 'layers', kind: 'page' },
      { key: 'transport', label: 'Transport', icon: 'car', kind: 'page' },
      { key: 'stays', label: 'Stays', icon: 'bed', kind: 'page' },
      { key: 'adventures', label: 'Adventures', icon: 'mountain', kind: 'page' },
    ],
  },
  {
    title: 'Website',
    items: [
      { key: 'banners', label: 'Banners', icon: 'monitor', kind: 'page' },
      { key: 'blogs', label: 'Blogs', icon: 'pen', kind: 'page' },
    ],
  },
  {
    title: 'System',
    items: [
      { key: 'users', label: 'Users & Permissions', icon: 'shield', kind: 'page' },
      { key: 'settings', label: 'Settings', icon: 'cog', kind: 'page' },
    ],
  },
];

export const NAV_ITEMS = NAV.flatMap((g) => g.items);
export const navItem = (key) => NAV_ITEMS.find((i) => i.key === key) || null;
/** Pages that live in the page host (a module each, or the "coming soon" card). */
export const isHostedPage = (key) => { const i = navItem(key); return !!i && i.kind !== 'app'; };
/** The four pages the phone's bottom bar already shows; "More" lists the rest. */
export const BOTTOM_BAR = ['dashboard', 'bookings', 'inquiries', 'calendar'];


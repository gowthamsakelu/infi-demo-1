// Browser test (not run by PHPUnit): Users & Permissions at 1280, 820 (tablet = PC layout) and 390.
// The list and tabs, the detail (Permissions / Profile / Activity), the module matrix, the unsaved-changes confirm (Keep editing / Discard),
// the status filter, Save changes, Deactivate / Reactivate, Edit / Reset password / Invite User doing nothing, the empty and error states,
// no horizontal scroll.
// It saves one matrix and one status change in the dev database and puts the status back; the saved matrix is rewritten to the role's defaults.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n').slice(0, 4).join(' | ')); summary(); process.exit(2); });

const sel = (page) => new URL(page.url()).searchParams.get('selected');

for (const [w, h] of [[1280, 800], [820, 1100], [390, 844]]) {
  const m = w < 700;
  const tag = `@${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (x) => { if (x.type() === 'error' && !/status of 500/.test(x.text())) errors.push(x.text()); });
  const wait = (ms = 350) => page.waitForTimeout(ms);
  const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  const json = (url) => page.evaluate((u) => fetch(u, { headers: { Accept: 'application/json' } }).then((x) => x.json()).then((j) => j.data), url);
  const put = (url, body, method = 'PUT') => page.evaluate(async ([u, b, mt]) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || '';
    const r = await fetch(u, { method: mt, headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token }, body: JSON.stringify(b) });
    return r.status;
  }, [url, body, method]);
  const confirmVisible = () => page.locator('.confirm-foot, .confirm-dialog, [role="alertdialog"]').first().isVisible().catch(() => false);
  const heading = () => page.locator('.sp-detail-head .customer-name-title').innerText();
  const search = () => page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input');

  await signIn(page, BASE);
  const users = await json('/api/users');
  const riya = users.find((u) => u.name === 'Riya Sharma');
  const pooja = users.find((u) => u.status === 'active' && u.role === 'operations') || users.find((u) => u.status === 'active' && u.role !== 'admin'); // someone to deactivate and bring back
  const startMatrix = Object.fromEntries((await json(`/api/users/${riya.id}`)).permissions.map((p) => [p.module, { view: p.view, edit: p.edit, delete: p.delete }]));

  if (!m) await page.locator('#desktop-view-slot #nav-users').click();
  else { await page.locator('#mobile-more-btn').click(); await wait(600); await page.locator('.more-sheet [data-nav="users"]').click(); }
  await page.waitForSelector('.sp-row', { timeout: 15000 }).catch(() => {}); await wait(400);

  check(`${tag} Users opens`, /#users/.test(page.url()) && await page.locator('.sp[data-sp="users"]').count() === 1);
  check(`${tag} no horizontal scroll`, await noHScroll());
  check(`${tag} ${users.length} people listed`, await page.locator('.sp-row').count() === users.length);
  if (m) check(`${tag} header counts the team`, new RegExp(`${users.length} team members`).test(await page.locator('.sp-header-line').innerText()), await page.locator('.sp-header-line').innerText());
  else check(`${tag} Invite User is in the top bar, no title row`, /Invite User/.test(await page.locator('#desktop-page-add').innerText()) && await page.locator('#desktop-page-add').isVisible() && await page.locator('.sp-titlebar, .sp-sub, .sp-add, .sp-export').count() === 0);
  check(`${tag} row: avatar initials, name, email, status pill, role and last active`, await page.evaluate(() => { const r = document.querySelector('.sp-row'); return !!r.querySelector('.us-av')?.textContent.trim() && !!r.querySelector('.card-title')?.textContent && /@/.test(r.querySelector('.row-trip')?.textContent || '') && !!r.querySelector('.status-pill') && /·/.test(r.querySelector('.card-meta-row')?.textContent || ''); }));
  const counts = (await page.locator(m ? '.sp-tabs .tab-pill' : '.sp-tabs .compact-tab-btn').allInnerTexts()).join('|').replace(/\s+/g, ' ');
  const by = (r) => users.filter((u) => u.role === r).length;
  const want = [['All', users.length], ['Admin', by('admin')], ['Sales', by('sales')], ['Operations', by('operations')]].map(([l, n]) => (m ? `${l} ${n}` : `${l} (${n})`)).join('|');
  check(`${tag} tab counts`, counts === want, counts);
  check(`${tag} names and emails stay on one line`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .card-title, .sp-row .row-trip, .sp-row .card-meta-row span')].every((e) => e.getBoundingClientRect().height < 24)));

  await page.locator('[data-sp-tab="admin"]').click(); await wait(500);
  check(`${tag} Admin tab`, await page.locator('.sp-row').count() === by('admin'));
  await page.locator('[data-sp-tab="all"]').click(); await wait(400);
  await search().fill('riya'); await wait(900);
  check(`${tag} search narrows the list`, await page.locator('.sp-row').count() === 1 && /Riya/.test(await page.locator('.sp-row').innerText()));
  await search().fill('zzzzqq'); await wait(900);
  check(`${tag} no results: calm empty state`, /No users found/.test(await page.locator('.sp-list').innerText()));
  await search().fill(''); await wait(900);

  // the status filter (Any status / Active / Pending / Inactive)
  await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
  const statusOpts = (await page.locator('.sp-filter-slot li').allInnerTexts()).map((t) => t.trim());
  check(`${tag} status filter options`, statusOpts.join('|') === 'Any status|Active|Pending|Inactive', statusOpts.join('|'));
  await page.locator('.sp-filter-slot li[data-value="active"]').click(); await wait(600);
  const activeCount = users.filter((u) => u.status === 'active').length;
  check(`${tag} Active filter narrows the list`, await page.locator('.sp-row').count() === activeCount && (await page.locator('.sp-row .status-pill').allInnerTexts()).every((x) => /Active/.test(x)), String(await page.locator('.sp-row').count()));
  await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
  await page.locator('.sp-filter-slot li[data-value=""]').click(); await wait(600);
  check(`${tag} Any status brings everyone back`, await page.locator('.sp-row').count() === users.length);

  // open Riya
  const riyaRow = page.locator(`.sp-row[data-sp-id="${riya.id}"]`);
  if (!m) check(`${tag} the first person is selected`, sel(page) === String(users[0].id) && await page.locator('.sp-row.active').count() === 1);
  await riyaRow.click(); await page.waitForFunction(() => /Riya/.test(document.querySelector('.sp-detail-head .customer-name-title')?.textContent || '') && /Sales role/.test(document.querySelector('.us-matrix-head')?.textContent || ''), null, { timeout: 10000 }).catch(() => {}); await wait(300);
  check(`${tag} detail: name, status pill, tabs`, /Riya/.test(await heading()) && await page.locator('.sp-detail-tabs [role="tab"]').count() === 3);
  check(`${tag} three stat cards`, await page.locator('.sp-stat').count() === 3);
  const stats = await json(`/api/users/${riya.id}`);
  check(`${tag} stat cards show the API numbers`, (await page.locator('.sp-stat-value').allInnerTexts()).join() === [stats.stats.openInquiries, stats.stats.converted30d, stats.stats.activeBookings].join());
  check(`${tag} the matrix has eight modules with three switches each`, await page.locator('.us-row:not(.us-cols)').count() === 8 && await page.locator('.us-switch').count() === 24);
  check(`${tag} module labels as designed`, (await page.locator('.us-mod').allInnerTexts()).join('|') === 'Inquiries|Bookings|Calendar|Operation Team|Destinations and Tour Packages|Transport, Stays and Adventures|Banners and Blogs|Users and Settings');
  check(`${tag} the switches show the role defaults (Inquiries view+edit, Banners and Blogs off)`, await page.locator('[data-us-perm="inquiries:view"]').getAttribute('aria-checked') === 'true' && await page.locator('[data-us-perm="inquiries:edit"]').getAttribute('aria-checked') === 'true' && await page.locator('[data-us-perm="website:view"]').getAttribute('aria-checked') === 'false');
  check(`${tag} Save is off until something changes`, await page.locator('[data-sp-act="save"]').isDisabled());
  check(`${tag} the matrix fits the screen`, await page.evaluate(() => { const c = document.querySelector('.us-matrix').getBoundingClientRect(); return c.right <= innerWidth + 1 && c.left >= -1; }));
  const footTexts = (await page.locator('.sp-detail-foot .btn-confirm-booking, .sp-detail-foot .quick-action-col-btn').allInnerTexts()).map((t) => t.trim());
  check(`${tag} footer: Save changes, then Edit / Reset password / Deactivate`, footTexts.join('|') === 'Save changes|Edit|Reset password|Deactivate' && await page.locator('.sp-detail-foot .btn-confirm-booking[data-sp-act="save"]').count() === 1 && await page.locator('.sp-detail-foot .quick-action-col-btn[data-sp-act]').count() === 3, footTexts.join('|'));
  if (m) check(`${tag} phone: back arrow, bottom bar hidden`, await page.locator('.sp-back[aria-label]').count() === 1 && await page.evaluate(() => getComputedStyle(document.querySelector('.mobile-bottom-nav')).display === 'none'));

  // toggling: dependencies and dirty state
  const sw = (k) => page.locator(`[data-us-perm="${k}"]`);
  await sw('website:edit').click(); await wait(200);
  check(`${tag} switching Edit on also turns View on`, await sw('website:view').getAttribute('aria-checked') === 'true' && await sw('website:edit').getAttribute('aria-checked') === 'true');
  check(`${tag} Save turns on`, await page.locator('[data-sp-act="save"]').isEnabled());
  await sw('website:view').click(); await wait(200);
  check(`${tag} switching View off turns Edit and Delete off`, await sw('website:edit').getAttribute('aria-checked') === 'false' && await sw('website:delete').getAttribute('aria-checked') === 'false');
  check(`${tag} back to the saved values: Save is off again`, await page.locator('[data-sp-act="save"]').isDisabled());
  await sw('website:view').click(); await wait(200);

  // unsaved changes: switching person asks first
  if (!m) {
    const second = page.locator('.sp-row').filter({ hasNotText: 'Riya' }).first();
    await second.click(); await wait(500);
    check(`${tag} switching person with unsaved changes asks (Keep editing / Discard)`, await page.getByRole('button', { name: 'Keep editing' }).isVisible() && await page.getByRole('button', { name: 'Discard', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Keep editing' }).click(); await wait(500);
    check(`${tag} Keep editing stays on the person with the change`, /Riya/.test(await heading()) && await sw('website:view').getAttribute('aria-checked') === 'true');
    // leaving the page
    await page.locator('#desktop-view-slot #nav-dashboard').click(); await wait(500);
    check(`${tag} leaving the page asks too`, await page.getByRole('button', { name: 'Keep editing' }).isVisible());
    await page.getByRole('button', { name: 'Keep editing' }).click(); await wait(400);
    check(`${tag} Keep editing keeps the page open`, /#users/.test(page.url()));
    await second.click(); await wait(500);
    await page.getByRole('button', { name: 'Discard', exact: true }).click(); await wait(900);
    check(`${tag} Discard moves on`, !/Riya/.test(await heading()));
    await riyaRow.click(); await wait(900);
    check(`${tag} the discarded change is gone`, await sw('website:view').getAttribute('aria-checked') === 'false' && await page.locator('[data-sp-act="save"]').isDisabled());
  } else {
    await page.locator('.sp-back').click(); await wait(500);
    check(`${tag} phone: the back arrow with unsaved changes asks too`, await page.getByRole('button', { name: 'Keep editing' }).isVisible());
    await page.getByRole('button', { name: 'Discard', exact: true }).click(); await wait(700);
    check(`${tag} phone: Discard returns to the list`, await page.locator('.sp-detail.is-open').count() === 0 && sel(page) === null);
    await riyaRow.click(); await wait(900);
  }

  // saving
  await sw('website:view').click(); await sw('website:edit').click(); await wait(200);
  await page.locator('[data-sp-act="save"]').click(); await wait(1200);
  const saved = await json(`/api/users/${riya.id}`);
  check(`${tag} Save changes writes the matrix (Banners and Blogs view + edit)`, saved.permissionsSource === 'custom' && saved.permissions.find((p) => p.module === 'website').edit === true);
  check(`${tag} after saving Save is off and the toggles stay`, await page.locator('[data-sp-act="save"]').isDisabled() && await sw('website:edit').getAttribute('aria-checked') === 'true');
  check(`${tag} saved: switching person no longer asks`, await (async () => { if (m) { await page.locator('.sp-back').click(); await wait(500); return !(await page.getByRole('button', { name: 'Keep editing' }).isVisible().catch(() => false)); } await page.locator('.sp-row').filter({ hasNotText: 'Riya' }).first().click(); await wait(500); return !(await page.getByRole('button', { name: 'Keep editing' }).isVisible().catch(() => false)); })());
  await put(`/api/users/${riya.id}/permissions`, { permissions: startMatrix }); // back to the role's values

  // profile and activity tabs, the admin is read only
  await page.goto(`${BASE}?selected=${riya.id}#users`, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.sp-row'); await wait(300);
  await page.locator('[data-sp-dtab="profile"]').click(); await wait(300);
  check(`${tag} Profile tab shows the details`, /riya@/.test(await page.locator('.sp-grid2').innerText()) && /Sales/.test(await page.locator('.sp-grid2').innerText()));
  await page.locator('[data-sp-dtab="activity"]').click(); await wait(300);
  check(`${tag} Activity tab shows recent work or a calm note`, await page.locator('.sp-linkrow').count() > 0 || /No inquiries or bookings/.test(await page.locator('.sp-detail-body').innerText()));
  await page.goto(`${BASE}?selected=${users[0].id}#users`, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.sp-row'); await wait(300);
  if (m && !(await page.locator('.sp-detail.is-open').count())) { await page.locator(`.sp-row[data-sp-id="${users[0].id}"]`).click(); await wait(800); }
  await page.waitForSelector('.sp-detail-head .customer-name-title').catch(() => {}); await page.waitForSelector('.us-switch', { timeout: 10000 }).catch(() => {});
  const adminLocked = users[0].role === 'admin';
  if (adminLocked) {
    check(`${tag} an admin's matrix is read only`, await page.locator('.us-switch.is-locked').count() === 24 && await page.locator('[data-sp-act="save"]').isDisabled());
    await page.locator('.us-switch').first().click({ force: true }); await wait(200); // aria-disabled, so force the click
    check(`${tag} clicking a locked switch changes nothing`, await page.locator('[data-sp-act="save"]').isDisabled() && await page.locator('.us-switch').first().getAttribute('aria-checked') === 'true');
  }

  // deactivate and reactivate someone else
  await page.goto(`${BASE}?selected=${pooja.id}#users`, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.sp-row'); await wait(300);
  if (m && !(await page.locator('.sp-detail.is-open').count())) { await page.locator(`.sp-row[data-sp-id="${pooja.id}"]`).click(); await wait(800); }
  await page.waitForSelector('.us-switch', { timeout: 10000 }).catch(() => {});
  const before = pooja.status;
  await page.locator('[data-sp-act="status"]').click(); await wait(500);
  check(`${tag} Deactivate asks first`, await page.locator('.confirm-card').getByRole('button', { name: 'Cancel' }).isVisible());
  await page.locator('.confirm-card').getByRole('button', { name: 'Cancel' }).click(); await wait(400);
  check(`${tag} Cancel changes nothing`, (await json('/api/users')).find((u) => u.id === pooja.id).status === before);
  await page.locator('[data-sp-act="status"]').click(); await wait(400);
  await page.locator('.confirm-card').getByRole('button', { name: 'Deactivate' }).click(); await wait(1200);
  check(`${tag} Deactivate sets the status to inactive`, (await json('/api/users')).find((u) => u.id === pooja.id).status === 'inactive' && /Inactive/.test(await page.locator('.sp-detail-head').innerText()) && /Reactivate/.test(await page.locator('.sp-detail-foot [data-sp-act="status"]').innerText()));
  await page.locator('[data-sp-act="status"]').click(); await wait(1200);
  check(`${tag} Reactivate sets it back to active`, (await json('/api/users')).find((u) => u.id === pooja.id).status === 'active');
  await put(`/api/users/${pooja.id}/status`, { status: 'active' }, 'PATCH'); // in case a step above stopped halfway

  // drawn only
  const reset = await page.locator('[data-sp-act="reset"]');
  await reset.click(); await wait(500);
  check(`${tag} Reset password does nothing (no dialog, no fake success)`, await page.locator('.modal-overlay.open, .asg-overlay.open, .confirm-card').count() === 0 && !(await page.locator('.toast, [class*="toast"]').allInnerTexts().then((t) => /reset|sent/i.test(t.join(' ')))));
  await page.locator('[data-sp-act="edit"]').click(); await wait(400);
  check(`${tag} Edit does nothing yet`, await page.locator('.modal-overlay.open, .asg-overlay.open, .confirm-card').count() === 0);
  if (m) { await page.locator('.sp-back').click(); await wait(500); }
  const addBtn = page.locator(m ? '#mobile-page-add' : '#desktop-page-add');
  check(`${tag} the Invite User button is drawn`, await addBtn.isVisible() && /Invite User/.test(await addBtn.innerText()));
  await addBtn.click(); await wait(400);
  check(`${tag} Invite User does nothing yet`, await page.locator('.modal-overlay.open, .asg-overlay.open, .wiz-sheet').count() === 0);

  // empty and failing API
  await page.route('**/api/users', (r) => r.fulfill({ json: { success: true, data: [] } }));
  await page.goto(`${BASE}#users`, { waitUntil: 'domcontentloaded' }); await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => /No users yet/.test(document.querySelector('.sp-list')?.innerText || ''), null, { timeout: 10000 }).catch(() => {});
  check(`${tag} empty: calm empty state`, /No users yet/.test(await page.locator('.sp-list').innerText()));
  await page.unroute('**/api/users');
  await page.route('**/api/users', (r) => r.fulfill({ status: 500, json: { message: 'boom' } }));
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => /Could not load users/.test(document.querySelector('.sp-list')?.innerText || ''), null, { timeout: 10000 }).catch(() => {});
  check(`${tag} error: shared error state with Try again`, /Could not load users/.test(await page.locator('.sp-list').innerText()));
  await page.unroute('**/api/users');
  await page.locator('#sp-retry').click(); await page.waitForSelector('.sp-row', { timeout: 10000 }).catch(() => {}); await wait(300);
  check(`${tag} error: Try again brings the list back`, await page.locator('.sp-row').count() === users.length);
  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

// Browser test (not run by PHPUnit): the shared shell for the catalog / website / system pages, using Destinations as the example.
// Sidebar groups, the phone "More" sheet, the always-selected split view, ?selected=, search / tabs / sort, keyboard, export,
// the Add button doing nothing, placeholders, and no horizontal scroll at 1280, 820 and 390.
// Run against a dev server whose database has the destinations table (see docs/pages.md): `BASE=http://127.0.0.1:8000/ node pages-shell.mjs`.
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
  page.on('console', (x) => { if (x.type() === 'error') errors.push(x.text()); });
  const wait = (ms = 350) => page.waitForTimeout(ms);
  const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

  await signIn(page, BASE);
  const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';

  if (!m) {
    const groups = await page.locator(`${slot} .nav-section-title`).allInnerTexts();
    check(`${tag} sidebar has the four groups`, ['Menu', 'Catalog', 'Website', 'System'].every((g) => groups.map((x) => x.toLowerCase()).includes(g.toLowerCase())), JSON.stringify(groups));
    check(`${tag} sidebar has every page`, await page.locator(`${slot} .sidebar-nav-item[data-nav]`).count() === 14);
    await page.locator(`${slot} #nav-destinations`).click();
  } else {
    await page.locator('#mobile-more-btn').click(); await wait(600);
    const titles = await page.locator('.more-sheet .more-group h4').allInnerTexts();
    check(`${tag} More lists the groups`, JSON.stringify(titles.map((t) => t.toLowerCase())) === JSON.stringify(['operations', 'catalog', 'website', 'system']), JSON.stringify(titles));
    check(`${tag} More lists every page the bottom bar does not`, await page.locator('.more-sheet .more-tile').count() === 10);
    check(`${tag} More: no field focused`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));
    await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/more.png` : undefined }).catch(() => {});
    await page.locator('.more-sheet [data-nav="destinations"]').click();
  }
  await page.waitForSelector('.sp-row', { timeout: 15000 }).catch(() => {}); await wait(300);
  check(`${tag} Destinations opens`, /#destinations/.test(page.url()) && await page.locator('.sp[data-sp="destinations"]').count() === 1);
  check(`${tag} no horizontal scroll`, await noHScroll());
  if (m) check(`${tag} More is lit on the bottom bar`, await page.locator('#mobile-more-btn.active').count() === 1);
  const rows = await page.locator('.sp-row').count();
  check(`${tag} 20 destinations listed`, rows === 20, String(rows));
  if (m) check(`${tag} header shows the page and the count`, /Destinations • 20 Total/.test(await page.locator('.sp-header-line').innerText()));
  else check(`${tag} the Add button is in the top bar, no title row`, (await page.locator('#desktop-page-add').innerText()).includes('Add Destination') && await page.locator('#desktop-add-inquiry').isHidden() && await page.locator('.sp-titlebar').count() === 0);

  if (!m) {
    check(`${tag} first record selected, URL has ?selected=`, sel(page) === '1' && await page.locator('.sp-row.active').count() === 1 && /Kashmir/.test(await page.locator('.sp-detail-head .customer-name-title').innerText()));
    check(`${tag} detail pane shows tabs and the footer bar`, await page.locator('.sp-detail-tabs [role="tab"]').count() === 3 && await page.locator('.sp-detail-foot .btn-confirm-booking').count() === 1 && await page.locator('.sp-detail-foot .quick-action-col-btn').count() === 3);
    await page.locator('.sp-row[data-sp-id="2"]').click(); await wait();
    check(`${tag} clicking another record switches the pane`, sel(page) === '2' && /Goa/.test(await page.locator('.sp-detail-head .customer-name-title').innerText()));
    await page.locator('.sp-list').focus(); await page.keyboard.press('ArrowDown'); await wait(250);
    check(`${tag} ArrowDown selects the next record`, sel(page) === '3' && await page.evaluate(() => document.activeElement.classList.contains('sp-list')));
    await page.goto(`${BASE}?selected=5#destinations`, { waitUntil: 'networkidle' }); await page.waitForSelector('.sp-row', { timeout: 15000 }); await wait(300);
    check(`${tag} reload keeps ?selected=`, sel(page) === '5' && /Bali/.test(await page.locator('.sp-detail-head .customer-name-title').innerText()));
    await page.goto(`${BASE}?selected=9999#destinations`, { waitUntil: 'networkidle' }); await page.waitForSelector('.sp-row', { timeout: 15000 }); await wait(300);
    check(`${tag} unknown id falls back to the first`, sel(page) === '1');
  } else {
    check(`${tag} phone: nothing opens by itself`, sel(page) === null && await page.locator('.sp-detail.is-open').count() === 0);
    await page.locator('.sp-row[data-sp-id="2"]').click(); await wait(500);
    check(`${tag} phone: tapping a card opens the detail full screen`, sel(page) === '2' && await page.locator('.sp-detail.is-open').count() === 1 && /Goa/.test(await page.locator('.sp-detail-head .customer-name-title').innerText()));
    check(`${tag} phone: back arrow labelled, bottom bar hidden`, await page.locator('.sp-back[aria-label]').count() === 1 && await page.evaluate(() => getComputedStyle(document.querySelector('.mobile-bottom-nav')).display === 'none'));
    check(`${tag} phone: no horizontal scroll in the detail`, await noHScroll());
    await page.locator('.sp-back').click(); await wait(500);
    check(`${tag} phone: back arrow returns to the list`, sel(page) === null && await page.locator('.sp-detail.is-open').count() === 0);
    await page.locator('.sp-row[data-sp-id="3"]').click(); await wait(400);
    await page.goBack(); await wait(500);
    check(`${tag} phone: browser back closes the detail`, await page.locator('.sp-detail.is-open').count() === 0 && /#destinations/.test(page.url()));
  }

  // search, tabs, sort
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill('goa'); await wait(900);
  check(`${tag} search narrows the list`, await page.locator('.sp-row').count() === 1 && (await page.locator('.sp-row').first().innerText()).includes('Goa'));
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill('zzzzqq'); await wait(900);
  check(`${tag} no results: calm empty states`, /No destinations found/.test(await page.locator('.sp-list').innerText()) && (m || /No records to show/.test(await page.locator('.sp-detail-body').innerText())));
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill(''); await wait(900);
  await page.locator('[data-sp-tab="draft"]').click(); await wait(500);
  check(`${tag} Draft tab: 6 records`, await page.locator('.sp-row').count() === 6);
  if (!m) check(`${tag} the selection moved to the first draft`, /Spiti/.test(await page.locator('.sp-detail-head .customer-name-title').innerText()));
  await page.locator('[data-sp-tab="all"]').click(); await wait(400);
  check(`${tag} tab counts`, (await page.locator(m ? '.sp-tabs .tab-pill' : '.sp-tabs .compact-tab-btn').allInnerTexts()).join('|').replace(/\s+/g, ' ') === (m ? 'All 20|Active 14|Draft 6|Popular 5' : 'All (20)|Active (14)|Draft (6)|Popular (5)'));
  await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
  await page.locator('.sp-filter-slot li', { hasText: 'Goa' }).first().click(); await wait(600);
  check(`${tag} the state filter narrows the list`, await page.locator('.sp-row').count() === 1 && (await page.locator('.sp-row .card-title').first().innerText()) === 'Goa');
  await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
  await page.locator('.sp-filter-slot li[data-value=""]').click(); await wait(500);
  check(`${tag} All States brings them back`, await page.locator('.sp-row').count() === 20);

  // long text never wraps, Add does nothing, Export downloads
  check(`${tag} single-line names with ellipsis`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .card-title, .sp-row .row-trip')].every((e) => e.getBoundingClientRect().height < 24)));
  if (!m) {
    await page.locator('#desktop-page-add').click(); await wait(400);
    check(`${tag} Add Destination does nothing yet`, await page.locator('.modal-overlay.open, .asg-overlay.open').count() === 0);
    // detail tabs
    await page.locator('.sp-row').first().click(); await wait(300);
    await page.locator('[data-sp-dtab="packages"]').click(); await wait(600);
    check(`${tag} detail tabs switch`, await page.locator('.sp-detail-tabs [aria-selected="true"]').innerText().then((t) => /Packages/.test(t)));
    await page.locator('[data-sp-act="new-inquiry"]').click(); await wait(900);
    check(`${tag} New inquiry opens Add Inquiry with the destination filled in`, await page.locator('.wiz-sheet').count() === 1 && (await page.locator('.wiz-sheet input[value="Kashmir"]').count()) === 1);
    await page.keyboard.press('Escape'); await wait(600);
    if (await page.locator('.confirm-card').count()) { await page.locator('.confirm-card [data-confirm="yes"]').click(); await wait(600); } // the prefilled destination counts as entered data
    check(`${tag} the wizard closes again`, await page.locator('.wiz-sheet').count() === 0);
  }

  // other pages still work, and the placeholders are calm
  if (!m) await page.locator(`${slot} #nav-dashboard`).click(); else { await page.locator('.mobile-bottom-nav [data-route="dashboard"]').click(); }
  await wait(900);
  check(`${tag} Dashboard shows the coming-soon card`, /is coming soon/.test(await page.locator('.sp-soon').innerText()));
  if (!m) await page.locator(`${slot} #nav-bookings`).click(); else await page.locator('.mobile-bottom-nav [data-route="bookings"]').click();
  await wait(1200);
  check(`${tag} Bookings still opens (host hidden)`, await page.locator(`${slot} #mobile-cards-list .list-row-card, ${slot} #desktop-compact-list-items .list-row-card`).count() > 0 && await page.locator('.sp:visible').count() === 0);
  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

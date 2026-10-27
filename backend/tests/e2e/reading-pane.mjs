// Browser test (not run by PHPUnit): the always-open detail ("reading") pane on Bookings and Inquiries.
// Run against a dev server: `BASE=http://127.0.0.1:8000/ node reading-pane.mjs`.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n')[0]); summary(); process.exit(2); });

const sel = (page) => new URL(page.url()).searchParams.get('selected');
const activeId = (page) => page.evaluate(() => document.querySelector('#desktop-compact-list-items .list-row-card.active')?.dataset.compactBookingId || null);
const ids = (page) => page.evaluate(() => [...document.querySelectorAll('#desktop-compact-list-items [data-compact-booking-id]')].map((c) => c.dataset.compactBookingId));
const detailName = (page) => page.evaluate(() => document.querySelector('#desktop-sheet-header .customer-name-title')?.textContent.trim() || '');
const drawerOpen = (page) => page.evaluate(() => document.querySelector('#desktop-details-drawer').classList.contains('open'));

for (const [w, h] of [[1280, 800], [768, 1024]]) {
  for (const kind of ['bookings', 'inquiries']) {
    const tag = `${kind}@${w}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await signIn(page, BASE);
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const open = async (query = '') => { await page.goto(`${BASE}${query}#${kind}`.replace('?#', '#'), { waitUntil: 'networkidle' }); await wait(900); };

    await open();
    const all = await ids(page);
    check(`${tag} list has records`, all.length >= 3, String(all.length));
    check(`${tag} first record selected on load`, await activeId(page) === all[0], `${await activeId(page)} vs ${all[0]}`);
    check(`${tag} detail pane open with the record`, await drawerOpen(page) && (await detailName(page)).length > 0);
    check(`${tag} URL carries ?selected=`, sel(page) === all[0], page.url());
    check(`${tag} listbox + option roles`, await page.evaluate(() => document.querySelector('#desktop-compact-list-items').getAttribute('role') === 'listbox' && document.querySelector('#desktop-compact-list-items .list-row-card.active').getAttribute('aria-selected') === 'true'));
    check(`${tag} nothing focused on load`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));

    // click another record: pane switches, never blank in between
    const trace = page.evaluate(() => { window.__blank = 0; const body = document.querySelector('#desktop-sheet-header'); new MutationObserver(() => { if (!body.textContent.trim()) window.__blank += 1; }).observe(body, { childList: true, subtree: true }); });
    await trace;
    const nameBefore = await detailName(page);
    await page.locator(`#desktop-compact-list-items [data-compact-booking-id="${all[1]}"]`).click(); await wait();
    check(`${tag} click switches the pane`, await activeId(page) === all[1] && sel(page) === all[1] && (await detailName(page)) !== nameBefore);
    check(`${tag} pane stayed open and never blank`, await drawerOpen(page) && await page.evaluate(() => window.__blank === 0));

    // arrow keys with the list focused
    await page.locator('#desktop-compact-list-items').focus();
    await page.keyboard.press('ArrowDown'); await wait(250);
    check(`${tag} ArrowDown selects the next record`, await activeId(page) === all[2]);
    check(`${tag} focus stays on the list`, await page.evaluate(() => document.activeElement.id === 'desktop-compact-list-items'));
    await page.keyboard.press('ArrowUp'); await wait(250);
    check(`${tag} ArrowUp selects the previous record`, await activeId(page) === all[1]);

    // bulk checkbox and row buttons do not change the selection
    await page.locator(`#desktop-compact-list-items [data-compact-booking-id="${all[3] || all[2]}"] [data-desktop-select-id]`).click(); await wait(250);
    check(`${tag} checkbox keeps the selection`, await activeId(page) === all[1]);
    await page.locator('#desktop-compact-list-items [data-desktop-select-id]').nth(3).click().catch(() => {}); await wait(150);

    // back / forward
    await page.goBack(); await wait(500);
    check(`${tag} browser back returns to the earlier record`, await activeId(page) === all[0] && sel(page) === all[0], `${await activeId(page)} ${page.url()}`);
    await page.goForward(); await wait(500);
    check(`${tag} browser forward`, await activeId(page) === all[1]);

    // reload keeps it; a bad id falls back to the first
    await open(`?selected=${all[2]}`);
    check(`${tag} reload with ?selected= keeps the record`, await activeId(page) === all[2]);
    await open('?selected=NOPE-999');
    check(`${tag} unknown id falls back to the first`, await activeId(page) === all[0] && sel(page) === all[0]);

    // search: selection kept while still in results, first result otherwise, calm empty state
    await open(`?selected=${all[2]}`);
    const name2 = (await detailName(page)).split(' ')[0];
    await page.locator('#desktop-compact-search-input').fill(name2); await wait(900);
    check(`${tag} search keeps the selection when it is still listed`, await activeId(page) === all[2]);
    await page.locator('#desktop-compact-search-input').fill('zzzzqqqq'); await wait(900);
    check(`${tag} empty results: empty detail state`, /No records to show/.test(await page.locator('#desktop-sheet-body').innerText()) && await drawerOpen(page));
    check(`${tag} empty results: tabs and footer hidden`, await page.evaluate(() => getComputedStyle(document.querySelector('.desktop-drawer-footer')).display === 'none'));
    check(`${tag} empty results: list shows its empty state`, /No .* found/.test(await page.locator('#desktop-compact-list-items').innerText()));
    await page.locator('#desktop-compact-search-input').fill(''); await wait(900);
    check(`${tag} clearing search selects a record again`, !!(await activeId(page)) && (await detailName(page)).length > 0);

    // a search that removes the selected record selects the first result
    await open(`?selected=${all[all.length - 1]}`);
    const first = await detailName(page);
    await page.locator('#desktop-compact-search-input').fill((await page.evaluate((id) => document.querySelector(`[data-compact-booking-id="${id}"] .card-title`)?.textContent || '', all[0])).trim().split(' ')[0]); await wait(900);
    const nowIds = await ids(page);
    check(`${tag} filtering moves the selection to the first result`, nowIds.length >= 1 && await activeId(page) === nowIds[0]);

    // expand collapses the pane and it stays collapsed
    await open();
    await page.locator('#desktop-btn-expand-table').click(); await wait(400);
    check(`${tag} expand closes the pane`, !(await drawerOpen(page)) && sel(page) === null);
    await page.locator('#desktop-table-search-input').fill('a'); await wait(700);
    check(`${tag} pane stays closed while filtering`, !(await drawerOpen(page)));
    await page.locator('#desktop-table-body [data-desktop-row-id]').first().click(); await wait(400);
    check(`${tag} clicking a row reopens the pane`, await drawerOpen(page) && !!sel(page));

    check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
}

// phone layout: nothing opens by itself and the URL is left alone
for (const kind of ['bookings', 'inquiries']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
    await signIn(page, BASE);
  page.setDefaultTimeout(20000);
  await page.goto(`${BASE}#${kind}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  check(`${kind}@390 no auto selection in the URL`, sel(page) === null, page.url());
  check(`${kind}@390 no sheet opened by itself`, await page.evaluate(() => !document.querySelector('#mobile-view-slot .sheet-overlay.open, #mobile-view-slot .mobile-bottom-sheet.open, #mobile-view-slot [class*="detail"][class*="open"]')));
  await page.locator('#mobile-view-slot [data-booking-id]').first().click(); await page.waitForTimeout(700);
  check(`${kind}@390 tapping a record still opens its detail`, await page.evaluate(() => /Customer Details|Itinerary/.test(document.querySelector('#mobile-view-slot').innerText)));
  check(`${kind}@390 URL still untouched`, sel(page) === null);
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

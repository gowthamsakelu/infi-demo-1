// Browser test (not run by PHPUnit): the detail pane on the PC / tablet list pages (Bookings, Inquiries and the catalog pages).
// Nothing is selected by itself: the pane says "Select ..." until a row is clicked; a click shows the record, another click switches it, Esc deselects.
// There is no expand (fullscreen) button, and the filter dropdown stays inside the screen.
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
const emptyText = (page) => page.evaluate(() => { const e = document.querySelector('.detail-empty'); return e && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : null; });

for (const [w, h] of [[1280, 800], [768, 1024]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await signIn(page, BASE);
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const wait = (ms = 500) => page.waitForTimeout(ms);

  // Bookings and Inquiries
  for (const [kind, noun] of [['bookings', 'booking'], ['inquiries', 'inquiry']]) {
    const tag = `${kind}@${w}`;
    await page.goto(`${BASE}#${kind}`); await page.reload();
    await page.waitForSelector('#desktop-compact-list-items .list-row-card'); await wait(2500);
    const ids = await page.evaluate(() => [...document.querySelectorAll('#desktop-compact-list-items [data-compact-booking-id]')].map((c) => c.dataset.compactBookingId));
    const title = (id) => page.locator(`#desktop-compact-list-items [data-compact-booking-id="${id}"] .card-title`);
    check(`${tag} list has records`, ids.length >= 3, String(ids.length));
    check(`${tag} nothing selected on load, the pane says Select`, sel(page) === null && new RegExp(`^Select an? ${noun}`).test(await emptyText(page) || '') && /Choose an item from the list/.test(await emptyText(page) || ''), String(await emptyText(page)));
    check(`${tag} no expand / fullscreen button`, await page.locator('#desktop-btn-expand-table, .btn-expand-full-table').count() === 0);
    check(`${tag} nothing focused on load`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));
    await title(ids[1]).click(); await wait(900);
    check(`${tag} a click selects the row and shows its detail`, sel(page) === ids[1] && await emptyText(page) === null && await page.locator('#desktop-compact-list-items .list-row-card.active').count() === 1);
    await title(ids[2]).click(); await wait(700);
    check(`${tag} another click switches the pane`, sel(page) === ids[2]);
    await title(ids[2]).click(); await wait(400);
    check(`${tag} clicking the selected row again keeps it open`, sel(page) === ids[2] && await emptyText(page) === null);
    await page.keyboard.press('Escape'); await wait(700);
    check(`${tag} Esc deselects and shows the empty state`, sel(page) === null && await emptyText(page) !== null && await page.locator('#desktop-compact-list-items .list-row-card.active').count() === 0);
    await page.locator('#desktop-compact-search-input').fill('a'); await wait(900);
    check(`${tag} searching selects nothing by itself`, sel(page) === null && await emptyText(page) !== null);
    await page.locator('#desktop-compact-search-input').fill(''); await wait(700);
    await page.goto(`${BASE}?selected=${ids[1]}#${kind}`); await page.waitForSelector('#desktop-compact-list-items .list-row-card'); await wait(2500);
    check(`${tag} ?selected= opens that record on load`, sel(page) === ids[1] && await emptyText(page) === null);
  }

  // the filter dropdown stays inside the screen, anchored to its button
  await page.goto(`${BASE}#inquiries`); await page.reload(); await page.waitForSelector('#desktop-compact-list-items .list-row-card'); await wait(1500);
  await page.locator('#desktop-compact-filter-slot .dd-trigger').click(); await wait(400);
  const dd = await page.evaluate(() => { const l = document.querySelector('#desktop-compact-filter-slot .dd-list:not([hidden])'); const t = document.querySelector('#desktop-compact-filter-slot .dd-trigger'); if (!l) return null; const r = l.getBoundingClientRect(); const tr = t.getBoundingClientRect(); return { inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, atLeastTrigger: r.width + 1 >= tr.width, atMost260: r.width <= 261, fixed: getComputedStyle(l).position === 'fixed' }; });
  check(`inquiries@${w} filter list: inside the screen, at least the button wide, at most 260px, fixed layer`, dd && dd.inside && dd.atLeastTrigger && dd.atMost260 && dd.fixed, JSON.stringify(dd));
  await page.keyboard.press('Escape'); await wait(300);
  check(`inquiries@${w} filter list closes on Escape`, await page.locator('#desktop-compact-filter-slot .dd-list:not([hidden])').count() === 0);

  // catalog pages
  for (const [key, noun] of [['tour-packages', 'package'], ['transport', 'vehicle'], ['stays', 'stay'], ['adventures', 'adventure'], ['destinations', 'destination'], ['users', 'user']]) {
    const tag = `${key}@${w}`;
    await page.goto(`${BASE}#${key}`); await page.reload(); await page.waitForSelector('.sp-row'); await wait(700);
    check(`${tag} nothing selected on load, the pane says Select`, sel(page) === null && new RegExp(`^Select an? ${noun}`).test(await emptyText(page) || ''), String(await emptyText(page)));
    await page.locator('.sp-row').nth(1).click(); await wait(800);
    check(`${tag} a click selects the row and shows its detail`, !!sel(page) && await page.locator('.sp-detail-head .customer-name-title').count() === 1 && await page.locator('.sp-row.active').count() === 1);
    await page.keyboard.press('Escape'); await wait(600);
    check(`${tag} Esc deselects`, sel(page) === null && await emptyText(page) !== null && await page.locator('.sp-row.active').count() === 0);
  }

  check(`@${w} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
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
const failed = summary();
process.exit(failed ? 1 : 0);

// Browser test (not run by PHPUnit): Bookings/Inquiries rows, Add Event (with Create New Day), shared Assign sheet and keyboard fit
// at every supported width. Playwright is NOT a project dependency:  npm i playwright && npx playwright install chromium
// Run against a running app:  BASE=http://127.0.0.1:8000/ node viewport-matrix.mjs     (re-seed afterwards: php artisan db:seed --force)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const VPS = [[344, 800], [360, 800], [375, 667], [393, 852], [412, 915], [440, 956], [480, 900], [744, 1133], [1032, 800], [1280, 800]];
const browser = await chromium.launch();
const rows = [];

for (const [w, h] of VPS) {
  const m = w < 700;
  const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  const page = await ctx.newPage();
  // Keyboard is mocked through visualViewport: resizing the emulated viewport also changes `screen`, which a real keyboard never does.
  if (m) await page.addInitScript(`(() => { const vv = new EventTarget(); Object.assign(vv, { height: innerHeight, width: innerWidth, offsetTop: 0, offsetLeft: 0, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true });
    window.__setKeyboard = (k) => { vv.height = innerHeight - k; vv.dispatchEvent(new Event('resize')); }; })();`);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const r = { vp: `${w}x${h}` };
  const step = async (key, fn) => { try { r[key] = !!(await fn()); } catch (e) { r[key] = false; r[key + 'Err'] = String(e).split('\n')[0]; } };

  await page.goto(`${BASE}?mx=${Date.now()}#bookings`, { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  await step('noHScroll', () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await step('rowsOneLine', () => page.evaluate((s) => {
    const cards = [...document.querySelectorAll(`${s} .bookings-cards-list .list-row-card, ${s} #desktop-table-body tr`)].filter((e) => e.getClientRects().length);
    if (!cards.length) return false;
    const amt = cards.map((c) => c.querySelector('[class*=amount], .amt, .price')).filter(Boolean);
    return cards.every((c) => c.getBoundingClientRect().width <= innerWidth + 1) && amt.every((a) => a.getBoundingClientRect().height < 40);
  }, slot));

  const open = async () => {
    await page.locator(m ? `${slot} [data-booking-id="BK-5022"]` : `${slot} [data-desktop-row-id="BK-5022"]`).first().click(); await page.waitForTimeout(600);
    await page.locator(`${slot} [data-sheet-tab="itinerary"], ${slot} [data-dt-tab="itinerary"]`).first().click(); await page.waitForTimeout(400);
  };
  await open();
  await step('noDoublePlus', () => page.evaluate((s) => !/^\s*\+\s*\+|\+\s*\+/.test(document.querySelector(`${s} .itin-actions`).innerText) && !/^\s*\+/.test(document.querySelector(`${s} #${s.includes('mobile') ? 'mobile' : 'desktop'}-add-event-btn`).innerText), slot));
  await step('noAddDay', () => page.evaluate((sl) => !document.querySelector(`${sl} [data-add-day]`) && !/Add Day/.test(document.querySelector(sl).innerText), slot));
  await step('addEventNewDay', async () => {
    await page.locator(`${slot} #${m ? 'mobile' : 'desktop'}-add-event-btn`).click(); await page.waitForTimeout(500);
    const nativeSel = await page.evaluate(() => [...document.querySelectorAll('.asg-overlay select')].some((s) => s.getClientRects().length));
    await page.locator('.asg-overlay #itin-day .dd-trigger').click();
    await page.locator('.asg-overlay #itin-day li[data-value="new"]').click();
    await page.fill('.asg-overlay #itin-title', `Probe ${w}`);
    const box = await page.locator('.asg-overlay .asg-sheet').boundingBox();
    const fits = box.x >= 0 && box.y >= 0 && box.x + box.width <= w + 1 && box.y + box.height <= h + 1;
    await page.locator('.asg-overlay [data-itin-save]').click(); await page.waitForTimeout(900);
    return !nativeSel && fits;
  });
  await step('assignSheet', async () => {
    await page.locator(`${slot} .item-menu-btn`).first().click(); await page.waitForTimeout(200);
    await page.locator(`${slot} [data-dropdown-act="assign"]`).first().click(); await page.waitForTimeout(600);
    const info = await page.evaluate(() => ({ one: document.querySelectorAll('.asg-overlay').length === 1, filter: !!document.querySelector('.asg-search-row .dd-icon-trigger'), noAuto: document.activeElement.id !== 'asg-search',
      ph: (() => { const i = document.querySelector('#asg-search'); return i.scrollWidth <= i.clientWidth + 1 || i.placeholder.length < 40; })() }));
    const sb = await page.locator('.asg-overlay .asg-sheet').boundingBox();
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    return info.one && info.filter && info.noAuto && info.ph && sb.x + sb.width <= w + 1;
  });
  if (m) {
    await step('keyboardFit', async () => {
      await page.locator(`${slot} [data-row-menu]`).first().click().catch(() => {});
      await page.keyboard.press('Escape');
      await page.goto(`${BASE}?mx=${Date.now()}#bookings`, { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
      await page.locator(`${slot} [data-row-menu]`).first().click(); await page.locator('.row-floating-menu [data-menu-key=assign]').click(); await page.waitForTimeout(500);
      await page.locator('#asg-search').focus();
      await page.evaluate((k) => window.__setKeyboard(k), Math.round(h * 0.5)); await page.waitForTimeout(800);
      return page.evaluate(() => { const vh = visualViewport.height; const i = document.querySelector('#asg-search').getBoundingClientRect(); const s = document.querySelector('.asg-sheet').getBoundingClientRect(); return i.top >= 0 && i.bottom <= vh && s.bottom <= vh + 1 && document.documentElement.classList.contains('is-keyboard-open'); });
    });
  }
  r.jsErrors = errors.length === 0;
  rows.push(r);
  await ctx.close();
}
await browser.close();

const cols = ['noHScroll', 'rowsOneLine', 'noDoublePlus', 'noAddDay', 'addEventNewDay', 'assignSheet', 'keyboardFit', 'jsErrors'];
console.log(['viewport'.padEnd(10), ...cols.map((c) => c.padEnd(14))].join(' '));
for (const r of rows) console.log([r.vp.padEnd(10), ...cols.map((c) => (r[c] === undefined ? '-' : r[c] ? 'PASS' : 'FAIL').padEnd(14))].join(' '));
for (const r of rows) for (const c of cols) if (r[c + 'Err']) console.log(`  ${r.vp} ${c}: ${r[c + 'Err']}`);
process.exit(rows.every((r) => cols.every((c) => r[c] !== false)) ? 0 : 1);

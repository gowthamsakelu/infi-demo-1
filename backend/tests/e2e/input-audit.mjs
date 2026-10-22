// Browser test (not run by PHPUnit): every input / textarea must stay visible above the on-screen keyboard.
// Setup (outside the app, nothing is added to package.json):  npm i playwright && npx playwright install chromium
// Run against a running app:  BASE=http://127.0.0.1:8000/ node input-audit.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const KB = 360;
const browser = await chromium.launch();
const rows = [];

async function measure(page, fieldSel, overlaySel) {
  return page.evaluate(({ f, ov }) => {
    const vvh = innerHeight;
    const el = document.querySelector(f); const er = el.getBoundingClientRect();
    const out = { visible: er.top >= 0 && er.bottom <= vvh + 1, kb: document.documentElement.classList.contains('is-keyboard-open') };
    if (ov) {
      const card = document.querySelector(ov); const cr = card.getBoundingClientRect();
      out.cardInside = cr.top >= 0 && cr.bottom <= vvh + 1;
      const overlay = card.closest('.asg-overlay, .modal-overlay'); if (overlay) out.noPeek = Math.abs(overlay.getBoundingClientRect().bottom - vvh) <= 1;
      const foot = card.querySelector('.asg-footer, .fu-footer, .itin-footer, .modal-footer'); const body = card.querySelector('.asg-scroll, .fu-body, .itin-body, .modal-body');
      if (foot && body) { const fr = foot.getBoundingClientRect(), br = body.getBoundingClientRect(); out.footerOk = fr.top >= br.bottom - 1 && fr.bottom <= vvh + 1; }
    }
    return out;
  }, { f: fieldSel, ov: overlaySel });
}

async function check(page, name, fieldSel, overlaySel) {
  const r = { field: name };
  try {
    await page.locator(fieldSel).first().focus();
    await page.setViewportSize({ width: 360, height: 800 - KB });
    await page.waitForTimeout(700);
    Object.assign(r, await measure(page, fieldSel, overlaySel));
    await page.setViewportSize({ width: 360, height: 800 });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForTimeout(250);
  } catch (e) { r.error = String(e).split('\n')[0]; }
  r.pass = !r.error && r.visible && r.kb && r.cardInside !== false && r.noPeek !== false && r.footerOk !== false;
  rows.push(r);
}

const open = async () => {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  return { ctx, page };
};
const goto = async (page, hash) => { await page.goto(`${BASE}?a=${Date.now()}#${hash}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(700); };

// 1) Static fields that already exist in the DOM (page fields + legacy modals): force their overlay open, then focus.
{
  const { ctx, page } = await open(); await goto(page, 'bookings');
  const ids = await page.evaluate(() => [...document.querySelectorAll('#mobile-view-slot input, #mobile-view-slot textarea, body > div > .modal-overlay input, body > div > .modal-overlay textarea')]
    .filter((e) => e.id && !e.closest('.skel') && e.type !== 'hidden' && e.getAttribute('data-test-skip') === null).map((e) => e.id));
  for (const id of [...new Set(ids)]) {
    await page.evaluate((i) => { const el = document.getElementById(i); const ov = el.closest('.modal-overlay'); ov?.classList.add('open'); }, id);
    await check(page, `#${id}`, `#${id}`, await page.evaluate((i) => (document.getElementById(i).closest('.modal-overlay') ? `#${document.getElementById(i).closest('.modal-overlay').id} .modal-card` : null), id));
    await page.evaluate((i) => document.getElementById(i).closest('.modal-overlay')?.classList.remove('open'), id);
  }
  await ctx.close();
}

// 2) Dynamic sheets
{
  const { ctx, page } = await open(); await goto(page, 'bookings');
  await page.locator('#mobile-view-slot [data-row-menu]').first().click(); await page.locator('.row-floating-menu [data-menu-key=assign]').click(); await page.waitForTimeout(500);
  await check(page, 'Assign: search', '#asg-search', '.asg-sheet');
  await check(page, 'Assign: optional note', '#asg-note', '.asg-sheet');
  await page.locator('[data-asg-add]').click();
  await check(page, 'Assign: new member name', '#asg-add-form input[name=name]', '.asg-sheet');
  await check(page, 'Assign: new member phone', '#asg-add-form input[name=phone]', '.asg-sheet');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.locator('#mobile-view-slot [data-booking-id="BK-5022"]').first().click(); await page.waitForTimeout(500);
  await page.locator('#mobile-view-slot [data-sheet-tab="itinerary"]').first().click();
  await page.locator('#mobile-add-event-btn').click(); await page.waitForTimeout(500);
  await check(page, 'Itinerary event: title', '#itin-title', '.asg-sheet');
  await check(page, 'Itinerary event: time/subtitle', '#itin-sub', '.asg-sheet');
  await page.locator('#itin-day .dd-trigger').click(); await page.locator('#itin-day li[data-value=new]').click();
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.locator('#mobile-view-slot [data-day-menu]').first().click(); await page.locator('.row-floating-menu [data-menu-key=rename]').click(); await page.waitForTimeout(500);
  await check(page, 'Rename day: title', '#itin-day-title', '.asg-sheet');
  await ctx.close();
}
{
  const { ctx, page } = await open(); await goto(page, 'inquiries');
  await page.locator('#mobile-view-slot [data-row-menu]').first().click(); await page.locator('.row-floating-menu [data-menu-key=followup]').click(); await page.waitForTimeout(500);
  await check(page, 'Follow-up: comment', '#fu-comment', '.fu-card');
  await check(page, 'Follow-up: date (native picker field)', '#fu-date', '.fu-card');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.evaluate(() => { const ins = [...document.querySelectorAll('#mobile-view-slot [data-quick-note] input')].filter((i) => i.getClientRects().length); ins[ins.length - 1].id = 'qn-last'; document.querySelector('#mobile-view-slot #mobile-screen-scroll').scrollTop = 1e6; });
  await check(page, 'Quick note (last row)', '#qn-last', null);
  await ctx.close();
}
await browser.close();
console.log('result | field');
for (const r of rows) console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.field}${r.error ? ' | ' + r.error : ''}`);
console.log(`\n${rows.filter((r) => r.pass).length}/${rows.length} pass`);
process.exit(rows.every((r) => r.pass) ? 0 : 1);

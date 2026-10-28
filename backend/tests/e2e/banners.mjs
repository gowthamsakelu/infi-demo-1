// Browser test (not run by PHPUnit): the Banners page at 1280, 820 (tablet = PC layout) and 390.
// Cards and real images, tabs, the Grid | Order switch and moving up / down, the on / off switch saving, Add Banner doing nothing,
// the empty state and the error state. Needs the seeded banners (Database\Seeders\Pages\BannerSeeder) on the dev server (docs/pages.md):
// `BASE=http://127.0.0.1:8000/ node banners.mjs`. It changes one switch and one position and puts both back.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n').slice(0, 4).join(' | ')); summary(); process.exit(2); });

const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
for (const [w, h] of [[1280, 800], [820, 1100], [390, 844]].filter(([x]) => !only || only.includes(x))) {
  const m = w < 700;
  const tag = `@${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (x) => { if (x.type() === 'error' && !/Failed to load resource/.test(x.text())) errors.push(x.text()); });
  const wait = (ms = 350) => page.waitForTimeout(ms);
  const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  const open = async () => { await page.goto(`${BASE}#banners`, { waitUntil: 'networkidle' }); await page.waitForSelector('.bn-card, .bn-content .state-box', { timeout: 15000 }).catch(async () => { await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/banners-open-fail.png` : undefined }).catch(() => {}); throw new Error('Banners did not render'); }); await wait(400); };
  const tabs = async () => (await page.locator('.bn-tabs .tab-pill').allInnerTexts()).join('|').replace(/\s+/g, ' ');

  await signIn(page, BASE);
  // the counts come from the API, so the checks follow the data on the dev server (the seeder has 5 active, 1 scheduled, 2 draft)
  const seeded = await page.evaluate(() => fetch('/api/banners', { headers: { Accept: 'application/json' } }).then((x) => x.json()).then((j) => j.data));
  const nA = seeded.filter((b) => b.status === 'active').length;
  const nS = seeded.filter((b) => b.status === 'scheduled').length;
  const nD = seeded.filter((b) => b.status === 'draft').length;
  const counts = (a, s, d) => `All ${seeded.length}|Active ${a}|Scheduled ${s}|Draft ${d}`;
  await open();
  check(`${tag} Banners opens`, await page.locator('.sp[data-sp="banners"]').count() === 1 && true);
  check(`${tag} no horizontal scroll`, await noHScroll());
  check(`${tag} 8 cards`, await page.locator('.bn-card').count() === 8);
  if (m) check(`${tag} header counts`, new RegExp(`${seeded.length} banners · ${nA} live`).test(await page.locator('.sp-header-line').innerText()), await page.locator('.sp-header-line').innerText()); else check(`${tag} no PC title row`, await page.locator('.sp-title, .sp-sub').count() === 0);
  check(`${tag} tab counts`, (await tabs()) === counts(nA, nS, nD), await tabs());

  // columns
  const lefts = await page.evaluate(() => [...new Set([...document.querySelectorAll('.bn-card')].map((c) => Math.round(c.getBoundingClientRect().left)))].length);
  check(`${tag} ${m ? 'one column' : w >= 1000 ? 'three columns' : 'two or three columns'}`, m ? lefts === 1 : w >= 1000 ? lefts === 3 : lefts >= 2 && lefts <= 3, String(lefts));

  // real images: they load, have alt text, are lazy, and the hero keeps a fixed shape
  await page.evaluate(async () => { for (const i of document.querySelectorAll('.bn-hero img')) i.scrollIntoView({ block: 'center' }); });
  await wait(900);
  const imgs = await page.evaluate(() => [...document.querySelectorAll('.bn-card .bn-hero img')].map((i) => ({ ok: i.naturalWidth > 0, alt: !!i.alt, lazy: i.loading === 'lazy' })));
  check(`${tag} 6 banner photos, all loaded (naturalWidth > 0)`, imgs.length === 6 && imgs.every((i) => i.ok), JSON.stringify(imgs));
  check(`${tag} photos have alt text and loading=lazy`, imgs.every((i) => i.alt && i.lazy));
  check(`${tag} the two banners without a photo show their gradient`, await page.evaluate(() => [...document.querySelectorAll('.bn-card')].filter((c) => !c.querySelector('img')).every((c) => getComputedStyle(c.querySelector('.bn-hero')).backgroundImage.includes('gradient'))));
  check(`${tag} hero keeps a fixed shape (same height for every card)`, await page.evaluate(() => new Set([...document.querySelectorAll('.bn-hero')].map((e) => Math.round(e.getBoundingClientRect().height))).size === 1));
  // text over the photo stays readable: a dark shade sits between the photo and the headline
  check(`${tag} dark overlay over the photo`, await page.evaluate(() => /rgba\(15, 23, 42/.test(getComputedStyle(document.querySelector('.bn-shade')).backgroundImage)));
  check(`${tag} headline, CTA, name and meta are single-line`, await page.evaluate(() => [...document.querySelectorAll('.bn-copy h3, .bn-copy p, .bn-name b, .bn-name small')].every((e) => e.getBoundingClientRect().height < 34 && getComputedStyle(e).whiteSpace === 'nowrap')));
  check(`${tag} pills and stats never wrap`, await page.evaluate(() => [...document.querySelectorAll('.bn-card .status-pill, .bn-stats span')].every((e) => e.getBoundingClientRect().height < 34)));
  const first = await page.locator('.bn-card').first().innerText();
  check(`${tag} card has headline, CTA, status, position, dates, clicks / leads / converted`, /Kashmir in snow/.test(first) && /Book from ₹15,000/.test(first) && /Active/.test(first) && /slot 1/.test(first) && /Jan – 28 Dec/.test(first) && /1,240\s*clicks/.test(first) && /14\s*leads/.test(first) && /3\s*converted/.test(first), first.replace(/\s+/g, ' '));

  // tabs
  await page.locator('[data-bn-tab="active"]').click(); await wait();
  check(`${tag} Active tab: ${nA} cards`, await page.locator('.bn-card').count() === nA);
  await page.locator('[data-bn-tab="scheduled"]').click(); await wait();
  check(`${tag} Scheduled tab: 1 card with a start date`, await page.locator('.bn-card').count() === 1 && /Diwali Offer/.test(await page.locator('.bn-card').innerText()));
  await page.locator('[data-bn-tab="draft"]').click(); await wait();
  check(`${tag} Draft tab: ${nD} cards, switches off`, await page.locator('.bn-card').count() === nD && await page.locator('.bn-card [role="switch"][aria-checked="false"]').count() === nD);
  await page.locator('[data-bn-tab="all"]').click(); await wait();

  // the on / off switch saves with PATCH
  const sw = page.locator('.bn-card').first().locator('[role="switch"]');
  const patched = page.waitForResponse((r) => /\/api\/banners\/\d+$/.test(r.url()) && r.request().method() === 'PATCH');
  await sw.click();
  check(`${tag} switch sends a PATCH that succeeds`, (await patched).ok());
  await wait(500);
  check(`${tag} the card is now Draft and the counts moved`, (await tabs()) === counts(nA - 1, nS, nD + 1) && /Draft/.test(await page.locator('.bn-card').first().innerText()), await tabs());
  await open();
  check(`${tag} the change survives a reload`, (await tabs()) === counts(nA - 1, nS, nD + 1));
  const back = page.waitForResponse((r) => /\/api\/banners\/\d+$/.test(r.url()) && r.request().method() === 'PATCH');
  await page.locator('.bn-card').first().locator('[role="switch"]').click(); await back; await wait(500);
  check(`${tag} switched back on`, (await tabs()) === counts(nA, nS, nD), await tabs());

  // row menu
  await page.locator('.bn-card').first().locator('[data-bn-more]').click(); await wait(300);
  const items = await page.locator('.row-floating-menu button').allInnerTexts();
  check(`${tag} card menu: switch off and move later`, items.some((t) => /Switch off/.test(t)) && items.some((t) => /Move later/.test(t)) && !items.some((t) => /Move earlier/.test(t)), items.join('|'));
  await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await wait(300);

  // order view
  await page.locator('[data-bn-mode="order"]').click(); await wait(400);
  check(`${tag} Order view lists 8 rows with the position`, await page.locator('.bn-order-row').count() === 8 && (await page.locator('.bn-order-no').first().innerText()) === '1');
  check(`${tag} Order view: no horizontal scroll, single-line names`, await noHScroll() && await page.evaluate(() => [...document.querySelectorAll('.bn-order-text b, .bn-order-text small')].every((e) => e.getBoundingClientRect().height < 24)));
  const nameAt = (i) => page.locator('.bn-order-row .bn-order-text b').nth(i).innerText();
  const [a0, a1] = [await nameAt(0), await nameAt(1)];
  const reordered = page.waitForResponse((r) => /\/api\/banners\/reorder$/.test(r.url()) && r.request().method() === 'POST');
  await page.locator('.bn-order-row').first().locator('[data-bn-move="down"]').click();
  check(`${tag} Move later saves the order`, (await reordered).ok());
  await wait(500);
  check(`${tag} the first two swapped`, (await nameAt(0)) === a1 && (await nameAt(1)) === a0);
  await page.locator('.bn-order-row').nth(1).locator('[data-bn-move="up"]').click(); await wait(700);
  check(`${tag} moved back`, (await nameAt(0)) === a0);
  check(`${tag} first row cannot move earlier`, await page.locator('.bn-order-row').first().locator('[data-bn-move="up"]').isDisabled());
  await page.locator('[data-bn-mode="grid"]').click(); await wait(300);
  check(`${tag} back to the grid`, await page.locator('.bn-card').count() === 8);

  // Add Banner does nothing
  const add = page.locator(m ? '#mobile-page-add' : '#desktop-page-add');
  check(`${tag} Add Banner is drawn`, await add.isVisible() && /^Add$/.test((await add.innerText()).trim()));
  await add.click(); await wait(400);
  await page.locator('#desktop-page-add, #mobile-page-add').first().click(); await wait(700);
  check(`${tag} Add Banner opens the shared wizard`, await page.locator('.wiz-sheet').count() === 1 && await page.locator('.bg-row, .bn-card').count() === 8);
  await page.keyboard.press('Escape'); await wait(500);
  check(`${tag} no field focused`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));
  check(`${tag} the only solid primary button is Add Banner in the top bar (no title row)`, m || (await page.locator('.sp .btn-primary-desktop:visible').count() === 0 && await page.locator('.sp-titlebar, .sp-actions, .sp-add').count() === 0 && await page.locator('#desktop-page-add.btn-primary-desktop').isVisible()));

  // empty and error states
  await page.route('**/api/banners', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.goto(`${BASE}#banners`, { waitUntil: 'networkidle' }); await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} empty data shows the shared empty state`, /No banners yet/.test(await page.locator('.bn-content').innerText()) && await noHScroll());
  await page.unroute('**/api/banners');
  await page.route('**/api/banners', (r) => r.abort());
  await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} a failing API shows the shared error state`, /Could not load banners/.test(await page.locator('.bn-content').innerText()) && await page.locator('#bn-retry').count() === 1);
  await page.unroute('**/api/banners');
  await page.locator('#bn-retry').click();
  await page.waitForSelector('.bn-card', { timeout: 8000 }).catch(() => {});
  check(`${tag} Try again loads the cards`, await page.locator('.bn-card').count() === 8);

  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

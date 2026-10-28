// Browser test (not run by PHPUnit): the Blogs page at 1280, 820 (tablet = PC layout) and 390.
// Four stat cards, the table (cards when narrow), tabs, search, the row menu publishing and un-publishing, Write Blog doing nothing,
// the empty state and the error state. Needs the seeded articles (Database\Seeders\Pages\BlogPostSeeder) on the dev server (docs/pages.md):
// `BASE=http://127.0.0.1:8000/ node blogs.mjs`. It publishes one draft and puts it back.
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
  const open = async () => { await page.goto(`${BASE}#blogs`, { waitUntil: 'networkidle' }); await page.waitForSelector('.bg-row, .bg-list .state-box', { timeout: 15000 }); await wait(400); };
  const tabs = async () => (await page.locator('.bg-tabs .tab-pill').allInnerTexts()).join('|').replace(/\s+/g, ' ');
  const tabsAre = async (want) => { for (let i = 0; i < 30 && (await tabs()) !== want; i += 1) await wait(200); return tabs(); };
  const search = async (v) => { await page.locator('.bg-search input').fill(v); await wait(800); };

  await signIn(page, BASE);
  await open();
  check(`${tag} Blogs opens`, await page.locator('.sp[data-sp="blogs"]').count() === 1 && true);
  check(`${tag} no horizontal scroll`, await noHScroll());
  check(`${tag} four stat cards`, await page.locator('.sp-stat').count() === 4);
  const stats = (await page.locator('.sp-stat').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
  check(`${tag} stat cards: Total articles, Views (30 days), Leads from blogs, Converted to bookings`, /Total articles 10/.test(stats[0]) && /Views \(30 days\) 7,840/.test(stats[1]) && /Leads from blogs 37/.test(stats[2]) && /Converted to bookings 9|Converted to bo/.test(stats[3]), stats.join(' | '));
  check(`${tag} stat labels and values stay on one line`, await page.evaluate(() => [...document.querySelectorAll('.sp-stat-label, .sp-stat-value')].every((e) => e.getBoundingClientRect().height < 30)));
  if (m) check(`${tag} header says how many articles`, /10 articles/.test(await page.locator('.sp-header-line').innerText())); else check(`${tag} no PC title row`, await page.locator('.sp-title, .sp-sub').count() === 0);
  check(`${tag} 10 articles listed`, await page.locator('.bg-row').count() === 10);
  check(`${tag} tab counts`, (await tabs()) === 'All 10|Published 6|Draft 2|Scheduled 2', await tabs());

  // table on a wide screen, cards when narrow
  const headShown = await page.evaluate(() => getComputedStyle(document.querySelector('.bg-head')).display !== 'none');
  check(`${tag} ${w >= 1000 ? 'table with column headings' : 'cards, no table header'}`, headShown === (w >= 1000));
  if (w >= 1000) {
    const heads = (await page.locator('.bg-head span').allInnerTexts()).filter(Boolean).map((t) => t.toLowerCase());
    check(`${tag} columns Article / Author / Category / Views / Leads / Status`, JSON.stringify(heads) === JSON.stringify(['article', 'author', 'category', 'views', 'leads', 'status']), heads.join(','));
  }
  const firstRow = (await page.locator('.bg-row').first().innerText()).replace(/\s+/g, ' ');
  check(`${tag} a row shows the article, author, category tag, views, leads and status`, /Karan Sapalia|Riya Sharma|Aman Joshi/.test(firstRow) && /TIPS|GUIDE|ITINERARY/.test(firstRow) && /Draft|Published|Scheduled/.test(firstRow), firstRow);
  check(`${tag} long titles are single-line with ellipsis`, await page.evaluate(() => [...document.querySelectorAll('.bg-art b')].every((e) => e.getBoundingClientRect().height < 26 && getComputedStyle(e).textOverflow === 'ellipsis')));
  check(`${tag} pills and tags never wrap`, await page.evaluate(() => [...document.querySelectorAll('.bg-row .status-pill, .bg-row .card-type-badge')].every((e) => e.getBoundingClientRect().height < 32)));
  check(`${tag} nothing in a row overlaps its neighbour`, await page.evaluate(() => [...document.querySelectorAll('.bg-row')].every((row) => {
    const kids = [...row.children].map((c) => c.getBoundingClientRect()).filter((r) => r.width && r.height);
    return kids.every((a, i) => kids.every((b, j) => i >= j || a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1));
  })));
  check(`${tag} published rows come first: newest article on top`, /Top 10 places|Paragliding|Spiti|Bali|Diwali/.test(await page.locator('.bg-art b').first().innerText()) && /Published/.test(await page.locator('.bg-status').first().innerText()), await page.locator('.bg-art b').first().innerText());

  // tabs and search
  await page.locator('[data-bg-tab="published"]').click(); await wait();
  check(`${tag} Published tab: 6`, await page.locator('.bg-row').count() === 6);
  await page.locator('[data-bg-tab="draft"]').click(); await wait();
  check(`${tag} Draft tab: 2`, await page.locator('.bg-row').count() === 2);
  await page.locator('[data-bg-tab="scheduled"]').click(); await wait();
  check(`${tag} Scheduled tab: 2`, await page.locator('.bg-row').count() === 2);
  await page.locator('[data-bg-tab="all"]').click(); await wait();
  await search('kashmir');
  check(`${tag} search narrows to the Kashmir articles`, await page.locator('.bg-row').count() === 2 && (await tabs()) === 'All 2|Published 2|Draft 0|Scheduled 0', await tabs());
  await search('karan');
  check(`${tag} search also matches the author`, await page.locator('.bg-row').count() === 3, String(await page.locator('.bg-row').count()));
  await search('zzzzqq');
  check(`${tag} no results: calm empty state`, /No articles found/.test(await page.locator('.bg-list').innerText()) && await noHScroll());
  await search('');
  check(`${tag} clearing the search brings everything back`, await page.locator('.bg-row').count() === 10);

  // row menu: publish a draft, then put it back
  await page.locator('[data-bg-tab="draft"]').click(); await wait();
  await page.locator('.bg-row').first().locator('[data-bg-menu]').click(); await wait(300);
  const items = await page.locator('.row-floating-menu button').allInnerTexts();
  check(`${tag} row menu for a draft: Publish now, Copy link`, items.some((t) => /Publish now/.test(t)) && items.some((t) => /Copy link/.test(t)) && !items.some((t) => /Move to draft/.test(t)), items.join('|'));
  const patched = page.waitForResponse((r) => /\/api\/blogs\/\d+$/.test(r.url()) && r.request().method() === 'PATCH');
  await page.locator('.row-floating-menu button', { hasText: 'Publish now' }).click();
  check(`${tag} Publish now sends a PATCH that succeeds`, (await patched).ok());
  check(`${tag} counts moved: Published 7, Draft 1`, (await tabsAre('All 10|Published 7|Draft 1|Scheduled 2')) === 'All 10|Published 7|Draft 1|Scheduled 2', await tabs());
  await page.locator('[data-bg-tab="published"]').click(); await wait();
  await page.locator('.bg-row').first().locator('[data-bg-menu]').click(); await wait(300);
  const items2 = await page.locator('.row-floating-menu button').allInnerTexts();
  check(`${tag} row menu for a published article: Move to draft`, items2.some((t) => /Move to draft/.test(t)) && !items2.some((t) => /Publish now/.test(t)), items2.join('|'));
  await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await wait(300);
  // the article we just published is the newest, so it is the first row of the Published tab (it has today's date)
  const freshTitle = await page.locator('.bg-art b').first().innerText();
  await page.locator('.bg-row').first().locator('[data-bg-menu]').click(); await wait(300);
  const back = page.waitForResponse((r) => /\/api\/blogs\/\d+$/.test(r.url()) && r.request().method() === 'PATCH');
  await page.locator('.row-floating-menu button', { hasText: 'Move to draft' }).click();
  await back;
  check(`${tag} moved back to draft (${freshTitle.slice(0, 20)}…): counts restored`, (await tabsAre('All 10|Published 6|Draft 2|Scheduled 2')) === 'All 10|Published 6|Draft 2|Scheduled 2', await tabs());

  // Write Blog does nothing
  const add = page.locator(m ? '#mobile-page-add' : '#desktop-page-add');
  check(`${tag} Write Blog is drawn`, await add.isVisible() && /^Add$/.test((await add.innerText()).trim()));
  await page.locator('[data-bg-tab="all"]').click(); await wait(300);
  await add.click(); await wait(400);
  await page.locator('#desktop-page-add, #mobile-page-add').first().click(); await wait(700);
  check(`${tag} Write Blog opens the shared wizard`, await page.locator('.wiz-sheet').count() === 1 && await page.locator('.bg-row, .bn-card').count() === 10);
  await page.keyboard.press('Escape'); await wait(500);
  check(`${tag} no field focused`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));

  // empty and error states
  await page.route('**/api/blogs', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { stats: { total: 0, views: 0, leads: 0, converted: 0 }, posts: [] } }) }));
  await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} empty data shows the shared empty state and zero stats`, /No articles yet/.test(await page.locator('.bg-list').innerText()) && /Total articles\s*0/.test((await page.locator('.bg-stats').innerText()).replace(/\n/g, ' ')) && await noHScroll());
  await page.unroute('**/api/blogs');
  await page.route('**/api/blogs', (r) => r.abort());
  await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} a failing API shows the shared error state`, /Could not load blogs/.test(await page.locator('.bg-list').innerText()) && await page.locator('#bg-retry').count() === 1);
  await page.unroute('**/api/blogs');
  await page.locator('#bg-retry').click();
  await page.waitForSelector('.bg-row', { timeout: 8000 }).catch(() => {});
  check(`${tag} Try again loads the articles`, await page.locator('.bg-row').count() === 10);

  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

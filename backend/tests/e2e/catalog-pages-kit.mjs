// Shared by tour-packages.mjs, transport.mjs, stays.mjs and adventures.mjs (browser tests, not run by PHPUnit).
// One run per viewport (1280, 820 = tablet with the PC layout, 390 = phone) of the checks every split page must pass; each script adds its own.
// Needs a dev server on a database with the page's tables and seeders (see docs/pages.md): `BASE=http://127.0.0.1:8000/ node <key>.mjs`.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

export const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const results = [];
const fail = [];

export const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
export function summary() {
  const failed = results.filter(([, ok]) => !ok);
  console.log(`${results.length - failed.length}/${results.length} passed`);
  fail.forEach((f) => console.log('FAIL', f));
  return failed.length;
}
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n').slice(0, 4).join(' | ')); summary(); process.exit(2); });

export const selected = (page) => new URL(page.url()).searchParams.get('selected');

/**
 * @param {object} cfg
 *   key, label (the page title), addLabel, plural ("packages"), rows (how many records are seeded), first (name of the first record),
 *   hit { q, name } a search that finds exactly one record, tabs [{ key, count }], api (path to fail / empty), extra(env) for page specifics,
 *   filter (optional) { labels: ['Any AC', 'AC', 'Non-AC'], value: 'ac', count } for the labelled filter dropdown beside the search box
 */
export async function runCatalogSuite(cfg) {
  const browser = await chromium.launch({ channel: 'chrome' });
  if (cfg.prepare) { // what the list should hold comes from the API itself, so the script follows the seeded data
    const c = await browser.newContext();
    const p = await c.newPage();
    await signIn(p, BASE);
    const data = await p.evaluate(async (u) => (await (await fetch(u, { headers: { Accept: 'application/json' } })).json()).data, cfg.api);
    await c.close();
    Object.assign(cfg, cfg.prepare(data));
  }
  for (const [w, h] of [[1280, 800], [820, 1100], [390, 844]].filter(([vw]) => !process.env.ONLY || String(vw) === process.env.ONLY)) { // ONLY=390 runs one viewport
    const m = w < 700;
    const tag = `@${w}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (x) => { if (x.type() === 'error' && !/Failed to load resource|net::ERR/.test(x.text())) errors.push(x.text()); });
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.body.scrollWidth <= innerWidth + 1);
    const open = async (query = '') => { await page.goto('about:blank'); await page.goto(`${BASE}${query}#${cfg.key}`, { waitUntil: 'networkidle' }); await page.locator('.sp-row, .sp-list .state-box').first().waitFor().catch(() => {}); await wait(900); };
    const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';
    const name = () => page.locator('.sp-detail-head .customer-name-title').innerText();
    const search = '.sp .compact-search-bar input, .sp .search-input-wrapper input';

    await signIn(page, BASE);

    // opening the page from the shell
    if (!m) await page.locator(`${slot} #nav-${cfg.key}`).click();
    else { await page.locator('#mobile-more-btn').click(); await wait(600); await page.locator(`.more-sheet [data-nav="${cfg.key}"]`).click(); }
    await page.locator('.sp-row').first().waitFor().catch(() => {});
    await wait(600);
    check(`${tag} ${cfg.label} opens from the menu`, new RegExp(`#${cfg.key}`).test(page.url()) && await page.locator(`.sp[data-sp="${cfg.key}"]`).count() === 1);
    check(`${tag} no horizontal scroll`, await noHScroll());
    check(`${tag} ${cfg.rows} ${cfg.plural} listed`, await page.locator('.sp-row').count() === cfg.rows, String(await page.locator('.sp-row').count()));
    if (m) check(`${tag} header shows the count`, new RegExp(`${cfg.label} • ${cfg.rows} Total`).test(await page.locator('.sp-header-line').innerText()), await page.locator('.sp-header-line').innerText());
    else check(`${tag} no title row (Add lives in the top bar)`, await page.locator('.sp-titlebar, .sp-sub, .sp-add, .sp-export, .sp-search-row').count() === 0);
    check(`${tag} the keyboard did not open`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));

    if (!m) {
      check(`${tag} first record selected, URL has ?selected=`, !!selected(page) && await page.locator('.sp-row.active').count() === 1 && (await name()).includes(cfg.first), `${selected(page)} ${await name()}`);
      const secondId = await page.locator('.sp-row').nth(1).getAttribute('data-sp-id');
      await page.locator('.sp-row').nth(1).click(); await wait();
      check(`${tag} clicking another record switches the pane`, selected(page) === secondId && !(await name()).includes(cfg.first));
      await page.goto('about:blank'); await page.goto(`${BASE}?selected=${secondId}#${cfg.key}`, { waitUntil: 'networkidle' }); await wait(1200);
      check(`${tag} ?selected= opens that record after a reload`, selected(page) === secondId && await page.locator('.sp-row.active').count() === 1);
      await page.goto('about:blank'); await page.goto(`${BASE}?selected=999999#${cfg.key}`, { waitUntil: 'networkidle' }); await wait(1200);
      check(`${tag} an unknown id falls back to the first`, (await name()).includes(cfg.first));
    } else {
      check(`${tag} phone: nothing opens by itself`, selected(page) === null && await page.locator('.sp-detail.is-open').count() === 0);
      await page.locator('.sp-row').nth(1).click(); await wait(500);
      check(`${tag} phone: tapping a card opens the detail full screen`, !!selected(page) && await page.locator('.sp-detail.is-open').count() === 1);
      check(`${tag} phone: no horizontal scroll in the detail`, await noHScroll());
      check(`${tag} phone: no text overlap in the header`, await page.evaluate(() => { const r = (s) => document.querySelector(s)?.getBoundingClientRect(); const a = r('.sp-detail-head .customer-name-title'); const b = r('.sp-back'); return !a || !b || a.right <= b.left + 1; }));
      await page.locator('.sp-back').click(); await wait(500);
      check(`${tag} phone: back arrow returns to the list`, selected(page) === null && await page.locator('.sp-detail.is-open').count() === 0);
      await page.locator('.sp-row').nth(2).click(); await wait(400);
      await page.goBack(); await wait(500);
      check(`${tag} phone: browser back closes the detail`, await page.locator('.sp-detail.is-open').count() === 0 && new RegExp(`#${cfg.key}`).test(page.url()));
    }

    // search and tabs
    await page.locator(search).fill(cfg.hit.q); await wait(900);
    check(`${tag} search narrows the list`, await page.locator('.sp-row').count() === 1 && (await page.locator('.sp-row').first().innerText()).includes(cfg.hit.name), String(await page.locator('.sp-row').count()));
    await page.locator(search).fill('zzzzqq'); await wait(900);
    check(`${tag} no results: calm empty states`, new RegExp(`No ${cfg.plural} found`).test(await page.locator('.sp-list').innerText()) && (m || /No records to show/.test(await page.locator('.sp-detail-body').innerText())));
    await page.locator(search).fill(''); await wait(900);
    const tabText = (await page.locator('.sp-tabs [role="tab"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').replace(/ \((\d+)\)$/, ' $1').trim());
    for (const t of cfg.tabs) {
      const label = tabText.find((x) => x.startsWith(t.label));
      check(`${tag} tab ${t.label} count`, label === `${t.label} ${t.count}`, JSON.stringify(tabText));
      await page.locator(`[data-sp-tab="${t.key}"]`).click(); await wait(450);
      check(`${tag} tab ${t.label} lists ${t.count}`, await page.locator('.sp-row').count() === t.count, String(await page.locator('.sp-row').count()));
    }
    await page.locator('[data-sp-tab="all"]').click(); await wait(400);

    // the labelled filter beside the search box (cfg.filter: { labels: [all, ...options], value, count })
    if (cfg.filter) {
      await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
      const opts = (await page.locator('.sp-filter-slot li').allInnerTexts()).map((t) => t.trim());
      check(`${tag} filter options`, opts.join('|') === cfg.filter.labels.join('|'), opts.join('|'));
      await page.locator(`.sp-filter-slot li[data-value="${cfg.filter.value}"]`).click(); await wait(600);
      check(`${tag} filter ${cfg.filter.value} lists ${cfg.filter.count}`, await page.locator('.sp-row').count() === cfg.filter.count, String(await page.locator('.sp-row').count()));
      await page.locator('.sp-filter-slot .dd-trigger').click(); await wait(200);
      await page.locator('.sp-filter-slot li[data-value=""]').click(); await wait(600);
      check(`${tag} ${cfg.filter.labels[0]} brings them all back`, await page.locator('.sp-row').count() === cfg.rows);
    }

    // text never wraps, Add does nothing
    check(`${tag} single-line names with ellipsis`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .card-title, .sp-row .row-trip')].every((e) => e.getBoundingClientRect().height < 24)));
    check(`${tag} pills and tags never wrap`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .status-pill, .sp-row .card-type-badge')].every((e) => e.getBoundingClientRect().height < 26)));
    const add = m ? '#mobile-page-add' : '#desktop-page-add';
    check(`${tag} ${cfg.addLabel} button is drawn with its label`, await page.locator(add).isVisible() && (await page.locator(add).innerText()).includes(cfg.addLabel), await page.locator(add).innerText());
    await page.locator(add).click(); await wait(400);
    check(`${tag} ${cfg.addLabel} does nothing yet`, await page.locator('.modal-overlay.open, .asg-overlay, .wiz-sheet').count() === 0);

    await cfg.extra?.({ cfg, page, w, m, tag, wait, noHScroll, open, name, slot });

    // empty data and a failing API, on the same page
    await page.route(`**${cfg.api}`, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
    await open();
    check(`${tag} empty data shows the shared empty state`, new RegExp(`No ${cfg.plural} yet`).test(await page.locator('.sp-list').innerText()) && await noHScroll());
    await page.unroute(`**${cfg.api}`);
    await page.route(`**${cfg.api}`, (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"boom"}' }));
    await open();
    check(`${tag} a failing API shows the shared error state`, await page.locator('.sp-list .state-box.is-error').count() === 1 && await noHScroll());
    await page.unroute(`**${cfg.api}`);
    await page.screenshot({ path: process.env.SHOTS ? `${process.env.SHOTS}/${cfg.key}-${w}-error.png` : undefined }).catch(() => {});
    await page.locator('#sp-retry').click(); await page.locator('.sp-row').first().waitFor().catch(() => {}); await wait(400);
    check(`${tag} Try again loads the list`, await page.locator('.sp-row').count() === cfg.rows);

    check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
  process.exit(summary() ? 1 : 0);
}

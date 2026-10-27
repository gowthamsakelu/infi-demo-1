// Browser test (not run by PHPUnit): the Stays page. The shared split-page checks (catalog-pages-kit.mjs) plus the detail tabs
// (contact, rooms and rates by meal plan). Run: `BASE=http://127.0.0.1:8000/ node stays.mjs`
import { runCatalogSuite, check } from './catalog-pages-kit.mjs';

await runCatalogSuite({
  key: 'stays', label: 'Stays', addLabel: 'Add Stay', plural: 'stays', api: '/api/stays',
  prepare: (rows) => ({
    rows: rows.length, first: rows[0].name, focus: rows.find((r) => r.name === 'Hotel Lake View').id, hit: { q: 'Lake Pichola Villa', name: 'Lake Pichola Villa' },
    tabs: ['hotel', 'villa', 'resort'].map((t) => ({ key: `${t}s`, label: `${t[0].toUpperCase()}${t.slice(1)}s`, count: rows.filter((r) => r.tag === t).length })),
  }),
  extra: async ({ page, m, tag, wait, noHScroll, open, cfg }) => {
    await open(m ? '' : `?selected=${cfg.focus}`);
    if (m) { await page.locator(`.sp-row[data-sp-id="${cfg.focus}"]`).click(); await wait(600); }
    check(`${tag} header: city, rating and the tag`, /Srinagar/.test(await page.locator('.customer-trip-subtitle').innerText()) && await page.locator('.customer-title-row .card-type-badge').count() === 1);
    check(`${tag} Overview: stats and contact`, await page.locator('.sp-stat').count() === 3 && /Phone/.test(await page.locator('.sp-detail-body').innerText()));
    await page.locator('[data-sp-dtab="rooms"]').click(); await wait(500);
    check(`${tag} Rooms & Rates: 4 room cards with 4 meal-plan rates`, await page.locator('.st-room').count() === 4 && await page.locator('.st-room').first().locator('.st-rates > div').count() === 4);
    check(`${tag} Rooms & Rates: no overflow`, await noHScroll());
    await page.locator('[data-sp-dtab="plans"]').click(); await wait(400);
    check(`${tag} Meal plans: four starting rates`, await page.locator('.sp-detail-body .sp-linkrow').count() === 4);
    await page.locator('[data-sp-dtab="overview"]').click(); await wait(300);
    check(`${tag} footer: primary button plus Edit and Call`, await page.locator('.sp-detail-foot .btn-confirm-booking').count() === 1 && await page.locator('.sp-detail-foot [data-sp-act="call"]').count() === 1);
  },
});

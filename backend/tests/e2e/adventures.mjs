// Browser test (not run by PHPUnit): the Adventures page. The shared split-page checks (catalog-pages-kit.mjs) plus the detail
// (stats, details grid, pricing tiers). Run: `BASE=http://127.0.0.1:8000/ node adventures.mjs`
import { runCatalogSuite, check } from './catalog-pages-kit.mjs';

await runCatalogSuite({
  key: 'adventures', label: 'Adventures', addLabel: 'Add Adventure', plural: 'adventures', api: '/api/adventures',
  prepare: (rows) => ({
    rows: rows.length, first: rows[0].name, focus: rows.find((r) => r.name === 'Gulmarg Gondola, Phase 1 and 2').id, hit: { q: 'Shikara', name: 'Shikara ride on Dal Lake' },
    tabs: ['adventure', 'sightseeing', 'water', 'culture'].map((t) => ({ key: t, label: `${t[0].toUpperCase()}${t.slice(1)}`, count: rows.filter((r) => r.tag === t).length })),
  }),
  extra: async ({ page, m, tag, wait, noHScroll, open, cfg }) => {
    await open(m ? '' : `?selected=${cfg.focus}`);
    if (m) { await page.locator(`.sp-row[data-sp-id="${cfg.focus}"]`).click(); await wait(600); }
    check(`${tag} Overview: 3 stats, the details grid and 3 pricing tiers`, await page.locator('.sp-stat').count() === 3 && await page.locator('.sp-grid2 > div').count() === 6 && await page.locator('.sp-detail-body .sp-linkrow').count() === 3);
    check(`${tag} Gulmarg Gondola: 1,800 for an adult`, /₹1,800/.test(await page.locator('.sp-detail-body').innerText()));
    check(`${tag} no overflow in the detail`, await noHScroll());
    await page.locator('[data-sp-dtab="pricing"]').click(); await wait(400);
    check(`${tag} Pricing tab: Adult, Child, Private group`, /Adult/.test(await page.locator('.sp-detail-body').innerText()) && /Private group/.test(await page.locator('.sp-detail-body').innerText()));
    await page.locator('.sp-detail-foot .btn-confirm-booking').click(); await wait(400);
    check(`${tag} "Add to an itinerary" does nothing`, await page.locator('.modal-overlay.open, .asg-overlay').count() === 0);
  },
});

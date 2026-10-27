// Browser test (not run by PHPUnit): the Tour Packages page. The shared split-page checks (catalog-pages-kit.mjs) plus the detail tabs,
// the day-wise timeline and "Use as itinerary for an inquiry" opening the itinerary builder prefilled. Run: `BASE=http://127.0.0.1:8000/ node tour-packages.mjs`
import { runCatalogSuite, check } from './catalog-pages-kit.mjs';

await runCatalogSuite({
  key: 'tour-packages', label: 'Tour Packages', addLabel: 'Add Package', plural: 'packages', api: '/api/tour-packages',
  prepare: (rows) => ({
    rows: rows.length, first: rows[0].name, hit: { q: 'rafting', name: 'Rishikesh Rafting Weekend' },
    tabs: [
      { key: 'published', label: 'Published', count: rows.filter((r) => r.status === 'published').length },
      { key: 'draft', label: 'Draft', count: rows.filter((r) => r.status === 'draft').length },
      { key: 'seasonal', label: 'Seasonal', count: rows.filter((r) => r.seasonal).length },
    ],
  }),
  extra: async ({ page, m, tag, wait, noHScroll, open }) => {
    await open(m ? '' : '?selected=1');
    if (m) { await page.locator('.sp-row').first().click(); await wait(600); }
    check(`${tag} detail shows price and the destination`, /₹15,000/.test(await page.locator('.sp-detail-head').innerText()) && /Kashmir/.test(await page.locator('.sp-detail-head').innerText()));
    check(`${tag} Overview has four stat cards`, await page.locator('.sp-stat').count() === 4);
    await page.locator('[data-sp-dtab="itinerary"]').click(); await wait(600);
    check(`${tag} Itinerary: 5 days on a timeline, 3 events on day 1`, await page.locator('.tp-timeline .itinerary-day-section').count() === 5 && await page.locator('.tp-timeline .itinerary-day-section').first().locator('.itinerary-card-item').count() === 3);
    check(`${tag} Itinerary: day column is narrow, cards are wide`, await page.evaluate(() => { const d = document.querySelector('.tp-timeline .timeline-day-col').getBoundingClientRect().width; const c = document.querySelector('.tp-timeline .itinerary-card-item').getBoundingClientRect().width; return d <= 60 && c > d * 3; }));
    check(`${tag} Itinerary: no overflow`, await noHScroll());
    await page.locator('[data-sp-dtab="pricing"]').click(); await wait(300);
    check(`${tag} Pricing lists the tiers`, await page.locator('.sp-detail-body .sp-linkrow').count() === 4);
    await page.locator('[data-sp-dtab="inclusions"]').click(); await wait(300);
    check(`${tag} Inclusions lists included and not included`, await page.locator('.tp-list li').count() >= 8);
    await page.locator('[data-sp-dtab="inquiries"]').click(); await wait(300);
    check(`${tag} Inquiries tab opens`, /Inquiries/.test(await page.locator('.sp-detail-tabs [aria-selected="true"]').innerText()));
    check(`${tag} the old spelling never appears`, !/enquir/i.test(await page.locator('.sp-detail').innerText()));

    // the builder, prefilled
    await page.locator('[data-sp-act="use-itinerary"]').click(); await page.locator('.tp-pick').first().waitFor().catch(() => {}); await wait(300);
    check(`${tag} Use as itinerary opens the inquiry chooser`, await page.locator('.tp-chooser').count() === 1 && await page.locator('.tp-pick').count() > 0);
    check(`${tag} chooser: no field focused`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));
    await page.locator('.tp-pick').first().click(); await wait(700);
    if (!(await page.locator('.bld-sheet').count()) && await page.getByRole('button', { name: 'Replace' }).count()) {
      await page.getByRole('button', { name: 'Replace' }).click(); await wait(700);
    }
    check(`${tag} the itinerary builder opens`, await page.locator('.bld-sheet').count() === 1);
    const txt = await page.locator('.bld-sheet').innerText();
    check(`${tag} the builder shows the package days`, /Day 1/.test(txt) && /Day 5/.test(txt), txt.slice(0, 300));
    check(`${tag} builder: no horizontal scroll`, await noHScroll());
    await page.keyboard.press('Escape'); await wait(500);
    if (await page.locator('.bld-sheet').count()) { await page.getByRole('button', { name: 'Discard' }).click().catch(() => {}); await wait(400); }
  },
});

// Browser test (not run by PHPUnit): the Transport page. The shared split-page checks (catalog-pages-kit.mjs) plus the two switches:
// they track unsaved changes (the shared discard confirm when switching records), save with PATCH, and the builder's vehicle list follows.
// Run: `BASE=http://127.0.0.1:8000/ node transport.mjs`. It puts the first vehicle's switches back at the end, so the data is left as it was.
import { runCatalogSuite, check } from './catalog-pages-kit.mjs';

await runCatalogSuite({
  key: 'transport', label: 'Transport', addLabel: 'Add Vehicle', plural: 'vehicles', api: '/api/transport',
  prepare: (rows) => ({
    rows: rows.length, first: rows[0].name, hit: { q: 'tempo', name: 'Tempo Traveller' },
    tabs: [
      { key: 'cars', label: 'Cars', count: rows.filter((r) => ['car', 'van'].includes(r.category) && !['self_drive', 'scooter_bike'].includes(r.key)).length },
      { key: 'buses', label: 'Buses', count: rows.filter((r) => r.category === 'bus' || r.key === 'bus').length },
      { key: 'rentals', label: 'Rentals', count: rows.filter((r) => ['self_drive', 'scooter_bike'].includes(r.key)).length },
    ],
  }),
  extra: async ({ page, m, tag, wait, noHScroll, open, name }) => {
    await open(m ? '' : '?selected=1');
    if (m) { await page.locator('.sp-row').first().click(); await wait(600); }
    const discardAsked = () => page.getByText('Discard your changes?').count();
    check(`${tag} Rates: daily rate, trips and average days`, await page.locator('.sp-stat').count() === 3 && /₹3,500/.test(await page.locator('.sp-stat').first().innerText()));
    check(`${tag} Rates: rate card has four rows`, await page.locator('.sp-group').first().locator('.sp-linkrow').count() === 4);
    check(`${tag} two switches, both on for the first vehicle`, await page.locator('.sp-switch.is-on').count() === 2);
    check(`${tag} no overflow in the detail`, await noHScroll());

    if (!m) {
      const first = await name();
      await page.locator('.sp-row').nth(1).click(); await wait(500);
      check(`${tag} switching records is free while nothing changed`, await discardAsked() === 0 && (await name()) !== first);
      await page.locator('.sp-row').first().click(); await wait(400);
    }

    await page.locator('[data-sp-toggle="mostPopular"]').click(); await wait(250);
    check(`${tag} the switch flips`, await page.locator('[data-sp-toggle="mostPopular"]').getAttribute('aria-checked') === 'false');
    if (!m) {
      await page.locator('.sp-row').nth(1).click(); await wait(500);
      check(`${tag} dirty: Discard your changes? appears (Keep editing / Discard)`, await discardAsked() === 1 && await page.getByRole('button', { name: 'Keep editing' }).count() === 1);
      await page.getByRole('button', { name: 'Keep editing' }).click(); await wait(400);
      check(`${tag} Keep editing stays on the record with the switch off`, await page.locator('[data-sp-toggle="mostPopular"]').getAttribute('aria-checked') === 'false');
      await page.locator('.sp-row').nth(1).click(); await wait(500);
      await page.getByRole('button', { name: 'Discard', exact: true }).click(); await wait(600);
      await page.locator('.sp-row').first().click(); await wait(500);
      check(`${tag} Discard drops the change`, await page.locator('[data-sp-toggle="mostPopular"]').getAttribute('aria-checked') === 'true');

      await page.locator('[data-sp-toggle="mostPopular"]').click(); await wait(200);
      await page.locator('#desktop-view-slot #nav-dashboard').click(); await wait(500);
      check(`${tag} dirty: leaving the page asks the same question`, await discardAsked() === 1);
      await page.getByRole('button', { name: 'Keep editing' }).click(); await wait(300);
      await page.locator('[data-sp-toggle="mostPopular"]').click(); await wait(200); // back to saved: clean again
    } else {
      await page.locator('.sp-back').click(); await wait(500);
      check(`${tag} phone dirty: back asks first`, await discardAsked() === 1);
      await page.getByRole('button', { name: 'Keep editing' }).click(); await wait(400);
      check(`${tag} phone: Keep editing stays in the detail`, await page.locator('.sp-detail.is-open').count() === 1);
    }

    if (!m) {
      await page.locator('[data-sp-toggle="showInBuilder"]').click(); await wait(200);
      const [res] = await Promise.all([page.waitForResponse((r) => /\/api\/transport\/\d+$/.test(r.url()) && r.request().method() === 'PATCH'), page.locator('[data-sp-act="save"]').click()]);
      check(`${tag} Save changes sends a PATCH`, res.status() === 200);
      await wait(500);
      const list = await page.evaluate(async () => (await (await fetch('/api/vehicle-types')).json()).data.map((v) => v.key));
      check(`${tag} the builder's vehicle list dropped the hidden vehicle and kept the rest`, !list.includes('sedan_ac') && list.includes('suv_ac'), JSON.stringify(list));
      await page.locator('.sp-row').nth(1).click(); await wait(500);
      check(`${tag} saved: not dirty any more`, await discardAsked() === 0);
      await page.locator('.sp-row').first().click(); await wait(400);
      await page.locator('[data-sp-toggle="showInBuilder"]').click(); await wait(200);
      await page.locator('[data-sp-act="save"]').click(); await wait(800);
      const back = await page.evaluate(async () => (await (await fetch('/api/vehicle-types')).json()).data.map((v) => v.key));
      check(`${tag} data restored`, back.includes('sedan_ac'));
    }
  },
});

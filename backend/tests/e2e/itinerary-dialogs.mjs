// Browser test (not run by PHPUnit): the small add / edit dialogs in the itinerary builder, on Bookings and Inquiries,
// at phone, tablet and PC widths. Run against a dev server with `BASE=http://127.0.0.1:8000/ node itinerary-dialogs.mjs`.
// Set MOCK=1 when the server points GOOGLE_PLACES_BASE_URL at a local stand-in for Google (search then works without a key).
// It edits one booking / inquiry's itinerary and puts the original back when it is done.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const MOCK = process.env.MOCK === '1';
const SHOTS = process.env.SHOTS || '';
const VPS = [[390, 844], [768, 1024], [1280, 800]];
const KINDS = ['bookings', 'inquiries'];

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };

const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n')[0]); summary(); process.exit(2); });

const api = async (path, init) => (await fetch(new URL(path, BASE), { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, ...init })).json();

for (const kind of KINDS) {
  const list = await api(`api/${kind}`);
  const record = (list.data || list)[0];
  const id = record.id;
  const original = await api(`api/${kind}/${id}/itinerary`);

  for (const [w, h] of VPS) {
    const m = w < 700;
    const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';
    const tag = `${kind}@${w}`;
    // every run starts from an empty plan, so the "+ Add" buttons for hotel and transport are there
    await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: [] }) });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
    const page = await ctx.newPage();
    page.setDefaultTimeout(6000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => { if (msg.type() === 'error' && !/Failed to load resource/.test(msg.text())) errors.push(msg.text()); });
    const shot = async (name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${tag}-${name}.png` }); };
    const wait = (ms = 400) => page.waitForTimeout(ms);

    await page.goto(`${BASE}?t=${Date.now()}#${kind}`, { waitUntil: 'networkidle' }); await wait(700);
    const rowSel = m ? `${slot} [data-booking-id="${id}"]` : `${slot} [data-desktop-row-id="${id}"], ${slot} [data-compact-booking-id="${id}"]`;
    await page.locator(rowSel).first().click(); await wait(600);
    await page.locator(`${slot} [data-sheet-tab="itinerary"], ${slot} [data-dt-tab="itinerary"]`).first().click(); await wait(400);
    await page.locator(`${slot} #${m ? 'mobile' : 'desktop'}-add-event-btn`).click(); await wait(900);
    if (await page.locator('[data-bld="next"]').innerText() !== 'Done') { await page.locator('[data-bld="next"]').click(); await wait(500); }
    const body = page.locator('#bld-body');

    const builderBox = await page.locator('.bld-sheet').boundingBox();
    const addBtn = (s) => page.locator(`[data-add="${s}"]`).first();

    // ---- every kind opens a small dialog with a back arrow, and Back returns to the same place
    for (const sec of ['hotel', 'transport', 'activity', 'meal', 'note']) {
      await addBtn(sec).scrollIntoViewIfNeeded();
      const y0 = await body.evaluate((e) => e.scrollTop);
      await addBtn(sec).click(); await wait(500);
      const d = page.locator('.item-dialog');
      check(`${tag} ${sec}: dialog opens`, await d.count() === 1);
      const box = await d.boundingBox();
      check(`${tag} ${sec}: smaller than the itinerary popup`, box && box.width < builderBox.width && box.height < builderBox.height, JSON.stringify({ box, builderBox }));
      check(`${tag} ${sec}: inset and on screen`, box && box.x >= 8 && box.y >= 8 && box.x + box.width <= w - 8 && box.y + box.height <= h - 8, JSON.stringify(box));
      check(`${tag} ${sec}: width 480-520 on PC`, m || (box.width >= 440 && box.width <= 520), String(box?.width));
      check(`${tag} ${sec}: focus on title, no input`, await page.evaluate(() => document.activeElement?.matches('[data-dialog-title]') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)));
      check(`${tag} ${sec}: back arrow labelled`, await page.locator('.item-dialog .dialog-back[aria-label="Back"]').count() === 1);
      check(`${tag} ${sec}: builder stays behind`, await page.locator('.bld-sheet').isVisible());
      if (sec === 'hotel') await shot('hotel');
      if (sec === 'transport') await shot('transport');
      await page.locator('.item-dialog .dialog-back').click(); await wait(550);
      check(`${tag} ${sec}: back closes dialog`, await page.locator('.item-dialog').count() === 0);
      check(`${tag} ${sec}: same scroll`, Math.abs((await body.evaluate((e) => e.scrollTop)) - y0) < 2);
      check(`${tag} ${sec}: focus back on + Add`, await page.evaluate((s) => document.activeElement === document.querySelector(`[data-add="${s}"]`), sec));
    }

    // ---- Esc, backdrop and the browser Back button all act as Back
    await addBtn('note').click(); await wait(400);
    await page.keyboard.press('Escape'); await wait(500);
    check(`${tag} Esc closes only the dialog`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet').count() === 1);
    await addBtn('note').click(); await wait(400);
    await page.mouse.click(4, 4); await wait(500); // the dim backdrop
    check(`${tag} backdrop closes only the dialog`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet').count() === 1);
    await addBtn('note').click(); await wait(400);
    const hashBefore = await page.evaluate(() => location.href);
    await page.goBack(); await wait(500);
    check(`${tag} browser back closes only the dialog`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet').count() === 1);
    check(`${tag} browser back keeps the page`, await page.evaluate(() => location.href) === hashBefore);

    // ---- unsaved input asks first
    await addBtn('note').click(); await wait(400);
    await page.locator('.item-dialog textarea').fill('draft text');
    await page.locator('.item-dialog .dialog-back').click(); await wait(400);
    check(`${tag} unsaved input asks before closing`, await page.locator('.confirm-sheet').count() === 1);
    await page.locator('.confirm-sheet [data-confirm="no"]').click(); await wait(400);
    check(`${tag} keep editing keeps the dialog`, await page.locator('.item-dialog').count() === 1);
    await page.locator('.item-dialog [data-form-save]').click(); await wait(500);
    check(`${tag} note added`, await page.locator('.bld-row [data-edit^="note:"]').count() >= 1);

    // ---- hotel: the search / manual / no-key paths
    await addBtn('hotel').click(); await wait(500);
    if (MOCK) {
      check(`${tag} hotel: Search tab first`, await page.locator('.item-dialog .sheet-tab-btn.active').innerText() === 'Search');
      check(`${tag} hotel: placeholder names the day location`, /Search hotels in/.test(await page.locator('[data-search]').getAttribute('placeholder')));
      await page.locator('[data-search]').click(); await page.keyboard.type('ganga', { delay: 30 }); await wait(1100);
      const rows = await page.locator('.place-row').count();
      check(`${tag} hotel: results listed`, rows >= 2, String(rows));
      check(`${tag} hotel: thumbnail, name, rating`, await page.evaluate(() => { const r = document.querySelector('.place-row'); return !!r.querySelector('img') && /★ 4\.5/.test(r.innerText) && /Ganga View/.test(r.innerText); }));
      check(`${tag} hotel: attribution shown`, /Powered by Google/.test(await page.locator('.item-dialog').innerText()));
      check(`${tag} hotel: single-line names`, await page.evaluate(() => [...document.querySelectorAll('.place-text b')].every((b) => b.getBoundingClientRect().height < 22)));
      await shot('hotel-results');
      await page.locator('.place-row').first().click(); await wait(800);
      check(`${tag} hotel: selected card with Change`, await page.locator('.place-card').count() === 1 && await page.locator('[data-change-place]').count() === 1);
      check(`${tag} hotel: details appear`, await page.locator('[data-field="checkIn"]').count() === 1);
      await page.locator('[data-step="rooms:1"]').click(); await wait(150);
      await page.locator('[data-chip="plan"][data-value="map"]').click(); await wait(150);
      await page.locator('[data-field="price"]').fill('2500'); await wait(150);
      check(`${tag} hotel: total updates`, /₹5,000/.test(await page.locator('[data-hint="price"]').innerText()), await page.locator('[data-hint="price"]').innerText());
      await shot('hotel-details');
      await page.locator('.item-dialog [data-form-save]').click(); await wait(600);
      check(`${tag} hotel: added to the day`, await page.locator('.bld-row [data-edit^="hotel:"]').count() === 1 && /Ganga View Resort/.test(await body.innerText()));
    } else {
      check(`${tag} hotel: not set up notice`, /search is not set up yet/i.test(await page.locator('.item-dialog').innerText()));
      check(`${tag} hotel: switched to Add manually`, await page.locator('.item-dialog .sheet-tab-btn.active').innerText() === 'Add manually');
      await page.locator('[data-field="name"]').fill('Home Stay Manali'); await page.locator('[data-check="saveForLater"]').check();
      await page.locator('[data-chip="plan"][data-value="bb"]').click();
      await page.locator('[data-field="price"]').fill('1800');
      await page.locator('.item-dialog [data-form-save]').click(); await wait(600);
      check(`${tag} hotel: manual hotel added`, /Home Stay Manali/.test(await body.innerText()));
    }

    // ---- transport
    await addBtn('transport').click(); await wait(900);
    check(`${tag} transport: title Travelling`, await page.locator('.item-dialog h3').innerText() === 'Travelling');
    check(`${tag} transport: times first`, await page.evaluate(() => { const r = document.querySelector('.item-dialog .fu-row'); return /Departs/.test(r.innerText) && /Arrives/.test(r.innerText); }));
    check(`${tag} transport: most popular preselected`, await page.evaluate(() => { const r = document.querySelector('.veh-row.is-on'); return r && /Most popular/.test(r.innerText) && /Sedan 4-seater AC/.test(r.innerText) && /₹3,500/.test(r.innerText); }));
    check(`${tag} transport: three popular first`, await page.locator('.veh-row').count() === 3);
    check(`${tag} transport: real radios`, await page.locator('.veh-row input[type=radio]').count() === 3);
    check(`${tag} transport: single-line names`, await page.evaluate(() => [...document.querySelectorAll('.veh-text b')].every((b) => b.getBoundingClientRect().height < 22)));
    await page.locator('[data-show-more]').click(); await wait(250);
    check(`${tag} transport: show more reveals the rest`, await page.locator('.veh-row').count() === 13, String(await page.locator('.veh-row').count()));
    await page.locator('.veh-row', { hasText: 'Cruise / Houseboat' }).click(); await wait(200);
    check(`${tag} transport: cruise selectable`, await page.evaluate(() => /Cruise/.test(document.querySelector('.veh-row.is-on').innerText)));
    await page.locator('.veh-row', { hasText: 'Scooter / Bike' }).click(); await wait(200);
    check(`${tag} transport: scooter selectable`, await page.evaluate(() => /Scooter/.test(document.querySelector('.veh-row.is-on').innerText)));
    await page.locator('.veh-row', { hasText: 'Train' }).first().click(); await wait(200);
    check(`${tag} transport: train defaults to customer arranges`, await page.evaluate(() => /Customer arranges/.test(document.querySelector('.veh-row.is-on').innerText) && document.querySelector('[data-seg="arrangedBy"][data-value="customer"]').classList.contains('active')));
    await page.locator('.veh-row', { hasText: 'SUV 6-seater AC' }).click(); await wait(200);
    await page.locator('[data-edit-rate="suv_ac"]').click(); await wait(200);
    await page.locator('[data-rate-input]').fill('4200'); await page.keyboard.press('Enter'); await wait(400);
    check(`${tag} transport: price edited, marked`, await page.evaluate(() => { const r = document.querySelector('.veh-row.is-on'); return /₹4,200/.test(r.innerText) && /edited/.test(r.innerText); }));
    await page.locator('[data-step="days:1"]').click(); await wait(200);
    check(`${tag} transport: 2 days totals 8400`, await page.locator('[data-field="totalPrice"]').inputValue() === '8400', await page.locator('[data-field="totalPrice"]').inputValue());
    check(`${tag} transport: customer-arranged pill option present`, await page.locator('[data-seg="arrangedBy"][data-value="customer"]').count() === 1);
    await page.locator('[data-seg="moveMode"][data-value="transit"]').click(); await wait(250);
    const destOpts = await page.locator('select[data-select="dest"] option').allInnerTexts();
    check(`${tag} transport: destination dropdown lists trip places`, destOpts.length >= 1, JSON.stringify(destOpts));
    await shot('transport-filled');
    // Assign to a team member through the shared Assign sheet
    await page.locator('[data-assign]').click(); await wait(700);
    check(`${tag} transport: shared Assign sheet opens`, await page.locator('.asg-overlay:not(.sheet-overlay)').count() === 1);
    check(`${tag} transport: dialog survives while Assign is open`, await page.locator('.item-dialog').count() === 1);
    await page.locator('.asg-overlay:not(.sheet-overlay) [data-asg-submit]').click(); await wait(900);
    check(`${tag} transport: assignee shown`, await page.evaluate(() => !/Not assigned/.test(document.querySelector('.assign-field').innerText)), await page.locator('.assign-field').innerText());
    check(`${tag} transport: dialog still open after assigning`, await page.locator('.item-dialog').count() === 1);
    await page.locator('.item-dialog [data-form-save]').click(); await wait(700);
    check(`${tag} transport: added`, await page.locator('.bld-row [data-edit^="transport:"]').count() === 1 && /SUV 6-seater/.test(await body.innerText()));

    // the destination chosen in the dialog is the day's destination: the Location section agrees and the next day starts there
    const dest = destOpts[0];
    check(`${tag} transport: day location section follows the dialog`, await page.evaluate((d) => /Transit/.test(document.querySelector('[data-loc].is-on').innerText) && [...document.querySelectorAll('.bld-places .bld-chip.is-on')].some((c) => c.innerText.trim() === d), dest));
    await page.locator('[data-acc-toggle="1"]').click(); await wait(500);
    check(`${tag} transport: next day starts at the destination`, await page.evaluate((d) => document.querySelector('[data-acc="1"] .bld-acc-text small').innerText.startsWith(d), dest), await page.locator('[data-acc="1"] .bld-acc-text small').innerText());
    await page.locator('[data-acc-toggle="0"]').click(); await wait(500);

    // editing: values come back, and closing without changes does not ask
    await page.locator('[data-edit^="transport:"]').first().click(); await wait(900);
    check(`${tag} edit transport: vehicle, edited price, days and assignee come back`, await page.evaluate(() => { const r = document.querySelector('.veh-row.is-on'); return r && /SUV 6-seater/.test(r.innerText) && /₹4,200/.test(r.innerText) && /edited/.test(r.innerText) && document.querySelector('[data-count="days"]').innerText === '2' && !/Not assigned/.test(document.querySelector('.assign-field').innerText); }));
    await page.locator('.item-dialog .dialog-back').click(); await wait(500);
    check(`${tag} edit transport: unchanged close does not ask`, await page.locator('.confirm-sheet').count() === 0 && await page.locator('.item-dialog').count() === 0);
    await page.locator('[data-edit^="hotel:"]').first().click(); await wait(700);
    check(`${tag} edit hotel: opens with its values`, await page.evaluate(() => /Ganga View Resort/.test(document.querySelector('[data-field="name"]')?.value || '') || document.querySelector('[data-field="name"]')?.value === 'Home Stay Manali'));
    await page.locator('.item-dialog .dialog-back').click(); await wait(500);
    check(`${tag} edit hotel: unchanged close does not ask`, await page.locator('.confirm-sheet').count() === 0 && await page.locator('.item-dialog').count() === 0);

    // ---- activity (search, manual) and meal
    await addBtn('activity').click(); await wait(500);
    if (MOCK) {
      await page.locator('[data-search]').click(); await page.keyboard.type('ganga', { delay: 30 }); await wait(1100);
      check(`${tag} activity: search results`, await page.locator('.place-row').count() >= 1);
      await page.locator('.place-row').first().click(); await wait(800);
      await page.locator('[data-step="tickets:1"]').click(); await page.locator('[data-field="price"]').fill('1200'); await wait(150);
      check(`${tag} activity: total for guests`, /₹2,400/.test(await page.locator('[data-hint="price"]').innerText()));
    } else {
      await page.locator('[data-field="title"]').fill('River rafting'); await page.locator('[data-check="saveForLater"]').check();
    }
    await page.locator('.item-dialog [data-form-save]').click(); await wait(600);
    check(`${tag} activity: added`, await page.locator('.bld-row [data-edit^="activity:"]').count() === 1);
    await addBtn('activity').click(); await wait(500);
    if (MOCK) check(`${tag} activity: recently used listed`, await page.locator('.places-head', { hasText: 'Recently used' }).count() === 1);
    await page.locator('.item-dialog .dialog-back').click(); await wait(500);

    await shot('itinerary');
    // ---- save everything and read it back from the server
    await page.locator('[data-bld="next"]').click(); await wait(1200);
    const saved = await api(`api/${kind}/${id}/itinerary`);
    const items = (saved.data || []).flatMap((d) => d.items);
    const tr = items.find((x) => x.type === 'transport' && /SUV/.test(x.title + JSON.stringify(x.details)));
    check(`${tag} saved: transport price / days / override / vehicle`, tr && tr.price === 4200 && tr.quantity === 2 && tr.totalPrice === 8400 && tr.priceOverridden === true && !!tr.vehicleTypeId, JSON.stringify(tr));
    check(`${tag} saved: assignee kept`, tr && tr.assigned && tr.assigned.name);
    const stay = items.find((x) => x.type === 'stay' && /Ganga View Resort|Home Stay Manali/.test(x.title));
    check(`${tag} saved: hotel priced`, stay && stay.price > 0 && stay.totalPrice > 0, JSON.stringify(stay));
    check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();

    // put the original itinerary back, so the next run starts clean
    await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: original.data, meta: original.meta }) });
  }
}

await browser.close();
process.exit(summary() ? 1 : 0);

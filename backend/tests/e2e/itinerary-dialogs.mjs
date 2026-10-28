// Browser test (not run by PHPUnit): the small add / edit dialogs in the itinerary builder, on Bookings and Inquiries,
// at phone, tablet and PC widths. Run against a dev server with `BASE=http://127.0.0.1:8000/ node itinerary-dialogs.mjs`.
// With no Google key the server answers search from its demo places (the default run). Set MOCK=1 when the server points
// GOOGLE_PLACES_BASE_URL at a local stand-in for Google instead.
// It edits one booking / inquiry's itinerary and puts the original back when it is done.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

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
    await signIn(page, BASE);
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

    const builderBox = await page.locator('.bld-sheet, .bld-inplace').boundingBox();
    const addBtn = (s) => page.locator(`[data-add="${s}"]`).first();

    // ---- every kind opens a small dialog with a back arrow, and Back returns to the same place
    for (const sec of ['hotel', 'transport', 'activity', 'meal', 'note']) {
      await addBtn(sec).scrollIntoViewIfNeeded();
      const y0 = await body.evaluate((e) => e.scrollTop);
      await addBtn(sec).click(); await wait(500);
      const d = page.locator('.item-dialog');
      check(`${tag} ${sec}: dialog opens`, await d.count() === 1);
      const box = await d.boundingBox();
      // a screen pushed inside the builder's own sheet: it fills that sheet, there is no second popup and no second backdrop
      check(`${tag} ${sec}: pushed inside the builder (fills it, not a popup on top)`, box && Math.abs(box.width - builderBox.width) <= 1 && Math.abs(box.height - builderBox.height) <= 1 && await page.locator('.push-screen').count() === 1, JSON.stringify({ box, builderBox }));
      check(`${tag} ${sec}: one backdrop only`, await page.locator('.asg-overlay.open, .modal-overlay.open').count() <= 1);
      check(`${tag} ${sec}: focus on title, no input`, await page.evaluate(() => document.activeElement?.matches('[data-dialog-title]') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)));
      check(`${tag} ${sec}: back arrow labelled`, await page.locator('.item-dialog .dialog-back[aria-label="Back"]').count() === 1);
      check(`${tag} ${sec}: builder stays behind`, await page.locator('.bld-sheet, .bld-inplace').isVisible());
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
    check(`${tag} Esc closes only the dialog`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet, .bld-inplace').count() === 1);
    await addBtn('note').click(); await wait(400);
    await page.locator('.item-dialog .dialog-back').click(); await wait(600); // the back arrow slides the screen out
    check(`${tag} back arrow closes only the screen`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet, .bld-inplace').count() === 1);
    await addBtn('note').click(); await wait(400);
    const hashBefore = await page.evaluate(() => location.href);
    await page.goBack(); await wait(500);
    check(`${tag} browser back closes only the dialog`, await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet, .bld-inplace').count() === 1);
    check(`${tag} browser back keeps the page`, await page.evaluate(() => location.href) === hashBefore);

    // ---- unsaved input asks first
    await addBtn('note').click(); await wait(400);
    await page.locator('.item-dialog textarea').fill('draft text');
    await page.locator('.item-dialog .dialog-back').click(); await wait(400);
    check(`${tag} unsaved input asks before closing`, await page.locator('.confirm-card').count() === 1);
    await page.locator('.confirm-card [data-confirm="no"]').click(); await wait(400);
    check(`${tag} keep editing keeps the dialog`, await page.locator('.item-dialog').count() === 1);
    await page.locator('.item-dialog [data-form-save]').click(); await wait(500);
    check(`${tag} note added`, await page.locator('.bld-row [data-edit^="note:"]').count() >= 1);

    // ---- discard flow: one confirm, the same compact card, the same result from every exit
    const dirtyIt = {
      activity: async () => { await page.locator('.item-dialog [data-tab="manual"]').click(); await page.locator('[data-field="title"]').fill('Typed activity'); },
      hotel: async () => { await page.locator('.item-dialog [data-tab="manual"]').click(); await page.locator('[data-field="name"]').fill('Typed hotel'); },
      transport: async () => { await page.locator('[data-step="days:1"]').click(); },
      meal: async () => { await page.locator('[data-chip="kind"][data-value="Dinner"]').click(); },
      note: async () => { await page.locator('.item-dialog textarea').fill('typed note'); },
    };
    const exits = {
      cancel: () => page.locator('.item-dialog-foot [data-sheet-close]').click(),
      back: () => page.locator('.item-dialog .dialog-back').click(),
      esc: () => page.keyboard.press('Escape'),
      backdrop: () => page.mouse.click(4, 4),
      browser: () => page.goBack(),
    };
    const rowsNow = () => page.locator('.bld-row').count();
    for (const sec of ['activity', 'hotel', 'transport', 'meal', 'note']) {
      const which = sec === 'activity' ? Object.keys(exits).filter((k) => k !== 'backdrop') : ['cancel', 'esc']; // no backdrop: the add screen is pushed inside the sheet
      // opened and left alone (prefilled and default values only): nothing to confirm, even after the lists have loaded
      await addBtn(sec).click(); await wait(1200);
      await exits.back(); await wait(500);
      check(`${tag} ${sec}: untouched dialog closes without asking`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 0);
      for (const exit of which) {
        const before = await rowsNow();
        await addBtn(sec).click(); await wait(700);
        await dirtyIt[sec](); await wait(150);
        await exits[exit](); await wait(600);
        check(`${tag} ${sec}/${exit}: dirty asks first`, await page.locator('.confirm-card').count() === 1 && await page.locator('.item-dialog').count() === 1);
        if (exit === 'cancel' && sec === 'activity') {
          const m = await page.evaluate(() => {
            const c = document.querySelector('.confirm-card'); const bs = [...c.querySelectorAll('.confirm-foot button')].map((b) => b.getBoundingClientRect());
            const d = document.querySelector('.item-dialog').getBoundingClientRect(); const cr = c.getBoundingClientRect();
            return { title: c.querySelector('h3').innerText, text: c.querySelector('.confirm-body').innerText, n: bs.length, sameH: Math.abs(bs[0].height - bs[1].height) < 0.5, sameW: Math.abs(bs[0].width - bs[1].width) < 1.5, noX: !c.querySelector('.sheet-close-btn, [aria-label="Close"]'), focus: document.activeElement.dataset.confirm, smaller: cr.width < d.width, centred: Math.abs((cr.left + cr.right) / 2 - innerWidth / 2) < 2, h: bs[0].height, danger: getComputedStyle(c.querySelector('[data-confirm="yes"]')).backgroundColor, top: !!document.elementFromPoint(cr.left + cr.width / 2, cr.top + 20)?.closest('.confirm-card') };
          });
          check(`${tag} confirm: title and text`, m.title === 'Discard this entry?' && /has not been added yet/.test(m.text), JSON.stringify(m));
          check(`${tag} confirm: two equal buttons, no X`, m.n === 2 && m.sameH && m.sameW && m.noX, JSON.stringify(m));
          check(`${tag} confirm: Keep editing focused`, m.focus === 'no');
          check(`${tag} confirm: on top (smaller and centred on PC; a bottom sheet on the phone)`, (w < 700 || (m.smaller && m.centred)) && m.top, JSON.stringify(m));
          check(`${tag} confirm: Discard is red, same size as other buttons`, m.danger === 'rgb(220, 38, 38)' && m.h >= 38 && m.h <= 48, JSON.stringify(m));
          await shot('confirm');
          // Esc on the confirm = keep editing, and only the confirm closes
          await page.keyboard.press('Escape'); await wait(500);
          check(`${tag} confirm: Esc keeps editing`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 1);
          await exits[exit](); await wait(600);
        }
        await page.locator('.confirm-card [data-confirm="no"]').click(); await wait(500);
        check(`${tag} ${sec}/${exit}: Keep editing leaves the form as it was`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 1 && await page.evaluate((k) => ({ activity: document.querySelector('[data-field="title"]')?.value === 'Typed activity', hotel: document.querySelector('[data-field="name"]')?.value === 'Typed hotel', transport: document.querySelector('[data-count="days"]')?.innerText === '2', meal: document.querySelector('[data-chip="kind"][data-value="Dinner"]')?.classList.contains('is-on'), note: document.querySelector('.item-dialog textarea')?.value === 'typed note' }[k]), sec));
        await exits[exit](); await wait(600);
        if (exit === 'esc' || exit === 'browser') { /* the first press already asked; ask again */ }
        await page.locator('.confirm-card [data-confirm="yes"]').click(); await wait(800);
        check(`${tag} ${sec}/${exit}: Discard closes both and adds nothing`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 0 && await page.locator('.bld-sheet, .bld-inplace').count() === 1 && await rowsNow() === before);
        check(`${tag} ${sec}/${exit}: focus back on + Add`, await page.evaluate((x) => document.activeElement === document.querySelector(`[data-add="${x}"]`), sec));
        check(`${tag} ${sec}/${exit}: page and scroll untouched`, await page.evaluate(() => location.hash.length > 1) && (await page.locator('.bld-sheet, .bld-inplace').isVisible()));
      }
    }

    // ---- one set of buttons
    await addBtn('note').click(); await wait(500);
    const audit = await page.evaluate(() => {
      const css = (el) => { const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), radius: c.borderTopLeftRadius, font: c.fontSize, weight: c.fontWeight }; };
      const foot = [...document.querySelectorAll('.item-dialog-foot button')].map(css);
      return { foot, back: css(document.querySelector('.item-dialog .dialog-back')), add: css(document.querySelector('.bld-add')), followup: document.querySelector('.btn-add-followup') ? css(document.querySelector('.btn-add-followup')) : null, kebab: document.querySelector('.bld-kebab') ? css(document.querySelector('.bld-kebab')) : null, close: css(document.querySelector('.bld-header .sheet-close-btn') || document.querySelector('.item-dialog .dialog-back')) };
    });
    check(`${tag} footer buttons: same height, radius and font`, audit.foot.length === 2 && audit.foot[0].h === audit.foot[1].h && audit.foot[0].radius === audit.foot[1].radius && audit.foot[0].font === audit.foot[1].font, JSON.stringify(audit.foot));
    check(`${tag} footer buttons: equal width on phones`, !m || Math.abs(audit.foot[0].w - audit.foot[1].w) <= 1, JSON.stringify(audit.foot));
    check(`${tag} icon buttons share one square size`, audit.back.w === audit.back.h && audit.back.w === audit.close.w && audit.close.w === audit.close.h && (!audit.kebab || audit.kebab.w === audit.back.w), JSON.stringify(audit));
    check(`${tag} section + Add is the small size`, audit.add.h === (m ? 40 : 34) && audit.add.font === '12.5px' && (!audit.followup || (audit.followup.h === audit.add.h && audit.followup.radius === audit.add.radius && audit.followup.font === audit.add.font)), JSON.stringify(audit));
    check(`${tag} no tinted light-blue buttons in the builder`, await page.evaluate(() => ![...document.querySelectorAll('.bld-sheet button, .item-dialog button')].filter((b) => b.getClientRects().length).some((b) => ['rgb(239, 246, 255)', 'rgb(219, 234, 254)', 'rgb(191, 219, 254)'].includes(getComputedStyle(b).backgroundColor))));
    await page.locator('.item-dialog .dialog-back').click(); await wait(500);

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
      // no Google key: the demo places answer
      check(`${tag} hotel: Search tab first`, await page.locator('.item-dialog .sheet-tab-btn.active').innerText() === 'Search');
      check(`${tag} hotel: neutral demo note, no amber error`, /Showing demo results\. Connect Google Places for live search\./.test(await page.locator('.places-info').innerText()) && await page.locator('.places-off').count() === 0);
      check(`${tag} hotel: popular hotels shown with nothing typed`, /Popular in/.test(await page.locator('.places-head').last().innerText()) && await page.locator('.place-row').count() >= 3, await page.locator('[data-results]').innerText());
      check(`${tag} hotel: rows have the icon placeholder, rating and price`, await page.evaluate(() => { const r = [...document.querySelectorAll('.place-list')].pop().querySelector('.place-row'); return !!r.querySelector('.place-thumb svg') && /★/.test(r.innerText) && /₹/.test(r.innerText); }));
      await page.locator('[data-search]').click(); await page.keyboard.type('ganga', { delay: 30 }); await wait(1100);
      check(`${tag} hotel: search finds demo hotels`, await page.locator('.place-row', { hasText: 'Ganga' }).count() >= 1);
      await page.locator('.place-row', { hasText: 'Ganga' }).first().click(); await wait(700);
      check(`${tag} hotel: selected card with Change, details below`, await page.locator('.place-card').count() === 1 && await page.locator('[data-change-place]').count() === 1 && await page.locator('[data-field="checkIn"]').count() === 1);
      check(`${tag} hotel: price prefilled from the demo default`, Number(await page.locator('[data-field="price"]').inputValue()) > 0);
      await page.locator('[data-step="rooms:1"]').click(); await page.locator('[data-chip="plan"][data-value="map"]').click(); await page.locator('[data-field="price"]').fill('2000'); await wait(150);
      check(`${tag} hotel: total updates`, /₹4,000/.test(await page.locator('[data-hint="price"]').innerText()), await page.locator('[data-hint="price"]').innerText());
      await page.locator('.item-dialog [data-form-save]').click(); await wait(600);
      check(`${tag} hotel: added to the day`, await page.locator('.bld-row [data-edit^="hotel:"]').count() === 1 && await page.locator('.confirm-card').count() === 0);
      // the manual path and Recently used keep working
      await page.locator('[data-edit^="hotel:"]').first().click(); await wait(500);
      await page.locator('.item-dialog .dialog-back').click(); await wait(500);
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
    check(`${tag} edit transport: unchanged close does not ask`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 0);
    await page.locator('[data-edit^="hotel:"]').first().click(); await wait(700);
    check(`${tag} edit hotel: opens with its values`, await page.evaluate(() => /Ganga View Resort/.test(document.querySelector('[data-field="name"]')?.value || '') || document.querySelector('[data-field="name"]')?.value === 'Home Stay Manali'));
    await page.locator('.item-dialog .dialog-back').click(); await wait(500);
    check(`${tag} edit hotel: unchanged close does not ask`, await page.locator('.confirm-card').count() === 0 && await page.locator('.item-dialog').count() === 0);

    // ---- activity (search, manual) and meal
    await addBtn('activity').click(); await wait(500);
    if (MOCK) {
      await page.locator('[data-search]').click(); await page.keyboard.type('ganga', { delay: 30 }); await wait(1100);
      check(`${tag} activity: search results`, await page.locator('.place-row').count() >= 1);
      await page.locator('.place-row').first().click(); await wait(800);
      await page.locator('[data-step="tickets:1"]').click(); await page.locator('[data-field="price"]').fill('1200'); await wait(150);
      check(`${tag} activity: total for guests`, /₹2,400/.test(await page.locator('[data-hint="price"]').innerText()));
    } else {
      check(`${tag} activity: popular suggestions in the day location, nothing typed`, /Popular in/.test(await page.locator('.places-head').last().innerText()) && await page.locator('.place-row').count() >= 5, await page.locator('[data-results]').innerText());
      check(`${tag} activity: demo note, no "not set up" banner`, /Showing demo results/.test(await page.locator('.places-info').innerText()) && await page.locator('.places-off').count() === 0);
      await page.locator('[data-search]').click(); await page.keyboard.type('zzzzqq', { delay: 20 }); await wait(1000);
      check(`${tag} activity: no results message`, /No activities found, try Add manually/.test(await page.locator('[data-results]').innerText()));
      await page.locator('[data-search]').fill('gondola'); await wait(1000);
      check(`${tag} activity: search "gondola"`, await page.locator('.place-row', { hasText: 'Gondola Phase 2' }).count() === 1);
      await page.locator('.place-row', { hasText: 'Gondola Phase 2' }).click(); await wait(700);
      check(`${tag} activity: card with Change and the details form`, await page.locator('.place-card').count() === 1 && await page.locator('[data-field="time"]').count() === 1);
      check(`${tag} activity: price and duration prefilled`, await page.locator('[data-field="price"]').inputValue() === '1000' && await page.locator('[data-field="duration"]').inputValue() === '1 hr 30 min');
      await page.locator('[data-field="price"]').fill('1200'); await page.locator('[data-step="tickets:1"]').click(); await wait(150);
      check(`${tag} activity: total for guests`, /₹2,400/.test(await page.locator('[data-hint="price"]').innerText()));
      await page.locator('[data-change-place]').click(); await wait(800);
      check(`${tag} activity: Change brings the suggestions back`, await page.locator('.place-row').count() >= 5);
      await page.locator('.place-row', { hasText: 'Gondola Phase 2' }).click(); await wait(700);
      await page.locator('[data-field="price"]').fill('1200'); await page.locator('[data-step="tickets:1"]').click(); await wait(150);
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
    if (!MOCK) {
      const act = items.find((x) => x.type === 'activity' && /Gondola Phase 2/.test(x.title));
      check(`${tag} saved: demo activity with price, guests and total`, act && act.price === 1200 && act.quantity === 2 && act.totalPrice === 2400 && /^demo-act-gulmarg/.test(act.placeId), JSON.stringify(act));
    }
    const stay = items.find((x) => x.type === 'stay' && /Ganga|Home Stay Manali/.test(x.title));
    check(`${tag} saved: hotel priced`, stay && stay.price > 0 && stay.totalPrice > 0, JSON.stringify(stay));
    check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();

    // put the original itinerary back, so the next run starts clean
    await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: original.data, meta: original.meta }) });
  }
}

await browser.close();
process.exit(summary() ? 1 : 0);

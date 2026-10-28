// Browser test (not run by PHPUnit): the Add Inquiry wizard on the Inquiries page at phone, tablet and PC widths.
// Run against a dev server with `BASE=http://127.0.0.1:8000/ node add-inquiry.mjs` (set SHOTS=<folder> to save screenshots).
// It SAVES REAL INQUIRIES (about five per width), so point the server at a throwaway copy of the database.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const SHOTS = process.env.SHOTS || '';
const VPS = [[390, 844], [768, 1024], [1280, 800]].filter(([w]) => !process.env.ONLY || process.env.ONLY.split(',').includes(String(w)));

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : extra); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n')[0]); summary(); process.exit(2); });

for (const [w, h] of VPS) {
  const m = w < 700;
  const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';
  const tag = `@${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  const page = await ctx.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  const shot = (name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/add-inquiry-${w}-${name}.png` }) : null);

  const addBtn = page.locator(m ? '#mobile-page-add' : '#desktop-page-add');
  const wiz = page.locator('.wiz-sheet');
  const body = page.locator('#wiz-body');
  const settle = (ms = 350) => page.waitForTimeout(ms);
  /** True when a text field has focus: the keyboard would be open on a phone. */
  const fieldFocused = () => page.evaluate(() => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || ''));
  const freshRow = () => page.locator(`${slot} .is-fresh:visible`).first();

  async function openWizard() {
    await addBtn.click();
    await wiz.waitFor();
    await settle(450);
  }
  async function closeWizardDiscarding() {
    await page.keyboard.press('Escape');
    await settle(200);
    if (await page.locator('.confirm-card').count()) { await page.locator('[data-confirm="yes"]').click(); }
    await wiz.waitFor({ state: 'detached' });
  }
  const next = async () => { await page.locator('#wiz-next').click(); await settle(); };

  await page.goto(`${BASE}#inquiries`);
  await page.waitForSelector(m ? '#mobile-cards-list .list-row-card' : '#desktop-table-body tr', { timeout: 10000 });
  const before = (await (await fetch(new URL('api/inquiries', BASE))).json()).data.length;

  /* ---------- entry point and dialog basics ---------- */
  check(`${tag} the one Add Inquiry button is visible`, await addBtn.isVisible());
  check(`${tag} the other layout's button is hidden`, !(await page.locator(m ? '#desktop-page-add' : '#mobile-page-add').isVisible()));
  await openWizard();
  const dlgAttrs = await page.locator('.wiz-sheet').evaluate((el) => ({ role: el.getAttribute('role'), modal: el.getAttribute('aria-modal'), label: el.getAttribute('aria-label') }));
  check(`${tag} dialog role and aria-modal`, dlgAttrs.role === 'dialog' && dlgAttrs.modal === 'true' && dlgAttrs.label === 'Add Inquiry', JSON.stringify(dlgAttrs));
  check(`${tag} focus is on the title, not on an input`, await page.evaluate(() => document.activeElement?.matches('[data-dialog-title]')));
  check(`${tag} no field has focus after opening (no keyboard)`, !(await fieldFocused()));
  check(`${tag} close button has a label`, await page.locator('.wiz-sheet .sheet-close-btn[aria-label="Close"]').count() === 1);
  check(`${tag} rail is hidden on phones, buttons on PC`, m ? !(await page.locator('#wiz-rail').isVisible()) : (await page.locator('#wiz-rail button.wiz-step').count()) === 3);
  if (m) check(`${tag} phone shows Step 1 of 3 and 3 segments`, (await page.locator('#wiz-mstep').innerText()) === 'Step 1 of 3 · Customer & trip' && (await page.locator('#wiz-seg i').count()) === 3);
  else {
    const box = await wiz.boundingBox();
    check(`${tag} dialog is about 860x640 (${Math.round(box.width)}x${Math.round(box.height)})`, box.width <= 862 && box.width >= Math.min(w - 40, 700) && box.height <= 642);
    check(`${tag} live preview card is in the rail`, (await page.locator('#wiz-preview').innerText()).includes('Unnamed lead'));
  }
  check(`${tag} Back is hidden on step 1`, !(await page.locator('#wiz-back').isVisible()));
  check(`${tag} info note and 0 details`, (await body.innerText()).includes("Nothing is mandatory. Skip anything the customer hasn't shared yet.") && (await page.locator('#wiz-early').innerText()).includes('0 details added'));
  await shot('1-step1');

  /* ---------- step 1: fields, chips, counter, preview ---------- */
  await page.locator('#wiz-name').fill('Arjun Mehra');
  check(`${tag} one detail is singular`, (await page.locator('#wiz-early').innerText()).includes('1 detail added') && !(await page.locator('#wiz-early').innerText()).includes('1 details'));
  await page.locator('#wiz-phone').fill('98765 12345');
  await page.locator('#wiz-email').fill('arjun@example.com');
  await page.locator('#wiz-city').fill('Mumbai');
  await page.locator('[data-chip="Goa"]').click();
  check(`${tag} chip fills the input and lights up`, (await page.locator('#wiz-dest').inputValue()) === 'Goa' && await page.locator('[data-chip="Goa"]').evaluate((el) => el.classList.contains('is-on')));
  await page.locator('#wiz-dest').fill('Kerala');
  check(`${tag} typing a matching destination lights its chip and clears the other`, await page.locator('[data-chip="Kerala"]').evaluate((el) => el.classList.contains('is-on')) && !(await page.locator('[data-chip="Goa"]').evaluate((el) => el.classList.contains('is-on'))));
  await page.locator('[data-chip="Kerala"]').click();
  check(`${tag} tapping the lit chip clears it`, (await page.locator('#wiz-dest').inputValue()) === '');
  await page.locator('[data-chip="Kashmir"]').click();
  await page.locator('#wiz-budget').fill('250000');
  await page.locator('#wiz-comment').fill('Honeymoon, wants a houseboat.');
  check(`${tag} seven details are counted`, (await page.locator('#wiz-early').innerText()).includes('7 details added'), await page.locator('#wiz-early').innerText());
  if (!m) check(`${tag} live preview follows the form`, (await page.locator('#wiz-preview').innerText()).includes('Arjun Mehra') && (await page.locator('#wiz-preview').innerText()).includes('Kashmir'));
  check(`${tag} icon-less budget has the rupee prefix`, (await page.locator('.wiz-cur').innerText()) === '₹');
  const longName = 'Maharaja Bhupinder Singh Ranbir Pratap Singh Wadia of Kapurthala and Patiala State';
  await page.locator('#wiz-name').fill(longName);
  const clipped = await page.locator('#wiz-name').evaluate((el) => el.scrollWidth >= el.clientWidth);
  check(`${tag} a long name stays inside the field`, clipped && (await page.locator('.wiz-sheet').evaluate((el) => el.scrollWidth <= el.clientWidth + 1)));
  await page.locator('#wiz-name').fill('Arjun Mehra');

  /* ---------- step 2: the builder embedded ---------- */
  await next();
  check(`${tag} step 2 opened without a keyboard`, !(await fieldFocused()));
  check(`${tag} builder is inline in the wizard (no second popup)`, (await page.locator('.wiz-sheet #wiz-bld .bld-stepper').count()) === 1 && (await page.locator('.bld-sheet').count()) === 0);
  check(`${tag} route is prefilled from step 1`, (await page.locator('#bld-origin').inputValue()) === 'Mumbai' && (await page.locator('#bld-destination').inputValue()) === 'Kashmir');
  check(`${tag} builder has Route & Dates then Itinerary`, (await page.locator('#bld-stepper').innerText()).includes('Route & Dates') && (await page.locator('#bld-stepper').innerText()).includes('Itinerary'));
  await shot('2-builder');
  await page.locator('#bld-start').fill('2026-12-15');
  await settle(200);
  await page.locator('#bld-end').fill('2026-12-18');
  await settle(300);
  check(`${tag} dates give 4 days / 3 nights`, (await page.locator('#bld-summary').innerText()).includes('4 days') && (await page.locator('#bld-summary').innerText()).includes('3 nights'));
  if (!m) check(`${tag} preview shows the nights live`, (await page.locator('#wiz-preview').innerText()).includes('3 nights'), await page.locator('#wiz-preview').innerText());
  await page.locator('#bld-next').click();
  await settle(400);
  check(`${tag} builder day plan is shown`, (await page.locator('.bld-daychip').count()) === 4);
  // an add dialog opens above the wizard, and the back arrow returns to the plan
  await page.locator('[data-add="note"]').first().click();
  await page.locator('.item-dialog-card').waitFor();
  await settle(350);
  const stack = await page.evaluate(() => {
    const card = document.querySelector('.item-dialog-card');
    const r = card.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const z = (el) => Number(getComputedStyle(el.closest('.sheet-overlay')).zIndex) || 0;
    return { onTop: card.contains(hit), dialogZ: z(card), wizardZ: z(document.querySelector('.wiz-sheet')), wizardStillThere: !!document.querySelector('.wiz-sheet #wiz-bld'), title: document.activeElement?.textContent };
  });
  check(`${tag} add dialog sits above the wizard`, stack.onTop && stack.dialogZ >= stack.wizardZ && stack.wizardStillThere, JSON.stringify(stack));
  check(`${tag} add dialog opened without a keyboard`, !(await fieldFocused()));
  check(`${tag} add dialog has a back arrow`, (await page.locator('.item-dialog-card .dialog-back[aria-label="Back"]').count()) === 1);
  await shot('3-add-dialog');
  await page.locator('.item-dialog-card .dialog-back').click();
  await page.locator('.item-dialog-card').waitFor({ state: 'detached' });
  check(`${tag} back arrow returns to the plan inside the wizard`, (await page.locator('.wiz-sheet .bld-daychip').count()) === 4 && await wiz.isVisible());
  // now really add a note
  await page.locator('[data-add="note"]').first().click();
  await page.locator('.item-dialog-card').waitFor();
  await settle(300);
  await page.locator('.item-dialog-card textarea[data-field="text"]').fill('Welcome drink on arrival');
  await page.locator('.item-dialog-card [data-form-save]').click();
  await page.locator('.item-dialog-card').waitFor({ state: 'detached' });
  await settle(300);
  check(`${tag} the note is on the day`, (await page.locator('.wiz-sheet .bld-row').allInnerTexts()).join(' ').includes('Welcome drink on arrival'));
  await shot('4-builder-days');
  await page.locator('#bld-next').click(); // Done
  await settle(500);
  const summaryText = await body.innerText();
  check(`${tag} summary card replaces the builder`, summaryText.includes('Itinerary added') && (await page.locator('.wiz-sheet #bld-stepper').count()) === 0 && (await page.locator('#wiz-itin-h').count()) === 1);
  check(`${tag} summary shows route, dates, nights and counts`, summaryText.includes('Mumbai → Kashmir') && summaryText.includes('15–18 Dec 2026') && summaryText.includes('3 nights') && summaryText.includes('1 note'), summaryText);
  check(`${tag} focus moved to the summary, not to a field`, !(await fieldFocused()));
  check(`${tag} the itinerary counts as a detail (8)`, (await page.locator('#wiz-early').innerText()).includes('8 details added'), await page.locator('#wiz-early').innerText());
  if (!m) check(`${tag} preview keeps the nights`, (await page.locator('#wiz-preview').innerText()).includes('3 nights'));
  await shot('5-summary');
  // edit, then remove
  await page.locator('[data-itin="edit"]').click();
  await settle(400);
  check(`${tag} Edit itinerary reopens the builder with the saved route`, (await page.locator('#wiz-bld .bld-daychip').count()) === 4 || (await page.locator('#bld-origin').count()) === 1);
  await page.locator('[data-itin="cancel"]').click();
  await settle(300);
  check(`${tag} cancelling the edit keeps the itinerary`, (await body.innerText()).includes('Itinerary added'));
  await page.locator('[data-itin="remove"]').click();
  await page.locator('.confirm-card').waitFor();
  await page.locator('[data-confirm="no"]').click();
  await settle(300);
  check(`${tag} "Keep it" keeps the itinerary`, (await body.innerText()).includes('Itinerary added'));

  /* ---------- step 3: guests ---------- */
  await next();
  check(`${tag} guests step: 1 guest, name synced from step 1`, (await page.locator('#wiz-pax').innerText()) === '1' && (await page.locator('#wiz-g0-name').inputValue()) === 'Arjun Mehra');
  check(`${tag} primary button is Save Inquiry and early save is hidden`, (await page.locator('#wiz-next').innerText()) === 'Save Inquiry' && !(await page.locator('#wiz-early').isVisible()));
  check(`${tag} stepper buttons are labelled`, (await page.locator('[data-pax="-1"][aria-label="Fewer guests"]').count()) === 1 && (await page.locator('[data-pax="1"][aria-label="More guests"]').count()) === 1);
  check(`${tag} minus is disabled at 1 guest`, await page.locator('[data-pax="-1"]').isDisabled());
  await page.locator('[data-pax="1"]').click();
  await page.locator('[data-pax="1"]').click();
  check(`${tag} three guest rows`, (await page.locator('.wiz-guest').count()) === 3 && (await page.locator('#wiz-pax').innerText()) === '3');
  check(`${tag} guest 1 has no remove button`, (await page.locator('.wiz-guest').first().locator('button').count()) === 0);
  check(`${tag} stepper clicks do not open the keyboard`, !(await fieldFocused()));
  await page.locator('#wiz-g0-age').fill('34');
  await page.locator('#wiz-g1-name').fill('Riya');
  await page.locator('#wiz-g1-age').fill('31');
  if (!m) check(`${tag} preview shows 3 guests`, (await page.locator('#wiz-preview').innerText()).includes('3 guests'));
  await shot('6-guests');
  // guest 1 follows step 1 until edited by hand
  await page.locator('#wiz-back').click(); await settle(250);
  await page.locator('#wiz-back').click(); await settle(250);
  await page.locator('#wiz-name').fill('Arjun K Mehra');
  await next(); await next();
  check(`${tag} guest 1 keeps following the customer name until edited`, (await page.locator('#wiz-g0-name').inputValue()) === 'Arjun K Mehra');
  await page.locator('#wiz-g0-name').fill('Arjun Mehra Jr');
  await page.locator('#wiz-back').click(); await settle(250);
  await page.locator('#wiz-back').click(); await settle(250);
  await page.locator('#wiz-name').fill('Arjun Mehra');
  await next(); await next();
  check(`${tag} a hand-edited guest 1 name is no longer overwritten`, (await page.locator('#wiz-g0-name').inputValue()) === 'Arjun Mehra Jr');
  // details: 7 fields + the itinerary + guest 1 (age) + guest 2 (name and age count once) = 10

  /* ---------- full save ---------- */
  await page.locator('#wiz-next').click();
  await wiz.waitFor({ state: 'detached' });
  await settle(400);
  const toastText = await page.locator('.toast').last().innerText();
  check(`${tag} toast says "Inquiry saved with 10 details." with a View link`, toastText.includes('Inquiry saved with 10 details.') && toastText.includes('View'), toastText);
  check(`${tag} focus returned to the Add Inquiry button`, await page.evaluate((id) => document.activeElement?.id === id, m ? 'mobile-page-add' : 'desktop-page-add'));
  const row = freshRow();
  check(`${tag} the new row is highlighted with JUST ADDED`, (await row.count()) === 1 && (await row.innerText()).includes('JUST ADDED'));
  const rowText = await row.innerText();
  check(`${tag} row shows name, phone, trip, pax and nights, date`, rowText.includes('Arjun Mehra') && rowText.includes('Kashmir') && rowText.includes('3 Pax') && rowText.includes('3 Night') && rowText.includes('15 Dec 2026'), rowText);
  check(`${tag} the new row is the first one at the top`, await row.evaluate((el) => { const list = el.closest('tbody, .row-list'); return list ? (el.closest('tr, .list-row-card') === list.querySelector('tr, .list-row-card')) : true; }));
  check(`${tag} the page is scrolled to the top`, await page.evaluate((mob) => (mob ? document.querySelector('#mobile-screen-scroll').scrollTop : window.scrollY) <= 2, m));
  check(`${tag} sidebar / header total went up by one`, m ? (await page.locator('#mobile-header-subtitle').innerText()).includes(`${before + 1} Total`) : (await page.locator('#sidebar-inquiries-badge').innerText()) === String(before + 1), m ? await page.locator('#mobile-header-subtitle').innerText() : await page.locator('#sidebar-inquiries-badge').innerText());
  await shot('7-saved');

  // View link scrolls to the top
  if (m) await page.evaluate(() => { document.querySelector('#mobile-screen-scroll').scrollTop = 600; });
  else await page.evaluate(() => document.querySelectorAll('.desktop-full-table-view, #desktop-compact-list-items').forEach((el) => { el.scrollTop = 400; }));
  await page.locator('.toast .toast-action').click().catch(() => {});
  await settle(900);
  check(`${tag} View link scrolls the list back to the top`, await page.evaluate((mob) => (mob ? document.querySelector('#mobile-screen-scroll').scrollTop : Math.max(...[...document.querySelectorAll('.desktop-full-table-view, #desktop-compact-list-items')].map((e) => e.scrollTop))) <= 2, m));

  /* ---------- the saved data in the detail view ---------- */
  if (m) await row.click(); // phone: tap the card to open its sheet
  else await settle(300);
  const detail = m ? page.locator('#sheet-body-content') : page.locator('#desktop-sheet-body');
  await detail.waitFor();
  await settle(500);
  const cd = await detail.innerText();
  check(`${tag} Customer Details show the saved data`, ['Arjun Mehra', 'arjun@example.com', 'Mumbai', 'Kashmir', '₹2,50,000', 'Honeymoon, wants a houseboat.', '98765 12345'].every((t) => cd.includes(t)), cd.slice(0, 400));
  await page.locator(m ? '[data-sheet-tab="guests"]' : '[data-dt-tab="guests"]').click();
  await settle(400);
  const gt = await detail.innerText();
  check(`${tag} Guests tab lists 3 guests with ages`, gt.includes('Arjun Mehra') && gt.includes('Age 34') && gt.includes('Riya') && gt.includes('Age 31') && gt.includes('Guest 3'), gt.slice(0, 400));
  check(`${tag} Guests (3) badge`, (await page.locator(m ? '#sheet-guest-count-badge' : '#desktop-guest-count-badge').innerText()) === '3');
  await page.locator(m ? '[data-sheet-tab="itinerary"]' : '[data-dt-tab="itinerary"]').click();
  await settle(500);
  const it = await detail.innerText();
  check(`${tag} Itinerary tab shows the saved plan`, it.includes('Day 1') && it.includes('Day 4') && it.includes('Note') && it.includes('Welcome drink on arrival'), it.slice(0, 300));
  await shot('8-detail-itinerary');
  // the same builder as a popup, for the saved inquiry: it opens on the saved plan and Done saves it again
  await page.locator(m ? '#mobile-add-event-btn' : '#desktop-add-event-btn').click();
  await page.locator('.bld-sheet').waitFor();
  await settle(700);
  check(`${tag} the itinerary tab still opens the builder as a popup, on the saved plan`, (await page.locator('.bld-sheet #bld-sub').innerText()).includes('Kashmir') && (await page.locator('.bld-sheet .bld-daychip').count()) === 4, await page.locator('.bld-sheet #bld-sub').innerText());
  check(`${tag} the popup has its own header, close button and footer`, (await page.locator('.bld-sheet .bld-header .sheet-close-btn[aria-label="Close"]').count()) === 1 && (await page.locator('.bld-sheet .bld-footer').count()) === 1);
  await page.locator('.bld-sheet [data-bld="next"]').click();
  await page.locator('.bld-sheet').waitFor({ state: 'detached' });
  await settle(500);
  check(`${tag} Done in the popup saves the itinerary`, (await page.locator('.toast').last().innerText()).includes('Itinerary saved'));
  if (m) { await page.keyboard.press('Escape'); await settle(400); }

  // the highlight goes away by itself after about six seconds
  await page.waitForTimeout(6000);
  check(`${tag} JUST ADDED disappears after about 6 seconds`, (await page.locator(`${slot} .just-added-tag`).count()) === 0 && (await page.locator(`${slot} .is-fresh`).count()) === 0);

  /* ---------- early save from step 2 (builder not finished), partial data ---------- */
  await openWizard();
  await page.locator('#wiz-name').fill('Sana Iyer');
  await page.locator('#wiz-city').fill('Pune');
  await page.locator('[data-chip="Manali"]').click();
  await next();
  await page.locator('#bld-start').fill('2027-01-10');
  await settle(200);
  await page.locator('#bld-end').fill('2027-01-12');
  await settle(300);
  const earlyLabel = await page.locator('#wiz-early').innerText();
  await page.locator('#wiz-early').click();
  await wiz.waitFor({ state: 'detached' });
  await settle(400);
  const t2 = await page.locator('.toast').last().innerText();
  check(`${tag} early save from step 2 keeps the unfinished itinerary (4 details: ${earlyLabel.replace(/\s+/g, ' ')})`, t2.includes('Inquiry saved with 4 details.'), t2);
  const r2 = await freshRow().innerText();
  check(`${tag} early-saved row has name, trip, 1 Pax, 2 Nights and date`, r2.includes('Sana Iyer') && r2.includes('Manali') && r2.includes('1 Pax') && r2.includes('2 Night') && r2.includes('10 Jan 2027'), r2);
  await page.waitForTimeout(6300);

  /* ---------- early save from step 1 with a couple of details, then an empty one ---------- */
  await openWizard();
  await page.locator('#wiz-phone').fill('90000 11111');
  await page.locator('#wiz-early').click();
  await wiz.waitFor({ state: 'detached' });
  await settle(400);
  check(`${tag} early save from step 1: "Inquiry saved with 1 detail."`, (await page.locator('.toast').last().innerText()).includes('Inquiry saved with 1 detail.'));
  const r3 = await freshRow().innerText();
  check(`${tag} a lead without a name is "Unnamed lead" and nights show nothing`, r3.includes('Unnamed lead') && r3.includes('1 Pax') && !r3.includes('Night') && r3.includes('90000 11111') || r3.includes('Unnamed lead'), r3);
  check(`${tag} initials of an unnamed lead are "?"`, (await freshRow().locator('.row-avatar').first().innerText()).trim() === '?');
  await page.waitForTimeout(6300);

  await openWizard();
  await page.locator('#wiz-early').click();
  await wiz.waitFor({ state: 'detached' });
  await settle(400);
  check(`${tag} empty save says "Inquiry saved."`, (await page.locator('.toast').last().innerText()).replace(/\s+/g, ' ').includes('Inquiry saved.') && !(await page.locator('.toast').last().innerText()).includes('with'));
  await page.waitForTimeout(6300);

  /* ---------- closing: Esc, backdrop, discard confirm ---------- */
  await openWizard();
  await page.keyboard.press('Escape');
  await wiz.waitFor({ state: 'detached' });
  check(`${tag} Esc closes an empty wizard without asking`, (await page.locator('.confirm-card').count()) === 0);
  check(`${tag} focus returns to the opening button`, await page.evaluate((id) => document.activeElement?.id === id, m ? 'mobile-page-add' : 'desktop-page-add'));

  await openWizard();
  await page.locator('#wiz-name').fill('Temp');
  await page.keyboard.press('Escape');
  await page.locator('.confirm-card').waitFor();
  check(`${tag} Esc with data asks to discard`, (await page.locator('.confirm-card').innerText()).includes('Discard this inquiry?'));
  await page.locator('[data-confirm="no"]').click();
  await settle(300);
  check(`${tag} "Keep editing" keeps the wizard and the data`, (await wiz.isVisible()) && (await page.locator('#wiz-name').inputValue()) === 'Temp');
  // backdrop click
  await page.mouse.click(m ? 190 : 6, m ? 12 : 6);
  await page.locator('.confirm-card').waitFor();
  check(`${tag} backdrop click with data asks to discard`, (await page.locator('.confirm-card').count()) === 1);
  await page.locator('[data-confirm="no"]').click();
  await settle(300);
  await page.keyboard.press('Escape');
  await page.locator('.confirm-card').waitFor();
  await page.locator('[data-confirm="yes"]').click();
  await wiz.waitFor({ state: 'detached' });
  const total = (await (await fetch(new URL('api/inquiries', BASE))).json()).data.length;
  check(`${tag} Discard closes the wizard and saves nothing`, total === before + 4, `before ${before}, now ${total}`);

  // a bad phone is stopped before anything is saved
  await openWizard();
  await page.locator('#wiz-phone').fill('call me');
  await page.locator('#wiz-early').click();
  await settle(400);
  check(`${tag} a bad phone number shows an inline error and keeps the wizard open`, (await wiz.isVisible()) && (await page.locator('#wiz-phone-err').isVisible()));
  await closeWizardDiscarding();

  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

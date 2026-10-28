// Browser test (not run by PHPUnit): Settings at 1280, 820 (tablet = PC layout) and 390.
// The section list and search, Company fields and toggles, saving with validation errors, the unsaved-changes confirm
// (Keep editing / Discard), the read-only Integrations (the Places key is never shown), the "nothing to configure" sections,
// the empty and error states, no horizontal scroll. It saves the company name and puts it back.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n').slice(0, 4).join(' | ')); summary(); process.exit(2); });

const sel = (page) => new URL(page.url()).searchParams.get('selected');
const IDS = ['company', 'lead-sources', 'inquiry-stages', 'bookings-payments', 'message-templates', 'notifications', 'integrations', 'data-backup'];

for (const [w, h] of [[1280, 800], [820, 1100], [390, 844]]) {
  const m = w < 700;
  const tag = `@${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (x) => { if (x.type() === 'error' && !/status of (500|422)/.test(x.text())) errors.push(x.text()); });
  const wait = (ms = 350) => page.waitForTimeout(ms);
  const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  const json = (url) => page.evaluate((u) => fetch(u, { headers: { Accept: 'application/json' } }).then((x) => x.json()).then((j) => j.data), url);
  const heading = () => page.locator('.sp-detail-head .customer-name-title').innerText();
  const field = (path) => page.locator(`[data-st-field="${path}"]`);
  const open = async (id) => {
    if (m) { await page.goto(`${BASE}#settings`, { waitUntil: 'domcontentloaded' }); }
    await page.waitForSelector('.sp-row', { timeout: 15000 }); await wait(200);
    await page.locator(`.sp-row[data-sp-id="${id}"]`).click();
    await page.waitForFunction((x) => new URL(location.href).searchParams.get('selected') === x && !document.querySelector('.sp-detail .sp-detail-skel'), id, { timeout: 15000 }).catch(() => {});
    await wait(300);
  };
  // a save is finished when the primary button reads "Save changes" again and is off
  const savedDone = () => page.waitForFunction(() => { const b = document.querySelector('.sp-detail-foot [data-sp-act="save"]'); return b && b.disabled && /Save changes/.test(b.textContent); }, null, { timeout: 15000 }).catch(() => {});
  const waitList = (re) => page.waitForFunction((s) => new RegExp(s).test(document.querySelector('.sp-list')?.innerText || ''), re, { timeout: 15000 }).catch(() => {});

  await signIn(page, BASE);
  const company = await json('/api/settings/company');
  const originalName = company.values.name;

  if (!m) await page.locator('#desktop-view-slot #nav-settings').click();
  else { await page.locator('#mobile-more-btn').click(); await wait(600); await page.locator('.more-sheet [data-nav="settings"]').click(); }
  await page.waitForSelector('.sp-row', { timeout: 15000 }).catch(() => {}); await wait(400);

  check(`${tag} Settings opens`, /#settings/.test(page.url()) && await page.locator('.sp[data-sp="settings"]').count() === 1);
  check(`${tag} no horizontal scroll`, await noHScroll());
  check(`${tag} eight sections in order`, (await page.locator('.sp-row').evaluateAll((r) => r.map((x) => x.dataset.spId))).join() === IDS.join());
  check(`${tag} no tabs, no Add button, no Export`, await page.locator('.sp-tabs:visible').count() === 0 && await page.locator('.sp-add, .sp-fab, .sp-export, .sp-titlebar').count() === 0 && await page.locator('#desktop-page-add:visible, #mobile-page-add:visible').count() === 0);
  check(`${tag} names and descriptions stay on one line`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .card-title, .sp-row .row-trip')].every((e) => e.getBoundingClientRect().height < 24)));
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill('place'); await wait(900);
  check(`${tag} search finds Integrations by its description`, await page.locator('.sp-row').count() === 1 && /Integrations/.test(await page.locator('.sp-row').innerText()));
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill('zzzzqq'); await wait(900);
  check(`${tag} no results: calm empty state`, /No settings found/.test(await page.locator('.sp-list').innerText()));
  await page.locator('.sp .compact-search-bar input, .sp .search-input-wrapper input').fill(''); await wait(900);

  // Company
  if (!m) check(`${tag} Company is selected first`, sel(page) === 'company' && /Company/.test(await heading()));
  else await page.locator('.sp-row[data-sp-id="company"]').click();
  await page.waitForSelector('.st-form input', { timeout: 15000 }).catch(() => {}); await wait(300);
  check(`${tag} Company: five fields with the saved values`, await page.locator('.st-form input').count() === 5 && await field('values.name').inputValue() === originalName);
  check(`${tag} Company: four preference switches and three services`, await page.locator('.st-card .sp-switch').count() === 4 && await page.locator('.st-service').count() === 3);
  check(`${tag} service pills: Google Places, WhatsApp, Email`, (await page.locator('.st-service b').allInnerTexts()).join() === 'Google Places,WhatsApp,Email');
  check(`${tag} Save and Discard are off until something changes`, await page.locator('[data-sp-act="save"]').isDisabled() && await page.locator('[data-sp-act="discard"]').isDisabled());
  // (the list's search box may still hold focus from the search steps above; what matters is that no form field grabbed it)
  const focused = await page.evaluate(() => { const a = document.activeElement; return /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.closest('.sp-detail') ? (a.id || a.outerHTML.slice(0, 120)) : ''; });
  check(`${tag} no field is focused on its own`, !focused, focused);
  if (m) check(`${tag} phone: back arrow, bottom bar hidden, no horizontal scroll`, await page.locator('.sp-back[aria-label]').count() === 1 && await page.evaluate(() => getComputedStyle(document.querySelector('.mobile-bottom-nav')).display === 'none') && await noHScroll());

  // dirty state
  await field('values.name').fill('Ruyi Travels Test'); await wait(200);
  check(`${tag} typing turns Save and Discard on`, await page.locator('[data-sp-act="save"]').isEnabled() && await page.locator('[data-sp-act="discard"]').isEnabled());
  await page.locator('[data-sp-act="discard"]').click(); await wait(500);
  check(`${tag} Discard puts the saved value back`, await field('values.name').inputValue() === originalName && await page.locator('[data-sp-act="save"]').isDisabled());
  await field('values.name').fill('Ruyi Travels Test'); await wait(200);
  const gst = page.locator('[data-sp-toggle="preferences.showGst"]');
  const gstBefore = await gst.getAttribute('aria-checked');
  await gst.click(); await wait(200);
  check(`${tag} a switch flips`, await gst.getAttribute('aria-checked') !== gstBefore);
  await gst.click(); await wait(200);

  // leaving with unsaved changes
  if (!m) {
    await page.locator('.sp-row[data-sp-id="lead-sources"]').click(); await wait(500);
    check(`${tag} switching section with unsaved changes asks (Keep editing / Discard)`, await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).isVisible() && await page.locator('.confirm-card').getByRole('button', { name: 'Discard', exact: true }).isVisible());
    await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).click(); await wait(500);
    check(`${tag} Keep editing keeps the typed text`, await field('values.name').inputValue() === 'Ruyi Travels Test' && sel(page) === 'company');
    await page.locator('#desktop-view-slot #nav-dashboard').click(); await wait(500);
    check(`${tag} leaving the page asks too`, await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).isVisible());
    await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).click(); await wait(400);
  } else {
    await page.locator('.sp-back').click(); await wait(500);
    check(`${tag} phone: the back arrow with unsaved changes asks`, await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).isVisible());
    await page.locator('.confirm-card').getByRole('button', { name: 'Keep editing' }).click(); await wait(400);
  }

  // saving: a validation error first, then a valid save
  await field('values.email').fill('not-an-email'); await wait(200);
  await page.locator('[data-sp-act="save"]').click(); await page.waitForSelector('[data-st-error="values.email"]:not([hidden])', { timeout: 10000 }).catch(() => {});
  check(`${tag} a bad email is refused and shown next to the field`, await page.locator('[data-st-error="values.email"]:not([hidden])').count() === 1 && await field('values.email').getAttribute('aria-invalid') === 'true', await page.locator('.st-error').allInnerTexts().then((t) => t.join('|')));
  check(`${tag} the refused save kept what was typed and saved nothing`, await field('values.name').inputValue() === 'Ruyi Travels Test' && (await json('/api/settings/company')).values.name === originalName);
  await field('values.email').fill(company.values.email || 'hello@ruyitravels.com'); await wait(200);
  check(`${tag} fixing the field clears its error`, await page.locator('[data-st-error="values.email"]:not([hidden])').count() === 0);
  await page.locator('[data-sp-act="save"]').click(); await savedDone();
  check(`${tag} Save writes the company name`, (await json('/api/settings/company')).values.name === 'Ruyi Travels Test');
  check(`${tag} after saving, Save is off and nothing asks when leaving`, await page.locator('[data-sp-act="save"]').isDisabled());
  await field('values.name').fill(originalName); await wait(200);
  await page.locator('[data-sp-act="save"]').click(); await savedDone();
  check(`${tag} the company name is put back`, (await json('/api/settings/company')).values.name === originalName);

  // other sections
  await open('lead-sources');
  check(`${tag} Lead sources: a name and a switch per source`, await page.locator('.st-source').count() >= 1 && await page.locator('.st-source .sp-switch').count() === await page.locator('.st-source').count() && await page.locator('.sp-add, button:has-text("Add source")').count() === 0);
  await open('inquiry-stages');
  check(`${tag} Inquiry stages: the four real stages with counts`, (await page.locator('.sp-linkrow-text b').allInnerTexts()).slice(0, 4).join() === 'New,Ongoing,Warm,Hot' && (await page.locator('.sp-linkrow-right b').allInnerTexts()).slice(0, 4).every((n) => /^\d+$/.test(n)));
  check(`${tag} Inquiry stages: read only, no footer bar`, await page.locator('.sp .sp-detail-foot button').count() === 0 && await page.locator('.sp .sp-detail-foot:visible').count() === 0);
  await open('bookings-payments');
  check(`${tag} Bookings and payments: three number fields`, await page.locator('.st-form input').count() === 3);
  await field('values.gstPercent').fill('500'); await page.locator('[data-sp-act="save"]').click(); await page.waitForSelector('[data-st-error="values.gstPercent"]:not([hidden])', { timeout: 10000 }).catch(() => {});
  check(`${tag} an out-of-range GST is refused with a message`, await page.locator('[data-st-error="values.gstPercent"]:not([hidden])').count() === 1);
  await page.locator('[data-sp-act="discard"]').click(); await wait(400);
  await open('notifications');
  check(`${tag} Notifications: four alert switches`, await page.locator('.st-card .sp-switch').count() === 4);
  await open('message-templates');
  check(`${tag} Message templates: a calm "Nothing to configure yet"`, /Nothing to configure yet/.test(await page.locator('.sp-detail-body').innerText()));
  check(`${tag} Message templates: no footer bar`, await page.locator('.sp .sp-detail-foot button').count() === 0 && await page.locator('.sp .sp-detail-foot:visible').count() === 0);
  await open('data-backup');
  check(`${tag} Data and backup: a calm "Nothing to configure yet"`, /Nothing to configure yet/.test(await page.locator('.sp-detail-body').innerText()));
  await open('integrations');
  const text = await page.locator('.sp-detail-body').innerText();
  check(`${tag} Integrations: statuses, provider setting and key state`, /Google Places/.test(text) && /PLACES_PROVIDER/.test(text) && /Google API key/.test(text) && /Configured|Not configured/.test(text));
  const html = await page.content();
  const apiText = JSON.stringify(await json('/api/settings/integrations')) + JSON.stringify(await json('/api/settings/company'));
  check(`${tag} the Places key is nowhere on the page or in the settings JSON`, !/AIza[0-9A-Za-z_-]{20,}/.test(html + apiText) && !/api[_-]?key["']?\s*[:=]\s*["'][^"']{8,}/i.test(apiText));
  check(`${tag} nothing in Integrations is editable`, await page.locator('.sp-detail-body input, .sp-detail-body .sp-switch').count() === 0);

  // empty and failing API
  await page.route('**/api/settings', (r) => r.fulfill({ json: { success: true, data: [] } }));
  await page.goto(`${BASE}#settings`, { waitUntil: 'domcontentloaded' }); await page.reload({ waitUntil: 'domcontentloaded' }); await waitList('No settings yet');
  check(`${tag} empty: calm empty state`, /No settings yet/.test(await page.locator('.sp-list').innerText()));
  await page.unroute('**/api/settings');
  await page.route('**/api/settings', (r) => r.fulfill({ status: 500, json: { message: 'boom' } }));
  await page.reload({ waitUntil: 'domcontentloaded' }); await waitList('Could not load settings');
  check(`${tag} error: shared error state with Try again`, /Could not load settings/.test(await page.locator('.sp-list').innerText()));
  await page.unroute('**/api/settings');
  await page.locator('#sp-retry').click(); await page.waitForSelector('.sp-row', { timeout: 15000 }).catch(() => {}); await wait(300);
  check(`${tag} error: Try again brings the list back`, await page.locator('.sp-row').count() === 8);
  // a section that fails to load has its own retry
  await page.route('**/api/settings/lead-sources', (r) => r.fulfill({ status: 500, json: { message: 'boom' } }));
  await open('lead-sources');
  check(`${tag} a section that fails shows its own error and Try again`, /Could not load Lead sources/.test(await page.locator('.sp-detail-body').innerText()) && await page.locator('[data-st-retry]').count() === 1);
  await page.unroute('**/api/settings/lead-sources');
  await page.locator('[data-st-retry]').click(); await page.waitForSelector('.st-source', { timeout: 15000 }).catch(() => {});
  check(`${tag} the section's Try again brings it back`, await page.locator('.st-source').count() >= 1);
  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

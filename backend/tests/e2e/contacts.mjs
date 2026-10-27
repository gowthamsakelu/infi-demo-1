// Browser test (not run by PHPUnit): the Contacts page at 1280, 820 (tablet = PC layout) and 390.
// The inbox list and detail, tabs and search, opening a message marking it read (and the sidebar badge following), the phone's full-screen detail with
// its back arrow, Add Contact doing nothing, Convert to Inquiry (creates one inquiry, links it, a second press is safe), the empty and error states.
// Needs the seeded messages (Database\Seeders\Pages\ContactMessageSeeder) on the dev server (docs/pages.md): `BASE=http://127.0.0.1:8000/ node contacts.mjs`.
// It marks three messages unread first, and converts one message that has not been converted yet (one new inquiry per run, in the dev copy).
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
let converted = false; // one conversion per run is enough: it is the same code on every screen size
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
  const sel = () => new URL(page.url()).searchParams.get('selected');
  const api = (path, method = 'GET', body) => page.evaluate(async ([path, method, body]) => {
    const res = await fetch(path, { method, credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' }, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  }, [path, method, body]);
  const list = async () => (await api('/api/contact-messages')).json.data;
  const badge = async () => (await api('/api/nav/counts')).json.data.contacts;
  const open = async (q = '') => { await page.goto(`${BASE}${q || '?'}#contacts`, { waitUntil: 'networkidle' }); await page.reload({ waitUntil: 'networkidle' }); // a fresh load without the previous page's ?selected=
     await page.waitForSelector('.sp-row, .sp-list .state-box', { timeout: 15000 }).catch(async (e) => { if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/contacts-open-fail.png` }); console.log(errors.join(' | '), page.url(), await page.evaluate(() => document.querySelector('#desktop-page-host')?.innerHTML.slice(0, 200))); throw e; }); await wait(500); };
  const tabs = async () => (await page.locator('.sp-tabs .tab-pill').allInnerTexts()).join('|').replace(/\s+/g, ' ');

  await signIn(page, BASE);
  // start from a known state: three unread messages
  let all = await list();
  for (const subject of ['Kashmir trip for 4 in December', 'Goa villa for a group of 10', 'Honeymoon package, Maldives or Bali']) {
    const row = all.find((x) => x.subject === subject);
    if (row) await api(`/api/contact-messages/${row.id}`, 'PATCH', { read: true }).then(() => api(`/api/contact-messages/${row.id}`, 'PATCH', { read: false }));
  }
  all = await list();
  const unread = all.filter((x) => x.unread);
  const total = all.length;

  await open();
  check(`${tag} Contacts opens`, await page.locator('.sp[data-sp="contacts"]').count() === 1 && /^Contacts/.test(await page.locator(m ? '.sp-mtitle' : '.sp-title').innerText()));
  check(`${tag} no horizontal scroll`, await noHScroll());
  check(`${tag} every message is listed`, await page.locator('.sp-row').count() === total, `${await page.locator('.sp-row').count()} of ${total}`);
  check(`${tag} list row: avatar, name, subject, preview, time`, await page.evaluate(() => { const r = document.querySelector('.sp-row'); return !!r.querySelector('.ct-ini') && !!r.querySelector('.card-title') && !!r.querySelector('.row-trip') && !!r.querySelector('.card-meta-row span') && !!r.querySelector('.ct-time'); }));
  check(`${tag} names, subjects and previews are single-line with ellipsis`, await page.evaluate(() => [...document.querySelectorAll('.sp-row .card-title, .sp-row .row-trip, .sp-row .card-meta-row span')].every((e) => e.getBoundingClientRect().height < 24)));
  check(`${tag} the unread messages have a blue dot`, await page.locator('.sp-row .ct-dot').count() === (m ? unread.length : unread.length - 1), `${await page.locator('.sp-row .ct-dot').count()}`);
  check(`${tag} converted rows say which inquiry`, /Converted to Inquiry #INQ-\d+/.test(await page.locator('.sp-list').innerText()));

  if (!m) {
    // PC: the first message is open at once and is marked read (the sidebar badge follows)
    check(`${tag} first message selected, ?selected= in the URL`, !!sel() && await page.locator('.sp-row.active').count() === 1 && /Priya Mehta/.test(await page.locator('.sp-head-name h2').innerText()));
    await wait(700);
    const nav = (await page.locator('[data-nav-count="contacts"]').first().innerText()).trim();
    check(`${tag} sidebar badge equals the unread count`, Number(nav || 0) === await badge(), `${nav} vs ${await badge()}`);
    check(`${tag} the badge dropped by one when the first message was opened`, await badge() === unread.length - 1, `${await badge()} vs ${unread.length}`);
    check(`${tag} detail: message, "details picked up" grid, assign row, status row, three footer buttons`,
      /Kashmir trip for 4 in December/.test(await page.locator('.ct-msg').innerText())
      && /Details picked up for the inquiry/i.test(await page.locator('.sp-detail-body').innerText())
      && (await page.locator('.sp-grid2 dt').allInnerTexts()).join('|') === 'Destination|Dates|Travellers|Interests|Matching package|Existing customer'
      && await page.locator('.ct-row').count() === 2
      && (await page.locator('.sp-detail-foot').innerText()).replace(/\s+/g, ' ').includes('Reply on WhatsApp Reply by email Convert to Inquiry'));
    check(`${tag} Convert to Inquiry is the one solid primary button`, await page.locator('.sp-detail-foot .btn-primary-desktop').count() === 1 && await page.locator('.sp-detail-foot .btn-secondary-desktop').count() === 2);
    check(`${tag} footer buttons are the same height`, await page.evaluate(() => new Set([...document.querySelectorAll('.sp-detail-foot .sp-foot-btn')].map((b) => Math.round(b.getBoundingClientRect().height))).size === 1));
    check(`${tag} Reply by email is a mailto link with the sender`, /^mailto:priya\.mehta@gmail\.com/.test(await page.locator('.sp-detail-foot a').getAttribute('href')));
    check(`${tag} the matching package row never fails (a package or a calm "No match yet")`, /Matching package\s*\n?.+/.test(await page.locator('.sp-grid2').innerText()));
  }

  // tabs and search
  const base = await tabs();
  const want = `All ${total}|Unread ${all.filter((x) => x.unread).length - (m ? 0 : 1)}|Converted ${all.filter((x) => x.status === 'converted').length}|Spam ${all.filter((x) => x.status === 'spam').length}`;
  check(`${tag} tab counts`, base === want, `${base} vs ${want}`);
  await page.locator('[data-sp-tab="unread"]').click(); await wait(500);
  check(`${tag} Unread tab shows only unread`, await page.locator('.sp-row').count() === (await list()).filter((x) => x.unread).length && await page.locator('.sp-row:not(:has(.ct-dot))').count() <= (m ? 0 : 1));
  await page.locator('[data-sp-tab="converted"]').click(); await wait(500);
  check(`${tag} Converted tab`, await page.locator('.sp-row').count() === all.filter((x) => x.status === 'converted').length);
  await page.locator('[data-sp-tab="spam"]').click(); await wait(500);
  check(`${tag} Spam tab: spam is listed but has no dot`, await page.locator('.sp-row').count() === all.filter((x) => x.status === 'spam').length && await page.locator('.sp-row .ct-dot').count() === 0);
  await page.locator('[data-sp-tab="all"]').click(); await wait(400);
  await page.locator('.sp-search-row input').fill('rishikesh'); await wait(900);
  check(`${tag} search narrows the list`, await page.locator('.sp-row').count() >= 1 && await page.locator('.sp-row').count() < total);
  await page.locator('.sp-search-row input').fill('zzzzqq'); await wait(900);
  check(`${tag} no results: calm empty states`, /No messages found/.test(await page.locator('.sp-list').innerText()) && (m || /No records to show/.test(await page.locator('.sp-detail-body').innerText())));
  await page.locator('.sp-search-row input').fill(''); await wait(900);

  // opening an unread message marks it read and the badge follows
  const target = (await list()).find((x) => x.unread && x.subject === 'Goa villa for a group of 10') || (await list()).find((x) => x.unread);
  const beforeBadge = await badge();
  const patched = page.waitForResponse((r) => /\/api\/contact-messages\/\d+$/.test(r.url()) && r.request().method() === 'PATCH');
  await page.locator(`.sp-row[data-sp-id="${target.id}"]`).click();
  check(`${tag} opening a message sends the read PATCH`, (await patched).ok());
  await wait(700);
  check(`${tag} the dot is gone and the sidebar badge went down by one`, await page.locator(`.sp-row[data-sp-id="${target.id}"] .ct-dot`).count() === 0 && await badge() === beforeBadge - 1, `${await badge()} vs ${beforeBadge}`);
  if (!m) check(`${tag} sidebar badge text updated`, Number((await page.locator('[data-nav-count="contacts"]').first().innerText()).trim() || 0) === await badge());
  if (m) {
    check(`${tag} phone: tapping a card opens the detail full screen`, sel() === String(target.id) && await page.locator('.sp-detail.is-open').count() === 1 && /Rahul Verma|./.test(await page.locator('.sp-head-name h2').innerText()));
    check(`${tag} phone: back arrow labelled, bottom bar hidden, no horizontal scroll`, await page.locator('.sp-back[aria-label]').count() === 1 && await page.evaluate(() => getComputedStyle(document.querySelector('.mobile-bottom-nav')).display === 'none') && await noHScroll());
    check(`${tag} phone: three footer buttons, the primary one on its own row`, await page.locator('.sp-detail-foot .sp-foot-btn').count() === 3 && await page.evaluate(() => { const b = document.querySelector('.sp-detail-foot .btn-primary-desktop').getBoundingClientRect(); return b.width > innerWidth * 0.8; }));
    await page.locator('.sp-back').click(); await wait(500);
    check(`${tag} phone: back arrow returns to the list`, sel() === null && await page.locator('.sp-detail.is-open').count() === 0);
    await page.locator('.sp-row').nth(1).click(); await wait(400);
    await page.goBack(); await wait(500);
    check(`${tag} phone: browser back closes the detail`, await page.locator('.sp-detail.is-open').count() === 0 && /#contacts/.test(page.url()));
  } else {
    check(`${tag} clicking another message switches the pane`, sel() === String(target.id));
  }

  // WhatsApp opens a chat with the sender (the click only calls window.open: no real tab is needed)
  if (m) await page.locator('.sp-row').first().click(); else await page.locator('.sp-row').first().click();
  await wait(500);
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(String(u)); return null; }; });
  await page.locator('[data-ct-act="whatsapp"]').click(); await wait(300);
  const opened = await page.evaluate(() => window.__opened);
  check(`${tag} Reply on WhatsApp opens wa.me with the sender's number`, opened.length === 1 && /^https:\/\/wa\.me\/91\d{10}\?text=/.test(opened[0]), opened.join(','));

  // Add Contact does nothing
  if (m) { await page.locator('.sp-back').click(); await wait(500); }
  const add = page.locator(m ? '.sp-fab' : '.sp-add');
  check(`${tag} Add Contact is drawn`, await add.isVisible() && /Add Contact/.test(await add.innerText()));
  await add.click(); await wait(400);
  check(`${tag} Add Contact does nothing yet`, await page.locator('.modal-overlay.open, .asg-overlay.open, .sheet-overlay.open, [role="dialog"]:visible').count() === 0);
  check(`${tag} no field focused`, await page.evaluate(() => !/INPUT|TEXTAREA/.test(document.activeElement.tagName)));

  // Convert to Inquiry (once per run): one inquiry is created and linked, a second press is safe
  if (!converted) {
    const cand = (await list()).find((x) => x.status !== 'converted' && x.status !== 'spam' && !x.inquiryId);
    if (!cand) { check(`${tag} (no unconverted message left to test the convert flow: re-seed the dev copy)`, false); } else {
      const inquiriesBefore = (await api('/api/inquiries')).json.data.length;
      await open(`?selected=${cand.id}`);
      if (m) { await page.locator(`.sp-row[data-sp-id="${cand.id}"]`).click(); await wait(500); }
      check(`${tag} the message to convert is open and has Convert to Inquiry`, sel() === String(cand.id) && await page.locator('[data-ct-act="convert"]').count() === 1);
      const posted = page.waitForResponse((r) => /\/convert$/.test(r.url()) && r.request().method() === 'POST');
      await page.locator('[data-ct-act="convert"]').click();
      const res = await posted;
      check(`${tag} Convert sends a POST that creates the inquiry`, res.status() === 201, String(res.status()));
      const body = await res.json();
      await wait(900);
      const inquiriesAfter = (await api('/api/inquiries')).json.data;
      check(`${tag} exactly one inquiry was created and it is in the Inquiries API`, inquiriesAfter.length === inquiriesBefore + 1 && inquiriesAfter.some((i) => i.id === body.inquiry.id));
      const created = inquiriesAfter.find((i) => i.id === body.inquiry.id);
      check(`${tag} the inquiry carries the sender's name, trip and source`, created && created.customer_name === cand.name && created.trip === (cand.destination || cand.subject) && created.lead_source === 'Website form', JSON.stringify(created));
      check(`${tag} the detail now says Converted and offers View Inquiry instead of Convert`, /Converted to Inquiry INQ-\d+/.test(await page.locator('.ct-rows').innerText()) && await page.locator('[data-ct-act="convert"]').count() === 0 && await page.locator('[data-ct-act="open-inquiry"]').count() === 1);
      check(`${tag} the list row says Converted to Inquiry`, new RegExp(`Converted to Inquiry #${body.inquiry.id}`).test(await page.locator(`.sp-row[data-sp-id="${cand.id}"]`).innerText()));
      const again = await api(`/api/contact-messages/${cand.id}/convert`, 'POST');
      check(`${tag} pressing convert again is safe: same inquiry, no second row`, again.status === 200 && again.json.created === false && again.json.inquiry.id === body.inquiry.id && (await api('/api/inquiries')).json.data.length === inquiriesBefore + 1);
      await open(`?selected=${cand.id}`);
      if (m) { await page.locator(`.sp-row[data-sp-id="${cand.id}"]`).click(); await wait(500); }
      check(`${tag} after a reload it is still converted (no Convert button)`, await page.locator('[data-ct-act="convert"]').count() === 0 && await page.locator('[data-ct-act="open-inquiry"]').count() === 1);
      converted = true;
    }
  }

  // empty and error states
  await open();
  await page.route('**/api/contact-messages', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} empty data shows the shared empty state`, /No messages yet/.test(await page.locator('.sp-list').innerText()) && (m || /No records to show/.test(await page.locator('.sp-detail-body').innerText())) && await noHScroll());
  await page.unroute('**/api/contact-messages');
  await page.route('**/api/contact-messages', (r) => r.abort());
  await page.reload({ waitUntil: 'networkidle' }); await wait(900);
  check(`${tag} a failing API shows the shared error state`, /Could not load messages/.test(await page.locator('.sp-list').innerText()) && await page.locator('#sp-retry').count() === 1);
  await page.unroute('**/api/contact-messages');
  await page.locator('#sp-retry').click();
  await page.waitForSelector('.sp-row', { timeout: 8000 }).catch(() => {});
  check(`${tag} Try again loads the messages`, await page.locator('.sp-row').count() === total);

  check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
process.exit(summary() ? 1 : 0);

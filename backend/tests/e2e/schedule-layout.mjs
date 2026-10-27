// Browser test (not run by PHPUnit): the Day-wise Schedule layout (narrow day column, wide cards) and "Add Event" opening in place
// inside a phone's detail sheet (never a popup on a popup) while PC keeps its single centred dialog.
// Run against a dev server: `BASE=http://127.0.0.1:8000/ node schedule-layout.mjs`. It writes a test itinerary to one booking and one
// inquiry and puts the original back afterwards.
import { chromium } from 'playwright';
import { signIn } from './signin.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:8000/';
const VPS = [[360, 740], [390, 844], [430, 932], [768, 1024], [1280, 800]];
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const fail = [];
const check = (name, ok, extra = '') => { results.push([name, !!ok]); if (!ok) fail.push(`${name} ${extra}`); };
const summary = () => { const failed = results.filter(([, ok]) => !ok); console.log(`${results.length - failed.length}/${results.length} passed`); fail.forEach((f) => console.log('FAIL', f)); return failed.length; };
process.on('uncaughtException', (e) => { console.log('STOPPED:', String(e.message).split('\n').slice(0, 4).join(' | ')); summary(); process.exit(2); });
const api = async (path, init) => (await fetch(new URL(path, BASE), { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, ...init })).json();

const LONG = 'Landing Site and Tibetan Cultural Centre Guided Walk With A Very Long Name That Must Be Cut Off';
const item = (id, title, sub, extra = {}) => ({ id, type: 'activity', icon: 'camera', title, subtitle: sub, time: sub.split(' • ')[0], ...extra });
const DAYS = [
  { day: 'Day 1', date: '13 Oct', isoDate: '2026-10-13', items: [item('S-1', LONG, '07:30 AM • A long description of this event that goes on and on and on and should be cut off with an ellipsis not wrapped')] },
  { day: 'Day 2', date: '14 Oct', isoDate: '2026-10-14', title: 'Local sightseeing day', items: [1, 2, 3, 4, 5].map((n) => item(`S-2${n}`, `Event number ${n}`, `0${n}:00 PM • Short note ${n}`, n === 2 ? { completed: true } : {})) },
  { day: 'Day 3', date: '15 Oct', isoDate: '2026-10-15', items: [] },
  { day: 'Day 12', date: '28 Dec', isoDate: '2026-12-28', items: [item('S-12', 'Late event', '11:45 PM • Evening', { inclusion: 'not_included' })] },
];

for (const kind of ['bookings', 'inquiries']) {
  const list = await api(`api/${kind}`);
  const id = (list.data || list)[0].id;
  const original = await api(`api/${kind}/${id}/itinerary`);
  await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: DAYS }) });

  for (const [w, h] of VPS) {
    const m = w < 700;
    const slot = m ? '#mobile-view-slot' : '#desktop-view-slot';
    const tag = `${kind}@${w}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
    const page = await ctx.newPage();
    await signIn(page, BASE);
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const wait = (ms = 400) => page.waitForTimeout(ms);
    const scroller = m ? '#sheet-body-content' : '#desktop-sheet-body';

    await page.goto(`${BASE}?t=${Date.now()}#${kind}`, { waitUntil: 'networkidle' }); await wait(900);
    if (m) await page.locator(`${slot} [data-booking-id="${id}"]`).first().click();
    else await page.locator(`${slot} [data-compact-booking-id="${id}"]`).first().click();
    await wait(600);
    await page.locator(`${slot} [data-sheet-tab="itinerary"], ${slot} [data-dt-tab="itinerary"]`).first().click(); await wait(500);

    // ---- layout
    const lay = await page.evaluate(({ slot, scroller }) => {
      const root = document.querySelector(`${slot} .itinerary-tab-content`);
      const box = document.querySelector(`${slot} ${scroller}`) || document.querySelector(scroller);
      const one = (el) => el.getBoundingClientRect().height < 24;
      const cols = [...root.querySelectorAll('.timeline-day-col')];
      const cards = [...root.querySelectorAll('.itinerary-card-item')];
      const content = root.querySelector('.itinerary-v2-container').getBoundingClientRect();
      const titles = [...root.querySelectorAll('.item-text-title')];
      const subs = [...root.querySelectorAll('.item-text-sub')];
      const overlap = cards.some((c) => { const t = c.querySelector('.item-text-title').getBoundingClientRect(); const b = c.querySelector('.item-menu-btn').getBoundingClientRect(); return t.right > b.left + 0.5 && t.bottom > b.top && t.top < b.bottom; });
      const gaps = cards.map((c, i) => (cards[i + 1] && c.parentElement === cards[i + 1].parentElement ? cards[i + 1].getBoundingClientRect().top - c.getBoundingClientRect().bottom : null)).filter((x) => x !== null);
      const first = cards[0].querySelector('.item-icon-box').getBoundingClientRect();
      const menu = root.querySelector('.item-menu-btn');
      return {
        dayW: cols.map((c) => Math.round(c.getBoundingClientRect().width)),
        dayOneLine: [...root.querySelectorAll('.day-badge-text, .day-date-sub')].every(one),
        dayFont: getComputedStyle(root.querySelector('.day-badge-text')).fontSize, dateFont: getComputedStyle(root.querySelector('.day-date-sub')).fontSize,
        cardLeft: Math.max(...cards.map((c) => c.getBoundingClientRect().left - content.left)), cardRight: Math.max(...cards.map((c) => Math.abs(content.right - c.getBoundingClientRect().right))),
        dayDbg: [...root.querySelectorAll('.day-badge-text, .day-date-sub')].map((el) => `${el.textContent}:${Math.round(el.getBoundingClientRect().height)}x${Math.round(el.getBoundingClientRect().width)}`),
        titleOne: titles.every((t) => t.getBoundingClientRect().height < 26), subOne: subs.every((t) => t.getBoundingClientRect().height < 22),
        ellipsis: getComputedStyle(titles[0]).textOverflow === 'ellipsis' && getComputedStyle(subs[0]).textOverflow === 'ellipsis',
        titleFont: getComputedStyle(titles[0]).fontSize, subFont: getComputedStyle(subs[0]).fontSize, tile: Math.round(first.width),
        hScroll: box.scrollWidth > box.clientWidth + 1, overlap, gapSame: new Set(gaps.map((g) => Math.round(g))).size <= 1,
        touch: getComputedStyle(menu, '::after').top, time: !!root.querySelector('.item-time'),
        dotAligned: Math.abs(root.querySelector('.timeline-dot-node').getBoundingClientRect().top - cards[0].getBoundingClientRect().top) < 24,
        clipped: [...root.querySelectorAll('.timeline-dot-node')].some((d) => { const r = d.getBoundingClientRect(); const b = box.getBoundingClientRect(); return r.left < b.left || r.right > b.right; }),
        empty: !!root.querySelector('.day-empty'),
      };
    }, { slot, scroller });
    check(`${tag} day column is narrow`, lay.dayW.every((x) => x >= 44 && x <= 52), JSON.stringify(lay.dayW));
    check(`${tag} Day and date stay on one line (Day 12, 28 Dec)`, lay.dayOneLine, JSON.stringify(lay.dayDbg));
    check(`${tag} day label 12.5px, date 11px`, lay.dayFont === '12.5px' && lay.dateFont === '11px', `${lay.dayFont} ${lay.dateFont}`);
    check(`${tag} cards fill all the width right of the day column`, lay.cardLeft <= 72 && lay.cardRight <= 2, JSON.stringify(lay));
    check(`${tag} title and sub are single lines with ellipsis`, lay.titleOne && lay.subOne && lay.ellipsis);
    check(`${tag} bigger type: 15px title, 13px sub, 44px icon tile`, lay.titleFont === '15px' && lay.subFont === '13px' && lay.tile === 44, JSON.stringify(lay));
    check(`${tag} no horizontal scroll, no overlap, no clipped dots`, !lay.hScroll && !lay.overlap && !lay.clipped, JSON.stringify(lay));
    check(`${tag} same gap between cards, 44px menu target, time weighted, dot aligned, empty day`, lay.gapSame && lay.touch === '-6px' && lay.time && lay.dotAligned && lay.empty, JSON.stringify(lay));

    // ---- Add Event
    const sheetBox = m ? await page.locator('#mobile-bottom-sheet').boundingBox() : null;
    const y0 = await page.locator(`${slot} ${scroller}`).first().evaluate((e) => { e.scrollTop = 120; return e.scrollTop; });
    await page.locator(`${slot} #${m ? 'mobile' : 'desktop'}-add-event-btn`).evaluate((el) => el.click()); await wait(800); // a script click: no automatic scrolling into view
    if (m) {
      check(`${tag} Add Event swaps in place, no second overlay`, await page.locator('.bld-inplace').count() === 1 && await page.locator('.sheet-overlay, .modal-overlay.open, .asg-overlay').count() === 0);
      const v = await page.locator('.bld-inplace').boundingBox();
      check(`${tag} the layer covers the sheet at the same height`, Math.abs(v.height - sheetBox.height) < 2 && Math.abs(v.y - sheetBox.y) < 2, JSON.stringify({ v, sheetBox }));
      check(`${tag} focus on the title, announced, nothing editable focused`, await page.evaluate(() => document.activeElement?.matches('[data-dialog-title]') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && /opened/.test(document.querySelector('#bld-inplace-live').textContent)));
      check(`${tag} action bar is not reachable while building`, await page.evaluate(() => document.querySelector('#mobile-confirm-booking-btn').closest('[inert]') !== null));
      check(`${tag} back arrow has a label`, await page.locator('.bld-inplace [data-bld-exit][aria-label]').count() === 1);
      // back without changes: same scroll, focus on the button
      await page.locator('.bld-inplace [data-bld-exit]').click(); await wait(600);
      check(`${tag} back returns to the schedule at the same scroll`, await page.locator('.bld-inplace').count() === 0 && Math.abs((await page.locator('#sheet-body-content').evaluate((e) => e.scrollTop)) - y0) < 3);
      check(`${tag} focus back on + Add Event`, await page.evaluate(() => document.activeElement?.id === 'mobile-add-event-btn'));
      // browser back
      await page.locator('#mobile-add-event-btn').click(); await wait(700);
      await page.goBack(); await wait(600);
      check(`${tag} browser back closes only the layer`, await page.locator('.bld-inplace').count() === 0 && await page.locator('#mobile-bottom-sheet.open').count() === 1);
      // Esc
      await page.locator('#mobile-add-event-btn').click(); await wait(700);
      await page.keyboard.press('Escape'); await wait(600);
      check(`${tag} Esc closes only the layer`, await page.locator('.bld-inplace').count() === 0 && await page.locator('#mobile-bottom-sheet.open').count() === 1);
      // add an event over the layer: the small dialog sits on top, the builder stays in place
      await page.locator('#mobile-add-event-btn').click(); await wait(700);
      if (await page.locator('.bld-inplace #bld-next').innerText() !== 'Done') { await page.locator('.bld-inplace [data-bld="next"]').click(); await wait(500); }
      await page.locator('.bld-inplace [data-add="note"]').first().click(); await wait(600);
      check(`${tag} the add dialog opens above the in-place builder`, await page.locator('.item-dialog').count() === 1 && await page.locator('.bld-inplace').count() === 1);
      await page.locator('.item-dialog textarea').fill('Carry warm clothes'); await page.locator('.item-dialog [data-form-save]').click(); await wait(600);
      // leaving with unsaved input asks first
      await page.locator('.bld-inplace [data-bld-exit]').click(); await wait(500);
      check(`${tag} unsaved input: the shared confirm appears`, await page.locator('.confirm-card').count() === 1);
      await page.locator('.confirm-card [data-confirm="no"]').click(); await wait(500);
      check(`${tag} Keep editing stays in the builder`, await page.locator('.bld-inplace').count() === 1 && await page.locator('.confirm-card').count() === 0);
      await page.locator('.bld-inplace [data-bld="next"]').click(); await wait(1500); // Done
      check(`${tag} Done returns to the schedule and shows the new event`, await page.locator('.bld-inplace').count() === 0 && /Carry warm clothes/.test(await page.locator('#sheet-body-content').innerText()));
      check(`${tag} the new event is highlighted`, await page.locator('.itinerary-card-item.just-added').count() >= 1);
      check(`${tag} toast says Event added`, /Event added/.test(await page.locator('#toast-container').innerText()));
    } else {
      check(`${tag} PC: one centred dialog, nothing stacked`, await page.locator('.bld-sheet').count() === 1 && await page.locator('.bld-inplace').count() === 0);
      const y1 = await page.locator(`${slot} ${scroller}`).first().evaluate((e) => e.scrollTop);
      check(`${tag} PC: the detail pane behind did not move`, y1 === y0, `${y0} ${y1}`);
      await page.keyboard.press('Escape'); await wait(600);
      check(`${tag} PC: closing returns to the same record and scroll`, await page.locator('.bld-sheet').count() === 0 && (await page.locator(`${slot} ${scroller}`).first().evaluate((e) => e.scrollTop)) === y0 && await page.locator('.itinerary-tab-content').count() === 1);
    }
    check(`${tag} no page errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
    await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: DAYS }) }); // same starting point for the next width
  }
  await api(`api/${kind}/${id}/itinerary`, { method: 'PUT', body: JSON.stringify({ days: original.data, meta: original.meta }) });
}

await browser.close();
process.exit(summary() ? 1 : 0);

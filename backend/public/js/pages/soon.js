// A listed page that is not built yet: the same page frame (title row on PC, header on the phone) with one calm card.
import { icon } from '../shared/icons.js';
import { esc } from '../shared/ui.js';
import { pageFrame } from '../shared/split-page.js';

export default {
  mount(host, ctx) {
    const frame = pageFrame(host, ctx, { title: ctx.item.label, subtitle: 'Coming soon' });
    frame.body.innerHTML = `<div class="sp-soon"><div class="state-box">
        <div class="sp-soon-icon">${icon(ctx.item.icon, { size: 26 })}</div>
        <h4>${esc(ctx.item.label)} is coming soon</h4>
        <p>This page is not built yet. Everything else in the CRM keeps working.</p>
      </div></div>`;
    return { destroy() { frame.destroy(); } };
  },
};

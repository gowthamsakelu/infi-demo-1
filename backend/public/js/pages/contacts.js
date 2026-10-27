// Contacts: messages from the website contact form, inbox style. List on the left (blue dot = unread), the message and the details picked up
// for an inquiry on the right. Opening a message marks it read; Convert to Inquiry creates one row in the Inquiries module, once.
// The Add Contact button is drawn as designed and does nothing yet.
import { createSplitPage } from '../shared/split-page.js';
import { getJson, sendJson } from '../shared/http.js';
import { esc, toast, openWhatsApp, openCall, initials } from '../shared/ui.js';
import { icon } from '../shared/icons.js';
import { pill, sectionTitle, detailGrid, plural } from '../shared/page-ui.js';
import { openAssign } from '../shared/assign-sheet.js';
import { loadInquiries } from '../shared/inquiry-store.js';

// The sidebar / More badge: ask the shell to count again (the shell owns the number; this page only says when it changed).
const loadNavCounts = () => import('../shared/nav.js').then((nav) => nav.loadNavCounts?.()).catch(() => {});

const LABEL = { new: 'New', replied: 'Replied', converted: 'Converted', spam: 'Spam' };
const PILL = { new: 'new', replied: 'ongoing', converted: 'converted', spam: 'spam' };
const dayMonth = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Today: the time. Yesterday: "Yesterday". Older: "24 Oct". */
function when(iso, long = false) {
  const d = new Date(iso);
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  if (days <= 0) return long ? `Today, ${time}` : time;
  if (days === 1) return long ? `Yesterday, ${time}` : 'Yesterday';
  return long ? `${dayMonth(d)}, ${time}` : dayMonth(d);
}

function dates(m) {
  if (!m.travelStart) return '';
  const a = new Date(`${m.travelStart}T00:00:00`);
  if (!m.travelEnd) return `${dayMonth(a)} ${a.getFullYear()}`;
  const b = new Date(`${m.travelEnd}T00:00:00`);
  return a.getMonth() === b.getMonth() ? `${a.getDate()} – ${b.getDate()} ${b.toLocaleDateString('en-IN', { month: 'short' })} ${b.getFullYear()}` : `${dayMonth(a)} – ${dayMonth(b)} ${b.getFullYear()}`;
}

function travellers(m) {
  const parts = [m.adults ? plural(m.adults, 'adult') : '', m.children ? plural(m.children, 'child', 'children') : ''].filter(Boolean);
  return parts.join(', ');
}

const pkg = (m) => (m.package ? `${m.package.name}${m.package.nights && m.package.days ? `, ${m.package.nights}N/${m.package.days}D` : ''}` : m.destination ? 'No match yet' : '');

function statusText(m) {
  if (m.status === 'converted') return m.inquiryId ? `Converted to Inquiry ${m.inquiryId}` : 'Converted to an inquiry';
  if (m.status === 'spam') return 'Marked as spam';
  return m.status === 'replied' ? 'Replied' : 'New, not yet replied';
}

const preview = (m) => (m.status === 'converted' ? (m.inquiryId ? `Converted to Inquiry #${m.inquiryId}` : 'Converted to an inquiry') : m.status === 'spam' ? 'Marked as spam' : m.message.replace(/\s+/g, ' '));

export default {
  css: true,
  mount(host, ctx) {
    let page = null;
    const busy = new Set();

    async function patch(m, body) {
      const res = await sendJson(`/api/contact-messages/${encodeURIComponent(m.id)}`, 'PATCH', body);
      Object.assign(m, { ...res.data, id: String(res.data.id) });
    }

    /** Opening a message marks it read, and the sidebar badge follows. */
    async function markRead(m) {
      if (!m.unread || busy.has(`read-${m.id}`)) return;
      busy.add(`read-${m.id}`);
      m.unread = false; m.read = true; // the dot goes at once
      page.api.refresh();
      try { await patch(m, { read: true }); } catch { m.unread = true; m.read = false; page.api.refresh(); }
      busy.delete(`read-${m.id}`);
      loadNavCounts();
    }

    async function convert(m) {
      if (busy.has(`convert-${m.id}`)) return;
      busy.add(`convert-${m.id}`);
      page.api.refresh();
      try {
        const res = await sendJson(`/api/contact-messages/${encodeURIComponent(m.id)}/convert`, 'POST');
        Object.assign(m, { ...res.data, id: String(res.data.id) });
        toast(res.created ? `Inquiry ${res.inquiry.id} created` : `Already converted to ${res.inquiry.id}`, 'success');
        loadInquiries().catch(() => {});
        loadNavCounts();
      } catch (e) { toast(e.message || 'Could not create the inquiry.', 'warning'); }
      busy.delete(`convert-${m.id}`);
      page.api.refresh();
    }

    async function setStatus(m, status) {
      try { await patch(m, { status }); toast(status === 'spam' ? 'Marked as spam' : 'Moved out of spam', 'success'); } catch (e) { toast(e.message || 'Could not save.', 'warning'); }
      page.api.refresh();
      loadNavCounts();
    }

    function assign(m) {
      const before = m.assignedTo;
      openAssign({
        kind: 'inquiry',
        items: [{ id: String(m.id), name: m.name, title: m.subject || m.name }],
        summary: { title: m.name, subtitle: m.subject || 'Website message', iconHtml: icon('mail', { size: 22 }) },
        onApply: (a) => { m.assignedTo = a.name; page.api.refresh(); },
        persist: async (a) => { await patch(m, { assigned_to_name: a.name }); return true; },
        onRevert: () => { m.assignedTo = before; page.api.refresh(); },
        onDone: () => page.api.refresh(),
      });
    }

    /** The footer bar: one full-width primary button over WhatsApp / Email / Call (the same bar as Confirm Booking). */
    const foot = (m) => ({
      primary: m.status === 'spam' ? { label: 'Not spam', act: 'notspam' }
        : m.inquiryId ? { label: 'View Inquiry', act: 'open-inquiry' }
        : { label: busy.has(`convert-${m.id}`) ? 'Creating inquiry…' : 'Convert to Inquiry', act: 'convert' },
      quick: [
        { label: 'WhatsApp', icon: 'whatsapp', act: 'whatsapp' },
        { label: 'Email', icon: 'mail', act: 'email' },
        { label: 'Call', icon: 'phone', act: 'call' },
      ],
    });

    page = createSplitPage(host, ctx, {
      title: 'Contacts',
      noun: 'message',
      plural: 'messages',
      addLabel: 'Add Contact',
      searchPlaceholder: 'Search messages...',
      load: () => getJson('/api/contact-messages'),
      subtitle: () => 'Messages from the website contact form · turn the good ones into inquiries',
      subtitleShort: (items) => { const n = items.filter((i) => i.unread).length; return n ? `${n} unread ${n === 1 ? 'message' : 'messages'}` : 'All caught up'; },
      tabs: [
        { key: 'all', label: 'All', test: () => true },
        { key: 'unread', label: 'Unread', test: (i) => i.unread },
        { key: 'converted', label: 'Converted', test: (i) => i.status === 'converted' },
        { key: 'spam', label: 'Spam', test: (i) => i.status === 'spam' },
      ],
      searchText: (i) => `${i.name} ${i.subject || ''} ${i.message} ${i.email || ''} ${i.destination || ''}`,
      row: (i) => ({
        tile: esc(initials(i.name)),
        name: i.name,
        pill: `<span class="ct-time">${esc(when(i.createdAt))}</span>${i.unread ? '<span class="ct-dot" role="img" aria-label="Unread"></span>' : ''}`,
        sub: i.subject || '',
        meta: preview(i),
      }),
      detail: (m) => {
        const head = {
          avatar: esc(initials(m.name)),
          title: m.name,
          pill: pill(PILL[m.status] || 'new', LABEL[m.status] || m.status),
          subtitle: [m.email, m.phone, `via ${m.source || 'Website form'}`].filter(Boolean).join(' · '),
        };
        const next = m.status === 'new' || m.status === 'replied'
          ? `<p class="ct-next"><b>Suggested next step:</b> convert to an inquiry and assign it to a team member. ${esc(m.name.split(' ')[0])} will be added as a guest automatically.</p>` : '';
        const body = `
          <section class="ct-msg"><div class="ct-msg-top"><h3>${esc(m.subject || 'Message')}</h3><span>${esc(when(m.createdAt, true))}</span></div><p>${esc(m.message)}</p></section>
          <section>${sectionTitle('Details picked up for the inquiry')}${detailGrid([
            ['Destination', m.destination || ''], ['Dates', dates(m)], ['Travellers', travellers(m)], ['Interests', m.interests || ''],
            ['Matching package', pkg(m)], ['Existing customer', m.existingCustomer ? 'Yes, existing customer' : 'No, new lead'],
          ])}</section>
          ${next}
          <section class="ct-rows">
            <div class="ct-row"><div><small>Assign to</small><b>${esc(m.assignedTo || 'Not assigned')}</b></div><button type="button" class="btn-secondary-desktop btn-sm" data-ct-act="assign">${m.assignedTo ? 'Change' : 'Assign'}</button></div>
            <div class="ct-row"><div><small>Status</small><b>${esc(statusText(m))}</b></div>${m.status === 'converted' ? '' : m.status === 'spam'
              ? '<button type="button" class="btn-secondary-desktop btn-sm" data-ct-act="notspam">Not spam</button>'
              : '<button type="button" class="btn-secondary-desktop btn-sm" data-ct-act="spam">Mark as spam</button>'}</div>
          </section>`;
        return { head, body, foot: foot(m) };
      },
      afterDetail: (_el, m) => { markRead(m); },
    });

    host.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ct-act], [data-sp-act]');
      const m = page.api.current();
      if (!btn || !m) return;
      switch (btn.dataset.ctAct || btn.dataset.spAct) {
        case 'whatsapp': openWhatsApp(m.name, m.phone, `Hi ${m.name.split(' ')[0]}, thanks for contacting Ruyi Travel${m.subject ? ` about "${m.subject}"` : ''}.`); break;
        case 'email': if (m.email) window.location.href = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'your message'}`)}`; else toast('No email address on this message.', 'warning'); break;
        case 'call': openCall(m.name, m.phone); break;
        case 'convert': convert(m); break;
        case 'open-inquiry': ctx.navigate('inquiries'); break;
        case 'assign': assign(m); break;
        case 'spam': setStatus(m, 'spam'); break;
        case 'notspam': setStatus(m, 'new'); break;
        default:
      }
    });

    return { destroy: () => page.destroy(), isDirty: () => page.isDirty() };
  },
};

// The three controls beside a person in the Operation Team and Users lists: the Bookings row's Call, WhatsApp and ⋮ (same markup, classes and menu).
// Numbers come from the record only: a missing or unusable number greys the button out instead of opening a broken link.
import { esc, contactButtons, rowMenuButton, openCall, openWhatsApp, openRowMenu } from './ui.js';

const validPhone = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 8 && d.length <= 15; };

/** The buttons' markup for `{ id, name, phone, email }`: Call, WhatsApp, ⋮. */
export function personActionsHtml({ id, name, phone, email }) {
  const ok = validPhone(phone);
  const data = ` data-p-name="${esc(name)}" data-p-phone="${esc(ok ? phone : '')}" data-p-email="${esc(email || '')}"`;
  const calls = contactButtons({ id, name, phone: ok ? phone : '', callAttr: 'data-person-call', waAttr: 'data-person-wa' })
    .replace(/<button /g, `<button type="button"${data}${ok ? '' : ' disabled aria-disabled="true"'} `);
  const more = rowMenuButton({ id, name, attr: 'data-person-menu' }).replace('<button ', `<button type="button"${data} `);
  return calls + more;
}

/**
 * One delegated listener on a list (capture phase, so the row's own click never also fires). Call = tel:, WhatsApp = wa.me, ⋮ = View details (+ Email).
 * "View details" is the row being tapped: the same detail opens.
 */
export function bindPersonActions(root) {
  if (!root || root.dataset.personBound) return;
  root.dataset.personBound = '1';
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-person-call], [data-person-wa], [data-person-menu]');
    if (!btn || !root.contains(btn)) return;
    e.stopPropagation();
    e.preventDefault();
    if (btn.disabled) return;
    const { pName: name, pPhone: phone, pEmail: email } = btn.dataset;
    if (btn.hasAttribute('data-person-call')) { openCall(name, phone); return; }
    if (btn.hasAttribute('data-person-wa')) { openWhatsApp(name, phone, `Hi ${name.split(' ')[0]},`, { silent: true }); return; }
    const row = btn.closest('.team-roster-card, [data-sp-id], .list-row-card');
    openRowMenu(btn, [{ key: 'view', label: 'View details', icon: 'eye' }, ...(email ? [{ key: 'email', label: 'Email', icon: 'mail' }] : [])], (key) => {
      if (key === 'view') row?.click();
      else if (key === 'email') window.location.href = `mailto:${email}`;
    });
  }, true);
}

/**
 * The one person card of the Operation Team and Users lists (same markup, same css): avatar with status dot, name + employee id, the role on its own
 * line, the tag and status badges on one tidy row, a meta line, then Call / WhatsApp / ⋮.
 * `avatar` and `badges` / `meta` are ready-made html; `dot` is the status dot class.
 */
export function personCardHtml({ avatar, dot, name, emp, role, badges = '', meta = '', person }) {
  return `
    <div class="team-card-left">
      <div class="team-avatar-container">${avatar}<span class="team-avatar-dot ${esc(dot)}"></span></div>
      <div class="team-card-info">
        <div class="team-card-title-line"><span class="team-card-name card-title">${esc(name)}</span>${emp ? `<span class="team-emp-tag">${esc(emp)}</span>` : ''}</div>
        <p class="team-card-role">${esc(role)}</p>
        <div class="team-card-badges">${badges}</div>
        <div class="team-card-meta-line">${meta}</div>
      </div>
    </div>
    <div class="team-card-actions">${personActionsHtml(person)}</div>`;
}

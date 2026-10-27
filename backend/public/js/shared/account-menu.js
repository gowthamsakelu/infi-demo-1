// The account menu on the "KS" badge (PC top bar and phone header): one delegated handler for both layouts.
// It uses the same floating menu as the row menus. "Sign out" posts to /logout like a normal form, so the session ends on the server.
import { openRowMenu } from './ui.js';

function signOut() {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/logout';
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (token) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = '_token';
    input.value = token;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export function initAccountMenu() {
  document.addEventListener('click', (e) => {
    const badge = e.target.closest('.ks-avatar-badge');
    if (!badge) return;
    openRowMenu(badge, [{ key: 'out', label: 'Sign out', icon: 'logout' }], (key) => { if (key === 'out') signOut(); });
  });
}

// The one way the CRM pages talk to their API: JSON in and out, the session cookie, the CSRF token for writes, and a clear error.
// `getJson` returns the response's `data`; `sendJson` does the same for POST / PUT / PATCH / DELETE.

export class ApiError extends Error {
  constructor(message, status, errors = {}) { super(message); this.status = status; this.errors = errors; }
}

const token = () => document.querySelector('meta[name="csrf-token"]')?.content || '';

async function call(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(method === 'GET' ? {} : { 'X-CSRF-TOKEN': token() }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) { window.location.assign('/login'); throw new ApiError('Please sign in again.', 401); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.message || 'Something went wrong. Please try again.', res.status, json.errors || {});
  return json;
}

export const getJson = async (url) => (await call(url)).data;
export const sendJson = async (url, method, body) => call(url, { method, body });

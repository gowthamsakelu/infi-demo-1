// The one way the CRM pages talk to their API: JSON in and out, the session cookie, the CSRF token for writes, and a clear error.
// `getJson` returns the response's `data`; `sendJson` does the same for POST / PUT / PATCH / DELETE.

export class ApiError extends Error {
  /** `kind`: 'network' (no answer), 'server' (5xx) or 'client' (4xx, e.g. a validation message the person should see). */
  constructor(message, status, errors = {}) { super(message); this.status = status; this.errors = errors; this.kind = status === 0 ? 'network' : status >= 500 ? 'server' : 'client'; }
}

export const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

const token = () => document.querySelector('meta[name="csrf-token"]')?.content || '';

async function call(url, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(method === 'GET' ? {} : { 'X-CSRF-TOKEN': token() }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    console.error(`[api] ${method} ${url}: no answer from the server`, cause);
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  if (res.status === 401) { window.location.assign('/login'); throw new ApiError('Please sign in again.', 401); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // The real error stays in the console (and in the Laravel log); the person only sees a calm sentence.
    if (res.status >= 500) console.error(`[api] ${method} ${url}: server error ${res.status}`, json);
    throw new ApiError(res.status >= 500 ? 'Something went wrong. Try again.' : json.message || 'Something went wrong. Please try again.', res.status, json.errors || {});
  }
  return json;
}

export const getJson = async (url) => (await call(url)).data;
export const sendJson = async (url, method, body) => call(url, { method, body });

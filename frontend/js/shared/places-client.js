// Browser side of hotel / activity search. It only ever talks to our own endpoints (/api/places, /api/saved,
// /api/vehicle-types); the Google key lives on the server and is never sent here.
const JSON_HEADERS = { Accept: 'application/json' };

let statusCache = null;
/** What answers search on the server: { enabled, provider: 'google' | 'demo' }. Asked once per page load. */
export function placesStatus() {
  statusCache ??= fetch('/api/places/status', { headers: JSON_HEADERS }).then((r) => r.json()).then((j) => ({ enabled: !!j.enabled, provider: j.provider || '' })).catch(() => ({ enabled: false, provider: '' }));
  return statusCache;
}

/** Autocomplete and Place Details are billed per session, so one token covers a search up to picking a result. */
export function newSession() {
  const raw = globalThis.crypto?.randomUUID?.() || `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return raw.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
}

/**
 * A search box's brain: waits 300ms after typing stops, drops answers to older queries and cancels the request in flight.
 * `onState` gets { status: 'idle' | 'loading' | 'ok' | 'error' | 'off', results, popular, message }; `popular` = the results answer an empty box.
 * With `popularWhenEmpty()` true an empty box asks for popular places instead of staying idle.
 */
export function createSearcher({ kind, getLocation, onState, popularWhenEmpty = () => false, wait = 300 }) {
  let timer = null;
  let controller = null;
  let session = newSession();

  async function run(q) {
    controller?.abort();
    controller = new AbortController();
    const mine = controller;
    onState({ status: 'loading', results: [] });
    try {
      const params = new URLSearchParams({ kind, session });
      if (q) params.set('q', q);
      const loc = getLocation?.();
      if (loc) params.set('location', loc);
      const res = await fetch(`/api/places/search?${params}`, { headers: JSON_HEADERS, signal: mine.signal });
      const body = await res.json().catch(() => ({}));
      if (mine.signal.aborted) return;
      if (!res.ok) {
        onState({ status: body.reason === 'not_configured' ? 'off' : 'error', results: [], message: body.message || 'Search is not available right now.' });
        return;
      }
      onState({ status: 'ok', results: body.data || [], popular: !!body.popular });
    } catch (err) {
      if (err?.name === 'AbortError') return;
      onState({ status: 'error', results: [], message: 'Could not reach search. Check your connection, or add the place by hand.' });
    }
  }

  return {
    query(text) {
      clearTimeout(timer);
      const q = text.trim();
      if (q.length === 1) return; // a single letter changes nothing
      if (q.length === 0 && !popularWhenEmpty()) { controller?.abort(); onState({ status: 'idle', results: [] }); return; }
      timer = setTimeout(() => run(q), q ? wait : 0);
    },
    /** Place Details for the chosen result; closes out the billing session and starts a fresh one. */
    async pick(placeId) {
      clearTimeout(timer);
      controller?.abort();
      const token = session;
      session = newSession();
      const res = await fetch(`/api/places/${encodeURIComponent(placeId)}?session=${encodeURIComponent(token)}`, { headers: JSON_HEADERS });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Could not load that place.');
      return body.data;
    },
    cancel() { clearTimeout(timer); controller?.abort(); },
  };
}

/** Recently used hotels / activities ('hotels' | 'activities'). Empty list when the call fails. */
export async function loadRecent(kind) {
  try {
    const res = await fetch(`/api/saved/${kind}`, { headers: JSON_HEADERS });
    return res.ok ? (await res.json()).data || [] : [];
  } catch { return []; }
}

/** Remember a place for next time. Fire and forget: a failure here must never block adding it to the day. */
export function saveRecent(kind, place) {
  fetch(`/api/saved/${kind}`, { method: 'POST', headers: { ...JSON_HEADERS, 'Content-Type': 'application/json' }, body: JSON.stringify(place) }).catch(() => {});
}

let vehiclesCache = null;
/** The vehicle catalogue, most popular first. Resolves to [] when it cannot be loaded (the form then asks for a name). */
export function loadVehicles() {
  vehiclesCache ??= fetch('/api/vehicle-types', { headers: JSON_HEADERS }).then((r) => (r.ok ? r.json() : { data: [] })).then((j) => j.data || []).catch(() => []);
  return vehiclesCache.then((list) => { if (!list.length) vehiclesCache = null; return list; });
}

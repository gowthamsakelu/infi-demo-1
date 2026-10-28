// Add / Edit for the catalog pages, in one place: the wizard's values are saved to the page's endpoint, and while the server runs on dummy data
// (USE_DUMMY_DATA) the record is kept in memory instead: the list, counts and tabs update at once, the new row shows JUST ADDED for a few seconds,
// and a refresh loses it. Nothing is written to a database or to localStorage.
//
// A page gives its endpoint, its wizard, and how the wizard's values become the request body, the record it shows in memory, and its wizard values.
import { sendJson } from './http.js';
import { openWizard } from './wizard.js';
import { createCatalogStore } from './catalog-store.js';

const FRESH_MS = 6000;

/** "12", "" or "x" -> 12, null, null (the wizard's text and number inputs as the server wants them). */
export const numOrNull = (x) => (x === '' || x == null || Number.isNaN(Number(x)) ? null : Number(x));
export const textOrNull = (x) => { const t = String(x ?? '').trim(); return t === '' ? null : t; };
/** The non-empty lines of a list input. */
export const listOf = (xs) => (xs || []).map((t) => String(t).trim()).filter(Boolean);

/**
 * @param {{
 *   key: string,                                              // the page, for its in-memory store
 *   endpoint: string,                                         // POST adds; PUT {endpoint}/{id} saves
 *   wizard: () => object,                                     // the wizard config (steps, fields, preview, defaults); save is added here
 *   toBody: (v: object) => object,                            // the wizard's values -> the request body
 *   local: (v: object, record: object|null) => object,        // the record to show in memory (dummy data); `record` is the one being edited
 *   values: (record: object) => object,                       // a record -> the wizard's values (Edit)
 *   load: () => Promise<object[]>,                            // the server's list (also reloads after a real save)
 *   onChange: (items: object[], info: { id: string|null, added: boolean }) => void,  // the page redraws (and selects a new record)
 * }} cfg
 */
export function createCatalogCrud(cfg) {
  const store = createCatalogStore(cfg.key);
  const fresh = new Set();
  let server = [];
  let freshTimer = null;

  const items = () => store.apply(server);

  async function load() {
    server = await cfg.load();
    return items();
  }

  function markFresh(id) {
    fresh.add(String(id));
    clearTimeout(freshTimer);
    freshTimer = setTimeout(() => { fresh.clear(); cfg.onChange(items(), { id: null, added: false }); }, FRESH_MS);
  }

  /** The wizard's save: send the values; the result is handled by `saved` once the wizard has closed. */
  async function submit(v, { mode, record }) {
    const url = mode === 'edit' ? `${cfg.endpoint}/${encodeURIComponent(record.id)}` : cfg.endpoint;
    const res = await sendJson(url, mode === 'edit' ? 'PUT' : 'POST', cfg.toBody(v));
    return { res, v, mode, record };
  }

  async function saved({ res, v, mode, record }) {
    let id = mode === 'edit' ? String(record.id) : null;
    if (res.dummy) {
      id = id ?? `new-${Date.now()}`;
      const row = { ...cfg.local(v, record), id };
      if (mode === 'edit') store.update(row); else store.add(row);
    } else {
      server = await cfg.load(); // the server's own list, with the new or changed record in it
      id = id ?? String(res.data?.id ?? '');
    }
    if (mode === 'add') markFresh(id);
    cfg.onChange(items(), { id, added: mode === 'add' });
  }

  const wizardFor = (mode, record) => ({ ...cfg.wizard(), save: (v, info) => submit(v, info) });

  /** Open the wizard in Add mode. */
  function add({ returnFocus } = {}) {
    openWizard(wizardFor('add', null), { mode: 'add', returnFocus, onSaved: (r) => saved(r) });
  }

  /** Open the same wizard in Edit mode on a full record (list fields and detail fields together). */
  function edit(record, { returnFocus } = {}) {
    openWizard(wizardFor('edit', record), { mode: 'edit', record, values: cfg.values(record), returnFocus, onSaved: (r) => saved(r) });
  }

  return {
    load,
    add,
    edit,
    items,
    /** The in-memory record of one added or edited this session (its detail too), else null. */
    detail: (id) => store.detail(id),
    isFresh: (id) => fresh.has(String(id)),
  };
}

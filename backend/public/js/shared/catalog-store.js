// The in-memory side of the catalog wizard while the server runs on dummy data (USE_DUMMY_DATA): records added or edited in the wizard live here,
// per page, until the browser is refreshed. Nothing is written to a database or to localStorage. With real data the server answers with the saved
// record and this store is not used.
const pages = new Map(); // page key -> { added: record[], edited: Map(id -> record) }
const bucket = (key) => { if (!pages.has(key)) pages.set(key, { added: [], edited: new Map() }); return pages.get(key); };

export function createCatalogStore(key) {
  const b = bucket(key);
  return {
    /** The list from the server with this session's edits applied and its added records first (newest first). */
    apply: (items) => [...b.added, ...items.map((i) => b.edited.get(String(i.id)) || i)],
    /** The full record (with its detail fields) of an added or edited record, else null. */
    detail: (id) => b.added.find((r) => String(r.id) === String(id)) || b.edited.get(String(id)) || null,
    add(record) { b.added.unshift(record); },
    update(record) {
      const i = b.added.findIndex((r) => String(r.id) === String(record.id));
      if (i >= 0) b.added[i] = record; else b.edited.set(String(record.id), record);
    },
  };
}

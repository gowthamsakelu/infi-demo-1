// Row selection helpers shared by the table, the split list and (for the same records) the phone list.
// The selected flag lives on the records themselves (`b.selected`), so every view that shows a record sees the same state.

export const selectedOf = (list) => list.filter((b) => b.selected);
export const setSelected = (rows, on) => rows.forEach((b) => { b.selected = on; });

/** Toggle one record; with `from` (an id) and `shift`, apply the new state to every row between the two. */
export function toggleRow(rows, id, { from = null, shift = false } = {}) {
  const b = rows.find((x) => x.id === id);
  if (!b) return null;
  const on = !b.selected;
  const a = shift && from ? rows.findIndex((x) => x.id === from) : -1;
  if (a >= 0) {
    const z = rows.findIndex((x) => x.id === id);
    setSelected(rows.slice(Math.min(a, z), Math.max(a, z) + 1), on);
  } else {
    b.selected = on;
  }
  return on;
}

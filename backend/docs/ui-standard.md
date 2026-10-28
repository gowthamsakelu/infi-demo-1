# UI standard (round 1: popups, headers, buttons, toggles, fields)

Source: the Bookings page. One file holds it: `public/css/ui-standard.css` (loaded after `style.css` and `pages.css`).
Phones = `html[data-layout="mobile"]` (below 700px). Tablets and PC use the desktop layout, where popups are centred dialogs.

## Tokens (`:root`)
| Token | Value |
|---|---|
| `--ui-btn-h` / `--ui-btn-radius` | 48px / 12px |
| `--ui-field-h` / `--ui-field-radius` | 44px / 12px |
| `--ui-field-border`, `--ui-field-bg` | #E2E8F0, #F8FAFC |
| `--ui-focus-border`, `--ui-focus-ring` | #3B82F6, 0 0 0 3px rgba(59,130,246,.12) |
| `--ui-sheet-radius`, `--ui-sheet-title`, `--ui-close-size` | 26px, 18px/800, 32px |
| `--ui-switch-w` / `--ui-switch-h` | 36px / 20px |

## Rules
- **Popups (phone):** one type, the bottom sheet: grab handle, title, X at top right, 26px top corners, scrolling body, sticky footer. This includes forms, wizards, quick actions, item dialogs, confirm dialogs and the bell panel. Detail screens are a full page with a back arrow (title 19/800).
- **Buttons:** primary solid #2563EB, secondary white with a #CBD5E1 outline, danger solid #DC2626. 48px tall, 12px radius, icon left of the label on one line (never stacked). Compact `.btn-sm` buttons inside a body are not footer buttons and keep their own size.
- **Footers:** the primary action full width on top (it is `order: -1`), the other actions side by side in equal widths below it, all 48px.
- **Fields:** inputs, dropdowns, search, pickers: 44px, 12px radius, 1px #E2E8F0, background #F8FAFC, focus = blue border + 3px ring. Font Plus Jakarta Sans. Nothing is focused on open.
- **Toggles:** the plain switch (`.bld-switch` + `.bld-switch-knob`), 36x20, no box, border or background around it, same size on every page.

## Reuse
Use `openSheet` (`shared/sheet.js`) for any new popup and `createSplitPage` / `pageFrame` for pages. Do not add per-page overrides for the values above; change the token.

## Not covered (round 2)
Tabs, chips, text sizes, card grids and spacing.

## Round 2: tabs, scroll, tiles, text, spacing
- **Tabs:** list filter chips = the `.tab-pill` pill (Inquiries / Bookings). Tabs inside detail sheets = the `.sheet-tab-btn` underline (blue text, 2px blue underline). Do not swap them.
- **Sideways scroll:** every row of tabs or chips has `overflow-x: auto` and a hidden scrollbar (`.tabs-scroller`, `.sheet-tabs-nav`). The page never scrolls sideways (`body` and `.app-viewport` use `overflow-x: clip` on the phone).
- **Stat tiles:** `.sp-stats`, 2 per row, 10px gap, 14px radius; an odd last tile spans the full width.
- **Text scale (from Bookings):** page title 17/700, subtitle 13/500, card title 14/700, trip line 12.5/500, meta 12/500, section label 11.5/800. One line with ellipsis, except notes.
- **Spacing:** list content sits 14px from the screen edge on every page (Bookings, catalog pages, Banners, Blogs).

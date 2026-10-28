# Round 2 notes (measured at 390px, 13 pages plus their detail screens)
Found
- Tabs and chips: every row already scrolls sideways (overflow-x auto) and no page had horizontal scroll. List pills and detail underline tabs were already used correctly.
- Stat tiles: a lone half-width tile on Transport, Stays, Adventures (3 tiles) and Tour Packages (4 tiles was fine); Users used 3 columns.
- Spacing: Banners and Blogs had 30px side padding (14px outer + 16px inner); every other page has 14px.
- Text sizes: already one scale across pages, nothing to change.
Fixed (public/css/ui-standard.css, pages/banners.css, pages/blogs.css)
- `.sp-stats`: 2 columns on the phone for all pages (including Users), odd last tile spans the full width.
- Banners and Blogs phone side padding is now 14px like the other pages.
- `overflow-x: clip` on body and .app-viewport on the phone, as a guard.
Left alone
- The pill rows have no extra 16px edge padding: Bookings (the reference) uses the 14px page padding and they scroll inside it.
- Banner card stats (`.bn-stats`) are inside a card, not stat tiles.

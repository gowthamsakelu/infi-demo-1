# CRM pages: how a page is built

The app is a single-page app of plain ES modules (no Blade, no build step). Bookings, Inquiries and Calendar are built into
`public/js/desktop.js` and `public/js/mobile.js`. Every other page (Destinations, Tour Packages ... Settings) is **one module**
mounted into a page host, using one shared layout. `public/js/pages/destinations.js` is the reference page: copy its shape.

## Files a page owns (and nothing else)

| What | Where |
| --- | --- |
| Page module | `public/js/pages/<key>.js` (`key` = the key in `public/js/shared/nav.js`, for example `tour-packages`) |
| Own styles, only if needed | `public/css/pages/<key>.css`, and set `css: true` on the page's default export |
| API routes | `routes/pages/<key>.php` (loaded under `/api` by `routes/api.php`) |
| Controller(s) | `app/Http/Controllers/Pages/<Name>Controller.php` (+ FormRequests in `app/Http/Requests/` when a page writes) |
| Models, factories | `app/Models/`, `database/factories/` |
| Migrations | `database/migrations/<date>_*.php`, **write only**; use the date prefix given in your brief so names never collide |
| Seeder | `database/seeders/Pages/<Name>Seeder.php` (picked up automatically, run in file-name order) |
| Tests | `tests/Feature/<Name>Test.php` (PHPUnit) and `tests/e2e/<key>.mjs` (Playwright, see below) |

Do **not** edit the shared files: `shared/split-page.js`, `shared/page-ui.js`, `shared/page-host.js`, `shared/nav.js`, `shared/nav-ui.js`,
`css/pages.css`, `desktop.js`, `mobile.js`, `main.js`, `index.html`, `routes/api.php`, `database/seeders/DatabaseSeeder.php`, `css/style.css`.
If a shared piece must change, say exactly what and why in your report (or message the session that built them); do not work around it with copies.

## The page contract

```js
export default {
  css: false,                       // true when css/pages/<key>.css exists
  mount(host, ctx) { ...; return { destroy() {}, isDirty() {} }; },
};
```

`ctx` = `{ key, item, params(), setParams(), navigate(), toast(), layout() }`. The host calls `destroy()` when the user leaves and asks
`isDirty()` first, so a page with an edit panel returns its dirty state and the shared discard confirm appears (Keep editing / Discard).

### Split pages (list left, detail right, phone: full-screen detail)

`createSplitPage(host, ctx, cfg)` from `shared/split-page.js` does the whole layout: title row (PC) or header (phone), search + sort, tabs
with counts, the list, the detail pane, loading / error / empty states, `?selected=ID` in the URL, the first record selected on PC, arrow-key
navigation, the phone's back arrow and browser Back, Export (CSV from `cfg.export`) and the Add button (drawn, **no behaviour**).
Read the JSDoc above `createSplitPage` for `cfg`. Ids are strings everywhere. `afterDetail` is where a page loads the open record's extras
(see how Destinations calls `/api/destinations/{id}` and then `api.refresh()`), and `api.bindDirty(fn)` reports unsaved edits.
Pages that are not split (Banners, Blogs, Reports) use `pageFrame(host, ctx, { title, subtitle, addLabel })` for the same title row / header
and fill `frame.body` themselves.

### Building blocks (use these, do not restyle them)

`shared/page-ui.js`: `pill(kind, label)`, `tag(kind)`, `tile(icon)`, `statRow([...])`, `sectionTitle`, `detailGrid`, `rowGroup` + `linkRow`,
`chip`, `toggle` + `flipToggle`, `footButtons`, `money`, `moneyShort`, `plural`. Also reuse `shared/ui.js` (`esc`, `toast`, `searchBox`,
`emptyState`, `skeletonCards`, `openRowMenu`), `shared/list-ui.js` (`renderTabs`, `avatar`), `shared/dropdown-filter.js`, `shared/sheet.js`
(`openSheet`, `confirmDialog`), `shared/icons.js` (add an icon there only if none fits: tell the shell owner), and the global classes
`btn-primary-desktop`, `btn-secondary-desktop`, `btn-sm`, `status-pill`, `card-type-badge`, `bld-chip`, `bld-switch`, `form-group`.

Rules: one solid-blue primary button per area, white outlined secondary, no light-blue tinted buttons; single-line text with ellipsis; chips and
pills never wrap; never auto-focus an input; animate only transform and opacity with the `--motion-*` tokens; "Inquiries" spelling.

## API calls

Page routes (`routes/pages/*.php`) are inside the `web` + `auth` middleware: a session cookie and, for writes, the CSRF token. In the browser use
`shared/http.js`: `getJson(url)` returns the response's `data`; `sendJson(url, 'POST' | 'PUT' | 'PATCH' | 'DELETE', body)` adds the token and throws an
`ApiError` (with `.errors` for 422) you can show next to the field. In PHPUnit start with `$this->actingAs(User::demo())`. Validate writes with a FormRequest.
Do not add per-user permission checks yet: one permissions pass (module gates from Users & Permissions) is applied to all pages afterwards.

## Data

* IDs: API rows have numeric ids; the page treats them as strings.
* Pages must render with empty data (the shared empty states) and when the API fails (the shared error state).
* Keep API keys in `.env`; never send them to the browser.
* Link, do not copy: Transport reads `vehicle_types`, Stays `saved_hotels`, Adventures `saved_activities` (the itinerary builder's tables).

## Running it locally (without touching the real database)

Migrations are written but **never run against `database/database.sqlite`** (the real local one) or any shared database. Use the scratch copy:

```bash
export DB_DATABASE="C:/Users/KARANS~1/AppData/Local/Temp/claude/C--Projects-IBC-Admin-Project-LARAVEL/32375f33-1349-4bc2-8320-3805d6cd7af5/scratchpad/pages-dev.sqlite"
cd backend
php artisan migrate --force                                        # applies pending migrations to the copy only
php artisan db:seed --class='Database\Seeders\Pages\YourSeeder'    # seed your page's data into the copy
PHP_CLI_SERVER_WORKERS=4 php artisan serve --port=8000             # a server on the copy is already running on 8000; reuse it
php artisan test                                                   # PHPUnit uses an in-memory database and runs every migration itself
```

The app needs a signed-in user: the sign-in page has a "Press to log in" button (`DEMO_LOGIN=true`).

Browser tests are Playwright scripts in `tests/e2e/` (Playwright is not a project dependency). Copy your script next to an existing install:
`C:\Users\Karan Sapalia\AppData\Local\Temp\claude\C--Projects-IBC-Admin-Project-LARAVEL\1d5d679f-6f17-4eb3-90c9-fc4580f3fe05\scratchpad\e2e`
(it has `node_modules/playwright`; also copy `signin.mjs`), launch with `chromium.launch({ channel: 'chrome' })`, call `signIn(page, BASE)`, and run
`BASE=http://127.0.0.1:8000/ node <script>.mjs`. `tests/e2e/pages-shell.mjs` is the model: check 1280, 820 (tablet = PC layout) and 390,
no horizontal scroll, ellipsis, no page errors, the keyboard never opening on its own.

Write long scripts with the Write tool: big shell heredocs with apostrophes break here.

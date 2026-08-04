# Test Plan: Platform Activity

**Target:** https://admin.six-property.clienturl.net/activity
**Seed:** tests/seed.spec.js
**Date:** 2026-08-04

## Overview

This plan covers the admin Platform Activity module end-to-end: the activity feed table (columns, activity-type badges, timestamps, messages), pagination, and error/empty/loading states. `GET /admin/activity/feed?page=1&limit=20` is used **only** to justify frontend assertions (e.g. table values match the API response) — it is not automated directly, and this plan does not test backend logic, the database, authentication, or authorization. This is the simplest module covered so far: there is no search box, no filter dropdown, no details page, and no Actions column at all — the page is a single read-only table plus pagination, full stop.

**Methodology note:** This plan was authored from a live, authenticated browser session against staging, using accessibility snapshots, a full-page screenshot (for badge colour verification), live viewport-resize measurements at 1280/768/390px, and direct authenticated `fetch()` calls (via the browser's own stored `token`) to pull every page of the real API data (all 179 items across 9 pages) for accurate field names, activity-type enum values, and edge-case discovery — this grounds the plan in actual server responses rather than guesswork. Per the user's explicit note: `POST /auth/register` (which generates "Sign Up" activity) and the tenant-facing maintenance-request submission endpoint (which generates "Maintenance" activity) were provided as context for what already exists in the live feed, not as something to trigger fresh — and **payment activity ("Rent Paid") is explicitly out of scope to trigger or automate**, per the user's instruction that they will test that flow manually. All activity-type coverage below is based on reading existing, already-recorded activity of all three kinds, never on creating new activity.

**Confirmed live structure (for the Generator's reference):**
- Heading is "Platform Activity" (h3) with subtitle "Monitor recent platform-wide activity."
- No search box, no filter dropdown, no "Reset" button anywhere on this page — confirmed live. Do not write scenarios assuming search/filter functionality exists here.
- Table columns, in order: **Type, Title, Time, Message** (4 columns, confirmed live). There is **no Actions column and no per-row "View" button** — clicking anywhere on a row does nothing; there is no activity-details page to navigate to. This is a read-only feed, full stop.
- **Confirmed live activity types and their exact badge text** (scanned all 179 items across all 9 pages via the API — this is the complete set at plan time, not a guess):
  - API `type: "user_signup"` → badge text **"Sign Up"** (purple/lavender pill). Confirmed live under three different `title` values: "New tenant", "New landlord", and "New admin" (yes, admin sign-ups also appear in this feed).
  - API `type: "rent_paid"` → badge text **"Rent Paid"** (green pill). `title` is always "Rent paid" (lowercase 'p'); `message` includes the payer's name and the dollar amount, e.g. "jeremy paid $800 in rent."
  - API `type: "maintenance_request"` → badge text **"Maintenance"** — **not** "Maintenance Request" as a naive reading of the API enum might suggest. Confirmed live via screenshot. `title` is always "New request"; `message` includes the unit and the request's own title, e.g. "New maintenance request for A-101: Keys issue."
  - **None of these three labels are a generic mechanical transform of their API enum value** (unlike, say, Maintenance Requests' `IN_PROGRESS` → "In Progress"): `user_signup` → "Sign Up" and `maintenance_request` → "Maintenance" both require a hardcoded label lookup, not a split-and-titlecase function. The Generator must not assume a generic transform will produce the correct label — assert against this confirmed mapping directly.
  - No activity type outside these three was observed in the full 179-item dataset at plan time.
- **The API response includes a `description` field (e.g. `"jeremy — $800"`, `"A-101: Keys issue"`) that is never rendered anywhere in the visible table** — confirmed live. Only `type`, `title`, `at` (the timestamp), and `message` are displayed. Do not write a test asserting `description` appears on screen.
- **Activity items have no id field of any kind in the API response** — unlike every other module's list items (which all have `_id`), a raw activity entry is just `{ type, title, description, message, at }` with nothing unique to key off of. Row-matching in tests should use a composite of visible fields (e.g. message + timestamp) rather than assuming an id exists anywhere.
- Timestamps (`at`, an ISO string) render as date + time, e.g. "Aug 4, 2026, 03:04 PM" — same format as Maintenance Requests' "Created" field. Confirmed live: rows are sorted **newest first** (descending by `at`) on every page, including across the page-1/page-2 boundary.
- **Confirmed minor grammar bug in the raw backend-generated message text**: an admin sign-up's message reads "Admin signed up as a admin." — grammatically should be "as an admin" (the raw API value itself is wrong, so the frontend renders it verbatim; this is not a frontend rendering bug). See `Bugs/PlatformActivity/` for the write-up.
- Pagination controls: "Previous" / "Page X of Y" / "Next", plus "Showing A–B of N" — confirmed live dataset at plan time: **179 items across 9 pages (20/page, last page partial)**, a large enough real dataset to exercise genuine multi-page pagination (unlike Properties' single-page dataset). Confirmed via the API's own `pagination` object: `{ currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage }`.
- **Pagination is not reflected in the URL** — confirmed live: navigating directly to `/activity?page=5` is silently ignored and the page still loads on page 1. The Generator must reach a specific page by clicking "Next" the required number of times, not by constructing a URL.
- **Responsive layout is clean at all three widths tested — a genuine, positive difference from every other module's listing page.** Confirmed live via `scrollWidth`/`clientWidth` measurements: 1280px (1280/1280, no overflow), 768px (**768/768, no overflow** — this module does **not** reproduce the shared tablet horizontal-scroll bug seen on Landlords/Tenants/Properties/Maintenance Requests' listing pages), and 390px (390/390, no overflow, sidebar fully collapsed). Likely explained by this table having only 4 columns, the fewest of any listing page in this app.
- No console errors were observed during initial load or while paging through all 9 pages.
- The longest `message` value found across the full live dataset is 62 characters ("New maintenance request for A-102: Leakage in common washroom."); no null or empty `message` values exist in the live dataset at plan time — a genuinely empty message cannot be tested against real data and would require a mocked response.

## Preconditions

- Staging environment is reachable at the URL above.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- The feed has 179 items across 9 pages at plan time, containing all three known activity types — the Generator should re-confirm the current total before hardcoding page-count assertions, though this dataset is large enough that multi-page pagination is genuinely testable, unlike Properties.
- Known fixture activity items, confirmed live:
  - A "Sign Up" / "New tenant" item, e.g. `"john doe signed up as a tenant."` (most recent item at plan time).
  - A "Rent Paid" item, e.g. `"jeremy paid $800 in rent."`.
  - A "Maintenance" / "New request" item, e.g. `"New maintenance request for A-101: Keys issue."` (page 5 at plan time — remember pagination position is not URL-addressable, so reaching it requires clicking "Next" repeatedly).
  - A "Sign Up" / "New admin" item, e.g. `"Admin signed up as a admin."` (further back in the feed; also the item carrying the confirmed grammar bug).
- Each scenario starts from a clean, authenticated session unless explicitly testing unauthenticated/expired-session behaviour.
- This module has **no mutating actions and no details page** — every scenario here is read-only by nature, same as Properties, but even more so (Properties at least has a details page to navigate to; this module doesn't).

## Scenarios

### Feature Area 1 — Page Load

#### Scenario 1.1 — Activity page loads cleanly with all primary elements
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/activity` — expected: page loads without redirect.
  2. Observe console during/after load — expected: no uncaught errors.
  3. Observe network — expected: `GET /admin/activity/feed?page=1&limit=20` returns 200; no other failed requests.
- **Assertions:**
  - Heading "Platform Activity" and subtitle "Monitor recent platform-wide activity." are visible.
  - Table with all 4 column headers (Type, Title, Time, Message) and pagination controls are visible.
  - Sidebar shows "Platform Activity" as the active/highlighted nav item.
- **Edge cases considered:** slow network (see 9.5 for the loading-state check), reload mid-load, cold vs. cached load.

#### Scenario 1.2 — No search box, filter, or Actions column exists
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect the full page for a search input, a filter dropdown, a "Reset" button, and a 5th table column.
- **Assertions:** None of these elements exist anywhere on the page — confirmed live this is a plain read-only feed. This is a deliberate negative assertion to prevent a future Generator run from assuming search/filter functionality exists here by analogy with the other list pages.

#### Scenario 1.3 — Initial loading state renders before data resolves
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate fresh and snapshot immediately, before the feed request resolves.
- **Assertions:** A loading indicator/placeholder is shown in place of the table; it is replaced by real content once the API responds, and never gets stuck.

#### Scenario 1.4 — Direct navigation and reload consistency
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate directly to `/activity` (not via sidebar), then reload.
- **Assertions:** Both loads show the identical, newest-first page-1 list; URL remains `/activity`; no stuck spinner.

#### Scenario 1.5 — Column headers are static text, not interactive sort controls
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Click each column header in turn (Type, Title, Time, Message).
- **Assertions:** No `aria-sort` attribute appears on any header; row order never changes (feed stays sorted newest-first by the server, not re-sortable client-side).

#### Scenario 1.6 — Sidebar navigation to another module and back still works correctly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** From the activity feed, click "Maintenance Requests" in the sidebar, then click "Platform Activity" again.
- **Assertions:** Each click performs a clean client-side route change; returning shows the full page-1 feed again with the correct nav item highlighted.

#### Scenario 1.7 — A `?page=` query parameter in the URL is silently ignored
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate directly to `/activity?page=5`.
- **Assertions:** Confirmed live: the page still loads on page 1 ("Page 1 of 9"), not page 5 — the query parameter has no effect. Document this as the current (not necessarily desirable, but confirmed real) behaviour.

#### Scenario 1.8 — Empty dataset renders an empty state, not a crash
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Not reproducible against the live 179-item dataset — requires a mocked/intercepted empty API response.
- **Steps:** Intercept `GET /admin/activity/feed*` to return zero items.
- **Assertions:** Some form of empty-state message renders in place of the table (exact copy not confirmed live this session, since it never naturally occurs against real data); no console error or blank white-screen crash. Generator should confirm the exact copy via a mocked response before asserting it verbatim.

### Feature Area 2 — Activity Table

#### Scenario 2.1 — Every column renders sensibly for a "Sign Up" row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Feed loaded; a "Sign Up" / "New tenant" row present (the most recent item at plan time).
- **Steps:** Inspect that row's 4 cells.
- **Assertions:** Row has exactly 4 cells matching the header order (Type, Title, Time, Message); Type shows the "Sign Up" badge; Title shows "New tenant"; Time shows a formatted date+time; Message shows the full sentence, e.g. "john doe signed up as a tenant."

#### Scenario 2.2 — Every column renders sensibly for a "Rent Paid" row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** A "Rent Paid" row present.
- **Steps:** Inspect that row's 4 cells.
- **Assertions:** Type shows the "Rent Paid" badge; Title shows "Rent paid" (lowercase 'p'); Message includes the payer's name and a dollar amount, e.g. "jeremy paid $800 in rent."

#### Scenario 2.3 — Every column renders sensibly for a "Maintenance" row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** A "Maintenance" / "New request" row present.
- **Steps:** Inspect that row's 4 cells.
- **Assertions:** Type shows the "Maintenance" badge (**not** "Maintenance Request"); Title shows "New request"; Message includes the unit and the underlying maintenance request's own title, e.g. "New maintenance request for A-101: Keys issue."

#### Scenario 2.4 — The full message text is always displayed, never truncated
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect the longest message in the current dataset (confirmed live: a 62-character maintenance-request message) and a short one (a plain sign-up message).
- **Assertions:** Both render their full text with no ellipsis/truncation and no broken row layout, regardless of length difference.

#### Scenario 2.5 — Messages containing special characters and currency symbols render correctly
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect a "Rent Paid" message (contains a `$` sign and a number) and any message containing a colon (maintenance messages use "Unit: Title" formatting, e.g. "A-101: Keys issue").
- **Assertions:** Special characters (`$`, `:`, `.`) render as plain literal text, not interpreted as markup or stripped out.

#### Scenario 2.6 — Messages containing non-English names render correctly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect a message containing a Roman-Urdu name/phrase if one is present in the current dataset (several tenant names in this system are non-English).
- **Assertions:** Non-ASCII or non-English text renders correctly without mojibake or encoding artifacts.

#### Scenario 2.7 — A missing/empty message is not reproducible against live data — documented as a mocked-response case
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** No item in the live 179-item dataset has a null/empty `message` — requires a mocked response.
- **Steps:** Intercept a response with one item's `message` set to `null` or `""`.
- **Assertions:** The cell should render some sensible fallback (e.g. "—", matching the app-wide missing-value convention used elsewhere) rather than the literal text "null" or a blank cell indistinguishable from a rendering bug. Generator must confirm the actual fallback behaviour via the mock, since it's unconfirmed live.

#### Scenario 2.8 — The `description` API field is confirmed never displayed anywhere
- **Priority:** P2
- **Tags:** @regression
- **Steps:** For a row whose API `description` value is known (e.g. `"jeremy — $800"` for the $800 rent-paid item), search the rendered row/page for that exact text.
- **Assertions:** The `description` value does not appear anywhere in the visible table — confirmed live this field is fetched but unused by the UI. This is a negative assertion to prevent a future test from assuming a 5th hidden column or tooltip exists.

#### Scenario 2.9 — Table semantics are correct
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the table.
- **Assertions:** Proper `table`/`row`/`columnheader`/`cell` roles present (plain HTML `<table>`, consistent with every other module).

### Feature Area 3 — Activity Types

#### Scenario 3.1 — "Sign Up" badge renders identically across all three sub-titles (tenant/landlord/admin)
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** At least one row each of "New tenant", "New landlord", and "New admin" (all confirmed present in the live dataset, `type: "user_signup"` for all three).
- **Steps:** Compare the Type badge across all three rows.
- **Assertions:** All three show the identical "Sign Up" badge text and styling — the `title` column is what differentiates tenant/landlord/admin sign-ups, not the Type badge.

#### Scenario 3.2 — "Rent Paid" badge and amount formatting
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Inspect 2+ different "Rent Paid" rows with different dollar amounts (confirmed live: $800, $1200, $1300, $1400, $3000 all exist).
- **Assertions:** The Type badge always reads exactly "Rent Paid"; the Message always includes a `$` amount matching the real paid amount, formatted as a whole dollar figure (no decimals observed live).

#### Scenario 3.3 — "Maintenance" badge text is exactly "Maintenance", not "Maintenance Request"
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Inspect the Type badge on any maintenance-request-originated row.
- **Assertions:** Badge text is exactly "Maintenance" — assert this precisely rather than assuming a generic enum-to-titlecase transform, since `maintenance_request` would naively become "Maintenance Request" and that is confirmed **not** what renders.

#### Scenario 3.4 — Each activity type has a visually distinct badge colour
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Take a screenshot including at least one row of each of the three types.
- **Assertions:** Confirmed live: "Sign Up" is a purple/lavender pill, "Rent Paid" is green, "Maintenance" is amber/orange — each visually distinct from the others, not just by text.

#### Scenario 3.5 — No unrecognized activity type appears in the current dataset
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Scan the full live dataset's `type` values (via the API, for validation purposes only) and compare against the rendered badges.
- **Assertions:** Confirmed live: exactly three distinct `type` values exist (`user_signup`, `rent_paid`, `maintenance_request`) across all 179 items; no 4th type and no unmapped/fallback badge text (e.g. a raw un-transformed enum string) appears anywhere.

#### Scenario 3.6 — An unrecognized/future activity type does not break rendering — mocked-response case
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Requires a mocked response, since no 4th type exists in live data.
- **Steps:** Intercept a response containing an item with an unrecognized `type` value (e.g. `"lease_signed"`).
- **Assertions:** The row should still render without crashing the page — ideally falling back to some readable label rather than a blank badge or a raw snake_case string. Exact fallback behaviour is unconfirmed live; Generator must verify via the mock.

### Feature Area 4 — Timestamp Validation

#### Scenario 4.1 — Timestamps render in the confirmed date+time format
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Inspect the Time column for several rows.
- **Assertions:** Every timestamp matches the pattern `MMM D, YYYY, hh:mm AM/PM` (e.g. "Aug 4, 2026, 03:04 PM"), derived from the API's `at` ISO timestamp — same format convention as Maintenance Requests' "Created" field.

#### Scenario 4.2 — Rows are sorted newest-first within a page
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Read all 20 timestamps on page 1 top-to-bottom.
- **Assertions:** Each timestamp is the same as or more recent than the one below it — strictly non-increasing chronological order, confirmed live.

#### Scenario 4.3 — Chronological ordering holds across the page 1/page 2 boundary
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Compare the last timestamp on page 1 against the first timestamp on page 2.
- **Assertions:** Page 2's first item is the same as or older than page 1's last item — the server-side sort is consistent across pagination, not just within a single page's response.

#### Scenario 4.4 — Recent activity (same day/hour) and old activity (weeks back) both format correctly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Compare a same-day timestamp (e.g. the most recent item) against one from several weeks earlier (confirmed live: items go back to at least early June).
- **Assertions:** Both use the identical absolute date+time format — no relative-time formatting ("2 hours ago", "3 weeks ago") is used anywhere, confirmed live.

#### Scenario 4.5 — Multiple activities with the identical timestamp render as separate, stable rows
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Confirmed live: several "New landlord" sign-up rows share the exact same timestamp "Jul 20, 2026, 08:31 PM" (a bulk-seeded batch).
- **Steps:** Inspect this cluster of same-timestamp rows across a page load and a reload.
- **Assertions:** All rows in the cluster render distinctly (distinguished by their different Message text); their relative order does not shuffle unpredictably between a fresh load and a reload (even if the tie-breaking rule itself isn't confirmed, the order should be stable, not random, on repeated loads of the same page).

#### Scenario 4.6 — Timestamp values trace directly to the API's `at` field, never hardcoded
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Capture the List API response and compare each row's formatted Time cell against the corresponding item's raw `at` value, converted to local time.
- **Assertions:** Every displayed time is a correct formatting of the real `at` timestamp — no placeholder or client-generated "now" value is ever substituted.

### Feature Area 5 — Pagination

#### Scenario 5.1 — Page 1 shows the correct initial pagination state
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Load the feed fresh.
- **Assertions:** "Previous" is disabled; "Next" is enabled; "Page 1 of 9" (confirmed live at plan time: 179 items / 20 per page); "Showing 1–20 of 179".

#### Scenario 5.2 — Clicking "Next" loads the next page with different, correctly-ordered data
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Click "Next" — expected: `GET .../activity/feed?page=2&limit=20`; "Showing 21–40 of 179"; "Page 2 of 9".
- **Assertions:** Row data on page 2 is entirely different from page 1 (no duplicated/stuck rows), and the chronological ordering rule (4.3) holds across the transition.

#### Scenario 5.3 — Clicking "Previous" returns to the exact prior page's data
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** From page 2, click "Previous".
- **Assertions:** Returns to "Page 1 of 9"; row data exactly matches the original page-1 load.

#### Scenario 5.4 — The last page shows a partial row count and disables "Next"
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Click "Next" repeatedly until reaching the last page (confirmed live: page 9 of 9, since `?page=` in the URL is ignored — must click through, see Scenario 1.7).
- **Assertions:** The last page shows the true remainder (confirmed live: 179 − 8×20 = 19 items on page 9); "Next" is disabled; "Previous" is enabled.

#### Scenario 5.5 — Reloading mid-pagination resets to page 1
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate to page 3+, then reload.
- **Assertions:** Resets to "Page 1 of 9"; "Previous" disabled again — consistent with the confirmed no-URL-persistence behaviour (Scenario 1.7).

#### Scenario 5.6 — "Showing A–B of N" is always internally consistent with the rendered row count
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Compare "Showing A–B of N" against the actual rendered row count on page 1, a middle page, and the last page.
- **Assertions:** `B − A + 1` always equals the number of rendered rows in every state checked, including the partial last page.

#### Scenario 5.7 — A single-page response is not reproducible against live data
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** The live dataset has 179 items across 9 pages — a genuinely single-page (≤20 item) response requires a mocked/intercepted result.
- **Steps:** Intercept `GET /admin/activity/feed*` to return a response with `totalPages: 1`.
- **Assertions:** Both "Previous" and "Next" should be disabled, "Page 1 of 1" shown — by analogy with the confirmed single-page behaviour already observed on Properties. Generator should confirm this specific case via the mock since the live dataset can't exercise it.

#### Scenario 5.8 — Pagination reflects the API's own pagination metadata, never a hardcoded page count
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Capture the List API response's `pagination` object (`currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `hasNextPage`, `hasPrevPage`) on page 1 and the last page.
- **Assertions:** "Page X of Y" and the Next/Previous enabled-state match the API's values exactly on both pages — never hardcode "9" as the total page count, since this dataset will keep growing.

### Feature Area 6 — API Validation

#### Scenario 6.1 — The activity feed matches the List API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/activity/feed?page=1&limit=20`; cross-reference every visible row's Type/Title/Time/Message against `data.items[]`.
- **Assertions:** Type badge correctly maps from the API's `type` enum per the confirmed lookup table (Scenario 3.1–3.3); Title, Time (formatted from `at`), and Message match exactly; never hardcode expected values — always compare against whatever the API actually returned at test time.

#### Scenario 6.2 — Row count on screen matches the API response's item count
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Compare the number of rendered rows against `data.items.length` for the current page.
- **Assertions:** Counts match exactly on page 1, a middle page, and the last (partial) page.

#### Scenario 6.3 — "Showing A–B of N" matches the API's `pagination.totalItems`
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Compare the displayed total against `data.pagination.totalItems`.
- **Assertions:** The two values match exactly; never hardcode "179" as the expected total, since this dataset grows over time.

#### Scenario 6.4 — Page 2's data matches the API's page-2 response, not a client-side re-slice of page 1
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Capture both `GET .../feed?page=1&limit=20` and `GET .../feed?page=2&limit=20`; compare each against its corresponding rendered page.
- **Assertions:** Page 2's rows match the page-2 API response specifically — confirming the app makes a fresh server request per page rather than fetching everything once and paginating client-side (a real, testable distinction given this feed already has 179 items to work with).

#### Scenario 6.5 — The `description` field is present in the API but confirmed absent from the UI
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Capture the API response and confirm `description` is present on every item; compare against the rendered table.
- **Assertions:** `description` never appears anywhere in the rendered output — see Scenario 2.8; included here as the API-validation-specific angle on the same fact.

#### Scenario 6.6 — No activity item is missing from the feed across a full pagination sweep
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Walk all pages via "Next", collecting every rendered row; separately fetch all pages via the API.
- **Assertions:** The two full sets match exactly (same count, same content) — no item is skipped or duplicated across the page boundaries during a full sweep.

### Feature Area 7 — Responsive

#### Scenario 7.1 — Desktop layout (1280px): clean, no overflow
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Load `/activity` at 1280×800.
- **Assertions:** Confirmed live: no page-level horizontal overflow (`scrollWidth` = `clientWidth` exactly, 1280/1280).

#### Scenario 7.2 — Tablet layout (768px): clean, no overflow — a genuine exception to the pattern seen elsewhere
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024, load `/activity`.
- **Assertions:** Confirmed live: `scrollWidth` equals `clientWidth` exactly (768/768) — **this module does not reproduce** the shared tablet horizontal-scroll bug (`Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`) seen on every other module's listing page so far. Assert the clean (passing) behaviour directly; do not write this as a known-failing test by analogy with the other modules — it would be wrong to do so here.

#### Scenario 7.3 — Mobile layout (390px): sidebar collapses, no page-level overflow
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 390×844, load `/activity`.
- **Assertions:** Confirmed live: no overflow (390/390 exactly); the "Platform Activity" sidebar link is not visible (fully collapsed, not an icon rail).

### Feature Area 8 — Accessibility

#### Scenario 8.1 — Keyboard tab order reaches every interactive element
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From page load, Tab through interactive elements: sidebar nav → Previous/Next pagination buttons (there is nothing else interactive on this page — no search box, no row actions).
- **Assertions:** Both pagination buttons are reachable via Tab and activatable via Enter/Space, each with a visible focus indicator.

#### Scenario 8.2 — Table semantics and column headers are screen-reader friendly
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the table and its 4 column headers.
- **Assertions:** Proper `table`/`row`/`columnheader`/`cell` roles present; each `columnheader` has a clear, non-empty accessible name (Type/Title/Time/Message).

#### Scenario 8.3 — Activity-type badges are readable as plain text by a screen reader
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for a Type badge in each of the three activity types.
- **Assertions:** Each badge exposes its own text ("Sign Up"/"Rent Paid"/"Maintenance") as accessible content, not conveyed by colour alone — important given the badges are colour-coded (Scenario 3.4) but colour is not a reliable channel for all users.

#### Scenario 8.4 — Pagination buttons have accessible, distinguishable names
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessible names of "Previous" and "Next".
- **Assertions:** Both expose clear, distinct accessible names; the disabled state (on page 1 for Previous, on the last page for Next) is conveyed to assistive technology, not just visually via greying-out.

#### Scenario 8.5 — Color contrast of the three badge types
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Visually inspect each badge's text-against-background contrast (purple/Sign Up, green/Rent Paid, amber/Maintenance).
- **Assertions:** Record contrast ratio observations; flag as a bug if any falls below WCAG AA (4.5:1) for normal text — not measured precisely this session, Generator should verify with a contrast-checking tool.

### Feature Area 9 — Error Handling

#### Scenario 9.1 — An empty API response renders an empty state, not a crash
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Requires a mocked/intercepted response (not reproducible against the live 179-item dataset).
- **Steps:** Intercept `GET /admin/activity/feed*` to return zero items.
- **Assertions:** Some empty-state message renders cleanly; no console error or crash. Same underlying case as Scenario 1.8; included here for Error-Handling-area completeness per the prompt's structure.

#### Scenario 9.2 — A 500 response shows an error state, not silent failure
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Intercept `GET /admin/activity/feed*` to return a 500.
- **Assertions:** An error state renders (not an infinite spinner or a silently-empty table) — exact copy not confirmed live this session (no real 500 was observed); Generator should confirm whether it matches the "Something went wrong" + Retry pattern already confirmed on every other module's details page, or differs, since this module has no equivalent details page to compare against directly.

#### Scenario 9.3 — Slow network shows a loading state that eventually resolves
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Throttle/delay the feed API response artificially.
- **Assertions:** The loading state (1.3) persists correctly until the (delayed) response arrives, then renders normally — no premature empty-state flash, no stuck spinner.

#### Scenario 9.4 — Missing/null fields on an individual item render sensibly — mocked-response case
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** No item in the live dataset has a missing `title`, `type`, or `at` — requires a mocked response for each.
- **Steps:** Intercept a response with one item missing `title` (or `type`, or `at`) individually.
- **Assertions:** The row should still render without crashing, with some sensible fallback for the missing field rather than a raw `undefined`/`null` string. Exact fallback unconfirmed live; Generator must verify via the mock for each field independently.

#### Scenario 9.5 — An extremely long message does not break the table layout — mocked-response case
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** The longest real message is only 62 characters — a true stress case (e.g. 1000+ characters) requires a mocked response.
- **Steps:** Intercept a response with one item's `message` set to a very long string.
- **Assertions:** The row either wraps or scrolls within its cell without breaking the overall table/page layout or pushing other columns out of alignment.

#### Scenario 9.6 — A very large dataset (many pages) does not degrade the pagination controls
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** The live dataset (179 items / 9 pages) is already reasonably large; a true stress case (e.g. 10,000 items / 500 pages) requires a mocked response.
- **Steps:** Intercept a response with `pagination.totalPages` set to a very large number (e.g. 500).
- **Assertions:** "Page 1 of 500" (or similar) renders correctly without layout breakage; Next/Previous continue to function correctly for at least the first few page transitions.

### Feature Area 10 — Performance

#### Scenario 10.1 — Exactly one request fires for a normal page load
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Load `/activity` fresh and monitor network.
- **Assertions:** Exactly one `GET /admin/activity/feed?page=1&limit=20` fires; no duplicate/redundant requests.

#### Scenario 10.2 — Exactly one request fires per pagination click
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Click "Next" and "Previous" in sequence while monitoring network.
- **Assertions:** Each click fires exactly one corresponding page request — confirmed live across 5 consecutive "Next" clicks (page 1→2→3→4→5), no duplicate-fire per click observed.

#### Scenario 10.3 — Smooth pagination: no flash of stale data between pages
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Click "Next" several times in a row, watching the table content during each transition.
- **Assertions:** Each page's data replaces the previous page's cleanly — no visible flash of the old page's rows persisting alongside or after the new page's data arrives.

#### Scenario 10.4 — No console errors across a full pagination sweep
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Load the feed and click through all 9 pages (or a representative subset, e.g. first 5) while monitoring console.
- **Assertions:** Zero uncaught console errors or warnings anywhere in the sweep — confirmed live across the first 5 pages during plan authoring.

#### Scenario 10.5 — Table renders once per page load without duplicate DOM rows
- **Priority:** P2
- **Tags:** @regression
- **Steps:** After loading a page, count the rendered `<tr>` elements in the table body.
- **Assertions:** The row count exactly matches the API's item count for that page — no accidental double-render producing duplicate rows.

## Bug-Driven Regression Coverage

One new, minor bug was found during this exploration; no shared/pre-existing bugs from other modules reproduce here (notably, the tablet-width scroll bug does **not** reproduce):

1. `Bugs/PlatformActivity/platform-activity-admin-signup-grammar.md` — **new, minor, text-only.** An admin sign-up's activity message reads "Admin signed up as a admin." (should be "as an admin") — a grammar error in the raw backend-generated message text, rendered verbatim by the frontend (covered by the "Confirmed live structure" note above; not written as its own numbered scenario since it's a one-off text-content nit rather than a functional gap, consistent with how similarly minor issues have been handled inline elsewhere in this project).

Two things worth flagging explicitly as **not** bugs, since the pattern established across every other module's plan might otherwise lead the Generator to assume they reproduce here too:
- **The shared tablet-width (768px) horizontal-scroll bug does NOT reproduce on this page** (confirmed live, Scenario 7.2) — likely because this table has only 4 columns, fewer than any other listing page in the app. Do not write this as a known-failing test here.
- **The shared desktop (1280px) header-overflow bug does NOT reproduce on this page either** (confirmed live, Scenario 7.1), consistent with Properties and Maintenance Requests, contrary to Tenants/Landlords.

## Not covered (and why)

- **Backend logic, database, API automation, authentication, or authorization implementation details** — explicitly out of scope per the prompt. The List API is referenced only to justify UI assertions (Feature Area 6); no direct API test suite is included, and no login/session-mechanism internals are tested beyond what's already covered in every other module's plan (this plan doesn't even re-derive an unauthenticated-redirect scenario, since it would be identical to the pattern already established elsewhere and the prompt didn't ask for it here).
- **Triggering real payment activity** — explicitly excluded per the user's instruction: "we can't do for payment, i'll test that manually." All "Rent Paid" coverage in this plan validates against **existing, already-recorded** rent-paid activity in the live feed; nothing here attempts to trigger a new payment.
- **Triggering fresh sign-up or maintenance-request activity via `POST /auth/register` or the tenant-facing requests endpoint** — the user supplied these as context for how the existing "Sign Up" and "Maintenance" activity in the feed came to exist, not as an instruction to generate new test data through them. This plan validates against the already-existing 179 items instead.
- **Cross-browser matrix (Firefox/Safari)** — `playwright.config.js` currently only enables the `chromium` project, consistent with every other module's plan; not written as separate scenarios until those projects are enabled.
- **Any details/drill-down page for an activity item** — none exists. Confirmed live there is no Actions column, no View button, and no per-item click-through anywhere on this page.
- **Search or filtering** — confirmed live neither exists on this page (Scenario 1.2); no scenarios were written assuming otherwise.
- **Load/performance benchmarking with real timing thresholds** — Feature Area 10 covers qualitative request-count/console-hygiene checks only, not response-time SLAs.

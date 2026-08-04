# Test Plan: Maintenance Requests

**Target:** https://admin.six-property.clienturl.net/maintenance-requests (listing) and https://admin.six-property.clienturl.net/maintenance-requests/:id (details)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-04

## Overview

This plan covers the admin Maintenance Requests module end-to-end: the listing page (table, search, status filter, search+filter combined, pagination), the request details page (header/badges, Request Information, Description, Attachments, Notes), navigation and direct-URL behaviour, responsive layout, accessibility, and error/empty/loading states. `GET /admin/requests?page=1&limit=20`, `GET /admin/requests?page=1&limit=20&search=<value>`, `GET /admin/requests?page=1&limit=20&search=<value>&status=<STATUS>`, and `GET /admin/requests/:id` are used **only** to justify frontend assertions (e.g. table values match the API response) — none of them are automated directly, and none of this plan tests backend logic, the database, authentication, or authorization. This module has no mutating admin actions in the UI at all (no Suspend/Edit/Delete/Resolve button) — the Actions column renders exactly one "View" button per row, same as Properties — so, like that module, this plan is entirely read-only by nature.

**Methodology note:** This plan was authored from a live, authenticated browser session against staging (logged in via `tests/data/credentials.json`), using accessibility snapshots, direct interactive testing (click/type/select, not just keyboard-only), live viewport-resize measurements at 1280/768/390px, and direct authenticated `fetch()` calls (via the browser's own stored `token`) to pull real API JSON for both the list and both provided detail ids — this grounds the field names and data shapes below in actual server responses rather than guesswork. Exact locators reflect the live DOM at plan time; the Generator agent must re-confirm them before writing test code.

**Confirmed live structure (for the Generator's reference):**

*Listing page*
- Heading is "Maintenance Requests" (h3) with subtitle "Track and review maintenance requests."
- Search box placeholder: "Search by title or tenant" — confirmed live to search **both** fields: searching "Key" matches by request title ("Keys issue", "Keys Stuck in door"); searching a tenant's first name alone (e.g. "Karishma", matching nothing in any title) correctly returned all 5 of that tenant's requests.
- **Unlike the Properties search bug, this search correctly trims whitespace and is case-insensitive** — confirmed live: searching `"  key  "` (padded, lowercase) still matched "Keys issue"/"Keys Stuck in door" correctly. Do not assume this module shares the Properties whitespace bug; it does not.
- Status filter is a native `<select>` with options: "Status" (placeholder/default), "Open", "In Progress", "Resolved". Selecting one issues `GET /admin/requests?page=1&limit=20&status=<VALUE>` with `OPEN`/`IN_PROGRESS`/`RESOLVED` (confirmed live for `IN_PROGRESS` and `RESOLVED`).
- Search and status filter **combine** into a single request (confirmed live: `...&search=Karishma&status=RESOLVED`), matching the exact pattern given in this plan's brief — not two separate/conflicting requests.
- A "Reset" button appears once either search or status filter is active, and correctly clears **both** together back to the full unfiltered page-1 list (confirmed live).
- Table columns, in order: **Request, Property, Tenant, Category, Priority, Status, Created, Actions** (8 columns). Headers are plain text, not sortable (no button/aria-sort observed). Confirmed live values: Category ∈ {Other, Doors Locks, Repair, Heat Ac, Water, Plumbing, Electrical, ...}; Priority ∈ {Low, Medium, High, Urgent}; Status ∈ {Open, In Progress, Resolved}. Created shows a date only (e.g. "Jul 17, 2026") — no time, unlike the details page's Created field which includes a time.
- Actions column always renders exactly one button: "View". No Suspend/Edit/Delete/Resolve control exists anywhere in this module's UI.
- **Confirmed live dataset at plan time: 33 requests across 2 pages (20 + 13)** — genuinely multi-page, unlike Properties' single-page dataset. Pagination controls: "Previous" / "Page X of Y" / "Next", plus "Showing A–B of N". Clicking "Next" correctly fetches `page=2`, row data changes, "Showing 21–33 of 33" appears, "Previous" enables and "Next" disables (last page). Confirmed via the List API's own `pagination` object: `{ currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPrevPage }`.
- Zero-result state (both empty search and non-matching status): heading "No data found", text "There is no data to display at the moment." — same generic copy pattern as every other module. Confirmed safe against a `<script>alert(1)</script>` search payload: treated as literal inert text, zero results, no dialog fired, no console error.
- Search does **not** persist across reload/direct navigation — confirmed live: after searching and reloading, the search box is empty and the URL carries no query parameter, same as every other module.

*Details page*
- Header: request title (h3, e.g. "Keys issue"), subtitle = the property's name (e.g. "Sunset Residency", **not** a generic "Request Details" caption — same dynamic-subtitle pattern as Properties), and a "Back" button top-right.
- Directly below the header, a row of **3 unlabeled badges** in a fixed order: **Status, Priority, Category** (e.g. "Resolved" / "Urgent" / "Other"). They're plain text with no visible field label — a screen reader encountering them out of context would not know which badge means what without also reading the Status/Priority/Category columns on the listing page first (see Accessibility section).
- Request Information section (dt/dd pairs), confirmed live in order: **Property, Address, Unit, Landlord, Landlord Email, Tenant, Tenant Email, Tenant Phone, Allow Entry, Created, Resolved** (11 fields, matching this plan's brief exactly). `Allow Entry` renders "Yes"/"No" from the API's boolean `allowEntry` field. `Created` includes a time (e.g. "Jul 17, 2026, 12:29 PM"), unlike the listing table's date-only `Created` column. `Resolved` shows the resolution timestamp when the request is Resolved, or an em dash **"—"** when not yet resolved (confirmed live on an Open request) — matching the app-wide missing-value convention.
- **The Unit field is populated from the property's own `unitName`, not the tenant's** — confirmed via the raw API response, which also carries a separate (different-valued) `tenant.unitName` field that is never displayed anywhere on this page. Do not write an assertion that expects the Unit field to match `tenant.unitName`; it must be compared against `property.unitName`.
- **The Landlord name is title-cased for display but stored lower-case in the API** (`landlord.name: "maaz landlord"` → UI "Maaz Landlord"), the same transform confirmed on the Landlords module. The Tenant name field, by contrast, happened to already be stored title-cased (`tenant.name: "Maaz Tenant"`) in both fixtures checked — the Generator should verify with an additional example whether tenant names are always stored pre-formatted or whether the UI also applies a transform that simply had no visible effect here.
- Description section: a free-text paragraph. Renders the real text when present (one fixture contains several paragraphs of realistic long-form text — a ready-made long-text stress-test fixture, no need to fabricate one). Renders an em dash **"—"** when the request has no description (confirmed live on the "Test" request).
- Attachments section: confirmed live via the raw API that `attachments` is a **plain array of signed S3 URLs with no filename or metadata** — there is no real filename anywhere in the response. Consistent with that, the UI does **not** show real filenames (unlike the Tenants module's Documents section, which does): each attachment renders as a generically-labelled button, "Attachment 1", "Attachment 2", etc., numbered by array position. This is not a bug — there is no filename data available to show. Clicking a button opens a dialog (heading = "Attachment N", an "Open in new tab" link to the real signed URL, and a close button) — same Radix Dialog component as the Tenants documents dialog, including the same benign console warning (`Missing "Description" or aria-describedby={undefined} for {DialogContent}`), confirmed not to affect functionality. **Image attachments (e.g. `.jpg`) render an inline `<img>` preview inside the dialog, and video attachments (e.g. `.mp4`) render an inline, working `<video src=... controls>` player with the correct signed URL** — confirmed live via the raw DOM. (An earlier draft of this plan claimed video attachments have no inline preview at all; that was wrong, caused by a planning-session tool limitation — the accessibility-snapshot tool used at plan time doesn't surface `<video>` elements the way it does `<img>`, so the player was invisible to that tool even though it's really there. Corrected here after the Generator verified the raw DOM directly. This is the same category of tool blind spot already retracted once for a Properties finding — always verify a "missing" finding against the raw HTML, not just an accessibility snapshot, before trusting it.) Zero attachments renders the text "No attachments" (confirmed live), not a broken/empty section.
- Notes section: a list of notes, each showing note text and a timestamp (e.g. "Jul 20, 2026, 10:08 AM") — confirmed live in **chronological ascending order** (oldest first) across two different fixtures. **The note's author is never shown in the UI**, even though the raw API tracks an `addedBy` user-id per note — do not write a test asserting an author name appears next to a note. Zero notes renders the text "No notes yet" (confirmed live) — a distinct, more specific empty-state string than the generic "No data found" used on the listing page.
- **Exactly one `GET /admin/requests/:id` request fires for a valid id** (confirmed live for both provided fixture ids).
- **The non-existent/invalid-id bug reproduces identically to every other module** (confirmed live twice: once with a well-formed-but-nonexistent id `000000000000000000000000`, once with a malformed id `not-a-valid-id` — both produced the exact same behaviour). **Two duplicate `GET /admin/requests/:id` requests fire**, both HTTP 200, and the page renders the generic "Something went wrong" / "We encountered an error. Please try again." + "Retry" screen — not a "Request not found" message. Same shared root cause as `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`; not re-filed as a separate bug, per this project's established convention.
- No console errors were observed during listing load, search (including the script-injection payload), status filter, pagination, view, back navigation, or the invalid-id error flow. The only console output anywhere in this module is the benign Attachments-dialog warning noted above.

*Responsive (measured live via `document.documentElement.scrollWidth`/`clientWidth`, not inferred)*
- **1280px: clean on both the listing and a details page** — `scrollWidth` equals `clientWidth` exactly (1280/1280) on both. This module does **not** reproduce the Tenants-style header-overflow bug.
- **768px: the listing page reproduces the shared tablet horizontal-scroll bug** (`scrollWidth` 1024px vs `clientWidth` 768px, a ~256px page-level overflow — the largest magnitude confirmed of any module so far, consistent with this table having the most columns of any listing page, 8). The **details page is clean at 768px** (768/768, no overflow) — same listing-only pattern already confirmed on Properties, not the listing-and-details pattern seen on Landlords/Tenants.
- **390px: clean on both pages**, sidebar fully collapsed (the "Maintenance Requests" nav link is not visible/rendered in the DOM's visible area).

## Preconditions

- Staging environment is reachable at the URLs above.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- The dataset has 33 requests across 2 pages (20/page) at plan time — the Generator should re-confirm the current total before hardcoding page-count assertions, though unlike Properties this module's dataset does currently support real multi-page testing.
- Known fixture requests, all under property "Sunset Residency" (id `6a4b8f3ee9b8b22c61bd4588`), tenant "Maaz Tenant" (`maaz+t@geeksofkolachi.com`), landlord "Maaz Landlord" (`maaz+m@geeksofkolachi.com`):
  - **"Keys issue"** — id `6a59d9db23e8475d54b26690`. Status Resolved, Priority Urgent, Category Other. Zero attachments. 2 notes. Long-form realistic description text (good long-text fixture).
  - **"Keys Stuck in door"** — id `6a59d81b23e8475d54b26528`. Status Resolved, Priority Urgent, Category Doors Locks. **2 attachments: one video (`.mp4`, inline `<video controls>` player) and one image (`.jpg`, inline `<img>` preview)**. 2 notes. Short description ("darwaza khol do").
  - **"Test"** — id `6a45282a2614b2f59c8cf2c4`, under property "Apex Height", tenant "Karishma", landlord "Anus". Status Open, Priority Medium, Category Plumbing, Allow Entry **No**. Zero attachments, zero notes, no description (all render their respective empty states) — good all-round empty-state fixture. `Resolved` field shows "—".
  - `nonExistentId`: `000000000000000000000000`. `malformedId`: `not-a-valid-id`. Both confirmed live to trigger the shared duplicate-request/generic-error bug.
- Each scenario starts from a clean, authenticated session unless explicitly testing unauthenticated/expired-session behaviour.
- Prefer `getByRole` locators scoped to a specific row over blind keyboard Tab-counting to reach a "View" button, consistent with the lesson learned during the Properties planning session (blind Tab-chaining once triggered an accidental Sign Out there).
- **Request titles and property names are not always unique, and some pairs are substrings of each other** — confirmed live during test generation: both "Test" and "Issue"/"Issue 2" exist as distinct request titles (the latter pair meaning a plain substring-based row filter on "Issue" will also match "Issue 2" rows), and both "Apex Height" and "Apex Heights" exist as distinct property names (same substring risk). Any Generator locator that filters rows by `hasText` on title or property alone should account for this — prefer an exact-named-cell filter (e.g. `getByRole('cell', { name, exact: true })`) over a bare substring `hasText` match when precision matters, as already applied in `tests/MaintenanceRequests/maintenance-requests-data-consistency.spec.js`.

## Scenarios

### Feature Area 1 — List Page

#### Scenario 1.1 — Listing page loads cleanly with all primary elements
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/maintenance-requests` — expected: page loads without redirect.
  2. Observe console during/after load — expected: no uncaught errors.
  3. Observe network — expected: `GET /admin/requests?page=1&limit=20` returns 200; no other failed requests.
- **Assertions:**
  - Heading "Maintenance Requests" and subtitle "Track and review maintenance requests." are visible.
  - Search box (placeholder "Search by title or tenant"), status dropdown, table with all 8 column headers (Request, Property, Tenant, Category, Priority, Status, Created, Actions), and pagination controls are all visible.
  - Sidebar shows "Maintenance Requests" as the active/highlighted nav item.
- **Edge cases considered:** slow network (see 10.5 for the loading-state check), reload mid-load, cold vs. cached load.

#### Scenario 1.2 — Initial loading state renders before data resolves
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate fresh and snapshot immediately, before the list request resolves.
- **Assertions:** A loading indicator/placeholder is shown in place of the table; it is replaced by real content once the API responds, and never gets stuck.

#### Scenario 1.3 — Status dropdown shows all 3 statuses plus the default placeholder
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect the status `<select>` element's options without changing its value.
- **Assertions:** Exactly 4 options exist, in order: "Status" (selected by default), "Open", "In Progress", "Resolved".

#### Scenario 1.4 — Every column renders sensibly for a populated row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Listing loaded; "Keys issue" row present.
- **Steps:** Inspect the "Keys issue" row.
- **Assertions:**
  - Row has exactly 8 cells matching the header order.
  - Status/Priority/Category cells show the correct badge-style text ("Resolved"/"Urgent"/"Other").
  - Created shows a date only, no time (e.g. "Jul 17, 2026").
  - The Actions cell contains exactly one "View" button, no other controls.

#### Scenario 1.5 — Direct navigation and reload consistency
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate directly to `/maintenance-requests` (not via sidebar), then reload.
- **Assertions:** Both loads show the identical unfiltered page-1 list; URL remains `/maintenance-requests`; no stuck spinner.

#### Scenario 1.6 — Column headers are static text, not interactive sort controls
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Click each column header in turn (Request, Property, Tenant, Category, Priority, Status, Created).
- **Assertions:** No `aria-sort` attribute appears on any header; row order never changes.

#### Scenario 1.7 — Empty dataset renders the generic empty state
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Not reproducible against the live dataset (33 requests exist) — requires a mocked empty API response.
- **Steps:** Intercept `GET /admin/requests*` to return zero items.
- **Assertions:** "No data found" / "There is no data to display at the moment." renders in place of the table, same as the confirmed no-search-results state (likely the same shared component).

#### Scenario 1.8 — Sidebar navigation to another module and back still works correctly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** From the listing, click "Properties" in the sidebar, then click "Maintenance Requests" again.
- **Assertions:** Each click performs a clean client-side route change; returning shows the full unfiltered list again with the correct nav item highlighted.

### Feature Area 2 — Search

#### Scenario 2.1 — Search by exact request title matches correctly
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded; "Keys issue" exists.
- **Steps:** Type "Keys issue" into the search box — expected: `GET .../requests?page=1&limit=20&search=Keys issue` fires; only that row shows.
- **Assertions:** "Showing 1–1 of 1"; "Page 1 of 1"; Previous/Next both disabled.

#### Scenario 2.2 — Partial title search matches correctly
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Search "Key" (confirmed live) — expected: matches both "Keys issue" and "Keys Stuck in door".
- **Assertions:** Exactly 2 rows shown, both containing "Key" in their title.

#### Scenario 2.3 — Search by tenant name matches correctly, even with no title overlap
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Search a tenant's first name that does not appear in any request title (confirmed live: "Karishma") — expected: every request belonging to that tenant is returned (confirmed live: 5 rows).
- **Assertions:** Every returned row's Tenant column shows that tenant's name; the placeholder text "Search by title or tenant" is proven accurate by this test.

#### Scenario 2.4 — Search is case-insensitive AND tolerates leading/trailing whitespace (confirmed correct, unlike Properties)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Search `"  key  "` (padded, lowercase) — expected (confirmed live): still matches "Keys issue"/"Keys Stuck in door", same as searching "Key" cleanly.
- **Assertions:** Both matching rows appear despite the case/whitespace mismatch. Unlike `Bugs/Properties/properties-search-does-not-trim-whitespace.md`, this module's search does **not** have that gap — assert the correct (passing) behaviour, not a known-issue placeholder.

#### Scenario 2.5 — Typing computer code into the search box is harmless
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Search `<script>alert(1)</script>` — expected (confirmed live): treated as literal inert text, zero results, no dialog, no console error.
- **Assertions:** No `dialog` event fires; "No data found" renders; console stays clean.

#### Scenario 2.6 — A non-matching search shows the "No data found" empty state
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Search a guaranteed-no-match string (e.g. "zzzznotfound").
- **Assertions:** "No data found" / "There is no data to display at the moment." shown; pagination controls hidden/disabled.

#### Scenario 2.7 — Clearing the search box by hand restores the full list
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Search a term, then delete it back to empty character-by-character (not via Reset).
- **Assertions:** Once empty, the full unfiltered page-1 list returns (the request may be served from client-side cache if the unfiltered query was already fetched this session — assert on resulting UI state, not a guaranteed fresh network round-trip, per the caching behaviour already documented for Properties/Landlords).

#### Scenario 2.8 — The "Reset" button clears search and status together
- **Priority:** P1
- **Tags:** @regression
- **Steps:** With both a search term and a status filter active, click "Reset".
- **Assertions:** Search box empties; status `<select>` returns to its "Status" placeholder; full unfiltered page-1 list returns; "Reset" button disappears.

#### Scenario 2.9 — Searching from page 2 resets pagination back to page 1
- **Priority:** P1
- **Tags:** @regression @critical
- **Preconditions:** On page 2 of the unfiltered list.
- **Steps:** Click "Next" to reach page 2, then search a matching term.
- **Assertions:** The resulting request carries `page=1`, not `page=2`; the page indicator reads "Page 1 of N" for the filtered result.

#### Scenario 2.10 — Search does not survive a reload
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Search a term, then reload the page.
- **Assertions:** Search box is empty after reload; full unfiltered page-1 list shown; URL carries no search query parameter at any point (confirmed live).

### Feature Area 3 — Filters

#### Scenario 3.1 — "Open" filter returns only Open requests
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Select "Open" from the status dropdown — expected: `GET .../requests?page=1&limit=20&status=OPEN`.
- **Assertions:** Every visible row's Status column reads exactly "Open"; "Showing"/"Page" reflect the filtered subset's true total, not the unfiltered 33.

#### Scenario 3.2 — "In Progress" filter returns only In-Progress requests
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Select "In Progress" — expected (confirmed live): `...&status=IN_PROGRESS`, returning 2 requests at plan time.
- **Assertions:** Every visible row's Status column reads exactly "In Progress".

#### Scenario 3.3 — "Resolved" filter returns only Resolved requests
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Select "Resolved" — expected: `...&status=RESOLVED`.
- **Assertions:** Every visible row's Status column reads exactly "Resolved". This is the largest subset at plan time (most fixture requests are Resolved) — confirm the count is internally consistent with `unfiltered total − Open count − In Progress count`.

#### Scenario 3.4 — Selecting the "Status" placeholder option clears the filter
- **Priority:** P2
- **Tags:** @regression
- **Steps:** With a status filter active, re-select the "Status" placeholder option from the dropdown (not the Reset button).
- **Assertions:** The full unfiltered list returns, same as clicking Reset.

#### Scenario 3.5 — Search and status filter combine into one request, not two
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** With "Karishma" in the search box, select "Resolved" from the status filter — expected (confirmed live): a single request `...&search=Karishma&status=RESOLVED`, matching this plan's brief exactly; result narrows to exactly the Resolved requests belonging to that tenant (confirmed live: 1 of her 5).
- **Assertions:** Exactly one network request fires for the combined change, not two independent/conflicting ones.

#### Scenario 3.6 — Search + filter combination that matches nothing shows the empty state
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Combine a valid search term with a status that excludes every match for that term (e.g. a tenant with zero Open requests, filtered to "Open").
- **Assertions:** "No data found" renders, same generic empty state as a plain no-results search.

#### Scenario 3.7 — Filtering by status resets pagination to page 1
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On page 2 of the unfiltered list.
- **Steps:** From page 2, apply a status filter.
- **Assertions:** The resulting request carries `page=1`.

#### Scenario 3.8 — Status filter does not survive a reload
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Apply a status filter, then reload.
- **Assertions:** The `<select>` resets to its "Status" placeholder; the full unfiltered list returns.

### Feature Area 4 — Pagination

#### Scenario 4.1 — Page 1 shows the correct initial pagination state
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Load the listing fresh.
- **Assertions:** "Previous" is disabled; "Next" is enabled; "Page 1 of 2" (confirmed live at plan time: 33 items / 20 per page); "Showing 1–20 of 33".

#### Scenario 4.2 — Clicking "Next" loads page 2 with different data
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Click "Next" — expected (confirmed live): `GET .../requests?page=2&limit=20`; "Showing 21–33 of 33"; "Page 2 of 2"; "Next" becomes disabled, "Previous" becomes enabled.
- **Assertions:** Row data on page 2 is entirely different from page 1 (no duplicated/stuck rows); the last page correctly shows a partial 13-row set, not a full 20.

#### Scenario 4.3 — Clicking "Previous" from page 2 returns to the original page 1 data
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** From page 2, click "Previous".
- **Assertions:** Returns to "Page 1 of 2"; row data exactly matches the original page-1 load.

#### Scenario 4.4 — Reloading mid-pagination resets to page 1
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate to page 2, then reload.
- **Assertions:** Resets to "Page 1 of 2"; "Previous" disabled again.

#### Scenario 4.5 — A filtered subset that fits on one page shows fully-disabled pagination
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Apply the "Open" or "In Progress" filter (both under 20 results at plan time).
- **Assertions:** "Page 1 of 1"; both Previous and Next disabled; "Showing 1–N of N" matches the filtered total exactly.

#### Scenario 4.6 — "Showing A–B of N" is always internally consistent with the visible row count
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Compare the "Showing" text against the actual rendered row count on page 1, page 2, and a filtered view.
- **Assertions:** `B − A + 1` always equals the number of rendered rows in every state checked.

#### Scenario 4.7 — Pagination correctly reflects the API's own pagination metadata
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Capture the List API response's `pagination` object (`currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `hasNextPage`, `hasPrevPage`) on page 1 and page 2.
- **Assertions:** "Page X of Y" matches `currentPage`/`totalPages` exactly; Next/Previous enabled-state matches `hasNextPage`/`hasPrevPage` exactly — do not hardcode `totalPages` as "2"; always read it from the response.

### Feature Area 5 — Detail Page

**Header & badges**

#### Scenario 5.1 — View navigates to the correct request's details page
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Click "View" on a specific row (e.g. "Keys issue") — expected: navigates to `/maintenance-requests/<that request's id>`.
- **Assertions:** URL id matches the row's `_id` (cross-referenced via the listing API's `_id` field); details page heading matches the row's title.

#### Scenario 5.2 — Header renders title, property subtitle, and Back button
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Open "Keys issue"'s details page.
- **Assertions:** Heading (h3) reads "Keys issue"; subtitle reads "Sunset Residency" (the property name, a dynamic value — not a static "Request Details" caption); "Back" button visible top-right.

#### Scenario 5.3 — The 3 badges show correct Status, Priority, and Category in that order
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Keys issue"'s details page and inspect the badge row directly beneath the header.
- **Assertions:** Exactly 3 badges appear, in order: Status ("Resolved"), Priority ("Urgent"), Category ("Other") — each matching the corresponding API field exactly (title-cased from the API's uppercase enum, e.g. `RESOLVED` → "Resolved").

**Request Information**

#### Scenario 5.4 — Request Information section renders all 11 fields correctly
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Keys issue"'s details page; cross-reference all 11 fields (Property, Address, Unit, Landlord, Landlord Email, Tenant, Tenant Email, Tenant Phone, Allow Entry, Created, Resolved) against the API response.
- **Assertions:** Property/Address/Unit match the API's nested `property` object (Unit specifically from `property.unitName`, not `tenant.unitName`); Landlord/Landlord Email match the nested `landlord` object (Landlord title-cased from a lower-case API value); Tenant/Tenant Email/Tenant Phone match the nested `tenant` object; Allow Entry shows "Yes" for `allowEntry: true`; Created includes both date and time (e.g. "Jul 17, 2026, 12:29 PM"); Resolved shows a formatted timestamp matching the API's `resolvedAt`.

#### Scenario 5.5 — Allow Entry correctly shows "No" for a request where entry isn't allowed
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open the "Test" request's details page (`allowEntry: false` in the API).
- **Assertions:** Allow Entry field shows "No", not "Yes" or blank.

#### Scenario 5.6 — Resolved field shows an em dash for a request that hasn't been resolved
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open the "Test" request's details page (Open status, no `resolvedAt` in the API).
- **Assertions:** The Resolved field shows "—", not blank, "null", "undefined", or a stray date.

#### Scenario 5.7 — Created always includes a time, unlike the listing table's date-only column
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Compare the same request's Created value on the listing table (date only) vs. its details page (date + time).
- **Assertions:** Both derive from the same underlying `createdAt` timestamp but are formatted differently by design — not a data-consistency bug.

**Description**

#### Scenario 5.8 — Description renders long-form text correctly, without truncation or layout breakage
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Keys issue"'s details page (contains several paragraphs of realistic long-form description text).
- **Assertions:** The full text renders (not silently truncated); paragraph breaks/line breaks in the source text are preserved or at minimum don't corrupt the reading order; no horizontal overflow is introduced by the long text at desktop width.

#### Scenario 5.9 — Missing description renders an em dash, not blank
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open the "Test" request's details page (empty `description` in the API).
- **Assertions:** Description section shows "—", not an empty paragraph or missing section.

**Attachments**

#### Scenario 5.10 — Attachments section lists all attachments with generic numbered labels
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Open "Keys Stuck in door"'s details page (2 attachments).
- **Assertions:** Exactly 2 buttons render, labelled "Attachment 1" and "Attachment 2" — confirmed via the raw API that no filename data exists to show instead, so this generic labelling is expected/correct behaviour, not a bug to "fix" in a test.

#### Scenario 5.11 — Clicking an image attachment opens a dialog with an inline preview
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Click "Attachment 2" (the `.jpg` image, confirmed live) on "Keys Stuck in door"'s details page.
- **Assertions:** A dialog opens with heading "Attachment 2", an inline `<img>` preview, an "Open in new tab" link pointing to the real signed S3 URL, and a close button.

#### Scenario 5.12 — Clicking a video attachment opens a dialog with a working inline video player
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Click "Attachment 1" (the `.mp4` video, confirmed live) on the same request.
- **Assertions:** A dialog opens with heading "Attachment 1", a `<video>` element with `controls` and a `src` pointing at the real signed S3 URL, and the "Open in new tab" link — confirmed live via the raw DOM after correcting an earlier (wrong) plan draft that assumed no preview existed; see the Attachments note in "Confirmed live structure" above.
- **Note:** opening either attachment dialog logs a benign console warning (missing dialog description, same Radix component as the Tenants documents dialog) that does not affect functionality — a console-hygiene assertion covering this flow should allow for it rather than asserting zero console output.

#### Scenario 5.13 — The attachment dialog's close button works and returns focus sensibly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Open an attachment dialog, then click its close button.
- **Assertions:** Dialog closes; the underlying page remains in its prior state (no navigation, no data loss).

#### Scenario 5.14 — Missing attachments render "No attachments", not a broken/empty section
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Keys issue"'s details page (zero attachments in the API).
- **Assertions:** Attachments section shows the text "No attachments", not an empty grid or missing heading.

**Notes**

#### Scenario 5.15 — Notes render in chronological order with text and timestamp
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Keys issue"'s details page (2 notes).
- **Assertions:** Both notes render, each showing its text and a formatted timestamp; the order is chronological ascending (oldest note first) — confirmed live and matching the API's array order by `createdAt`.

#### Scenario 5.16 — Notes never display who wrote them, despite the API tracking an author
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect a note's rendered content against the API's `notes[].addedBy` field.
- **Assertions:** No author name/avatar/identifier appears anywhere near a note in the UI — confirmed intentional-looking omission, not a bug to "fix"; do not write a test expecting an author to be shown.

#### Scenario 5.17 — Multiple notes across different requests both render correctly
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Compare notes rendering between "Keys issue" and "Keys Stuck in door" (each has its own distinct 2 notes).
- **Assertions:** Notes are correctly scoped per-request — no cross-contamination between the two requests' note lists.

#### Scenario 5.18 — Zero notes renders "No notes yet"
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open the "Test" request's details page (zero notes in the API).
- **Assertions:** Notes section shows "No notes yet" — a distinct, more specific string than the listing page's generic "No data found", confirmed live. Do not conflate the two empty-state copies in a single shared assertion helper.

### Feature Area 6 — Navigation

#### Scenario 6.1 — In-app "Back" button returns to the listing
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** From a details page, click "Back".
- **Assertions:** Returns to `/maintenance-requests`; the full unfiltered page-1 list is shown (search/filter state, if any was active before navigating away, is not restored — same pattern confirmed on every other module).

#### Scenario 6.2 — Browser Back and Forward round-trip correctly
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Listing → View a request → browser Back → browser Forward.
- **Assertions:** Back returns to `/maintenance-requests`; Forward returns to the same details page, fully re-rendered (not blank/stuck); no console errors during either transition.

#### Scenario 6.3 — Refresh on the details page re-renders identical data
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open a valid details page, then reload.
- **Assertions:** URL and rendered title/id remain unchanged; exactly one `GET /admin/requests/:id` request fires again after reload (not two).

#### Scenario 6.4 — Direct deep link to a valid request id renders correctly
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Navigate directly to `/maintenance-requests/<valid id>` (not via the listing).
- **Assertions:** Renders identically to the click-through path; exactly one API request fires.

#### Scenario 6.5 — Refresh on the listing page returns to the unfiltered page-1 view
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Apply a search or filter, then reload.
- **Assertions:** Search box empty, status filter reset, full unfiltered page-1 list shown (covered in more detail by 2.10/3.8; included here for Navigation-area completeness per the prompt's structure).

#### Scenario 6.6 — Clicking View twice quickly does not double-navigate
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Rapidly double-click a row's "View" button.
- **Assertions:** Navigates once to the correct details page; no duplicate history entries or split navigation.

#### Scenario 6.7 — Console and network hygiene across a full navigation flow
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Exercise listing load → search → clear → filter → Reset → view → Back → deep link → reload, monitoring console/network throughout.
- **Assertions:** No uncaught console errors anywhere in the flow. The only expected console output is the Attachments-dialog warning (5.12) if that step is included. No unexpected duplicate requests other than the documented invalid-id case (7.1/7.2).

### Feature Area 7 — API Validation

#### Scenario 7.1 — Listing table matches the List API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/requests?page=1&limit=20`; cross-reference every visible row's Request/Property/Tenant/Category/Priority/Status/Created against `data.items[]`.
- **Assertions:** Every field matches exactly, including the uppercase-enum → title-case UI transform for Category/Priority/Status; never hardcode expected values — always compare against whatever the API actually returned at test time.

#### Scenario 7.2 — Search results match the Search API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/requests?page=1&limit=20&search=<term>` for a real term; cross-reference the filtered rows shown.
- **Assertions:** The set of rows shown exactly equals `data.items[]` for that search — no extra rows, no missing rows.

#### Scenario 7.3 — Status-filtered results match the Filter API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/requests?page=1&limit=20&status=<STATUS>`; cross-reference the filtered rows.
- **Assertions:** Every row's Status column matches the requested filter and the API response exactly.

#### Scenario 7.4 — Search + status combined results match the API field-for-field
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Capture `GET /admin/requests?page=1&limit=20&search=<term>&status=<STATUS>`; cross-reference.
- **Assertions:** Matches this plan's brief exactly (`search=Key&status=RESOLVED`-style URL); results match the combined-filter API response, not a client-side re-filter of the unfiltered list.

#### Scenario 7.5 — Pagination metadata matches the API's `pagination` object exactly
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Compare "Page X of Y" and "Showing A–B of N" against `data.pagination.currentPage`/`totalPages`/`itemsPerPage`/`totalItems` on both page 1 and page 2.
- **Assertions:** All four values trace directly to the API response; never hardcoded.

#### Scenario 7.6 — Details page matches the Detail API field-for-field, including nested objects
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/requests/:id` for "Keys issue"; cross-reference the header, badges, all 11 Request Information fields, Description, Attachments array, and Notes array.
- **Assertions:** Nested `landlord`/`property`/`tenant` objects are correctly unpacked field-by-field (not flattened top-level fields that don't exist); `notes[]` order and content match exactly; `attachments[]` length matches the number of rendered attachment buttons exactly.

### Feature Area 8 — Responsive

#### Scenario 8.1 — Desktop layout (1280px): both pages are clean
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Load the listing and a details page at 1280×800.
- **Assertions:** Confirmed live: no page-level horizontal overflow on either page (`scrollWidth` = `clientWidth` exactly, 1280/1280 both times). This module does not reproduce the Tenants-style header-overflow bug — assert the clean (passing) behaviour, not a known-issue placeholder.

#### Scenario 8.2 — Tablet layout (768px): the listing page has a known horizontal-scroll gap
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024, load the listing page.
- **Assertions:** Assert the **correct** expected behaviour (no page-level overflow) and leave it failing intentionally — confirmed live: `scrollWidth` 1024px vs `clientWidth` 768px (~256px overflow), the same shared root cause as `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`. Not re-filed as a separate bug.

#### Scenario 8.3 — Tablet layout (768px): the details page is clean, unlike the listing page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024, load a details page.
- **Assertions:** Confirmed live: no overflow (768/768 exactly) — a genuine difference from the listing page (8.2), and consistent with the same listing-only pattern already confirmed on Properties. Assert the clean (passing) behaviour, not a known-failing test.

#### Scenario 8.4 — Mobile layout (390px): sidebar collapses, no page-level overflow
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 390×844, load the listing page.
- **Assertions:** Confirmed live: no overflow; "Maintenance Requests" sidebar link is not visible (fully collapsed, not an icon rail).

#### Scenario 8.5 — Mobile layout (390px): details page is also clean
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Resize to 390×844, load a details page.
- **Assertions:** Confirmed live: no overflow (390/390 exactly).

#### Scenario 8.6 — Table's own horizontal scroll (not the page) carries the overflow at narrow widths where a real per-table scroll is expected
- **Priority:** P2
- **Tags:** @regression
- **Steps:** At 390px, scroll right within the table itself.
- **Assertions:** The Request column stays visible while later columns (Category/Priority/Status/Created/Actions) scroll within the table's own container — same contained-scroll pattern confirmed at mobile width on every other module.

### Feature Area 9 — Accessibility

#### Scenario 9.1 — Keyboard tab order reaches every interactive element on the listing page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From page load, Tab through interactive elements: sidebar nav → search box → status dropdown → row View buttons → pagination controls.
- **Assertions:** Every stop is reachable via Tab and activatable via Enter/Space (dropdown via arrow keys), each with a visible focus indicator. Prefer scoped `getByRole` locators over blind Tab-counting when writing the actual test, per the caution already noted in this plan's Preconditions.

#### Scenario 9.2 — The 3 detail-page badges are unlabeled — a real (minor) accessibility gap
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the Status/Priority/Category badge row on a details page.
- **Assertions:** Document the current behaviour: the three badges expose only their text content ("Resolved"/"Urgent"/"Other") with no accessible label distinguishing which is which — a screen-reader user has no way to know from the badge row alone that "Urgent" means Priority and not something else. This is a real, minor gap worth flagging (not necessarily a blocking regression test) since it doesn't reproduce the false-positive pattern already retracted for Properties (this one has no visible text at all identifying the field, versus that retracted case which had visible text the tool simply failed to expose).

#### Scenario 9.3 — Table semantics are correct
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the listing table.
- **Assertions:** Proper `table`/`row`/`columnheader`/`cell` roles present (plain HTML `<table>`, consistent with every other module).

#### Scenario 9.4 — Search box and status dropdown are both properly accessible
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the search input and status `<select>`.
- **Assertions:** Search box exposes an accessible name matching its placeholder ("Search by title or tenant") via `role=searchbox`; status filter exposes as `role=combobox` with all 4 options reachable via keyboard.

#### Scenario 9.5 — Attachment buttons and the dialog's close button are keyboard-operable
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Tab to an "Attachment N" button, activate it with Enter, then Tab to and activate the dialog's close button with Enter.
- **Assertions:** Dialog opens and closes correctly via keyboard alone, no mouse required.

### Feature Area 10 — Error Handling

#### Scenario 10.1 — A non-existent request id shows a clear "not found" message after exactly one request (known bug)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate to `/maintenance-requests/<non-existent well-formed id>` — expected (current, confirmed-live behaviour): two `GET /admin/requests/:id` requests, both HTTP 200, followed by the generic "Something went wrong" + "Retry" screen, not a "not found" message.
- **Assertions:** Write asserting the **correct** behaviour (one request, a clear "not found" message) and leave failing intentionally, consistent with the identical gap already documented for Landlords/Tenants/Properties (`Bugs/Landlords/landlords-details-invalid-id-generic-error.md`) — not re-filed as a separate bug here.

#### Scenario 10.2 — A malformed request id shows the identical gap, not a distinct 400 path (known bug)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate to `/maintenance-requests/not-a-valid-id` — expected (confirmed live): identical behaviour to 10.1, no separate validation-error path for a syntactically invalid id.
- **Assertions:** Same as 10.1.

#### Scenario 10.3 — Retrying the error screen does not fix or worsen the duplicate-request behaviour
- **Priority:** P2
- **Tags:** @regression
- **Steps:** From the error screen in 10.1, click "Retry".
- **Assertions:** Re-fires the same request pattern and lands on the same generic error again — document as part of the same known-issue coverage.

#### Scenario 10.4 — An empty API response renders the empty state, not a crash
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Requires a mocked/intercepted response (not reproducible against the live 33-item dataset).
- **Steps:** Intercept `GET /admin/requests*` to return zero items.
- **Assertions:** "No data found" renders cleanly; no console error or blank white-screen crash.

#### Scenario 10.5 — A 500 response on the listing shows an error state, not silent failure
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Intercept `GET /admin/requests*` to return a 500.
- **Assertions:** An error state renders (not an infinite spinner or a silently-empty table) — exact copy not confirmed live this session (no real 500 was observed); Generator should confirm whether it matches the details page's "Something went wrong" + Retry pattern or differs.

#### Scenario 10.6 — Slow network shows a loading state that eventually resolves
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Throttle/delay the list or detail API response artificially.
- **Assertions:** The loading state (1.2) persists correctly until the (delayed) response arrives, then renders normally — no premature empty-state flash, no stuck spinner.

#### Scenario 10.7 — Missing/null fields render sensibly across the module, never as raw "null"/"undefined"
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Scan every confirmed-empty field across the "Test" fixture (Description, Attachments, Notes, Resolved) plus the listing table's handling of any similarly-empty row.
- **Assertions:** No cell or field anywhere ever renders the literal text "null", "undefined", or "NaN" — confirmed live for Description/Resolved ("—"), Attachments ("No attachments"), Notes ("No notes yet").

#### Scenario 10.8 — Unauthenticated access redirects to sign-in
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From a logged-out session, attempt to load `/maintenance-requests` and a specific request's details page directly.
- **Assertions:** Both redirect to `/sign-in`; no request/tenant/landlord PII is briefly visible before the redirect (flash-of-authenticated-content check).

### Feature Area 11 — Performance

#### Scenario 11.1 — Exactly one request fires for a normal listing load
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Load `/maintenance-requests` fresh and monitor network.
- **Assertions:** Exactly one `GET /admin/requests?page=1&limit=20` fires; no duplicate/redundant requests.

#### Scenario 11.2 — Exactly one request fires for a valid details page load
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Load a valid `/maintenance-requests/:id` fresh and monitor network.
- **Assertions:** Exactly one `GET /admin/requests/:id` fires (confirmed live) — contrast with the documented invalid-id case (10.1), which fires twice.

#### Scenario 11.3 — Table renders once per navigation, without a flash of stale data
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Navigate between the listing and a details page and back several times.
- **Assertions:** Each landing renders fresh, correct data — no flash of the previous page's stale rows before the new data arrives.

#### Scenario 11.4 — No duplicate requests during normal search/filter/pagination use
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Exercise search, status filter, search+filter combined, and Next/Previous in sequence while monitoring network.
- **Assertions:** Each user action fires exactly one corresponding request; no accidental double-fires (e.g. from an unstable `useEffect` dependency) anywhere in this flow.

#### Scenario 11.5 — No console errors across the module's full surface area
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Exercise every flow in this plan's List Page, Search, Filters, Pagination, and Detail Page sections in one continuous session, monitoring console throughout.
- **Assertions:** Zero uncaught console errors. The only expected console output in the entire module is the Attachments-dialog warning (5.12) — explicitly allow for it in this combined check rather than asserting zero warnings outright, mirroring the same allowance already made for the Tenants module's equivalent dialog.

## Bug-Driven Regression Coverage

One shared bug reproduces identically here from an already-documented root cause; no new Maintenance-Requests-specific bugs were found this session:

1. `Bugs/Landlords/landlords-details-invalid-id-generic-error.md` — reproduces identically: a non-existent or malformed request id produces two duplicate fetches and a generic "Something went wrong" error instead of a "Request not found" message (covered by Scenarios 10.1/10.2/10.3).
2. `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` — reproduces on this module's **listing** page at 768px only (the largest overflow magnitude confirmed of any module, ~256px, consistent with this table having the most columns of any listing page). The **details** page does not reproduce it, matching the same listing-only pattern already confirmed on Properties (covered by Scenario 8.2/8.3).

Two things worth flagging that are explicitly **not** bugs, to save the Generator from mis-filing them:
- The search box correctly trims whitespace and is case-insensitive — this module does **not** share `Bugs/Properties/properties-search-does-not-trim-whitespace.md`'s gap (confirmed live, Scenario 2.4).
- This module does **not** reproduce `Bugs/Tenants/tenants-desktop-header-overflows-viewport.md` at 1280px on either page (confirmed live, Scenario 8.1) — same as Properties.

One minor, real accessibility observation (Scenario 9.2) is noted inline in the plan rather than filed as a standalone bug report: the three Status/Priority/Category badges on the details page carry no accessible label distinguishing which badge means what, unlike every dt/dd-labelled field elsewhere on the same page.

## Not covered (and why)

- **Backend logic, database, API automation, authentication, or authorization implementation details** — explicitly out of scope per the prompt. The List, Search, Filter, and Detail APIs are referenced only to justify UI assertions (Feature Area 7); no direct API test suite is included, and no login/session-mechanism internals are tested beyond the standard unauthenticated-redirect check (10.8) already used across every other module's plan.
- **Any mutating action on a request** (marking resolved, reassigning, editing, deleting) — this module's UI has no such controls at all (confirmed live: Actions column only ever shows "View"), so there is nothing to test here beyond what's already covered.
- **Cross-browser matrix (Firefox/Safari)** — `playwright.config.js` currently only enables the `chromium` project, consistent with every other module's plan; not written as separate scenarios until those projects are enabled.
- **True stress-testing of the Description field's long-text handling beyond what the live fixture already provides** — the "Keys issue" fixture's multi-paragraph description is a ready-made real example (Scenario 5.8); a synthetic 10,000-character stress case was not constructed, since a realistic one already exists in the live dataset.
- **Deep exploration of Properties/Landlords/Tenants as referenced from a request's nested data** — the nested `property`/`landlord`/`tenant` objects are validated only as they appear on this module's own listing/details screens; their own dedicated pages are covered by `specs/properties-management.md`, `specs/landlords-management.md`, and `specs/tenant-management.md` respectively.
- **Load/performance benchmarking with real timing thresholds** — Feature Area 11 covers qualitative request-count/console-hygiene checks only, not response-time SLAs.

# Test Plan: Landlords Management

**Target:** https://admin.six-property.clienturl.net/landlords (listing) and https://admin.six-property.clienturl.net/landlords/:id (details)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-03

## Overview

This plan covers the admin Landlords module end-to-end: the listing page (table, search, pagination, suspend/unsuspend), the landlord details page (header, summary cards, information section, properties/tenants sub-tables), navigation and direct-URL behaviour, responsive layout, accessibility, and error/empty/loading states. `GET /admin/landlords?page=1&limit=20`, `GET /admin/landlords/:id`, and the suspend/unsuspend endpoints are used **only** to justify frontend assertions (e.g. table values match the API response) — none of them are automated directly.

**Methodology note:** This plan was authored from a live, authenticated browser session against staging (logged in via `tests/data/credentials.json`), using accessibility snapshots, screenshots at desktop (1280px)/tablet (768px)/mobile (390px) widths, console/network inspection, and manual reproduction of bugs (documented in `Bugs/Landlords/`). Exact locators reflect the live DOM at plan time; the Generator agent must re-confirm them before writing test code. One further bug (the tablet page-level horizontal scroll, see `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`) was only uncovered later, during Generator test-writing, when a fresh (non-collapsed-sidebar) session revealed the original tablet/mobile responsive claims below were inaccurate; those claims have been corrected in place.

**Confirmed live structure (for the Generator's reference):**
- Listing page heading is "Manage Landlords" (h3) with subtitle "View, approve, and manage landlord accounts."
- Table columns, in order: Name, Email, Properties, Tenants, Status, Joined, Actions. Column headers are plain text — **not** sortable (no button/aria-sort on any header).
- The API's `name` field is lower-case (e.g. `"jeremy"`, `"maaz landlord 200"`); the UI title-cases it for display (e.g. "Jeremy", "Maaz Landlord 200"). Assertions comparing UI to API must account for this transform.
- Actions column always renders two buttons: "View" + either "Suspend" (status ACTIVE) or "Unsuspend" (status SUSPENDED).
- Search box placeholder: "Search by name or email". It is a **server-side** search — every keystroke (after fill/debounce) issues `GET /admin/landlords?page=1&limit=20&search=<value>`. The backend trims and lower-cases the term before matching (verified: searching `"  JEREMY  "` still matched `"jeremy"`). A "Reset" button appears next to the search box only while it has a non-empty value; clicking it clears the box and restores the unfiltered, page-1 list.
- Searching while on page 2+ correctly resets pagination to page 1 (confirmed via network log: `search=` requests always carry `page=1`).
- Search term is **not** reflected in the URL and is **not** persisted across a reload/direct navigation — reloading `/landlords` always returns to the unfiltered page-1 view. Treat this as expected (not a bug) unless the Generator finds otherwise.
- Zero-result state (both "no landlords at all" and "search matched nothing") renders: heading "No data found", text "There is no data to display at the moment." — this text is generic and does not mention the search term.
- Pagination controls: "Previous" / "Page X of Y" / "Next", plus a "Showing A–B of N" label. "Previous" is `disabled` on page 1; "Next" is absent/disabled on the last page. Observed dataset at plan time: 86 landlords, 20/page, 5 pages.
- **Suspend/Unsuspend has no confirmation dialog** — clicking either button fires the request immediately (`PATCH /admin/users/:id/suspend` or `.../unsuspend`, **not** `POST` as might be assumed). See `Bugs/Landlords/landlords-suspend-no-confirmation.md`. Do not write tests that look for a confirm modal, Cancel button, Escape-to-cancel, or outside-click-to-cancel for this flow — none exist.
- The Suspend/Unsuspend button correctly disables itself while its request is pending, preventing duplicate submissions from a double-click.
- On success, a toast reads "User suspended successfully." (or the unsuspend equivalent); the row's Status cell and action button update in place, no page reload.
- View button navigates to `/landlords/:id` (client-side route change, same tab).
- Details page header: circular avatar with the first letter of the name, landlord name (h3), subtitle "Landlord Details", and a "Back" button. **There is no status badge in this header row** — status only appears as a colored badge next to the "Landlord Information" section heading, further down the page.
- Summary cards: "Properties" and "Tenants", each showing a single count. Values match `propertiesCount`/`tenantsCount` from `GET /admin/landlords/:id`.
- Landlord Information fields, in order: Email, Address, Date of Birth, Joined, Role, Email Verified, Provider (7 term/definition pairs). There is no separate "Status" row here (see above).
- Properties table columns: Property, Address, Unit, Tenants, Created. Tenants table columns: Name, Email, Phone, Property, Unit, Rent, Status. Neither table's headers are sortable.
- Empty Properties/Tenants sections render "No properties found" / "No tenants found" with the same generic "There is no data to display at the moment." subtext.
- **Visiting a non-existent (but well-formed) landlord id is broken**: the page shows "Loading" for several seconds, fires `GET /admin/landlords/:id` **twice**, and eventually falls back to a generic "Something went wrong. Please try again." + "Retry" error state rather than a "Landlord not found" message. The API itself returns HTTP 200 with `{"status":404,"data":null}` in the body. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`. Tests against this scenario should assert the *current* (buggy) behaviour, or be written as known-failing regression tests per the project's existing pattern (`tests/Auth/admin-forgot-password-known-issues.spec.js`).
- A **valid** id issues exactly one `GET /admin/landlords/:id` request and renders immediately — the duplicate-request issue is specific to the not-found path.
- **Correction from a fresh-session re-check (the original exploration's sidebar had incidentally been left collapsed):** At mobile width (390px) the sidebar collapses fully and only the table's own scroll container needs to move — Name is fully visible, Email is only partially visible (its right edge falls past the viewport), and Properties/Tenants/Status/Joined/Actions are hidden until scrolled to. At tablet width (768px) the sidebar stays expanded by default and does **not** collapse, and the main content area does not shrink to fit — as a result the **entire page** scrolls horizontally (heading and search box scroll out of view too), not just the table. This is a confirmed bug: see `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`. There is no responsive column-hiding or card-based reflow at any width (contrast with the Dashboard's Recent Activity table, which does hide a column at mobile width).
- Sidebar collapses fully (not to an icon rail) at narrow widths, consistent with prior Dashboard findings.
- No console errors or warnings were observed during any flow tested (search, including an XSS-style payload `<script>alert(1)</script>` which was safely treated as inert search text with no execution and no matches).

## Preconditions

- Staging environment is reachable at the URLs above.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- The Landlords list contains at least one landlord with ≥1 property and ≥1 tenant (for populated-state assertions) and at least one with 0 properties/0 tenants (for empty-state assertions). At plan time, `nostaw22@gmail.com` ("Jeremy", id `6a675df2b50e8fe7db1f0def`) has 1 property/1 tenant, and `maaz+t4_8965351912@geeksofkolachi.com` ("Maaz Landlord 200", id `6a5e3f6023e8475d54b28fad`) is Suspended with 0/0 — the Generator should re-verify these still exist before hardcoding ids.
- Each scenario starts from a clean, authenticated session unless explicitly testing unauthenticated/expired-session behaviour.
- Any scenario that suspends a landlord as part of its steps must restore that landlord's original status afterward (via `test.step` cleanup or an explicit unsuspend at the end), to avoid polluting shared staging data for other test runs.
- **`nostaw22@gmail.com` ("Jeremy") is a real client email, not a test account.** It must never be used in any Suspend/Unsuspend scenario. Only use disposable test landlords (the "Maaz Landlord ###" accounts) for any scenario that suspends or unsuspends an account. Jeremy's row may still be used for read-only checks (viewing details, data-consistency comparisons, search) since those don't change account state.

## Scenarios

### Scenario 1.1 — Listing page loads cleanly with all primary elements
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/landlords` — expected: page loads without redirect.
  2. Observe console during/after load — expected: no uncaught errors.
  3. Observe network — expected: `GET /admin/landlords?page=1&limit=20` returns 200; no other failed requests.
- **Assertions:**
  - Heading "Manage Landlords" and subtitle "View, approve, and manage landlord accounts." are visible.
  - Search box, table (with all 7 column headers), and pagination controls are visible.
  - Sidebar shows "Landlords" as the active/highlighted nav item.
  - Sidebar bottom section shows "Admin {email}" link and "Sign Out" button; header shows a second avatar block.
- **Edge cases considered:** slow network, reload mid-load, cold vs. cached load.

### Scenario 1.2 — Direct navigation and reload consistency
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate directly to `/landlords` (not via sidebar click) — expected: renders without a redirect loop.
  2. Reload — expected: identical state, table repopulates, no stuck spinner.
- **Assertions:**
  - URL remains `/landlords` after reload.
  - Table shows page 1 data (20 rows or fewer if total < 20) after reload, regardless of what page/search was active before reload.
- **Edge cases considered:** reload while a request is in-flight; reload immediately after a suspend action.

### Scenario 1.3 — All table columns render expected data types and formats
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Listing loaded with at least one populated row (e.g. Jeremy) and one zero-count row.
- **Steps:**
  1. Inspect a populated row — expected: Name (title-cased), Email, Properties (integer), Tenants (integer), Status ("Active"/"Suspended" badge), Joined (formatted like "Jul 27, 2026"), Actions (View + Suspend/Unsuspend).
  2. Inspect a zero-count row — expected: Properties/Tenants show "0", not blank or "N/A".
- **Assertions:**
  - Every row has exactly 7 cells matching the header order.
  - Status badge text is exactly "Active" or "Suspended" (case-sensitive) and pairs correctly with the Actions button shown (Active→Suspend, Suspended→Unsuspend).
  - Joined date matches the `createdAt` value from the API, formatted as `MMM D, YYYY`.
- **Edge cases considered:** a landlord with 0 properties/tenants; a landlord suspended mid-session (status/action button pair must stay consistent).

### Scenario 1.4 — Column headers are static text, not interactive sort controls
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Attempt to click each column header — expected: no visual sort indicator, no re-ordering of rows, no `aria-sort` attribute change.
- **Assertions:**
  - Table order remains identical (by default, most-recently-created-first based on observed data) after clicking any header.
- **Edge cases considered:** keyboard activation (Enter/Space) on a header if it happens to be focusable.

### Scenario 2.1 — Search by exact and partial name/email matches the API
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded; a known landlord ("Jeremy" / `nostaw22@gmail.com`) exists.
- **Steps:**
  1. Type the exact name "jeremy" into the search box — expected: `GET .../landlords?page=1&limit=20&search=jeremy` fires; table shows only the matching row(s).
  2. Clear and type a partial name substring (e.g. "jer") — expected: same row still matches.
  3. Clear and type the full email — expected: same row matches.
- **Assertions:**
  - "Showing 1–N of N" reflects the filtered count, not the total (86 at plan time).
  - Every visible row's Name or Email contains the search substring (case-insensitively).
  - Pagination collapses appropriately when the filtered result fits on one page (Previous/Next both disabled, "Page 1 of 1").
- **Edge cases considered:** search term matching more than 20 results (pagination within a filtered set — not observed in current dataset, flag as untested if dataset doesn't support it).

### Scenario 2.2 — Search is case-insensitive and trims leading/trailing whitespace
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Type "  JEREMY  " (leading/trailing spaces, all caps) — expected: request is sent with the raw value (`search=++JEREMY++` URL-encoded), but the result still matches "jeremy" (backend trims/lower-cases).
- **Assertions:**
  - The matching row still appears despite the case/whitespace mismatch with the stored (lower-case) name.
- **Edge cases considered:** whitespace-only search (e.g. "   ") — verify whether this returns the full list or an empty one; not yet confirmed, Generator should test explicitly.

### Scenario 2.3 — Search handles numbers, special characters, and script-like input safely
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Search a numeric fragment (e.g. "398", from a test landlord's name) — expected: matches by substring.
  2. Search `<script>alert(1)</script>` — expected: request sent as literal text, zero results, **no script execution**, no console error.
- **Assertions:**
  - No `dialog` event / JS `alert` fires from the script-injection attempt.
  - The literal search value is visible unescaped in the input (React/framework should be escaping it safely on render — visually the text should be plain, not executed).
- **Edge cases considered:** SQL/NoSQL-injection-style strings (e.g. `{"$ne": null}`), extremely long search strings (500+ chars).

### Scenario 2.4 — No-results state
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Search a string guaranteed not to match any landlord (e.g. "zzzznotfound") — expected: table area is replaced with an empty state.
- **Assertions:**
  - Heading "No data found" and text "There is no data to display at the moment." are shown (note: this message does not reference the search term — do not assert otherwise).
  - Pagination controls are hidden or disabled (no "Showing X–Y of 0").
- **Edge cases considered:** transitioning from a no-results state back to a valid search without a full reload.

### Scenario 2.5 — Reset button restores the unfiltered list
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** An active search with a non-empty value.
- **Steps:**
  1. With a search term entered (Reset button visible), click "Reset" — expected: search box clears, "Reset" button disappears, table returns to the full unfiltered page-1 list.
- **Assertions:**
  - Search box value is empty after Reset.
  - Table row count and "Showing 1–20 of 86" (or current total) match the original unfiltered load.
- **Edge cases considered:** clicking Reset when already on an unfiltered view (button shouldn't be present/clickable then).

### Scenario 2.6 — Search resets pagination to page 1
- **Priority:** P1
- **Tags:** @regression @critical
- **Preconditions:** Listing loaded, at least 2 pages of data.
- **Steps:**
  1. Click "Next" to go to page 2.
  2. Type a search term that matches at least one landlord — expected: `GET .../landlords?page=1&limit=20&search=...` fires (page resets to 1, not 2).
- **Assertions:**
  - Pagination indicator reads "Page 1 of N" (N = total pages for the filtered result) immediately after searching from page 2.
- **Edge cases considered:** searching from the last page; searching, then clearing, and confirming the page counter for the restored list is also back to 1.

### Scenario 2.7 — Search state does not survive reload or direct navigation
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** An active search with a non-empty value.
- **Steps:**
  1. With a search term active, reload the page (or re-navigate to `/landlords` directly) — expected: search box is empty and the full unfiltered page-1 list is shown.
- **Assertions:**
  - URL contains no search-related query parameters at any point during this flow.
- **Edge cases considered:** none — this is confirmed current behaviour, not a hypothesis.

### Scenario 3.1 — Pagination controls behave correctly across the boundary pages
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded, ≥2 pages of data (86 items / 20 per page = 5 pages at plan time).
- **Steps:**
  1. On page 1 — expected: "Previous" is disabled, "Next" is enabled, "Page 1 of 5".
  2. Click "Next" repeatedly through to the last page — expected: "Showing 81–86 of 86" (or equivalent for current data), "Next" becomes disabled, "Previous" enabled.
  3. Click "Previous" back to page 1 — expected: data and controls match the original page-1 state.
- **Assertions:**
  - Row data changes on every page transition (no duplicate/stuck data between pages).
  - "Showing A–B of N" always matches the actual rendered row count.
- **Edge cases considered:** a dataset whose last page is not fully populated (e.g. 86 items → page 5 has only 6 rows, not 20).

### Scenario 3.2 — Refresh mid-pagination
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** On page 2 or later.
- **Steps:**
  1. Navigate to page 2, then reload the browser — expected: page resets to 1 (page number is not persisted, consistent with search behaviour).
- **Assertions:**
  - After reload, pagination indicator reads "Page 1 of N" and "Previous" is disabled.
- **Edge cases considered:** confirm this matches the search-state-not-persisted finding rather than being an inconsistency between the two features.

### Scenario 4.1 — View navigates to the correct landlord's details page
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Note the Name/Email/id of a specific row (e.g. Jeremy).
  2. Click that row's "View" button — expected: client-side navigation to `/landlords/<that landlord's id>`.
- **Assertions:**
  - URL path segment after `/landlords/` matches the id backing that row (cross-reference via the listing API response's `_id`).
  - Details page header shows the same name as the row that was clicked.
- **Edge cases considered:** clicking View on a suspended landlord; clicking View twice quickly (should not double-navigate or open two views).

### Scenario 4.2 — Browser back/forward between listing and details
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On the details page after clicking View from the listing.
- **Steps:**
  1. Use the browser Back button — expected: returns to `/landlords`.
  2. Use the browser Forward button — expected: returns to the same details page.
- **Assertions:**
  - No console errors during either transition.
  - Details page re-renders full data on Forward (not a blank/stuck state).
- **Edge cases considered:** whether Back restores prior search/pagination state on the listing (not yet confirmed — the in-app "Back" button was observed to always land on the default unfiltered page-1 listing; the Generator should verify whether the *browser's* native Back button behaves differently, since it may restore scroll/history state that a client-side "Back" button does not).

### Scenario 4.3 — In-app "Back" button returns to the listing
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On a details page.
- **Steps:**
  1. Click the "Back" button in the details header — expected: navigates to `/landlords`.
- **Assertions:**
  - URL is exactly `/landlords` after clicking Back.
- **Edge cases considered:** Back button clicked while a details-page request is still loading.

### Scenario 4.4 — Direct URL access to a landlord's details page
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** A known valid landlord id.
- **Steps:**
  1. Navigate directly to `/landlords/<valid id>` (fresh navigation, not via the listing) — expected: page loads and renders that landlord's data.
- **Assertions:**
  - Exactly one `GET /admin/landlords/:id` request fires (not two).
  - All header/summary/info/properties/tenants data matches the API response for that id.
- **Edge cases considered:** direct access to a suspended landlord's page; direct access with a trailing slash or query string appended.

### Scenario 4.5 — Refresh on the details page
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On a valid details page.
- **Steps:**
  1. Reload the page — expected: identical data re-renders, no stuck loading state, session remains authenticated.
- **Assertions:**
  - URL and rendered name/id remain unchanged after reload.

### Scenario 5.1 — Suspend an active landlord (current, undialogged behaviour)
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** A disposable Active test landlord (one of the "Maaz Landlord ###" accounts). Never use `nostaw22@gmail.com` ("Jeremy") — it is a real client email, not a test account.
- **Steps:**
  1. Click "Suspend" on that row — expected: no dialog appears at any point (per confirmed behaviour, this is a known gap — see `Bugs/Landlords/landlords-suspend-no-confirmation.md`).
  2. Observe the request — expected: `PATCH /admin/users/:id/suspend` fires immediately and returns 200.
  3. Observe the UI — expected: Status cell flips to "Suspended", the button flips to "Unsuspend", a toast reads "User suspended successfully."
  4. **Cleanup:** click "Unsuspend" on the same row to restore its original state.
- **Assertions:**
  - No modal/dialog role element ever appears in the accessibility tree during this flow.
  - Row updates in place without a full page reload or table re-fetch of all pages.
- **Edge cases considered:** suspending the currently-searched/filtered row; suspending a row on page 2+.

### Scenario 5.2 — Unsuspend a suspended landlord
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** A disposable Suspended test landlord (one of the "Maaz Landlord ###" accounts). Never use `nostaw22@gmail.com` ("Jeremy") — it is a real client email, not a test account.
- **Steps:**
  1. Click "Unsuspend" — expected: `PATCH /admin/users/:id/unsuspend` fires, Status flips to "Active", button flips to "Suspend", success toast appears.
- **Assertions:** same shape as 5.1, mirrored.
- **Edge cases considered:** unsuspending a landlord that has since been searched out of view (row should simply disappear from a stale filtered view rather than erroring).

### Scenario 5.3 — Duplicate/rapid clicks on Suspend are guarded against
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A disposable Active test landlord (one of the "Maaz Landlord ###" accounts). Never use `nostaw22@gmail.com` ("Jeremy") — it is a real client email, not a test account.
- **Steps:**
  1. Double-click "Suspend" rapidly — expected: the button disables itself after the first click, so only one `PATCH .../suspend` request fires.
  2. **Cleanup:** unsuspend afterward.
- **Assertions:**
  - Exactly one network request is observed for the double-click.
  - The button visibly enters a disabled/pending state between the click and the response.
- **Edge cases considered:** triple-click; click during an already-pending request triggered a different way.

### Scenario 5.4 — Suspend/Unsuspend API failure handling
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Ability to intercept/mock the suspend endpoint to return a 500 or network error.
- **Steps:**
  1. Simulate a failed suspend request (route interception) — expected: an error toast/message appears; the row's status does **not** change to "Suspended" since the request failed.
- **Assertions:**
  - Row remains in its pre-request state on failure.
  - No unhandled promise rejection appears in the console.
- **Edge cases considered:** timeout vs. explicit 500 vs. malformed JSON response.

### Scenario 5.5 — Suspend status is reflected in Data Consistency after refresh
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A disposable test landlord (one of the "Maaz Landlord ###" accounts), just suspended in-session. Never use `nostaw22@gmail.com` ("Jeremy") — it is a real client email, not a test account.
- **Steps:**
  1. Suspend a landlord, then reload the listing page — expected: the row still shows "Suspended" (i.e. the change was persisted server-side, not just an optimistic local UI update).
  2. **Cleanup:** unsuspend.
- **Assertions:**
  - Post-reload `GET /admin/landlords?...` response includes `status: "SUSPENDED"` for that landlord's `_id`.

### Scenario 6.1 — Listing table data matches the API response
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded on page 1.
- **Steps:**
  1. Capture the `GET /admin/landlords?page=1&limit=20` response.
  2. Cross-reference each visible row against the corresponding API item by `_id`.
- **Assertions:**
  - UI Name (title-cased) corresponds to API `name` (case-insensitively).
  - UI Email exactly matches API `email`.
  - UI Properties/Tenants counts match API `propertiesCount`/`tenantsCount`.
  - UI Status ("Active"/"Suspended") matches API `status` ("ACTIVE"/"SUSPENDED").
  - UI Joined date matches API `createdAt` (formatted).
- **Edge cases considered:** a landlord created/updated between the API call and the UI render (race condition — flag as a rare edge case, not required to simulate).

### Scenario 6.2 — Details page data matches the API response
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** A known landlord's details page loaded.
- **Steps:**
  1. Capture the `GET /admin/landlords/:id` response.
  2. Cross-reference the header, summary cards, info section, and properties/tenants tables against `data.landlord`, `data.propertiesCount`, `data.tenantsCount`, and `data.properties[]` (including nested `tenants[]`).
- **Assertions:**
  - Properties table's "Tenants" column for a property matches that property's `tenantsCount`/`tenants.length`.
  - Tenant row's Rent matches `rentAmount` formatted as currency (e.g. `800` → "$800").
  - Email Verified "Yes"/"No" matches boolean `emailVerified`.

## Responsive Layout

### Scenario 7.1 — Desktop layout (1280px)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Load `/landlords` at 1280×800 — expected: all 7 columns visible without horizontal scrolling.
- **Assertions:** No horizontal scrollbar on the page body at this width.

### Scenario 7.2 — Tablet layout (768px) — known gap
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024 — expected (current, buggy behaviour): only Name/Email are visible; the sidebar stays expanded and does not collapse, so the **entire page** scrolls horizontally to reach Properties/Tenants/Status/Joined/Actions, not just the table. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`.
- **Assertions:** Document the current page-level-scroll behaviour as a known-issue regression test rather than asserting the contained-table-scroll a correct layout would have.

### Scenario 7.3 — Mobile layout (390px)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 390×844 — expected: Name is fully visible; Email is only partially visible (its right edge extends past the viewport); Properties/Tenants/Status/Joined/Actions are hidden until scrolled to. Sidebar is fully collapsed (icon-only toggle in header, no persistent rail), so the table's own scroll container — not the page — absorbs the overflow here.
- **Assertions:** "View"/"Suspend" actions remain reachable via horizontal scroll (not hidden entirely); no page-level horizontal overflow at this width.
- **Edge cases considered:** landscape mobile orientation (844×390).

### Scenario 7.4 — Details page responsive behaviour
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Load a details page at desktop, tablet, and mobile widths — expected: summary cards stack appropriately, info section term/definition pairs remain legible. The details page reproduces the exact same page-level-scroll gap as the listing at tablet width (768px) — see Scenario 7.2 — while desktop and mobile show no real overflow.
- **Assertions:** No content is fully clipped/inaccessible at desktop or mobile widths; the tablet-width overflow is asserted as the documented known gap, not a pass/fail regression on its own.

## Accessibility

### Scenario 8.1 — Keyboard tab order on the listing page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From page load, Tab through interactive elements — expected: logical order (sidebar nav → search box → table row actions → pagination), each with a visible focus indicator.
- **Assertions:** The search box, every row's View/Suspend button, and pagination buttons are reachable via Tab and activatable via Enter/Space.
- **Edge cases considered:** Shift+Tab reverse order; focus trapped nowhere unexpectedly (no dialogs exist to trap focus, per 5.1).

### Scenario 8.2 — Table semantics
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect the accessibility tree for the listing and details tables — expected: proper `table`/`row`/`columnheader`/`cell` roles (confirmed present in the current DOM).
- **Assertions:** Screen-reader-relevant roles are present for both the listing table and the details page's Properties/Tenants tables.

### Scenario 8.3 — Color contrast of status badges
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Visually inspect "Active" (green) and "Suspended" (red/orange) badges against their background.
- **Assertions:** Record contrast ratio observations; flag as a bug if below WCAG AA (4.5:1) for normal text.

## Error Handling, Loading & Empty States

### Scenario 9.1 — Non-existent landlord id (known bug)
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A syntactically valid but non-existent landlord id.
- **Steps:** Navigate directly to `/landlords/<non-existent id>` — expected (current behaviour): "Loading" state for several seconds, two duplicate `GET` requests, then a generic "Something went wrong. Please try again." + "Retry" screen (not a "Landlord not found" message). See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.
- **Assertions:** Document the current behaviour as a known-issue regression test rather than asserting a "Landlord not found" message that does not yet exist.
- **Edge cases considered:** malformed id (not a valid ObjectId shape) — verify whether this produces a different (e.g. immediate 400-driven) error path.

### Scenario 9.2 — Retry button on the generic error state
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** On the generic error state from 9.1.
- **Steps:** Click "Retry" — expected: re-fetches the same (still non-existent) id and returns to the same error state.
- **Assertions:** Retry does not navigate away or crash; it re-triggers the same request pattern (including the duplicate-request behaviour).

### Scenario 9.3 — Empty properties/tenants sections
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A landlord with 0 properties and/or 0 tenants (e.g. any freshly-created "Maaz Landlord ###" test account).
- **Steps:** Load that landlord's details page — expected: "No properties found" and/or "No tenants found" with the standard generic subtext.
- **Assertions:** Summary cards show "0" for the corresponding count, consistent with the empty section below.

### Scenario 9.4 — Console and network hygiene across the module
- **Priority:** P1
- **Tags:** @regression
- **Steps:** While exercising listing load, search, pagination, view, suspend/unsuspend, and details load — monitor console and network throughout.
- **Assertions:** No uncaught console errors/warnings in any of the flows above (confirmed clean at plan time, including during the XSS-payload search test). No unexpected duplicate requests other than the documented not-found-id case (9.1).

### Scenario 9.5 — Unauthenticated/expired-session access
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A logged-out or expired session.
- **Steps:** Attempt to load `/landlords` or `/landlords/:id` directly — expected: redirect to sign-in rather than rendering any landlord data.
- **Assertions:** No landlord PII is briefly visible before the redirect (flash-of-authenticated-content check).

## Bug-Driven Regression Coverage

The following bugs were found during exploration and test generation and have full write-ups under `Bugs/Landlords/`. Per explicit instruction for this module, the corresponding tests assert the **correct expected behaviour** (not the current buggy behaviour) and are left intentionally failing until each bug is fixed — matching the `tests/Dashboard/dashboard-sign-out.spec.js` known-issue convention, not the `tests/Auth/admin-forgot-password-known-issues.spec.js` one (which asserts current behaviour and passes today). Each will flip from failing to passing the moment its underlying bug is fixed, with no test changes required:

1. `landlords-suspend-no-confirmation.md` — Suspend/Unsuspend fires with zero confirmation step. Tests 5.1/5.2 assert a confirmation dialog must appear and the status must not change until accepted — currently failing.
2. `landlords-details-invalid-id-generic-error.md` — non-existent id produces a slow, generic, duplicate-fetching error instead of a clear not-found state. Tests 9.1/9.2 assert exactly one request and a "not found" message — currently failing.
3. `landlords-sidebar-logo-placeholder.md` — the sidebar shows a plain "6P" text placeholder instead of the real company logo, on every authenticated page. Not covered by a scenario above (a visual/branding issue, not a functional one); left as a standalone bug report only, no test.
4. `landlords-tablet-page-scrolls-horizontally.md` — at 768px the sidebar doesn't collapse and the whole page scrolls horizontally instead of just the table, on both the listing and details pages (found during test generation). Tests 7.2/7.4 assert no page-level overflow at this width — currently failing.

## Not covered (and why)

- **API automation** — the listing/search/pagination/suspend/details APIs are referenced only to justify UI assertions, per the prompt's constraints; no direct API test suite is included here.
- **Deep exploration of Tenants/Properties modules** — only covered as they surface inside a landlord's details page (Properties/Tenants sub-tables); their standalone `/tenants` and `/properties` pages are out of scope for this plan.
- **Cross-browser matrix (Firefox/Safari)** — `playwright.config.js` currently only enables the `chromium` project; cross-browser scenarios are noted (7.x mentions Chrome/Firefox/Safari in the original brief) but not written as separate scenarios until those projects are enabled, to avoid tests that can never run in CI.
- **Load/performance testing** — flagged as out of scope; only qualitative loading-state observations are included (9.x).
- **Multi-tab / multi-session suspend races** (e.g. suspending the same landlord from two admin tabs simultaneously) — interesting but low-value relative to effort; not written as a scenario.
- **A confirmation-dialog test suite for Suspend/Unsuspend** — deliberately omitted, since no such dialog exists (see Bug 1). Do not write these tests until the bug is fixed; the plan instead documents current behaviour in 5.1/5.2/5.3.

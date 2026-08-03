# Test Plan: Tenant Management

**Target:** https://admin.six-property.clienturl.net/tenants (listing) and https://admin.six-property.clienturl.net/tenants/:id (details)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-03

## Overview

This plan covers the admin Tenants module end-to-end: the listing page (table, search, status filter, pagination, suspend/unsuspend), the tenant details page (header, tenant information, profile, documents, pets), navigation and direct-URL behaviour, responsive layout, accessibility, and error/empty/loading states. `GET /admin/tenants?page=1&limit=20`, `GET /admin/tenants?page=1&limit=20&status=INVITED`, `GET /admin/tenants/:id`, and the suspend/unsuspend endpoints are used **only** to justify frontend assertions — none of them are automated directly.

**Methodology note:** This plan was authored from a live, authenticated browser session against staging (logged in via `tests/data/credentials.json`), using accessibility snapshots, direct network/API inspection, responsive checks at 1280/768/390px, and manual reproduction of two new bugs (documented in `Bugs/Tenants/`) plus confirmation that three previously-documented Landlords bugs (`Bugs/Landlords/`) also reproduce here, from a shared layout/component root cause. Exact locators reflect the live DOM at plan time; the Generator agent must re-confirm them before writing test code.

**Confirmed live structure (for the Generator's reference):**
- Listing page heading is "Manage Tenants" (h3) with subtitle "View and manage tenant accounts."
- Table columns, in order: Name, Email, Landlord, Property, Unit, Rent, Status, Actions (8 columns). Headers are plain text, not sortable.
- Status filter is a native `<select>` with options: "Status" (placeholder/default), "Active", "Invited", "Pending". Selecting one issues `GET /admin/tenants?page=1&limit=20&status=<VALUE_UPPERCASE>`. **"Pending" is a real, populated status** (4 tenants at plan time) — do not assume it is a dead/unused option.
- Search is server-side, same pattern as Landlords: `GET /admin/tenants?page=1&limit=20&search=<value>`. Search and status filter **combine** into a single request (`...&search=jeremy&status=ACTIVE`) when both are active. A "Reset" button appears once either is active and clears both together, back to the full unfiltered page-1 list.
- **Critical, non-obvious rule for the "Suspend" button's enabled/disabled state:** it is enabled if and only if the tenant record has an associated `user` id in the API response (i.e., the invited person has actually created/activated their account) — **regardless of the tenant's own `status` value** (ACTIVE, INVITED, or PENDING can all have Suspend enabled or disabled depending solely on whether `user` is present). Do not assume "Invited/Pending → disabled" or "Active → enabled"; confirmed live counter-examples exist in both directions (e.g. an INVITED tenant with Suspend enabled because a `user` id exists; several ACTIVE-adjacent INVITED/PENDING ones disabled because it doesn't).
- **The tenant `status` field (ACTIVE/INVITED/PENDING) is a completely different thing from the account's suspended/active state** — it represents onboarding/lease progress, not whether an admin has suspended the account. See the bug below: this distinction is the root cause of a major gap.
- Suspend/Unsuspend calls `PATCH /admin/users/:id/suspend` (or `/unsuspend`) using the tenant record's `user` id — **not** `POST` as might be assumed, and **not** the tenant record's own `_id`.
- **Confirmed bug (see `Bugs/Tenants/tenants-suspend-does-not-update-or-allow-unsuspend.md`):** clicking "Suspend" on the listing succeeds on the backend (verified via the API response and via a direct follow-up API call) but the row's Status cell and Actions button **never update** — not immediately, and not after a full page reload — because the tenant's `status` field is unrelated to the account's suspend state. The button never becomes "Unsuspend", so there is **no way through the UI** to reverse a suspension once made. Do not write tests asserting the row updates after Suspend — assert the current (broken) "no visible change" behaviour instead, or write it as a known-issue test asserting the *correct* behaviour and expect it to fail until fixed (matching `tests/Dashboard/dashboard-sign-out.spec.js`'s convention, per explicit instruction from the Landlords work this plan follows).
- **No confirmation dialog exists for Suspend**, same gap as Landlords (`Bugs/Landlords/landlords-suspend-no-confirmation.md` — reproduces identically here; no separate Tenants-specific bug file was filed for this since it's the same shared component/behaviour).
- **Confirmed live (see `Bugs/Tenants/tenants-record-linked-to-admin-account.md`):** at least one tenant record in the list (`mudassir+909@geeksofkolachi.com`, "Ahmed Khan") has its `user` field set to the currently-logged-in **admin's own** user id, not a real tenant's. Clicking "Suspend" on it sends `PATCH /admin/users/<admin's own id>/suspend`. **The error handling here actually works correctly**: the backend refuses the request (`{"status":400,"message":"Admin users cannot be suspended."}`, itself returned with an HTTP 200 wrapper — same status-in-body anti-pattern as the invalid-id bug) and the frontend correctly displays a red error toast with that exact message — confirmed live via screenshot, contradicting an earlier draft of this plan that had it backwards. The admin account is not put at risk, and the admin is clearly told why the action failed. The only real defect is the data-integrity question of how a tenant record came to be linked to an admin account at all. Treat any test that clicks Suspend on an unfamiliar/unverified tenant row with real caution regardless: confirm via the listing API's `user` field first, never suspend a row whose `user` id you have not verified is a disposable test account.
- Toast on a successful suspend call correctly reads "User suspended successfully." (confirmed via video) — the toast itself works fine; it's specifically the row's Status/button that never update, not the feedback mechanism in general.
- Details page header: avatar (a real `<img>` with the tenant's uploaded photo if one exists, or initials in a circle — e.g. "AT" for Anus Tenant — if not), name (h3), subtitle "Tenant Details", "Back" button. As with Landlords, there is **no status badge in the header row** — a status badge (colored, e.g. "Active") only appears next to the "Tenant Information" section heading further down.
- Tenant Information fields, in order: Email, Phone, Unit, Rent, Lease Start, Lease End, Security Deposit Held, Invite Code, Joined, Landlord, Landlord Email, Property, Property Address (13 term/definition pairs). Missing values (e.g. no Lease Start) render as "—". `Security Deposit Held` renders "Yes"/"No" from the `securityDepositHeld` boolean; when the field is entirely absent from the API response it renders "No" (confirmed live on a sparse tenant record), not "—" — this is an inconsistency worth flagging as an edge case (other missing fields use "—", this one silently defaults to "No").
- Profile section fields: Date of Birth, Location, Emergency Contact, Vehicle. Emergency Contact renders as `"{name} ({relationship}) • {phone}"`; Vehicle renders as `"{make} {model} {year} • {plate} ({state})"`. Any missing field (including the whole profile sub-object) renders "—" for that field individually.
- **SSN is present in the API response (`profile.ssn` / `profile.ssnLast4`) but is never rendered anywhere in the UI** — confirmed intentional-looking (privacy-appropriate) omission, not a data-consistency bug. Do not write a test asserting SSN is displayed.
- Documents section: two sub-sections, "Identity Document" and "Renters Insurance", each rendering one button per uploaded file (Identity Document can have both a front and back file → two buttons; Renters Insurance always has at most one). Each button shows the original filename with an icon (image icon for image files, file-text icon for PDFs). When a document type has no file, its sub-section shows "—" instead of any button.
- **Clicking a document button opens a modal dialog** (not a new tab directly) with the filename as its heading, an inline preview (`<img>` for images, `<iframe>` for PDFs), an "Open in new tab" link (the real pre-signed S3 URL), and a close button.
- Opening this document dialog logs a benign React/Radix console warning (`Missing "Description" or aria-describedby={undefined} for {DialogContent}`) — confirmed not to affect functionality; treated as expected noise for this flow, not a bug, and not tracked separately.
- Pets section: one card per pet, showing `{name}` and `{type} • {breed}`. Zero pets renders the text "No pets on file" (not a generic empty-state heading like elsewhere in the app).
- **The invalid-tenant-id bug reproduces identically to Landlords:** a non-existent (but well-formed) id shows "Loading" for several seconds, fires `GET /admin/tenants/:id` **twice**, and falls back to the generic "Something went wrong. Please try again." + "Retry" screen rather than a "not found" message. Same root cause as `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`; not re-filed as a separate bug.
- **The tablet-width (768px) whole-page horizontal scroll bug also reproduces identically** on both the listing and details pages (confirmed: `documentElement.scrollWidth` 1024 vs `clientWidth` 768, same magnitude as Landlords). Same root cause as `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`; not re-filed separately. Desktop (1280px) and mobile (390px) show no such overflow.
- Sidebar collapses fully at mobile width, consistent with Landlords and Dashboard.
- No console errors were observed during listing load, search, status filter, or pagination. The only console output observed anywhere in this module is the Documents-dialog accessibility warning noted above.

## Preconditions

- Staging environment is reachable at the URLs above.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- **`jwatson@thesixpm.com` ("Jeremy", tenant of the real landlord Jeremy) is real client data, not a test account.** It must never be used in any Suspend/Unsuspend scenario. It may still be used for read-only checks (search, view, data-consistency) since those don't change account state.
- **`mudassir+909@geeksofkolachi.com` ("Ahmed Khan") must never be suspended casually.** Its `user` field is confirmed live to point at the currently-logged-in admin's own account. It is used exactly once, deliberately, in Scenario 7.4 to document that specific gap — never as a stand-in disposable tenant elsewhere in this suite. Before suspending *any* tenant not already named in this plan, check its `user` id against the currently authenticated admin's own id first.
- **Use exactly one dedicated disposable test tenant for all Suspend/Unsuspend scenarios**, per the plan's instruction to avoid repeatedly suspending random users. At plan time, `anus.ahmed+ten@geeksofkolachi.com` ("Anus Tenant", tenant id `6a310cab7ccd75cd631cab09`, user id `6a310d2f7ccd75cd631cab27`) is a suitable disposable candidate with a `user` id (Suspend enabled) and a minimal profile (useful for empty-state checks too) — the Generator should re-verify it still exists before hardcoding.
- **Because the UI itself cannot reverse a suspension (see the bug above), any test that suspends the dedicated test tenant must restore it via a direct authenticated `PATCH /admin/users/:id/unsuspend` call** (using the token from `localStorage.getItem('token')` in a real browser session, or the equivalent in Playwright), **not** by clicking an "Unsuspend" button in the UI — no such reachable button exists for a suspended tenant on this screen.
- A tenant with a fully populated profile (documents + pets + emergency contact + vehicle) exists for positive-path detail-page checks — at plan time, `maaz+t@geeksofkolachi.com` ("Maaz Tenant", id `6a4b925be9b8b22c61bd46cb`) has a full profile including 5 pets.
- A tenant with a minimal/empty profile exists for empty-state checks — at plan time, `anus.ahmed+ten@geeksofkolachi.com` ("Anus Tenant", id `6a310cab7ccd75cd631cab09`) has no documents, no pets, and no profile sub-fields.
- Each scenario starts from a clean, authenticated session unless explicitly testing unauthenticated/expired-session behaviour.

## Scenarios

### Scenario 1.1 — Listing page loads cleanly with all primary elements
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/tenants` — expected: page loads without redirect.
  2. Observe console during/after load — expected: no uncaught errors.
  3. Observe network — expected: `GET /admin/tenants?page=1&limit=20` returns 200; no other failed requests.
- **Assertions:**
  - Heading "Manage Tenants" and subtitle "View and manage tenant accounts." are visible.
  - Search box, status filter select, table (with all 8 column headers), and pagination controls are visible.
  - Sidebar shows "Tenants" as the active/highlighted nav item.
  - Sidebar bottom section shows "Admin {email}" link and "Sign Out" button; header shows a second avatar block.
- **Edge cases considered:** slow network, reload mid-load, cold vs. cached load.

### Scenario 1.2 — Direct navigation and reload consistency
- **Priority:** P1
- **Tags:** @regression
- **Steps:**
  1. Navigate directly to `/tenants` (not via sidebar click) — expected: renders without a redirect loop.
  2. Reload — expected: identical state, table repopulates, no stuck spinner, search/filter (if any was set) does not persist.
- **Assertions:**
  - URL remains `/tenants` after reload; table shows the unfiltered page-1 list regardless of prior state.

### Scenario 2.1 — Every column renders the expected data for a populated row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Inspect a populated row (e.g. "Maaz Tenant T4") — expected: Name, Email, Landlord name, Property name, Unit, Rent (formatted `$X,XXX`), Status badge, Actions (View + Suspend/Unsuspend, per the `user`-id rule above).
- **Assertions:**
  - Every row has exactly 8 cells matching the header order.
  - Rent is formatted with a `$` and thousands separator where applicable (e.g. "$2,800").
  - Status badge text is exactly "Active", "Invited", or "Pending".
  - The Suspend/Unsuspend button's enabled state matches whether the underlying record has a `user` id (cross-checked via the API response), not the visible Status text.
- **Edge cases considered:** two different tenant records sharing the same email address (confirmed live: `anus.ahmed+76@geeksofkolachi.com` appears on two separate rows with different names/statuses) — search by that email should return both.

### Scenario 2.2 — Column values handle long, missing, or unusual data gracefully
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Inspect a row whose Unit value is unusually short/numeric-only (e.g. "11" or "5") and one with a long property name (e.g. "Sunrise heights Apartments").
- **Assertions:**
  - No column overflows its cell or gets visually truncated in a way that hides the value entirely (some horizontal scroll within the table is acceptable, per the responsive scenarios).

### Scenario 3.1 — Search by exact name, partial name, email, or partial email
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded; "Jeremy" (`jwatson@thesixpm.com`) exists (read-only use is fine here).
- **Steps:**
  1. Type "jeremy" — expected: `GET .../tenants?page=1&limit=20&search=jeremy` fires; exactly the Jeremy row shows.
  2. Clear and type a partial name/email fragment — expected: same row still matches.
- **Assertions:**
  - "Showing 1–N of N" reflects the filtered count.
  - Pagination collapses to "Page 1 of 1" with both buttons disabled when the result fits on one page.

### Scenario 3.2 — Search is case-insensitive and tolerates whitespace
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Search "  JEREMY  " (mixed case, padded) — expected: still matches, mirroring the confirmed Landlords search behaviour.
- **Assertions:** The matching row appears despite the case/whitespace mismatch.

### Scenario 3.3 — Search handles special/script-like input safely
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Search `<script>alert(1)</script>` — expected: treated as literal inert text, zero results, no script execution, no console error.
- **Assertions:** No JS dialog fires; "No data found"-equivalent empty state renders (Generator to confirm the exact empty-state copy live, since it was not captured verbatim in this plan — the mechanism was confirmed to work but the specific empty-state text for Tenants was not screenshotted).

### Scenario 3.4 — No-results and Reset
- **Priority:** P1
- **Tags:** @regression
- **Steps:**
  1. Search a term guaranteed to match nothing — expected: empty state, pagination controls hidden/disabled.
  2. Click "Reset" — expected: search box clears, full unfiltered page-1 list returns.
- **Assertions:** Reset also clears an active status filter, not just the search box (see 4.3).

### Scenario 4.1 — Status filter returns the correct subset for each option
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Select "Active" — expected: `GET .../tenants?page=1&limit=20&status=ACTIVE`.
  2. Select "Invited" — expected: `...&status=INVITED`; confirmed live: 5 tenants at plan time, drawn from both underlying pages (i.e. filtering searches the whole dataset, not just the current page).
  3. Select "Pending" — expected: `...&status=PENDING`; confirmed live: **this returns real data (4 tenants at plan time) — it is not a dead/unused option.**
- **Assertions:**
  - Every visible row's Status badge matches the selected filter exactly.
  - "Showing 1–N of N" and "Page 1 of 1" reflect the filtered subset's true total, not the unfiltered 29.

### Scenario 4.2 — Search and status filter combine correctly
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** With "jeremy" in the search box, select "Active" from the status filter — expected: a single request `...&search=jeremy&status=ACTIVE` (confirmed live), not two independent, conflicting filters.
- **Assertions:** The Jeremy row still shows (since Jeremy is Active). **Confirmed live during test generation:** combining search with a status that excludes the match (e.g. "jeremy" + "Invited") correctly falls back to the same generic "No data found" empty state as a plain no-results search — implemented and passing.

### Scenario 4.3 — Reset clears both search and status filter together
- **Priority:** P1
- **Tags:** @regression
- **Steps:** With both a search term and a status filter active, click "Reset" — expected: both clear simultaneously, full unfiltered list returns.
- **Assertions:** Status `<select>` returns to its "Status" placeholder option; search box empties.

### Scenario 5.1 — Pagination behaves correctly across all pages
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded, unfiltered (29 total / 20 per page = 2 pages at plan time).
- **Steps:** Click "Next" to page 2, confirm data changes and "Previous" becomes enabled; click back to page 1.
- **Assertions:** Row data differs between pages; "Showing 21–29 of 29" on page 2 (partial last page).

### Scenario 5.2 — Status-filtered pagination
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Apply a status filter whose result spans more than one page (none did at plan time — all filtered subsets fit on one page; Generator should re-check current data, or use a mocked response to force a second page).
- **Assertions:** Pagination reflects the filtered total, not the unfiltered 29.

### Scenario 6.1 — View navigates to the correct tenant's details page
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Click "View" on a specific row (e.g. "Maaz Tenant") — expected: navigates to `/tenants/<that tenant's id>`.
- **Assertions:** URL id matches the row's `_id` (cross-referenced via the listing API); details page header name matches.

### Scenario 7.1 — Suspend does not ask for confirmation (known gap, shared with Landlords)
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** The dedicated disposable test tenant, Active, with Suspend enabled.
- **Steps:** Click "Suspend" — expected (current behaviour): no confirmation dialog appears at any point; request fires immediately. See `Bugs/Landlords/landlords-suspend-no-confirmation.md` (same gap, not re-filed for Tenants).
- **Assertions:** No `dialog`-role element ever appears during this flow.
- **Cleanup:** restore via a direct authenticated `PATCH /admin/users/:id/unsuspend` call (see Preconditions) — **not** a UI button, since none exists once suspended.

### Scenario 7.2 — Suspend succeeds on the backend but the row never visibly updates (known bug)
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** The dedicated disposable test tenant, Active.
- **Steps:**
  1. Click "Suspend" — expected (current, buggy behaviour): the `PATCH .../suspend` request returns 200 with `status: "SUSPENDED"` in its response body, but the row's Status cell and Actions button remain unchanged ("Active" / "Suspend").
  2. Reload the page — expected: still unchanged, even after a fresh fetch.
- **Assertions:** This scenario should be written to assert the **correct** expected behaviour (row shows "Suspended", button becomes "Unsuspend") and left failing intentionally until `Bugs/Tenants/tenants-suspend-does-not-update-or-allow-unsuspend.md` is fixed — per the project's known-issue convention (`tests/Dashboard/dashboard-sign-out.spec.js`), matching how the equivalent Landlords gaps were finally handled in this project.
- **Cleanup:** restore via direct API call regardless of the test's pass/fail outcome (use a `finally` block), since the click itself really does suspend the account even though the UI won't show it.

### Scenario 7.3 — No UI path exists to unsuspend a tenant (known bug, consequence of 7.2)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** After suspending the dedicated test tenant (via 7.2's mechanism), search for them on the listing — expected (current, buggy behaviour): no "Unsuspend" button ever appears, because the Status/button pairing is driven by the tenant's onboarding `status`, not the account's suspend state.
- **Assertions:** Document this as a known gap; do not write a test asserting an "Unsuspend" button can be found and clicked for a suspended tenant, since it cannot currently be reached this way.

### Scenario 7.4 — Suspending a tenant linked to an admin account is correctly refused, with a clear error toast (data-integrity bug, confirmed)
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** The specific tenant record `mudassir+909@geeksofkolachi.com` ("Ahmed Khan") — confirmed live to have its `user` field set to the currently-logged-in admin's own user id. Generator must re-verify this via the listing API's `user` field before reusing it, and must **never** click Suspend on any tenant row without first confirming its `user` id is a disposable test account, not a real admin.
- **Steps:**
  1. Search for this tenant and click "Suspend".
  2. Observe the network response and the UI simultaneously.
- **Assertions:**
  - The API response body carries `{"status":400,"message":"Admin users cannot be suspended."}` (wrapped in an HTTP 200, same anti-pattern as the invalid-id bug) — the admin account is genuinely not suspended.
  - **Confirmed live via screenshot: a red error toast correctly displays "Admin users cannot be suspended."** — the error handling itself works correctly here; do not write a test asserting feedback is missing.
  - Follow-up: confirm the admin's own session still works (e.g. load `/dashboard` successfully) to prove no lockout occurred.
- **The actual bug this documents is data-integrity only**: that this tenant record's `user` field points at an admin account at all (see `Bugs/Tenants/tenants-record-linked-to-admin-account.md`). Do not treat this as a template for other Suspend tests, and do not assert any UI feedback gap — there isn't one.

### Scenario 8.1 — Header renders avatar, name, and Back button; no status badge here
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Open a tenant with an uploaded photo (e.g. "Maaz Tenant") and one without (e.g. "Anus Tenant").
- **Assertions:**
  - The photo-having tenant renders a real `<img>` with their uploaded photo URL; the other renders initials in a circle (e.g. "AT").
  - No status badge appears in the header row itself — it only appears next to "Tenant Information" further down.

### Scenario 9.1 — Tenant Information fields match the API for a fully-populated tenant
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Maaz Tenant" (`maaz+t@geeksofkolachi.com`) and cross-reference all 13 fields against `GET /admin/tenants/:id`.
- **Assertions:** Landlord/Landlord Email/Property/Property Address reflect the *nested* `landlord`/`property` objects, not top-level tenant fields; Security Deposit Held renders "Yes" when `securityDepositHeld: true`.

### Scenario 9.2 — Missing Tenant Information fields render sensibly
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Anus Tenant" (sparse record, missing `leaseStartDate` and `securityDepositHeld`).
- **Assertions:** Lease Start renders "—"; Security Deposit Held renders "No" (confirmed live default when the field is absent — flag as an inconsistency vs. other fields' "—" convention, not something to "fix" via the test).

### Scenario 10.1 — Profile section renders all four fields correctly formatted
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Maaz Tenant" — check Date of Birth (formatted `MMM D, YYYY`), Emergency Contact (`Name (Relationship) • Phone`), Vehicle (`Make Model Year • Plate (State)`).
- **Assertions:** Exact formatting strings match the templates above; Location shows "—" when absent even on an otherwise-populated profile (confirmed live: "Maaz Tenant" has no `location` field and shows "—" despite having everything else).

### Scenario 10.2 — Profile section renders all "—" for a tenant with no profile sub-fields
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Anus Tenant".
- **Assertions:** All four Profile fields show "—".

### Scenario 11.1 — Documents render one button per uploaded file, grouped correctly
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Open "Maaz Tenant" — Identity Document should show two buttons (front + back file); Renters Insurance should show one.
- **Assertions:** Each button's visible text is the original filename; each has an appropriate icon (image vs. file-text) reflecting file type.

### Scenario 11.2 — Clicking a document opens a preview dialog with a working "Open in new tab" link
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:**
  1. Click an image document button — expected: dialog opens with the filename as its heading, an `<img>` preview, and an "Open in new tab" link.
  2. Close it; click a PDF document button — expected: same dialog shape but with an `<iframe>` preview instead of `<img>`.
- **Assertions:** The "Open in new tab" link's href is a real, signed S3 URL pointing at the correct file.
- **Note:** opening this dialog logs a benign console warning (missing dialog description) that does not affect functionality — a console-hygiene assertion covering this flow should allow for it rather than asserting zero console output.

### Scenario 11.3 — Missing documents render "—", not a broken/missing button
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Anus Tenant" (no documents at all).
- **Assertions:** Both "Identity Document" and "Renters Insurance" sub-sections show "—" with no button.

### Scenario 12.1 — Pets render correctly for zero, one, and multiple pets
- **Priority:** P1
- **Tags:** @regression
- **Steps:**
  1. Open "Anus Tenant" — expected: text "No pets on file" (not a generic empty-state heading/icon combo like elsewhere in the app).
  2. Open a tenant with exactly one pet (e.g. "Alex", `anus.ahmed+e2@geeksofkolachi.com`) — expected: one pet card, "{name}" / "{type} • {breed}".
  3. Open "Maaz Tenant" (5 pets) — expected: 5 pet cards in the confirmed order (Max/Dog/Husky, Luna/Cat/Persian, Kiwi/Bird/Snipe, Guppy/Fish/Betta, Cotton/Other/Angora).
- **Assertions:** Pet count and content match the API's `profile.pets[]` array exactly, including unusual `type` values like "Other".

### Scenario 13.1 — Back button and browser Back/Forward
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From a details page, click the page's own "Back" button — expected: returns to `/tenants`. Separately, use View → browser Back → browser Forward.
- **Assertions:** Browser Back/Forward round-trip re-renders the details page fully (not a blank/stuck state); no console errors during either transition.

### Scenario 13.2 — Direct URL access and refresh
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Navigate directly to `/tenants/<valid id>` (not via the listing) — expected: exactly one `GET /admin/tenants/:id` request, full data renders. Reload — expected: identical result.
- **Assertions:** Request count is exactly 1 for a valid id (contrast with the invalid-id case in 17.1, which fires twice).

### Scenario 14.1 — Listing table matches the underlying API response
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/tenants?page=1&limit=20`; cross-reference every visible row's Name/Email/Landlord/Property/Unit/Rent/Status against the response, including the nested `landlord.name`/`property.name` fields.
- **Assertions:** Rent formatting matches `$` + thousands-separated `rentAmount`; Status matches exactly (title-cased in some UI contexts — Generator to confirm exact casing live, e.g. whether the table shows "Active" vs raw "ACTIVE").

### Scenario 14.2 — Details page matches the underlying API response
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/tenants/:id` for a fully-populated tenant; cross-reference all Tenant Information, Profile, Documents, and Pets content.
- **Assertions:** Documents' filenames match `frontFileName`/`backFileName`/`fileName` exactly (including any URL-encoded characters present in the raw filename, e.g. `%20`); SSN is confirmed absent from rendered output despite being present in the API response (see note above).

### Scenario 15.1 — Desktop layout (1280px): known header-overflow bug on the listing page
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Load `/tenants` at 1280×800.
- **Assertions:** Assert the **correct** expected behaviour (no real page-level overflow, beyond the standard ~20-30px vertical-scrollbar tolerance) and leave it failing intentionally. Confirmed live: the header's right-aligned "Admin" block is wider than the viewport at this width (measured ~1341px header edge vs. 1280px window), pushing the whole page ~60px past its edge. The same shared header causes a smaller (~27px, previously within tolerance) version of this on Landlords — see `Bugs/Tenants/tenants-desktop-header-overflows-viewport.md`. The details page does not reproduce this (passes cleanly).

### Scenario 15.2 — Tablet layout (768px): known whole-page horizontal scroll bug
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024, load `/tenants` and a details page.
- **Assertions:** Assert the **correct** expected behaviour (no real page-level overflow) and leave it failing intentionally — confirmed live to reproduce the same `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` gap on both pages here.

### Scenario 15.3 — Mobile layout (390px): sidebar collapses, table's own scroll handles overflow
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 390×844.
- **Assertions:** No real page-level overflow; sidebar nav link is not visible (fully collapsed); Name column fully visible, other columns require scrolling within the table.

### Scenario 16.1 — Keyboard tab order on the listing page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Tab from the search box through the status filter, a row's View/Suspend buttons, and pagination controls.
- **Assertions:** Each stop is reachable via Tab and activatable via Enter/Space; no dialogs exist to trap focus in this flow (per 7.1's confirmed no-dialog gap).

### Scenario 16.2 — Table semantics
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Inspect accessibility roles for the listing table and confirm proper `table`/`row`/`columnheader`/`cell` roles (plain HTML `<table>`, confirmed live — no extra ARIA needed).
- **Assertions:** Screen-reader-relevant roles present.

### Scenario 17.1 — Non-existent tenant id (known bug, shared root cause with Landlords)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate to `/tenants/<non-existent well-formed id>` — expected (current behaviour): "Loading" for several seconds, exactly **two** `GET /admin/tenants/:id` requests, then generic "Something went wrong" + "Retry" (not a "not found" message).
- **Assertions:** Write asserting the **correct** behaviour (one request, clear "not found" message) and leave failing intentionally, consistent with how the equivalent Landlords scenario was finally handled in this project.

### Scenario 17.2 — Empty Documents and Pets sections
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open "Anus Tenant" — confirm both empty states render correctly together on one page load.
- **Assertions:** "—" for both document sub-sections; "No pets on file" for Pets; no console errors from rendering these empty states.

### Scenario 17.3 — Unauthenticated access redirects to sign-in
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From a logged-out session, attempt to load `/tenants` and `/tenants/:id` directly.
- **Assertions:** Both redirect to sign-in; no tenant PII briefly visible before the redirect.

### Scenario 18.1 — Console and network hygiene across the module
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Exercise listing load, search, status filter, pagination, view, and Documents preview together while monitoring console/network.
- **Assertions:** No console errors anywhere. The Documents-dialog warning (see 11.2) is the **only** expected console output in the whole module — explicitly allow for it in this combined check rather than asserting zero warnings outright.

## Bug-Driven Regression Coverage

Two new bugs were found during this exploration and have full write-ups under `Bugs/Tenants/`. Three further known gaps reproduce identically here from shared Landlords root causes and were **not** re-filed as separate bug reports — they're referenced inline above instead. A third, benign console warning (a missing dialog description on the document preview) was investigated and determined **not** to be a bug — it does not appear in this list. Per the project's established convention for this kind of gap (see `tests/Dashboard/dashboard-sign-out.spec.js`), the corresponding tests should assert the **correct** expected behaviour and be left intentionally failing until fixed, not assert the current buggy behaviour as fact:

1. `tenants-suspend-does-not-update-or-allow-unsuspend.md` — **new, Tenants-specific, most severe functional gap.** Suspend succeeds on the backend and shows a correct success toast, but the row's Status/button never update (even after reload) and there's no way to reverse it (covered by 7.2/7.3).
2. `tenants-record-linked-to-admin-account.md` — **new, Tenants-specific, data-integrity only.** A tenant record's `user` field points at the live admin's own account. To be clear, the error handling for this case works correctly (backend refuses it, a clear error toast is shown, no lockout) — the only real defect is that this link could exist at all (covered by 7.4).
3. `tenants-desktop-header-overflows-viewport.md` — **new, from a shared header component, more visible here than on Landlords.** At exactly 1280px wide, the header's "Admin" block is wider than the viewport, causing a ~60px page-level horizontal scroll on the listing page (covered by 15.1).
4. `Bugs/Landlords/landlords-suspend-no-confirmation.md` — reproduces identically: no confirmation dialog before Suspend (covered by 7.1).
5. `Bugs/Landlords/landlords-details-invalid-id-generic-error.md` — reproduces identically: non-existent id → duplicate fetch + generic error instead of "not found" (covered by 17.1).
6. `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` — reproduces identically: whole page scrolls horizontally at 768px on both listing and details pages (covered by 15.2).

## Not covered (and why)

- **API automation** — the tenants/status-filter/details/suspend APIs are referenced only to justify UI assertions; no direct API test suite is included here.
- **Deep exploration of Landlords/Properties as referenced from a tenant record** — the nested `landlord`/`property` data is validated only as it appears on the tenant list/details screens; their own dedicated pages are out of scope for this plan (see `specs/landlords-management.md` for Landlords).
- **Cross-browser matrix (Firefox/Safari)** — `playwright.config.js` only enables the `chromium` project; not written as separate scenarios until those projects are enabled.
- **Status-filtered pagination with a genuinely multi-page filtered result** — no current filter combination spans more than one page in the live dataset (see 5.2); flagged as untestable against real data until the dataset changes, or requires a mocked response.
- **A confirmation-dialog test suite for Suspend/Unsuspend** — deliberately omitted, since no such dialog exists (same gap as Landlords). Do not write these tests until the bug is fixed.
- **An "Unsuspend from the listing" happy-path test** — deliberately omitted; no such reachable UI path currently exists for Tenants (see 7.3). Only the direct-API-restore cleanup mechanism is covered.

# Test Plan: Properties Management

**Target:** https://admin.six-property.clienturl.net/properties (listing) and https://admin.six-property.clienturl.net/properties/:id (details)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-04

## Overview

This plan covers the admin Properties module end-to-end: the listing page (table, search, pagination), the property details page (header, summary cards, Property Information section, Tenants sub-table), navigation and direct-URL behaviour, responsive layout, and error/empty/loading states. `GET /admin/properties?page=1&limit=20`, `GET /admin/properties?page=1&limit=20&search=<value>`, and `GET /admin/properties/:id` are used **only** to justify frontend assertions (e.g. table values match the API response) — none of them are automated directly. Unlike Landlords and Tenants, this module has **no mutating actions at all** (no Suspend/Unsuspend, no Edit, no Delete) — the Actions column renders exactly one "View" button per row — so this plan is read-only by nature and carries none of the "restore state after mutating" cleanup concerns those other plans require.

**Methodology note:** This plan was authored from a live, authenticated browser session against staging (logged in via `tests/data/credentials.json`), using accessibility snapshots, a full-page screenshot, and network/console inspection. Per the Planner agent's read-only toolset for this session (`browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_console_messages`, `browser_network_requests`, `browser_wait_for`, `browser_press_key`, `browser_hover`, `browser_tabs` — no click, no fill-form, and **no viewport resize tool**), all interaction was done via keyboard only (Tab/Shift+Tab to focus, character keys to type into the search box, Enter to activate buttons/links). This worked reliably for the listing, search, and details flows, all confirmed live below. It does **not** allow independent confirmation of responsive/viewport-width behaviour this session — Feature Area 7 is therefore written by documented inference from the Landlords/Tenants plans' confirmed findings (same shared Sidebar/AdminLayout/table components), explicitly flagged as such; the Generator must independently re-verify with real resize before relying on it. One methodology incident worth noting: blind Tab-chaining to reach a row's "View" button once landed on "Sign Out" instead and logged the session out; it was recovered by signing back in through the standard form. This is not a bug — Sign Out is supposed to sign out — but it means Generator-written tests should use deterministic locators (`getByRole('button', { name: 'View' })` scoped to a specific row) rather than blind Tab-counting, which is exactly what the project's locator-priority rules in `AGENTS.md` already mandate.

**Confirmed live structure (for the Generator's reference):**
- Listing page heading is "Manage Properties" (h3) with subtitle "Review and manage listed properties."
- Table columns, in order: **Property, Address, Landlord, Unit, Tenants, Actions** (6 columns). Unlike Landlords/Tenants, there is **no Status column** — properties don't have a suspend/active state. Column headers are plain text, not sortable (no button/aria-sort observed).
- The Property column shows a small coloured dot (avatar-style status/category indicator, exact meaning not surfaced in the UI text) followed by the property name, e.g. "● Grove", "● Green Valley Residences". Confirmed via the live DOM: this is plain `<td><span><span class="dot"/>NameText</span></td>` markup with no `aria-hidden`/`sr-only` tricks, so the name is normally accessible — an earlier draft of this plan flagged a false-positive "empty accessible name" finding here based on a targeted-snapshot tool quirk, not an actual DOM issue; retracted after checking the live HTML.
- Actions column always renders exactly one button: "View". There is no Suspend/Unsuspend/Edit/Delete anywhere in this module.
- Search box placeholder: "Search by name or address". It is **server-side**, same pattern as Landlords/Tenants: `GET /admin/properties?page=1&limit=20&search=<value>`. **Confirmed live: it fires on every keystroke with no visible debounce** — typing "Grove" then backspacing it out one character at a time produced five distinct network requests (`search=Grove`, `search=Grov`, `search=Gro`, `search=G`, then the unfiltered request with no `search` param), each returning before the next keystroke in this manual test. A "Reset" button appears next to the search box only while it has a non-empty value; **clearing the box back to empty via Backspace (without clicking Reset) also correctly restores the full unfiltered list** — Reset is a convenience, not the only way to clear.
- Zero-result state: heading "No data found", text "There is no data to display at the moment." — confirmed live via a guaranteed-no-match search (same generic copy pattern as Landlords/Tenants; does not reference the search term).
- Pagination controls: "Previous" / "Page X of Y" / "Next", plus a "Showing A–B of N" label — same shape as Landlords/Tenants. **Confirmed live dataset at plan time: exactly 20 properties, all on a single page ("Page 1 of 1", both Previous and Next disabled).** This differs from Landlords (86/5 pages) and Tenants (29/2 pages) — multi-page Next/Previous/First/Last behaviour **cannot be exercised against real data at plan time**; the Generator must re-check the current total before writing those scenarios as anything but known-untestable-against-current-data, or use a mocked/intercepted response to force a second page.
- View button navigates to `/properties/:id` (client-side route change, same tab). Confirmed live: clicking "Grove"'s View button navigated to `/properties/6a675f0cb50e8fe7db1f0ea6`.
- **Exactly one `GET /admin/properties/:id` request fires for a valid id** (confirmed live, single network entry).
- Details page header: a rounded-square coloured avatar/icon block (no letter/initial inside, unlike Landlords/Tenants' circular initials), property name (h3), subtitle = the property's full address (not a generic "Property Details" caption), and a "Back" button top-right. There is no status badge anywhere on this page (properties have no status).
- Summary cards: **"Tenants"** and **"Open Requests"**, each showing a single integer count. This is a different card pair than Landlords ("Properties"/"Tenants") — Open Requests presumably reflects open maintenance requests for that property, out of scope to explore further per this plan's "Do not cover" instruction.
- Property Information fields, in order: **Landlord, Landlord Email, Address, Unit, Created, Details** (6 term/definition pairs). "Details" is a free-text field (confirmed live value: "2 Unit: Up and Down Delapadated Garage") — treat it as unstructured text, not a fixed enum.
- Tenants sub-table columns: **Name, Email, Phone, Unit, Rent, Status** (6 columns) — same shape as the Tenants table nested in a Landlord's details page, but without a "Property" column (redundant here, since the whole page is already scoped to one property). Rent is formatted with a `$` prefix (confirmed live: `$800`). Headers are not sortable.
- **The non-existent/invalid-id bug reproduces identically to Landlords and Tenants** (confirmed live twice: once with a well-formed-but-nonexistent ObjectId `000000000000000000000000`, once with a syntactically invalid id `not-a-valid-id` — both produced the exact same behaviour, so there is no separate 400-style path for malformed ids). **Two duplicate `GET /admin/properties/:id` requests fire**, both returning HTTP 200, and the page renders a generic error: heading "Something went wrong", text "We encountered an error. Please try again.", and a "Retry" button — not a "Property not found" message. Same root cause as `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`; not re-filed as a separate Properties bug, per the project's established convention (see the Tenants plan doing the same for its identical reproduction).
- The in-app "Back" button (top-right of the details header) reliably returns to `/properties` — confirmed live via keyboard (Tab to focus it immediately after a fresh SPA navigation to the details page, then Enter).
- Direct deep-link navigation to a valid `/properties/:id` URL (not via the listing) renders correctly with exactly one API request, same as clicking through.
- No console errors or warnings were observed during listing load, search (typing, clearing, no-match), details view, or the invalid-id error flow.
- **Data-quality observations from the live dataset** (documented as available test fixtures, not asserted as bugs — the UI simply renders whatever the backend returns verbatim, with no client-side normalization):
  - Duplicate property names exist across different ids/addresses: "The Marlowe" appears 4 times, "Fortune Tower" appears twice, and "Apex Heights"/"Apex Height" appear as a near-duplicate pair (trailing "s" typo) under landlord rows for "Anus"/"Anus Ahmed".
  - Missing Unit renders as an em dash "—" (e.g. "Fortune Heights", "Ali Residency", "Dilkusha Forums", "Marlowe", "Light House" rows).
  - Zero-tenant rows render cleanly as "0" (e.g. "Green Valley Residences", "The Marlowwe" [note: raw data has a 3-w typo]).
  - Address formats vary widely and are not normalized: full street addresses, city+zip only ("California, 0988331"), a bare city name ("California"), and comma-fragment values ("shop, 275") all appear as real data — do not assert a fixed address format.
  - A long address example: "H No. 12, Block B, Clifton Karachi" (Sunset Residency).
  - Raw data contains visible typos ("Califronia", "Brrokelyn"/"Brroklyn", "Marlowwe") — useful, already-present fixtures for "messy/unusual text" scenarios without needing to fabricate test data.
  - Landlord name spelling is inconsistent across rows for what appears to be the same person ("Anus" vs "Anus Ahmed") — this is a data-entry/backend concern, not a UI bug; the UI just renders `landlord.name` as given.
- **The desktop (1280px) header-overflow bug documented for Tenants (`Bugs/Tenants/tenants-desktop-header-overflows-viewport.md`) uses a shared header component and likely reproduces here too** — not independently re-verified this session (no resize tool available to this planner invocation). Flagged for the Generator to confirm quickly, same as it did for Tenants.

## Preconditions

- Staging environment is reachable at the URLs above.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- The Properties list contains at least one populated property (Tenants > 0) and at least one with 0 tenants, for populated- vs. empty-state assertions. At plan time: "Grove" (307 Grove Street Honesdale, PA 18431, id `6a675f0cb50e8fe7db1f0ea6`, landlord "Jeremy" / `nostaw22@gmail.com`) has 1 tenant (Jeremy / `jwatson@thesixpm.com` / `5703525162` / Unit `1-2` / `$800` / Active). "Green Valley Residences" (789 Oak Avenue, Austin, TX, landlord "Maaz Landlord", Unit "Shop 12") has 0 tenants — the Generator should re-verify these still exist and fetch Green Valley Residences' id before writing the zero-tenant details-page scenario, since this plan did not independently open its details page (only the listing row was confirmed).
- **`nostaw22@gmail.com` / "Jeremy" is a real client landlord/tenant identity** (same person referenced in the Landlords and Tenants plans), not a disposable test account — fine to use for read-only checks (viewing, search, data-consistency) since this module has no mutating actions at all, but do not treat it as a throwaway fixture in any future module that does mutate.
- The dataset has exactly 20 properties across a single page at plan time ("Page 1 of 1"). Any scenario exercising real multi-page pagination requires either fresh data growth past 20 or a mocked/intercepted API response — the Generator must confirm current totals before writing Next/Previous assertions as anything but the single-page case documented here.
- Each scenario starts from a clean, authenticated session unless explicitly testing unauthenticated/expired-session behaviour.
- Prefer `getByRole` locators scoped to a specific row (e.g. by row text) over blind keyboard Tab-counting to reach a "View" button — Tab order was observed to vary between page loads during this session's exploration and once caused an accidental Sign Out.

## Scenarios

### Feature Area 1 — Page Load

#### Scenario 1.1 — Listing page loads cleanly with all primary elements
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/properties` — expected: page loads without redirect.
  2. Observe console during/after load — expected: no uncaught errors.
  3. Observe network — expected: `GET /admin/properties?page=1&limit=20` returns 200; no other failed requests.
- **Assertions:**
  - Heading "Manage Properties" and subtitle "Review and manage listed properties." are visible.
  - Search box (placeholder "Search by name or address"), table with all 6 column headers (Property, Address, Landlord, Unit, Tenants, Actions), and pagination controls are visible.
  - Sidebar shows "Properties" as the active/highlighted nav item.
  - Sidebar bottom section shows "Admin {email}" link and "Sign Out" button; header shows a second avatar block ("A" / "Admin" / "admin").
- **Edge cases considered:** slow network (loading state visible: heading "Loading" / "Please wait while we load your data..." confirmed live immediately after navigation, before data resolves), reload mid-load, cold vs. cached load.

#### Scenario 1.2 — Search input and table render before/after data resolves
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Fresh navigation to `/properties`.
- **Steps:**
  1. Immediately after navigation, snapshot the page — expected: heading/subtitle/search box are already visible; the table area shows a "Loading" / "Please wait while we load your data..." placeholder instead of rows.
  2. Wait for the list request to resolve — expected: the loading placeholder is replaced by the table and pagination footer.
- **Assertions:** No layout shift causes the search box or heading to jump/disappear during the loading→loaded transition.
- **Edge cases considered:** very slow API response (see Feature Area 8).

#### Scenario 1.3 — Sidebar navigation and profile remain functional from this page
- **Priority:** P1
- **Tags:** @regression
- **Steps:**
  1. From `/properties`, use the sidebar to navigate to "Landlords", then back to "Properties" — expected: each click performs a clean client-side route change.
  2. Confirm the "Admin {email}" profile link and "Sign Out" button remain visible and correctly labelled throughout.
- **Assertions:** URL and active-nav-item highlighting update correctly on each navigation; no console errors during the round trip.
- **Edge cases considered:** navigating away mid-load (before the properties list request resolves).

### Feature Area 2 — Properties List

#### Scenario 2.1 — Table row count and column data match the API response
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded on page 1.
- **Steps:**
  1. Capture the `GET /admin/properties?page=1&limit=20` response.
  2. Cross-reference each visible row against the corresponding API item (matched by whatever unique id the API exposes, e.g. `_id`).
- **Assertions:**
  - Number of rendered rows equals the API response's item count for the page (do not hardcode "20" — read it from the response).
  - Property name text matches the API's name field for that row.
  - Address, Landlord name, Unit, and Tenants count each match their corresponding API fields exactly.
  - "Showing 1–N of N" matches the API's total count field, not a hardcoded number.
- **Edge cases considered:** a property created/updated between the API call and the UI render (race condition, rare — flag as untested rather than simulated).

#### Scenario 2.2 — Every column renders sensibly for a populated row
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Listing loaded; "Grove" row present.
- **Steps:**
  1. Inspect the "Grove" row — expected: Property name with a leading coloured dot, full street address, Landlord name ("Jeremy"), Unit ("1-2"), Tenants count ("1"), and a single "View" button in Actions.
- **Assertions:**
  - Row has exactly 6 cells matching the header order.
  - Tenants count is rendered as a plain integer, not a badge or link.
  - The View button's accessible role is `button` with name "View" (not a link masquerading as a button).
- **Edge cases considered:** a row where the Unit is a bare number vs. a compound string like "1-2" or "Shop 12" (both observed live) — no fixed Unit format should be assumed.

#### Scenario 2.3 — Missing Unit and zero-tenant rows render correctly
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Listing loaded; at least one row with Unit "—" and one with Tenants "0" (both present live, e.g. "Fortune Heights" / "Green Valley Residences").
- **Steps:**
  1. Inspect a row whose Unit is missing — expected: renders as an em dash "—", not blank/null/undefined text.
  2. Inspect a row with 0 tenants — expected: renders as "0", not blank or "N/A".
- **Assertions:** Neither missing-Unit nor zero-Tenants rows break row layout or push other cells out of alignment.
- **Edge cases considered:** a row missing both Unit and having 0 tenants simultaneously (observed live, e.g. several "Anus"-landlord rows).

#### Scenario 2.4 — Duplicate property names are each independently viewable
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Listing loaded; "The Marlowe" appears on 4 distinct rows at plan time (different addresses/landlords/ids).
- **Steps:**
  1. Identify all rows named "The Marlowe" — expected: each has a distinct Address/Landlord/Unit combination.
  2. Click View on two different "The Marlowe" rows in turn — expected: each navigates to a different `/properties/:id` URL, and each details page shows the address matching the row that was clicked (not always the same/first match).
- **Assertions:** The two details pages' addresses differ and each matches its originating row — proves the app disambiguates by id, not by name.
- **Edge cases considered:** near-duplicate names differing only by a typo/pluralization ("Apex Heights" vs "Apex Height") should be treated as fully distinct properties, not deduplicated or merged in the UI.

#### Scenario 2.5 — Long address and unusual address formats do not break the layout
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Listing loaded; "Sunset Residency" (long address "H No. 12, Block B, Clifton Karachi") and a bare-city address (e.g. "California") both present.
- **Steps:**
  1. Inspect both rows — expected: the long address either wraps or is contained within its cell without overflowing into neighbouring columns; the short/bare address renders with no visual gap or placeholder text implying missing data.
- **Assertions:** No column's text visually overlaps an adjacent column's content at default (desktop) width.
- **Edge cases considered:** an even longer synthetic address (100+ characters) — not present in live data; Generator should consider a mocked-response test for a true stress case since none exists in the real dataset.

### Feature Area 3 — Search

#### Scenario 3.1 — Search by exact property name matches the API and filters correctly
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded; "Grove" exists.
- **Steps:**
  1. Type "Grove" into the search box — expected: `GET .../properties?page=1&limit=20&search=Grove` fires (confirmed live); table shows exactly the "Grove" row.
- **Assertions:**
  - "Showing 1–1 of 1" is shown, not the full unfiltered total.
  - A "Reset" button appears next to the search box while the value is non-empty.
  - Pagination collapses to "Page 1 of 1" with both Previous/Next disabled for the single-result filtered set.
- **Edge cases considered:** searching a term matching more than 20 results (pagination within a filtered set) — not exercisable against the current 20-item dataset; flag as untested.

#### Scenario 3.2 — Partial and address-based search match correctly
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Search a partial name fragment (e.g. "Gro") — expected: same "Grove" row still matches via substring.
  2. Clear and search a fragment of an address instead of a name (e.g. "Honesdale") — expected: the same or a different matching row(s) returned, confirming the search field covers both name and address per the placeholder text "Search by name or address".
- **Assertions:** Every visible row's Property name or Address contains the search substring.
- **Edge cases considered:** a search term that matches on Address but not Name, and vice versa — both should return results, since the field explicitly searches both.

#### Scenario 3.3 — Search is case-insensitive but does NOT tolerate whitespace (confirmed bug, unlike Landlords/Tenants)
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Confirmed live during the Generator pass, isolated into two separate checks: (a) search "GROVE" (wrong case, no padding) — matches "Grove" correctly; (b) search "  Grove" (correct case, with padding) — returns **zero results**, "No data found".
- **Assertions:** Case-insensitivity works correctly on its own. Whitespace-trimming does **not** — this is a confirmed, real defect, unlike Landlords/Tenants (which trim and lower-case server-side). See `Bugs/Properties/properties-search-does-not-trim-whitespace.md`. Write this as a known-issue test asserting the **correct** expected behaviour (padded terms still match) and leave it intentionally failing until fixed, per the project's known-issue convention — do not assert the current (buggy) zero-result behaviour as fact.
- **Edge cases considered:** the original plan draft guessed this would simply match Landlords/Tenants by analogy; live testing during test generation proved that guess wrong for the whitespace half specifically.

#### Scenario 3.4 — Search handles numeric values and special/script-like characters safely
- **Priority:** P1
- **Tags:** @regression
- **Steps:**
  1. Search a numeric fragment from an address (e.g. "307") — expected: matches by substring against the Address field.
  2. Search `<script>alert(1)</script>` — expected: treated as literal inert text, zero results, no script execution, no console error (by analogy with the confirmed-safe Landlords behaviour for the same shared search input).
- **Assertions:** No `dialog`/`alert` event fires from the script-injection attempt; the "No data found" empty state renders for the script string.
- **Edge cases considered:** SQL/NoSQL-injection-style strings (e.g. `{"$ne": null}`); extremely long search strings (500+ chars) — neither independently tested live this session.

#### Scenario 3.5 — No-results state
- **Priority:** P1
- **Tags:** @regression @critical
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Search a string guaranteed not to match any property (confirmed live with a random string) — expected: table area is replaced with an empty state.
- **Assertions:**
  - Heading "No data found" and text "There is no data to display at the moment." are shown (confirmed live verbatim; message does not reference the search term).
  - Pagination controls are hidden or show no meaningful "Showing X–Y of 0".
- **Edge cases considered:** transitioning from a no-results state back to a valid search without a full reload (confirmed live: backspacing the no-match term back down correctly re-triggers new requests and eventually restores the full list).

#### Scenario 3.6 — Clearing the search box (via Backspace or Reset) restores the full list
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** An active search with a non-empty value.
- **Steps:**
  1. Clear the search box character-by-character via Backspace (without clicking Reset) — expected (confirmed live): once empty, a fresh unfiltered `GET .../properties?page=1&limit=20` fires automatically and the full list returns.
  2. Separately, with a search term active, click "Reset" — expected: search box clears and the full unfiltered page-1 list returns in one step.
- **Assertions:** Both paths converge on the same fully-restored state (same row count, same "Showing 1–20 of 20" or current total, Reset button no longer visible).
- **Edge cases considered:** rapid backspacing (fast typing/deleting) — confirmed live that each intermediate keystroke fired its own request without visible debounce; no stale/out-of-order response was observed to win over a later one in this manual test, but the Generator should verify request-ordering robustness isn't a race condition under automated (faster) input.

#### Scenario 3.7 — Search persists only within the session, not across reload
- **Priority:** P2
- **Tags:** @regression
- **Steps:** With a search term active, reload the page — expected (by analogy with Landlords/Tenants, which share this search component): search box is empty and the full unfiltered page-1 list is shown after reload; URL carries no search query parameter at any point.
- **Assertions:** No search-related query parameter ever appears in the browser URL during search, matching the confirmed Landlords/Tenants pattern.
- **Edge cases considered:** not independently re-tested live for Properties this session (reload-clears-search specifically) — inferred from the identical shared component; Generator should confirm.

### Feature Area 4 — Property Details

#### Scenario 4.1 — View navigates to the correct property's details page
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded.
- **Steps:**
  1. Note the name/address/id of a specific row (e.g. "Grove").
  2. Click that row's "View" button — expected: client-side navigation to `/properties/<that property's id>` (confirmed live: `/properties/6a675f0cb50e8fe7db1f0ea6` for "Grove").
- **Assertions:**
  - URL path segment after `/properties/` matches the id backing that row (cross-referenced via the listing API response).
  - Details page heading shows the same property name as the row that was clicked; subtitle shows the same address.
- **Edge cases considered:** clicking View on a duplicate-named row (e.g. one of the 4 "The Marlowe" rows) — must land on the id-correct details page, not always the same one (see Scenario 2.4).

#### Scenario 4.2 — Header renders name, address, and Back button correctly
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Open "Grove"'s details page.
- **Assertions:**
  - Heading (h3) reads "Grove"; the line beneath it reads the full address "307 Grove Street Honesdale, PA 18431" (confirmed live) — not a generic "Property Details" caption.
  - A rounded-square coloured icon/avatar block appears to the left of the heading.
  - A "Back" button is visible at the top-right of the header row.
- **Edge cases considered:** a property with a very long name or address in this header position — not present in live data; flag as a mocked-response test if a true stress case is needed.

#### Scenario 4.3 — Summary cards show correct Tenants and Open Requests counts
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Grove"'s details page; cross-reference against `GET /admin/properties/:id`.
- **Assertions:**
  - "Tenants" card shows "1" (confirmed live), matching the API's tenant count/array length for this property.
  - "Open Requests" card shows "0" (confirmed live), matching the API's corresponding field — do not hardcode this number; read it from the response for whichever property is under test.
- **Edge cases considered:** a property with 0 tenants (e.g. "Green Valley Residences") — Generator should confirm its details page renders "0" cleanly in the Tenants card, consistent with the listing row.

#### Scenario 4.4 — Property Information section matches the API for every field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Grove"'s details page; cross-reference all 6 fields against the API response.
- **Assertions:**
  - Landlord ("Jeremy"), Landlord Email (`nostaw22@gmail.com`), Address, Unit ("1-2"), Created (formatted date, e.g. "Jul 27, 2026"), and Details (free-text, confirmed live: "2 Unit: Up and Down Delapadated Garage") each match their corresponding API fields exactly.
  - Landlord/Landlord Email reflect the *nested* landlord object on the property record, not a flat top-level field (mirrors the Landlord-nesting pattern already confirmed on the Tenants details page).
- **Edge cases considered:** a property whose "Details" free-text field is empty/absent — not observed live; Generator should check whether it renders "—" or is omitted entirely, consistent with the "—" convention used elsewhere in this app for missing values.

#### Scenario 4.5 — Tenants sub-table matches the API and renders correctly for 1+ tenants
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Open "Grove"'s details page; cross-reference the Tenants table against the API's nested tenants array.
- **Assertions:**
  - Columns, in order: Name, Email, Phone, Unit, Rent, Status (6 columns; confirmed live — no "Property" column here, unlike the equivalent sub-table on a Landlord's details page, since the page is already scoped to one property).
  - Rent is formatted with a `$` prefix (confirmed live: "$800") matching the API's rent amount field.
  - Status badge text matches the tenant's actual status (confirmed live: "Active").
- **Edge cases considered:** a property with multiple tenants (row count > 1) — not present in the specific property explored live; Generator should locate one from the dataset (several rows show Tenants count 2–4) to confirm multi-row rendering.

#### Scenario 4.6 — Empty Tenants sub-table for a zero-tenant property
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A property with 0 tenants on the listing (e.g. "Green Valley Residences").
- **Steps:** Open its details page — expected (by analogy with the confirmed "No tenants found" / generic-subtext empty state used elsewhere in this app for equivalent sub-tables): the Tenants section renders an empty state rather than a table with no rows.
- **Assertions:** The "Tenants" summary card at the top of the page shows "0", consistent with the empty section below.
- **Edge cases considered:** this specific empty-state rendering was **not independently opened live this session** (only the zero-tenant listing row was confirmed) — Generator must confirm the exact empty-state copy before asserting it verbatim, since it may differ slightly from the Landlords/Tenants wording.

#### Scenario 4.7 — Exactly one details request fires for a valid id
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Open a valid property's details page (via View or direct URL) and inspect the network log.
- **Assertions:** Exactly one `GET /admin/properties/:id` request fires (confirmed live) — contrast with the invalid-id case (Feature Area 8), which fires twice.

### Feature Area 5 — Back Navigation

#### Scenario 5.1 — In-app "Back" button returns to the listing
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** On a details page.
- **Steps:** Click the "Back" button in the details header — expected (confirmed live): navigates to `/properties`.
- **Assertions:** URL is exactly `/properties` after clicking Back; no console errors during the transition.
- **Edge cases considered:** Back clicked while a details-page request is still loading.

#### Scenario 5.2 — Browser Back and Forward between listing and details
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On the details page after clicking View from the listing.
- **Steps:**
  1. Use the browser's native Back button — expected: returns to `/properties`.
  2. Use the browser's native Forward button — expected: returns to the same details page, fully re-rendered (not blank/stuck).
- **Assertions:** No console errors during either transition; Forward re-fetches or restores the same property's data correctly.
- **Edge cases considered:** whether browser Back restores prior search/pagination state on the listing versus the in-app Back button always landing on the default unfiltered page-1 view (confirmed pattern on Landlords was that the in-app button always resets; whether the *browser's* native Back differs by restoring scroll/history state was left unconfirmed there too — same open question applies here).

#### Scenario 5.3 — Search state after returning to the listing
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** A search was active before navigating to a details page.
- **Steps:**
  1. Search for a property, click View on the matching row, then use the in-app "Back" button — expected: returns to `/properties` with the search box empty and the full unfiltered list shown (consistent with the confirmed "search does not persist across navigation/reload" pattern).
- **Assertions:** Search box value is empty and "Showing 1–20 of 20" (or current total) is shown, not the prior filtered count.
- **Edge cases considered:** whether browser Back (as opposed to the in-app Back button) behaves differently here — not independently tested; flag as open, same as 5.2.

#### Scenario 5.4 — Scroll position after returning
- **Priority:** P3
- **Tags:** @regression
- **Preconditions:** Scrolled partway down a long listing (not reachable at plan time with only 20 rows fitting on one page without scrolling at typical desktop height) or a details page with enough content to scroll.
- **Steps:** Scroll down, navigate away via View/Back, then return.
- **Assertions:** Document whatever the actual current behaviour is (scroll position reset vs. preserved) — not confirmed live this session since the 20-row dataset did not require scrolling at the viewport size used for exploration.
- **Edge cases considered:** none beyond noting this is currently unverified.

### Feature Area 6 — Pagination

#### Scenario 6.1 — Single-page dataset shows correct, fully-disabled pagination
- **Priority:** P0
- **Tags:** @smoke @critical
- **Preconditions:** Listing loaded, unfiltered.
- **Steps:** Observe the pagination footer — expected (confirmed live, current dataset of exactly 20 properties): "Showing 1–20 of 20", "Page 1 of 1", both "Previous" and "Next" disabled.
- **Assertions:** Neither Previous nor Next is clickable/enabled; no page-2 request is ever fired from this state.
- **Edge cases considered:** this is the **only** pagination state exercisable against live data at plan time — see the Preconditions note about the dataset's current size.

#### Scenario 6.2 — Multi-page navigation (Next/Previous/First/Last) — requires data growth or mocking
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A dataset spanning 2+ pages — **not available at plan time** (exactly 20 properties = exactly 1 page of 20).
- **Steps:** Not exercised live. Document expected behaviour by analogy with the confirmed Landlords/Tenants pagination pattern: clicking "Next" should fetch `page=2` and update rows/indicator; "Previous" should return to `page=1`; row data should differ between pages; a partially-filled last page should show its true remaining count.
- **Assertions:** To be confirmed once real data supports it, or via a mocked/intercepted two-page response.
- **Edge cases considered:** a dataset whose last page is not fully populated (e.g. 21 items → page 2 has only 1 row).

#### Scenario 6.3 — Search resets pagination to page 1 (once multi-page data exists)
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Same multi-page-data caveat as 6.2.
- **Steps:** From page 2+, perform a search — expected (by analogy with the confirmed Landlords/Tenants behaviour): the resulting request always carries `page=1`, regardless of which page search was triggered from.
- **Assertions:** Not exercisable against the current single-page dataset; flag as untestable until data grows or a mock is used.

#### Scenario 6.4 — Page number does not persist across reload
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Same multi-page-data caveat as 6.2.
- **Steps:** Navigate to page 2+, then reload — expected (by analogy): resets to page 1.
- **Assertions:** Not exercisable against the current single-page dataset; flag as untestable until data grows or a mock is used.

### Feature Area 7 — Responsive Behaviour

> **Update from the Generator pass (2026-08-04):** the Generator's toolset included a real viewport-resize tool, so all three widths below were independently re-verified live via `document.documentElement.scrollWidth`/`clientWidth` measurements (see `tests/Properties/properties-responsive.spec.js`) and superseded the Planner's original by-analogy guesses. One guess was **wrong** (7.1) and one was **partially wrong** (7.2, details page) — corrected in place below rather than left as speculation.

#### Scenario 7.1 — Desktop layout (1280px) — confirmed CLEAN, does not reproduce the Tenants header-overflow gap
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Load `/properties` at 1280×800, and a details page at the same width.
- **Assertions:** Confirmed live: `scrollWidth` equals `clientWidth` exactly (1280/1280) on both the listing and a details page, and the header's right edge lands exactly at the 1280px viewport edge — no overflow. Unlike `Bugs/Tenants/tenants-desktop-header-overflows-viewport.md` (~60px overflow) and Landlords (~27px), **this shared-header bug does not reproduce on Properties** at this width. The original plan's guess-by-analogy that it "likely reproduces" was incorrect — do not write this as a known-failing test; assert the clean (passing) behaviour instead.

#### Scenario 7.2 — Tablet layout (768px) — listing page reproduces the shared scroll gap; details page does NOT
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 768×1024, load `/properties` and a details page.
- **Assertions:** Confirmed live: the **listing** page reproduces `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`'s whole-page horizontal scroll exactly (`scrollWidth` 938px vs `clientWidth` 768px, ~170px overflow) — assert the correct expected behaviour (no overflow) and leave this one failing intentionally, per the known-issue convention. The **details** page, however, measured a clean 768/768 with zero overflow — this is a genuine difference from Landlords/Tenants, where the bug reproduces on *both* listing and details pages. Do not write the details-page case as a known-failing test; assert the clean (passing) behaviour there instead.

#### Scenario 7.3 — Mobile layout (390px) — confirmed CLEAN, sidebar collapse, no page-level overflow
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Resize to 390×844, load `/properties`.
- **Assertions:** Confirmed live: `scrollWidth` equals `clientWidth` exactly (390/390), no page-level overflow. The "Properties" sidebar nav link is not visible (fully collapsed, not an icon rail), consistent with the confirmed Landlords/Tenants pattern.
- **Edge cases considered:** landscape mobile orientation (844×390) — not tested this session on any module.

#### Scenario 7.4 — Details page responsive behaviour
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Load a details page at desktop (1280px) and tablet (768px) widths.
- **Assertions:** Confirmed live at both widths: `scrollWidth` equals `clientWidth` exactly — **no overflow at either width on the details page**, correcting the original guess-by-analogy that the tablet-width scroll gap (7.2) would reproduce here. It does not: the gap is confirmed listing-page-only for Properties, unlike Landlords/Tenants where it reproduces on both pages.

### Feature Area 8 — Loading / Empty / Error States

#### Scenario 8.1 — Initial loading state
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Navigate to `/properties` and snapshot immediately before the list request resolves — expected (confirmed live): heading "Loading", text "Please wait while we load your data...", in place of the table.
- **Assertions:** The loading state disappears and is replaced by real content once the API responds; it never gets stuck.

#### Scenario 8.2 — Search-triggered loading state
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Type into the search box and observe whether a loading indicator appears between the request firing and its response landing.
- **Assertions:** Not independently confirmed live this session (responses returned fast enough in manual testing that no distinct loading UI was captured mid-search) — Generator should confirm whether a loading state exists for search specifically, or whether the table simply updates in place once data arrives.

#### Scenario 8.3 — Empty search result
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** Search a term guaranteed to match nothing.
- **Assertions:** "No data found" / "There is no data to display at the moment." renders (confirmed live verbatim); pagination hidden/disabled. Duplicate of 3.5, included here for Feature-Area-8 completeness per the prompt's structure.

#### Scenario 8.4 — No properties available at all (empty dataset)
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Not reproducible against the current live dataset (20 properties exist) — requires either a mocked empty API response or a genuinely empty environment.
- **Steps:** Load `/properties` when the backend returns zero properties — expected (by analogy with the confirmed no-search-results empty state, which is likely the same component): "No data found" / generic subtext, table area replaced entirely.
- **Assertions:** Not independently confirmed live; Generator should use a route-interception mock to force this state, since it does not occur naturally in the current dataset.

#### Scenario 8.5 — API failure on the listing
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Intercept `GET /admin/properties*` to return a 500 or network error.
- **Assertions:** The page shows an error state (not a silently-empty table or an infinite loading spinner) — exact copy/behaviour not confirmed live this session (no live 500 was observed; this requires route interception to test). Generator should confirm whether it matches the same "Something went wrong" + "Retry" pattern confirmed for the details page's invalid-id case, or differs.
- **Edge cases considered:** malformed/truncated JSON response; a request that times out rather than erroring immediately.

#### Scenario 8.6 — API failure on the details page (non-existent/invalid id) — confirmed bug pattern
- **Priority:** P1
- **Tags:** @regression @critical
- **Preconditions:** A syntactically valid but non-existent property id, or a malformed id string.
- **Steps:** Navigate directly to `/properties/<bad id>` — expected (current, confirmed-live behaviour, identical for both a well-formed-but-nonexistent id and a malformed one): heading "Something went wrong", text "We encountered an error. Please try again.", "Retry" button. **Two** `GET /admin/properties/:id` requests fire (not one), both returning HTTP 200.
- **Assertions:** Document the current behaviour as a known-issue regression test — assert the **correct** expected behaviour (single request, a clear "Property not found" message) and leave it intentionally failing until the shared root-cause bug (`Bugs/Landlords/landlords-details-invalid-id-generic-error.md`) is fixed, per the project's established convention.
- **Edge cases considered:** whether Retry re-fires the same duplicate-request pattern (by analogy with the confirmed Landlords behaviour, expected yes — not independently re-clicked live this session for Properties specifically).

#### Scenario 8.7 — Missing/null field values render as placeholders, not raw null/undefined
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Inspect rows/fields with missing data across both listing (Unit "—") and details (any absent Property Information field, if one exists in the dataset).
- **Assertions:** No cell or field ever renders the literal text "null", "undefined", or "NaN" — confirmed live for the Unit column (renders "—" cleanly); Generator should scan for a details-page example of a missing field to confirm the same convention holds there.

### Feature Area 9 — Data Consistency

#### Scenario 9.1 — Listing table matches the List API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/properties?page=1&limit=20`; cross-reference every visible row's Property/Address/Landlord/Unit/Tenants against the response.
- **Assertions:** Every field matches exactly (no hardcoded expected values — always compare against whatever the API actually returned at test time, per the prompt's explicit instruction).

#### Scenario 9.2 — Search results match the Search API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/properties?page=1&limit=20&search=<term>` for a real search term; cross-reference the filtered rows shown.
- **Assertions:** The set of rows shown exactly equals the set of items in the API response for that search — no extra rows, no missing rows.

#### Scenario 9.3 — Property Details page matches the Details API field-for-field
- **Priority:** P0
- **Tags:** @smoke @critical
- **Steps:** Capture `GET /admin/properties/:id`; cross-reference the header, both summary cards, all 6 Property Information fields, and the full Tenants sub-table (including per-tenant Rent/Status) against the response.
- **Assertions:** Every displayed value traces back to a specific API field, including nested landlord/tenant sub-objects; no field is derived from static/hardcoded UI text.

#### Scenario 9.4 — Tenant count on the listing matches the tenant array length on details
- **Priority:** P1
- **Tags:** @regression
- **Steps:** For a given property, compare the listing row's "Tenants" count against that same property's details-page "Tenants" summary card and the actual row count of its Tenants sub-table.
- **Assertions:** All three numbers (listing cell, summary card, sub-table row count) agree with each other and with the API.

### Feature Area 10 — Browser Behaviour

#### Scenario 10.1 — Refresh on the listing page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Reload `/properties` — expected: identical unfiltered page-1 data re-renders; no stuck loading state; session remains authenticated.
- **Assertions:** URL remains `/properties`; row count and header text are unchanged after reload.

#### Scenario 10.2 — Refresh on the details page
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Reload a valid `/properties/:id` page — expected (confirmed live pattern, consistent with a fresh direct navigation): identical data re-renders, exactly one API request fires.
- **Assertions:** URL and rendered property name/id remain unchanged after reload.

#### Scenario 10.3 — Deep link directly to a property details page
- **Priority:** P0
- **Tags:** @smoke
- **Steps:** Navigate directly to `/properties/<valid id>` without going through the listing first — expected (confirmed live): renders correctly with exactly one API request, same result as clicking through from the list.
- **Assertions:** All header/summary/info/tenants data matches the API response for that id, identical to the click-through path.

#### Scenario 10.4 — Multiple tabs stay independently consistent
- **Priority:** P2
- **Tags:** @regression
- **Steps:** Open the listing in one tab and a specific property's details page in a second tab (same authenticated session) — expected: both operate independently without interfering with each other's state.
- **Assertions:** Searching/paginating in one tab does not affect the other tab's currently-displayed data.

#### Scenario 10.5 — Browser Back/Forward across the module
- **Priority:** P1
- **Tags:** @regression
- **Steps:** Listing → View a property → browser Back → browser Forward, repeated across two different properties.
- **Assertions:** No console errors at any step; each Forward re-renders full, correct data for the property that was being viewed (not stale/blank).

#### Scenario 10.6 — Console and network hygiene across the whole module
- **Priority:** P1
- **Tags:** @regression @critical
- **Steps:** While exercising listing load, search (including the script-injection payload), no-results, View navigation, Back, deep-link, reload, and the invalid-id error path — monitor console and network throughout.
- **Assertions:** No uncaught console errors/warnings in any flow (confirmed clean for every flow actually exercised live this session). The only known duplicate-request pattern is the documented invalid-id case (8.6/two requests) — no other unexpected duplicate requests were observed.

#### Scenario 10.7 — Unauthenticated/expired-session access
- **Priority:** P1
- **Tags:** @regression
- **Steps:** From a logged-out session, attempt to load `/properties` or `/properties/:id` directly — expected (by analogy with the confirmed Landlords/Tenants redirect behaviour, and consistent with this session's own accidental-sign-out recovery, which redirected to `/sign-in` with a standard Email/Password/"Log In" form): redirect to sign-in rather than rendering any property data.
- **Assertions:** No property/landlord/tenant PII is briefly visible before the redirect (flash-of-authenticated-content check).

## Bug-Driven Regression Coverage

**Updated after the Generator pass (2026-08-04),** which had live browser interaction and a working viewport-resize tool, unlike the original Planner session. One earlier retraction stands, one new Properties-specific bug was confirmed, one previously-"suspected" gap was confirmed to reproduce, and one previously-"suspected" gap was confirmed to **not** reproduce:

1. An initial "empty accessible name on the Property-name cell" finding (from the original Planner pass) was investigated and **retracted** after checking the live DOM: the markup is plain, unhidden text (`<td><span><span class="dot"/>NameText</span></td>`) with nothing that would keep it out of the accessibility tree — a targeted-snapshot tool quirk, not a real defect.
2. `Bugs/Properties/properties-search-does-not-trim-whitespace.md` — **new, Properties-specific, confirmed live.** Search correctly ignores case ("GROVE" matches "Grove") but does not trim leading/trailing whitespace ("  Grove" returns zero results), unlike Landlords/Tenants search which trims and lower-cases server-side (covered by Scenario 3.3, tested in `tests/Properties/properties-search.spec.js`).
3. `Bugs/Landlords/landlords-details-invalid-id-generic-error.md` — reproduces identically: a non-existent or malformed property id produces two duplicate fetches and a generic "Something went wrong" error instead of a "Property not found" message (covered by Scenario 8.6, tested in `tests/Properties/properties-error-states.spec.js`).
4. `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` — **confirmed to reproduce** on the Properties **listing** page at 768px (~170px page-level overflow, measured live) — but **confirmed NOT to reproduce** on the Properties **details** page at 768px (clean, no overflow), a genuine difference from Landlords/Tenants where it affects both pages (covered by Scenario 7.2, tested in `tests/Properties/properties-responsive.spec.js`).
5. `Bugs/Tenants/tenants-desktop-header-overflows-viewport.md` — **confirmed live to NOT reproduce** on Properties at 1280px, on either the listing or details page (header right edge lands exactly at the viewport edge, zero overflow measured). The original plan's "likely reproduces" guess was wrong (see Scenario 7.1) — do not carry this bug's assumption forward into future Properties work.

## Not covered (and why)

- **Property creation, editing, or deletion** — explicitly out of scope per the prompt; this module in fact has no such UI at all (confirmed live: Actions column only ever shows "View").
- **Maintenance Request workflows** — the "Open Requests" summary card's underlying count is validated as a number matching the API, but the Maintenance Requests module itself (linked from the sidebar) is out of scope per the prompt.
- **Tenant actions and Landlord actions** — the Tenants sub-table and Landlord fields on a property's details page are validated read-only, for data-consistency purposes only; their own dedicated Suspend/Unsuspend flows are covered in `specs/tenant-management.md` and `specs/landlords-management.md`, not here.
- **API automation** — the List, Search, and Details APIs are referenced only to justify UI assertions, per the prompt's explicit constraint; no direct API test suite is included.
- **Database validation** — out of scope per the prompt; all "data consistency" scenarios compare UI against the API response only, never against a database directly.
- **True multi-page pagination (Next/Previous/First/Last with real data)** — the live dataset has exactly 20 properties on exactly 1 page at plan time; Scenarios 6.2–6.4 document the expected behaviour by analogy but cannot be executed against real data until the dataset grows past 20, or a mocked response is used.
- **Cross-browser matrix (Firefox/Safari)** — `playwright.config.js` currently only enables the `chromium` project, consistent with the Landlords/Tenants plans' same exclusion.
- **Confirmed-live responsive testing** — this planner invocation's toolset had no viewport-resize capability; Feature Area 7 is written entirely by inference from the Landlords/Tenants plans' confirmed findings and must be independently re-verified by the Generator (or a future Planner run with resize access) before being trusted as ground truth.
- **Load/performance testing** — flagged as out of scope; only qualitative loading-state observations are included (Feature Area 8).

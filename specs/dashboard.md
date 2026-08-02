# Test Plan: Dashboard

**Target:** https://admin.six-property.clienturl.net/dashboard
**Seed:** tests/seed.spec.js
**Date:** 2026-08-02

## Overview

This plan covers the Admin Dashboard: initial load, sidebar (including a known navigation bug), header, the Today's Word card, six summary cards, the Recent Activity table, and sign-out/session behaviour. `GET /game/admin/word` and `GET /admin/activity` are referenced only to justify frontend assertions (e.g. word tiles match the response, table rows match the response) — neither is automated directly. Deep exploration of Landlords, Tenants, Properties, Maintenance Requests, and Platform Activity is out of scope; sidebar links to those pages are covered only as "does it land on the right URL" navigation checks.

**Methodology note:** This plan was authored from a live, authenticated browser session against the staging Dashboard (logged in via `tests/data/credentials.json`), using accessibility snapshots, screenshots at desktop/tablet/mobile widths, console/network inspection, and manual reproduction of the known profile-navigation bug. Exact locators below reflect the live DOM at plan time; the Generator agent must re-confirm them before writing test code, per its existing workflow.

**Confirmed live structure (for the Generator's reference):**
- Sidebar is grouped under three headings: "Navigation" (Dashboard), "Management" (Landlords, Tenants, Properties), "Monitoring" (Maintenance Requests, Platform Activity).
- Sidebar bottom section: a link named "Admin {email}" → `/profile`, and a separate "Sign Out" button.
- There are **two** "Toggle Sidebar" buttons — one inside the sidebar itself, one in the main content header. Both were observed to fully hide/show the sidebar (not a mini icon-rail).
- The main content header also renders a second avatar + "Admin" block, independent of the sidebar's bottom user section.
- Today's Word card shows a title ("Today's Wordle Word"), a date, and 5 individual letter tiles.
- Recent Activity table has 4 columns (Type, Title, Time, Message) at desktop/tablet widths; at mobile width (390px) the Message column is not rendered.
- Six summary cards observed: Landlords, Tenants, Properties, Open Requests, Resolved Requests, Suspended Users.

## Preconditions

- Staging environment is reachable at the Dashboard URL.
- A valid, non-production admin test account exists; credentials are supplied via `tests/data/credentials.json`, never hardcoded in test code.
- Each scenario starts from a clean, authenticated session unless the scenario explicitly tests unauthenticated/expired-session behaviour.
- The reference APIs (`GET /game/admin/word`, `GET /admin/activity`) are reachable and return data for the test account.

## Scenarios

### Scenario 1.1 — Dashboard loads cleanly after login
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Valid admin credentials, clean browser context.
- **Steps:**
  1. Log in with valid credentials — expected: redirect to `/dashboard`.
  2. Observe console output during and after load — expected: no uncaught JavaScript errors.
  3. Observe network activity — expected: no failed (4xx/5xx) requests, including `/game/admin/word` and `/admin/activity` returning 200.
- **Assertions:**
  - Page URL is `/dashboard`.
  - "Dashboard" heading (level 3) and the "Overview of platform activity and key metrics." description are visible.
- **Edge cases considered:** slow network throttling, reload mid-load.

### Scenario 1.2 — Direct navigation and reload consistency
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate directly to `/dashboard` — expected: dashboard renders without a redirect loop.
  2. Reload the page — expected: identical dashboard state, no stuck spinners, session preserved.
- **Assertions:**
  - URL remains `/dashboard` after reload.
  - Summary cards and Recent Activity table re-render with data (not stuck in a loading state).
- **Edge cases considered:** reload while a request is in-flight.

### Scenario 1.3 — Baseline visual structure and no layout shift
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded successfully.
- **Steps:**
  1. Capture layout immediately after first paint and again once fonts/images/API data have settled — expected: no visible layout shift.
  2. Inspect all icons (sidebar, card icons, Today's Word icon) — expected: none broken/missing.
- **Assertions:**
  - No horizontal scrollbar at standard desktop width (1280px).
  - Card grid, table, and header maintain consistent spacing before/after data loads.
- **Edge cases considered:** first paint before web font loads, cached vs. cold load.

### Scenario 1.4 — Deep link with unexpected query string
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Authenticated session.
- **Steps:**
  1. Navigate to `/dashboard?foo=bar&utm_source=test` (an arbitrary/unexpected query string) — expected: dashboard renders normally, ignoring unrecognized params.
- **Assertions:**
  - Dashboard heading, summary cards, and Recent Activity table all render as on a clean `/dashboard` load.
  - No console error is thrown because of the unrecognized query param.
- **Edge cases considered:** a query string that collides with a param name the app uses elsewhere; extremely long query strings.

### Scenario 2.1 — Every sidebar item is visible and correctly labeled
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Dashboard loaded, sidebar expanded.
- **Steps:**
  1. Inventory the sidebar — expected: "Dashboard" under Navigation; "Landlords", "Tenants", "Properties" under Management; "Maintenance Requests", "Platform Activity" under Monitoring.
- **Assertions:**
  - Each of the 6 items is queryable via `getByRole('link', { name })` and visible.
  - Each item's icon is visible (not just the text).
- **Edge cases considered:** item present in DOM but visually clipped by a collapsed sidebar (see 3.x).

### Scenario 2.2 — Sidebar navigation lands on the correct screen
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Click "Landlords" — expected: URL becomes `/landlords`.
  2. Return to `/dashboard`. Click "Tenants" — expected: URL becomes `/tenants`.
  3. Return to `/dashboard`. Click "Properties" — expected: URL becomes `/properties`.
  4. Return to `/dashboard`. Click "Maintenance Requests" — expected: URL becomes `/maintenance-requests`.
  5. Return to `/dashboard`. Click "Platform Activity" — expected: URL becomes `/activity`.
  6. Return to `/dashboard`. Click "Dashboard" — expected: URL stays/returns to `/dashboard`.
- **Assertions:**
  - Each click resolves to the exact expected URL (confirmed live; no redirect to sign-in or 404 for any of the five).
- **Edge cases considered:** rapid repeated clicks on the same item; clicking the currently-active item.

### Scenario 2.3 — Sidebar item states: active, hover, focus, cursor, keyboard
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded, sidebar expanded.
- **Steps:**
  1. Inspect the "Dashboard" item while on `/dashboard` — expected: visually distinguished active state (confirmed: highlighted background + accent text color).
  2. Hover each sidebar item — expected: hover styling and pointer cursor (confirmed live: `cursor: pointer` on all sidebar links).
  3. Tab to each sidebar item — expected: visible focus indicator, logical order (Dashboard → Landlords → Tenants → Properties → Maintenance Requests → Platform Activity → profile link → Sign Out).
- **Assertions:**
  - Active item has a distinct style from inactive items.
  - Every sidebar link is reachable and operable via keyboard (Enter activates navigation).
- **Edge cases considered:** active state correctness when navigating away and back via browser Back button.

### Scenario 2.4 — Browser Back/Forward through a sidebar navigation chain
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Authenticated session, starting on `/dashboard`.
- **Steps:**
  1. Click "Landlords", then "Tenants", then "Properties" in sequence — expected: URL updates correctly at each step.
  2. Press browser Back twice — expected: lands back on `/landlords`, then `/dashboard`.
  3. Press browser Forward twice — expected: replays `/landlords`, then `/tenants`.
- **Assertions:**
  - History stack matches the actual navigation order; no step is skipped or duplicated.
  - Dashboard state (sidebar active item, summary card data) is correct after landing back on `/dashboard` via Back.
- **Edge cases considered:** rapid Back/Forward clicking before a page finishes loading.

### Scenario 3.1 — Sidebar collapse hides the sidebar and removes it from the tab order
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded, sidebar expanded.
- **Steps:**
  1. Click the sidebar's own "Toggle Sidebar" button — expected: sidebar becomes visually hidden (confirmed live: full hide, not an icon-only rail).
  2. Press Tab repeatedly from the header toggle button — expected: focus skips directly to the next visible control (confirmed live: focus moved from the header toggle straight to "See all", never landing on a hidden sidebar link).
- **Assertions:**
  - No sidebar link is focusable while the sidebar is visually collapsed.
  - Main content area expands to use the freed width.
- **Edge cases considered:** collapsing while a sidebar item has focus; collapsing mid-navigation.

### Scenario 3.2 — Sidebar expand restores full sidebar
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Sidebar collapsed (3.1).
- **Steps:**
  1. Click the header's "Toggle Sidebar" button — expected: sidebar reappears with all 6 links, both group headings, and the bottom user section.
- **Assertions:**
  - All previously-hidden sidebar links are visible and focusable again.
  - Active state (e.g. "Dashboard" highlighted) is preserved through the collapse/expand cycle.
- **Edge cases considered:** toggling rapidly multiple times in succession.

### Scenario 3.3 — Both Toggle Sidebar buttons behave identically
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Toggle via the sidebar's own button, then restore via the header's button — expected: consistent end state.
  2. Toggle via the header's button, then restore via the sidebar's button — expected: consistent end state.
- **Assertions:**
  - Sidebar visibility state after any toggle is deterministic regardless of which of the two buttons was used.
- **Edge cases considered:** whether having two controls for one piece of state is itself worth flagging as a UX inconsistency (see "Not covered" / UI-UX notes below) — functionally both were observed to work, so this is not filed as a bug, only tracked as an observation.

### Scenario 3.4 — Sidebar responsive behaviour
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Load the dashboard at mobile width (390×844) — expected: sidebar is collapsed/hidden by default (confirmed live).
  2. Load at tablet width (820×1180) — expected: sidebar is expanded by default (confirmed live).
  3. Load at desktop width (1280×800) — expected: sidebar is expanded by default.
- **Assertions:**
  - Sidebar default visibility matches the confirmed breakpoint behaviour at each width.
  - No horizontal overflow/scrolling introduced by the sidebar at any width.
- **Edge cases considered:** resizing the window live (desktop → mobile) rather than loading fresh at each width; landscape mobile.

### Scenario 4.1 — Dashboard header content and layout
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Inspect the page header area — expected: "Dashboard" title (heading level 3), "Overview of platform activity and key metrics." description, and a top-right avatar + admin name block are all present.
- **Assertions:**
  - Title and description are visible and correctly positioned above the Today's Word card.
  - Top-right avatar block shows an "A" initial and "Admin" label, consistent in style with the sidebar's own avatar rendering.
- **Edge cases considered:** long admin names/emails causing truncation (bottom sidebar user section was observed to truncate the email with an ellipsis at desktop width — verify this doesn't clip essential info without a way to reveal the full value, e.g. a tooltip).

### Scenario 5.1 — Today's Word card displays correctly
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded, `GET /game/admin/word` returns 200.
- **Steps:**
  1. Inspect the card — expected: icon, "Today's Wordle Word" title, a date, and a row of individual letter tiles are all visible.
  2. Compare the displayed date and letters against the `GET /game/admin/word` response — expected: exact match, no hardcoded/stale values.
- **Assertions:**
  - Number of letter tiles equals the length of the word returned by the API.
  - Displayed date matches the API's date field (format-normalized).
- **Edge cases considered:** word of unusual length; API returning a word already-guessed/partial state if the endpoint supports it; card behaviour on refresh (values should update, not persist stale data).

### Scenario 5.2 — Today's Word card responsiveness
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded at multiple viewport widths.
- **Steps:**
  1. Inspect the card at desktop, tablet, and mobile widths — expected: letter tiles remain evenly spaced and fully visible, no overlap or clipping.
- **Assertions:**
  - Card width adapts to container at all tested breakpoints without letter tiles wrapping awkwardly or overflowing.
- **Edge cases considered:** very narrow viewports (<360px).

### Scenario 5.3 — Today's Word card handles API failure gracefully
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `GET /game/admin/word` mocked/forced to fail (500) or time out.
- **Steps:**
  1. Load the dashboard with the word API failing — expected: card shows an explicit error/empty state, not a crash, not stale/fake letters.
- **Assertions:**
  - No uncaught exception in console.
  - The rest of the dashboard (summary cards, activity table) still renders despite this one API failing.
- **Edge cases considered:** API returns 200 with a malformed/empty payload (e.g. missing `word` field) vs. a hard failure.

### Scenario 5.4 — Today's Word date boundary
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** none (may require a controlled/mocked date if not naturally testable near a real day boundary).
- **Steps:**
  1. Compare the dashboard's displayed date against the admin's local date and the API's returned date around a day boundary — expected: displayed date reflects the API's date field consistently, not a client-computed `new Date()` that could disagree with it.
- **Assertions:**
  - Date shown matches the `GET /game/admin/word` response.
- **Edge cases considered:** admin viewing from a different timezone than the server.

### Scenario 5.5 — Today's Word with duplicate letters
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** `GET /game/admin/word` returns a word containing a repeated letter (the live-observed word "CANOE" has no repeats, so this needs a day/mock where it does, e.g. "APPLE").
- **Steps:**
  1. Load the dashboard on a day the word contains a duplicate letter — expected: each tile renders independently and correctly, no deduplication or merged tiles.
- **Assertions:**
  - Tile count still equals word length even with repeated letters.
- **Edge cases considered:** a word with all-identical letters, as a defensive extreme.

### Scenario 6.1 — All six summary cards render with correct data
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Inventory the summary cards — expected: Landlords, Tenants, Properties, Open Requests, Resolved Requests, Suspended Users, each with an icon, a label, and a numeric count.
- **Assertions:**
  - Each card's count is a non-negative integer rendered as visible text (not hardcoded in the test — read whatever value is currently displayed and assert its type/format, per AGENTS.md "do not hardcode values returned by APIs").
  - All 6 cards are present even if a count is 0.
- **Edge cases considered:** a metric at 0 (e.g. Suspended Users could plausibly be 0) — card must still render, not disappear.

### Scenario 6.2 — Summary card visual consistency
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Compare all 6 cards for height, padding, icon size/alignment, and typography — expected: uniform across all cards.
- **Assertions:**
  - All cards in the grid report equal bounding-box height.
  - Label and count use consistent font sizing/weight across cards.
- **Edge cases considered:** longer labels ("Resolved Requests", "Suspended Users") causing a taller card than shorter ones ("Tenants").

### Scenario 6.3 — Summary cards responsive grid
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Load at desktop width — expected: cards arranged 2 per row (confirmed live).
  2. Load at mobile width (390px) — expected: cards stack 1 per row (confirmed live).
- **Assertions:**
  - No card is cut off or overlaps another at any tested width.
- **Edge cases considered:** tablet width as an intermediate case.

### Scenario 6.4 — Summary cards are non-interactive (confirmed)
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Click the "Landlords" card — expected: no navigation, URL stays `/dashboard` (confirmed live).
  2. Click the "Open Requests" card — expected: same, no navigation (confirmed live).
- **Assertions:**
  - URL remains `/dashboard` after clicking any summary card.
  - Computed `cursor` style on a card is `auto`, not `pointer` (confirmed live) — consistent with the cards being intentionally non-interactive, not a broken link.
- **Edge cases considered:** verify this holds for all 6 cards, not just the 2 spot-checked live, in case one card behaves differently from the rest.

### Scenario 6.5 — Summary card large-number formatting
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** A metric with a large value (4+ digits) — may require test data setup or mocking the API response.
- **Steps:**
  1. Load the dashboard with a count of 1000+ — expected: the number renders fully (with or without a thousands separator, per design), with no truncation or overflow outside the card.
- **Assertions:**
  - Card height/width doesn't break to accommodate a longer number string.
- **Edge cases considered:** 0, and an unrealistically large (6+ digit) value as a defensive upper bound.

### Scenario 6.6 — Partial summary-card API failure
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** The summary metrics endpoint(s) mocked so one metric fails/returns null while others succeed.
- **Steps:**
  1. Load the dashboard with one metric failing — expected: the failing card shows an explicit error/placeholder (e.g. "—" or an inline error), while the other 5 cards render normally.
- **Assertions:**
  - A single metric failure does not blank out or crash the entire summary section.
- **Edge cases considered:** all metrics failing simultaneously (full-section fallback).

### Scenario 6.7 — Summary cards loading state
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Throttled network to observe the pre-data-arrival state.
- **Steps:**
  1. Load the dashboard on a slow connection — expected: cards show a skeleton/loading indicator rather than a flash of "0" or blank before real data arrives.
- **Assertions:**
  - No visible flash of an incorrect/zero value before the real count renders.
- **Edge cases considered:** a very fast network where the loading state might not be visually perceivable — assert its presence in the DOM even if brief.

### Scenario 7.1 — Recent Activity table renders API data correctly
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Dashboard loaded, `GET /admin/activity` returns 200 with at least one record.
- **Steps:**
  1. Inspect the table — expected: header row with "Type", "Title", "Time", "Message" columns, followed by data rows (confirmed live: 5 rows visible without scrolling).
  2. Compare row content against the `GET /admin/activity` response — expected: Type, Title, Time, and Message values match, in the same order as the API response (confirmed live: most recent first, e.g. "Rent Paid" on Jul 29 before "Sign Up" on Jul 27).
- **Assertions:**
  - Row count and content are driven by the API response, not hardcoded.
  - Time values render in a consistent, human-readable format (confirmed live format: "Jul 29, 2026, 10:27 PM").
- **Edge cases considered:** activity feed with 0 records (empty state — not observed live with current test data, must be verified separately, e.g. via a filtered/mocked scenario or documented as unverified if not reproducible); a very long `Message` value overflowing its cell.

### Scenario 7.2 — Recent Activity "Type" badge styling
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded with activity data.
- **Steps:**
  1. Inspect the Type column for each row — expected: each type renders as a colored pill/badge (confirmed live: "Rent Paid" green, "Sign Up" purple).
- **Assertions:**
  - Each distinct Type value has a consistent, visually distinct badge color across all its occurrences in the table.
- **Edge cases considered:** a Type value not yet seen in this dataset — verify it still renders as a badge rather than plain text (may require a wider data sample than the current 5 visible rows).

### Scenario 7.3 — Recent Activity table responsive behaviour
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Load the table at desktop/tablet width — expected: all 4 columns (Type, Title, Time, Message) visible.
  2. Load at mobile width (390px) — expected: the Message column is not rendered (confirmed live behaviour).
- **Assertions:**
  - No horizontal scrolling is introduced by the table at any tested width.
  - At mobile width, Message content is not silently lost from the user's perspective — flag as a UI/UX observation if there is no alternate way to access it (e.g. row expansion, "See all" detail view). This needs a product decision; log as a bug candidate if the Message data is genuinely inaccessible on mobile rather than just deprioritized.
- **Edge cases considered:** landscape mobile (more width available — does Message reappear?).

### Scenario 7.4 — Recent Activity renders user-generated content safely
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** An activity record whose `Message` or `Title` contains HTML/script-like content (e.g. a tenant/landlord name of `<script>alert(1)</script>` or `<img src=x onerror=alert(1)>`) — requires test data setup, since live data didn't contain this.
- **Steps:**
  1. Load the dashboard with such a record present — expected: the content renders as literal visible text in the table cell, not executed as HTML/JS.
- **Assertions:**
  - No script executes (no alert/dialog fires, no console evidence of injected code running).
  - The raw tag characters are visible as text (proof of proper escaping) rather than silently stripped, which could mask the underlying issue.
- **Edge cases considered:** the same check applied defensively to any other field that ultimately traces back to user input; SQL/NoSQL-style payloads in the Message field (should be inert on the frontend regardless).

### Scenario 7.5 — Recent Activity dashboard preview row cap
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `GET /admin/activity` returns more records than the dashboard preview shows (currently observed: 5 rows visible).
- **Steps:**
  1. Load the dashboard when the API returns more than 5 records — expected: only the most recent N (matching the confirmed cap) are shown in the preview table.
- **Assertions:**
  - Preview row count never exceeds the documented cap, and the rows shown are the N most recent by time, not an arbitrary subset.
- **Edge cases considered:** API returns fewer than the cap — confirm no padding/empty rows are added to fill the gap.

### Scenario 7.6 — Recent Activity sort stability on identical timestamps
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Two or more activity records with the same `Time` value (requires test data setup).
- **Steps:**
  1. Load the dashboard with tied timestamps — expected: a stable, consistent order (e.g. matching API response order) rather than the two records swapping position on reload.
- **Assertions:**
  - Repeated loads with the same underlying data produce the same row order.
- **Edge cases considered:** none beyond determinism itself.

### Scenario 7.7 — Recent Activity handles API failure
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `GET /admin/activity` mocked/forced to fail (500) or time out.
- **Steps:**
  1. Load the dashboard with the activity API failing — expected: the table area shows an explicit error/empty state, not an infinite spinner or a silently blank table with headers only.
- **Assertions:**
  - No uncaught exception in console.
  - Other dashboard sections (summary cards, Today's Word) still render despite this one API failing.
- **Edge cases considered:** API returns 200 with an empty array (a true empty state, distinct from a failure).

### Scenario 7.8 — Recent Activity rows are non-interactive (confirmed)
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded with activity data.
- **Steps:**
  1. Click a "Rent Paid" row — expected: no navigation, URL stays `/dashboard` (confirmed live).
  2. Click a "Sign Up" row — expected: same, no navigation (confirmed live).
- **Assertions:**
  - URL remains `/dashboard` after clicking any table row.
  - Computed `cursor` style on a row is `auto`, not `pointer` (confirmed live) — consistent with rows being intentionally non-interactive rather than a broken link to the related tenant/landlord/property.
- **Edge cases considered:** the two row Types spot-checked live (Rent Paid, Sign Up) covered both Type values currently present in the dataset; a future Type not yet seen should be spot-checked too if one appears.

### Scenario 8.1 — "See all" button navigates to Platform Activity
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded.
- **Steps:**
  1. Hover the "See all" link — expected: hover styling, pointer cursor.
  2. Tab to it and activate via keyboard — expected: navigates same as a click.
  3. Click it — expected: URL becomes `/activity` (confirmed live: identical destination to the sidebar's "Platform Activity" link).
- **Assertions:**
  - Destination URL matches `/activity` regardless of activation method (mouse vs. keyboard).
- **Edge cases considered:** rapid double-click.

### Scenario 9.1 — Bottom sidebar user section content and layout
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Dashboard loaded, sidebar expanded.
- **Steps:**
  1. Inspect the bottom user section — expected: avatar icon, "Admin" name, admin email, and a separate red "Sign Out" control with an icon (confirmed live styling: Sign Out rendered in a distinct red/destructive color).
- **Assertions:**
  - Email text is present (even if visually truncated at desktop width) and accessible via the element's accessible name/title, not only as clipped visible text.
- **Edge cases considered:** very long email addresses causing more aggressive truncation.

### Scenario 9.2 — Admin profile section click (Known Bug Verification)
- **Priority:** P0
- **Tags:** @critical @regression
- **Preconditions:** Authenticated session on `/dashboard`.
- **Steps:**
  1. Click the "Admin {email}" link in the sidebar's bottom user section (distinct from the "Sign Out" button below it) — expected per product intent: either opens a profile page, or the element is non-interactive.
  2. Observe actual result — **reproduced live: redirects to `/sign-in`**, exactly as reported.
  3. Immediately after, navigate directly to `/dashboard` — expected/confirmed live: dashboard loads without requiring re-login, proving the session itself was NOT cleared; only the `/profile` route/link is broken (redirects to sign-in on both link-click and direct URL navigation, while the session cookie remains valid).
- **Assertions:**
  - Clicking the profile link does not silently fail or navigate somewhere unrelated — it deterministically lands on `/sign-in`.
  - A subsequent direct navigation to any protected route (e.g. `/dashboard`) succeeds without re-authentication, confirming the session survives the bad redirect.
- **Edge cases considered:** whether the bug is specific to the link-click path or also affects direct URL entry to `/profile` (confirmed live: both paths redirect to `/sign-in`).
- **Bug status:** Reproduced. File in `Bugs/` per the project's existing template (module: Dashboard/Sidebar; see "Bug Reporting" below).

### Scenario 10.1 — Sign Out clears the session and redirects
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Authenticated session on `/dashboard`.
- **Steps:**
  1. Click "Sign Out" — expected: redirect to `/sign-in` (confirmed live).
  2. Attempt to navigate directly to `/dashboard` — expected: redirected back to `/sign-in`, not the dashboard (confirmed live: session was genuinely cleared, unlike the profile-link bug in 9.2).
- **Assertions:**
  - URL after sign-out is `/sign-in`.
  - Protected routes are inaccessible post-sign-out without re-authenticating.
- **Edge cases considered:** clicking Sign Out twice in quick succession; Sign Out while a network request is in-flight.

### Scenario 10.2 — Browser Back after Sign Out does not restore protected content
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Just signed out (10.1).
- **Steps:**
  1. Press the browser Back button — expected: does not render cached/stale dashboard content; either redirects to `/sign-in` or forces a fresh unauthenticated load of the previous route.
- **Assertions:**
  - No protected data (summary card counts, activity table rows) is visible after Back navigation post-sign-out.
- **Edge cases considered:** back-forward cache (bfcache) restoring a stale authenticated view — this is a security-sensitive edge case and should be explicitly tested, not assumed safe.

### Scenario 11.1 — Direct URL access without authentication
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** No active session (fresh/cleared browser context).
- **Steps:**
  1. Navigate directly to `/dashboard` without logging in — expected: redirect to `/sign-in`, dashboard content never rendered.
- **Assertions:**
  - No summary card data, activity table data, or Today's Word data is present in the DOM at any point during the redirect.
- **Edge cases considered:** a race where dashboard content briefly flashes before the redirect completes (should not happen — assert absence, not just eventual redirect).

### Scenario 11.2 — Expired/invalidated session on the Dashboard
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Authenticated session, then session invalidated server-side (e.g. token expiry or manual invalidation) without the client knowing yet.
- **Steps:**
  1. With a stale/expired session, trigger a data-fetching action on the dashboard (e.g. reload) — expected: the app detects the unauthorized API response and redirects to `/sign-in` rather than showing broken/empty widgets silently.
- **Assertions:**
  - Unauthorized API responses (401/403) on `/game/admin/word` or `/admin/activity` result in a clear redirect or message, not a silently broken dashboard.
- **Edge cases considered:** one API call failing with 401 while another still succeeds (partial session expiry handling).

### Scenario 12.1 — Sign out in one tab invalidates another open tab
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Two tabs open to `/dashboard` under the same authenticated session.
- **Steps:**
  1. In Tab A, click "Sign Out" — expected: Tab A redirects to `/sign-in`.
  2. In Tab B (still showing the old dashboard view), trigger a data-fetching action (e.g. reload, or click a sidebar link) — expected: Tab B is also redirected to `/sign-in` rather than continuing to operate on a dead session.
- **Assertions:**
  - Tab B does not successfully complete any authenticated action after Tab A has signed out.
- **Edge cases considered:** Tab B mid-request at the exact moment Tab A signs out.

### Scenario 12.2 — Concurrent login from a second session
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Same admin account logged in from two separate browser contexts (simulating two devices).
- **Steps:**
  1. Log in as the same admin in Context 1, then again in Context 2 — expected behaviour to confirm: does Context 1's session remain valid (multi-session allowed), or does it get invalidated (single-session enforcement)?
- **Assertions:**
  - Whichever behaviour is the product's intended policy, it is consistent — Context 1 should not be left appearing logged in while silently failing all requests.
- **Edge cases considered:** three or more concurrent sessions.

### Scenario 13.1 — Browser zoom at 200%
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Dashboard loaded at desktop width.
- **Steps:**
  1. Zoom the browser to 200% — expected: layout reflows without overlapping text, clipped cards, or inaccessible controls; horizontal scroll is acceptable, but content must not be cut off.
- **Assertions:**
  - All interactive elements (sidebar links, Sign Out, See all) remain clickable at 200% zoom.
- **Edge cases considered:** 400% zoom, as a WCAG-referenced upper bound for reflow support.

### Scenario 13.2 — Mobile landscape orientation
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Load the dashboard at mobile width with landscape dimensions (e.g. 844×390) — expected: layout adapts sensibly, not simply a rotated portrait layout with excessive whitespace or clipped content.
- **Assertions:**
  - No horizontal scrolling introduced; card grid and table remain usable.
- **Edge cases considered:** whether the Recent Activity "Message" column reappears in landscape given the extra width (per Scenario 7.3).

## UI / UX Review Notes

- Two independent "Toggle Sidebar" controls exist (sidebar-internal and header-internal); both work, but having two controls for one piece of state is worth a design consistency conversation — not filed as a bug, tracked as an observation only.
- The main content header renders a second avatar/"Admin" block separate from the sidebar's own bottom user section — confirm this duplication is intentional (e.g. for collapsed-sidebar states) rather than leftover/inconsistent UI.
- Email in the sidebar's bottom user section is visually truncated with an ellipsis at desktop width — confirm the full value remains accessible (title attribute, tooltip, or accessible name).
- The Recent Activity table drops its "Message" column entirely at mobile width — confirm this is an intentional, product-approved simplification and not silent data loss.

## Accessibility Notes

- Sidebar links correctly leave the tab order entirely when the sidebar is visually collapsed (verified live — this is correct behaviour, not a gap).
- Sidebar active/hover/focus states, keyboard reachability, and ARIA roles for the summary cards, Today's Word tiles, and activity table should all be explicitly asserted per Scenario 2.3, 5.x, 6.x, 7.x — no accessibility issues were observed live beyond the confirmed profile-link bug (9.2), but this plan does not constitute a full audit.

## Not covered (and why)

- Deep functional testing of Landlords, Tenants, Properties, Maintenance Requests, and Platform Activity pages — explicitly out of scope per the prompt; only "does the sidebar link land on the right URL" is covered here (2.2).
- Automating `GET /game/admin/word` or `GET /admin/activity` directly — per instructions, these are reference-only for frontend assertions.
- Recent Activity empty state — not reproducible with the current live dataset (5 records were present); flagged in 7.1 as needing a separate data setup or mocked scenario.
- Cross-browser (Firefox/Safari/Edge) specifics beyond noting the existing Playwright project already runs chromium/firefox/webkit per `playwright.config.js` — no browser-specific dashboard issues were observed during planning, but this plan does not include browser-specific scenarios beyond what the project's existing multi-project config already provides.
- Performance budgets (exact load-time thresholds) — plan notes *what* to observe (load time, layout shift, font loading) per the prompt, but does not prescribe hard numeric thresholds, which should come from a product/perf owner.
- Several added edge-case scenarios (5.3–5.5, 6.4–6.7, 7.4–7.8, 12.x) require test data setup or API mocking that the live dataset didn't naturally provide (API failures, records with duplicate letters/tied timestamps/injected HTML, large counts, a second tab/session). The Generator should implement these using route interception (`page.route`) or a dedicated seeded test account rather than relying on the shared staging dataset, so they don't depend on data that may change over time.

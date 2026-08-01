# Test Plan: Admin Login

**Target:** https://admin.six-property.clienturl.net (Admin Login page)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-01

## Overview

This plan covers functional, validation, visual, accessibility, responsive, and security-oriented scenarios for the Admin Login page, plus a minimal check that the Dashboard loads after a successful login. `POST /auth/admin/login`, `GET /game/admin/word`, and `GET /admin/activity` are referenced only to justify frontend assertions (e.g. "no failed network request") — none of them are automated directly. Dashboard functionality beyond "it loaded" is explicitly out of scope.

**Methodology note:** This plan was authored from the provided scope, project conventions (`AGENTS.md`), and static inspection of the staging shell (SPA, Inter font, title "SIX Property — Admin Panel") — no interactive browser session was available while planning. The Generator agent must confirm exact selectors and current DOM structure live, per its existing workflow, before writing test code.

## Preconditions

- Staging environment is reachable at the Admin Login URL.
- A valid, non-production admin test account exists; credentials are supplied via environment variables / `tests/data`, never hardcoded in test code.
- At least one deliberately invalid credential pair is available for negative-path testing.
- A reference branding asset is available at `Resources/Correct_Logo.png` for visual comparison.
- Each scenario starts from a clean browser context (no session cookies, no local/session storage) unless the scenario explicitly states otherwise.
- Network condition simulation (offline / slow / delayed response) is available for interruption and timeout scenarios.

## Scenarios

### Scenario 1.1 — Page loads cleanly
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Clean browser context.
- **Steps:**
  1. Navigate to the Admin Login URL — expected: page resolves to the login screen (not a 404/500/blank page).
  2. Observe console output during and after load — expected: no uncaught JavaScript errors.
  3. Observe network activity during load — expected: no failed (4xx/5xx) requests for page assets.
- **Assertions:**
  - Login form (email field, password field, submit button) is visible within a reasonable load budget.
  - Page URL matches the expected login route.
- **Edge cases considered:** slow 3G throttling, reload mid-load, direct deep link vs. navigating from an external referrer.

### Scenario 1.2 — Baseline visual structure
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded successfully (1.1).
- **Steps:**
  1. Inspect overall layout — expected: form is centered/aligned per design, consistent spacing between elements.
  2. Inspect typography and color usage — expected: consistent font family (Inter), weights, and color palette across all text.
  3. Inspect all images/icons — expected: none broken (no alt-text fallback boxes).
- **Assertions:**
  - No visible layout shift after fonts/images finish loading (compare initial vs. settled screenshot).
  - No horizontal scrollbar at standard desktop width.
- **Edge cases considered:** first paint before web font loads (FOUT/FOIT), cached vs. cold load.

### Scenario 1.3 — URL and reload consistency
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Navigate directly to the login URL — expected: login page renders (not a redirect loop).
  2. Reload the page — expected: identical login page state, no duplicated or stuck spinners.
- **Assertions:**
  - URL after reload still points to the login route.
- **Edge cases considered:** reload while a request is in-flight, back/forward navigation immediately after load.

### Scenario 2.1 — Logo matches brand reference
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded successfully.
- **Steps:**
  1. Capture the rendered login logo — expected: visually present above/near the heading.
  2. Compare against `Resources/Correct_Logo.png` ("S:PM" wordmark) — expected: same mark, proportions, and color.
- **Assertions:**
  - Logo image matches the reference asset; any mismatch (wrong mark, wrong color, wrong crop) is recorded as a UI bug candidate (see 18.1).
- **Edge cases considered:** logo served from CDN vs. bundled asset, dark-mode variant if the app supports one.

### Scenario 2.2 — Logo rendering quality
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Page loaded at multiple viewport sizes.
- **Steps:**
  1. Inspect logo size and alignment at desktop, tablet, and mobile widths — expected: proportionate scaling, no stretching.
  2. Inspect logo sharpness — expected: no pixelation at any tested resolution, including high-DPI (2x) displays.
- **Assertions:**
  - Logo bounding box aspect ratio remains constant across breakpoints.
- **Edge cases considered:** very narrow viewports (< 360px), very high pixel-density displays.

### Scenario 3.1 — All form components present and labeled
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Page loaded successfully.
- **Steps:**
  1. Inventory the form — expected: Logo, "Welcome Back" heading, Email label + textbox, Password label + textbox, password visibility icon, Forgot Password link, Login button are all present and visible.
- **Assertions:**
  - Each component is queryable by an accessible role/name (not just visually present).
- **Edge cases considered:** component present in DOM but visually hidden/clipped.

### Scenario 3.2 — Interactive states for every control
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded successfully.
- **Steps:**
  1. Hover each interactive element (email field, password field, visibility icon, forgot password link, login button) — expected: appropriate hover styling, pointer cursor on clickable elements.
  2. Focus each element via mouse click — expected: visible focus indicator, active state distinguishable from default.
- **Assertions:**
  - Every clickable/interactive element shows a pointer cursor on hover (see also 18.4 for known gap).
- **Edge cases considered:** disabled login button hover behavior, rapid mouse movement across elements.

### Scenario 3.3 — Component keyboard reachability
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded successfully.
- **Steps:**
  1. Tab through the page from the top — expected: every interactive component receives focus in a logical order.
- **Assertions:**
  - Focus order matches visual/reading order (email → password → visibility icon → forgot password → login button, or equivalent logical order).
- **Edge cases considered:** skip links, hidden elements incorrectly receiving focus.

### Scenario 4.1 — Email required validation
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login form loaded, fields empty.
- **Steps:**
  1. Leave email empty, fill password, submit — expected: inline validation message for email; no network request to the login API.
- **Assertions:**
  - Required-field error is shown next to/associated with the email field.
- **Edge cases considered:** submit via Enter key vs. button click.

### Scenario 4.2 — Email format validation
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Enter an invalid email format (e.g. missing `@`, missing domain) and submit — expected: format validation error, no login request sent.
  2. Enter a valid email with leading/trailing spaces — expected: either trimmed silently or flagged consistently (document actual behavior).
  3. Enter the same valid email in uppercase and lowercase — expected: both accepted equivalently.
- **Assertions:**
  - Only a syntactically valid email allows the form to proceed to submission.
- **Edge cases considered:** email with `+` aliasing, multiple `@` symbols, trailing dot in domain.

### Scenario 4.3 — Email boundary and special input handling
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Enter an email at/over the field's maximum length — expected: input is capped or a length error is shown, no crash.
  2. Enter special characters, Unicode characters, and emoji into the email field — expected: field either rejects gracefully or handles without breaking layout/encoding.
- **Assertions:**
  - No console error or layout break results from any of the above inputs.
- **Edge cases considered:** right-to-left Unicode text, zero-width characters, extremely long single "word" with no spaces (layout overflow).

### Scenario 4.4 — Email field rejects injection payloads safely
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Enter common SQL injection strings (e.g. `' OR '1'='1`) into the email field and submit — expected: treated as invalid/plain input; standard validation error, no anomalous behavior.
  2. Enter common XSS payloads (e.g. `<script>alert(1)</script>`) into the email field and submit — expected: rendered as inert text if echoed anywhere (e.g. in an error message), never executed.
- **Assertions:**
  - No script execution occurs; no payload is reflected unescaped into the DOM.
- **Edge cases considered:** payload also attempted in the password field (see 5.x); payload split across copy/paste vs. typed input.

### Scenario 4.5 — Email copy/paste and browser autofill
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Browser has at least one saved credential/autofill entry for the domain (where feasible to simulate).
- **Steps:**
  1. Paste an email address into the field — expected: value accepted identically to typed input.
  2. Trigger browser autofill/suggestion — expected: suggested value populates the field correctly without breaking layout.
- **Assertions:**
  - Pasted value is not silently altered (no unexpected trimming/casing change beyond documented behavior from 4.2).
- **Edge cases considered:** paste with surrounding whitespace or newline characters.

### Scenario 5.1 — Password masked by default
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Type into the password field — expected: characters are masked (dots/asterisks), not shown in plain text.
- **Assertions:**
  - Password input's type/attribute indicates a masked field by default.
- **Edge cases considered:** masking behavior immediately after autofill.

### Scenario 5.2 — Password required validation
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Fill email, leave password empty, submit — expected: inline required-field error for password; no login request sent.
- **Assertions:**
  - Required-field error is shown next to/associated with the password field.
- **Edge cases considered:** password field containing only spaces treated as empty/invalid.

### Scenario 5.3 — Password spacing and length boundaries
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Enter a password with leading/trailing spaces — expected: consistent handling (either preserved and sent as-is, or trimmed — document actual behavior since it affects login success).
  2. Enter a password at the field's minimum and maximum accepted length — expected: boundary values accepted; below-minimum shows validation feedback if the app enforces one.
- **Assertions:**
  - Behavior at both boundaries is deterministic and does not crash the form.
- **Edge cases considered:** password exactly at max length plus one extra character (should be blocked or truncated, not silently accepted differently).

### Scenario 5.4 — Password copy/paste and autofill
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Paste a password into the field — expected: accepted, masked immediately.
  2. Trigger browser autofill — expected: value populates masked, visibility toggle still functions correctly afterward.
- **Assertions:**
  - Autofilled password is masked by default, matching manual-entry behavior (see 5.1).
- **Edge cases considered:** autofill overwriting a partially typed value.

### Scenario 5.5 — Password keyboard interaction
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login form loaded.
- **Steps:**
  1. Type, select-all, and delete text in the password field using keyboard only — expected: standard text-editing behavior, no stuck characters.
- **Assertions:**
  - Field value after keyboard edits matches expected string exactly.
- **Edge cases considered:** holding backspace, using Home/End/arrow keys to reposition cursor.

### Scenario 6.1 — Password visibility toggle functionality
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Password field contains text.
- **Steps:**
  1. Click the visibility icon — expected: password becomes plain text.
  2. Click again — expected: password re-masks.
  3. Continue typing while password is visible — expected: newly typed characters remain visible until toggled off.
- **Assertions:**
  - Toggled state is visually and programmatically reflected (e.g. input type changes), and does not clear or alter the entered value.
- **Edge cases considered:** toggling immediately before submit; toggling with an empty field.

### Scenario 6.2 — Visibility icon interaction states
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Password field loaded.
- **Steps:**
  1. Hover the icon — expected: pointer cursor, hover styling.
  2. Focus the icon via keyboard (Tab) and activate via Enter/Space — expected: toggles visibility identically to a mouse click.
- **Assertions:**
  - Icon is reachable and operable via keyboard alone.
- **Edge cases considered:** icon focus state visible against the field's background.

### Scenario 7.1 — Forgot Password navigation
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login page loaded.
- **Steps:**
  1. Click "Forgot Password" — expected: navigates to the correct forgot-password destination/URL.
- **Assertions:**
  - Resulting URL matches the expected forgot-password route.
- **Edge cases considered:** navigation with unsaved text already entered in the login fields (data loss expectation should be documented).

### Scenario 7.2 — Forgot Password link states and back navigation
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Login page loaded.
- **Steps:**
  1. Hover and keyboard-focus the link — expected: pointer cursor, visible hover/focus styling.
  2. Navigate to the forgot-password page, then use browser Back — expected: returns cleanly to the login page (no broken state).
- **Assertions:**
  - Link is operable via keyboard (Enter activates it).
- **Edge cases considered:** rapid double-activation of the link.

### Scenario 8.1 — Login button enabled/disabled state
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login page loaded.
- **Steps:**
  1. Observe button state with empty form — expected: either disabled, or enabled but blocked by validation on click (document actual behavior).
  2. Fill both fields with valid-format values — expected: button becomes enabled/clickable.
- **Assertions:**
  - Button state accurately reflects form validity at all times.
- **Edge cases considered:** filling then clearing a field back to empty.

### Scenario 8.2 — Submission via click and Enter key
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Valid-format credentials entered.
- **Steps:**
  1. Submit by clicking the Login button — expected: login request is sent.
  2. Repeat with Enter key from within the password field — expected: identical submission behavior.
- **Assertions:**
  - Both submission methods trigger the same login request/behavior.
- **Edge cases considered:** pressing Enter while focus is on the email field (before password is filled).

### Scenario 8.3 — Loading state and duplicate-submission prevention
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Valid-format credentials entered.
- **Steps:**
  1. Submit and immediately click the button again multiple times (rapid clicking) — expected: only one login request is sent; button shows a loading/disabled state during the request.
  2. Double-click the button as a single rapid action — expected: same single-request guarantee.
- **Assertions:**
  - Exactly one `POST` to the login endpoint occurs per legitimate submission attempt.
- **Edge cases considered:** pressing Enter repeatedly while a request is already in-flight.

### Scenario 8.4 — Login button visual states and copy
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Login page loaded.
- **Steps:**
  1. Hover and focus the button — expected: consistent hover/focus styling.
  2. Read the button label — expected: correct, unambiguous text (e.g. "Login" / "Log In" — matches design copy).
- **Assertions:**
  - Button label does not change unexpectedly outside of an explicit loading state.
- **Edge cases considered:** label overflow/truncation at narrow widths.

### Scenario 9.1 — Validation message correctness
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Trigger validation errors on both fields.
- **Steps:**
  1. Inspect message content for each error case — expected: message text is accurate and field-specific (not generic/mismatched).
  2. Inspect message placement and styling — expected: message appears directly associated with its field, consistent styling across fields.
- **Assertions:**
  - No message overlaps another element or causes layout breakage.
- **Edge cases considered:** both fields invalid simultaneously (both messages shown without collision).

### Scenario 9.2 — Validation message lifecycle
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A validation error is currently shown.
- **Steps:**
  1. Correct the invalid field — expected: the associated error message disappears (on blur or on valid input, per app behavior).
  2. Re-trigger the same error — expected: message reappears identically.
- **Assertions:**
  - Message visibility state always matches current field validity.
- **Edge cases considered:** correcting one field while the other remains invalid (only the corrected field's message clears).

### Scenario 10.1 — Successful login reaches the Dashboard
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Valid admin credentials available.
- **Steps:**
  1. Submit valid credentials — expected: login request succeeds, browser redirects to the Dashboard route.
  2. Observe the Dashboard page — expected: it loads without console errors and without failed network requests (informed by, not asserting on, `GET /game/admin/word` and `GET /admin/activity`).
- **Assertions:**
  - Post-login URL matches the expected Dashboard route.
  - No unhandled JavaScript error occurs during or immediately after redirect.
- **Edge cases considered:** slow login response (loading state remains visible until redirect); Dashboard is not explored further beyond confirming it loaded.

### Scenario 11.1 — Wrong credentials show an error
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login page loaded.
- **Steps:**
  1. Submit a valid-format but wrong email with any password — expected: generic authentication error, no account-existence leak.
  2. Submit a valid/known email with the wrong password — expected: same generic error.
  3. Submit both wrong — expected: same generic error.
- **Assertions:**
  - Error message wording is identical regardless of which field was wrong (prevents user enumeration).
- **Edge cases considered:** error message does not reference internal error codes or stack details.

### Scenario 11.2 — Deleted or disabled account
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** A known deleted or disabled test account exists (if available in staging).
- **Steps:**
  1. Attempt login with a deleted/disabled account's credentials — expected: clear, appropriate error; no partial/successful login state.
- **Assertions:**
  - No session/token is established for a rejected login attempt.
- **Edge cases considered:** account disabled mid-session (out of scope here, noted for awareness only).

### Scenario 11.3 — Locked account (if supported)
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Account lockout is a supported feature (verify with the team before automating; skip otherwise).
- **Steps:**
  1. Trigger the lockout threshold (repeated failed attempts) — expected: account-locked message distinct from generic invalid-credentials error.
- **Assertions:**
  - Locked-state error does not reveal excessive detail (e.g. exact unlock time, if that's a security concern for this app).
- **Edge cases considered:** successful login attempt immediately after lockout should still be rejected.

### Scenario 11.4 — Server error handling
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Ability to simulate/mock a 5xx response from the login endpoint.
- **Steps:**
  1. Submit valid-format credentials while the login API returns a 500 — expected: user-facing error message, form remains usable (not stuck in a permanent loading state).
- **Assertions:**
  - Login button returns to an actionable state after the failed request resolves.
- **Edge cases considered:** 502/503/504 variants all handled the same way from the UI's perspective.

### Scenario 11.5 — Network interruption and timeout
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Ability to simulate offline/slow network conditions.
- **Steps:**
  1. Submit with the network offline — expected: request-failure message, no indefinite spinner.
  2. Submit with an artificially delayed response — expected: reasonable timeout handling or continued loading state without freezing the UI.
- **Assertions:**
  - UI recovers to an actionable state after the network issue resolves or is retried.
- **Edge cases considered:** connectivity restored mid-request (does the pending request resolve or need resubmission?).

### Scenario 12.1 — Full keyboard-only completion
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Login page loaded, mouse not used.
- **Steps:**
  1. Tab from page load through email, password, visibility icon, forgot password, and login button — expected: logical, complete focus order.
  2. Use Shift+Tab to reverse through the same order — expected: mirrors forward order exactly.
  3. Complete and submit the form using only Tab, typing, and Enter — expected: successful submission identical to mouse-driven flow.
- **Assertions:**
  - No interactive element is unreachable by keyboard; no keyboard trap occurs.
- **Edge cases considered:** Space key activating the visibility icon vs. accidentally activating the login button if focus order is wrong.

### Scenario 12.2 — Focus visibility
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Keyboard navigation in progress.
- **Steps:**
  1. Tab to each interactive element — expected: a clearly visible focus indicator at every stop.
- **Assertions:**
  - Focus indicator has sufficient contrast against its background at every stop.
- **Edge cases considered:** focus indicator visibility on both light backgrounds and any accent-colored elements.

### Scenario 13.1 — Accessible labels and required-field indication
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded.
- **Steps:**
  1. Inspect accessible names for email and password fields — expected: each has a programmatically associated label (not just placeholder text).
  2. Inspect required-field indication — expected: required state is exposed to assistive tech (e.g. `aria-required` or equivalent), not conveyed by color/asterisk alone.
- **Assertions:**
  - Screen-reader-relevant attributes (roles, labels, `aria-*` where applicable) are present on all form controls.
- **Edge cases considered:** placeholder text mistaken for a label (fails once the field is focused/filled).

### Scenario 13.2 — Color contrast compliance
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded, including an error state.
- **Steps:**
  1. Measure contrast ratio of body text, labels, placeholder text, button text, and error/validation text against their backgrounds — expected: meets WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components).
- **Assertions:**
  - No text element falls below the applicable contrast threshold.
- **Edge cases considered:** disabled button text contrast (often exempt from AA but should still be reviewed).

### Scenario 14.1 — Responsive layout integrity
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Load the page at desktop, tablet, and mobile viewport widths, in both portrait and landscape — expected: consistent alignment and spacing at every size.
- **Assertions:**
  - No horizontal scrolling and no clipped/overflowing content at any tested size.
- **Edge cases considered:** very small viewports (< 360px wide), unusual aspect ratios (foldables).

### Scenario 14.2 — Touch usability at small viewports
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Mobile viewport active.
- **Steps:**
  1. Verify tap targets (fields, visibility icon, forgot password link, login button) — expected: adequately sized and spaced for touch (no accidental mis-taps between adjacent controls).
- **Assertions:**
  - Interactive elements meet a reasonable minimum touch-target size.
- **Edge cases considered:** on-screen keyboard covering the login button when the password field is focused.

### Scenario 15.1 — Cross-browser core flow consistency
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Chromium, Firefox, and WebKit projects configured (per `playwright.config.js`).
- **Steps:**
  1. Run the core login flow (load → fill → submit → redirect) on each browser engine — expected: identical outcome and no engine-specific rendering break.
- **Assertions:**
  - Successful login and validation-error behavior are consistent across all three engines.
- **Edge cases considered:** WebKit-specific autofill UI, Firefox-specific password manager prompts.

### Scenario 16.1 — Performance observations
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** none.
- **Steps:**
  1. Observe and record page load time, web font load timing, logo/image load timing, and button response latency after click — expected: no observation is strictly pass/fail here; record baseline numbers for future comparison.
- **Assertions:**
  - This scenario is observational — flag any load exceeding a few seconds or any visible layout shift as a follow-up candidate rather than an automated failure.
- **Edge cases considered:** first load (cold cache) vs. repeat load (warm cache).

### Scenario 17.1 — Client-side validation cannot be bypassed
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** Ability to intercept/modify outgoing requests.
- **Steps:**
  1. Attempt to submit a request directly to the login endpoint bypassing the UI's client-side checks (e.g. by manipulating the DOM/disabled attributes then submitting) — expected: server-side validation still rejects malformed/malicious input; UI does not blindly trust a manipulated response.
- **Assertions:**
  - No successful session is established from a payload that should have failed validation.
- **Edge cases considered:** disabling the submit button's `disabled` attribute via devtools, then clicking it.

### Scenario 17.2 — Session handling and protected-route redirection
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** A logged-in session and a logged-out state, tested separately.
- **Steps:**
  1. After successful login, inspect the URL and storage — expected: no token/credential visible in the URL; token stored appropriately (not trivially exposed, e.g. not logged to console).
  2. Log out (or clear session), then attempt to navigate directly to the Dashboard URL — expected: redirected back to the login page, not granted access.
- **Assertions:**
  - Unauthenticated direct navigation to a protected route never renders protected content.
- **Edge cases considered:** navigating to the Dashboard URL from browser history after logout (should still redirect, not serve a cached authenticated view).

### Scenario 17.3 — No sensitive data leakage
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Login flow completed at least once.
- **Steps:**
  1. Inspect page source and console output before and after login — expected: no plaintext password, token, or other sensitive value logged or embedded in the HTML source.
  2. Review browser autofill save prompts — expected: only expected fields (email/password) are offered for autofill, no unrelated sensitive data captured.
- **Assertions:**
  - No credential or token value appears in `console` output at any point in the flow.
- **Edge cases considered:** error responses accidentally echoing submitted credentials back in a message.

### Scenario 18.1 — [Known issue] Logo mismatch
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded; `Resources/Correct_Logo.png` available for comparison.
- **Steps:**
  1. Compare the rendered login logo against `Resources/Correct_Logo.png` — expected (per design): identical mark.
- **Assertions:**
  - Record as a confirmed UI bug (per the project's `Bugs/Template.md`) if the rendered logo differs from the reference, otherwise mark this scenario as passed/not reproducible.
- **Edge cases considered:** logo differs only at certain viewport sizes (e.g. a mobile-specific logo variant is wrong while desktop is correct).

### Scenario 18.2 — [Known issue] Heading turns red on validation error
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** Page loaded.
- **Steps:**
  1. Trigger a validation error (e.g. submit empty form) — expected (per design): only the validation message/label turns red; the "Welcome Back" heading keeps its original styling.
- **Assertions:**
  - Record as a confirmed UI bug if the heading's color changes when an error is shown, otherwise mark this scenario as passed/not reproducible.
- **Edge cases considered:** heading color under multiple simultaneous validation errors (does it worsen, or is it a one-time trigger?).

### Scenario 18.3 — [Known issue] Heading size
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Page loaded.
- **Steps:**
  1. Compare the "Welcome Back" heading's font size against the rest of the page's type scale and overall design proportions — expected: consistent with the design system, not disproportionately large.
- **Assertions:**
  - Record as a confirmed UI bug if the heading is visually oversized relative to the rest of the form, otherwise mark this scenario as passed/not reproducible.
- **Edge cases considered:** heading size at mobile widths (may reveal the issue more clearly, or may already be responsive-scaled correctly).

### Scenario 18.4 — [Known issue] Missing pointer cursor
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** Page loaded.
- **Steps:**
  1. Hover over every interactive element (password visibility icon, Forgot Password link, Login button, and any other clickable icon/control) — expected: pointer cursor on all of them.
- **Assertions:**
  - Record as a confirmed UI bug (listing each affected element) for any interactive element that does not show a pointer cursor on hover.
- **Edge cases considered:** cursor correct in one browser engine but wrong in another (cross-browser CSS inconsistency).

## Not covered (and why)

- **Dashboard functionality beyond "it loaded"** — explicitly out of scope per the request; only confirmed as a post-login smoke check (10.1).
- **Direct API automation of `/auth/admin/login`, `/game/admin/word`, `/admin/activity`** — explicitly disallowed; these are referenced only to justify frontend network assertions.
- **Destructive actions** (account deletion, permanent lockout without a reset path) — not exercised per standard project safety rules; lockout (11.3) should only be automated after confirming a safe reset mechanism exists in staging.
- **Multi-factor authentication** — not mentioned in scope or observed in the provided API references; add a dedicated plan if/when MFA is confirmed to exist.
- **Full password-reset flow** — only the "Forgot Password" link's navigation is verified (7.1); completing the reset flow itself is a separate feature area.
- **Exact current selectors/DOM structure** — not confirmed against a live browser session while authoring this plan (see Methodology note); the Generator must verify locators live before writing test code, per its standard workflow.

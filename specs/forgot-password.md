# Test Plan: Forgot Password Flow

**Target:** https://admin.six-property.clienturl.net (`/forgot-password` → `/verify-otp` → `/reset-password`)
**Seed:** tests/seed.spec.js
**Date:** 2026-08-01

## Overview

This plan continues the carve-out left by `specs/admin-login.md` ("Full password-reset flow — only the Forgot Password link's navigation is verified"). It covers the three-step reset flow reached from the Login page's "Forgot Password?" link: requesting a code by email, verifying the OTP, and the new-password form. Completing an actual reset end-to-end is deliberately out of scope (see "Not covered").

**Methodology note:** Authored from a live interactive session against staging, including one real OTP round-trip (see 3.2 and 6.2) using the project's own test account (`tests/data/credentials.json`). Route map confirmed live: `/forgot-password` → (valid email) → `/verify-otp` → (valid OTP) → `/reset-password`. `POST /auth/forgot-password` and `POST /auth/verify-forgot-password-otp` were observed directly; no request to a reset-password endpoint was captured because the flow was deliberately not completed.

## Preconditions

- Staging environment is reachable at the Admin Login URL and the "Forgot Password?" link is present (see `specs/admin-login.md` Scenario 7.1).
- A valid, non-production admin test account exists (`tests/data/credentials.json`) whose inbox is reachable for the one manual OTP round-trip already performed during planning; automated scenarios do not depend on reading that inbox.
- Each scenario starts from a clean browser context unless stated otherwise.

## Scenarios

### Scenario 1.1 — Forgot Password page loads with all components
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Navigated from Login via "Forgot Password?".
- **Steps:**
  1. Arrive at `/forgot-password` — expected: logo, "Forgot Your Password?" heading, instructional copy, Email field, "Send code" button, and "Log in here" link are all visible.
- **Assertions:**
  - Each component is queryable by an accessible role/name.
- **Edge cases considered:** direct deep link to `/forgot-password` without coming from Login.

### Scenario 1.2 — "Log in here" returns to sign-in
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** On `/forgot-password`.
- **Steps:**
  1. Click "here" in "Already have an account? Log in here" — expected: navigates back to `/sign-in`.
- **Assertions:**
  - URL matches the sign-in route.
- **Edge cases considered:** unsaved email text is discarded on navigation (acceptable, not asserted).

### Scenario 2.1 — Empty email shows required validation
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** `/forgot-password` loaded, field empty.
- **Steps:**
  1. Click "Send code" with no email entered — expected: inline "*Email is required" error; no request reaches `/auth/forgot-password`.
- **Assertions:**
  - Required-field error is shown next to the Email field.

### Scenario 2.2 — Invalid email format is blocked once the field has been touched
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** `/forgot-password` loaded; an empty submit has already been triggered once (see 2.1) so the form is in its revalidate-on-change state (see 2.3).
- **Steps:**
  1. Enter a malformed email (e.g. `not-an-email.com`) and click "Send code" — expected: "*Please enter a valid email address" error; no request reaches `/auth/forgot-password`.
- **Assertions:**
  - Only a syntactically valid email allows the request to be sent.
- **Edge cases considered:** same malformed-input set already covered for Login (`tests/data/invalid-emails.json`) reused here rather than duplicated.

### Scenario 2.3 — [Known issue] Invalid email triggers the browser's native tooltip instead of the app's own error on a fresh, untouched form
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `/forgot-password` loaded fresh (no prior submit attempt on this page load).
- **Steps:**
  1. Type a malformed email directly (no prior empty-submit) and click "Send code" — expected (per the same validation rule as 2.2): "*Please enter a valid email address" error is shown.
- **Assertions:**
  - Record as a confirmed bug: on a genuinely fresh page load, clicking "Send code" with a malformed email shows the *browser's own native HTML5 validation tooltip* (e.g. Chrome's "Please include an '@' in the email address...") instead of the app's styled error — the form is missing `noValidate`, so the browser blocks submission before React's handler ever runs. No request reaches `/auth/forgot-password`. The app's own message only starts rendering once the field has been "touched" by an earlier failed submit (e.g. the empty-field case in 2.1, which passes native validation trivially) — from then on it revalidates live on every keystroke. See `Bugs/ForgotPassword/admin-forgot-password-silent-format-validation.md` for before/after screenshots.
- **Edge cases considered:** the native tooltip's presence/wording varies by browser and isn't queryable via the DOM/accessibility tree, so only the input's own `validity` state (not the tooltip itself) can be asserted on automatically. The same `noValidate` gap likely affects any form on this app built the same way; not verified beyond this page.

### Scenario 3.1 — [Known issue] Unknown email reveals account existence
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `/forgot-password` loaded.
- **Steps:**
  1. Submit a syntactically valid but non-existent email — expected (per security best practice, matching Login's Scenario 11.1 no-enumeration rule): a generic "if this account exists, a code was sent" style response, identical regardless of whether the account exists.
- **Assertions:**
  - Record as a confirmed bug: the app currently shows a distinct toast, "Unable to find the user.", for a non-existent email — this differs from the "OTP has been sent to your email." toast shown for a real account, allowing an attacker to enumerate valid admin emails. See `Bugs/ForgotPassword/admin-forgot-password-user-enumeration.md`.
- **Edge cases considered:** response timing differences could also leak existence even if the message text were fixed (not measured here).

### Scenario 3.2 — Valid email navigates to OTP verification
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** `/forgot-password` loaded; valid test account email available.
- **Steps:**
  1. Submit the known test account's email — expected: "OTP has been sent to your email." toast; `POST /auth/forgot-password` returns success; browser navigates to `/verify-otp`.
- **Assertions:**
  - Post-submit URL matches `/verify-otp`.
- **Edge cases considered:** this sends a real email each run, mirroring the existing convention in `admin-login-security.spec.js` of performing real logins against the staging account.

### Scenario 4.1 — Verify OTP page loads with all components
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** Arrived at `/verify-otp` via 3.2.
- **Steps:**
  1. Observe the page — expected: logo, "Verify OTP" heading, copy naming the destination email, a 6-digit OTP field, a "Verify OTP" button, and a "Click here to resend it" control are all visible.
- **Assertions:**
  - "Verify OTP" button is disabled until all 6 digits are entered.
- **Edge cases considered:** page reached by direct deep link without a prior `/forgot-password` submission (not guarded — see 7.1).

### Scenario 4.2 — Incomplete OTP keeps the submit button disabled
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** On `/verify-otp`, freshly loaded.
- **Steps:**
  1. Enter fewer than 6 digits — expected: "Verify OTP" stays disabled, so an incomplete code can never actually be submitted.
- **Assertions:**
  - Button `disabled` state matches digit count in real time.
- **Note:** the "OTP must be 6 digits" inline text exists in the DOM but — consistent with 2.3 — only renders after the field has been through a prior submit-and-revalidate cycle (e.g. submitting 6 digits, then deleting some). On a fresh page it never appears, which is fine here since the disabled button already prevents a premature submit; not filed as a bug for this field.

### Scenario 4.3 — Incorrect OTP shows an attempts-remaining error
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** On `/verify-otp` with a real pending code (reached via 3.2).
- **Steps:**
  1. Enter a well-formed but wrong 6-digit code and submit — expected: "Invalid OTP. N attempt(s) remaining." toast; page stays on `/verify-otp`.
- **Assertions:**
  - Error toast is shown and the attempts-remaining count decrements from the prior value.
- **Edge cases considered:** exhausting all attempts triggers account lockout (see "Not covered" — deliberately not automated to avoid locking the shared test account).

### Scenario 5.1 — Resend control is present and operable
- **Priority:** P2
- **Tags:** @regression
- **Preconditions:** On `/verify-otp`.
- **Steps:**
  1. Click "Click here" (resend) — expected: a fresh "OTP has been sent to your email." toast.
- **Assertions:**
  - Resend control is reachable via keyboard and re-triggers the send-code flow.
- **Edge cases considered:** resend cooldown/rate-limit timing (not measured here).

### Scenario 6.1 — Verified OTP navigates to Reset Password
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** A real, correct OTP for the test account (obtained manually — not part of the automated suite).
- **Steps:**
  1. Enter the correct code and submit — expected: "OTP has been verified successfully." toast; browser navigates to `/reset-password`.
- **Assertions:**
  - Post-submit URL matches `/reset-password`.
- **Edge cases considered:** this scenario cannot be automated in CI without a mechanism to read a live inbox; documented here from the one manual verification performed during planning, not encoded as an automated test.

### Scenario 7.1 — Reset Password page loads with all components
- **Priority:** P0
- **Tags:** @smoke
- **Preconditions:** none — confirmed the route renders even via direct navigation with no prior OTP verification (see Observation below).
- **Steps:**
  1. Load `/reset-password` — expected: logo, "Reset Password" heading, "Setup new password." copy, New Password field (with visibility toggle), Confirm Password field (with visibility toggle), "Reset Password" button, and "Back to Login here" link are all visible.
- **Assertions:**
  - Each component is queryable by an accessible role/name.
- **Observation (not a scenario, not automated):** `/reset-password` renders its full form on a bare, unauthenticated direct navigation — there is no visible client-side redirect back to `/forgot-password` for a session with no verified OTP. Whether the server rejects a submission from such a session was not tested (doing so risked using a still-live verified-session cookie left over from the real OTP round-trip performed earlier in the same planning session, which could have caused a real password change). Flagged for the team to confirm server-side enforcement rather than filed as a confirmed bug.

### Scenario 7.2 — Empty submission shows required validation on both fields
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** `/reset-password` loaded, fields empty.
- **Steps:**
  1. Click "Reset Password" with both fields empty — expected: "*Password is required" under both New Password and Confirm Password; no request is sent.
- **Assertions:**
  - Both required-field errors are shown simultaneously.

### Scenario 7.3 — Mismatched passwords are blocked before submission
- **Priority:** P0
- **Tags:** @critical
- **Preconditions:** `/reset-password` loaded.
- **Steps:**
  1. Enter two different values in New Password and Confirm Password, then submit — expected: "*Passwords must match" error under Confirm Password; no request reaches a reset endpoint.
- **Assertions:**
  - No network request fires while the mismatch error is showing.

### Scenario 7.4 — New password is masked by default and toggle works
- **Priority:** P1
- **Tags:** @regression
- **Preconditions:** `/reset-password` loaded.
- **Steps:**
  1. Type into New Password — expected: masked by default (`type="password"`).
  2. Click its visibility toggle — expected: becomes plain text; click again — expected: re-masks.
  3. Repeat for Confirm Password.
- **Assertions:**
  - Each field's toggle is independent (toggling one does not affect the other).

## Not covered (and why)

- **Completing an actual password reset** (correct OTP + matching new password submitted successfully) — would change the shared admin credential that every other spec in `tests/data/credentials.json` and `.env` depends on; only explored manually once, by hand, and stopped short of the final submit.
- **OTP lockout after exhausting all attempts** — would lock the shared test account out of the reset flow; the decrementing "attempt(s) remaining" behavior is verified with a single wrong attempt (4.3) rather than run to exhaustion.
- **Server-side enforcement of the `/reset-password` route without a verified OTP session** — see the Observation under 7.1; not automated due to the risk of an accidental real reset from a leftover session cookie.
- **Resend cooldown/rate-limit timing** — not measured; flagged as an edge case only.
- **Reading the real OTP from an inbox as part of CI** — no email-fetching fixture exists in this repo; 6.1 is documented from a manual check, not automated.

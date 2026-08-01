# Manual Test Cases — Forgot Password: Known Issues

These match the automated tests in `tests/Auth/admin-forgot-password-known-issues.spec.js`. Each one checks a specific, newly-found problem.

---

### TC-72: An email that has no account should not get a different message than a real one

**What to check:** Whether someone can figure out which emails belong to real admin accounts just by trying the "Forgot Password" form.

**Steps:**
1. Open the "Forgot Your Password?" page.
2. Type an email that you know does NOT belong to any admin account (but looks like a real email, e.g. `nonexistent.qa.user@example.com`).
3. Click "Send code" and note the message.
4. Repeat with a real admin account's email.
5. Compare the two messages.

**Expected result:** Both should show the same message (something like "if this account exists, a code was sent"), so nobody can tell the two apart.

> ⚠️ **Known issue:** This currently fails — an unknown email shows "Unable to find the user.", clearly different from the "OTP has been sent to your email." message for a real account. See `Bugs/ForgotPassword/admin-forgot-password-user-enumeration.md`.

---

### TC-73: A wrong-format email should show the page's own warning the very first time, not the browser's generic popup

**What to check:** Whether typing a bad email and clicking "Send code" shows this page's own red warning message right away, the very first time you try it on a fresh page — rather than a small grey browser popup.

**Steps:**
1. Open the "Forgot Your Password?" page fresh (don't click "Send code" for any other reason first).
2. Type `not-an-email.com` directly into the email box.
3. Click "Send code" and look closely at what appears near the box.

**Expected result:** The page's own red "*Please enter a valid email address" message should appear below the box.

> ⚠️ **Known issue:** This currently fails — on a truly fresh page, you instead get a small grey tooltip from the browser itself (e.g. "Please include an '@' in the email address"), not this page's own red message. That's easy to miss and looks completely different depending on which browser you're using. The page's own red message only shows up if you'd already clicked "Send code" once before with an empty box (see TC-60) — after that, it appears live as you type, without even needing to click again. See `Bugs/ForgotPassword/admin-forgot-password-silent-format-validation.md`.

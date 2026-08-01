# Manual Test Cases — Forgot Password: Reset Password

These match the automated tests in `tests/Auth/admin-reset-password-form.spec.js`.

> ℹ️ These checks only cover what happens on this page itself (the form's own warnings). None of them actually finish resetting a real password — that step is intentionally left to be done by hand, since it would change the shared test account's password. See `specs/forgot-password.md`, "Not covered", for why.

---

## Form Components

### TC-67: All the parts of the "Reset Password" page are visible

**What to check:** Every piece of the new-password form is there and shows up correctly.

**Steps:**
1. Go directly to the "Reset Password" page (it can be reached without going through the earlier steps first — see TC-71 note below).
2. Look for: the logo, the "Reset Password" title, "Setup new password." text, the New Password box (with an eye icon), the Confirm Password box (with an eye icon), and the "Reset Password" button.

**Expected result:** All of the above are visible on the page.

---

## Validation

### TC-68: Leaving both password boxes empty shows warnings on both

**What to check:** Submitting with nothing typed shows a clear message under each box.

**Steps:**
1. Open the "Reset Password" page.
2. Leave both boxes empty and click "Reset Password".

**Expected result:** A "password is required" message appears under both the New Password box and the Confirm Password box.

---

### TC-69: Typing two different passwords shows a "must match" warning

**What to check:** The form catches it if the two boxes don't match before letting you submit.

**Steps:**
1. Open the "Reset Password" page.
2. Type one password into "New Password" (e.g. `TempTest@1234`).
3. Type a different password into "Confirm Password" (e.g. `DifferentTest@5678`).
4. Click "Reset Password".

**Expected result:** A "passwords must match" message appears under Confirm Password, and nothing is submitted.

---

## Show/Hide Password

### TC-70: Both eye icons work independently

**What to check:** Each password box has its own hide/show toggle, and toggling one doesn't affect the other.

**Steps:**
1. Open the "Reset Password" page.
2. Type a password into both boxes.
3. Click the eye icon next to "New Password" only.
4. Check whether "Confirm Password" is still hidden.
5. Now click the eye icon next to "Confirm Password" too.

**Expected result:** Both boxes are hidden by default. Revealing "New Password" does not reveal "Confirm Password" — each toggle only affects its own box.

---

> **TC-71 note (observation, not a confirmed bug):** Typing this page's web address directly into the browser opens the "Reset Password" form immediately, even without going through "Forgot Your Password?" and "Verify OTP" first. Whether actually submitting a new password this way would be rejected by the server wasn't tested (doing so risked using a real, still-active session from an earlier legitimate check and could have changed the real test account's password). Worth a developer double-checking that the server rejects a reset attempt made without a properly verified code, even if the page itself doesn't block the visit.

# Manual Test Cases — Checking Previously Reported Visual Issues

These match the automated tests in `tests/Auth/admin-login-known-issues.spec.js`. Each one checks whether a specific, previously reported problem is still happening.

---

### TC-54: The "Welcome Back" title should never turn red

**What to check:** When a warning message appears, only the warning itself should be red — the big "Welcome Back" title should stay looking normal.

**Steps:**
1. Open the Admin Login page.
2. Note the color of the "Welcome Back" title (it should be black).
3. Click "Log In" without typing anything, so the warning messages appear.
4. Check the "Welcome Back" title's color again.

**Expected result:** The title's color should not change — it should still look the same (black) as before.

> ✅ This currently works correctly — it was reported as an issue in the past, but couldn't be reproduced, so it's just being watched to make sure it doesn't come back.

---

### TC-55: The "Email" and "Password" titles should not turn red

**What to check:** Only the small warning text (like "Email is required") should turn red — the "Email" and "Password" titles above the boxes should stay their normal color.

**Steps:**
1. Open the Admin Login page.
2. Note the color of the "Email" and "Password" titles above their boxes (should be black).
3. Click "Log In" without typing anything.
4. Check the color of the "Email" and "Password" titles again (not the small warning text below them).

**Expected result:** The "Email" and "Password" titles should stay their normal color, unaffected by the warning.

> ⚠️ **Known issue:** This currently fails — both titles turn red along with the warning messages. See `Bugs/Login/admin-login-field-label-turns-red.md`.

---

### TC-56: The mouse pointer should change to a "hand" over every clickable item

**What to check:** Hovering the mouse over anything clickable should show a hand-shaped cursor, the normal signal that something is clickable.

**Steps:**
1. Open the Admin Login page.
2. Hover your mouse over: the eye icon in the password box, the "Log In" button, and the "Forgot Password?" text — one at a time.

**Expected result:** The cursor should turn into a hand/pointer shape over all three.

> ⚠️ **Known issue:** This currently fails — the cursor stays as a plain arrow over all three items. See `Bugs/Login/admin-login-missing-pointer-cursor.md`.

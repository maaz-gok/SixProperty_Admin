# Manual Test Cases — Forgot Password: Full Reset Cycle

This matches the automated test in `tests/Auth/admin-forgot-password-full-reset.spec.js`.

> ⚠️ **Only run this with the dedicated Forgot Password test account** (`maaz+admin@geeksofkolachi.com` — see `tests/data/forgot-password.json`). This is the one test that actually changes a real password. Never run it against the normal Login test account, since other tests depend on that password staying the same.

---

### TC-74: Resetting the password for real works end-to-end, and can be set back afterwards

**What to check:** That the whole "I forgot my password" journey actually works for real — not just the screens along the way, but the actual password change, logging in with the new one, and setting it back again afterward.

**Steps:**
1. Go through the full flow once: "Forgot Password?" → enter the dedicated test account's email → check the email for the code → enter the code → land on "Reset Password" → set a temporary new password (e.g. `TempReset@2026!`) → click "Reset Password".
2. You should land on a "Your Password Successfully Changed" page. Click "Sign In".
3. Log in with the dedicated test account's email and the temporary new password.
4. Once logged in, sign out.
5. Go through the whole flow again, this time setting the password back to the original one.
6. Log in one more time with the email and the original password.

**Expected result:**
- Step 2: A clear success page appears, with a button to sign in.
- Step 3: The new password works and takes you to the Dashboard.
- Step 6: The original password works again — the account is back exactly how it started.

> ✅ This currently works correctly.

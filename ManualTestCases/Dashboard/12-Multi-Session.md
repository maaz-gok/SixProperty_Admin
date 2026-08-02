# Manual Test Cases — Dashboard: Multi-Tab & Multi-Session Behavior

These match the automated tests in `tests/Dashboard/dashboard-multi-session.spec.js`.

---

### TC-123: Signing out in one tab eventually logs out another open tab too

**Steps:**
1. Log in to the Dashboard in one browser tab.
2. Open a second tab in the *same browser window* (not a new incognito window) and go to the Dashboard there too — it should already be logged in.
3. In the first tab, click "Sign Out".
4. Go to the second tab and refresh it (or click something that makes it talk to the server again).

**Expected result:** The second tab should also end up logged out (redirected to sign-in) once it next checks in with the server — it doesn't need to happen instantly, but it shouldn't keep working as if nothing happened.

---

### TC-124: Logging in from a second browser/device doesn't log out the first one

**What to check:** This app currently allows the same admin account to be logged in from more than one place at once.

**Steps:**
1. Log in to the Dashboard in one browser (or browser profile).
2. Using a completely separate browser (or a different browser profile/incognito window), log in with the *same* admin account.
3. Go back to the first browser and refresh the Dashboard.

**Expected result:** The first session should still be logged in and working normally — logging in elsewhere with the same account does not kick out the original session. This is the current, intended behavior, not a bug.

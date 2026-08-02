# Manual Test Cases — Dashboard: Access Control

These match the automated tests in `tests/Dashboard/dashboard-auth-guard.spec.js`.

---

### TC-121: You can't see the Dashboard just by typing its address, without logging in

**Steps:**
1. Make sure you're logged out.
2. Type the Dashboard's address directly into the browser and press Enter.

**Expected result:** You're redirected to the sign-in page, and at no point do you see any real Dashboard content (no heading, no data table) flash on screen first.

---

### TC-122: If your access is rejected while using the Dashboard, you see broken widgets instead of being sent to sign-in

**What to check:** What happens if the Dashboard's own data requests get rejected as "unauthorized" while you're already on the page (for example, if your access was revoked on the backend while you still had the page open).

**Steps:**
1. Log in to the Dashboard.
2. Make the Dashboard's data requests fail as "unauthorized" (see `Bugs/Dashboard/` evidence for how this was simulated using DevTools' "Block request URL" on the `activity` and `word` requests).
3. Refresh the page.

**Expected result:** You stay on the Dashboard page. Every summary card shows "0", and Recent Activity shows a "Something went wrong" message with a "Retry" button — the app doesn't automatically send you back to sign-in in this case. This is current, accepted behavior (the Retry button gives you a way forward), not something currently tracked as a bug.

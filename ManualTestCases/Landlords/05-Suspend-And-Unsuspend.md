# Manual Test Cases — Landlords: Suspend & Unsuspend

These match the automated tests in `tests/Landlords/landlords-suspend.spec.js`.

> **Important:** Never use `nostaw22@gmail.com` ("Jeremy") for any of these tests — that's a real client's account, not a test account. Always use one of the disposable "Maaz Landlord ###" test accounts, and make sure to put it back to its original status (Active/Suspended) when you're done.

---

### TC-146: Suspending a landlord should ask "are you sure?" before it actually happens

**What to check:** Suspending someone's account is a big action — the app should double-check with you before doing it.

**Steps:**
1. Find any test landlord marked "Active".
2. Click the "Suspend" button next to their name.

**Expected result:** A confirmation pop-up should appear asking you to confirm, before anything actually changes. The account should stay "Active" until you confirm.

> ⚠️ **Known issue:** This currently fails — no confirmation pop-up appears at all. Clicking "Suspend" immediately suspends the account, with no way to back out. See `Bugs/Landlords/landlords-suspend-no-confirmation.md`.

---

### TC-147: Unsuspending a landlord should also ask "are you sure?" first

**Steps:**
1. Find any test landlord marked "Suspended".
2. Click the "Unsuspend" button next to their name.

**Expected result:** A confirmation pop-up should appear before the account is reactivated.

> ⚠️ **Known issue:** This currently fails, the same way as TC-146 — clicking "Unsuspend" reactivates the account immediately, with no confirmation step. See `Bugs/Landlords/landlords-suspend-no-confirmation.md`.

---

### TC-148: Clicking "Suspend" twice quickly doesn't cause any problems

**Steps:**
1. Find any test landlord marked "Active".
2. Click "Suspend" once, then immediately try clicking it again (or double-click it) before the page has a chance to update.

**Expected result:** The button should grey itself out right after your first click, so the second click can't do anything. Only one suspend action should go through.

---

### TC-149: If suspending fails (e.g. no internet), the account isn't left in a broken state

**What to check:** This one is hardest to test by hand since it needs a real network failure — mainly here so the underlying behavior is documented.

**Steps:**
1. Find any test landlord marked "Active".
2. Turn off your internet connection (or use a browser tool to block the request) right before clicking "Suspend".
3. Click "Suspend".

**Expected result:** The account's status should stay "Active" since the request never went through — it should not flip to "Suspended" just because you clicked the button.

---

### TC-150: A suspended status sticks around after refreshing the page

**Steps:**
1. Find any test landlord marked "Active" and suspend them.
2. Refresh the page.

**Expected result:** The landlord still shows as "Suspended" after refreshing — the change was saved for real, not just shown temporarily on your screen.

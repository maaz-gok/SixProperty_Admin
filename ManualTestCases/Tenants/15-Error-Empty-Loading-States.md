# Manual Test Cases — Tenants: Error, Empty & Loading States

These match the automated tests in `tests/Tenants/tenants-error-states.spec.js`.

---

### TC-213: Opening a tenant page that doesn't exist should clearly say so

**Steps:**
1. Type a tenant's web address directly into the browser, but change the ID at the end to something made-up (any long string of letters/numbers that isn't a real tenant).

**Expected result:** The page should quickly show a clear message like "Tenant not found", checking only once — not sit there loading for several seconds first.

> ⚠️ **Known issue:** This currently fails — the page sits on a "Loading" spinner for several seconds, quietly checks twice instead of once, and then shows a generic "Something went wrong" message instead of saying the tenant wasn't found. Same shared root cause already reported for Landlords. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-214: Clicking "Retry" on that error shouldn't make things worse

**Steps:**
1. Get to the error screen from TC-213.
2. Click the "Retry" button.

**Expected result:** Clicking Retry should check just once again and show the same clear "not found" message — not check twice again.

> ⚠️ **Known issue:** This currently fails, for the same underlying reason as TC-213.

---

### TC-215: A tenant with no documents and no pets shows both empty messages together

**Steps:**
1. Open the details page of a sparse tenant with neither documents nor pets on file (e.g. "Anus Tenant").

**Expected result:** Both the Documents section (dashes for each document type) and the Pets section ("No pets on file") show their empty states correctly on the same page load, with no errors.

---

### TC-216: Normal use of the Tenants page doesn't produce any unexpected hidden technical errors

**What to check:** This is a technical check, done using your browser's developer console (press F12 or right-click → Inspect → Console tab).

**Steps:**
1. Open the developer console.
2. Use the Tenants page normally: load the list, search, clear the search, filter by status, go to page 2 and back, view a tenant, open a document preview, go back.

**Expected result:** No red error messages appear at any point. The only expected console output during this whole flow is one harmless warning when opening a document preview (a missing screen-reader description) — that one is already known and not something to report.

---

### TC-217: You can't see any tenant information without logging in first

**Steps:**
1. Make sure you're logged out (or use a private/incognito browser window).
2. Try typing the Tenants list address directly into the browser.
3. Try typing a specific tenant's details page address directly.

**Expected result:** Both attempts redirect you to the sign-in page. At no point do you see any real tenant names, emails, or other information flash on screen first.

# Manual Test Cases — Landlords: Error, Empty & Loading States

These match the automated tests in `tests/Landlords/landlords-error-states.spec.js`.

---

### TC-163: Opening a landlord page that doesn't exist should clearly say so

**Steps:**
1. Type a landlord's web address directly into the browser, but change the ID at the end to something made-up (any long string of letters/numbers that isn't a real landlord).

**Expected result:** The page should quickly show a clear message like "Landlord not found", checking only once — not sit there loading for several seconds first.

> ⚠️ **Known issue:** This currently fails — the page sits on a "Loading" spinner for several seconds, quietly checks twice instead of once, and then shows a generic "Something went wrong" message instead of saying the landlord wasn't found. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-164: Clicking "Retry" on that error shouldn't make things worse

**Steps:**
1. Get to the error screen from TC-163.
2. Click the "Retry" button.

**Expected result:** Clicking Retry should check just once again and show the same clear "not found" message — not check twice again.

> ⚠️ **Known issue:** This currently fails, for the same underlying reason as TC-163 — the page still shows the generic error instead of a "not found" message, and still checks more than once. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-165: A landlord with no properties or tenants shows a friendly empty message in both places

**Steps:**
1. Open the details page of a landlord who has 0 properties and 0 tenants.

**Expected result:** The Properties summary number and the Tenants summary number both show "0". Below that, the Properties section says "No properties found" and the Tenants section says "No tenants found" — not a blank space or an error.

---

### TC-166: Normal use of the Landlords page doesn't produce any hidden technical errors

**What to check:** This is a technical check, done using your browser's developer console (press F12 or right-click → Inspect → Console tab).

**Steps:**
1. Open the developer console.
2. Use the Landlords page normally: load the list, search, clear the search, go to page 2 and back, view a landlord, go back, suspend and then unsuspend a test account.

**Expected result:** No red error messages appear in the console at any point during normal use.

---

### TC-167: You can't see any landlord information without logging in first

**Steps:**
1. Make sure you're logged out (or use a private/incognito browser window).
2. Try typing the Landlords list address directly into the browser.
3. Try typing a specific landlord's details page address directly.

**Expected result:** Both attempts redirect you to the sign-in page. At no point do you see any real landlord names, emails, or other information flash on screen first.

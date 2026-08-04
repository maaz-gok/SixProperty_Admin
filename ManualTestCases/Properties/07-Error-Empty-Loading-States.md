# Manual Test Cases — Properties: Error, Empty & Loading States

These match the automated tests in `tests/Properties/properties-error-states.spec.js`.

---

### TC-250: Opening a property page that doesn't exist should clearly say so

**Steps:**
1. Type a property's web address directly into the browser, but change the ID at the end to something made-up (a long string of letters/numbers that isn't a real property).

**Expected result:** The page should quickly show a clear message like "Property not found", checking only once — not sit there loading for several seconds first.

> ⚠️ **Known issue:** This currently fails — the page checks twice instead of once, and then shows a generic "Something went wrong" message instead of saying the property wasn't found. This is the same problem already reported on the Landlords page. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-251: A badly-typed property address has the same problem as a made-up one

**Steps:**
1. Type a property's web address directly into the browser, but replace the ID at the end with something that isn't even a valid ID shape (like plain text, e.g. "not-a-valid-id").

**Expected result:** Same as TC-250 — a clear "not found" message after checking once.

> ⚠️ **Known issue:** Same problem as TC-250 — see `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-252: Clicking "Retry" on that error shouldn't make things worse

**Steps:**
1. Get to the error screen from TC-250.
2. Click the "Retry" button.

**Expected result:** Clicking Retry should check just once again and show the same clear "not found" message — not check twice again.

> ⚠️ **Known issue:** This currently fails, for the same underlying reason as TC-250. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-253: You can't see any property information without logging in first

**Steps:**
1. Make sure you're logged out (or use a private/incognito browser window).
2. Try typing the Properties list address directly into the browser.
3. Try typing a specific property's details page address directly.

**Expected result:** Both attempts redirect you to the sign-in page. At no point do you see any real property address or other information flash on screen first.

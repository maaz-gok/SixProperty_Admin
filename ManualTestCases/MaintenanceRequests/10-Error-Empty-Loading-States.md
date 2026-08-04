# Manual Test Cases — Maintenance Requests: Error, Empty & Loading States

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-error-states.spec.js`.

---

### TC-321: Opening a request page that doesn't exist should clearly say so

**Steps:**
1. Type a request's web address directly into the browser, but change the ID at the end to something made-up (a long string of letters/numbers that isn't a real request).

**Expected result:** The page should quickly show a clear message like "Request not found", checking only once — not sit there loading for several seconds first.

> ⚠️ **Known issue:** This currently fails — the page checks twice instead of once, and then shows a generic "Something went wrong" message instead of saying the request wasn't found. This is the same problem already reported on the Landlords, Tenants, and Properties pages. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-322: A badly-typed request address has the same problem as a made-up one

**Steps:**
1. Type a request's web address directly into the browser, but replace the ID at the end with something that isn't even a valid ID shape (like plain text, e.g. "not-a-valid-id").

**Expected result:** Same as TC-321 — a clear "not found" message after checking once.

> ⚠️ **Known issue:** Same problem as TC-321 — see `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-323: Clicking "Retry" on that error shouldn't make things worse

**Steps:**
1. Get to the error screen from TC-321.
2. Click the "Retry" button.

**Expected result:** Clicking Retry should check just once again and show the same clear "not found" message — not check twice again.

> ⚠️ **Known issue:** This currently fails, for the same underlying reason as TC-321. See `Bugs/Landlords/landlords-details-invalid-id-generic-error.md`.

---

### TC-324: You can't see any request information without logging in first

**Steps:**
1. Make sure you're logged out (or use a private/incognito browser window).
2. Try typing the Maintenance Requests list address directly into the browser.
3. Try typing a specific request's details page address directly.

**Expected result:** Both attempts redirect you to the sign-in page. At no point do you see any real request title or other information flash on screen first.

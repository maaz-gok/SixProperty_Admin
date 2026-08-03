# Manual Test Cases — Landlords: Data Consistency

These match the automated tests in `tests/Landlords/landlords-data-consistency.spec.js`.

> **What to check:** These compare what's shown on screen against what the server actually sent back. This is easiest to verify using your browser's developer tools (Network tab) to see the raw data, but the important thing to check by eye is that nothing on screen looks made-up or mismatched.

---

### TC-151: Everything shown in the landlords list matches the real data

**Steps:**
1. Open the Landlords list.
2. Pick a few different rows and check: name, email, property count, tenant count, status, and joined date.

**Expected result:** Every value shown on screen matches the real underlying data for that landlord — no placeholder numbers, no mismatched status, no wrong dates.

---

### TC-152: Everything shown on a landlord's details page matches the real data

**Steps:**
1. Open a landlord's details page (pick one with at least one property and one tenant, like "Jeremy").
2. Check the summary numbers, the Landlord Information section, and the Properties/Tenants tables.

**Expected result:** The property count matches the number of rows in the Properties table; the tenant count matches the number of rows in the Tenants table; rent amounts show with a "$" sign; "Email Verified" correctly says "Yes" or "No" to match the real account.

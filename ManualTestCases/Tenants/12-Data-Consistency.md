# Manual Test Cases — Tenants: Data Consistency

These match the automated tests in `tests/Tenants/tenants-data-consistency.spec.js`.

> **What to check:** These compare what's shown on screen against what the server actually sent back. This is easiest to verify using your browser's developer tools (Network tab) to see the raw data, but the important thing to check by eye is that nothing on screen looks made-up or mismatched.

---

### TC-202: Everything shown in the tenants list matches the real data

**Steps:**
1. Open the Tenants list.
2. Pick a few different rows and check: name, email, landlord, property, unit, rent, and status.

**Expected result:** Every value shown matches the real underlying data for that tenant. Rent always shows with a "$" sign. Remember that two different tenants can legitimately share the same email (see TC-171) — when checking a row, match it by both name and email together, not email alone.

---

### TC-203: Everything on a tenant's details page matches the real data

**Steps:**
1. Open a fully-populated tenant's details page (e.g. "Maaz Tenant").
2. Check the document buttons' filenames against the real uploaded files, including any unusual characters like spaces in the name.
3. Check that the tenant's Social Security Number is never shown anywhere on the page.

**Expected result:** Document filenames match exactly, character for character. The SSN — even though it does exist in the system for this tenant — never appears anywhere on screen.

# Manual Test Cases — Maintenance Requests: Data Consistency

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-data-consistency.spec.js`.

> **What to check:** These compare what's shown on screen against what the server actually sent back. This is easiest to verify using your browser's developer tools (Network tab) to see the raw data, but the important thing to check by eye is that nothing on screen looks made-up or mismatched.

---

### TC-313: Everything shown in the requests list matches the real data

**Steps:**
1. Open the Maintenance Requests list.
2. Pick a few different rows and check: title, property, tenant, category, priority, status, and created date.

**Expected result:** Every value shown matches the real underlying data for that request. Note that some titles and property names look alike (e.g. "Test" appears more than once, and both "Apex Height" and "Apex Heights" exist as separate properties) — when checking a specific row, make sure you're looking at the exact right one, not a similarly-named one.

---

### TC-314: Everything on a request's details page matches the real data

**Steps:**
1. Open a request's details page (e.g. "Keys issue").
2. Check the title, property name, all three badges, every Request Information field, and the notes against the real data.

**Expected result:** Every value shown matches the real underlying data for that request, including nested details like the landlord's and tenant's info.

---

### TC-315: A status-filtered list matches the real filtered data

**Steps:**
1. Select a status filter (e.g. "In Progress").
2. Compare the number and content of the rows shown against the real count of requests with that status.

**Expected result:** The filtered list shown on screen exactly matches the real data for that status — no extra rows, no missing rows.

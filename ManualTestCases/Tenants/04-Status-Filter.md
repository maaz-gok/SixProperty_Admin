# Manual Test Cases — Tenants: Status Filter

These match the automated tests in `tests/Tenants/tenants-status-filter.spec.js`.

---

### TC-177: Each status option in the dropdown shows only matching tenants

**Steps:**
1. Open the status dropdown next to the search box and choose "Active".
2. Choose "Invited".
3. Choose "Pending".

**Expected result:** Each time, every row shown has that exact status in its Status column — no mismatches. "Pending" is a real, populated option, not an empty dead end — choosing it shows real tenants, not "No data found".

---

### TC-178: Search and the status filter work together as one combined filter

**Steps:**
1. Type a tenant's name who you know is "Active" into the search box (e.g. "jeremy").
2. With that search still in place, also select "Active" from the status dropdown.
3. Now, with the same search still in place, change the status dropdown to a status that tenant does NOT have (e.g. "Invited").

**Expected result:** With matching search + status, the one matching tenant still shows up. When you then pick a status that excludes them, the list correctly shows "No data found" — not an error, and not the tenant showing up anyway.

---

### TC-179: "Reset" clears both the search box and the status filter together

**Steps:**
1. Type any search term and also pick a status from the dropdown.
2. Click "Reset".

**Expected result:** Both the search box and the status dropdown go back to empty/"All", and the full unfiltered list of tenants reappears from page 1.

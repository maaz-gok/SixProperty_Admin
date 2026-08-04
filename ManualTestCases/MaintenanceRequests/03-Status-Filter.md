# Manual Test Cases — Maintenance Requests: Status Filter

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-filters.spec.js`.

---

### TC-274: The "Open" filter shows only Open requests

**Steps:**
1. Select "Open" from the status dropdown.

**Expected result:** Every row shown has "Open" in its Status column — no other statuses appear.

---

### TC-275: The "In Progress" filter shows only In Progress requests

**Steps:**
1. Select "In Progress" from the status dropdown.

**Expected result:** Every row shown has "In Progress" in its Status column.

---

### TC-276: The "Resolved" filter shows only Resolved requests

**Steps:**
1. Select "Resolved" from the status dropdown.

**Expected result:** Every row shown has "Resolved" in its Status column. (This is usually the biggest group, since most requests end up Resolved.)

---

### TC-277: Switching back to the "Status" placeholder clears the filter

**Steps:**
1. With a status filter active, open the dropdown again and pick the blank "Status" option at the top.

**Expected result:** The filter clears and the full, unfiltered list of requests returns.

---

### TC-278: Searching and filtering by status work together, not against each other

**Steps:**
1. Type a tenant's name into the search box.
2. Also select "Resolved" from the status dropdown.

**Expected result:** The table narrows to show only that tenant's Resolved requests — both conditions apply together, in a single combined search rather than two separate, conflicting ones.

---

### TC-279: A search + filter combination that matches nothing shows the empty state

**Steps:**
1. Type a search term that won't match anything, and also pick any status filter.

**Expected result:** The "No data found" message appears, same as a plain no-results search.

---

### TC-280: "Reset" clears both the search box and the status filter together

**Steps:**
1. Type a search term AND select a status filter, so both are active at once.
2. Click "Reset".

**Expected result:** Both the search box and the status dropdown clear at the same time, and the full unfiltered list returns.

---

### TC-281: Applying a status filter jumps you back to page 1

**Steps:**
1. Click "Next" to move to page 2 of the full list.
2. While on page 2, select a status filter.

**Expected result:** You land on page 1 of the filtered results, not page 2.

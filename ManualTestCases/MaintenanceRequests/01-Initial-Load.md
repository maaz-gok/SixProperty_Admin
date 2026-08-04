# Manual Test Cases — Maintenance Requests: Initial Load

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-load.spec.js`.

---

### TC-260: The Maintenance Requests page loads cleanly with everything in place

**Steps:**
1. Log in to the Admin Panel.
2. Click "Maintenance Requests" in the sidebar.

**Expected result:** The page shows the heading "Maintenance Requests" and the text "Track and review maintenance requests." underneath it. A search box, a status dropdown, a table with 8 column headings (Request, Property, Tenant, Category, Priority, Status, Created, Actions), and Previous/Next buttons at the bottom are all visible. "Maintenance Requests" is highlighted in the sidebar as the current page. No error messages appear anywhere.

---

### TC-261: The status dropdown shows all 4 choices in the right order

**Steps:**
1. Open the Maintenance Requests page.
2. Click the status dropdown without picking anything yet.

**Expected result:** The dropdown lists exactly these 4 options, in this order: "Status" (the default), "Open", "In Progress", "Resolved".

---

### TC-262: Every row in the table shows the right kind of information

**Steps:**
1. Look at a resolved request (e.g. "Keys issue").
2. Check that its row shows all 8 pieces of information, and that the Actions column only has a "View" button.

**Expected result:** Every row shows Request, Property, Tenant, Category, Priority, Status, Created, and Actions, in that order. The Actions column never shows anything except a single "View" button — there's no way to edit, delete, or resolve a request directly from this table.

---

### TC-263: Typing the web address directly, and refreshing, both work the same as clicking the link

**Steps:**
1. Log in, then type the Maintenance Requests page's address directly into the browser instead of clicking the sidebar link.
2. Once it loads, refresh the page.

**Expected result:** Both ways of getting there show the exact same page — the same heading, the same list of requests, nothing missing or stuck loading.

---

### TC-264: The column titles (Request, Property, etc.) are just labels — they don't sort the list

**Steps:**
1. Note the order the requests are listed in.
2. Click directly on each column title one at a time (Request, Property, Tenant, Category, Priority, Status, Created).

**Expected result:** Nothing happens when you click a column title — no arrows appear, and the order of the list never changes.

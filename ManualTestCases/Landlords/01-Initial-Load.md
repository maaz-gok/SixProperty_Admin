# Manual Test Cases — Landlords: Initial Load & Table

These match the automated tests in `tests/Landlords/landlords-load.spec.js`.

---

### TC-127: The Landlords page loads cleanly with everything in place

**Steps:**
1. Log in to the Admin Panel.
2. Click "Landlords" in the sidebar.

**Expected result:** The page shows the heading "Manage Landlords" and the text "View, approve, and manage landlord accounts." underneath it. A search box, a table with 7 column headings (Name, Email, Properties, Tenants, Status, Joined, Actions), and Previous/Next buttons at the bottom are all visible. "Landlords" is highlighted in the sidebar as the current page. No error messages appear anywhere.

> ⚠️ **Separate known issue (not part of this check):** The small logo box in the top-left of the sidebar shows a plain purple "6P" box instead of the real company logo. See `Bugs/Landlords/landlords-sidebar-logo-placeholder.md`.

---

### TC-128: Typing the web address directly, and refreshing, both work the same as clicking the link

**Steps:**
1. Log in, then type the Landlords page's address directly into the browser instead of clicking the sidebar link.
2. Once it loads, refresh the page.

**Expected result:** Both ways of getting there show the exact same page — the same heading, the same list of landlords, nothing missing or stuck loading.

---

### TC-129: Every row in the table shows the right kind of information

**Steps:**
1. Look at a landlord who has at least one property and one tenant (e.g. "Jeremy").
2. Look at a landlord with zero properties and zero tenants (e.g. any "Maaz Landlord ###" test account).
3. Look at one "Active" landlord and one "Suspended" landlord.

**Expected result:** Every row shows all 7 pieces of information in order. A landlord with 0 properties/tenants shows "0" in those columns, not blank. The Joined date looks like "Jul 27, 2026". A landlord marked "Active" always has a "Suspend" button in Actions; a landlord marked "Suspended" always has an "Unsuspend" button — never a mismatch.

---

### TC-130: The column titles (Name, Email, etc.) are just labels — they don't sort the list

**Steps:**
1. Note the order the landlords are listed in.
2. Click directly on each column title one at a time (Name, Email, Properties, Tenants, Status, Joined).

**Expected result:** Nothing happens when you click a column title — no arrows appear, and the order of the list never changes.

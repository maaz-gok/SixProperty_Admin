# Manual Test Cases — Tenants: Initial Load

These match the automated tests in `tests/Tenants/tenants-load.spec.js`.

---

### TC-168: The Tenants page loads cleanly with everything in place

**Steps:**
1. Log in to the Admin Panel.
2. Click "Tenants" in the sidebar.

**Expected result:** The page shows the heading "Manage Tenants" and the text "View and manage tenant accounts." underneath it. A search box, a status filter dropdown, a table with 8 column headings (Name, Email, Landlord, Property, Unit, Rent, Status, Actions), and Previous/Next buttons at the bottom are all visible. "Tenants" is highlighted in the sidebar as the current page. Your admin name and a "Sign Out" button are visible. No error messages appear anywhere.

---

### TC-169: Typing the web address directly, and refreshing, both work the same as clicking the link

**Steps:**
1. Log in, then type the Tenants page's address directly into the browser instead of clicking the sidebar link.
2. Once it loads, refresh the page.

**Expected result:** Both ways of getting there show the exact same page — the same heading, the same list of tenants, the search box empty, nothing missing or stuck loading.

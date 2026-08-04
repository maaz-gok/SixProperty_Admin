# Manual Test Cases — Properties: Initial Load

These match the automated tests in `tests/Properties/properties-load.spec.js`.

---

### TC-218: The Properties page loads cleanly with everything in place

**Steps:**
1. Log in to the Admin Panel.
2. Click "Properties" in the sidebar.

**Expected result:** The page shows the heading "Manage Properties" and the text "Review and manage listed properties." underneath it. A search box, a table with 6 column headings (Property, Address, Landlord, Unit, Tenants, Actions), and Previous/Next buttons at the bottom are all visible. "Properties" is highlighted in the sidebar as the current page. No error messages appear anywhere.

---

### TC-219: Typing the web address directly, and refreshing, both work the same as clicking the link

**Steps:**
1. Log in, then type the Properties page's address directly into the browser instead of clicking the sidebar link.
2. Once it loads, refresh the page.

**Expected result:** Both ways of getting there show the exact same page — the same heading, the same list of properties, nothing missing or stuck loading.

---

### TC-220: Moving to another page and back to Properties still works properly

**Steps:**
1. From the Properties page, click "Landlords" in the sidebar.
2. Click "Properties" again to come back.

**Expected result:** Each click takes you to the right page. Coming back to Properties shows the full list again, and "Properties" is highlighted in the sidebar as the current page.

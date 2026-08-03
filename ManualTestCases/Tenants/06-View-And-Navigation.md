# Manual Test Cases — Tenants: View & Navigation

These match the automated tests in `tests/Tenants/tenants-view-navigation.spec.js`.

---

### TC-182: Clicking "View" opens the correct tenant's details page

**Steps:**
1. Note the name of a specific tenant in the table (e.g. "Maaz Tenant").
2. Click the "View" (eye) icon on that tenant's row.

**Expected result:** You land on that tenant's own details page, and the name shown at the top matches the one you clicked, along with a "Tenant Details" subtitle.

---

### TC-183: The browser's Back and Forward buttons move correctly between the list and a tenant's page

**Steps:**
1. From the Tenants list, click "View" on any tenant.
2. Click the browser's own Back button (not the page's own "Back" button).
3. Click the browser's own Forward button.

**Expected result:** Back takes you to the Tenants list; Forward takes you right back to the same tenant's details page, fully loaded again.

---

### TC-184: The page's own "Back" button returns you to the list

**Steps:**
1. Open any tenant's details page.
2. Click the "Back" button near the top of that page (not the browser's own back button).

**Expected result:** You land back on the main Tenants list.

---

### TC-185: Typing a tenant's web address directly opens their page correctly

**Steps:**
1. Copy the web address of a tenant's details page (or type it directly if you know a tenant's ID).
2. Paste/type it into the browser and go there directly, without clicking through the list first.

**Expected result:** The correct tenant's page loads with all their information showing, with no unnecessary delay.

---

### TC-186: Refreshing a tenant's details page keeps showing the same tenant

**Steps:**
1. Open any tenant's details page.
2. Refresh the browser page.

**Expected result:** The same tenant's information reloads correctly — same name, same details, nothing missing.

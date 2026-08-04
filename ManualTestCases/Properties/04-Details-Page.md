# Manual Test Cases — Properties: Details Page

These match the automated tests in `tests/Properties/properties-details.spec.js`.

---

### TC-233: Clicking "View" opens the correct property's page

**Steps:**
1. On the Properties list, note the name of a specific property (e.g. "Grove").
2. Click the "View" button on that property's row.

**Expected result:** You land on that exact property's own page — the heading at the top matches the name of the property you clicked.

---

### TC-234: The details page header shows the property's name, address, and a Back button

**Steps:**
1. Open any property's details page.

**Expected result:** The heading shows the property's name, with its full address just underneath. A "Back" button is visible in the top-right.

---

### TC-235: The Tenants and Open Requests numbers at the top are correct

**Steps:**
1. Open a property's details page.
2. Compare the "Tenants" and "Open Requests" numbers shown at the top against what you'd expect for that property.

**Expected result:** Both numbers are correct for that specific property.

---

### TC-236: The Property Information section shows all the right details

**Steps:**
1. Open a property's details page.
2. Check the "Property Information" section for: Landlord, Landlord Email, Address, Unit, Created (date), and Details.

**Expected result:** All 6 pieces of information are shown and match what's expected for that property. The Created date reads like "Jul 27, 2026".

---

### TC-237: The Tenants table on a property's page shows one tenant correctly

**Steps:**
1. Open the details page of a property with exactly one tenant (e.g. "Grove").
2. Check the Tenants table columns: Name, Email, Phone, Unit, Rent, Status.

**Expected result:** All 6 columns are shown, and the one tenant's row has the correct information. Rent is shown with a "$" sign (e.g. "$800").

---

### TC-238: The Tenants table on a property's page shows multiple tenants correctly

**Steps:**
1. Open the details page of a property with more than one tenant (e.g. "The Marlowe" at "New York , 78901", which has 2 tenants).

**Expected result:** Every tenant shows up as their own row in the table, and the "Tenants" number at the top matches how many rows are shown.

---

### TC-239: A property with zero tenants shows a friendly empty message

**Steps:**
1. Open the details page of a property with zero tenants (e.g. "Green Valley Residences").

**Expected result:** The "Tenants" number at the top shows "0". Below that, instead of an empty table, you see the message "No tenants found".

---

### TC-240: A missing "Details" note shows a dash, not a blank space

**Steps:**
1. Open a property's details page where the "Details" field wasn't filled in by whoever added the property (e.g. "The Marlowe" at "New York , 78901").

**Expected result:** The "Details" field shows a dash ("—") instead of being blank.

---

### TC-241: Opening a property's page only checks the server once, not twice

**What to check:** This is a technical check, done using your browser's developer tools (press F12 or right-click → Inspect → Network tab).

**Steps:**
1. Open the developer tools and go to the Network tab.
2. Open any property's details page.
3. Look for requests going to `/admin/properties/...`.

**Expected result:** You should see exactly one request for that property's data — not two.

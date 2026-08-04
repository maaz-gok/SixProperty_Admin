# Manual Test Cases — Maintenance Requests: Details Page

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-details.spec.js`.

---

### TC-289: Clicking "View" opens the correct request's page

**Steps:**
1. On the list, note the title of a specific request (e.g. "Keys issue").
2. Click the "View" button on that request's row.

**Expected result:** You land on that exact request's own page — the heading at the top matches the title you clicked.

---

### TC-290: The details page header shows the title, the property name, and a Back button

**Steps:**
1. Open any request's details page.

**Expected result:** The heading shows the request's title, with the property's name just underneath it. A "Back" button is visible in the top-right.

---

### TC-291: The three badges show Status, Priority, and Category in that order

**Steps:**
1. Open a request's details page.
2. Look at the row of three small badges just below the header (e.g. "Resolved", "Urgent", "Other").

**Expected result:** The three badges always appear in this order: Status, then Priority, then Category, and each one matches what's shown for that request on the main list.

---

### TC-292: The Request Information section shows all the right details

**Steps:**
1. Open a request's details page.
2. Check the "Request Information" section for: Property, Address, Unit, Landlord, Landlord Email, Tenant, Tenant Email, Tenant Phone, Allow Entry, Created, and Resolved.

**Expected result:** All 11 pieces of information are shown and match what's expected for that request. "Created" shows both a date and a time (e.g. "Jul 17, 2026, 12:29 PM").

---

### TC-293: "Allow Entry" correctly shows "No" when entry isn't allowed

**Steps:**
1. Open the details page of a request where entry is not allowed (e.g. "Test", under "Apex Height").

**Expected result:** The "Allow Entry" field shows "No", not "Yes" or blank.

---

### TC-294: An unresolved request shows a dash in the "Resolved" field

**Steps:**
1. Open the details page of a request that's still Open (not yet resolved).

**Expected result:** The "Resolved" field shows a dash ("—") instead of a date, since it hasn't been resolved yet.

---

### TC-295: A long description displays fully, without being cut off

**Steps:**
1. Open a request with a long, detailed description (e.g. "Keys issue").

**Expected result:** The entire description text is shown, from beginning to end, without being cut short or breaking the page layout.

---

### TC-296: A request with no description shows a dash, not a blank space

**Steps:**
1. Open the details page of a request that has no description written (e.g. "Test").

**Expected result:** The Description section shows a dash ("—") instead of being empty.

---

### TC-297: Opening a request's page only checks the server once, not twice

**What to check:** This is a technical check, done using your browser's developer tools (press F12 or right-click → Inspect → Network tab).

**Steps:**
1. Open the developer tools and go to the Network tab.
2. Open any request's details page.
3. Look for requests going to `/admin/requests/...`.

**Expected result:** You should see exactly one request for that item's data — not two.

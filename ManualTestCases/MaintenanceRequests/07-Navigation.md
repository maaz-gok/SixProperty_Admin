# Manual Test Cases — Maintenance Requests: Navigation

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-navigation.spec.js`.

---

### TC-307: The "Back" button on a request's page returns you to the list

**Steps:**
1. Open any request's details page.
2. Click the "Back" button.

**Expected result:** You're taken back to the main Maintenance Requests list.

---

### TC-308: Your browser's own Back and Forward buttons work correctly too

**Steps:**
1. Open a request's details page.
2. Click your browser's Back button (not the one on the page).
3. Click your browser's Forward button.

**Expected result:** Back takes you to the Maintenance Requests list; Forward takes you back to the same request's page, fully loaded again — not a blank or broken page. No hidden technical errors appear in the browser console during either step.

---

### TC-309: Refreshing a request's details page keeps showing the same request, with only one server check

**Steps:**
1. Open any request's details page.
2. Refresh the browser page.

**Expected result:** The same request's information is shown again after refreshing — nothing changes or gets lost, and (checking the Network tab) only one request is made for the data.

---

### TC-310: Typing a request's web address directly opens it correctly

**Steps:**
1. Copy a request's details page address.
2. Open a new browser tab and paste that address in directly (don't click through the list).

**Expected result:** The request's page loads correctly and shows the right title and property, the same as if you'd clicked through from the list.

---

### TC-311: Refreshing the Maintenance Requests list page keeps showing the full list

**Steps:**
1. Open the Maintenance Requests list.
2. Refresh the browser page.

**Expected result:** The full, unfiltered list of requests is shown again from page 1.

---

### TC-312: Normal use of the page doesn't produce any hidden technical errors

**What to check:** This is a technical check, done using your browser's developer console (press F12 or right-click → Inspect → Console tab).

**Steps:**
1. Open the developer console.
2. Use the page normally: load the list, search, clear the search, view a request, and go back.

**Expected result:** No red error messages appear in the console at any point during normal use.

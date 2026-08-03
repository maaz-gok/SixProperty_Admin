# Manual Test Cases — Landlords: View & Navigation

These match the automated tests in `tests/Landlords/landlords-view-navigation.spec.js`.

---

### TC-141: Clicking "View" opens the correct landlord's details page

**Steps:**
1. Note the name of a specific landlord in the table (e.g. "Jeremy").
2. Click the "View" (eye) icon on that landlord's row.

**Expected result:** You land on that landlord's own details page, and the name shown at the top matches the one you clicked.

---

### TC-142: The browser's Back and Forward buttons move correctly between the list and a landlord's page

**Steps:**
1. From the Landlords list, click "View" on any landlord.
2. Click the browser's own Back button (not the page's own "Back" button).
3. Click the browser's own Forward button.

**Expected result:** Back takes you to the Landlords list; Forward takes you right back to the same landlord's details page, fully loaded again.

---

### TC-143: The page's own "Back" button returns you to the list

**Steps:**
1. Open any landlord's details page.
2. Click the "Back" button near the top of that page (not the browser's own back button).

**Expected result:** You land back on the main Landlords list.

---

### TC-144: Typing a landlord's web address directly opens their page correctly

**Steps:**
1. Copy the web address of a landlord's details page (or type it directly if you know a landlord's ID).
2. Paste/type it into the browser and go there directly, without clicking through the list first.

**Expected result:** The correct landlord's page loads with all their information showing.

---

### TC-145: Refreshing a landlord's details page keeps showing the same landlord

**Steps:**
1. Open any landlord's details page.
2. Refresh the browser page.

**Expected result:** The same landlord's information reloads correctly — same name, same address, nothing missing.

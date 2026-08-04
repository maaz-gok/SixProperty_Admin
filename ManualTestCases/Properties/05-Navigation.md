# Manual Test Cases — Properties: Back Navigation & Browser Behavior

These match the automated tests in `tests/Properties/properties-navigation.spec.js`.

---

### TC-242: The "Back" button on a property's page returns you to the list

**Steps:**
1. Open any property's details page.
2. Click the "Back" button.

**Expected result:** You're taken back to the main Properties list.

---

### TC-243: Your browser's own Back and Forward buttons work correctly too

**Steps:**
1. Open a property's details page.
2. Click your browser's Back button (not the one on the page).
3. Click your browser's Forward button.

**Expected result:** Back takes you to the Properties list; Forward takes you back to the same property's page, fully loaded again — not a blank or broken page. No hidden technical errors appear in the browser console during either step.

---

### TC-244: Going back to the list after searching shows the full list again, not your old search

**Steps:**
1. Search for a property.
2. Click "View" on the matching result.
3. Click "Back".

**Expected result:** You're back on the Properties list with the search box empty and the full list showing — your previous search isn't still applied.

---

### TC-245: Typing a property's web address directly opens it correctly

**Steps:**
1. Copy a property's details page address.
2. Open a new browser tab and paste that address in directly (don't click through the list).

**Expected result:** The property's page loads correctly and shows the right name and address, the same as if you'd clicked through from the list.

---

### TC-246: Refreshing a property's details page keeps showing the same property

**Steps:**
1. Open any property's details page.
2. Refresh the browser page.

**Expected result:** The same property's information is shown again after refreshing — nothing changes or gets lost.

---

### TC-247: Refreshing the Properties list page keeps showing the full list

**Steps:**
1. Open the Properties list.
2. Refresh the browser page.

**Expected result:** The full, unfiltered list of properties is shown again from page 1.

---

### TC-248: Normal use of the Properties page doesn't produce any hidden technical errors

**What to check:** This is a technical check, done using your browser's developer console (press F12 or right-click → Inspect → Console tab).

**Steps:**
1. Open the developer console.
2. Use the Properties page normally: load the list, search, clear the search, view a property, and go back.

**Expected result:** No red error messages appear in the console at any point during normal use.

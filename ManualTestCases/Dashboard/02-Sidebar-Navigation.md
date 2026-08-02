# Manual Test Cases — Dashboard: Sidebar Navigation

These match the automated tests in `tests/Dashboard/dashboard-sidebar-navigation.spec.js`.

---

### TC-79: Every sidebar item is visible with a label and an icon

**What to check:** All the navigation items in the sidebar (Dashboard, Landlords, Tenants, Properties, Maintenance Requests, Platform Activity) are visible, each with its own icon.

**Steps:**
1. Log in and look at the sidebar on the left.
2. Confirm each of the six items listed above is visible, and each has a small icon next to its label.

**Expected result:** All six sidebar items are visible with both a label and an icon.

---

### TC-80: Clicking "Landlords" in the sidebar takes you to the Landlords page

**Steps:**
1. Log in to the Dashboard.
2. Click "Landlords" in the sidebar.

**Expected result:** You land on the Landlords page.

---

### TC-81: Clicking "Tenants" in the sidebar takes you to the Tenants page

**Steps:**
1. Log in to the Dashboard.
2. Click "Tenants" in the sidebar.

**Expected result:** You land on the Tenants page.

---

### TC-82: Clicking "Properties" in the sidebar takes you to the Properties page

**Steps:**
1. Log in to the Dashboard.
2. Click "Properties" in the sidebar.

**Expected result:** You land on the Properties page.

---

### TC-83: Clicking "Maintenance Requests" in the sidebar takes you to the Maintenance Requests page

**Steps:**
1. Log in to the Dashboard.
2. Click "Maintenance Requests" in the sidebar.

**Expected result:** You land on the Maintenance Requests page.

---

### TC-84: Clicking "Platform Activity" in the sidebar takes you to the Platform Activity page

**Steps:**
1. Log in to the Dashboard.
2. Click "Platform Activity" in the sidebar.

**Expected result:** You land on the Platform Activity page.

---

### TC-85: Clicking "Dashboard" in the sidebar while already elsewhere brings you back to the Dashboard

**Steps:**
1. Log in, then click any other sidebar item (e.g. "Landlords") to leave the Dashboard.
2. Click "Dashboard" in the sidebar.

**Expected result:** You're taken back to the Dashboard page.

---

### TC-86: The current page is highlighted in the sidebar, and every item shows a "hand" cursor

**What to check:** It's always clear which page you're on, and every sidebar item looks clickable.

**Steps:**
1. Log in to the Dashboard and look at the sidebar — "Dashboard" should be visually highlighted as the current page.
2. Hover your mouse over each of the six sidebar items, one at a time.

**Expected result:** "Dashboard" is clearly highlighted as active, and the mouse pointer turns into a hand over every sidebar item.

---

### TC-87: You can move through the sidebar items in order using only the Tab key

**Steps:**
1. Log in and click directly on "Dashboard" in the sidebar to place your keyboard focus there.
2. Press Tab repeatedly and watch which item is highlighted each time.

**Expected result:** Tab moves focus through the sidebar items in the same order they're listed: Dashboard → Landlords → Tenants → Properties → Maintenance Requests → Platform Activity.

---

### TC-88: The browser's Back and Forward buttons correctly retrace a chain of sidebar clicks

**What to check:** If you click through several sidebar pages, Back and Forward step through that same history correctly.

**Steps:**
1. Log in to the Dashboard.
2. Click "Landlords", then use the sidebar to go back to "Dashboard", then click "Tenants", then back to "Dashboard" again, then click "Properties".
3. Click the browser's Back button four times in a row, then Forward twice, checking the page after each click.

**Expected result:** Back retraces the exact chain in reverse (Dashboard → Tenants → Dashboard → Landlords), and Forward replays it correctly going the other way.

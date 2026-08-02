# Manual Test Cases — Dashboard: Initial Load

These match the automated tests in `tests/Dashboard/dashboard-load.spec.js`.

---

### TC-75: The dashboard loads cleanly right after logging in

**What to check:** Logging in takes you straight to a fully working Dashboard, with nothing broken behind the scenes.

**Steps:**
1. Log in with a valid admin account.
2. Open the browser's developer tools and check the "Console" tab for red error messages.
3. Check the "Network" tab for any request that failed (shown in red, or with a status like 404/500).
4. Look at the page — you should see the "Dashboard" heading and its description text.

**Expected result:** You land on the Dashboard, the heading and description are visible, and there are no failed network requests or red console errors.

---

### TC-76: Typing the Dashboard address directly, or refreshing, keeps everything working

**What to check:** The Dashboard doesn't break if you reload the page or type its address in directly (while already logged in).

**Steps:**
1. Log in and confirm you're on the Dashboard.
2. Type the Dashboard's address directly into the address bar and press Enter.
3. Refresh the page (F5 or the reload button).

**Expected result:** Both times, you stay on the Dashboard and it still shows the heading, the summary cards, and the Recent Activity list.

---

### TC-77: The page never scrolls sideways on a normal desktop screen

**What to check:** Nothing on the Dashboard is wider than the screen at a normal desktop size.

**Steps:**
1. Log in and land on the Dashboard using a normal desktop-sized browser window.
2. Try scrolling the page left and right.

**Expected result:** The page never scrolls sideways — only up and down.

---

### TC-78: Odd extra text in the web address doesn't break the Dashboard

**What to check:** The Dashboard still works normally even if the web address has extra, unexpected text tacked onto the end (like a tracking link would have).

**Steps:**
1. Log in and confirm you're on the Dashboard.
2. Manually add some extra text to the end of the address, e.g. `?foo=bar&utm_source=test`, and press Enter.
3. Check the Console tab for red error messages.

**Expected result:** The Dashboard still loads normally — heading, summary cards, and activity list all still visible — with no red console errors.

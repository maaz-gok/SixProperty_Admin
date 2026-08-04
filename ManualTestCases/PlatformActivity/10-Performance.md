# Manual Test Cases — Platform Activity: Performance

These match the automated tests in `tests/PlatformActivity/platform-activity-performance.spec.js`.

---

### TC-373: Loading the page only checks the server once

**What to check:** This is a technical check, done using your browser's developer tools (Network tab).

**Steps:**
1. Open the developer tools and go to the Network tab.
2. Load the Platform Activity page fresh.

**Expected result:** You see exactly one request for the activity list — not two or more.

---

### TC-374: Clicking "Next" or "Previous" only checks the server once per click

**What to check:** This is a technical check, done using your browser's developer tools (Network tab).

**Steps:**
1. With the Network tab open, click "Next" once.

**Expected result:** Exactly one new request fires for that click — not a duplicate.

---

### TC-375: Paging through several pages in a row produces no hidden technical errors

**What to check:** This is a technical check, done using your browser's developer console.

**Steps:**
1. Open the developer console.
2. Click "Next" several times in a row.

**Expected result:** No red error messages appear in the console at any point.

---

### TC-376: The number of rows on screen never has extra duplicates

**Steps:**
1. Load the page and count the rows shown.

**Expected result:** The count matches exactly what the server sent for that page — never doubled-up or duplicated rows from a rendering glitch.

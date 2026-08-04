# Manual Test Cases — Maintenance Requests: Pagination

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-pagination.spec.js`.

---

### TC-282: Page 1 starts in the correct state

**Steps:**
1. Open the Maintenance Requests page without searching or filtering anything.

**Expected result:** "Previous" is greyed out, "Next" is clickable, it says "Page 1 of 2" (there are 2 pages of requests in total), and "Showing 1–20 of 33" appears at the bottom.

---

### TC-283: Clicking "Next" and "Previous" moves between pages correctly

**Steps:**
1. Note the requests shown on page 1.
2. Click "Next" — check the requests change and "Previous" becomes clickable.
3. Click "Previous" — check you're back on page 1 with the exact same requests as before.

**Expected result:** Page 2 shows a completely different set of requests than page 1. Going back to page 1 restores the original list exactly.

---

### TC-284: The last page shows a partial list and "Next" turns off

**Steps:**
1. Click "Next" until you reach the last page.

**Expected result:** The last page shows however many requests are left (fewer than a full page, e.g. 13 out of 33), "Next" is greyed out, and "Previous" is still clickable.

---

### TC-285: Refreshing while on page 2 sends you back to page 1

**Steps:**
1. Click "Next" to get to page 2.
2. Refresh the browser page.

**Expected result:** After refreshing, you're back on page 1, and "Previous" is greyed out again.

---

### TC-286: A filtered list that fits on one page shows both buttons greyed out

**Steps:**
1. Select a status filter whose results all fit on a single page (e.g. "Open" or "In Progress").

**Expected result:** It says "Page 1 of 1", and both "Previous" and "Next" are greyed out — there's nothing else to page through.

---

### TC-287: The "Showing A–B of N" text always matches what's actually on screen

**Steps:**
1. Count the rows actually shown in the table.
2. Compare that count to the "Showing A–B of N" text at the bottom.

**Expected result:** The number of rows on screen always equals (B minus A, plus 1) from the "Showing" text — they should never disagree.

---

### TC-288: The page count shown always matches the real total

**Steps:**
1. Reload the page and note "Page 1 of N" and whether "Next" is clickable.

**Expected result:** The "N" and whether "Next" is enabled/disabled always reflect the actual current number of requests — this isn't a hardcoded number, so if more requests get added later, "N" should increase to match.

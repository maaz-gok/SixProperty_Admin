# Manual Test Cases — Platform Activity: Pagination

These match the automated tests in `tests/PlatformActivity/platform-activity-pagination.spec.js`.

---

### TC-351: Page 1 starts in the correct state

**Steps:**
1. Open the Platform Activity page.

**Expected result:** "Previous" is greyed out, "Next" is clickable, and the page shows something like "Page 1 of 9" and "Showing 1–20 of 179" at the bottom (the exact numbers will grow over time as more activity happens).

---

### TC-352: Clicking "Next" shows a different set of activity, still in the right order

**Steps:**
1. Note the rows shown on page 1.
2. Click "Next".

**Expected result:** Page 2 shows a completely different set of rows, and "Previous" becomes clickable.

---

### TC-353: Clicking "Previous" brings back the exact same page 1 you started with

**Steps:**
1. From page 2, click "Previous".

**Expected result:** You're back on page 1 with the exact same rows as your original view.

---

### TC-354: The last page shows however many items are left, and "Next" turns off

**Steps:**
1. Click "Next" repeatedly until you reach the last page.

**Expected result:** The last page shows fewer than 20 rows (whatever's left over), and "Next" becomes greyed out while "Previous" stays clickable.

---

### TC-355: Refreshing while on a later page sends you back to page 1

**Steps:**
1. Click "Next" a couple of times to get past page 1.
2. Refresh the browser page.

**Expected result:** You're back on page 1 after refreshing, with "Previous" greyed out again.

---

### TC-356: The "Showing A–B of N" text always matches what's actually on screen

**Steps:**
1. Count the rows actually shown in the table.
2. Compare that count to the "Showing A–B of N" text at the bottom.

**Expected result:** The number of rows on screen always equals (B minus A, plus 1) from the "Showing" text.

---

### TC-357: The page count shown always matches the real total — it's never a hardcoded number

**Steps:**
1. Note the "Page 1 of N" text and whether "Next" is clickable.

**Expected result:** "N" and whether "Next" is enabled reflect the real, current number of activity records — as more activity happens over time, this number should grow accordingly.

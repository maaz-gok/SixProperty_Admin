# Manual Test Cases — Landlords: Pagination

These match the automated tests in `tests/Landlords/landlords-pagination.spec.js`.

---

### TC-139: Paging forward and backward through the full list works correctly

**Steps:**
1. On page 1, check that "Previous" is greyed out and "Next" is clickable.
2. Click "Next" repeatedly until you reach the last page.
3. Click "Previous" repeatedly to go all the way back to page 1.

**Expected result:** Each time you move to a new page, the list of names actually changes (never shows the same names twice in a row). On the very last page, "Next" becomes greyed out and "Previous" becomes clickable. Going back to page 1 shows the exact same list you started with, and "Previous" is greyed out again.

---

### TC-140: Refreshing while on page 2 (or later) sends you back to page 1

**Steps:**
1. Click "Next" to move to page 2.
2. Refresh the browser page.

**Expected result:** After refreshing, you're back on page 1, with "Previous" greyed out again — your page position is not remembered.

# Manual Test Cases — Tenants: Pagination

These match the automated tests in `tests/Tenants/tenants-pagination.spec.js`.

---

### TC-180: Paging forward and backward through the full list works correctly

**Steps:**
1. On page 1, check that "Previous" is greyed out and "Next" is clickable.
2. Click "Next" repeatedly until you reach the last page.
3. Click "Previous" repeatedly to go all the way back to page 1.

**Expected result:** Each time you move to a new page, the list of names actually changes (never shows the same names twice in a row). On the very last page, "Next" becomes greyed out and "Previous" becomes clickable. Going back to page 1 shows the exact same list you started with, and "Previous" is greyed out again.

---

### TC-181: The page counter always reflects your current filter, not the whole unfiltered list

**What to check:** Right now, no single status filter has enough matching tenants to actually span more than one page in the live data, so this is hard to reproduce exactly as written below — it's mainly here so the expected behavior is documented for whenever the data grows.

**Steps:**
1. Apply a status filter or search that matches more than 20 tenants (if/when the data supports it).

**Expected result:** "Page 1 of X" and the "Showing..." counter should reflect the count of tenants matching your current filter — not the total number of tenants in the whole system.

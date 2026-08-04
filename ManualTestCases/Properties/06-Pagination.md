# Manual Test Cases — Properties: Pagination

This matches the automated test in `tests/Properties/properties-pagination.spec.js`.

---

### TC-249: With the current small number of properties, Previous and Next are both greyed out

**Steps:**
1. Open the Properties list without searching for anything.
2. Look at the bottom of the table.

**Expected result:** It says "Page 1 of 1", and both the "Previous" and "Next" buttons are greyed out (there's currently only one page of properties, so there's nothing else to page through). If more properties get added later and there's more than one page, this should be re-checked by paging through Next and Previous the same way it's tested on the Landlords and Tenants pages.

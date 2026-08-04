# Manual Test Cases — Maintenance Requests: Responsive Layout

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-responsive.spec.js`.

---

### TC-316: On a normal desktop screen, neither page needs to scroll sideways

**Steps:**
1. Open the Maintenance Requests list on a regular desktop-sized browser window (roughly laptop width, around 1280px).
2. Open a request's details page at the same width.

**Expected result:** Everything fits without either page needing to scroll sideways. (Good news: unlike the Tenants page, this module doesn't have the header-overflow problem at this width.)

---

### TC-317: On a tablet-sized screen, the request list scrolls the whole page sideways — it shouldn't

**Steps:**
1. Resize your browser window to a tablet width (or open the site on an actual tablet), roughly the width of an iPad held upright.
2. Try to scroll right on the request list to see the later columns.

**Expected result:** Only the table itself should scroll sideways — the page heading, search box, and sidebar menu should all stay fully visible and in place the whole time.

> ⚠️ **Known issue:** This currently fails, for the same reason already reported on the Landlords page — the sidebar menu doesn't shrink or hide itself at this width, so the *entire page* scrolls sideways instead of just the table. This is actually the worst case of this bug seen so far, since this table has more columns than any other list page. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` (confirmed to reproduce here too).

---

### TC-318: On a tablet-sized screen, a request's own page fits properly (unlike the list)

**Steps:**
1. Resize your browser window to a tablet width.
2. Open any request's details page and try to scroll right.

**Expected result:** Nothing on this page should need to scroll sideways at this width — and it doesn't. Unlike the list page (TC-317), a request's own details page does not have this problem here.

---

### TC-319: On a phone-sized screen, the sidebar tucks away and the list fits properly

**Steps:**
1. Resize your browser window to a phone width (or open the site on an actual phone).
2. Check whether the sidebar menu is visible without tapping anything.

**Expected result:** The sidebar menu is fully hidden by default at this width, and the page doesn't need to scroll sideways.

---

### TC-320: On a phone-sized screen, a request's own page also fits properly

**Steps:**
1. Resize your browser window to a phone width.
2. Open any request's details page.

**Expected result:** Everything fits and reads properly without the page needing to scroll sideways.

# Manual Test Cases — Properties: Responsive Layout

These match the automated tests in `tests/Properties/properties-responsive.spec.js`.

---

### TC-256: On a normal desktop screen, the page shouldn't need to scroll sideways

**Steps:**
1. Open the Properties list on a regular desktop-sized browser window (roughly laptop width, around 1280px).
2. Open a property's details page at the same width.

**Expected result:** Everything fits without the whole page needing to scroll sideways, on both the list and a property's own page. (Good news: unlike the Tenants page, the Properties page does not have the header-overflow problem at this width.)

---

### TC-257: On a tablet-sized screen, the Properties list scrolls the whole page sideways — it shouldn't

**Steps:**
1. Resize your browser window to a tablet width (or open the site on an actual tablet), roughly the width of an iPad held upright.
2. Try to scroll right on the Properties list to see the Landlord/Unit/Tenants/Actions columns.

**Expected result:** Only the table itself should scroll sideways — the page heading, search box, and sidebar menu should all stay fully visible and in place the whole time.

> ⚠️ **Known issue:** This currently fails, for the same reason already reported on the Landlords page — the sidebar menu doesn't shrink or hide itself at this width, so the *entire page* scrolls sideways instead of just the table. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` (confirmed to reproduce identically here).

---

### TC-258: On a tablet-sized screen, a property's own page fits properly (unlike the list)

**Steps:**
1. Resize your browser window to a tablet width.
2. Open any property's details page and try to scroll right.

**Expected result:** Nothing on this page should need to scroll sideways at this width — and it doesn't. Unlike the list page (TC-257), a property's own details page does not have this problem here.

---

### TC-259: On a phone-sized screen, the sidebar tucks away and the page fits properly

**Steps:**
1. Resize your browser window to a phone width (or open the site on an actual phone).
2. Check whether the sidebar menu is visible without tapping anything.

**Expected result:** The sidebar menu is fully hidden by default at this width, and the page doesn't need to scroll sideways.

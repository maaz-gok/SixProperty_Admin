# Manual Test Cases — Landlords: Responsive Layout

These match the automated tests in `tests/Landlords/landlords-responsive.spec.js`.

---

### TC-153: On a normal desktop screen, everything fits without needing to scroll sideways

**Steps:**
1. Open the Landlords list on a regular desktop-sized browser window (roughly laptop width or wider).

**Expected result:** All 7 columns (Name, Email, Properties, Tenants, Status, Joined, Actions) are visible without scrolling sideways.

---

### TC-154: On a tablet-sized screen, only the table should need to scroll sideways — not the whole page

**Steps:**
1. Resize your browser window to a tablet width (or open the site on an actual tablet), roughly the width of an iPad held upright.
2. Try to scroll right to see the Properties/Tenants/Status/Joined/Actions columns.

**Expected result:** Only the table itself should scroll sideways — the page heading, search box, and sidebar menu should all stay fully visible and in place the whole time.

> ⚠️ **Known issue:** This currently fails — the sidebar menu doesn't shrink or hide itself at this width, so the *entire page* scrolls sideways instead of just the table. When you scroll right, the heading and search box get cut off too, and the table's Name column disappears behind the sidebar. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`.

---

### TC-155: On a phone-sized screen, the sidebar tucks away and the table scrolls on its own

**Steps:**
1. Resize your browser window to a phone width (or open the site on an actual phone).
2. Check whether the sidebar menu is visible without tapping anything.
3. Scroll right within the table to find the "View" and "Suspend" buttons.

**Expected result:** The sidebar menu is fully hidden by default at this width (just a small icon to open it). The Name column is always fully readable; the Email column is partly cut off until you scroll. Scrolling right within the table reveals the "View"/"Suspend" buttons.

---

### TC-156: A landlord's details page also fits properly on a desktop screen

**Steps:**
1. Open any landlord's details page on a regular desktop-sized window.

**Expected result:** Everything (summary numbers, landlord information, Properties table, Tenants table) fits without needing to scroll sideways.

---

### TC-157: A landlord's details page has the same tablet-width scrolling problem as the list

**Steps:**
1. Open any landlord's details page at a tablet width.
2. Try to scroll right.

**Expected result:** Only the tables on the page should need to scroll sideways, not the whole page.

> ⚠️ **Known issue:** This currently fails, for the same reason as TC-154 — the whole details page scrolls sideways at this width instead of just its tables. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`.

---

### TC-158: A landlord's details page also fits properly on a phone-sized screen

**Steps:**
1. Open any landlord's details page at a phone width.

**Expected result:** Everything fits and reads properly without the whole page needing to scroll sideways.

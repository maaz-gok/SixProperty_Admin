# Manual Test Cases — Tenants: Responsive Layout

These match the automated tests in `tests/Tenants/tenants-responsive.spec.js`.

---

### TC-204: On a normal desktop screen, the page shouldn't need to scroll sideways

**Steps:**
1. Open the Tenants list on a regular desktop-sized browser window (roughly laptop width, around 1280px).

**Expected result:** Everything fits without the whole page needing to scroll sideways.

> ⚠️ **Known issue (newly found):** This currently fails — at exactly this width, the "Admin" name/role block in the top-right of the header is slightly wider than the screen, forcing the whole page to gain a small (~60px) sideways scrollbar, even though the table itself fits fine. See `Bugs/Tenants/tenants-desktop-header-overflows-viewport.md`.

---

### TC-205: On a tablet-sized screen, only the table should need to scroll sideways — not the whole page

**Steps:**
1. Resize your browser window to a tablet width (or open the site on an actual tablet), roughly the width of an iPad held upright.
2. Try to scroll right to see the Landlord/Property/Unit/Rent/Status/Actions columns.

**Expected result:** Only the table itself should scroll sideways — the page heading, search box, and sidebar menu should all stay fully visible and in place the whole time.

> ⚠️ **Known issue:** This currently fails, for the same reason already reported on the Landlords page — the sidebar menu doesn't shrink or hide itself at this width, so the *entire page* scrolls sideways instead of just the table. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md` (confirmed to reproduce identically here).

---

### TC-206: On a phone-sized screen, the sidebar tucks away and the table scrolls on its own

**Steps:**
1. Resize your browser window to a phone width (or open the site on an actual phone).
2. Check whether the sidebar menu is visible without tapping anything.
3. Scroll right within the table to check the Name column stays visible while other columns scroll.

**Expected result:** The sidebar menu is fully hidden by default at this width. The Name column stays fully readable at all times; other columns scroll within the table itself, without the whole page needing to scroll sideways.

---

### TC-207: A tenant's details page also fits properly on a desktop screen

**Steps:**
1. Open any tenant's details page on a regular desktop-sized window.

**Expected result:** Everything (header, Tenant Information, Profile, Documents, Pets) fits without needing to scroll sideways. Unlike the list page (TC-204), this page does not show the header-overflow issue.

---

### TC-208: A tenant's details page has the same tablet-width scrolling problem as the list

**Steps:**
1. Open any tenant's details page at a tablet width.
2. Try to scroll right.

**Expected result:** Nothing on this page should need to scroll sideways at this width.

> ⚠️ **Known issue:** This currently fails, for the same reason as TC-205 — the whole details page scrolls sideways at this width. See `Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md`.

---

### TC-209: A tenant's details page also fits properly on a phone-sized screen

**Steps:**
1. Open any tenant's details page at a phone width.

**Expected result:** Everything fits and reads properly without the whole page needing to scroll sideways.

# Manual Test Cases — Platform Activity: Responsive Layout

These match the automated tests in `tests/PlatformActivity/platform-activity-responsive.spec.js`.

---

### TC-362: On a normal desktop screen, the page doesn't need to scroll sideways

**Steps:**
1. Open the Platform Activity page on a regular desktop-sized browser window (roughly laptop width, around 1280px).

**Expected result:** Everything fits without the page needing to scroll sideways.

---

### TC-363: On a tablet-sized screen, the page still doesn't need to scroll sideways

**Steps:**
1. Resize your browser window to a tablet width (or open the site on an actual tablet), roughly the width of an iPad held upright.

**Expected result:** Everything still fits without the page scrolling sideways. Unlike every other list page in this app (Landlords, Tenants, Properties, Maintenance Requests), this page does **not** have the tablet-width scrolling problem — it's a genuine exception, most likely because this table only has 4 columns, fewer than any other list page.

---

### TC-364: On a phone-sized screen, the sidebar tucks away and the page fits properly

**Steps:**
1. Resize your browser window to a phone width (or open the site on an actual phone).
2. Check whether the sidebar menu is visible without tapping anything.

**Expected result:** The sidebar menu is fully hidden by default at this width, and the page doesn't need to scroll sideways.

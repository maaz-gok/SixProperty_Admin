# Manual Test Cases — Dashboard: Sidebar Collapse/Expand

These match the automated tests in `tests/Dashboard/dashboard-sidebar-collapse.spec.js`.

---

### TC-89: Collapsing the sidebar hides its links and skips over them when tabbing

**What to check:** The little arrow/rail control at the edge of the sidebar collapses it, and once collapsed, its links can't be reached with the keyboard either.

**Steps:**
1. Log in to the Dashboard.
2. Click the thin rail/handle at the edge of the sidebar to collapse it.
3. Confirm the sidebar links (Landlords, etc.) are no longer visible on screen.
4. Click into the "Toggle Sidebar" button in the header, then press Tab once.

**Expected result:** The sidebar links disappear off-screen when collapsed, and pressing Tab from the header's toggle button skips straight to "See all" (not into the hidden sidebar links).

---

### TC-90: Expanding the sidebar brings everything back, including which page is active

**Steps:**
1. Log in, then collapse the sidebar using the rail handle.
2. Click the "Toggle Sidebar" button in the header to expand it again.

**Expected result:** All sidebar links (Landlords, Tenants, Properties, Maintenance Requests, Platform Activity), the profile link, and the Sign Out button are all visible again, and "Dashboard" is still shown as the active/highlighted item.

---

### TC-91: Both ways of toggling the sidebar (the header button and the rail handle) work the same

**Steps:**
1. Log in to the Dashboard.
2. Collapse the sidebar using the rail handle, then expand it again using the header's "Toggle Sidebar" button.
3. Now collapse it using the header button, then expand it again using the rail handle.

**Expected result:** Both controls collapse and expand the sidebar correctly, no matter which one you started with.

---

### TC-92: The sidebar starts collapsed on phones, but open on tablets and desktops

**Steps:**
1. Log in on a phone-sized screen (or use your browser's device simulation set to a narrow phone width).
2. Confirm whether the sidebar links are visible or hidden by default.
3. Repeat on a tablet-sized screen, and again on a normal desktop-sized screen.

**Expected result:** On a phone-sized screen, the sidebar starts collapsed (links hidden). On tablet and desktop sizes, it starts expanded (links visible) by default.

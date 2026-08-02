# Manual Test Cases — Dashboard: Extreme Zoom & Viewport Sizes

These match the automated tests in `tests/Dashboard/dashboard-viewport-extremes.spec.js`.

---

### TC-125: The Dashboard stays usable even zoomed in heavily (or on a very small window)

**Steps:**
1. Log in to the Dashboard.
2. Zoom your browser in to around 200% (or shrink the window to a similarly small effective size, e.g. 640x400).
3. Confirm the heading, the sidebar toggle button, "See all", and at least one summary card are all still visible and usable.
4. Try opening the sidebar using the toggle button and check that its links can be reached.

**Expected result:** Even at this extreme zoom/size, the page stays usable — the key controls remain visible and working, and the sidebar can still be opened.

---

### TC-126: Rotating a phone to landscape doesn't cause sideways scrolling

**Steps:**
1. Log in on a phone-sized screen in landscape orientation (wide and short, e.g. rotate your phone sideways).
2. Confirm the heading, a summary card, and at least one activity row are visible.
3. Try scrolling the page left and right.

**Expected result:** The page never scrolls sideways in landscape orientation, and in this wider layout the "Message" column in Recent Activity is visible again (unlike portrait phone mode, where it's hidden to save space).

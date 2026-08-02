# Manual Test Cases — Dashboard: Header

These match the automated tests in `tests/Dashboard/dashboard-header.spec.js`.

---

### TC-93: The page title, description, and top-right admin badge are all visible and in the right order

**Steps:**
1. Log in to the Dashboard.
2. Check that the "Dashboard" heading and its description text are visible.
3. Check the top-right corner for the small "Admin" badge/avatar.
4. Confirm the heading and description appear above the "Today's Wordle Word" card, not below it.

**Expected result:** The heading, description, and "Admin" badge are all visible, and they appear in reading order above the Today's Word card.

---

### TC-94: Your full email is still available even if it's visually cut off

**What to check:** If your email is too long to fit and gets truncated with "...", the full email is still there for accessibility tools (like screen readers) to read.

**Steps:**
1. Log in with an account that has a reasonably long email address.
2. Look at the bottom-left profile area in the sidebar — the email may be visually cut off with "...".
3. Use a screen reader, or your browser's accessibility inspector, to check the full accessible name of that profile link/element.

**Expected result:** Even if the visible text is cut off, the full, untruncated email is available to assistive tools.

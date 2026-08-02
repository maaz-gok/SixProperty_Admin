# Manual Test Cases — Dashboard: "See all" Link

These match the automated tests in `tests/Dashboard/dashboard-see-all.spec.js`.

---

### TC-115: "See all" is visible, looks clickable, and takes you to Platform Activity (by mouse or keyboard)

**Steps:**
1. Log in to the Dashboard and find the "See all" link next to "Recent Activity".
2. Hover your mouse over it and confirm the cursor turns into a hand.
3. Click it, and confirm you land on the Platform Activity page.
4. Go back to the Dashboard, then use Tab to move keyboard focus to "See all", and press Enter.

**Expected result:** "See all" is visible with a hand cursor on hover, and both clicking it and pressing Enter while it's focused take you to the Platform Activity page.

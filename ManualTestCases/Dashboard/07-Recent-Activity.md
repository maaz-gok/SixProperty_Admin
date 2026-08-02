# Manual Test Cases — Dashboard: Recent Activity Table

These match the automated tests in `tests/Dashboard/dashboard-recent-activity.spec.js`.

---

### TC-107: The Recent Activity table shows the right columns and the right rows, in order

**Steps:**
1. Log in to the Dashboard.
2. Check the Recent Activity table has these column headers: Type, Title, Time, Message.
3. Compare the rows shown against the actual recent activity you'd expect (e.g. from the Platform Activity page).

**Expected result:** All four column headers are present, and the rows match the real recent activity, in the same order.

---

### TC-108: Each activity "Type" shows as its own distinct colored badge

**Steps:**
1. Log in to the Dashboard and look at the "Type" column in Recent Activity (e.g. "Rent Paid", "Sign Up").
2. Compare the badge color used for "Rent Paid" against the badge color used for "Sign Up".
3. If there are multiple rows with the same Type (e.g. several "Sign Up" rows), compare their badge colors to each other.

**Expected result:** Different activity types get different, clearly distinguishable badge colors, and the same type always uses the same color everywhere in the table.

---

### TC-109: The "Message" column is hidden on phones, but shown on tablets and desktops

**Steps:**
1. Log in on a desktop-sized screen and confirm the "Message" column is visible in Recent Activity.
2. Repeat on a tablet-sized screen.
3. Repeat on a phone-sized screen.

**Expected result:** The "Message" column is visible on desktop and tablet, but not shown at all on a phone-sized screen (to save space).

---

### TC-110: Unusual or code-like text in an activity entry is shown as plain text, never run as code

**What to check:** This is a security check — if an activity's title or message ever contained something that looked like code (e.g. `<script>...</script>`), it should never actually execute.

**Steps:**
1. This is easiest to check with a mocked/test activity entry containing script-like text in its title or message.
2. Log in and observe that entry in the Recent Activity table.

**Expected result:** Any such text is shown exactly as plain, visible text (e.g. you'd literally see `<script>...` on screen) — no pop-up boxes, alerts, or other code execution should ever happen.

---

### TC-111: The Dashboard's activity list never shows more than 5 rows, even if there's more activity

**Steps:**
1. Log in and count the rows shown in the Recent Activity table on the Dashboard.
2. Compare this against the full activity history (e.g. via the Platform Activity page, which should show more).

**Expected result:** The Dashboard's Recent Activity table always shows at most the 5 most recent entries — older entries are left off (visible instead via "See all").

---

### TC-112: Activity entries with the exact same timestamp still show in a consistent order

**Steps:**
1. This is easiest to check with test data where two entries share the exact same timestamp.
2. Reload the Dashboard a few times and check whether those two entries always appear in the same order relative to each other.

**Expected result:** Entries with identical timestamps always appear in the same, stable order — they don't randomly swap places between page loads.

---

### TC-113: If the activity data fails to load, you see a clear error message with a way to retry

**Steps:**
1. Make the Recent Activity data fail to load (e.g. by blocking the `activity` request in DevTools, similar to the Today's Word bug's steps).
2. Refresh the page.

**Expected result:** Instead of a blank or broken table, you see a "Something went wrong" message along with a "Retry" button. The Today's Word card is unaffected, since it loads from a separate request.

---

### TC-114: Clicking a row in the Recent Activity table doesn't do anything

**Steps:**
1. Log in to the Dashboard.
2. Click directly on a row in the Recent Activity table (e.g. one showing "Rent Paid", then one showing "Sign Up").
3. Hover your mouse over a row and watch the cursor.

**Expected result:** Clicking a row does nothing (you stay on the Dashboard), and the cursor stays a normal arrow rather than turning into a hand.

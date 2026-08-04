# Manual Test Cases — Platform Activity: Timestamp Validation

These match the automated tests in `tests/PlatformActivity/platform-activity-timestamps.spec.js`.

---

### TC-346: Every timestamp shows a full date and time

**Steps:**
1. Look at the Time column for several different rows.

**Expected result:** Every timestamp looks like "Aug 4, 2026, 03:04 PM" — a full date, plus hours and minutes with AM/PM.

---

### TC-347: The newest activity is always at the top of the current page

**Steps:**
1. Read down the Time column on page 1, top to bottom.

**Expected result:** Each timestamp is the same as or older than the one above it — the list is always sorted newest-first.

---

### TC-348: The newest-first order continues correctly from one page to the next

**Steps:**
1. Note the timestamp of the very last row on page 1.
2. Click "Next" and note the timestamp of the very first row on page 2.

**Expected result:** Page 2's first item is the same as or older than page 1's last item — the sorting doesn't reset or glitch across the page boundary.

---

### TC-349: Old and recent activity are both shown as a full date — never as "2 hours ago" or similar

**Steps:**
1. Compare a very recent item's timestamp against one from several weeks back (click "Next" repeatedly, or jump to the last page, to find an older one).

**Expected result:** Both use the exact same full date-and-time format. Nothing on this page ever shows a relative time like "3 hours ago" or "last week".

---

### TC-350: The displayed time is trustworthy — it reflects the real moment the activity happened

**What to check:** This is a technical check comparing what's on screen against the real underlying data.

**Steps:**
1. Compare the most recent row's displayed time against its real recorded time (via the Network tab, if you're comfortable with developer tools).

**Expected result:** They match — the displayed time is a correct, real reflection of when the activity actually happened, not a placeholder or a "just now" style approximation.

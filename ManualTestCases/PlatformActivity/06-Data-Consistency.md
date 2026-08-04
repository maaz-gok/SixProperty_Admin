# Manual Test Cases — Platform Activity: Data Consistency

These match the automated tests in `tests/PlatformActivity/platform-activity-data-consistency.spec.js`.

> **What to check:** These compare what's shown on screen against what the server actually sent back. This is easiest to verify using your browser's developer tools (Network tab) to see the raw data, but the important thing to check by eye is that nothing on screen looks made-up or mismatched.

---

### TC-358: Everything shown in the activity list matches the real data

**Steps:**
1. Open the Platform Activity page.
2. Pick a few different rows and check: Type, Title, Time, and Message.

**Expected result:** Every value shown matches the real underlying activity record exactly.

---

### TC-359: The number of rows on screen matches what the server actually sent

**Steps:**
1. Count the rows on the current page.

**Expected result:** This count matches the real number of activity records the server returned for that page — never more, never fewer.

---

### TC-360: The "of N" total always matches the real grand total

**Steps:**
1. Check the "Showing 1–20 of N" text.

**Expected result:** "N" matches the real total number of activity records in the system — never a hardcoded or stale number.

---

### TC-361: Page 2 shows page 2's real data — not just a re-split of page 1

**Steps:**
1. Click "Next" to go to page 2.

**Expected result:** Page 2's rows genuinely come from a fresh server request for page 2 — they're not simply the second half of a bigger list that was already loaded on page 1.

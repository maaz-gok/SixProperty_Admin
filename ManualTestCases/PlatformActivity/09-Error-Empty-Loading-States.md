# Manual Test Cases — Platform Activity: Error, Empty & Loading States

These match the automated tests in `tests/PlatformActivity/platform-activity-error-states.spec.js`.

> **Note:** None of these situations happen naturally with the real data today (there's always plenty of real activity to show). Testing them for real requires a developer/QA tool that can fake the server's response — a browser extension or dev-tools feature that lets you override a network request. If you don't have a way to do that, these are best left to the automated tests, which already cover them.

---

### TC-368: If there's ever no activity at all, the page should say so clearly

**Steps:**
1. Using a network-faking tool, make the server return zero activity records.

**Expected result:** The table area is replaced with a friendly "no data" message, matching the same style used elsewhere in this app (e.g. "No data found") — not a blank white box or a broken-looking empty table.

---

### TC-369: If the server has a problem, the page should show an error, not just hang or fail silently

**Steps:**
1. Using a network-faking tool, make the server return a server error.

**Expected result:** Some kind of error message appears — the page should not be stuck on a loading spinner forever, and it should not silently show an empty table pretending everything is fine.

---

### TC-370: If there's only a small amount of activity, the paging buttons correctly turn off

**Steps:**
1. Using a network-faking tool, make the server return just 1–2 activity records total.

**Expected result:** Both "Previous" and "Next" are greyed out, and it reads "Page 1 of 1".

---

### TC-371: If a record is missing some information, it shouldn't show the word "null" on screen

**Steps:**
1. Using a network-faking tool, make the server return a record with a blank title or message.

**Expected result:** The row still displays sensibly — it never shows the literal word "null" or "undefined" anywhere.

---

### TC-372: An unexpected new activity type shouldn't break the page

**Steps:**
1. Using a network-faking tool, make the server return a record with a type the app doesn't recognize yet.

**Expected result:** The row still renders without crashing the page — ideally showing some reasonable fallback text in the Type column rather than a blank badge.

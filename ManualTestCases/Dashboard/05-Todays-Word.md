# Manual Test Cases — Dashboard: Today's Wordle Word Card

These match the automated tests in `tests/Dashboard/dashboard-todays-word.spec.js`.

---

### TC-95: The card shows today's actual word and date

**Steps:**
1. Log in to the Dashboard.
2. Look at the "Today's Wordle Word" card near the top.
3. Confirm the letters shown spell out an actual word, and the date shown is today's date.

**Expected result:** The card shows one letter tile per letter of the word, spelling out the real word, along with the correct date.

---

### TC-96: The word card stays fully visible and readable on any screen size

**Steps:**
1. Log in on a desktop-sized screen and check the Today's Word card — all 5 letter tiles should be fully on-screen.
2. Repeat on a tablet-sized screen, then a phone-sized screen.

**Expected result:** All 5 letter tiles are fully visible on-screen at every size — desktop, tablet, and phone.

---

### TC-97: If the word fails to load, the whole card just disappears with no error message

**What to check:** What happens to the Today's Word card if its data fails to load.

**Steps:**
1. Make the word data fail to load (see `Bugs/Dashboard/dashboard-todays-word-disappears-on-error.md` for how to simulate this using DevTools' "Block request URL").
2. Refresh the page.
3. Look at the area where the Today's Word card normally appears.

**Expected result:** Ideally, the card should still appear with a message like "Unable to load today's word" instead of just vanishing.

> ⚠️ **Known issue:** This currently fails — the card disappears completely with no error message or indication that anything went wrong. The rest of the Dashboard (summary cards, Recent Activity) is unaffected. See `Bugs/Dashboard/dashboard-todays-word-disappears-on-error.md`.

---

### TC-98: The date shown always matches what the server sent, not just "today" on your computer

**What to check:** The date on the card comes from the server's data, not calculated by your own device's clock.

**Steps:**
1. This is easiest to verify with the server's data mocked to a specific date (a technical check) — otherwise, just confirm the date shown matches the actual word-of-the-day date from the team/backend, not simply "whatever today's date is on your computer."

**Expected result:** The date shown on the card always matches the date tied to that specific word, exactly as sent by the server.

---

### TC-99: Words with repeated letters (like "APPLE") still show one tile per letter

**Steps:**
1. This is easiest to check on a day when the word-of-the-day has a repeated letter (e.g. "APPLE" has two P's).
2. Count the letter tiles shown on the card and compare them to the actual word.

**Expected result:** Every letter gets its own tile, including repeated ones — e.g. "APPLE" shows 5 tiles (A, P, P, L, E), not 4.

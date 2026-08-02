# Manual Test Cases — Dashboard: Summary Cards

These match the automated tests in `tests/Dashboard/dashboard-summary-cards.spec.js`.

---

### TC-100: All six summary cards show an icon, label, and a number

**Steps:**
1. Log in to the Dashboard.
2. Check each of the six cards: Landlords, Tenants, Properties, Open Requests, Resolved Requests, Suspended Users.

**Expected result:** Every card shows an icon, its label, and a whole number that's zero or higher.

---

### TC-101: All six cards are the same height

**Steps:**
1. Log in to the Dashboard.
2. Visually compare the height of all six summary cards.

**Expected result:** All six cards line up at the same height, even though their numbers may have different lengths.

---

### TC-102: The cards arrange two-per-row on desktop, and one-per-row on phones

**Steps:**
1. Log in on a desktop-sized screen and check whether the cards sit two side-by-side per row.
2. Repeat on a phone-sized screen and check whether the cards now stack one per row.

**Expected result:** Desktop shows two cards per row; a phone-sized screen stacks them one per row.

---

### TC-103: Clicking a summary card doesn't do anything

**What to check:** The summary cards are just for display — they shouldn't act like buttons or links.

**Steps:**
1. Log in to the Dashboard.
2. Click directly on the "Landlords" card, then on the "Open Requests" card.
3. Hover your mouse over a card and watch the cursor.

**Expected result:** Clicking a card does nothing (you stay on the Dashboard), and the mouse cursor stays as a normal arrow, not a hand, when hovering over a card.

---

### TC-104: Large numbers display fully, with comma separators, and don't overflow the card

**Steps:**
1. This is easiest to check when one of the counts is a large number (thousands or more) — otherwise this can be checked with test data.
2. Look at a card showing a large count and confirm it reads with comma separators (e.g. "12,345") and fits fully inside the card without being cut off or overlapping.

**Expected result:** Large numbers show with proper comma formatting and never overflow outside the card's edges.

---

### TC-105: If one piece of summary data is missing, its card shows "0" instead of breaking

**Steps:**
1. This is easiest to verify with the server data deliberately missing one field (a technical/mocked check).
2. Otherwise, just confirm that if any card's underlying data were ever missing, it should show "0" rather than a blank space or the word "undefined".

**Expected result:** A missing piece of data shows as "0" on its card, not blank or broken text, and doesn't affect the other cards.

---

### TC-106: While the numbers are loading, the cards show a placeholder dash, not a wrong number

**Steps:**
1. Log in and, right as the Dashboard first appears, look closely at the summary cards before the numbers finish loading (this happens quickly, so you may need to check on a slower connection or immediately after the page appears).

**Expected result:** Each card briefly shows a placeholder dash ("—") while loading, never a flash of "0" or an incorrect number, and each card then updates to its real number once loaded.

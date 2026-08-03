# Manual Test Cases — Tenants: Accessibility

These match the automated tests in `tests/Tenants/tenants-accessibility.spec.js`.

---

### TC-210: You can reach the search box, filter, and a row's buttons using only the keyboard

**Steps:**
1. Type a specific tenant's email into the search box so only one row shows, then press the Tab key.
2. Press Tab again, then again, then again.

**Expected result:** Tab moves in this order: search box → status filter dropdown → "Reset" button (this only appears, and is only reachable, once you've typed a search) → that row's "View" button → that row's "Suspend"/"Unsuspend" button. You can see clearly (a highlighted outline) which control is currently selected at each step.

---

### TC-211: You can move between pages using only the keyboard

**Steps:**
1. Use Tab to reach the "Next" button (or click it directly to give it keyboard focus).
2. Press Enter.
3. Use Tab to reach the "Previous" button afterward.

**Expected result:** Pressing Enter on "Next" moves you to page 2, just like clicking it would. "Previous" becomes reachable and usable the same way once you're past page 1.

---

### TC-212: The tables are set up properly for screen readers

**What to check:** This is a technical check, easiest to verify with a screen reader (like VoiceOver or NVDA) or your browser's accessibility inspector tool.

**Steps:**
1. Turn on a screen reader and navigate through the Tenants list table (8 columns), then a tenant's details page.

**Expected result:** The screen reader correctly announces all 8 column headings and reads out each row's cells in order — nothing is announced as an unlabeled or generic block.

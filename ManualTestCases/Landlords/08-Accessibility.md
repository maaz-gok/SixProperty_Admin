# Manual Test Cases — Landlords: Accessibility

These match the automated tests in `tests/Landlords/landlords-accessibility.spec.js`.

---

### TC-159: You can reach the search box and a row's buttons using only the keyboard

**Steps:**
1. Click into the search box, then press the Tab key on your keyboard.
2. Press Tab again.

**Expected result:** The first Tab moves you to the first row's "View" button; the next Tab moves you to that same row's "Suspend" or "Unsuspend" button. You can see clearly (a highlighted outline) which button is currently selected at each step.

---

### TC-160: You can move between pages using only the keyboard

**Steps:**
1. Use Tab to reach the "Next" button (or click it directly to give it keyboard focus).
2. Press Enter.
3. Use Tab to reach the "Previous" button afterward.

**Expected result:** Pressing Enter on "Next" moves you to page 2, just like clicking it would. "Previous" becomes reachable and usable the same way once you're past page 1.

---

### TC-161: The tables are set up properly for screen readers

**What to check:** This is a technical check, easiest to verify with a screen reader (like VoiceOver or NVDA) or your browser's accessibility inspector tool.

**Steps:**
1. Turn on a screen reader and navigate through the Landlords table, and then a landlord's Properties/Tenants tables.

**Expected result:** The screen reader correctly announces column headings and reads out each row's cells in order — nothing is announced as an unlabeled or generic block.

---

### TC-162: The "Active"/"Suspended" colored labels are easy enough to read

**What to check:** This is easiest to verify with a color contrast checker tool (many are free online), comparing the label's text color against its background color.

**Steps:**
1. Check the green "Active" label and the red/orange "Suspended" label using a contrast-checking tool.

**Expected result:** Both labels should meet the standard accessibility contrast guideline (a ratio of at least 4.5:1) for normal-sized text.

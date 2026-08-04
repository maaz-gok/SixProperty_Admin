# Manual Test Cases — Platform Activity: Accessibility

These match the automated tests in `tests/PlatformActivity/platform-activity-accessibility.spec.js`.

---

### TC-365: The Previous and Next buttons work with the keyboard alone

**Steps:**
1. Click anywhere on the page, then press Tab until "Next" is highlighted/focused.
2. Press Enter.

**Expected result:** Pressing Enter activates "Next" the same as clicking it would — the page moves forward one page.

---

### TC-366: The table and its column headings are screen-reader friendly

**What to check:** This is a technical check using your browser's Inspect/Accessibility tools.

**Steps:**
1. Inspect each of the 4 column headings (Type, Title, Time, Message).

**Expected result:** Each column heading has a clear, readable name that a screen reader would announce correctly.

---

### TC-367: A greyed-out Previous/Next button is announced as disabled, not just shown as grey

**Steps:**
1. On page 1, inspect the "Previous" button.

**Expected result:** Beyond just looking grey, the button is marked as genuinely disabled in a way assistive technology can detect — not just styled to look inactive while still being clickable.

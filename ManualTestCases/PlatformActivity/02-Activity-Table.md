# Manual Test Cases — Platform Activity: Activity Table

These match the automated tests in `tests/PlatformActivity/platform-activity-table.spec.js`.

---

### TC-335: A "Sign Up" row shows all the right information

**Steps:**
1. Find a row where the Type is "Sign Up" (e.g. someone signing up as a tenant).

**Expected result:** All 4 columns are filled in: Type shows "Sign Up", Title shows something like "New tenant", Time shows a date and time, and Message shows a full sentence like "john doe signed up as a tenant."

---

### TC-336: A "Rent Paid" row shows all the right information

**Steps:**
1. Find a row where the Type is "Rent Paid".

**Expected result:** Type shows "Rent Paid", Title shows "Rent paid", and the Message includes the person's name and the dollar amount, e.g. "jeremy paid $800 in rent."

---

### TC-337: A "Maintenance" row shows all the right information

**Steps:**
1. Find a row where the Type is "Maintenance" (you may need to click "Next" a few times, since these are further back in the list).

**Expected result:** Type shows "Maintenance", Title shows "New request", and the Message includes the unit and what the request was about, e.g. "New maintenance request for A-101: Keys issue."

---

### TC-338: Dollar signs, colons, and periods in messages show up normally

**Steps:**
1. Look closely at a "Rent Paid" message (has a $ sign) and a "Maintenance" message (has a colon).

**Expected result:** These characters display as plain, normal text — nothing looks broken, missing, or turned into a strange symbol.

---

### TC-339: There's no hidden extra information beyond what the 4 columns show

**Steps:**
1. Pick any row and read everything visible in it.

**Expected result:** Only the 4 documented pieces of information (Type, Title, Time, Message) are shown — there's no 5th column, tooltip, or hover-over text revealing anything extra.

---

### TC-340: The table is built properly for screen readers

**What to check:** This is a technical check, done using your browser's Inspect/Accessibility tools.

**Steps:**
1. Inspect the table's underlying structure.

**Expected result:** The table uses proper table markup (rows, column headers, cells) that a screen reader can announce correctly.

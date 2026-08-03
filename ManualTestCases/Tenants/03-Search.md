# Manual Test Cases — Tenants: Search

These match the automated tests in `tests/Tenants/tenants-search.spec.js`.

---

### TC-173: Searching by exact name, partial name, or email all find the same tenant

**Steps:**
1. Type a tenant's full name into the search box (e.g. "jeremy").
2. Clear it and type just the first few letters of that name (e.g. "jer").
3. Clear it and type that tenant's full email address instead.

**Expected result:** All three searches show only that one tenant in the table. The "Showing 1–1 of 1" text and "Page 1 of 1" both appear, and the Previous/Next buttons are greyed out (nothing else to page through).

---

### TC-174: Search doesn't care about capital letters or extra spaces

**Steps:**
1. Type a tenant's name in all capital letters, with extra spaces before and after it (e.g. "  JEREMY  ").

**Expected result:** The matching tenant still shows up normally, despite the different capitalization and the extra spaces.

---

### TC-175: Typing computer code into the search box is harmless

**Steps:**
1. Type `<script>alert(1)</script>` into the search box.

**Expected result:** Nothing pops up or breaks — the text just sits there as plain search text, matches nothing, and the "No data found" message appears normally.

---

### TC-176: Searching for something that doesn't exist shows a clear "no results" message, and "Reset" brings the list back

**Steps:**
1. Type a made-up word that won't match anyone (e.g. "zzzznotfound").
2. Click the "Reset" button that appears next to the search box.

**Expected result:** While searching, the table is replaced with "No data found" / "There is no data to display at the moment.", and the Previous/Next buttons and "Showing..." counter disappear. After clicking Reset, the search box empties out and the full list of tenants reappears from the beginning (page 1).

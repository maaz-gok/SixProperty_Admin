# Manual Test Cases — Landlords: Search

These match the automated tests in `tests/Landlords/landlords-search.spec.js`.

---

### TC-131: Searching by exact name, partial name, or email all find the same landlord

**Steps:**
1. Type a landlord's full name into the search box (e.g. "jeremy").
2. Clear it and type just the first few letters of that name (e.g. "jer").
3. Clear it and type that landlord's full email address instead.

**Expected result:** All three searches show only that one landlord in the table. The "Showing 1–1 of 1" text and "Page 1 of 1" both appear, and the Previous/Next buttons are greyed out (nothing else to page through).

---

### TC-132: Search doesn't care about capital letters or extra spaces

**Steps:**
1. Type a landlord's name in all capital letters, with extra spaces before and after it (e.g. "  JEREMY  ").

**Expected result:** The matching landlord still shows up normally, despite the different capitalization and the extra spaces.

---

### TC-133: Typing computer code into the search box is harmless

**Steps:**
1. Type `<script>alert(1)</script>` into the search box.

**Expected result:** Nothing pops up or breaks — the text just sits there as plain search text, matches nothing, and the "No data found" message appears normally.

---

### TC-134: Searching part of a number in a name works

**Steps:**
1. Type just the number from one of the test landlords' names (e.g. "398" from "Maaz Landlord 398").

**Expected result:** The matching landlord shows up in the results.

---

### TC-135: Searching for something that doesn't exist shows a clear "no results" message

**Steps:**
1. Type a made-up word that won't match anyone (e.g. "zzzznotfound").

**Expected result:** The table is replaced with a message: "No data found" and "There is no data to display at the moment." The Previous/Next buttons and the "Showing..." counter disappear.

---

### TC-136: The "Reset" button clears your search and brings back the full list

**Steps:**
1. Type any search term.
2. Click the "Reset" button that appears next to the search box.

**Expected result:** The search box empties out, the "Reset" button disappears, and the full list of landlords reappears from the beginning (page 1).

---

### TC-137: Searching while on page 2 or later jumps you back to page 1 of the results

**Steps:**
1. Click "Next" to move to page 2 of the full list.
2. While still on page 2, type a search term that matches a landlord.

**Expected result:** The results shown are for page 1 of your search results, not page 2 — searching always starts fresh from the first page.

---

### TC-138: Refreshing the page clears your search

**Steps:**
1. Type any search term so the list is filtered.
2. Refresh the browser page.

**Expected result:** After refreshing, the search box is empty again and the full, unfiltered list of landlords is shown from page 1 — your search is not remembered.

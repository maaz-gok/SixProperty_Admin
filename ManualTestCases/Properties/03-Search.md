# Manual Test Cases — Properties: Search

These match the automated tests in `tests/Properties/properties-search.spec.js`.

---

### TC-225: Searching by exact name, partial name, or address all find the same property

**Steps:**
1. Type a property's full name into the search box (e.g. "Grove").
2. Clear it and type just the first few letters of that name (e.g. "Gro").
3. Clear it and type part of that property's address instead (e.g. its zip code).

**Expected result:** All three searches show only that one property in the table. The "Showing 1–1 of 1" text and "Page 1 of 1" both appear, and the Previous/Next buttons are greyed out (nothing else to page through).

---

### TC-226: Search doesn't care about capital letters, but extra spaces cause a problem

**Steps:**
1. Type a property's name in all capital letters, with no extra spaces (e.g. "GROVE").
2. Clear it and type the name again, but this time with extra spaces before and after it (e.g. "  Grove  ").

**Expected result:** The all-capitals search (step 1) should find the property normally. The version with extra spaces (step 2) should *also* find the property — but it currently doesn't.

> ⚠️ **Known issue (newly found):** Step 2 currently fails — extra spaces before or after your search text make it find nothing, even though the property is really there. Typing in the wrong capitalization alone is not a problem. See `Bugs/Properties/properties-search-does-not-trim-whitespace.md`.

---

### TC-227: Typing computer code into the search box is harmless

**Steps:**
1. Type `<script>alert(1)</script>` into the search box.

**Expected result:** Nothing pops up or breaks — the text just sits there as plain search text, matches nothing, and the "No data found" message appears normally.

---

### TC-228: Searching part of a number in an address works

**Steps:**
1. Type just the street number from one of the properties' addresses (e.g. "307" from "307 Grove Street").

**Expected result:** The matching property shows up in the results.

---

### TC-229: Searching for something that doesn't exist shows a clear "no results" message

**Steps:**
1. Type a made-up word that won't match anyone (e.g. "zzzznotfound").

**Expected result:** The table is replaced with a message: "No data found" and "There is no data to display at the moment." The Previous/Next buttons and the "Showing..." counter disappear.

---

### TC-230: Clearing the search box by hand brings back the full list

**Steps:**
1. Type any search term.
2. Delete everything you typed, one letter at a time, until the box is empty.

**Expected result:** Once the box is empty, the full list of properties reappears from the beginning (page 1), and the "Reset" button disappears.

---

### TC-231: The "Reset" button clears your search and brings back the full list

**Steps:**
1. Type any search term.
2. Click the "Reset" button that appears next to the search box.

**Expected result:** The search box empties out, the "Reset" button disappears, and the full list of properties reappears from the beginning (page 1).

---

### TC-232: Refreshing the page clears your search

**Steps:**
1. Type any search term so the list is filtered.
2. Refresh the browser page.

**Expected result:** After refreshing, the search box is empty again and the full, unfiltered list of properties is shown from page 1 — your search is not remembered.

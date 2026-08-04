# Manual Test Cases — Maintenance Requests: Search

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-search.spec.js`.

---

### TC-265: Searching by a request's exact title finds it

**Steps:**
1. Type a request's full title into the search box (e.g. "Keys issue").

**Expected result:** Only that one request shows in the table. The "Showing 1–1 of 1" text and "Page 1 of 1" both appear, and the Previous/Next buttons are greyed out.

---

### TC-266: Searching part of a title finds every request containing it

**Steps:**
1. Type just part of a word that appears in more than one title (e.g. "Key", which matches both "Keys issue" and "Keys Stuck in door").

**Expected result:** Every request whose title contains that text shows up in the results.

---

### TC-267: Searching by a tenant's name finds all of their requests, even ones with unrelated titles

**Steps:**
1. Type a tenant's first name into the search box (e.g. "Karishma") — one whose requests don't all share a common word in their titles.

**Expected result:** Every request belonging to that tenant shows up, confirming the search box really does search by tenant name too, not just by title (matching its placeholder text "Search by title or tenant").

---

### TC-268: Search doesn't care about capital letters or extra spaces

**Steps:**
1. Type a search term in all capital letters, with extra spaces before and after it (e.g. "  KEY  ").

**Expected result:** The matching requests still show up normally, despite the different capitalization and the extra spaces. (Unlike the Properties page, this search box handles extra spaces correctly.)

---

### TC-269: Typing computer code into the search box is harmless

**Steps:**
1. Type `<script>alert(1)</script>` into the search box.

**Expected result:** Nothing pops up or breaks — the text just sits there as plain search text, matches nothing, and the "No data found" message appears normally.

---

### TC-270: Searching for something that doesn't exist shows a clear "no results" message

**Steps:**
1. Type a made-up word that won't match anything (e.g. "zzzznotfound").

**Expected result:** The table is replaced with a message: "No data found" and "There is no data to display at the moment." The Previous/Next buttons and the "Showing..." counter disappear.

---

### TC-271: The "Reset" button clears your search and brings back the full list

**Steps:**
1. Type any search term.
2. Click the "Reset" button that appears next to the search box.

**Expected result:** The search box empties out, the "Reset" button disappears, and the full list of requests reappears from the beginning (page 1).

---

### TC-272: Searching while on page 2 jumps you back to page 1 of the results

**Steps:**
1. Click "Next" to move to page 2 of the full list.
2. While still on page 2, type a search term that matches a request.

**Expected result:** The results shown are for page 1 of your search results, not page 2 — searching always starts fresh from the first page.

---

### TC-273: Refreshing the page clears your search

**Steps:**
1. Type any search term so the list is filtered.
2. Refresh the browser page.

**Expected result:** After refreshing, the search box is empty again and the full, unfiltered list of requests is shown from page 1 — your search is not remembered.

# Manual Test Cases — Platform Activity: Initial Load

These match the automated tests in `tests/PlatformActivity/platform-activity-load.spec.js`.

---

### TC-329: The Platform Activity page loads cleanly with everything in place

**Steps:**
1. Log in to the Admin Panel.
2. Click "Platform Activity" in the sidebar.

**Expected result:** The page shows the heading "Platform Activity" and the text "Monitor recent platform-wide activity." underneath it. A table with 4 column headings (Type, Title, Time, Message) and Previous/Next buttons at the bottom are all visible. "Platform Activity" is highlighted in the sidebar as the current page. No error messages appear anywhere.

---

### TC-330: There's no search box, filter dropdown, or action buttons on this page

**Steps:**
1. Look over the whole page carefully.

**Expected result:** Unlike every other list page in this app, there is no search box, no dropdown filter, no "Reset" button, and no "View" buttons in the table. This page is just a plain, read-only list of activity — there's nothing to click through to a details page.

---

### TC-331: Typing the web address directly, and refreshing, both work the same as clicking the link

**Steps:**
1. Log in, then type the Platform Activity page's address directly into the browser instead of clicking the sidebar link.
2. Once it loads, refresh the page.

**Expected result:** Both ways of getting there show the exact same page — the same activity list, nothing missing or stuck loading.

---

### TC-332: The column titles (Type, Title, etc.) are just labels — they don't sort the list

**Steps:**
1. Note the order the activity is listed in.
2. Click directly on each column title one at a time (Type, Title, Time, Message).

**Expected result:** Nothing happens when you click a column title — no arrows appear, and the order of the list never changes.

---

### TC-333: Moving to another page and back to Platform Activity still works properly

**Steps:**
1. From the Platform Activity page, click "Maintenance Requests" in the sidebar.
2. Click "Platform Activity" again to come back.

**Expected result:** Each click takes you to the right page. Coming back to Platform Activity shows the full list again, and "Platform Activity" is highlighted in the sidebar as the current page.

---

### TC-334: Typing a page number into the web address doesn't actually change the page

**Steps:**
1. Type the Platform Activity page's address directly into the browser, but add `?page=5` to the end of it.

**Expected result:** The page still opens showing page 1, not page 5 — this page doesn't support jumping to a specific page via the web address. To reach a later page, you have to click "Next" the normal way.

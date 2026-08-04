# Manual Test Cases — Maintenance Requests: Performance

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-performance.spec.js`.

---

### TC-325: Loading the list only checks the server once

**What to check:** This is a technical check, done using your browser's developer tools (Network tab).

**Steps:**
1. Open the developer tools and go to the Network tab.
2. Load the Maintenance Requests page fresh.

**Expected result:** You see exactly one request for the unfiltered list — not two or more.

---

### TC-326: Moving between requests always shows fresh, correct information

**Steps:**
1. Open one request's details page, note its title.
2. Go back to the list, then open a different request.

**Expected result:** The second request's page shows only its own correct information — never a flash of the first request's title or details.

---

### TC-327: Searching, filtering, and paging don't fire extra hidden requests

**What to check:** This is a technical check, done using your browser's developer tools (Network tab).

**Steps:**
1. With the Network tab open, search for something, apply a status filter, and click "Next" to move a page.

**Expected result:** Each of those three actions fires exactly one matching request to the server — not two for the same action.

---

### TC-328: A full round of normal use produces no hidden technical errors anywhere

**What to check:** This is a technical check, done using your browser's developer console.

**Steps:**
1. Open the developer console.
2. In one sitting: load the list, search, clear the search, apply a status filter, clear it, page forward and back, open a request, open one of its attachments, close it, and go back to the list.

**Expected result:** No red error messages appear at any point. The only console message you might see the whole time is one harmless technical warning tied to the attachment pop-up window — that one specific message is expected and not a problem.

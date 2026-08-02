# Manual Test Cases — Dashboard: Sign Out & Session

These match the automated tests in `tests/Dashboard/dashboard-sign-out.spec.js`.

---

### TC-119: Signing out properly logs you out and blocks further access

**Steps:**
1. Log in to the Dashboard.
2. Click "Sign Out".
3. Confirm you land on the sign-in page.
4. Try typing the Dashboard's address directly into the address bar again.

**Expected result:** Sign Out takes you to the sign-in page, and afterward you can't get back into the Dashboard just by typing its address — you're redirected back to sign-in.

---

### TC-120: Pressing the browser's Back button right after signing out

**What to check:** Whether pressing Back immediately after signing out ever shows the old Dashboard again.

**Steps:**
1. Log in to the Dashboard.
2. Click "Sign Out" as soon as the Dashboard finishes loading — don't wait around on the page first.
3. As soon as you land on the sign-in page, immediately click the browser's Back button (or use a mouse/trackpad back gesture).

**Expected result:** Pressing Back should never show the old Dashboard's real data again after signing out — it should either take you back to sign-in or show a blank/blocked page.

> This one is inconsistent to trigger by hand. Our automated test (which acts essentially instantly, faster than a person can click) does reliably catch the old Dashboard briefly reappearing with real data still on screen, even though the session was already signed out. Trying it manually — even clicking quickly — may not reproduce it every time, since normal human reaction time between clicks seems to be enough for the browser to handle it correctly. If you do manage to catch it, a telltale sign is the user badge in the top-right briefly showing a generic "User" placeholder instead of your real name, while the rest of the page still shows old, real data.

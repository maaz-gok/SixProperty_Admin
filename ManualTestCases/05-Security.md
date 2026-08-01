# Manual Test Cases — Security Checks

These match the automated tests in `tests/Auth/admin-login-security.spec.js`.

---

### TC-48: The app never tries to log you in with incomplete or invalid information

**What to check:** Nothing gets sent to the server unless the form is actually filled in correctly.

**Steps:**
1. Open the Admin Login page.
2. Click "Log In" with both boxes empty.
3. Type an incorrectly formatted email (e.g. "not-an-email") and any password, then click "Log In".
4. Try the same again, but press Enter instead of clicking.
5. (This is easiest to confirm using your browser's developer tools "Network" tab, watching for any request being sent to the login server during these attempts.)

**Expected result:** No login attempt should be sent to the server in any of these cases — the form should stop you before it gets that far.

---

### TC-49: You can't reach the Dashboard by typing its address directly, unless you're logged in

**What to check:** Typing the Dashboard's web address directly (without logging in first) doesn't let you see it.

**Steps:**
1. Make sure you're logged out.
2. Type the Dashboard page's address directly into the browser's address bar and press Enter.

**Expected result:** You should be redirected back to the Login page, not shown the Dashboard.

---

### TC-50: After logging out, you can't get back into the Dashboard by going back or retyping the address

**What to check:** Logging out properly blocks further access to protected pages.

**Steps:**
1. Log in with a valid admin account.
2. Click "Sign Out".
3. Try typing the Dashboard's address directly into the browser again.
4. Then try clicking your browser's Back button.

**Expected result:** Both attempts should redirect you back to the Login page — you should never see the Dashboard again after signing out.

---

### TC-51: Your password is never shown anywhere it shouldn't be (like the browser console)

**What to check:** The password you type is kept private and never accidentally printed out anywhere technical.

**Steps:**
1. Open your browser's developer tools and go to the "Console" tab.
2. Open the Admin Login page, type a distinctive password, and click "Log In".
3. Check the console for any mention of the password you typed.

**Expected result:** Your password should never appear anywhere in the console output.

---

### TC-52: Your email and password never appear in the web address after logging in

**What to check:** Sensitive login details don't leak into the browser's address bar.

**Steps:**
1. Log in with a valid admin account.
2. Once on the Dashboard, look closely at the web address shown in the address bar.

**Expected result:** The address bar should not contain your email or password anywhere.

---

### TC-53: Trying to trick the password box with malicious text doesn't do anything harmful

**What to check:** The password box safely ignores attempts to input harmful code (this is a common web-security check).

**Steps:**
1. Open the Admin Login page.
2. Type any email, and for the password, type something like `<script>alert(1)</script>`.
3. Click "Log In".

**Expected result:** Nothing unusual should happen — no pop-up boxes, no crashes, just a normal failed-login response.

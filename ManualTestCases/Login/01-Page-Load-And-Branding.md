# Manual Test Cases — Login Page: Loading & Branding

These match the automated tests in `tests/Auth/admin-login-page-load.spec.js`.

---

### TC-01: The login page opens correctly

**What to check:** The login page opens without any errors or broken parts.

**Steps:**
1. Open the Admin Login page in your browser.
2. Open the browser's developer tools and check the "Console" tab for red error messages.
3. Look at the page — you should see boxes to type your email and password, and a "Log In" button.

**Expected result:** The page opens normally, no red error messages appear in the console, and the email box, password box, and "Log In" button are all visible.

---

### TC-02: The page looks correct and doesn't scroll sideways

**What to check:** The login form is laid out properly, nothing is cut off or overflowing.

**Steps:**
1. Open the Admin Login page.
2. Check that you can see: the title, the email box, the password box, the "Forgot Password?" link, and the "Log In" button.
3. Try scrolling left/right on the page.

**Expected result:** All the items listed are visible, and the page never scrolls sideways (only up and down, if at all).

---

### TC-03: Reloading the page keeps you on the login screen

**What to check:** Refreshing the browser doesn't break or redirect the login page.

**Steps:**
1. Open the Admin Login page.
2. Refresh the page (press F5 or click the browser's reload button).

**Expected result:** After reloading, you're still on the login page, and the "Log In" button is visible and ready to use.

---

### TC-04: The logo matches the official logo

**What to check:** The logo shown on the login page is the correct, approved one.

**Steps:**
1. Open the Admin Login page.
2. Look at the logo at the top of the form.
3. Compare it with the official logo image provided by the team.

**Expected result:** The logo on the page should look exactly like the official one.

> ⚠️ **Known issue:** This currently does NOT match — the page shows plain text "SIX PM" instead of the official logo. See `Bugs/Login/admin-login-logo-mismatch.md`.

---

### TC-05: The logo stays visible and readable on different screen sizes

**What to check:** The logo doesn't disappear or become too small to read when the screen size changes.

**Steps:**
1. Open the Admin Login page on a desktop-sized window.
2. Resize the browser window to a tablet size, then to a phone size (or use your browser's device toolbar to simulate this).
3. Check the logo at each size.

**Expected result:** The logo stays visible and easy to read at every screen size.

---

### TC-06: The page loads at a reasonable speed

**What to check:** The login page doesn't take an unreasonably long time to load.

**Steps:**
1. Open the Admin Login page and time roughly how long it takes to fully appear.

**Expected result:** The page should finish loading well within a few seconds. This is a general check, not a strict pass/fail — just flag it if loading ever feels noticeably slow.

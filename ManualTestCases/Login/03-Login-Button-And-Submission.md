# Manual Test Cases — Log In Button, Messages, and Submitting the Form

These match the automated tests in `tests/Auth/admin-login-submission.spec.js`.

---

## Log In Button

### TC-26: The "Log In" button can always be clicked, even on an empty form

**What to check:** The button isn't greyed out on an empty form — instead, clicking it shows warning messages.

**Steps:**
1. Open the Admin Login page.
2. Without typing anything, click "Log In".

**Expected result:** The button is clickable (not greyed out), and clicking it shows "Email is required" and "Password is required" messages.

---

### TC-27: You can submit the form by clicking the button OR by pressing Enter

**What to check:** Both ways of submitting the form work the same way.

**Steps:**
1. Open the Admin Login page. Type an email and password that you know are wrong.
2. Click "Log In" and check what happens.
3. Reload the page, type the same wrong details again, but this time press Enter instead of clicking.

**Expected result:** Both methods should show the same "incorrect email or password" type message.

---

### TC-28: The button's text says exactly "Log In"

**What to check:** The button label is worded correctly.

**Steps:**
1. Open the Admin Login page.
2. Look at the text on the button.

**Expected result:** The button should say "Log In" exactly.

---

## Warning Messages

### TC-29: The warning messages say the right thing

**What to check:** The messages shown for empty fields have the correct wording.

**Steps:**
1. Open the Admin Login page.
2. Click "Log In" without typing anything.
3. Read the messages that appear under the email and password boxes.

**Expected result:** The email message should say "Email is required" and the password message should say "Password is required".

---

### TC-30: Fixing one field clears only that field's warning

**What to check:** If you fix the email but leave the password empty, only the email warning goes away.

**Steps:**
1. Open the Admin Login page.
2. Click "Log In" without typing anything — both warnings appear.
3. Type a valid-looking email, then click "Log In" again.

**Expected result:** The email warning disappears, but the password warning is still showing (since the password box is still empty).

---

## Successful Login

### TC-31: Logging in with correct details takes you to the Dashboard

**What to check:** A valid admin login works and lands you on the Dashboard.

**Steps:**
1. Open the Admin Login page.
2. Type a valid admin email and password.
3. Click "Log In".

**Expected result:** You're taken to the Dashboard page, and it loads without any errors.

---

## Failed Login

### TC-32: A wrong email shows a generic error (not a specific one)

**What to check:** The system doesn't reveal whether the email exists or not — just a generic error.

**Steps:**
1. Open the Admin Login page.
2. Type an email address that doesn't belong to any account, with any password.
3. Click "Log In".

**Expected result:** You see a generic message like "Incorrect email or password", and you stay on the login page.

---

### TC-33: A wrong password (with a real email) shows the same generic error

**What to check:** Using a real email but the wrong password gives the same message as any other failed login.

**Steps:**
1. Open the Admin Login page.
2. Type a real admin email, but the wrong password.
3. Click "Log In".

**Expected result:** Same generic "Incorrect email or password" message, and you stay on the login page.

---

### TC-34: Both wrong (email and password) shows the same generic error

**What to check:** Getting both fields wrong doesn't reveal any extra information.

**Steps:**
1. Open the Admin Login page.
2. Type an email and password that are both wrong.
3. Click "Log In".

**Expected result:** Same generic "Incorrect email or password" message as the other failed-login cases.

---

### TC-35: If the server has a problem, you still get a clear message and can try again

**What to check:** If something goes wrong on the server's end, the page doesn't freeze — it shows an error and lets you try again.

**Steps:**
1. This one is hard to trigger manually since it needs the server to actually fail — it's mainly covered by the automated test, which fakes a server error and checks the page shows a message and the button is still usable afterward.

**Expected result:** A message appears telling you something went wrong, and the "Log In" button is still clickable (not stuck/frozen).

---

### TC-36: If your internet drops mid-login, you get a message instead of a frozen screen

**What to check:** A failed network connection during login doesn't leave the page stuck loading forever.

**Steps:**
1. Open the Admin Login page and type any email/password.
2. Turn off your Wi-Fi/internet right after clicking "Log In" (or use your browser's "offline" simulation mode in developer tools).

**Expected result:** A message appears saying something went wrong, and the button becomes clickable again (not stuck on a loading spinner forever).

---

### TC-37: Double-clicking "Log In" very quickly should only submit once

**What to check:** Clicking the button twice in a hurry doesn't accidentally send two login attempts.

**Steps:**
1. Open the Admin Login page and type any email/password.
2. Double-click "Log In" very quickly.
3. Repeat this a few times.

**Expected result:** Only one login attempt should be sent each time.

> ⚠️ **Known issue:** This sometimes fails — about 1 in every 5 tries sends two login attempts instead of one, because the button doesn't lock itself while it's already working. This is being tracked, but is not currently listed as a confirmed bug since it couldn't be reliably reproduced during review.

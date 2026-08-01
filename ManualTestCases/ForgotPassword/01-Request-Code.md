# Manual Test Cases — Forgot Password: Request a Code

These match the automated tests in `tests/Auth/admin-forgot-password-form.spec.js`.

---

## Form Components

### TC-57: All the parts of the "Forgot Your Password?" page are visible

**What to check:** Every piece of the request-a-code form is there and shows up correctly.

**Steps:**
1. Open the Admin Login page and click "Forgot Password?".
2. Look for: the logo, the "Forgot Your Password?" title, the instruction text, the email box, and the "Send code" button.

**Expected result:** All of the above are visible on the page.

---

### TC-58: "Log in here" takes you back to the login page

**What to check:** The link at the bottom returns you to the Login page.

**Steps:**
1. Open the "Forgot Your Password?" page.
2. Click "here" in "Already have an account? Log in here".

**Expected result:** You're taken back to the Login page.

---

## Email Box

### TC-59: Leaving the email box empty shows a warning

**What to check:** If you try to send a code without typing an email, you get a clear message telling you it's required.

**Steps:**
1. Open the "Forgot Your Password?" page.
2. Leave the email box empty and click "Send code".

**Expected result:** A message appears saying the email is required, and nothing is sent.

---

### TC-60: A badly formatted email is rejected — once the box has already shown a warning once

**What to check:** The email box won't let you send a code with text that isn't a real email address.

**Steps:**
1. Open the "Forgot Your Password?" page.
2. Click "Send code" with the box empty first (you should see the "required" warning from TC-59).
3. Now type `not-an-email.com` into the box and click "Send code" again.

**Expected result:** A message appears saying to enter a valid email address, and nothing is sent.

> ⚠️ See TC-63 for what happens when you skip step 2 — that's a separate, known issue.

---

## Successful Request

### TC-61: A real account's email takes you to the code-verification page

**What to check:** Submitting a real admin account's email moves you forward to enter the code.

**Steps:**
1. Open the "Forgot Your Password?" page.
2. Type a real admin account's email address and click "Send code".

**Expected result:** A message appears saying a code was sent, and you're taken to the "Verify OTP" page.

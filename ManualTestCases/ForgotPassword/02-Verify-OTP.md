# Manual Test Cases — Forgot Password: Verify OTP

These match the automated tests in `tests/Auth/admin-verify-otp-form.spec.js`.

---

## Form Components

### TC-62: All the parts of the "Verify OTP" page are visible, and the button starts greyed out

**What to check:** Every piece of the code-entry form is there, and the "Verify OTP" button can't be clicked until a code is typed.

**Steps:**
1. Request a code (see TC-61) to reach the "Verify OTP" page.
2. Look for: the logo, the "Verify OTP" title, the text naming your email, the code box, the "Verify OTP" button, and the "Click here to resend" text.
3. Check whether the "Verify OTP" button looks clickable before typing anything.

**Expected result:** All of the above are visible, and the "Verify OTP" button is greyed out/disabled until a code is entered.

---

## Code Box

### TC-63: Typing fewer than 6 digits keeps the button greyed out

**What to check:** You can't accidentally submit an incomplete code.

**Steps:**
1. Reach the "Verify OTP" page (see TC-61).
2. Type only 2–3 digits into the code box.

**Expected result:** The "Verify OTP" button stays greyed out/disabled the whole time.

---

### TC-64: A wrong 6-digit code shows a "tries remaining" warning

**What to check:** Entering a code that doesn't match shows a clear, non-technical error and tells you how many tries you have left.

**Steps:**
1. Reach the "Verify OTP" page (see TC-61).
2. Type any 6 digits that are NOT the real code you were emailed (e.g. `111222`).
3. Click "Verify OTP".

**Expected result:** A message appears like "Invalid OTP. 4 attempt(s) remaining." and you stay on the same page.

---

## Resend

### TC-65: "Click here to resend it" sends a new code

**What to check:** The resend option actually re-sends the code.

**Steps:**
1. Reach the "Verify OTP" page (see TC-61).
2. Click "Click here" next to "Didn't receive the verification code?".

**Expected result:** A message appears saying a code was sent to your email again.

---

## Successful Verification

### TC-66: The real code from your email moves you on to the "Reset Password" page

**What to check:** Entering the actual code you received works and takes you to the next step.

**Steps:**
1. Request a code (see TC-61) and check your email for the 6-digit code.
2. Type that exact code into the box and click "Verify OTP".

**Expected result:** A message appears saying the code was verified, and you're taken to the "Reset Password" page.

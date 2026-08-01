# Manual Test Cases — Login Form Fields

These match the automated tests in `tests/Auth/admin-login-form.spec.js`.

---

## Form Components

### TC-07: All the parts of the login form are visible

**What to check:** Every piece of the login form is there and shows up correctly.

**Steps:**
1. Open the Admin Login page.
2. Look for: the logo, the "Welcome Back" title, the email box, the password box, the little eye icon inside the password box, the "Forgot Password?" link, and the "Log In" button.

**Expected result:** All of the above are visible on the page.

---

### TC-08: Every clickable item shows a clear highlight when selected with the keyboard

**What to check:** When you move between fields/buttons using the Tab key, you can always see which one is currently selected.

**Steps:**
1. Open the Admin Login page.
2. Click into the email box, then press Tab to move through the page one item at a time (email box → password box → eye icon → "Forgot Password?" → "Log In" button).
3. At each stop, look for a visible highlight (like an outline or glow) around the selected item.

**Expected result:** Every item shows a clear, visible highlight when it's selected.

---

### TC-09: Pressing Tab moves through the form in a sensible order

**What to check:** Using the Tab key moves you through the form in the order you'd expect, without skipping or getting stuck.

**Steps:**
1. Open the Admin Login page.
2. Click somewhere blank on the page first, then press Tab repeatedly and note where the highlight lands each time.

**Expected result:** The order should be: email box → password box → eye icon → "Forgot Password?" → "Log In" button.

> ℹ️ **Note:** "Forgot Password?" is currently highlighted twice in a row before moving to "Log In" (a small extra step, not a big issue). See `Bugs/Login/admin-login-duplicate-forgot-password-focus-stop.md`. Also, on Safari this test doesn't apply the same way, since Safari by default only lets Tab move between the text boxes, not links/buttons — that's normal Safari behavior, not a bug.

---

## Email Box

### TC-10: Leaving the email box empty shows a warning

**What to check:** If you try to log in without typing an email, you get a clear message telling you it's required.

**Steps:**
1. Open the Admin Login page.
2. Leave the email box empty. Type any password.
3. Click "Log In".

**Expected result:** A message appears saying the email is required.

---

### TC-11: Badly formatted emails are rejected

**What to check:** The email box won't accept text that isn't a real email address.

**Steps:**
1. Open the Admin Login page.
2. Try typing each of the following into the email box, one at a time, and try to submit:
   - `not-an-email.com` (no @ symbol)
   - `user@` (nothing after the @)
   - `user@@example.com` (two @ symbols)

**Expected result:** None of these should be accepted as a valid email — the form should stop you from submitting with any of them.

---

### TC-12: Correctly formatted emails are accepted, whether typed in capital or small letters

**What to check:** A properly formatted email works whether it's typed in uppercase, lowercase, or a mix.

**Steps:**
1. Open the Admin Login page.
2. Type a valid email in all uppercase letters (e.g. `VALID.USER@EXAMPLE.COM`) into the email box.
3. Try again with the same email in all lowercase letters.

**Expected result:** Both versions should be accepted as valid email formats.

---

### TC-13: Typing unusual characters or emojis into the email box doesn't break anything

**What to check:** The page doesn't crash or glitch if you type unusual text into the email box.

**Steps:**
1. Open the Admin Login page.
2. Type some accented/foreign characters into the email box (for example "üñîçødé.üser@example.com").
3. Clear it and type an email containing an emoji (for example "😀user@example.com").
4. Check the browser console for any red error messages.

**Expected result:** The text appears in the box as typed, and no errors show up in the console.

---

### TC-14: Very long emails are cut off at a sensible length and don't break the page layout

**What to check:** If someone pastes in a huge, unrealistic email address, the page handles it gracefully.

**Steps:**
1. Open the Admin Login page.
2. Type or paste a very long email address (over 50 characters) into the email box.
3. Check the page layout doesn't stretch or break, and try scrolling sideways.

**Expected result:** The email box should stop accepting more characters after 50, and the page should never scroll sideways.

---

### TC-15: Malicious-looking text is rejected by the email box

**What to check:** The email box won't accept text designed to trick or attack the system.

**Steps:**
1. Open the Admin Login page.
2. Try typing text like `' OR '1'='1` or `<script>alert(1)</script>` into the email box and attempt to submit.

**Expected result:** None of this text should be accepted as a valid email — nothing unusual should happen (no pop-ups, no crashes).

---

### TC-16: Pasting an email into the box works the same as typing it

**What to check:** Copy-pasting an email address into the box works just as well as typing it manually.

**Steps:**
1. Copy a valid email address to your clipboard.
2. Paste it into the email box.

**Expected result:** The pasted email appears correctly in the box, exactly as if it had been typed.

---

## Password Box

### TC-17: The password is hidden by default

**What to check:** When typing a password, the characters are hidden (shown as dots), not shown in plain text.

**Steps:**
1. Open the Admin Login page.
2. Type a password into the password box.

**Expected result:** The characters appear as dots/hidden symbols, not as readable text.

---

### TC-18: Leaving the password box empty shows a warning

**What to check:** If you try to log in without typing a password, you get a clear message telling you it's required.

**Steps:**
1. Open the Admin Login page.
2. Type a valid email, but leave the password box empty.
3. Click "Log In".

**Expected result:** A message appears saying the password is required.

---

### TC-19: Spaces and very long passwords are handled sensibly

**What to check:** Extra spaces in a password aren't silently removed, and overly long passwords are capped rather than breaking things.

**Steps:**
1. Open the Admin Login page.
2. Type a password with a space at the very beginning.
3. Clear the box, then type or paste a very long password (over 50 characters).

**Expected result:** The password with a leading space should keep that space. The very long password should stop accepting more characters after 50.

---

### TC-20: Typing, selecting, and deleting text in the password box works normally

**What to check:** Basic keyboard editing (type, select-all, delete) works as expected in the password box.

**Steps:**
1. Open the Admin Login page.
2. Type a password into the password box.
3. Select all the text (Cmd+A on Mac, Ctrl+A on Windows) and press Backspace/Delete.

**Expected result:** All the text is removed, leaving the password box empty.

---

## Show/Hide Password (the eye icon)

### TC-21: Clicking the eye icon shows and hides the password

**What to check:** Clicking the small eye icon toggles the password between hidden and visible.

**Steps:**
1. Open the Admin Login page.
2. Type a password into the password box.
3. Click the eye icon once, then click it again.

**Expected result:** The first click reveals the password as plain readable text. The second click hides it again.

---

### TC-22: Text typed while the password is visible stays correct

**What to check:** If you keep typing after revealing the password, nothing gets scrambled or lost.

**Steps:**
1. Open the Admin Login page.
2. Type part of a password (e.g. "Sup3r").
3. Click the eye icon to reveal it.
4. Continue typing the rest (e.g. "Secret!").

**Expected result:** The full password ("Sup3rSecret!") appears correctly and stays visible.

---

### TC-23: The eye icon can be used with the keyboard, not just a mouse click

**What to check:** Someone who can't use a mouse can still show/hide the password using the keyboard.

**Steps:**
1. Open the Admin Login page.
2. Type a password.
3. Use the Tab key to move the keyboard highlight onto the eye icon.
4. Press Enter, then press the Space bar.

**Expected result:** Pressing Enter reveals the password, and pressing Space hides it again.

---

## Forgot Password Link

### TC-24: Clicking "Forgot Password?" takes you to the right page

**What to check:** The link goes to the correct password-reset page.

**Steps:**
1. Open the Admin Login page.
2. Click "Forgot Password?".

**Expected result:** You're taken to the forgot-password page.

---

### TC-25: "Forgot Password?" works with the keyboard, and the Back button returns you to login

**What to check:** The link is reachable/usable without a mouse, and browser Back works as expected afterward.

**Steps:**
1. Open the Admin Login page.
2. Use the Tab key to highlight "Forgot Password?", then press Enter.
3. Once on the forgot-password page, click your browser's Back button.

**Expected result:** Pressing Enter takes you to the forgot-password page, and clicking Back returns you to the login page.

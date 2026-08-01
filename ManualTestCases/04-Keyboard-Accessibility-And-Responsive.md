# Manual Test Cases — Keyboard Use, Accessibility, and Different Screen Sizes

These match the automated tests in `tests/Auth/admin-login-a11y-responsive.spec.js`.

---

## Using the Keyboard Only

### TC-38: You can log in using only the keyboard, no mouse needed

**What to check:** Someone who can't use a mouse can still complete the whole login process.

**Steps:**
1. Open the Admin Login page.
2. Without touching the mouse, press Tab to reach the email box, type your email.
3. Press Tab to reach the password box, type your password.
4. Press Enter.

**Expected result:** You should be logged in and taken to the Dashboard, all without using the mouse.

---

### TC-39: Every item shows a clear highlight when selected with the keyboard

**What to check:** As you Tab through the form, you can always see which item is currently selected.

**Steps:**
1. Open the Admin Login page.
2. Press Tab repeatedly and watch for a visible highlight around each item as it's selected (email box, password box, eye icon, "Forgot Password?", "Log In" button).

**Expected result:** Every item shows a clearly visible highlight (like an outline or glow) when selected.

---

## Screen Reader Friendliness (Accessibility)

### TC-40: The email and password boxes are properly announced by screen readers

**What to check:** A screen reader (a tool used by people with visual impairments) correctly identifies each box.

**Steps:**
1. Turn on a screen reader (or use an accessibility-checking browser tool).
2. Move focus to the email box, then the password box, and listen to what's announced.

**Expected result:** The screen reader should say "Email" when on the email box, and "Password" when on the password box.

> ⚠️ **Known issue:** This currently fails — the boxes aren't properly linked to their on-screen labels, so a screen reader can't reliably announce them. See `Bugs/Login/admin-login-unlabeled-fields.md`.

---

### TC-41: The email and password boxes are announced as "required"

**What to check:** A screen reader tells the user that these fields must be filled in.

**Steps:**
1. Using a screen reader (or accessibility tool), move focus to the email box and password box.
2. Listen for whether it says the field is "required".

**Expected result:** Both boxes should be announced as required fields.

> ⚠️ **Known issue:** This currently fails — neither box is marked as required in a way a screen reader can detect. See `Bugs/Login/admin-login-unlabeled-fields.md`.

---

## Different Screen Sizes

### TC-42 to TC-46: The form looks correct on every screen size

**What to check:** The login form doesn't break, overlap, or scroll sideways on any screen size.

**Steps:**
1. Open the Admin Login page.
2. Check the page at each of the following sizes (you can resize your browser window or use your browser's device simulation mode):
   - Desktop (wide screen)
   - Tablet, upright (portrait)
   - Tablet, sideways (landscape)
   - Phone, upright (portrait)
   - Phone, sideways (landscape)
3. At each size, confirm the email box, password box, and "Log In" button are all visible, and try scrolling sideways.

**Expected result:** At every size, all the form items are visible and usable, and the page never scrolls sideways.

---

### TC-47: Buttons and links are big enough to tap easily on a phone

**What to check:** On a small screen, nothing is so small that it's hard to tap accurately with a finger.

**Steps:**
1. Open the Admin Login page on a phone-sized screen.
2. Try tapping the email box, password box, "Log In" button, and "Forgot Password?" link.

**Expected result:** All of these should be comfortably large enough to tap without accidentally hitting the wrong thing.

> ⚠️ **Known issue:** The "Forgot Password?" link is shorter than it should be on mobile (about 20px tall, when 24px is the recommended minimum), making it a little harder to tap accurately. See `Bugs/Login/admin-login-forgot-password-touch-target.md`.

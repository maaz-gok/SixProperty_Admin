# Manual Test Cases — Dashboard: Bottom User Section (Profile & Sign Out)

These match the automated tests in `tests/Dashboard/dashboard-user-section.spec.js`.

---

### TC-116: The bottom-left corner shows your avatar, name, email, and a clearly different-looking Sign Out button

**Steps:**
1. Log in to the Dashboard and look at the bottom-left of the sidebar.
2. Confirm you see an avatar icon, the word "Admin", and your email address.
3. Confirm the "Sign Out" button/link is visibly styled differently (e.g. a different color) from the name/email above it.

**Expected result:** Avatar, "Admin" label, and email are all visible, and "Sign Out" is clearly visually distinct (styled as a warning/destructive action) from the profile info above it.

---

### TC-117: Clicking your own name/email logs you out instead of opening a profile page

**Steps:**
1. Log in to the Dashboard.
2. Click on your name/email link at the bottom of the sidebar.
3. After landing on whatever page appears, try going directly to the Dashboard's address again.

**Expected result:** Clicking your name should open a profile or account page — not sign you out.

> ⚠️ **Known issue:** This currently fails — clicking your name/email sends you straight to the sign-in page, exactly like clicking "Sign Out" would. Oddly, your session isn't actually cleared: going back to the Dashboard's address directly afterward still works without logging in again. See `Bugs/Dashboard/dashboard-profile-link-redirects-to-sign-in.md`.

---

### TC-118: Typing the profile page's address directly also sends you to sign-in

**Steps:**
1. Log in to the Dashboard.
2. Manually type the address for the profile page (`/profile`) into the address bar and press Enter.

**Expected result:** Ideally this would open a profile page.

> ⚠️ **Known issue:** This currently redirects to the sign-in page instead, matching the same gap described in TC-117 — there's simply no working profile page yet. See `Bugs/Dashboard/dashboard-profile-link-redirects-to-sign-in.md`.

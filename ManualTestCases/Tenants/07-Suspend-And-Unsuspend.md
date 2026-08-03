# Manual Test Cases — Tenants: Suspend & Unsuspend

These match the automated tests in `tests/Tenants/tenants-suspend.spec.js`.

> **Important:** Never use `jwatson@thesixpm.com` ("Jeremy") for any of these tests — that's a real client's account, not a test account. Always use one of the disposable "Maaz Tenant T#" or "Anus Tenant" test accounts instead.
>
> **Extra warning specific to Tenants:** Unlike Landlords, there is currently **no working way to reverse a Suspend from this screen at all** — see the known issue on TC-188 below. If you suspend a real disposable test tenant while testing TC-188 or TC-189, it will **stay suspended** until someone with backend/API access manually reverses it. Only run those two specific test cases if you're prepared for that, ideally with a developer on hand to undo it afterward.

---

### TC-187: Suspending a tenant should ask "are you sure?" before it actually happens

**What to check:** Suspending someone's account is a big action — the app should double-check with you before doing it.

**Steps:**
1. Find any disposable test tenant marked "Active".
2. Click the "Suspend" button next to their name.

**Expected result:** A confirmation pop-up should appear asking you to confirm, before anything actually changes.

> ⚠️ **Known issue:** This currently fails — no confirmation pop-up appears at all. Clicking "Suspend" immediately fires the request and shows a "User suspended successfully." success message, with no way to back out. This is the same shared issue already reported for Landlords (see `Bugs/Landlords/landlords-suspend-no-confirmation.md`).

---

### TC-188: After suspending, the tenant's row should show "Suspended" and an "Unsuspend" button

**Steps:**
1. Find any disposable test tenant marked "Active".
2. Click "Suspend".
3. Check the row's Status column and Actions button, both right away and after refreshing the page.

**Expected result:** After suspending, the Status column should say "Suspended" and the Actions button should now say "Unsuspend" — the same way this already works on the Landlords page.

> ⚠️ **Known issue — the most serious one found in this module:** This currently fails. The success message does appear (the suspend genuinely happens on the backend), but the row keeps showing "Active" / "Suspend", even after a full page refresh. Since the button never changes to "Unsuspend", **there is no way to reverse this from the Tenants screen at all.** See `Bugs/Tenants/tenants-suspend-does-not-update-or-allow-unsuspend.md`. Only reverse a real test account by asking a developer to call the "unsuspend" action directly.

---

### TC-189: There should be some way to bring a suspended tenant back

**Steps:**
1. Continuing from TC-188 (a tenant you just suspended).

**Expected result:** There should be a usable "Unsuspend" button somewhere on this tenant's row.

> ⚠️ **Known issue — direct consequence of TC-188:** No "Unsuspend" button ever appears anywhere for a suspended tenant on this screen, since the row never even shows them as suspended in the first place. See the same bug report as TC-188.

---

### TC-190: Trying to suspend "Ahmed Khan" is correctly and safely refused

**What to check:** This one is safe to test freely — the account is never actually suspended, no matter how many times you try.

**Steps:**
1. Search for "Ahmed Khan" (`mudassir+909@geeksofkolachi.com`) — this record isn't on the first page by default.
2. Click "Suspend" on their row.

**Expected result:** A clear red error message appears saying "Admin users cannot be suspended." — and it's correctly refused. Checking afterward, your own admin session still works fine (no lockout).

> ⚠️ **Separate known issue (data problem, not a functional bug):** This tenant record's underlying account is linked to a real admin's own login, which shouldn't be possible for a tenant record to begin with. The suspend attempt itself is handled correctly. See `Bugs/Tenants/tenants-record-linked-to-admin-account.md`.

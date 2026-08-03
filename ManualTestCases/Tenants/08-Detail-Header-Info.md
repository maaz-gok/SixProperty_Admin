# Manual Test Cases — Tenants: Detail Header & Tenant Information

These match the automated tests in `tests/Tenants/tenants-detail-header-info.spec.js`.

---

### TC-191: The header shows a real photo when one's uploaded, or initials otherwise

**Steps:**
1. Open the details page of a tenant with a profile photo uploaded (e.g. "Maaz Tenant").
2. Open the details page of a tenant with no profile photo (e.g. "Anus Tenant").

**Expected result:** The first tenant shows their real uploaded photo next to their name. The second shows a circle with their initials instead (e.g. "AT"). Neither header shows a colored status badge (Active/Invited/Pending) directly next to the name — that badge only appears further down, next to the "Tenant Information" section heading.

---

### TC-192: Tenant Information fields match the real data for a fully-populated tenant

**Steps:**
1. Open the details page of a fully-populated tenant (e.g. "Maaz Tenant").
2. Check each field in the "Tenant Information" section: Email, Phone, Unit, Rent, Security Deposit Held, Invite Code, Landlord, Landlord Email, Property, Property Address.

**Expected result:** Every field matches the tenant's real underlying data. Rent shows with a "$" sign and thousands separators. Security Deposit Held shows "Yes" or "No" (not the raw underlying value).

---

### TC-193: Missing Tenant Information fields render sensibly

**Steps:**
1. Open the details page of a sparse tenant with mostly empty fields (e.g. "Anus Tenant").
2. Check the "Lease Start" and "Security Deposit Held" fields specifically.

**Expected result:** A missing "Lease Start" shows a dash ("—"). "Security Deposit Held" is a documented inconsistency worth knowing about: instead of also showing "—" when the underlying field is missing, it quietly shows "No" — not treated as a bug fix target, just something to be aware doesn't match the "—" pattern used everywhere else.

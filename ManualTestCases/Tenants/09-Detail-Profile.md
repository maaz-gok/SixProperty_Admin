# Manual Test Cases — Tenants: Detail Profile Section

These match the automated tests in `tests/Tenants/tenants-detail-profile.spec.js`.

---

### TC-194: Profile fields render correctly formatted for a fully-populated tenant

**Steps:**
1. Open the details page of a fully-populated tenant (e.g. "Maaz Tenant").
2. Check the Profile section's Date of Birth, Emergency Contact, Vehicle, and Location fields.

**Expected result:** Date of Birth reads like "Jan 14, 2002". Emergency Contact reads as "Name (Relationship) • Phone number". Vehicle reads as "Make Model Year • Plate (State)". This particular tenant has no Location on file even though everything else is filled in, so Location correctly shows a dash ("—") — that's expected for this account, not a bug.

---

### TC-195: Profile fields all show a dash for a tenant with no profile sub-fields on file

**Steps:**
1. Open the details page of a sparse tenant (e.g. "Anus Tenant").
2. Check the same four Profile fields (Date of Birth, Location, Emergency Contact, Vehicle).

**Expected result:** All four fields consistently show a dash ("—") — never blank space, "undefined", or a broken layout.

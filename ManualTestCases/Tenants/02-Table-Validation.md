# Manual Test Cases — Tenants: Table Validation

These match the automated tests in `tests/Tenants/tenants-table.spec.js`.

---

### TC-170: Every row shows the right kind of information

**Steps:**
1. Look at a tenant whose account is fully set up (e.g. "Maaz Tenant T4").

**Expected result:** The row shows all 8 pieces of information in order: Name, Email, Landlord, Property, Unit, Rent, Status, Actions. Rent shows with a "$" sign and thousands separators (e.g. "$1,500"). Status shows one of "Active", "Invited", or "Pending". Since this tenant has a linked account, the "Suspend" button in Actions is clickable (not greyed out).

---

### TC-171: Two different tenants can share the same email address

**Steps:**
1. Search for the email `anus.ahmed+76@geeksofkolachi.com`.

**Expected result:** Two separate rows show up for that one email — one for "Alex" and one for "Jame" — not one row, and not an error. Searching each name individually also correctly finds just that one row.

---

### TC-172: Short unit numbers and long property names both display in full

**Steps:**
1. Find a tenant with a short, purely numeric unit (e.g. unit "11").
2. Find a tenant whose property has an unusually long name (e.g. "Sunrise heights Apartments").

**Expected result:** Neither value is cut off, hidden, or replaced with "..." — both display completely in their column.

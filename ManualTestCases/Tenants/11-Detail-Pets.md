# Manual Test Cases — Tenants: Detail Pets Section

These match the automated tests in `tests/Tenants/tenants-detail-pets.spec.js`.

---

### TC-199: A tenant with no pets shows a clear "no pets" message

**Steps:**
1. Open the details page of a tenant with no pets on file (e.g. "Anus Tenant").

**Expected result:** The Pets section shows "No pets on file" — not blank space or an error.

---

### TC-200: A tenant with one pet shows a single, correctly-filled pet card

**Steps:**
1. Open the details page of a tenant with exactly one pet (e.g. "Alex").

**Expected result:** One pet card shows up with the pet's name and details formatted as "Type • Breed" (e.g. "Cat • Persian"). The "No pets on file" message does not appear.

---

### TC-201: A tenant with several pets, including unusual types, shows every card correctly

**Steps:**
1. Open the details page of a tenant with multiple pets of different types, including less common ones like a bird or a fish (e.g. "Maaz Tenant").

**Expected result:** Every pet shows its own card, each correctly formatted as "Type • Breed", including the less common types — nothing is dropped, merged, or mislabeled.

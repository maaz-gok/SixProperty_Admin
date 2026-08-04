# Manual Test Cases — Platform Activity: Activity Types

These match the automated tests in `tests/PlatformActivity/platform-activity-types.spec.js`.

---

### TC-341: The "Sign Up" badge looks the same whether it's a tenant, landlord, or admin signing up

**Steps:**
1. Find a "New tenant" sign-up row, a "New landlord" sign-up row, and (further back in the list) a "New admin" sign-up row.

**Expected result:** All three show the exact same "Sign Up" badge in the Type column — it's the Title column ("New tenant" / "New landlord" / "New admin") that tells them apart, not the badge itself.

---

### TC-342: "Rent Paid" rows always show a dollar amount

**Steps:**
1. Look at a few different "Rent Paid" rows.

**Expected result:** Every one shows the "Rent Paid" badge, the title "Rent paid", and a message containing a dollar amount (e.g. "$800", "$1,200").

---

### TC-343: The maintenance badge says "Maintenance", not "Maintenance Request"

**Steps:**
1. Find any row about a new maintenance request.

**Expected result:** The badge in the Type column reads exactly "Maintenance" — a shorter label than you might expect, not the full "Maintenance Request".

---

### TC-344: Each of the three activity types has its own badge colour

**Steps:**
1. Compare the badge colours for "Sign Up", "Rent Paid", and "Maintenance" side by side.

**Expected result:** Each type has a clearly different colour (confirmed: Sign Up is purple, Rent Paid is green, Maintenance is amber/orange) — you can tell them apart by colour alone, not just by reading the text.

---

### TC-345: No unexpected activity type shows up anywhere in the list

**Steps:**
1. Page through the activity list and note every distinct badge you see.

**Expected result:** Only three badge types ever appear: "Sign Up", "Rent Paid", and "Maintenance". Nothing else shows up.

# Manual Test Cases — Properties: Table Validation

These match the automated tests in `tests/Properties/properties-table.spec.js`.

---

### TC-221: Every row in the table shows the right kind of information

**Steps:**
1. Look at a property that has at least one tenant (e.g. "Grove").
2. Look at a property with zero tenants (e.g. "Green Valley Residences").
3. Check the Actions column for any property.

**Expected result:** Every row shows all 6 pieces of information in order: Property name, Address, Landlord, Unit, Tenants, Actions. A property with zero tenants shows "0" in that column, not blank. The Actions column only ever shows one button, "View" — there's no Suspend, Edit, or Delete button anywhere in this table.

---

### TC-222: A property with no Unit set shows a dash, not a blank space

**Steps:**
1. Find a property whose Unit column is empty (e.g. "Fortune Heights").

**Expected result:** The Unit column shows a dash ("—") instead of being completely blank.

---

### TC-223: Properties that share the same name still open their own separate pages

**Steps:**
1. Find two or more rows named "The Marlowe" (this name repeats several times in the list, each with a different address).
2. Click "View" on one of them, note which property opens, then go back.
3. Click "View" on a different "The Marlowe" row.

**Expected result:** Each "The Marlowe" row opens its own correct property page — matching that row's address — not the same one every time.

---

### TC-224: The column titles (Property, Address, etc.) are just labels — they don't sort the list

**Steps:**
1. Note the order the properties are listed in.
2. Click directly on each column title one at a time (Property, Address, Landlord, Unit, Tenants).

**Expected result:** Nothing happens when you click a column title — no arrows appear, and the order of the list never changes.

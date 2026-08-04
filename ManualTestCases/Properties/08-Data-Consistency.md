# Manual Test Cases — Properties: Data Consistency

These match the automated tests in `tests/Properties/properties-data-consistency.spec.js`.

> **What to check:** These compare what's shown on screen against what the server actually sent back. This is easiest to verify using your browser's developer tools (Network tab) to see the raw data, but the important thing to check by eye is that nothing on screen looks made-up or mismatched.

---

### TC-254: Everything shown in the properties list matches the real data

**Steps:**
1. Open the Properties list.
2. Pick a few different rows and check: property name, address, and tenant count.

**Expected result:** Every value shown matches the real underlying data for that property. Remember that some properties share the exact same name and address (like the several "The Marlowe" entries at "248 West 73rd St, New York") — when checking those specific rows, it's fine if you can't tell them apart by eye; the important thing is that the *set* of tenant-count numbers shown across those matching rows is correct overall, not necessarily which exact row has which number.

---

### TC-255: Everything on a property's details page matches the real data

**Steps:**
1. Open a property's details page (e.g. "Grove").
2. Check the name, address, "Created" date, and the tenant's email and rent against the real data.

**Expected result:** Every value shown matches the real underlying data for that property.

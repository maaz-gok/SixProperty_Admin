# Manual Test Cases — Tenants: Detail Documents Section

These match the automated tests in `tests/Tenants/tenants-detail-documents.spec.js`.

---

### TC-196: One button appears per uploaded file, grouped under the right document type

**Steps:**
1. Open the details page of a fully-populated tenant (e.g. "Maaz Tenant").
2. Look under "Identity Document" and "Renters Insurance".

**Expected result:** "Identity Document" shows two separate buttons (front and back of the ID). "Renters Insurance" shows one button for its file. Each button is labeled with the actual uploaded filename.

---

### TC-197: Clicking a document opens a working preview

**Steps:**
1. Click an image document button (e.g. a `.png` file).
2. Close it, then click a PDF document button.

**Expected result:** Both open a preview pop-up showing the filename as a heading. The image shows directly; the PDF shows in an embedded viewer. Both have a working "Open in new tab" link pointing to the real file.

> ℹ️ **Note (not a bug):** Opening this preview always triggers a minor accessibility warning in the browser's technical console (a missing screen-reader description). This is expected, benign console noise — not something to report.

---

### TC-198: Missing documents show a dash, not a broken button

**Steps:**
1. Open the details page of a sparse tenant with no documents on file (e.g. "Anus Tenant").
2. Check "Identity Document" and "Renters Insurance".

**Expected result:** Both sections show a plain dash ("—") — never an empty/broken-looking button, and never blank space with no explanation.

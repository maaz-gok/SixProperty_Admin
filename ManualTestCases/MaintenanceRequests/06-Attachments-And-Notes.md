# Manual Test Cases — Maintenance Requests: Attachments & Notes

These match the automated tests in `tests/MaintenanceRequests/maintenance-requests-attachments-notes.spec.js`.

---

### TC-298: Attachments are listed with simple numbered labels

**Steps:**
1. Open the details page of a request with attachments (e.g. "Keys Stuck in door", which has 2).

**Expected result:** Each attachment shows as its own button, labeled "Attachment 1", "Attachment 2", and so on — not by the file's real name. (This is expected: the system doesn't store the original filenames, only the files themselves, so there's no real name to show.)

---

### TC-299: Clicking a photo attachment shows the photo right there in a pop-up

**Steps:**
1. Click the attachment button that's a photo (a `.jpg` file).

**Expected result:** A pop-up window opens showing the photo itself, along with an "Open in new tab" link and a way to close the pop-up.

---

### TC-300: Clicking a video attachment plays the video right there in a pop-up

**Steps:**
1. Click the attachment button that's a video (a `.mp4` file).

**Expected result:** A pop-up window opens with a real, playable video player (with play/pause controls), along with an "Open in new tab" link.

---

### TC-301: The attachment pop-up's close button works

**Steps:**
1. Open any attachment pop-up.
2. Click its close button.

**Expected result:** The pop-up closes and you're back on the request's details page, unchanged.

---

### TC-302: A request with no attachments shows "No attachments"

**Steps:**
1. Open the details page of a request with no attachments (e.g. "Keys issue" or "Test").

**Expected result:** The Attachments section shows the text "No attachments" instead of an empty or broken-looking area.

---

### TC-303: Notes appear in the order they were written, oldest first

**Steps:**
1. Open a request with more than one note (e.g. "Keys issue", which has 2).
2. Check the order they appear in, along with their timestamps.

**Expected result:** The notes appear oldest-first, each showing its text and the date/time it was written.

---

### TC-304: Notes never show who wrote them

**Steps:**
1. Look closely at a note's text and timestamp.

**Expected result:** There's no name, email, or "posted by" label anywhere near a note — just the note's text and when it was written.

---

### TC-305: Each request only shows its own notes, never another request's

**Steps:**
1. Open one request's details page and note its notes.
2. Open a different request's details page and check its notes are completely different.

**Expected result:** Notes never leak between different requests' pages.

---

### TC-306: A request with no notes shows "No notes yet"

**Steps:**
1. Open the details page of a request with no notes (e.g. "Test").

**Expected result:** The Notes section shows the text "No notes yet" instead of an empty area.

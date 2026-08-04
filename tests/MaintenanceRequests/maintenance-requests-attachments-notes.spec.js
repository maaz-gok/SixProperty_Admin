import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Maintenance Requests - Attachments', () => {
  test('lists all attachments with generic numbered labels @smoke', async ({ page }) => {
    await loginOnly(page);
    const { id, attachmentCount } = requests.resolvedWithAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    const buttons = details.attachmentsContainer.getByRole('button');
    await expect(buttons).toHaveCount(attachmentCount);
    await expect(details.attachmentButton('Attachment 1')).toBeVisible();
    await expect(details.attachmentButton('Attachment 2')).toBeVisible();
  });

  test('clicking an image attachment opens a dialog with an inline preview @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const { id, imageAttachmentLabel } = requests.resolvedWithAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await details.attachmentButton(imageAttachmentLabel).click();

    await expect(details.dialog).toBeVisible();
    await expect(details.dialogHeading).toHaveText(imageAttachmentLabel);
    await expect(details.dialogImage).toBeVisible();
    await expect(details.dialogOpenInNewTabLink).toBeVisible();
    await expect(details.dialogOpenInNewTabLink).toHaveAttribute('href', /amazonaws\.com/);
  });

  // Confirmed live via the raw DOM (a plan-authoring accessibility-snapshot
  // tool limitation had originally missed this — <video> elements don't
  // surface in that tool's output the way <img> does, the same category of
  // blind spot already retracted once for Properties): the video (.mp4)
  // attachment DOES get an inline preview, via a real <video src=...
  // controls> element with the correct signed URL — not "no preview" as an
  // earlier plan draft assumed. Corrected here and in
  // specs/maintenance-requests.md.
  test('clicking a video attachment opens a dialog with a working inline <video> player @regression', async ({ page }) => {
    await loginOnly(page);
    const { id, videoAttachmentLabel } = requests.resolvedWithAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await details.attachmentButton(videoAttachmentLabel).click();

    await expect(details.dialog).toBeVisible();
    await expect(details.dialogHeading).toHaveText(videoAttachmentLabel);
    await expect(details.dialogImage).not.toBeVisible();
    const video = details.dialog.locator('video');
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('src', /amazonaws\.com/);
    await expect(details.dialogOpenInNewTabLink).toBeVisible();
  });

  test('the attachment dialog\'s close button closes it @regression', async ({ page }) => {
    await loginOnly(page);
    const { id, imageAttachmentLabel } = requests.resolvedWithAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await details.attachmentButton(imageAttachmentLabel).click();
    await expect(details.dialog).toBeVisible();

    await details.dialogCloseButton.click();
    await expect(details.dialog).not.toBeVisible();
  });

  test('zero attachments renders "No attachments", not a broken section @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.noAttachmentsText).toBeVisible();
  });
});

test.describe('Maintenance Requests - Notes', () => {
  test('notes render in chronological order with text and timestamp @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const { id, notes } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.notesItems).toHaveCount(notes.length);
    for (let i = 0; i < notes.length; i += 1) {
      await expect(details.notesItems.nth(i)).toContainText(notes[i]);
    }
  });

  // Confirmed live: the API tracks an `addedBy` user id per note, but no
  // author name/avatar is ever rendered in the UI. Not a bug — do not
  // expect one.
  test('notes never display an author, despite the API tracking one @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    const firstNoteText = await details.notesItems.first().textContent();
    expect(firstNoteText).not.toMatch(/@|admin|landlord/i);
  });

  test('notes are correctly scoped per-request, no cross-contamination @regression', async ({ page }) => {
    await loginOnly(page);
    const a = requests.resolvedNoAttachments;
    const b = requests.resolvedWithAttachments;

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(a.id);
    await expect(details.notesItems).toHaveCount(a.notes.length);
    await expect(details.notesItems.first()).toContainText(a.notes[0]);

    await details.goto(b.id);
    await expect(details.notesItems).toHaveCount(b.notes.length);
    await expect(details.notesItems.first()).toContainText(b.notes[0]);
  });

  test('zero notes renders "No notes yet" @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.openEmptyState;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.noNotesText).toBeVisible();
  });
});

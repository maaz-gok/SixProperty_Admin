import { BasePage } from './BasePage.js';

export class MaintenanceRequestDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.backButton = page.getByRole('button', { name: 'Back' });
    // The request's title is the only h3 on this page.
    this.titleHeading = page.getByRole('heading', { level: 3 });
    // Unlike Landlords/Tenants, the subtitle here is the property's actual
    // (dynamic) name, not a static caption — same pattern as
    // PropertyDetailsPage.js's addressSubtitle. Confirmed live: the
    // property-name <p> is the heading's immediate following sibling.
    this.propertySubtitle = this.titleHeading.locator('xpath=following-sibling::p[1]');

    // Badge row (Status, Priority, Category, in that fixed order) sits
    // directly below the header block. Confirmed live via the raw DOM
    // (3 levels up from the heading, not 2 — there's an extra icon <span>
    // wrapper alongside the title/subtitle div): heading -> title/subtitle
    // wrapper -> [icon span + title wrapper] row -> header row (incl. Back
    // button) -> next sibling is the badge row, whose 3 direct children are
    // the badges themselves in that order. No accessible label distinguishes
    // them (see specs/maintenance-requests.md Scenario 9.2).
    this.badgesRow = this.titleHeading.locator('xpath=../../../following-sibling::*[1]');
    this.statusBadge = this.badgesRow.locator('xpath=./*[1]');
    this.priorityBadge = this.badgesRow.locator('xpath=./*[2]');
    this.categoryBadge = this.badgesRow.locator('xpath=./*[3]');

    this.infoSectionHeading = page.getByText('Request Information', { exact: true });
    this.descriptionHeading = page.getByText('Description', { exact: true });
    this.attachmentsHeading = page.getByText('Attachments', { exact: true });
    this.notesHeading = page.getByText('Notes', { exact: true });

    // Each section label ("Description"/"Attachments"/"Notes") sits inside
    // its own header-row <div>, which is a SIBLING of the section's body
    // <div> (not the label itself) — confirmed live via the raw DOM:
    // label -> parentElement (header row) -> nextElementSibling (body).
    // A single following-sibling::*[1] from the label has no effect since
    // the header row has no other children at that level.
    this.descriptionText = this.descriptionHeading.locator('xpath=../following-sibling::*[1]');
    this.attachmentsContainer = this.attachmentsHeading.locator('xpath=../following-sibling::*[1]');
    this.noAttachmentsText = page.getByText('No attachments', { exact: true });

    this.notesContainer = this.notesHeading.locator('xpath=../following-sibling::*[1]');
    this.notesItems = this.notesContainer.getByRole('listitem');
    this.noNotesText = page.getByText('No notes yet', { exact: true });

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });
    this.errorHeading = page.getByRole('heading', { name: 'Something went wrong', level: 3 });
    this.errorText = page.getByText('We encountered an error. Please try again.');
    this.retryButton = page.getByRole('button', { name: 'Retry' });

    this.dialog = page.getByRole('dialog');
    this.dialogHeading = this.dialog.getByRole('heading', { level: 2 });
    this.dialogImage = this.dialog.locator('img');
    this.dialogOpenInNewTabLink = this.dialog.getByRole('link', { name: 'Open in new tab' });
    // The dialog's own close button is its last button (first is the
    // "Open in new tab" link, which is an <a>, not a <button>). Confirmed
    // live: exactly one <button> renders inside the dialog besides the link.
    this.dialogCloseButton = this.dialog.getByRole('button');
  }

  async goto(id) {
    await this.page.goto(`/maintenance-requests/${id}`);
    await this.waitForReady();
  }

  /** Request Information `<dt>/<dd>` value for a given field label. */
  infoValue(label) {
    return this.page
      .locator('dt')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::dd[1]');
  }

  attachmentButton(label) {
    return this.attachmentsContainer.getByRole('button', { name: label });
  }

  noteItem(text) {
    return this.notesItems.filter({ hasText: text });
  }
}

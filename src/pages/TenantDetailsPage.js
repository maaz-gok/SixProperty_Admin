import { BasePage } from './BasePage.js';

export class TenantDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.backButton = page.getByRole('button', { name: 'Back' });
    // The tenant's name is the only h3 on this page.
    this.nameHeading = page.getByRole('heading', { level: 3 });
    this.subtitle = page.getByText('Tenant Details', { exact: true });

    // Confirmed live: unlike Landlords, every section label here ("Tenant
    // Information", "Profile", "Documents", "Pets") is a plain <div>, not a
    // semantic heading — there is no h4 anywhere on this page.
    this.infoSectionHeading = page.getByText('Tenant Information', { exact: true });
    this.profileSectionHeading = page.getByText('Profile', { exact: true });
    this.documentsSectionHeading = page.getByText('Documents', { exact: true });
    this.petsSectionHeading = page.getByText('Pets', { exact: true });

    // Status badge is a sibling of the section label within the same flex
    // row, same pattern as Landlords' details page.
    this.statusBadge = this.infoSectionHeading.locator('xpath=..').getByText(/^(Active|Invited|Pending)$/);

    this.noPetsText = page.getByText('No pets on file', { exact: true });

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });
    this.errorHeading = page.getByRole('heading', { name: 'Something went wrong', level: 3 });
    this.errorText = page.getByText('We encountered an error. Please try again.');
    this.retryButton = page.getByRole('button', { name: 'Retry' });

    this.dialog = page.getByRole('dialog');
    this.dialogHeading = this.dialog.getByRole('heading', { level: 2 });
    this.dialogImage = this.dialog.locator('img');
    this.dialogIframe = this.dialog.locator('iframe');
    this.dialogOpenInNewTabLink = this.dialog.getByRole('link', { name: 'Open in new tab' });
    this.dialogCloseButton = this.dialog.getByRole('button').first();
  }

  async goto(id) {
    await this.page.goto(`/tenants/${id}`);
    await this.waitForReady();
  }

  /** Tenant Information / Profile `<dt>/<dd>` value for a given field label. */
  infoValue(label) {
    return this.page
      .locator('dt')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::dd[1]');
  }

  documentButton(filename) {
    return this.page.getByRole('button', { name: filename });
  }

  /**
   * Returns the content area for a document sub-section ("Identity
   * Document" / "Renters Insurance") — either its buttons, or "—" when
   * empty. Scoped from the `<p>` label since these sub-headings, unlike the
   * section labels above, use a plain paragraph.
   */
  documentSubsection(label) {
    return this.page
      .locator('p')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::*[1]');
  }

  petCard(name) {
    return this.page.locator('p').filter({ hasText: new RegExp(`^${name}$`) }).locator('xpath=..');
  }
}

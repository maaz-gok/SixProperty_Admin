import { BasePage } from './BasePage.js';

export class PropertyDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.backButton = page.getByRole('button', { name: 'Back' });
    // The property's name is the only h3 on this page.
    this.nameHeading = page.getByRole('heading', { level: 3 });
    // Unlike Landlords/Tenants, the subtitle here is the property's actual
    // (dynamic) address, not a static caption like "Landlord Details" — so
    // it can't be matched with a fixed getByText. Confirmed live: the
    // address <p> is the heading's immediate following sibling within the
    // same wrapping <div>. Mirrors the `.locator('xpath=..')`-style
    // precedent used throughout this project (e.g. LoginPage.js).
    this.addressSubtitle = this.nameHeading.locator('xpath=following-sibling::p[1]');

    this.infoSectionHeading = page.getByText('Property Information', { exact: true });

    this.tenantsTableHeading = page.getByRole('heading', { name: 'Tenants', level: 4 });
    this.tenantsTable = this.tenantsTableHeading.locator('xpath=..').getByRole('table');
    this.tenantsRows = this.tenantsTable.locator('tbody').getByRole('row');
    this.noTenantsHeading = page.getByRole('heading', { name: 'No tenants found', level: 3 });

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });
    this.errorHeading = page.getByRole('heading', { name: 'Something went wrong', level: 3 });
    this.errorText = page.getByText('We encountered an error. Please try again.');
    this.retryButton = page.getByRole('button', { name: 'Retry' });
  }

  async goto(id) {
    await this.page.goto(`/properties/${id}`);
    await this.waitForReady();
  }

  /**
   * Summary card label ("Tenants"/"Open Requests"). Scoped to a `<p>` tag
   * because "Tenants" also appears as a sidebar link name and as this page's
   * own sub-table `<h4>` heading. Mirrors LandlordDetailsPage.js's
   * `summaryCard()`.
   */
  summaryCard(label) {
    return this.page.locator('p').filter({ hasText: new RegExp(`^${label}$`) }).locator('xpath=..');
  }

  summaryCardCount(label) {
    return this.summaryCard(label).locator('p').nth(1);
  }

  /** Property Information `<dt>/<dd>` value for a given field label. */
  infoValue(label) {
    return this.page
      .locator('dt')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::dd[1]');
  }

  tenantRow(nameOrEmail) {
    return this.tenantsRows.filter({ hasText: nameOrEmail });
  }
}

import { BasePage } from './BasePage.js';

export class LandlordDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.backButton = page.getByRole('button', { name: 'Back' });
    // The landlord's name is the only page heading; level 3 disambiguates it
    // from the h4 sub-table headings ("Properties"/"Tenants") and the h3
    // empty/error/loading headings, which only render one at a time anyway.
    this.nameHeading = page.getByRole('heading', { level: 3 });
    this.subtitle = page.getByText('Landlord Details', { exact: true });

    this.infoSectionHeading = page.getByText('Landlord Information', { exact: true });
    // Status badge is a sibling of the section heading text within the same
    // flex row. Confirmed live: `<div>Landlord Information</div><span>Active</span>`.
    this.statusBadge = this.infoSectionHeading.locator('xpath=..').getByText(/^(Active|Suspended)$/);

    this.propertiesTableHeading = page.getByRole('heading', { name: 'Properties', level: 4 });
    this.tenantsTableHeading = page.getByRole('heading', { name: 'Tenants', level: 4 });
    this.propertiesTable = this.propertiesTableHeading.locator('xpath=..').getByRole('table');
    this.tenantsTable = this.tenantsTableHeading.locator('xpath=..').getByRole('table');
    this.propertiesRows = this.propertiesTable.locator('tbody').getByRole('row');
    this.tenantsRows = this.tenantsTable.locator('tbody').getByRole('row');
    this.noPropertiesHeading = page.getByRole('heading', { name: 'No properties found', level: 3 });
    this.noTenantsHeading = page.getByRole('heading', { name: 'No tenants found', level: 3 });

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });
    this.errorHeading = page.getByRole('heading', { name: 'Something went wrong', level: 3 });
    this.errorText = page.getByText('We encountered an error. Please try again.');
    this.retryButton = page.getByRole('button', { name: 'Retry' });
  }

  async goto(id) {
    await this.page.goto(`/landlords/${id}`);
    await this.waitForReady();
  }

  /**
   * Summary card label ("Properties"/"Tenants"). Scoped to a `<p>` tag
   * because the same word also appears as a sidebar link name and as this
   * page's sub-table `<h4>` heading. Confirmed live: label and count share
   * an immediate parent `<div>`.
   */
  summaryCard(label) {
    return this.page.locator('p').filter({ hasText: new RegExp(`^${label}$`) }).locator('xpath=..');
  }

  summaryCardCount(label) {
    return this.summaryCard(label).locator('p').nth(1);
  }

  /** Landlord Information `<dt>/<dd>` value for a given field label. */
  infoValue(label) {
    return this.page
      .locator('dt')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::dd[1]');
  }

  propertyRow(nameOrAddress) {
    return this.propertiesRows.filter({ hasText: nameOrAddress });
  }

  tenantRow(nameOrEmail) {
    return this.tenantsRows.filter({ hasText: nameOrEmail });
  }
}

import { BasePage } from './BasePage.js';
import { PropertyDetailsPage } from './PropertyDetailsPage.js';

export class PropertiesPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Manage Properties', level: 3 });
    this.description = page.getByText('Review and manage listed properties.');

    this.propertiesNavLink = page.getByRole('link', { name: 'Properties' });
    // Mirrors LandlordsPage.js/TenantsPage.js's sidebar bottom-section / header locators.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    this.searchInput = page.getByRole('searchbox', { name: 'Search by name or address' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody').getByRole('row');
    // No accessible-role way to get "the first cell of every row" as one
    // list; :first-child is scoped per <tr> by the browser. Mirrors
    // LandlordsPage.js's `nameCells`.
    this.nameCells = this.rows.locator('td:first-child');

    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.pageIndicator = page.getByText(/^Page \d+ of \d+$/);
    this.showingText = page.getByText(/^Showing \d+–\d+ of \d+$/);

    this.noDataHeading = page.getByRole('heading', { name: 'No data found' });
    this.noDataText = page.getByText('There is no data to display at the moment.');

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });

    // Sonner toast landmark: <section aria-label="Notifications alt+T">.
    this.toastRegion = page.getByRole('region', { name: 'Notifications alt+T' });
  }

  async goto() {
    await this.page.goto('/properties');
    await this.waitForReady();
  }

  /** Returns the row whose cells contain the given text (property name or address). */
  row(nameOrAddress) {
    return this.rows.filter({ hasText: nameOrAddress });
  }

  /** Returns all rows matching (use when duplicate property names exist, e.g. "The Marlowe"). */
  rowsMatching(nameOrAddress) {
    return this.rows.filter({ hasText: nameOrAddress });
  }

  propertyCell(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('cell').nth(0);
  }

  addressCell(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('cell').nth(1);
  }

  landlordCell(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('cell').nth(2);
  }

  unitCell(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('cell').nth(3);
  }

  tenantsCell(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('cell').nth(4);
  }

  viewButton(nameOrAddress) {
    return this.row(nameOrAddress).getByRole('button', { name: 'View' });
  }

  columnHeader(name) {
    return this.table.getByRole('columnheader', { name, exact: true });
  }

  toast(text) {
    return this.toastRegion.getByText(text);
  }

  async viewProperty(nameOrAddress) {
    await this.viewButton(nameOrAddress).click();
    return new PropertyDetailsPage(this.page);
  }
}

import { BasePage } from './BasePage.js';
import { TenantDetailsPage } from './TenantDetailsPage.js';

export class TenantsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Manage Tenants', level: 3 });
    this.description = page.getByText('View and manage tenant accounts.');

    this.tenantsNavLink = page.getByRole('link', { name: 'Tenants' });
    // Mirrors LandlordsPage.js's sidebar bottom-section / header locators.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    this.searchInput = page.getByRole('searchbox', { name: 'Search by name or email' });
    this.statusSelect = page.getByRole('combobox');
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

    // Sonner toast landmark: <section aria-label="Notifications alt+T">.
    this.toastRegion = page.getByRole('region', { name: 'Notifications alt+T' });
  }

  async goto() {
    await this.page.goto('/tenants');
    await this.waitForReady();
  }

  /** Returns the row whose cells contain the given text (name or email). */
  row(nameOrEmail) {
    return this.rows.filter({ hasText: nameOrEmail });
  }

  /** Returns all rows matching (use when duplicate emails/names exist). */
  rowsMatching(nameOrEmail) {
    return this.rows.filter({ hasText: nameOrEmail });
  }

  nameCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(0);
  }

  emailCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(1);
  }

  landlordCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(2);
  }

  propertyCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(3);
  }

  unitCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(4);
  }

  rentCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(5);
  }

  statusCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(6);
  }

  viewButton(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('button', { name: 'View' });
  }

  // exact: true avoids "Suspend" matching inside "Unsuspend"'s accessible
  // name (substring matching is case-insensitive by default and
  // "Unsuspend" contains "suspend"). Confirmed live, same as Landlords.
  suspendButton(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('button', { name: 'Suspend', exact: true });
  }

  unsuspendButton(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('button', { name: 'Unsuspend', exact: true });
  }

  columnHeader(name) {
    return this.table.getByRole('columnheader', { name, exact: true });
  }

  toast(text) {
    return this.toastRegion.getByText(text);
  }

  async viewTenant(nameOrEmail) {
    await this.viewButton(nameOrEmail).click();
    return new TenantDetailsPage(this.page);
  }
}

import { BasePage } from './BasePage.js';
import { MaintenanceRequestDetailsPage } from './MaintenanceRequestDetailsPage.js';

export class MaintenanceRequestsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Maintenance Requests', level: 3 });
    this.description = page.getByText('Track and review maintenance requests.');

    this.maintenanceRequestsNavLink = page.getByRole('link', { name: 'Maintenance Requests' });
    // Mirrors PropertiesPage.js's sidebar bottom-section / header locators.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    this.searchInput = page.getByRole('searchbox', { name: 'Search by title or tenant' });
    this.statusSelect = page.getByRole('combobox');
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody').getByRole('row');
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
    await this.page.goto('/maintenance-requests');
    await this.waitForReady();
  }

  /** Returns the row whose cells contain the given text (request title or tenant name). */
  row(titleOrTenant) {
    return this.rows.filter({ hasText: titleOrTenant });
  }

  /** Returns all rows matching (use when duplicate titles exist, e.g. "Test"). */
  rowsMatching(titleOrTenant) {
    return this.rows.filter({ hasText: titleOrTenant });
  }

  requestCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(0);
  }

  propertyCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(1);
  }

  tenantCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(2);
  }

  categoryCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(3);
  }

  priorityCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(4);
  }

  statusCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(5);
  }

  createdCell(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('cell').nth(6);
  }

  viewButton(titleOrTenant) {
    return this.row(titleOrTenant).getByRole('button', { name: 'View' });
  }

  columnHeader(name) {
    return this.table.getByRole('columnheader', { name, exact: true });
  }

  toast(text) {
    return this.toastRegion.getByText(text);
  }

  async selectStatus(label) {
    await this.statusSelect.selectOption({ label });
  }

  async viewRequest(titleOrTenant) {
    await this.viewButton(titleOrTenant).click();
    return new MaintenanceRequestDetailsPage(this.page);
  }
}

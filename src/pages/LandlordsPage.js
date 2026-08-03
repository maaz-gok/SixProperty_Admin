import { BasePage } from './BasePage.js';
import { LandlordDetailsPage } from './LandlordDetailsPage.js';

export class LandlordsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Manage Landlords', level: 3 });
    this.description = page.getByText('View, approve, and manage landlord accounts.');

    this.landlordsNavLink = page.getByRole('link', { name: 'Landlords' });
    // Mirrors DashboardPage.js's sidebar bottom-section / header locators.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    this.searchInput = page.getByRole('searchbox', { name: 'Search by name or email' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody').getByRole('row');
    // No accessible-role way to get "the first cell of every row" as one
    // list; :first-child is scoped per <tr> by the browser, so this still
    // respects table semantics rather than reaching for an arbitrary index.
    this.nameCells = this.rows.locator('td:first-child');

    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.pageIndicator = page.getByText(/^Page \d+ of \d+$/);
    this.showingText = page.getByText(/^Showing \d+–\d+ of \d+$/);

    this.noDataHeading = page.getByRole('heading', { name: 'No data found' });
    this.noDataText = page.getByText('There is no data to display at the moment.');

    // Sonner toast landmark: <section aria-label="Notifications alt+T">. Confirmed live.
    this.toastRegion = page.getByRole('region', { name: 'Notifications alt+T' });
  }

  async goto() {
    await this.page.goto('/landlords');
    await this.waitForReady();
  }

  /** Returns the row whose Name or Email cell contains the given text. */
  row(nameOrEmail) {
    return this.rows.filter({ hasText: nameOrEmail });
  }

  nameCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(0);
  }

  emailCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(1);
  }

  propertiesCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(2);
  }

  tenantsCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(3);
  }

  statusCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(4);
  }

  joinedCell(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('cell').nth(5);
  }

  viewButton(nameOrEmail) {
    return this.row(nameOrEmail).getByRole('button', { name: 'View' });
  }

  // exact: true avoids "Suspend" matching inside the "Unsuspend" button's
  // accessible name (substring matching is case-insensitive by default and
  // "Unsuspend" contains "suspend"). Confirmed live.
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

  async viewLandlord(nameOrEmail) {
    await this.viewButton(nameOrEmail).click();
    return new LandlordDetailsPage(this.page);
  }
}

import { BasePage } from './BasePage.js';

export class PlatformActivityPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Platform Activity', level: 3 });
    this.description = page.getByText('Monitor recent platform-wide activity.');

    this.platformActivityNavLink = page.getByRole('link', { name: 'Platform Activity' });
    // Mirrors every other list page's sidebar bottom-section / header locators.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    // Unlike every other list page in this app, there is no search box, no
    // filter dropdown, no Reset button, and no Actions column here —
    // confirmed live. This is a plain read-only feed.
    this.table = page.getByRole('table');
    this.rows = this.table.locator('tbody').getByRole('row');

    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.pageIndicator = page.getByText(/^Page \d+ of \d+$/);
    this.showingText = page.getByText(/^Showing \d+–\d+ of \d+$/);

    this.loadingHeading = page.getByRole('heading', { name: 'Loading', level: 3 });
    this.noDataHeading = page.getByRole('heading', { name: 'No data found' });
    this.noDataText = page.getByText('There is no data to display at the moment.');
  }

  async goto() {
    await this.page.goto('/activity');
    await this.waitForReady();
  }

  /**
   * Activity rows have no id anywhere in the API response (confirmed live —
   * unlike every other module's list items). Matching by message text is
   * the only reliable way to find a specific row.
   */
  row(messageSubstring) {
    return this.rows.filter({ hasText: messageSubstring });
  }

  typeCell(messageSubstring) {
    return this.row(messageSubstring).getByRole('cell').nth(0);
  }

  titleCell(messageSubstring) {
    return this.row(messageSubstring).getByRole('cell').nth(1);
  }

  timeCell(messageSubstring) {
    return this.row(messageSubstring).getByRole('cell').nth(2);
  }

  messageCell(messageSubstring) {
    return this.row(messageSubstring).getByRole('cell').nth(3);
  }

  columnHeader(name) {
    return this.table.getByRole('columnheader', { name, exact: true });
  }
}

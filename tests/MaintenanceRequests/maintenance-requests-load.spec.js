import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Maintenance Requests - Initial Load', () => {
  test('loads cleanly after login with no console errors or failed requests @smoke', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const failedRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((res) => res.url().includes('/admin/requests?page=1&limit=20'));
    await dashboard.maintenanceRequestsLink.click();
    const res = await listResponse;

    const requestsPage = new MaintenanceRequestsPage(page);
    await expect(page).toHaveURL(/\/maintenance-requests$/);
    expect(res.status()).toBe(200);

    await expect(requestsPage.heading).toBeVisible();
    await expect(requestsPage.description).toBeVisible();
    await expect(requestsPage.searchInput).toBeVisible();
    await expect(requestsPage.statusSelect).toBeVisible();
    await expect(requestsPage.table).toBeVisible();
    for (const col of ['Request', 'Property', 'Tenant', 'Category', 'Priority', 'Status', 'Created', 'Actions']) {
      await expect(requestsPage.columnHeader(col)).toBeVisible();
    }
    await expect(requestsPage.previousButton).toBeVisible();
    await expect(requestsPage.nextButton).toBeVisible();

    await expect(requestsPage.maintenanceRequestsNavLink).toHaveAttribute('data-active', 'true');

    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('status dropdown shows all 4 options in order @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const options = await requestsPage.statusSelect.locator('option').allTextContents();
    expect(options).toEqual(['Status', 'Open', 'In Progress', 'Resolved']);
  });

  test('every row renders 8 cells with correctly formatted data @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const title = 'Keys issue';
    const actionButtons = requestsPage.row(title).getByRole('button');
    await expect(actionButtons).toHaveCount(1);
    await expect(actionButtons.first()).toHaveAccessibleName('View');
    await expect(requestsPage.statusCell(title)).toHaveText('Resolved');
    await expect(requestsPage.priorityCell(title)).toHaveText('Urgent');
    await expect(requestsPage.createdCell(title)).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  test('direct navigation and reload consistency @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(page).toHaveURL(/\/maintenance-requests$/);
    await expect(requestsPage.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/maintenance-requests$/);
    await expect(requestsPage.heading).toBeVisible();
    await expect(requestsPage.rows.first()).toBeVisible();
    await expect(requestsPage.showingText).toBeVisible();
  });

  test('column headers are static text and clicking them does not reorder rows @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const titlesBefore = await requestsPage.nameCells.allTextContents();

    for (const col of ['Request', 'Property', 'Tenant', 'Category', 'Priority', 'Status', 'Created']) {
      const header = requestsPage.columnHeader(col);
      await expect(header).not.toHaveAttribute('aria-sort', /.+/);
      await header.click();
    }

    const titlesAfter = await requestsPage.nameCells.allTextContents();
    expect(titlesAfter).toEqual(titlesBefore);
  });
});

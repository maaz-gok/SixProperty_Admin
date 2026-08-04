import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function openRequests(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const requestsPage = new MaintenanceRequestsPage(page);
  await requestsPage.goto();
  await expect(requestsPage.rows.first()).toBeVisible();
  return requestsPage;
}

test.describe('Maintenance Requests - Navigation', () => {
  test('in-app Back button returns to the listing @smoke', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { title } = requests.resolvedNoAttachments;

    const details = await requestsPage.viewRequest(title);
    await details.backButton.click();

    await expect(page).toHaveURL(/\/maintenance-requests$/);
    await expect(requestsPage.rows.first()).toBeVisible();
  });

  test('browser Back and Forward round-trip correctly @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const requestsPage = await openRequests(page);
    const { title } = requests.resolvedNoAttachments;
    const details = await requestsPage.viewRequest(title);
    await expect(details.titleHeading).toHaveText(title);

    await page.goBack();
    await expect(page).toHaveURL(/\/maintenance-requests$/);
    await expect(requestsPage.rows.first()).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/maintenance-requests\/.+/);
    await expect(details.titleHeading).toHaveText(title);

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('refresh on the details page re-renders identical data with exactly one request @regression', async ({ page }) => {
    const { id, title } = requests.resolvedNoAttachments;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    await expect(details.titleHeading).toHaveText(title);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${id}`)) requestUrls.push(req.url());
    });
    await page.reload();

    await expect(page).toHaveURL(new RegExp(`/maintenance-requests/${id}$`));
    await expect(details.titleHeading).toHaveText(title);
    expect(requestUrls).toHaveLength(1);
  });

  test('direct deep link to a valid request id renders correctly @smoke', async ({ page }) => {
    const { id, title, property } = requests.resolvedNoAttachments;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${id}`)) requestUrls.push(req.url());
    });

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.titleHeading).toHaveText(title);
    await expect(details.propertySubtitle).toHaveText(property);
    expect(requestUrls).toHaveLength(1);
  });

  test('refresh on the listing page returns to the unfiltered page-1 view @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await page.reload();
    await expect(page).toHaveURL(/\/maintenance-requests$/);
    await expect(requestsPage.rows.first()).toBeVisible();
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('no console errors across a full navigation flow @regression @critical', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const requestsPage = await openRequests(page);
    const { title } = requests.resolvedNoAttachments;

    const res = page.waitForResponse((r) => r.url().includes('search='));
    await requestsPage.searchInput.fill(title);
    await res;
    await expect(requestsPage.row(title)).toHaveCount(1);

    await requestsPage.resetButton.click();
    await expect(requestsPage.rows.first()).toBeVisible();

    const details = await requestsPage.viewRequest(title);
    await expect(details.titleHeading).toHaveText(title);
    await details.backButton.click();
    await expect(page).toHaveURL(/\/maintenance-requests$/);

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
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

test.describe('Maintenance Requests - Search', () => {
  test('search by exact request title matches correctly @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { title } = requests.resolvedNoAttachments;

    const res = page.waitForResponse((r) => r.url().includes('/admin/requests') && r.url().includes('search='));
    await requestsPage.searchInput.fill(title);
    await res;

    await expect(requestsPage.row(title)).toHaveCount(1);
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–1 of 1$/);
    await expect(requestsPage.pageIndicator).toHaveText('Page 1 of 1');
  });

  test('partial title search matches multiple requests @smoke', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { titleSearchTerm, titleSearchExpectedCount } = requests;

    const res = page.waitForResponse((r) => r.url().includes(`search=${titleSearchTerm}`));
    await requestsPage.searchInput.fill(titleSearchTerm);
    await res;

    await expect(requestsPage.rows).toHaveCount(titleSearchExpectedCount);
    const titles = await requestsPage.nameCells.allTextContents();
    for (const t of titles) expect(t).toContain('Key');
  });

  test('search by tenant name matches every request for that tenant, even with no title overlap @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { tenantSearchOnly, tenantSearchOnlyExpectedCount } = requests;

    const res = page.waitForResponse((r) => r.url().includes(`search=${tenantSearchOnly}`));
    await requestsPage.searchInput.fill(tenantSearchOnly);
    await res;

    await expect(requestsPage.rows).toHaveCount(tenantSearchOnlyExpectedCount);
    const tenants = await requestsPage.rows.evaluateAll((rows) =>
      rows.map((r) => r.querySelectorAll('td')[2]?.textContent)
    );
    for (const t of tenants) expect(t).toContain(tenantSearchOnly);
  });

  // Confirmed live during planning: unlike Properties
  // (Bugs/Properties/properties-search-does-not-trim-whitespace.md), this
  // search correctly trims whitespace and is case-insensitive.
  test('search is case-insensitive and tolerates leading/trailing whitespace @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { titleSearchTerm, titleSearchExpectedCount } = requests;
    const noisyTerm = `  ${titleSearchTerm.toUpperCase()}  `;

    const res = page.waitForResponse((r) => r.url().includes('/admin/requests') && r.url().includes('search='));
    await requestsPage.searchInput.fill(noisyTerm);
    await res;

    await expect(requestsPage.rows).toHaveCount(titleSearchExpectedCount);
  });

  test('script-like search input is treated as inert text, not executed @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const payload = '<script>alert(1)</script>';
    const res = page.waitForResponse((r) => r.url().includes('/admin/requests') && r.url().includes('search='));
    await requestsPage.searchInput.fill(payload);
    await res;

    await expect(requestsPage.searchInput).toHaveValue(payload);
    await expect(requestsPage.noDataHeading).toBeVisible();
    expect(dialogFired, 'A script-like search value must never trigger a JS dialog').toBe(false);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('a non-matching search shows the "No data found" empty state @regression @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
    await requestsPage.searchInput.fill('zzzznotfound');
    await res;

    await expect(requestsPage.noDataHeading).toBeVisible();
    await expect(requestsPage.noDataText).toBeVisible();
    await expect(requestsPage.showingText).not.toBeVisible();
  });

  test('Reset clears the search and restores the unfiltered page-1 list @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { titleSearchTerm } = requests;

    const res = page.waitForResponse((r) => r.url().includes(`search=${titleSearchTerm}`));
    await requestsPage.searchInput.fill(titleSearchTerm);
    await res;
    await expect(requestsPage.resetButton).toBeVisible();

    await requestsPage.resetButton.click();

    await expect(requestsPage.searchInput).toHaveValue('');
    await expect(requestsPage.resetButton).not.toBeVisible();
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('searching from page 2 resets pagination back to page 1 @regression @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await requestsPage.nextButton.click();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    const { titleSearchTerm } = requests;
    const res = page.waitForResponse((r) => r.url().includes('/admin/requests?page=1&limit=20') && r.url().includes(`search=${titleSearchTerm}`));
    await requestsPage.searchInput.fill(titleSearchTerm);
    const searchReq = await res;

    expect(searchReq.url()).toContain('page=1');
    await expect(requestsPage.pageIndicator).toHaveText('Page 1 of 1');
  });

  test('search does not survive a reload @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { titleSearchTerm } = requests;

    const res = page.waitForResponse((r) => r.url().includes(`search=${titleSearchTerm}`));
    await requestsPage.searchInput.fill(titleSearchTerm);
    await res;
    expect(page.url()).not.toContain('search');

    await page.reload();
    await expect(requestsPage.rows.first()).toBeVisible();
    await expect(requestsPage.searchInput).toHaveValue('');
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
    expect(page.url()).not.toContain('search');
  });
});

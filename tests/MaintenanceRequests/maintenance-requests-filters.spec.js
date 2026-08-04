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

async function statusCells(requestsPage) {
  return requestsPage.rows.evaluateAll((rows) => rows.map((r) => r.querySelectorAll('td')[5]?.textContent));
}

// `waitForResponse` resolves once the network response arrives, but React
// still needs to re-render the table afterward — a one-shot DOM read right
// after can race that re-render, especially for a large result set (e.g.
// "Resolved", the biggest subset in this dataset) under CPU contention from
// parallel workers. `expect.poll` retries the read until it settles instead
// of trusting a single snapshot.
async function expectAllStatusesToBe(requestsPage, status) {
  await expect.poll(async () => {
    const statuses = await statusCells(requestsPage);
    return statuses.every((s) => s === status);
  }, { message: `Expected every row's Status cell to read "${status}"` }).toBe(true);
}

test.describe('Maintenance Requests - Status Filter', () => {
  test('"Open" filter returns only Open requests @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('status=OPEN'));
    await requestsPage.selectStatus('Open');
    await res;

    await expectAllStatusesToBe(requestsPage, 'Open');
  });

  test('"In Progress" filter returns only In Progress requests @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('status=IN_PROGRESS'));
    await requestsPage.selectStatus('In Progress');
    await res;

    await expectAllStatusesToBe(requestsPage, 'In Progress');
  });

  test('"Resolved" filter returns only Resolved requests @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('status=RESOLVED'));
    await requestsPage.selectStatus('Resolved');
    await res;

    await expectAllStatusesToBe(requestsPage, 'Resolved');
  });

  test('re-selecting the "Status" placeholder clears the filter @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await requestsPage.selectStatus('Open');
    await expect(requestsPage.resetButton).toBeVisible();

    await requestsPage.selectStatus('Status');
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('search and status filter combine into a single request, not two @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { tenantSearchOnly } = requests;

    const res = page.waitForResponse((r) => r.url().includes(`search=${tenantSearchOnly}`) && r.url().includes('status=RESOLVED'));
    await requestsPage.searchInput.fill(tenantSearchOnly);
    await requestsPage.selectStatus('Resolved');
    const combined = await res;

    expect(combined.url()).toContain(`search=${tenantSearchOnly}`);
    expect(combined.url()).toContain('status=RESOLVED');
    await expectAllStatusesToBe(requestsPage, 'Resolved');
  });

  test('search + filter combination matching nothing shows the empty state @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
    await requestsPage.searchInput.fill('zzzznotfound');
    await requestsPage.selectStatus('Open');
    await res;

    await expect(requestsPage.noDataHeading).toBeVisible();
  });

  test('Reset clears both search and status filter together @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { tenantSearchOnly } = requests;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${tenantSearchOnly}`));
    await requestsPage.searchInput.fill(tenantSearchOnly);
    await searchRes;

    const combinedRes = page.waitForResponse((r) => r.url().includes('status=RESOLVED'));
    await requestsPage.selectStatus('Resolved');
    await combinedRes;
    await expect(requestsPage.resetButton).toBeVisible();

    await requestsPage.resetButton.click();

    await expect(requestsPage.searchInput).toHaveValue('');
    await expect(requestsPage.statusSelect.locator('option:checked')).toHaveText('Status');
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('status filter resets pagination back to page 1 @regression @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await requestsPage.nextButton.click();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    const res = page.waitForResponse((r) => r.url().includes('page=1') && r.url().includes('status=RESOLVED'));
    await requestsPage.selectStatus('Resolved');
    await res;

    await expect(requestsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
  });
});

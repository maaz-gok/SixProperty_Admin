import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

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

test.describe('Maintenance Requests - Pagination', () => {
  test('page 1 shows the correct initial pagination state @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await expect(requestsPage.previousButton).toBeDisabled();
    await expect(requestsPage.nextButton).toBeEnabled();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(requestsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('Next/Previous behave correctly and row data changes each time @smoke @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const page1Titles = await requestsPage.nameCells.allTextContents();

    const beforeIndicator = await requestsPage.pageIndicator.textContent();
    await requestsPage.nextButton.click();
    await expect(requestsPage.pageIndicator).not.toHaveText(beforeIndicator);

    const page2Titles = await requestsPage.nameCells.allTextContents();
    expect(page2Titles).not.toEqual(page1Titles);
    await expect(requestsPage.previousButton).toBeEnabled();

    await requestsPage.previousButton.click();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    const restoredTitles = await requestsPage.nameCells.allTextContents();
    expect(restoredTitles).toEqual(page1Titles);
  });

  test('last page shows a partial row count and disables Next @smoke', async ({ page }) => {
    const requestsPage = await openRequests(page);

    // Wait for the page indicator itself to change before checking button
    // state again — a naked `while (isEnabled())` loop can race a brief
    // loading-overlay state between clicks (same lesson already applied in
    // properties/landlords pagination tests).
    let guard = 0;
    while (await requestsPage.nextButton.isEnabled() && guard < 10) {
      const beforeIndicator = await requestsPage.pageIndicator.textContent();
      await requestsPage.nextButton.click();
      await expect(requestsPage.pageIndicator).not.toHaveText(beforeIndicator);
      guard += 1;
    }

    await expect(requestsPage.nextButton).toBeDisabled();
    await expect(requestsPage.previousButton).toBeEnabled();
    await expect(requestsPage.showingText).toHaveText(/^Showing \d+–\d+ of \d+$/);
  });

  test('reloading mid-pagination resets to page 1 @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    await requestsPage.nextButton.click();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    await page.reload();
    await expect(requestsPage.rows.first()).toBeVisible();
    await expect(requestsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(requestsPage.previousButton).toBeDisabled();
  });

  test('a filtered subset that fits on one page shows fully-disabled pagination @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('status=IN_PROGRESS'));
    await requestsPage.selectStatus('In Progress');
    await res;

    await expect(requestsPage.pageIndicator).toHaveText('Page 1 of 1');
    await expect(requestsPage.previousButton).toBeDisabled();
    await expect(requestsPage.nextButton).toBeDisabled();
  });

  test('"Showing A-B of N" is internally consistent with the rendered row count @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const text = await requestsPage.showingText.textContent();
    const match = text.match(/Showing (\d+)–(\d+) of (\d+)/);
    expect(match).not.toBeNull();
    const [, a, b] = match.map(Number);
    const rowCount = await requestsPage.rows.count();
    expect(b - a + 1).toBe(rowCount);
  });

  test('pagination reflects the API\'s own pagination metadata @regression @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);

    const res = page.waitForResponse((r) => r.url().includes('/admin/requests?page=1&limit=20'));
    await page.reload();
    const response = await res;
    const body = await response.json();
    const { currentPage, totalPages, hasNextPage } = body.data.pagination;

    await expect(requestsPage.pageIndicator).toHaveText(`Page ${currentPage} of ${totalPages}`);
    if (hasNextPage) {
      await expect(requestsPage.nextButton).toBeEnabled();
    } else {
      await expect(requestsPage.nextButton).toBeDisabled();
    }
  });
});

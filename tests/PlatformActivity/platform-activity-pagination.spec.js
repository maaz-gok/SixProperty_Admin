import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

async function openActivity(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const activityPage = new PlatformActivityPage(page);
  await activityPage.goto();
  await expect(activityPage.rows.first()).toBeVisible();
  return activityPage;
}

test.describe('Platform Activity - Pagination', () => {
  test('page 1 shows the correct initial pagination state @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    await expect(activityPage.previousButton).toBeDisabled();
    await expect(activityPage.nextButton).toBeEnabled();
    await expect(activityPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(activityPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('clicking "Next" loads different, correctly-ordered data @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);
    const page1Messages = await activityPage.rows.allTextContents();

    const res = page.waitForResponse((r) => r.url().includes('page=2'));
    await activityPage.nextButton.click();
    await res;

    await expect(activityPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
    await expect(activityPage.showingText).toHaveText(/^Showing 21–40 of \d+$/);
    const page2Messages = await activityPage.rows.allTextContents();
    expect(page2Messages).not.toEqual(page1Messages);
    await expect(activityPage.previousButton).toBeEnabled();
  });

  test('clicking "Previous" returns to the exact prior page\'s data @smoke', async ({ page }) => {
    const activityPage = await openActivity(page);
    const page1Messages = await activityPage.rows.allTextContents();

    const nextRes = page.waitForResponse((r) => r.url().includes('page=2'));
    await activityPage.nextButton.click();
    await nextRes;

    // Confirmed live: returning to page 1 can be served from client-side
    // cache rather than always issuing a fresh network request (same
    // caching behaviour already documented for Properties/Landlords) — so
    // this asserts the resulting UI state rather than requiring a network
    // round-trip.
    await activityPage.previousButton.click();

    await expect(activityPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    const restoredMessages = await activityPage.rows.allTextContents();
    expect(restoredMessages).toEqual(page1Messages);
  });

  test('the last page shows a partial row count and disables "Next" @regression @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    let guard = 0;
    while (await activityPage.nextButton.isEnabled() && guard < 15) {
      const beforeIndicator = await activityPage.pageIndicator.textContent();
      const res = page.waitForResponse((r) => r.url().includes('/admin/activity/feed'));
      await activityPage.nextButton.click();
      await res;
      await expect(activityPage.pageIndicator).not.toHaveText(beforeIndicator);
      guard += 1;
    }

    await expect(activityPage.nextButton).toBeDisabled();
    await expect(activityPage.previousButton).toBeEnabled();
    const rowCount = await activityPage.rows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(20);
  });

  test('reloading mid-pagination resets to page 1 @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    const res = page.waitForResponse((r) => r.url().includes('page=2'));
    await activityPage.nextButton.click();
    await res;
    await expect(activityPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    await page.reload();
    await expect(activityPage.rows.first()).toBeVisible();
    await expect(activityPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(activityPage.previousButton).toBeDisabled();
  });

  test('"Showing A-B of N" is internally consistent with the rendered row count @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    const text = await activityPage.showingText.textContent();
    const match = text.match(/Showing (\d+)–(\d+) of (\d+)/);
    expect(match).not.toBeNull();
    const [, a, b] = match.map(Number);
    const rowCount = await activityPage.rows.count();
    expect(b - a + 1).toBe(rowCount);
  });

  test('pagination reflects the API\'s own pagination metadata, never a hardcoded count @regression @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    const res = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=1&limit=20'));
    await page.reload();
    const response = await res;
    const body = await response.json();
    const { currentPage, totalPages, hasNextPage } = body.data.pagination;

    await expect(activityPage.pageIndicator).toHaveText(`Page ${currentPage} of ${totalPages}`);
    if (hasNextPage) {
      await expect(activityPage.nextButton).toBeEnabled();
    } else {
      await expect(activityPage.nextButton).toBeDisabled();
    }
  });
});

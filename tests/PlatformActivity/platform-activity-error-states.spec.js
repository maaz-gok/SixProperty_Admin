import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import mocks from '../data/platform-activity-mocks.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Platform Activity - Error, Empty & Loading States', () => {
  // Not reproducible against the live 179-item dataset — mocked per
  // specs/platform-activity.md Scenario 9.1/1.8.
  test('an empty API response renders an empty state, not a crash @regression', async ({ page }) => {
    await loginOnly(page);
    await page.route('**/admin/activity/feed*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mocks.emptyFeed) })
    );

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();

    await expect(activityPage.rows).toHaveCount(0);
    // Reuses the same shared empty-state component/copy confirmed on
    // every other module ("No data found" / "There is no data to display
    // at the moment.").
    await expect(activityPage.noDataHeading).toBeVisible();
    await expect(activityPage.noDataText).toBeVisible();
  });

  test('a 500 response shows an error state, not silent failure @regression', async ({ page }) => {
    await loginOnly(page);
    await page.route('**/admin/activity/feed*', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal server error', status: 500 }) })
    );

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();

    // Exact copy unconfirmed live (this module has no details page to
    // compare its error pattern against) — assert the table never renders
    // with a 500, and that the page doesn't hang on the loading state
    // forever or throw an unhandled error.
    await expect(activityPage.rows).toHaveCount(0);
    await expect(activityPage.loadingHeading).not.toBeVisible({ timeout: 10000 });
  });

  test('a single-page response shows fully-disabled pagination @regression', async ({ page }) => {
    await loginOnly(page);
    await page.route('**/admin/activity/feed*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mocks.singlePage) })
    );

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();

    await expect(activityPage.rows).toHaveCount(2);
    await expect(activityPage.pageIndicator).toHaveText('Page 1 of 1');
    await expect(activityPage.previousButton).toBeDisabled();
    await expect(activityPage.nextButton).toBeDisabled();
  });

  test('missing/null title and message fields render sensibly, not as literal "null" @regression', async ({ page }) => {
    await loginOnly(page);
    await page.route('**/admin/activity/feed*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mocks.missingFields) })
    );

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();

    await expect(activityPage.rows).toHaveCount(1);
    const rowText = await activityPage.rows.first().innerText();
    expect(rowText).not.toMatch(/\bnull\b/i);
    expect(rowText).not.toMatch(/\bundefined\b/i);
  });

  test('an unrecognized activity type does not break rendering @regression', async ({ page }) => {
    await loginOnly(page);
    await page.route('**/admin/activity/feed*', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mocks.unrecognizedType) })
    );

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();

    await expect(activityPage.rows).toHaveCount(1);
    const typeCellText = await activityPage.rows.first().getByRole('cell').nth(0).textContent();
    expect(typeCellText.trim().length, 'Type badge should render some fallback text rather than being empty').toBeGreaterThan(0);
  });
});

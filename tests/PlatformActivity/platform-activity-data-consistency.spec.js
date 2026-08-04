import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

const TYPE_LABELS = {
  user_signup: 'Sign Up',
  rent_paid: 'Rent Paid',
  maintenance_request: 'Maintenance',
};

test.describe('Platform Activity - Data Consistency', () => {
  test('the feed matches the List API field-for-field @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const feedResponse = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=1&limit=20'));
    await dashboard.platformActivityLink.click();
    const res = await feedResponse;
    const body = await res.json();
    const items = body.data.items;

    const activityPage = new PlatformActivityPage(page);
    await expect(activityPage.rows.first()).toBeVisible();

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      await test.step(`row ${i}: ${item.message}`, async () => {
        const row = activityPage.rows.nth(i);
        await expect(row.getByRole('cell').nth(0)).toHaveText(TYPE_LABELS[item.type] ?? item.type);
        await expect(row.getByRole('cell').nth(1)).toHaveText(item.title);
        await expect(row.getByRole('cell').nth(3)).toHaveText(item.message);
      });
    }
  });

  test('row count on screen matches the API response\'s item count @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const feedResponse = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=1&limit=20'));
    await dashboard.platformActivityLink.click();
    const res = await feedResponse;
    const body = await res.json();

    const activityPage = new PlatformActivityPage(page);
    await expect(activityPage.rows).toHaveCount(body.data.items.length);
  });

  test('"Showing A-B of N" matches the API\'s pagination.totalItems @regression @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const feedResponse = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=1&limit=20'));
    await dashboard.platformActivityLink.click();
    const res = await feedResponse;
    const body = await res.json();

    const activityPage = new PlatformActivityPage(page);
    await expect(activityPage.showingText).toContainText(`of ${body.data.pagination.totalItems}`);
  });

  test('page 2 data matches the API\'s page-2 response specifically, not a client-side re-slice of page 1 @regression @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    const page2Response = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=2&limit=20'));
    await activityPage.nextButton.click();
    const res = await page2Response;
    const body = await res.json();

    await expect(activityPage.rows).toHaveCount(body.data.items.length);
    const firstItem = body.data.items[0];
    await expect(activityPage.rows.first().getByRole('cell').nth(3)).toHaveText(firstItem.message);
  });
});

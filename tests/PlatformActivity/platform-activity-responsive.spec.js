import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

async function pageOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test.describe('Platform Activity - Responsive Behaviour', () => {
  test('desktop layout (1280px) has no page-level horizontal overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  // Confirmed live: unlike every other module's listing page, this page
  // does NOT reproduce the shared tablet horizontal-scroll bug
  // (Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md) —
  // likely because this table has only 4 columns, the fewest of any
  // listing page in the app. This asserts the clean (passing) behaviour
  // directly, not a known-failing test.
  test('tablet layout (768px) has no page-level horizontal overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, 'This module does not reproduce the shared tablet-width scroll bug seen elsewhere').toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('mobile layout (390px): sidebar collapses, no page-level overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    await expect(activityPage.platformActivityNavLink).not.toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});

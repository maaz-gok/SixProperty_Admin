import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Multi-Tab & Concurrent Session', () => {
  test('signing out in one tab invalidates another open tab on its next action @regression', async ({ context }) => {
    const pageA = await context.newPage();
    const loginA = new LoginPage(pageA);
    await loginA.goto();
    const dashboardA = await loginA.loginAs(adminCredentials);
    await expect(dashboardA.heading).toBeVisible();

    const pageB = await context.newPage();
    await pageB.goto('/dashboard');
    const dashboardB = new DashboardPage(pageB);
    await expect(dashboardB.heading).toBeVisible();

    await dashboardA.signOutButton.click();
    await expect(pageA).toHaveURL(/\/sign-in$/);

    // Auth state (localStorage) is shared instantly within a context; the
    // redirect itself happens client-side after the app re-checks it, which
    // is why this needs a retrying assertion rather than an immediate URL read.
    await pageB.reload();
    await expect(pageB).toHaveURL(/\/sign-in$/);
  });

  // Verified live: this app allows multiple concurrent sessions for the
  // same account — logging in from a second context does not invalidate
  // the first. Asserted here as the current, actual policy.
  test('logging in from a second session does not invalidate the first @regression', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    const login1 = new LoginPage(page1);
    await login1.goto();
    const dashboard1 = await login1.loginAs(adminCredentials);
    await expect(dashboard1.heading).toBeVisible();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const login2 = new LoginPage(page2);
    await login2.goto();
    const dashboard2 = await login2.loginAs(adminCredentials);
    await expect(dashboard2.heading).toBeVisible();

    await page1.reload();
    await expect(dashboard1.heading).toBeVisible();
    await expect(page1).toHaveURL(/\/dashboard$/);

    await context1.close();
    await context2.close();
  });
});

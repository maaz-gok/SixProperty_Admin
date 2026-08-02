import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Initial Load', () => {
  test('loads cleanly after login with no console errors or failed requests @smoke', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const failedRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const wordResponse = page.waitForResponse((res) => res.url().includes('/game/admin/word'));
    const activityResponse = page.waitForResponse((res) => res.url().includes('/admin/activity'));

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);

    const [wordRes, activityRes] = await Promise.all([wordResponse, activityResponse]);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.description).toBeVisible();
    expect(wordRes.status()).toBe(200);
    expect(activityRes.status()).toBe(200);
    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('direct navigation and reload preserve dashboard state @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.summaryCard('Landlords')).toBeVisible();
    await expect(dashboard.activityRows.first()).toBeVisible();
  });

  test('no horizontal overflow at desktop width @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.activityRows.first()).toBeVisible();

    // No locator-based way to assert page-level scroll overflow; this checks
    // document dimensions rather than a specific element's rendered style.
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow, 'Dashboard should not introduce horizontal scrolling at desktop width').toBe(false);
  });

  test('unrecognized query string does not break the dashboard @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await page.goto('/dashboard?foo=bar&utm_source=test');
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.summaryCard('Landlords')).toBeVisible();
    await expect(dashboard.activityRows.first()).toBeVisible();
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });
});

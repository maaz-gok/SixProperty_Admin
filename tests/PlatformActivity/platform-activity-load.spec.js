import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Platform Activity - Initial Load', () => {
  test('loads cleanly after login with no console errors or failed requests @smoke', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const failedRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const feedResponse = page.waitForResponse((res) => res.url().includes('/admin/activity/feed?page=1&limit=20'));
    await dashboard.platformActivityLink.click();
    const res = await feedResponse;

    const activityPage = new PlatformActivityPage(page);
    await expect(page).toHaveURL(/\/activity$/);
    expect(res.status()).toBe(200);

    await expect(activityPage.heading).toBeVisible();
    await expect(activityPage.description).toBeVisible();
    await expect(activityPage.table).toBeVisible();
    for (const col of ['Type', 'Title', 'Time', 'Message']) {
      await expect(activityPage.columnHeader(col)).toBeVisible();
    }
    await expect(activityPage.previousButton).toBeVisible();
    await expect(activityPage.nextButton).toBeVisible();
    await expect(activityPage.platformActivityNavLink).toHaveAttribute('data-active', 'true');

    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  // Confirmed live: unlike every other list page in this app, there is no
  // search box, no filter dropdown, no "Reset" button, and no Actions
  // column here — this is a plain read-only feed. Written as a negative
  // assertion so a future Generator run doesn't assume search/filter
  // exists here by analogy with the other modules.
  test('no search box, filter dropdown, or Actions column exists @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reset' })).toHaveCount(0);
    await expect(activityPage.columnHeader('Actions')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'View' })).toHaveCount(0);
  });

  test('direct navigation and reload consistency @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(page).toHaveURL(/\/activity$/);
    await expect(activityPage.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/activity$/);
    await expect(activityPage.heading).toBeVisible();
    await expect(activityPage.rows.first()).toBeVisible();
    await expect(activityPage.showingText).toBeVisible();
  });

  test('column headers are static text and clicking them does not reorder rows @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    const messagesBefore = await activityPage.rows.allTextContents();

    for (const col of ['Type', 'Title', 'Time', 'Message']) {
      const header = activityPage.columnHeader(col);
      await expect(header).not.toHaveAttribute('aria-sort', /.+/);
      await header.click();
    }

    const messagesAfter = await activityPage.rows.allTextContents();
    expect(messagesAfter).toEqual(messagesBefore);
  });

  test('sidebar navigation to another module and back still works correctly @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    await page.getByRole('link', { name: 'Maintenance Requests' }).click();
    await expect(page).toHaveURL(/\/maintenance-requests$/);

    await activityPage.platformActivityNavLink.click();
    await expect(page).toHaveURL(/\/activity$/);
    await expect(activityPage.heading).toBeVisible();
    await expect(activityPage.platformActivityNavLink).toHaveAttribute('data-active', 'true');
  });

  // Confirmed live: navigating directly to /activity?page=5 is silently
  // ignored — the page still loads on page 1. There is no URL-driven
  // pagination on this page.
  test('a ?page= query parameter in the URL is silently ignored @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await page.goto('/activity?page=5');
    const activityPage = new PlatformActivityPage(page);
    await expect(activityPage.rows.first()).toBeVisible();

    await expect(activityPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(activityPage.previousButton).toBeDisabled();
  });
});

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

test.describe('Platform Activity - Performance', () => {
  test('exactly one request fires for a normal page load @regression @critical', async ({ page }) => {
    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes('/admin/activity/feed?page=1&limit=20')) requestUrls.push(req.url());
    });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const activityPage = new PlatformActivityPage(page);
    await activityPage.goto();
    await expect(activityPage.rows.first()).toBeVisible();

    expect(requestUrls, `Expected exactly one unfiltered page-1 request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('exactly one request fires per pagination click @regression @critical', async ({ page }) => {
    const activityPage = await openActivity(page);
    const page2Urls = [];
    page.on('request', (req) => {
      if (req.url().includes('/admin/activity/feed') && req.url().includes('page=2')) page2Urls.push(req.url());
    });

    const res = page.waitForResponse((r) => r.url().includes('page=2'));
    await activityPage.nextButton.click();
    await res;

    expect(page2Urls, `Expected exactly one page-2 request, got: ${page2Urls.join(', ')}`).toHaveLength(1);
  });

  test('no console errors across a pagination sweep @regression @critical', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const activityPage = await openActivity(page);

    for (let i = 0; i < 4; i += 1) {
      if (!(await activityPage.nextButton.isEnabled())) break;
      const res = page.waitForResponse((r) => r.url().includes('/admin/activity/feed'));
      await activityPage.nextButton.click();
      await res;
    }

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });

  test('rendered row count exactly matches the API\'s item count, no duplicate DOM rows @regression', async ({ page }) => {
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
});

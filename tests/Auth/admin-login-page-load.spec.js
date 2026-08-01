import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';

test.describe('Admin Login - Page Load', () => {
  test('login page loads with no console or network errors @smoke', async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const login = new LoginPage(page);
    await login.goto();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.loginButton).toBeVisible();
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
  });

  test('baseline form layout renders without breaking @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.heading).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.forgotPasswordLink).toBeVisible();
    await expect(login.loginButton).toBeVisible();

    const viewportWidth = page.viewportSize().width;
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, 'Page should not cause horizontal scrolling').toBeLessThanOrEqual(viewportWidth);
  });

  test('direct navigation and reload keep the login page stable @regression', async ({ page }) => {
    await test.step('direct navigation resolves to sign-in', async () => {
      const login = new LoginPage(page);
      await login.goto();
      await expect(page).toHaveURL(/\/sign-in$/);
    });

    await test.step('reload preserves the login page state', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/sign-in$/);
      const login = new LoginPage(page);
      await expect(login.loginButton).toBeVisible();
    });
  });
});

test.describe('Admin Login - Branding', () => {
  test('login logo matches the reference brand asset (Resources/Correct_Logo.png) @regression', async ({ page }) => {
    // Resources/Correct_Logo.png renders the wordmark "S:PM". The rendered
    // login logo is expected to match; a mismatch is a real UI bug (see
    // specs/admin-login.md 18.1 and Bugs/ for the filed report).
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.logo).toBeVisible();
    await expect(login.logo).toHaveText('S:PM');
  });

  test('logo remains visible and legible across viewport sizes @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    for (const size of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
      await test.step(`viewport ${size.width}x${size.height}`, async () => {
        await page.setViewportSize(size);
        await expect(login.logo).toBeVisible();
        const fontSize = await login.logo.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(fontSize, 'Logo text should not collapse to an unreadable size').toBeGreaterThan(8);
      });
    }
  });
});

test.describe('Admin Login - Performance Observations', () => {
  test('page load timing stays within a generous baseline @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.waitForLoadState('load');

    const timing = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation');
      return { loadTime: nav.loadEventEnd - nav.startTime, domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime };
    });
    console.log('[perf] load event:', timing.loadTime, 'ms | DOMContentLoaded:', timing.domContentLoaded, 'ms');

    // Generous, non-strict regression guard — this scenario is observational
    // per specs/admin-login.md 16.1, not a tight performance budget.
    expect(timing.loadTime).toBeLessThan(8000);
  });
});

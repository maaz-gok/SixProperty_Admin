import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Sign Out', () => {
  test('clears the session and redirects, blocking further protected access @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.signOutButton.click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

test.describe('Dashboard - Sign Out Known Issue Verification', () => {
  // Confirmed real gap: pressing browser Back after Sign Out restores a
  // stale, fully-populated dashboard from the back-forward cache (bfcache)
  // — URL stays on /dashboard and real protected data (e.g. the Landlords
  // count) is visible — even though the session token has genuinely been
  // removed from localStorage (verified directly). The app has no
  // `pageshow`/`persisted` handler to re-check auth on a bfcache restore.
  // Reproduces 4/4 in isolation but passed once under full-suite parallel
  // load (4 workers) — Chromium's bfcache eligibility is itself sensitive to
  // system/memory pressure, which is a property of the browser, not a flaky
  // assertion here. Left failing intentionally rather than weakened, per the
  // project's known-issue convention (see
  // tests/Auth/admin-login-known-issues.spec.js).
  test('browser Back after Sign Out should not restore protected content, but a stale bfcache page is shown instead @critical @flaky-risk', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.signOutButton.click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goBack();
    await expect(dashboard.summaryCard('Landlords'), 'Expected: no protected data visible after Back post-sign-out').not.toBeVisible();
  });
});

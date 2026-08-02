import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Auth Guard', () => {
  test('direct navigation without a session redirects to sign-in and never renders protected data @critical', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(dashboard.heading).not.toBeVisible();
    await expect(dashboard.activityTable).not.toBeVisible();
  });

  // Verified live: this app does NOT special-case a 401 from
  // /admin/activity or /game/admin/word — it renders the same fallback
  // state as any other failure (summary cards show "0", Today's Word is
  // omitted, Recent Activity shows "Something went wrong"/Retry) and stays
  // on /dashboard rather than redirecting to /sign-in. That's a real gap
  // (an expired/invalidated session isn't detected client-side), asserted
  // here as the actual, current behaviour rather than the ideal one.
  test('an expired/invalidated session (401) is not detected — the dashboard shows the same broken-widget fallback instead of redirecting @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    );
    await page.route('**/game/admin/word', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) })
    );
    await page.reload();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(dashboard.summaryCardCount('Landlords')).toHaveText('0');
  });
});

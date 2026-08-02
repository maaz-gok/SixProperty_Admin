import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Bottom User Section', () => {
  test('shows an avatar, admin name, email, and a distinctly styled Sign Out control @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.profileLink).toBeVisible();
    await expect(dashboard.profileLink.locator('svg, [class*="rounded-full"]').first()).toBeVisible();
    await expect(dashboard.profileLink).toContainText('Admin');
    await expect(dashboard.profileLink).toContainText(adminCredentials.email);

    await expect(dashboard.signOutButton).toBeVisible();
    const signOutColor = await dashboard.signOutButton.evaluate((el) => getComputedStyle(el).color);
    const profileColor = await dashboard.profileLink.evaluate((el) => getComputedStyle(el).color);
    expect(signOutColor, 'Sign Out should be visually distinct (destructive color) from the profile link').not.toBe(profileColor);
  });
});

test.describe('Dashboard - Admin Profile Section (Known Bug Verification)', () => {
  // Reproduced and documented in specs/dashboard.md Scenario 9.2: clicking
  // the admin profile link redirects to /sign-in instead of opening a
  // profile page, but the session itself is NOT cleared — a subsequent
  // direct navigation to a protected route succeeds without re-login. Left
  // failing-as-documented rather than asserting the (currently non-existent)
  // correct behaviour, per the project convention for known-issue specs
  // (see tests/Auth/admin-login-known-issues.spec.js).
  test('clicking the profile link redirects to /sign-in without clearing the session @critical @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.profileLink.click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.heading).toBeVisible();
  });

  test('direct navigation to /profile also redirects to /sign-in @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Sidebar Items', () => {
  test('every sidebar item is visible with a label and icon @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const links = [
      dashboard.dashboardLink,
      dashboard.landlordsLink,
      dashboard.tenantsLink,
      dashboard.propertiesLink,
      dashboard.maintenanceRequestsLink,
      dashboard.platformActivityLink,
    ];

    for (const link of links) {
      await expect(link).toBeVisible();
      // Icon presence check only; the primary locator above is role+name.
      await expect(link.locator('svg')).toBeVisible();
    }
  });

  test('each sidebar link navigates to the correct screen @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await test.step('Landlords', async () => {
      await dashboard.landlordsLink.click();
      await expect(page).toHaveURL(/\/landlords$/);
      await dashboard.goto();
    });

    await test.step('Tenants', async () => {
      await dashboard.tenantsLink.click();
      await expect(page).toHaveURL(/\/tenants$/);
      await dashboard.goto();
    });

    await test.step('Properties', async () => {
      await dashboard.propertiesLink.click();
      await expect(page).toHaveURL(/\/properties$/);
      await dashboard.goto();
    });

    await test.step('Maintenance Requests', async () => {
      await dashboard.maintenanceRequestsLink.click();
      await expect(page).toHaveURL(/\/maintenance-requests$/);
      await dashboard.goto();
    });

    await test.step('Platform Activity', async () => {
      await dashboard.platformActivityLink.click();
      await expect(page).toHaveURL(/\/activity$/);
      await dashboard.goto();
    });

    await test.step('Dashboard (self)', async () => {
      await dashboard.dashboardLink.click();
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });

  test('active item is distinguished and every item has a pointer cursor @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    // Sidebar links expose their active state via a `data-active` attribute.
    await expect(dashboard.dashboardLink).toHaveAttribute('data-active', 'true');
    await expect(dashboard.landlordsLink).toHaveAttribute('data-active', 'false');

    const links = [
      dashboard.dashboardLink,
      dashboard.landlordsLink,
      dashboard.tenantsLink,
      dashboard.propertiesLink,
      dashboard.maintenanceRequestsLink,
      dashboard.platformActivityLink,
    ];
    for (const link of links) {
      await expect(link).toHaveCSS('cursor', 'pointer');
    }
  });

  test('sidebar items are reachable in a logical keyboard tab order @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.dashboardLink.focus();
    await expect(dashboard.dashboardLink).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dashboard.landlordsLink).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dashboard.tenantsLink).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dashboard.propertiesLink).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dashboard.maintenanceRequestsLink).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dashboard.platformActivityLink).toBeFocused();
  });

  test('browser Back/Forward replays a sidebar navigation chain correctly @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.landlordsLink.click();
    await expect(page).toHaveURL(/\/landlords$/);
    await dashboard.goto();
    await dashboard.tenantsLink.click();
    await expect(page).toHaveURL(/\/tenants$/);
    await dashboard.goto();
    await dashboard.propertiesLink.click();
    await expect(page).toHaveURL(/\/properties$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/tenants$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/landlords$/);

    await page.goForward();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/tenants$/);
  });
});

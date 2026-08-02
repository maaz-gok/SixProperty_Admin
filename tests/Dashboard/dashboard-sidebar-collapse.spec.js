import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

// The sidebar collapses via a CSS transform (translated off-screen), not
// display:none/visibility:hidden/width:0. That means Playwright's
// toBeVisible()/toBeHidden() report the link as "visible" even when it is
// fully off-screen (confirmed live: collapsed landlordsLink has a bounding
// box at x < 0). toBeInViewport() is the correct assertion here since it
// checks actual on-screen position, not CSS visibility properties.
test.describe('Dashboard - Sidebar Collapse', () => {
  test('collapsing moves the sidebar off-screen and removes it from the tab order @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.sidebarRailToggle.click();
    await expect(dashboard.landlordsLink).not.toBeInViewport();

    await dashboard.headerSidebarToggle.focus();
    await expect(dashboard.headerSidebarToggle).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dashboard.landlordsLink).not.toBeFocused();
    await expect(dashboard.seeAllLink).toBeFocused();
  });

  test('expanding restores the full sidebar with active state preserved @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.sidebarRailToggle.click();
    await expect(dashboard.landlordsLink).not.toBeInViewport();

    await dashboard.headerSidebarToggle.click();
    await expect(dashboard.landlordsLink).toBeInViewport();
    await expect(dashboard.tenantsLink).toBeInViewport();
    await expect(dashboard.propertiesLink).toBeInViewport();
    await expect(dashboard.maintenanceRequestsLink).toBeInViewport();
    await expect(dashboard.platformActivityLink).toBeInViewport();
    await expect(dashboard.profileLink).toBeInViewport();
    await expect(dashboard.signOutButton).toBeInViewport();
    await expect(dashboard.dashboardLink).toHaveAttribute('data-active', 'true');
  });

  test('both Toggle Sidebar controls produce the same end state @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await test.step('collapse via rail, restore via header', async () => {
      await dashboard.sidebarRailToggle.click();
      await expect(dashboard.landlordsLink).not.toBeInViewport();
      await dashboard.headerSidebarToggle.click();
      await expect(dashboard.landlordsLink).toBeInViewport();
    });

    await test.step('collapse via header, restore via rail', async () => {
      await dashboard.headerSidebarToggle.click();
      await expect(dashboard.landlordsLink).not.toBeInViewport();
      await dashboard.sidebarRailToggle.click();
      await expect(dashboard.landlordsLink).toBeInViewport();
    });
  });

  test('sidebar is collapsed by default on mobile, expanded on tablet and desktop @regression', async ({ browser }) => {
    await test.step('mobile (390x844): collapsed by default', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.heading).toBeVisible();
      await expect(dashboard.landlordsLink).not.toBeInViewport();
      await context.close();
    });

    await test.step('tablet (820x1180): expanded by default', async () => {
      const context = await browser.newContext({ viewport: { width: 820, height: 1180 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.heading).toBeVisible();
      await expect(dashboard.landlordsLink).toBeInViewport();
      await context.close();
    });

    await test.step('desktop (1280x800): expanded by default', async () => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.heading).toBeVisible();
      await expect(dashboard.landlordsLink).toBeInViewport();
      await context.close();
    });
  });
});

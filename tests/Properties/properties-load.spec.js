import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Properties - Initial Load', () => {
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

    const listResponse = page.waitForResponse((res) => res.url().includes('/admin/properties?page=1&limit=20'));
    await dashboard.propertiesLink.click();
    const res = await listResponse;

    const propertiesPage = new PropertiesPage(page);
    await expect(page).toHaveURL(/\/properties$/);
    expect(res.status()).toBe(200);

    await expect(propertiesPage.heading).toBeVisible();
    await expect(propertiesPage.description).toBeVisible();
    await expect(propertiesPage.searchInput).toBeVisible();
    await expect(propertiesPage.table).toBeVisible();
    for (const col of ['Property', 'Address', 'Landlord', 'Unit', 'Tenants', 'Actions']) {
      await expect(propertiesPage.columnHeader(col)).toBeVisible();
    }
    await expect(propertiesPage.previousButton).toBeVisible();
    await expect(propertiesPage.nextButton).toBeVisible();

    await expect(propertiesPage.propertiesNavLink).toHaveAttribute('data-active', 'true');
    await expect(propertiesPage.profileLink).toBeVisible();
    await expect(propertiesPage.signOutButton).toBeVisible();
    await expect(propertiesPage.headerAvatarName).toBeVisible();

    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('direct navigation and reload consistency @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.heading).toBeVisible();
    await expect(propertiesPage.rows.first()).toBeVisible();
    await expect(propertiesPage.showingText).toBeVisible();
  });

  test('sidebar navigation to another module and back remains functional @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(propertiesPage.rows.first()).toBeVisible();

    await test.step('navigate to Landlords then back to Properties', async () => {
      await page.getByRole('link', { name: 'Landlords' }).click();
      await expect(page).toHaveURL(/\/landlords$/);

      await propertiesPage.propertiesNavLink.click();
      await expect(page).toHaveURL(/\/properties$/);
      await expect(propertiesPage.heading).toBeVisible();
      await expect(propertiesPage.propertiesNavLink).toHaveAttribute('data-active', 'true');
    });
  });
});

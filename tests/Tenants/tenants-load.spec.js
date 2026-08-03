import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Tenants - Initial Load', () => {
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

    const listResponse = page.waitForResponse((res) => res.url().includes('/admin/tenants?page=1&limit=20'));
    await dashboard.tenantsLink.click();
    const res = await listResponse;

    const tenantsPage = new TenantsPage(page);
    await expect(page).toHaveURL(/\/tenants$/);
    expect(res.status()).toBe(200);

    await expect(tenantsPage.heading).toBeVisible();
    await expect(tenantsPage.description).toBeVisible();
    await expect(tenantsPage.searchInput).toBeVisible();
    await expect(tenantsPage.statusSelect).toBeVisible();
    await expect(tenantsPage.table).toBeVisible();
    for (const col of ['Name', 'Email', 'Landlord', 'Property', 'Unit', 'Rent', 'Status', 'Actions']) {
      await expect(tenantsPage.columnHeader(col)).toBeVisible();
    }
    await expect(tenantsPage.previousButton).toBeVisible();
    await expect(tenantsPage.nextButton).toBeVisible();

    await expect(tenantsPage.tenantsNavLink).toHaveAttribute('data-active', 'true');
    await expect(tenantsPage.profileLink).toBeVisible();
    await expect(tenantsPage.signOutButton).toBeVisible();
    await expect(tenantsPage.headerAvatarName).toBeVisible();

    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('direct navigation and reload consistency @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const tenantsPage = new TenantsPage(page);
    await tenantsPage.goto();
    await expect(page).toHaveURL(/\/tenants$/);
    await expect(tenantsPage.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/tenants$/);
    await expect(tenantsPage.heading).toBeVisible();
    await expect(tenantsPage.rows.first()).toBeVisible();
    await expect(tenantsPage.searchInput).toHaveValue('');
    await expect(tenantsPage.showingText).toBeVisible();
  });
});

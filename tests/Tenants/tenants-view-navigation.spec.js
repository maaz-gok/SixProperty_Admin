import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

async function openTenants(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const tenantsPage = new TenantsPage(page);
  await tenantsPage.goto();
  await expect(tenantsPage.rows.first()).toBeVisible();
  return tenantsPage;
}

test.describe('Tenants - View & Navigation', () => {
  test('View navigates to the correct tenant\'s details page @smoke @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, email, id } = tenants.richProfileTenant;

    const details = await tenantsPage.viewTenant(email);

    await expect(page).toHaveURL(new RegExp(`/tenants/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
    await expect(details.subtitle).toBeVisible();
  });

  test('the in-app Back button returns to the listing @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, email } = tenants.richProfileTenant;
    const details = await tenantsPage.viewTenant(email);
    await expect(details.nameHeading).toHaveText(name);

    await details.backButton.click();
    await expect(page).toHaveURL(/\/tenants$/);
  });

  test('browser Back/Forward moves correctly between listing and details @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const tenantsPage = await openTenants(page);
    const { name, email } = tenants.richProfileTenant;
    const details = await tenantsPage.viewTenant(email);
    await expect(details.nameHeading).toHaveText(name);

    await page.goBack();
    await expect(page).toHaveURL(/\/tenants$/);

    await page.goForward();
    await expect(details.nameHeading).toHaveText(name);
    await expect(details.subtitle).toBeVisible();

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('direct URL access to a valid tenant fires exactly one request and renders correctly @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { name, id } = tenants.richProfileTenant;
    const requests = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/tenants/${id}`)) requests.push(req.url());
    });

    const details = new TenantDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);

    expect(requests, `Expected exactly one request for a valid id, got: ${requests.join(', ')}`).toHaveLength(1);
  });

  test('reloading the details page re-renders the same tenant @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { name, id } = tenants.richProfileTenant;
    const details = new TenantDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/tenants/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
  });
});

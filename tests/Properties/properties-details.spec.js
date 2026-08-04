import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

async function openProperties(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const propertiesPage = new PropertiesPage(page);
  await propertiesPage.goto();
  await expect(propertiesPage.rows.first()).toBeVisible();
  return propertiesPage;
}

test.describe('Properties - Details Page', () => {
  test('View navigates to the correct property\'s details page @smoke @critical', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name, id } = properties.populatedProperty;

    const details = await propertiesPage.viewProperty(name);

    await expect(page).toHaveURL(new RegExp(`/properties/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
  });

  test('header renders name, address, and Back button @smoke', async ({ page }) => {
    const { id, name, address } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.nameHeading).toHaveText(name);
    await expect(details.addressSubtitle).toHaveText(address);
    await expect(details.backButton).toBeVisible();
  });

  test('summary cards show correct Tenants and Open Requests counts @smoke @critical', async ({ page }) => {
    const { id, tenantsCount, openRequests } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.summaryCardCount('Tenants')).toHaveText(String(tenantsCount));
    await expect(details.summaryCardCount('Open Requests')).toHaveText(String(openRequests));
  });

  test('Property Information section renders all 6 fields correctly @smoke @critical', async ({ page }) => {
    const { id, landlord, landlordEmail, address, unit } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.infoValue('Landlord')).toHaveText(landlord);
    await expect(details.infoValue('Landlord Email')).toHaveText(landlordEmail);
    await expect(details.infoValue('Address')).toHaveText(address);
    await expect(details.infoValue('Unit')).toHaveText(unit);
    await expect(details.infoValue('Created')).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    // "Details" is a free-text field — just confirm it renders non-empty for
    // a populated property rather than asserting a specific format.
    await expect(details.infoValue('Details')).not.toHaveText('');
  });

  test('Tenants sub-table renders correctly for a single-tenant property @smoke @critical', async ({ page }) => {
    const { id, tenant } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    for (const col of ['Name', 'Email', 'Phone', 'Unit', 'Rent', 'Status']) {
      await expect(details.tenantsTable.getByRole('columnheader', { name: col, exact: true })).toBeVisible();
    }

    const row = details.tenantRow(tenant.email);
    await expect(row).toContainText(tenant.name);
    await expect(row).toContainText(tenant.email);
    await expect(row).toContainText(tenant.phone);
    await expect(row).toContainText(tenant.unit);
    await expect(row).toContainText(tenant.rent);
    await expect(row).toContainText(tenant.status);
  });

  test('Tenants sub-table renders correctly for a multi-tenant property @regression', async ({ page }) => {
    const { id, tenantsCount } = properties.multiTenantProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.tenantsRows).toHaveCount(tenantsCount);
    await expect(details.summaryCardCount('Tenants')).toHaveText(String(tenantsCount));
  });

  test('empty Tenants sub-table for a zero-tenant property @regression', async ({ page }) => {
    const { id, tenantsCount } = properties.zeroTenantProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.summaryCardCount('Tenants')).toHaveText(String(tenantsCount));
    await expect(details.noTenantsHeading).toBeVisible();
  });

  // A missing "Details" free-text field renders "—", confirmed live via
  // properties.multiTenantProperty ("The Marlowe"), consistent with the "—"
  // convention used elsewhere in this app for missing values.
  test('a missing Details field renders as an em dash, not blank @regression', async ({ page }) => {
    const { id, detailsFieldWhenMissing } = properties.multiTenantProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.infoValue('Details')).toHaveText(detailsFieldWhenMissing);
  });

  test('exactly one details request fires for a valid id @regression', async ({ page }) => {
    const { id } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/properties/${id}`)) requestUrls.push(req.url());
    });

    const details = new PropertyDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toBeVisible();

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });
});

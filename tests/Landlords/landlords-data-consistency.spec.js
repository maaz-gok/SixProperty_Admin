import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import { LandlordDetailsPage } from '../../src/pages/LandlordDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

function titleCase(value) {
  return value.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

test.describe('Landlords - Data Consistency', () => {
  test('listing table matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((r) => r.url().includes('/admin/landlords?page=1&limit=20'));
    await dashboard.landlordsLink.click();
    const res = await listResponse;
    const body = await res.json();

    const landlordsPage = new LandlordsPage(page);
    await expect(landlordsPage.rows.first()).toBeVisible();

    for (const item of body.data.items) {
      const uiName = titleCase(item.name);
      await test.step(`row for ${uiName}`, async () => {
        await expect(landlordsPage.nameCell(uiName)).toHaveText(uiName);
        await expect(landlordsPage.emailCell(uiName)).toHaveText(item.email);
        await expect(landlordsPage.propertiesCell(uiName)).toHaveText(String(item.propertiesCount));
        await expect(landlordsPage.tenantsCell(uiName)).toHaveText(String(item.tenantsCount));
        await expect(landlordsPage.statusCell(uiName)).toHaveText(titleCase(item.status.toLowerCase()));
        await expect(landlordsPage.joinedCell(uiName)).toHaveText(formatDate(item.createdAt));
      });
    }
  });

  test('details page matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = landlords.populatedLandlord;
    const detailResponse = page.waitForResponse((r) => r.url().includes(`/admin/landlords/${id}`));
    const details = new LandlordDetailsPage(page);
    await details.goto(id);
    const res = await detailResponse;
    const body = await res.json();
    const { landlord, propertiesCount, tenantsCount, properties } = body.data;

    await expect(details.nameHeading).toHaveText(titleCase(landlord.name));
    await expect(details.summaryCardCount('Properties')).toHaveText(String(propertiesCount));
    await expect(details.summaryCardCount('Tenants')).toHaveText(String(tenantsCount));

    await expect(details.infoValue('Email')).toHaveText(landlord.email);
    await expect(details.infoValue('Address')).toHaveText(landlord.address);
    await expect(details.infoValue('Date of Birth')).toHaveText(landlord.dateOfBirth);
    await expect(details.infoValue('Joined')).toHaveText(formatDate(landlord.createdAt));
    await expect(details.infoValue('Role')).toHaveText(landlord.role);
    await expect(details.infoValue('Email Verified')).toHaveText(landlord.emailVerified ? 'Yes' : 'No');
    await expect(details.infoValue('Provider')).toHaveText(landlord.provider);

    const property = properties[0];
    await expect(details.propertyRow(property.name)).toContainText(property.name);
    await expect(details.propertyRow(property.name)).toContainText(property.address);
    await expect(details.propertyRow(property.name)).toContainText(property.unitName);
    await expect(details.propertyRow(property.name)).toContainText(String(property.tenants.length));

    const tenant = property.tenants[0];
    await expect(details.tenantRow(tenant.email)).toContainText(titleCase(tenant.name));
    await expect(details.tenantRow(tenant.email)).toContainText(tenant.email);
    await expect(details.tenantRow(tenant.email)).toContainText(tenant.phone);
    await expect(details.tenantRow(tenant.email)).toContainText(`$${tenant.rentAmount}`);
    await expect(details.tenantRow(tenant.email)).toContainText(titleCase(tenant.status.toLowerCase()));
  });
});

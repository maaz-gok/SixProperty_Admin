import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
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

test.describe('Tenants - Table Validation', () => {
  test('every column renders the expected data for a populated row @smoke', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, email } = tenants.disposableActiveTenant3; // "Maaz Tenant T4", has a user id

    await expect(tenantsPage.nameCell(email)).toHaveText(name);
    await expect(tenantsPage.emailCell(email)).toHaveText(email);
    await expect(tenantsPage.landlordCell(email)).not.toHaveText('');
    await expect(tenantsPage.propertyCell(email)).not.toHaveText('');
    await expect(tenantsPage.unitCell(email)).not.toHaveText('');
    await expect(tenantsPage.rentCell(email)).toHaveText(/^\$[\d,]+$/);
    await expect(tenantsPage.statusCell(email)).toHaveText(/^(Active|Invited|Pending)$/);
    await expect(tenantsPage.row(email).getByRole('cell')).toHaveCount(8);

    // Suspend is enabled because the API confirms this record has a `user` id.
    await expect(tenantsPage.suspendButton(email)).toBeEnabled();
  });

  test('two different tenants can share the same email address @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { email, names } = tenants.duplicateEmail;

    await tenantsPage.searchInput.fill(email);
    await expect(tenantsPage.rowsMatching(email)).toHaveCount(2);
    for (const name of names) {
      await expect(tenantsPage.rowsMatching(name)).toHaveCount(1);
    }
  });

  test('short numeric units and long property names render without hiding the value @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, email } = tenants.sparseTenant; // unit "11"

    await expect(tenantsPage.unitCell(email)).toHaveText('11');

    const { email: longPropEmail } = tenants.disposableActiveTenant2; // property "Sunrise heights Apartments"
    await expect(tenantsPage.propertyCell(longPropEmail)).toHaveText('Sunrise heights Apartments');
  });
});

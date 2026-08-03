import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

function titleCase(value) {
  return value.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

test.describe('Tenants - Data Consistency', () => {
  test('listing table matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((r) => r.url().includes('/admin/tenants?page=1&limit=20'));
    await dashboard.tenantsLink.click();
    const body = await (await listResponse).json();

    const tenantsPage = new TenantsPage(page);
    await expect(tenantsPage.rows.first()).toBeVisible();

    for (const item of body.data.items) {
      const uiName = item.name ? titleCase(item.name) : item.name;
      // Two records can share the same email (confirmed live: Alex/Jame
      // both use anus.ahmed+76@geeksofkolachi.com) — combine name + email
      // to uniquely identify this specific row.
      const row = uiName ? tenantsPage.row(item.email).filter({ hasText: uiName }) : tenantsPage.row(item.email);
      await test.step(`row for ${uiName ?? ''} <${item.email}>`, async () => {
        await expect(row.getByRole('cell').nth(1)).toHaveText(item.email);
        if (uiName) await expect(row.getByRole('cell').nth(0)).toHaveText(uiName);
        await expect(row.getByRole('cell').nth(2)).toHaveText(titleCase(item.landlord.name));
        await expect(row.getByRole('cell').nth(3)).toHaveText(item.property.name);
        await expect(row.getByRole('cell').nth(4)).toHaveText(item.unitName ?? item.unit ?? '');
        await expect(row.getByRole('cell').nth(5)).toHaveText(`$${item.rentAmount.toLocaleString('en-US')}`);
        await expect(row.getByRole('cell').nth(6)).toHaveText(titleCase(item.status.toLowerCase()));
      });
    }
  });

  test('details page matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = tenants.richProfileTenant;
    const detailResponse = page.waitForResponse((r) => r.url().includes(`/admin/tenants/${id}`));
    const details = new TenantDetailsPage(page);
    await details.goto(id);
    const t = (await (await detailResponse).json()).data;

    // Documents' filenames must match exactly, including URL-encoded
    // characters present in the raw filename (e.g. "%20").
    await expect(details.documentButton(t.profile.rentersInsurance.fileName)).toBeVisible();
    await expect(details.documentButton(t.profile.identityDocument.frontFileName)).toBeVisible();
    await expect(details.documentButton(t.profile.identityDocument.backFileName)).toBeVisible();

    // SSN is present in the API response but must never be rendered anywhere.
    expect(t.profile.ssn).toBeTruthy();
    await expect(page.getByText(t.profile.ssn, { exact: true })).not.toBeVisible();

    await expect(details.infoValue('Rent')).toHaveText(`$${t.rentAmount.toLocaleString('en-US')}`);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

test.describe('Properties - Data Consistency', () => {
  test('listing table matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((r) => r.url().includes('/admin/properties?page=1&limit=20'));
    await dashboard.propertiesLink.click();
    const res = await listResponse;
    const body = await res.json();
    const items = body.data.items ?? body.data;

    const propertiesPage = new PropertiesPage(page);
    await expect(propertiesPage.rows.first()).toBeVisible();

    // "Showing 1-N of N" / total count must trace to the API's own total,
    // never a hardcoded number (per specs/properties-management.md's
    // explicit instruction not to assert fixed dataset sizes).
    const total = body.data.total ?? body.data.meta?.total ?? items.length;
    await expect(propertiesPage.showingText).toContainText(`of ${total}`);

    // Filtering by name alone is not unique: several property names repeat
    // across different ids ("The Marlowe" appears 4 times at plan time -
    // see specs/properties-management.md's duplicate-name notes). Name +
    // address together is *usually* unique, but not always: two distinct
    // "The Marlowe" / "248 West 73rd St, New York" records also share the
    // same Landlord ("Anus") and Unit ("-"), rendering two visually
    // identical rows differing only by Tenants count. Grouping items by
    // name+address (JSON-encoded key, safe regardless of spaces in either
    // value) and comparing the group's rendered Tenants counts as an
    // order-independent set - rather than assuming a 1:1 row-to-item match -
    // correctly handles both the common unique case and this duplicate one.
    const groups = new Map();
    for (const item of items) {
      const key = JSON.stringify([item.name, item.address]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    for (const [key, group] of groups) {
      const [name, address] = JSON.parse(key);
      await test.step(`row(s) for ${name} (${address})`, async () => {
        const matchingRows = propertiesPage.rows.filter({ hasText: name }).filter({ hasText: address });
        await expect(matchingRows).toHaveCount(group.length);

        const rowCount = await matchingRows.count();
        const actualTenantCounts = [];
        for (let i = 0; i < rowCount; i += 1) {
          actualTenantCounts.push(await matchingRows.nth(i).getByRole('cell').nth(4).textContent());
        }
        const expectedTenantCounts = group.map((item) => String(item.tenantsCount ?? item.tenants?.length ?? 0));
        expect(actualTenantCounts.sort()).toEqual(expectedTenantCounts.sort());
      });
    }
  });

  test('details page matches the underlying API response @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = properties.populatedProperty;
    const detailResponse = page.waitForResponse((r) => r.url().includes(`/admin/properties/${id}`));
    const details = new PropertyDetailsPage(page);
    await details.goto(id);
    const res = await detailResponse;
    const body = await res.json();
    const data = body.data;
    const property = data.property ?? data;
    const tenants = data.tenants ?? property.tenants ?? [];

    await expect(details.nameHeading).toHaveText(property.name);
    await expect(details.summaryCardCount('Tenants')).toHaveText(String(data.tenantsCount ?? tenants.length));

    await expect(details.infoValue('Address')).toHaveText(property.address);
    if (property.createdAt) {
      await expect(details.infoValue('Created')).toHaveText(formatDate(property.createdAt));
    }

    if (tenants.length > 0) {
      const tenant = tenants[0];
      const row = details.tenantRow(tenant.email);
      await expect(row).toContainText(tenant.email);
      if (tenant.rentAmount != null) {
        await expect(row).toContainText(`$${tenant.rentAmount}`);
      }
    }
  });
});

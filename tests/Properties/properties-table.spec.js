import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
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

test.describe('Properties - Listing Table', () => {
  test('every row renders 6 cells with correctly formatted data @smoke', async ({ page }) => {
    const propertiesPage = await openProperties(page);

    await test.step('populated row (has a tenant)', async () => {
      const { name, address, landlord, unit, tenantsCount } = properties.populatedProperty;
      await expect(propertiesPage.propertyCell(name)).toHaveText(name);
      await expect(propertiesPage.addressCell(name)).toHaveText(address);
      await expect(propertiesPage.landlordCell(name)).toHaveText(landlord);
      await expect(propertiesPage.unitCell(name)).toHaveText(unit);
      await expect(propertiesPage.tenantsCell(name)).toHaveText(String(tenantsCount));
      await expect(propertiesPage.viewButton(name)).toBeVisible();
    });

    await test.step('zero-tenant row shows "0", not blank', async () => {
      const { name, tenantsCount } = properties.zeroTenantProperty;
      await expect(propertiesPage.tenantsCell(name)).toHaveText(String(tenantsCount));
    });

    await test.step('Actions column renders exactly one "View" button, no Suspend/Edit/Delete', async () => {
      const { name } = properties.populatedProperty;
      const actionButtons = propertiesPage.row(name).getByRole('button');
      await expect(actionButtons).toHaveCount(1);
      // Icon-only button — its accessible name comes from aria-label, not
      // visible text content (confirmed live: <button aria-label="View">
      // wraps only an <svg>, no text node).
      await expect(actionButtons.first()).toHaveAccessibleName('View');
    });
  });

  test('missing Unit renders as an em dash, not blank @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name, unit, tenantsCount } = properties.missingUnitProperty;

    await expect(propertiesPage.unitCell(name)).toHaveText(unit);
    await expect(propertiesPage.tenantsCell(name)).toHaveText(String(tenantsCount));
  });

  test('duplicate property names ("The Marlowe") each navigate to a distinct details page @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const duplicateName = properties.duplicateNamedProperty;

    const rows = propertiesPage.rowsMatching(duplicateName);
    const rowCount = await rows.count();
    expect(rowCount, `Expected multiple "${duplicateName}" rows as a duplicate-name fixture`).toBeGreaterThan(1);

    const addressFirst = await rows.nth(0).getByRole('cell').nth(1).textContent();
    const addressSecond = await rows.nth(1).getByRole('cell').nth(1).textContent();
    expect(addressFirst).not.toEqual(addressSecond);

    await rows.nth(0).getByRole('button', { name: 'View' }).click();
    const firstUrl = page.url();
    await expect(page.getByRole('heading', { level: 3 })).toHaveText(duplicateName);

    await page.goBack();
    await expect(propertiesPage.rows.first()).toBeVisible();

    await propertiesPage.rowsMatching(duplicateName).nth(1).getByRole('button', { name: 'View' }).click();
    const secondUrl = page.url();
    await expect(page.getByRole('heading', { level: 3 })).toHaveText(duplicateName);

    expect(secondUrl, 'Two distinct "The Marlowe" rows must resolve to two distinct ids').not.toEqual(firstUrl);
  });

  test('column headers are static text and clicking them does not reorder rows @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const namesBefore = await propertiesPage.nameCells.allTextContents();

    for (const col of ['Property', 'Address', 'Landlord', 'Unit', 'Tenants']) {
      const header = propertiesPage.columnHeader(col);
      await expect(header).not.toHaveAttribute('aria-sort', /.+/);
      await header.click();
    }

    const namesAfter = await propertiesPage.nameCells.allTextContents();
    expect(namesAfter).toEqual(namesBefore);
  });
});

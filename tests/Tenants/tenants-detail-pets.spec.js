import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Tenants - Detail Pets Section', () => {
  test('zero pets shows "No pets on file" @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.sparseTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.sparseTenant.name);

    await expect(details.noPetsText).toBeVisible();
  });

  test('one pet renders a single pet card @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.onePetTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.onePetTenant.name);

    await expect(details.petCard('Max')).toBeVisible();
    await expect(details.petCard('Max')).toContainText('Cat • Persian');
    await expect(details.noPetsText).not.toBeVisible();
  });

  test('multiple pets render all cards in the correct order, including unusual types @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    const expectedPets = [
      ['Max', 'Dog • Husky'],
      ['Luna', 'Cat • Persian'],
      ['Kiwi', 'Bird • Snipe'],
      ['Guppy', 'Fish • Betta'],
      ['Cotton', 'Other • Angora'],
    ];
    for (const [petName, petInfo] of expectedPets) {
      await expect(details.petCard(petName)).toContainText(petInfo);
    }
  });
});

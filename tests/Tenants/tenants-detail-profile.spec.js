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

test.describe('Tenants - Detail Profile Section', () => {
  test('Profile fields render correctly formatted for a fully-populated tenant @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    await expect(details.infoValue('Date of Birth')).toHaveText('Jan 14, 2002');
    await expect(details.infoValue('Emergency Contact')).toHaveText('Muneeb (Brother) • 03313788971');
    await expect(details.infoValue('Vehicle')).toHaveText('Suzuki Alto 2026 • ALV-810 (AZ)');
    // Confirmed live: this tenant has no `location` field even though
    // everything else in their profile is populated.
    await expect(details.infoValue('Location')).toHaveText('—');
  });

  test('Profile fields all render "—" for a tenant with no profile sub-fields @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.sparseTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.sparseTenant.name);

    await expect(details.infoValue('Date of Birth')).toHaveText('—');
    await expect(details.infoValue('Location')).toHaveText('—');
    await expect(details.infoValue('Emergency Contact')).toHaveText('—');
    await expect(details.infoValue('Vehicle')).toHaveText('—');
  });
});

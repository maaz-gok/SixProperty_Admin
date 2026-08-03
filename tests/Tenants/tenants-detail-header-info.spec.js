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

test.describe('Tenants - Detail Header & Tenant Information', () => {
  test('header renders a real photo when uploaded, initials otherwise; no status badge in the header row @smoke', async ({ page }) => {
    await loginOnly(page);

    const photoDetails = new TenantDetailsPage(page);
    await photoDetails.goto(tenants.richProfileTenant.id);
    await expect(photoDetails.nameHeading).toHaveText(tenants.richProfileTenant.name);
    const avatarImg = page.locator('img').first();
    await expect(avatarImg).toHaveAttribute('src', /^https:\/\//);
    await expect(avatarImg).toHaveAttribute('alt', tenants.richProfileTenant.name);

    const initialsDetails = new TenantDetailsPage(page);
    await initialsDetails.goto(tenants.sparseTenant.id);
    await expect(initialsDetails.nameHeading).toHaveText(tenants.sparseTenant.name);
    await expect(page.getByText('AT', { exact: true })).toBeVisible();

    // No status badge in the header row itself — only next to "Tenant Information" further down.
    const headerRow = initialsDetails.nameHeading.locator('xpath=../..');
    await expect(headerRow.getByText(/^(Active|Invited|Pending)$/)).not.toBeVisible();
    await expect(initialsDetails.statusBadge).toBeVisible();
  });

  test('Tenant Information fields match the API for a fully-populated tenant @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const { id, name } = tenants.richProfileTenant;

    const detailResponse = page.waitForResponse((r) => r.url().includes(`/admin/tenants/${id}`));
    const details = new TenantDetailsPage(page);
    await details.goto(id);
    const body = await (await detailResponse).json();
    const t = body.data;

    await expect(details.nameHeading).toHaveText(name);
    await expect(details.infoValue('Email')).toHaveText(t.email);
    await expect(details.infoValue('Phone')).toHaveText(t.phone);
    await expect(details.infoValue('Unit')).toHaveText(t.unitName);
    await expect(details.infoValue('Rent')).toHaveText(`$${t.rentAmount.toLocaleString('en-US')}`);
    await expect(details.infoValue('Security Deposit Held')).toHaveText(t.securityDepositHeld ? 'Yes' : 'No');
    await expect(details.infoValue('Invite Code')).toHaveText(t.inviteCode);
    await expect(details.infoValue('Landlord')).toHaveText(t.landlord.name, { ignoreCase: true });
    await expect(details.infoValue('Landlord Email')).toHaveText(t.landlord.email);
    await expect(details.infoValue('Property')).toHaveText(t.property.name);
    await expect(details.infoValue('Property Address')).toHaveText(t.property.address);
  });

  test('missing Tenant Information fields render sensibly @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.sparseTenant.id);

    await expect(details.infoValue('Lease Start')).toHaveText('—');
    // Confirmed live: unlike other missing fields (which show "—"),
    // Security Deposit Held silently defaults to "No" when the field is
    // absent from the API response — documented inconsistency, not asserted as a bug fix target.
    await expect(details.infoValue('Security Deposit Held')).toHaveText('No');
  });
});

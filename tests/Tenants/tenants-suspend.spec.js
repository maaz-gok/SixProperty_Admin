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

/** Restores a tenant's user account via a direct authenticated API call —
 * the only way to unsuspend one, since no reachable UI button exists once
 * suspended (see Bugs/Tenants/tenants-suspend-does-not-update-or-allow-unsuspend.md). */
async function restoreViaApi(page, userId) {
  return page.evaluate(async (uid) => {
    const token = JSON.parse(localStorage.getItem('token'));
    const res = await fetch(`https://api.six-property.clienturl.net/admin/users/${uid}/unsuspend`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return { status: res.status, body: await res.json() };
  }, userId);
}

// IMPORTANT: jwatson@thesixpm.com ("Jeremy") is a real client tenant, and
// mudassir+909@geeksofkolachi.com ("Ahmed Khan") is linked to the live
// admin's own account — never suspend either casually. Every test below
// uses a disposable "Maaz Tenant T#" or "Anus Tenant" account instead, and
// restores it via a direct API call afterward (never via a UI "Unsuspend"
// button, since none exists once a tenant is suspended).
test.describe('Tenants - Suspend & Unsuspend', () => {
  // Confirmed real gap, shared with Landlords: clicking "Suspend" fires the
  // request immediately with no confirmation step. See
  // Bugs/Landlords/landlords-suspend-no-confirmation.md (same shared
  // component/behaviour, not re-filed for Tenants).
  test('Suspend fires immediately with no confirmation dialog @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { email, userId } = tenants.disposableActiveTenant2;

    try {
      await tenantsPage.suspendButton(email).click();
      expect(await page.getByRole('dialog').count(), 'No confirmation dialog should ever appear').toBe(0);
      await expect(tenantsPage.toast('User suspended successfully.')).toBeVisible();
    } finally {
      const result = await restoreViaApi(page, userId);
      expect(result.status).toBe(200);
    }
  });

  // Confirmed bug: the suspend request succeeds on the backend and shows a
  // correct success toast, but the row's Status cell and Actions button
  // never update — not immediately, and not after a reload. This asserts
  // the CORRECT expected behaviour and is left failing intentionally until
  // Bugs/Tenants/tenants-suspend-does-not-update-or-allow-unsuspend.md is
  // fixed, per the project's known-issue convention (see
  // tests/Dashboard/dashboard-sign-out.spec.js). The click itself still
  // suspends the account for real regardless of this assertion, so cleanup
  // runs in a `finally` block.
  test('Suspend should update the row\'s Status and button (currently does not)', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { email, userId } = tenants.disposableActiveTenant3;

    try {
      const suspendResponse = page.waitForResponse((r) => r.url().includes('/suspend') && r.request().method() === 'PATCH');
      await tenantsPage.suspendButton(email).click();
      const body = await (await suspendResponse).json();
      expect(body.data.status, 'Backend must genuinely suspend the account').toBe('SUSPENDED');

      await expect(
        tenantsPage.statusCell(email),
        'Known gap: the Status cell should read the account\'s suspend state, not just onboarding status'
      ).toHaveText('Suspended');
      await expect(tenantsPage.unsuspendButton(email)).toBeVisible();
    } finally {
      const result = await restoreViaApi(page, userId);
      expect(result.status).toBe(200);
    }
  });

  // Direct consequence of the bug above: since the row never reflects a
  // suspended account, there is no "Unsuspend" button to click. Documents
  // the gap rather than asserting a reachable UI path that doesn't exist.
  test('No "Unsuspend" button ever appears for a suspended tenant (known gap)', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { email, userId } = tenants.sparseTenant;

    try {
      await tenantsPage.suspendButton(email).click();
      await expect(tenantsPage.toast('User suspended successfully.')).toBeVisible();

      await expect(tenantsPage.unsuspendButton(email)).not.toBeVisible();
      await expect(tenantsPage.suspendButton(email)).toBeVisible();
    } finally {
      const result = await restoreViaApi(page, userId);
      expect(result.status).toBe(200);
    }
  });

  // Data-integrity bug, not a functional one: this specific tenant record's
  // `user` field points at the live admin's own account. The backend
  // correctly refuses to suspend an admin, and the app correctly shows an
  // error toast — no lockout risk. See
  // Bugs/Tenants/tenants-record-linked-to-admin-account.md. No cleanup is
  // needed since the request is rejected and no state actually changes.
  test('Suspending the admin-linked tenant record is correctly refused, with a clear error toast @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { email } = tenants.adminLinkedTenant;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${encodeURIComponent(email)}`));
    await tenantsPage.searchInput.fill(email);
    await searchRes;
    await expect(tenantsPage.row(email)).toHaveCount(1);

    const suspendResponse = page.waitForResponse((r) => r.url().includes('/suspend') && r.request().method() === 'PATCH');
    await tenantsPage.suspendButton(email).click();
    const body = await (await suspendResponse).json();

    expect(body).toEqual({ message: 'Admin users cannot be suspended.', status: 400, data: null });
    await expect(tenantsPage.toast('Admin users cannot be suspended.')).toBeVisible();

    // Confirm no lockout: the admin's own session still works.
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 3 })).toBeVisible();
  });
});

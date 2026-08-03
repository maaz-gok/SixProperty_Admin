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

test.describe('Tenants - Status Filter', () => {
  test('each status option returns only matching rows @smoke @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);

    await test.step('Active', async () => {
      const res = page.waitForResponse((r) => r.url().includes('/admin/tenants?page=1&limit=20&status=ACTIVE'));
      await tenantsPage.statusSelect.selectOption('ACTIVE');
      await res;
      const count = await tenantsPage.rows.count();
      for (let i = 0; i < count; i += 1) {
        await expect(tenantsPage.rows.nth(i).getByRole('cell').nth(6)).toHaveText('Active');
      }
    });

    await test.step('Invited', async () => {
      const res = page.waitForResponse((r) => r.url().includes('&status=INVITED'));
      await tenantsPage.statusSelect.selectOption('INVITED');
      await res;
      await expect(tenantsPage.showingText).toHaveText(/^Showing 1–\d+ of \d+$/);
      const count = await tenantsPage.rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i += 1) {
        await expect(tenantsPage.rows.nth(i).getByRole('cell').nth(6)).toHaveText('Invited');
      }
    });

    await test.step('Pending returns real data, not a dead option', async () => {
      const res = page.waitForResponse((r) => r.url().includes('&status=PENDING'));
      await tenantsPage.statusSelect.selectOption('PENDING');
      await res;
      const count = await tenantsPage.rows.count();
      expect(count, 'Pending is a real, populated status').toBeGreaterThan(0);
      for (let i = 0; i < count; i += 1) {
        await expect(tenantsPage.rows.nth(i).getByRole('cell').nth(6)).toHaveText('Pending');
      }
    });
  });

  test('search and status filter combine into a single request @regression @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, apiName } = tenants.realClientTenant; // Jeremy is Active

    const matchRes = page.waitForResponse(
      (r) => r.url().includes(`search=${apiName}`) && r.url().includes('status=ACTIVE')
    );
    await tenantsPage.searchInput.fill(apiName);
    await tenantsPage.statusSelect.selectOption('ACTIVE');
    await matchRes;
    await expect(tenantsPage.row(name)).toHaveCount(1);

    // Combining with a status that excludes the match — confirmed live to
    // fall back to the same generic empty state as a plain no-results search.
    const excludeRes = page.waitForResponse(
      (r) => r.url().includes(`search=${apiName}`) && r.url().includes('status=INVITED')
    );
    await tenantsPage.statusSelect.selectOption('INVITED');
    await excludeRes;
    await expect(tenantsPage.noDataHeading).toBeVisible();
    await expect(tenantsPage.noDataText).toBeVisible();
  });

  test('Reset clears both search and status filter together @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { apiName } = tenants.realClientTenant;

    const res = page.waitForResponse((r) => r.url().includes(`search=${apiName}`) && r.url().includes('status=ACTIVE'));
    await tenantsPage.searchInput.fill(apiName);
    await tenantsPage.statusSelect.selectOption('ACTIVE');
    await res;
    await expect(tenantsPage.resetButton).toBeVisible();

    await tenantsPage.resetButton.click();

    await expect(tenantsPage.searchInput).toHaveValue('');
    await expect(tenantsPage.statusSelect).toHaveValue('');
    await expect(tenantsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });
});

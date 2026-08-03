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

test.describe('Tenants - Search', () => {
  test('exact name, partial name, email, and partial email all match @smoke @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, apiName, email } = tenants.realClientTenant; // Jeremy, read-only use

    await test.step('exact name', async () => {
      const res = page.waitForResponse((r) => r.url().includes(`/admin/tenants?page=1&limit=20&search=${apiName}`));
      await tenantsPage.searchInput.fill(apiName);
      await res;
      await expect(tenantsPage.row(name)).toHaveCount(1);
      await expect(tenantsPage.showingText).toHaveText(/^Showing 1–1 of 1$/);
      await expect(tenantsPage.pageIndicator).toHaveText('Page 1 of 1');
      await expect(tenantsPage.previousButton).toBeDisabled();
      await expect(tenantsPage.nextButton).toBeDisabled();
    });

    await test.step('partial name', async () => {
      const partial = apiName.slice(0, 3);
      const res = page.waitForResponse((r) => r.url().includes(`search=${partial}`));
      await tenantsPage.searchInput.fill(partial);
      await res;
      await expect(tenantsPage.row(name)).toHaveCount(1);
    });

    await test.step('full email', async () => {
      const res = page.waitForResponse((r) => r.url().includes('search='));
      await tenantsPage.searchInput.fill(email);
      await res;
      await expect(tenantsPage.row(name)).toHaveCount(1);
      await expect(tenantsPage.emailCell(name)).toHaveText(email);
    });
  });

  test('search is case-insensitive and tolerates whitespace @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, apiName } = tenants.realClientTenant;
    const noisyTerm = `  ${apiName.toUpperCase()}  `;

    const res = page.waitForResponse((r) => r.url().includes('/admin/tenants') && r.url().includes('search='));
    await tenantsPage.searchInput.fill(noisyTerm);
    await res;

    await expect(tenantsPage.row(name)).toHaveCount(1);
  });

  test('script-like search input is treated as inert text, not executed @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const payload = '<script>alert(1)</script>';
    const res = page.waitForResponse((r) => r.url().includes('/admin/tenants') && r.url().includes('search='));
    await tenantsPage.searchInput.fill(payload);
    await res;

    await expect(tenantsPage.searchInput).toHaveValue(payload);
    await expect(tenantsPage.noDataHeading).toBeVisible();
    await expect(tenantsPage.noDataText).toBeVisible();
    expect(dialogFired, 'A script-like search value must never trigger a JS dialog').toBe(false);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('a non-matching search shows the "No data found" empty state, and Reset restores the full list @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);

    const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
    await tenantsPage.searchInput.fill('zzzznotfound');
    await res;

    await expect(tenantsPage.noDataHeading).toBeVisible();
    await expect(tenantsPage.noDataText).toBeVisible();
    await expect(tenantsPage.showingText).not.toBeVisible();

    await tenantsPage.resetButton.click();
    await expect(tenantsPage.searchInput).toHaveValue('');
    await expect(tenantsPage.rows.first()).toBeVisible();
    await expect(tenantsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
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

test.describe('Tenants - Accessibility', () => {
  // "View" is an icon-only button whose accessible name comes from
  // `aria-label="View"` (no visible text), so getByRole still resolves it.
  // Confirmed live: rows whose tenant has no linked `user` id render a
  // disabled Suspend button, which browsers skip in tab order — search
  // narrows to a tenant known to have a `user` id so this test is stable.
  // A "Reset" button only exists (and is only tabbable) once the search
  // box has a value, adding a stop between the status filter and the row.
  test('search box and its row\'s actions are reachable in a logical tab order @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);
    const { name, email } = tenants.sparseTenant;
    await tenantsPage.searchInput.fill(email);
    await expect(tenantsPage.rows).toHaveCount(1);

    await tenantsPage.searchInput.focus();
    await expect(tenantsPage.searchInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(tenantsPage.statusSelect).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(tenantsPage.resetButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(tenantsPage.viewButton(name)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(tenantsPage.suspendButton(name)).toBeFocused();
  });

  test('pagination Previous/Next are reachable and operable via keyboard @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);

    // "Previous" is disabled (unfocusable) on page 1, so this focuses "Next"
    // first, advances a page with it, then confirms "Previous" (now enabled)
    // is reachable too.
    await tenantsPage.nextButton.focus();
    await expect(tenantsPage.nextButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(tenantsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    await tenantsPage.previousButton.focus();
    await expect(tenantsPage.previousButton).toBeFocused();
  });

  test('listing and details tables expose correct table/row/columnheader/cell roles @regression', async ({ page }) => {
    const tenantsPage = await openTenants(page);

    await expect(tenantsPage.table).toBeVisible();
    await expect(tenantsPage.table.getByRole('columnheader')).toHaveCount(8);
    expect(await tenantsPage.rows.count()).toBeGreaterThan(0);
    await expect(tenantsPage.rows.first().getByRole('cell')).toHaveCount(8);

    const { id } = tenants.richProfileTenant;
    const details = new TenantDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);
  });
});

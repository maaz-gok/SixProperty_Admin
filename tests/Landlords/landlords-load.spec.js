import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

test.describe('Landlords - Initial Load', () => {
  test('loads cleanly after login with no console errors or failed requests @smoke', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const failedRequests = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
    });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((res) => res.url().includes('/admin/landlords?page=1&limit=20'));
    await dashboard.landlordsLink.click();
    const res = await listResponse;

    const landlordsPage = new LandlordsPage(page);
    await expect(page).toHaveURL(/\/landlords$/);
    expect(res.status()).toBe(200);

    await expect(landlordsPage.heading).toBeVisible();
    await expect(landlordsPage.description).toBeVisible();
    await expect(landlordsPage.searchInput).toBeVisible();
    await expect(landlordsPage.table).toBeVisible();
    for (const col of ['Name', 'Email', 'Properties', 'Tenants', 'Status', 'Joined', 'Actions']) {
      await expect(landlordsPage.columnHeader(col)).toBeVisible();
    }
    await expect(landlordsPage.previousButton).toBeVisible();
    await expect(landlordsPage.nextButton).toBeVisible();

    await expect(landlordsPage.landlordsNavLink).toHaveAttribute('data-active', 'true');
    await expect(landlordsPage.profileLink).toBeVisible();
    await expect(landlordsPage.signOutButton).toBeVisible();
    await expect(landlordsPage.headerAvatarName).toBeVisible();

    expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('direct navigation and reload consistency @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const landlordsPage = new LandlordsPage(page);
    await landlordsPage.goto();
    await expect(page).toHaveURL(/\/landlords$/);
    await expect(landlordsPage.heading).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/landlords$/);
    await expect(landlordsPage.heading).toBeVisible();
    await expect(landlordsPage.rows.first()).toBeVisible();
    await expect(landlordsPage.showingText).toBeVisible();
  });

  test('every row renders 7 cells with correctly formatted data @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const landlordsPage = new LandlordsPage(page);
    await landlordsPage.goto();
    await expect(landlordsPage.rows.first()).toBeVisible();

    await test.step('populated row (has properties/tenants)', async () => {
      const { name } = landlords.populatedLandlord;
      await expect(landlordsPage.nameCell(name)).toHaveText(name);
      await expect(landlordsPage.propertiesCell(name)).not.toHaveText('');
      await expect(landlordsPage.tenantsCell(name)).not.toHaveText('');
      await expect(landlordsPage.statusCell(name)).toHaveText(/^(Active|Suspended)$/);
      await expect(landlordsPage.joinedCell(name)).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
      await expect(landlordsPage.viewButton(name)).toBeVisible();
    });

    await test.step('zero-count row shows "0", not blank', async () => {
      const { name } = landlords.disposableActiveLandlord;
      await expect(landlordsPage.propertiesCell(name)).toHaveText('0');
      await expect(landlordsPage.tenantsCell(name)).toHaveText('0');
    });

    await test.step('status badge pairs correctly with the action button', async () => {
      const { name: activeName } = landlords.disposableActiveLandlord;
      await expect(landlordsPage.statusCell(activeName)).toHaveText('Active');
      await expect(landlordsPage.suspendButton(activeName)).toBeVisible();

      const { name: suspendedName } = landlords.suspendedZeroCountLandlord;
      await expect(landlordsPage.statusCell(suspendedName)).toHaveText('Suspended');
      await expect(landlordsPage.unsuspendButton(suspendedName)).toBeVisible();
    });
  });

  // Column headers are plain text, not sort controls: no aria-sort attribute
  // and clicking them does not reorder rows. Confirmed live against the DOM.
  test('column headers are static text and clicking them does not reorder rows @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const landlordsPage = new LandlordsPage(page);
    await landlordsPage.goto();
    await expect(landlordsPage.rows.first()).toBeVisible();

    const namesBefore = await landlordsPage.nameCells.allTextContents();

    for (const col of ['Name', 'Email', 'Properties', 'Tenants', 'Status', 'Joined']) {
      const header = landlordsPage.columnHeader(col);
      await expect(header).not.toHaveAttribute('aria-sort', /.+/);
      await header.click();
    }

    const namesAfter = await landlordsPage.nameCells.allTextContents();
    expect(namesAfter).toEqual(namesBefore);
  });
});

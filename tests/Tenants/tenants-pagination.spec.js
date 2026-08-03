import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

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

test.describe('Tenants - Pagination', () => {
  test('Previous/Next behave correctly across all pages and data changes each time @smoke @critical', async ({ page }) => {
    const tenantsPage = await openTenants(page);

    await expect(tenantsPage.previousButton).toBeDisabled();
    await expect(tenantsPage.nextButton).toBeEnabled();
    await expect(tenantsPage.pageIndicator).toHaveText(/^Page 1 of (\d+)$/);

    const page1Names = await tenantsPage.nameCells.allTextContents();

    // Confirmed live: 29 total / 20 per page = 2 pages, so this loop
    // advances exactly once, but is written generically in case the
    // dataset grows.
    const seenPages = [page1Names];
    let guard = 0;
    while (await tenantsPage.nextButton.isEnabled() && guard < 20) {
      const beforeIndicator = await tenantsPage.pageIndicator.textContent();
      const before = await tenantsPage.nameCells.allTextContents();
      await tenantsPage.nextButton.click();
      // Wait for the page indicator to actually change before reading row
      // data — old rows stay mounted while the next page's data is still
      // in flight.
      await expect(tenantsPage.pageIndicator).not.toHaveText(beforeIndicator);
      const after = await tenantsPage.nameCells.allTextContents();
      expect(after).not.toEqual(before);
      seenPages.push(after);
      guard += 1;
    }

    await expect(tenantsPage.nextButton).toBeDisabled();
    await expect(tenantsPage.previousButton).toBeEnabled();
    await expect(tenantsPage.showingText).toHaveText(/^Showing \d+–\d+ of \d+$/);

    for (let i = seenPages.length - 1; i > 0; i -= 1) {
      const beforeIndicator = await tenantsPage.pageIndicator.textContent();
      await tenantsPage.previousButton.click();
      await expect(tenantsPage.pageIndicator).not.toHaveText(beforeIndicator);
    }
    await expect(tenantsPage.previousButton).toBeDisabled();
    const restoredPage1Names = await tenantsPage.nameCells.allTextContents();
    expect(restoredPage1Names).toEqual(page1Names);
  });

  // No current status-filter subset spans more than one page in the live
  // dataset (all fit on "Page 1 of 1"), so this mocks a second page to
  // verify pagination reflects the filtered total rather than the
  // unfiltered dataset size.
  test('status-filtered pagination reflects the filtered total, not the unfiltered dataset @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const mockItem = (n) => ({
      _id: `mock-active-${n}`,
      landlord: { _id: `mock-landlord-${n}`, name: 'Mock Landlord', email: 'mock@example.com' },
      property: { _id: `mock-property-${n}`, name: 'Mock Property', address: '1 Mock St' },
      name: `Mock Tenant ${n}`,
      email: `mock-tenant-${n}@example.com`,
      unitName: `U${n}`,
      rentAmount: 1000,
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await page.route('**/admin/tenants?page=1&limit=20&status=ACTIVE', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Tenants fetched successfully.',
          status: 200,
          data: {
            items: Array.from({ length: 20 }, (_, i) => mockItem(i + 1)),
            pagination: { currentPage: 1, totalPages: 2, totalItems: 25, itemsPerPage: 20, hasNextPage: true, hasPrevPage: false },
          },
        }),
      })
    );

    const tenantsPage = new TenantsPage(page);
    await tenantsPage.goto();
    await expect(tenantsPage.rows.first()).toBeVisible();

    const res = page.waitForResponse((r) => r.url().includes('status=ACTIVE'));
    await tenantsPage.statusSelect.selectOption('ACTIVE');
    await res;

    await expect(tenantsPage.pageIndicator).toHaveText('Page 1 of 2');
    await expect(tenantsPage.nextButton).toBeEnabled();
  });
});

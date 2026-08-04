import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

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

test.describe('Properties - Pagination', () => {
  // The live dataset has exactly 20 properties on a single page at plan
  // time (specs/properties-management.md, Feature Area 6). Unlike Landlords
  // (86/5 pages) and Tenants (29/2 pages), there is currently no way to
  // exercise real multi-page Next/Previous behaviour here — this test
  // documents the confirmed single-page state instead. If the dataset later
  // grows past 20, this assertion will start failing and should be
  // replaced with the Landlords-style multi-page walk.
  test('single-page dataset shows fully-disabled Previous/Next @smoke @critical', async ({ page }) => {
    const propertiesPage = await openProperties(page);

    await expect(propertiesPage.pageIndicator).toHaveText('Page 1 of 1');
    await expect(propertiesPage.previousButton).toBeDisabled();
    await expect(propertiesPage.nextButton).toBeDisabled();
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–\d+ of \d+$/);
  });
});

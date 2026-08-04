import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

async function pageOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test.describe('Properties - Responsive Behaviour', () => {
  // Confirmed live during test generation: unlike Tenants
  // (Bugs/Tenants/tenants-desktop-header-overflows-viewport.md), the
  // Properties listing and details pages do NOT overflow at 1280px — header
  // right edge lands exactly at the 1280px viewport edge. This corrects an
  // earlier inferred (unverified) note in specs/properties-management.md's
  // Feature Area 7, which speculated this bug would likely reproduce here
  // too, by analogy. It does not.
  test('desktop layout (1280px) has no page-level horizontal overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(propertiesPage.rows.first()).toBeVisible();

    const listOverflow = await pageOverflow(page);
    expect(listOverflow.scrollWidth, 'Listing page should not scroll horizontally at 1280px').toBeLessThanOrEqual(listOverflow.clientWidth);

    const { id } = properties.populatedProperty;
    const details = new PropertyDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toBeVisible();

    const detailsOverflow = await pageOverflow(page);
    expect(detailsOverflow.scrollWidth, 'Details page should not scroll horizontally at 1280px').toBeLessThanOrEqual(detailsOverflow.clientWidth);
  });

  // Confirmed live: at 768px the LISTING page reproduces the same
  // whole-page horizontal scroll gap documented for Landlords/Tenants
  // (Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md) —
  // measured scrollWidth 938px vs clientWidth 768px, a ~170px page-level
  // overflow. Unlike Landlords/Tenants, the DETAILS page does NOT reproduce
  // it here (measured exactly 768/768, no overflow) — this is a genuine
  // difference from the other two modules, not an oversight. This test
  // asserts the CORRECT expected behaviour for the listing page and is left
  // failing intentionally until the shared root cause is fixed, per the
  // project's known-issue convention.
  test('tablet layout (768px): listing page has a known horizontal-scroll gap @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(propertiesPage.rows.first()).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, 'Listing page should not scroll horizontally at 768px (known gap, see Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md)').toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('tablet layout (768px): details page has no horizontal overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = properties.populatedProperty;
    const details = new PropertyDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('mobile layout (390px): sidebar collapses and no page-level overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const propertiesPage = new PropertiesPage(page);
    await propertiesPage.goto();
    await expect(propertiesPage.rows.first()).toBeVisible();

    await expect(propertiesPage.propertiesNavLink).not.toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});

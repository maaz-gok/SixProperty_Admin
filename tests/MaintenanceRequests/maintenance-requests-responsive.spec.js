import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function pageOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

test.describe('Maintenance Requests - Responsive Behaviour', () => {
  test('desktop layout (1280px): both pages are clean @regression', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const listOverflow = await pageOverflow(page);
    expect(listOverflow.scrollWidth, 'Listing page should not scroll horizontally at 1280px').toBeLessThanOrEqual(listOverflow.clientWidth);

    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    await expect(details.titleHeading).toBeVisible();

    const detailsOverflow = await pageOverflow(page);
    expect(detailsOverflow.scrollWidth, 'Details page should not scroll horizontally at 1280px').toBeLessThanOrEqual(detailsOverflow.clientWidth);
  });

  // Confirmed live: at 768px the LISTING page reproduces the shared
  // whole-page horizontal scroll gap (Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md)
  // — measured scrollWidth 1024px vs clientWidth 768px (~256px overflow,
  // the largest confirmed of any module, consistent with this table having
  // the most columns of any listing page). This asserts the CORRECT
  // expected behaviour and is left failing intentionally until fixed.
  test('tablet layout (768px): listing page has a known horizontal-scroll gap @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth, 'Listing page should not scroll horizontally at 768px (known gap, see Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md)').toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('tablet layout (768px): details page is clean, unlike the listing page @regression', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    await expect(details.titleHeading).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('mobile layout (390px): sidebar collapses, no page-level overflow @regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    await expect(requestsPage.maintenanceRequestsNavLink).not.toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('mobile layout (390px): details page is also clean @regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    await expect(details.titleHeading).toBeVisible();

    const overflow = await pageOverflow(page);
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});

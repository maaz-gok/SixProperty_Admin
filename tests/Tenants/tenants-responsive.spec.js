import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

async function openTenantsAt(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const tenantsPage = new TenantsPage(page);
  await tenantsPage.goto();
  await expect(tenantsPage.rows.first()).toBeVisible();
  return { context, page, tenantsPage };
}

// No locator-based way to assert page-level scroll overflow (mirrors the
// precedent in LandlordsPage's/DashboardPage's viewport tests). A vertical
// scrollbar inflates `documentElement.scrollWidth` by ~20-30px even with
// zero real horizontal overflow — a rendering quirk, not a layout bug.
async function hasRealPageHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 30);
}

test.describe('Tenants - Responsive Layout', () => {
  // Known bug (Bugs/Tenants/tenants-desktop-header-overflows-viewport.md):
  // the header's right-aligned "Admin" block is wider than the viewport at
  // 1280px, pushing the whole page ~60px past its edge. Confirmed the same
  // shared header also does this (smaller, ~27px) on Landlords. Asserts the
  // CORRECT expected behaviour and is left failing intentionally until fixed.
  test('desktop (1280px): no real page-level horizontal overflow @regression', async ({ browser }) => {
    const { context, page } = await openTenantsAt(browser, { width: 1280, height: 800 });
    expect(
      await hasRealPageHorizontalOverflow(page),
      'The header should fit inside the viewport at this width with no page-level horizontal scroll'
    ).toBe(false);
    await context.close();
  });

  // Same known gap as Landlords: at this width the sidebar doesn't
  // collapse and the main content area doesn't shrink to fit, so the
  // *entire page* scrolls horizontally instead of just the table. This
  // asserts the CORRECT expected behaviour and is left failing
  // intentionally until Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md
  // is fixed (shared root cause, confirmed to reproduce here too).
  test('tablet (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
    const { context, page } = await openTenantsAt(browser, { width: 768, height: 1024 });
    expect(
      await hasRealPageHorizontalOverflow(page),
      'The whole page should not need to scroll horizontally at this width — only the table should, if anything'
    ).toBe(false);
    await context.close();
  });

  test('mobile (390px): no real overflow, sidebar fully collapsed @regression', async ({ browser }) => {
    const { context, page, tenantsPage } = await openTenantsAt(browser, { width: 390, height: 844 });

    await expect(tenantsPage.tenantsNavLink).not.toBeVisible();
    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);

    await expect(tenantsPage.columnHeader('Name')).toBeInViewport({ ratio: 0.95 });
    await context.close();
  });

  test('details page (1280px): no real horizontal overflow @regression', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
    await context.close();
  });

  test('details page (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    expect(
      await hasRealPageHorizontalOverflow(page),
      'The whole page should not need to scroll horizontally at this width'
    ).toBe(false);
    await context.close();
  });

  test('details page (390px): no real horizontal overflow @regression', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
    await context.close();
  });
});

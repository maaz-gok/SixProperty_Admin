import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import { LandlordDetailsPage } from '../../src/pages/LandlordDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

async function openLandlordsAt(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const landlordsPage = new LandlordsPage(page);
  await landlordsPage.goto();
  await expect(landlordsPage.rows.first()).toBeVisible();
  return { context, page, landlordsPage };
}

// No locator-based way to assert page-level scroll overflow (mirrors the
// precedent in DashboardPage's viewport tests). Confirmed live: with 86 rows
// the page always gets a vertical scrollbar, which inflates
// `documentElement.scrollWidth` by ~20-30px even with zero real horizontal
// overflow — a rendering quirk, not a layout bug. A small tolerance absorbs
// that noise while still catching genuine overflow (which is hundreds of px).
async function hasRealPageHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 30);
}

test.describe('Landlords - Responsive Layout', () => {
  test('desktop (1280px): all 7 columns fully visible, no page-level horizontal overflow @regression', async ({ browser }) => {
    const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 1280, height: 800 });

    for (const col of ['Name', 'Email', 'Properties', 'Tenants', 'Status', 'Joined', 'Actions']) {
      await expect(landlordsPage.columnHeader(col)).toBeInViewport({ ratio: 0.95 });
    }
    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
    await context.close();
  });

  // Confirmed real gap (see
  // Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md): the
  // sidebar currently stays expanded at this width and the main content
  // area does not shrink to fit, so the *entire page* scrolls horizontally
  // instead of just the table. This asserts the CORRECT expected behaviour
  // (no real page-level overflow at this width) and is left failing
  // intentionally until that's fixed, per the project's known-issue
  // convention (see tests/Dashboard/dashboard-sign-out.spec.js).
  test('tablet (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
    const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 768, height: 1024 });

    // These column-visibility facts hold regardless of whether the scroll
    // needed to reach them is page-level (buggy) or table-level (correct).
    await expect(landlordsPage.columnHeader('Name')).toBeInViewport({ ratio: 0.95 });
    await expect(landlordsPage.columnHeader('Email')).toBeInViewport({ ratio: 0.95 });
    for (const col of ['Properties', 'Tenants', 'Status', 'Joined', 'Actions']) {
      await expect(landlordsPage.columnHeader(col)).not.toBeInViewport({ ratio: 0.95 });
    }

    expect(
      await hasRealPageHorizontalOverflow(page),
      'The whole page should not need to scroll horizontally at this width — only the table should, if anything'
    ).toBe(false);
    await context.close();
  });

  // Confirmed live: Name's column is narrow enough to fit fully at this
  // width, but Email is wide enough that only part of it fits (its right
  // edge falls well past the 390px viewport) — it's visible, just not
  // fully readable without scrolling. Properties/Actions are hidden entirely.
  test('mobile (390px): only Name is fully visible, Email is partially clipped, sidebar fully collapsed @regression', async ({ browser }) => {
    const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 390, height: 844 });

    await expect(landlordsPage.columnHeader('Name')).toBeInViewport({ ratio: 0.95 });
    await expect(landlordsPage.columnHeader('Email')).toBeInViewport(); // partially, not fully
    await expect(landlordsPage.columnHeader('Email')).not.toBeInViewport({ ratio: 0.95 });
    await expect(landlordsPage.columnHeader('Properties')).not.toBeInViewport();
    await expect(landlordsPage.columnHeader('Actions')).not.toBeInViewport();

    // Sidebar collapses fully rather than to an icon rail, so the table's
    // own scroll container (rather than the whole page) properly absorbs
    // the overflow at this width.
    await expect(landlordsPage.landlordsNavLink).not.toBeVisible();
    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);

    const { name } = landlords.populatedLandlord;
    await landlordsPage.viewButton(name).scrollIntoViewIfNeeded();
    await expect(landlordsPage.viewButton(name)).toBeInViewport();
    await context.close();
  });

  async function openDetailsAt(browser, viewport) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id, name } = landlords.populatedLandlord;
    const details = new LandlordDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);
    await expect(details.summaryCard('Properties')).toBeVisible();
    await expect(details.summaryCard('Tenants')).toBeVisible();
    await expect(details.infoValue('Email')).toBeVisible();
    await expect(details.propertiesTableHeading).toBeVisible();
    await expect(details.tenantsTableHeading).toBeVisible();
    return { context, page };
  }

  test('details page (1280px): no real horizontal overflow @regression', async ({ browser }) => {
    const { context, page } = await openDetailsAt(browser, { width: 1280, height: 800 });
    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
    await context.close();
  });

  // Same known gap as the listing page at this width (see
  // Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md). Asserts
  // the CORRECT expected behaviour and is left failing intentionally until
  // fixed, per the project's known-issue convention (see
  // tests/Dashboard/dashboard-sign-out.spec.js).
  test('details page (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
    const { context, page } = await openDetailsAt(browser, { width: 768, height: 1024 });
    expect(
      await hasRealPageHorizontalOverflow(page),
      'The whole page should not need to scroll horizontally at this width'
    ).toBe(false);
    await context.close();
  });

  test('details page (390px): no real horizontal overflow @regression', async ({ browser }) => {
    const { context, page } = await openDetailsAt(browser, { width: 390, height: 844 });
    expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
    await context.close();
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

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

test.describe('Properties - Search', () => {
  test('exact name, partial name, and address all match the same property @smoke @critical', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name, address } = properties.populatedProperty;

    await test.step('exact name', async () => {
      const res = page.waitForResponse((r) => r.url().includes(`/admin/properties?page=1&limit=20&search=${name}`));
      await propertiesPage.searchInput.fill(name);
      await res;
      await expect(propertiesPage.row(name)).toHaveCount(1);
      await expect(propertiesPage.showingText).toHaveText(/^Showing 1–1 of 1$/);
      await expect(propertiesPage.pageIndicator).toHaveText('Page 1 of 1');
      await expect(propertiesPage.previousButton).toBeDisabled();
      await expect(propertiesPage.nextButton).toBeDisabled();
    });

    await test.step('partial name', async () => {
      const partial = name.slice(0, 3);
      const res = page.waitForResponse((r) => r.url().includes(`search=${partial}`));
      await propertiesPage.searchInput.fill(partial);
      await res;
      await expect(propertiesPage.row(name)).toHaveCount(1);
    });

    await test.step('address fragment (distinct from the name term above, to avoid a cached-query no-op)', async () => {
      // Confirmed live: re-searching an exact term already fetched earlier
      // in the same session (e.g. "Grove" again) does not always issue a
      // fresh network request — the app appears to serve an identical query
      // from client-side cache. Using a fragment that only appears in the
      // address (not the name) sidesteps that and still proves address-body
      // matching independently of the name-matching already covered above.
      const fragment = address.split(' ').pop(); // "18431" — unique to the address, not the name
      const res = page.waitForResponse((r) => r.url().includes(`search=${fragment}`));
      await propertiesPage.searchInput.fill(fragment);
      await res;
      await expect(propertiesPage.row(name)).toHaveCount(1);
      await expect(propertiesPage.addressCell(name)).toHaveText(address);
    });
  });

  // Confirmed real gap (see
  // Bugs/Properties/properties-search-does-not-trim-whitespace.md): unlike
  // the Landlords/Tenants search (which trims and lower-cases server-side),
  // Properties search does NOT trim leading/trailing whitespace — a term
  // with padding spaces returns zero results even though the same term
  // without padding matches correctly. Case-insensitivity alone works fine
  // (confirmed independently). This asserts the CORRECT expected behaviour
  // and is left failing intentionally until fixed, per the project's
  // known-issue convention (see tests/Dashboard/dashboard-sign-out.spec.js).
  test('search is case-insensitive and tolerates leading/trailing whitespace @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;
    const noisyTerm = `  ${name.toUpperCase()}  `;

    const res = page.waitForResponse((r) => r.url().includes('/admin/properties') && r.url().includes('search='));
    await propertiesPage.searchInput.fill(noisyTerm);
    await res;

    await expect(propertiesPage.row(name), 'Search should trim whitespace before matching, same as Landlords/Tenants').toHaveCount(1);
  });

  test('script-like search input is treated as inert text, not executed @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const payload = '<script>alert(1)</script>';
    const res = page.waitForResponse((r) => r.url().includes('/admin/properties') && r.url().includes('search='));
    await propertiesPage.searchInput.fill(payload);
    await res;

    await expect(propertiesPage.searchInput).toHaveValue(payload);
    await expect(propertiesPage.noDataHeading).toBeVisible();
    expect(dialogFired, 'A script-like search value must never trigger a JS dialog').toBe(false);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('a numeric address fragment matches the correct property @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name, address } = properties.populatedProperty;
    const numericFragment = address.match(/\d+/)[0]; // "307"

    const res = page.waitForResponse((r) => r.url().includes(`search=${numericFragment}`));
    await propertiesPage.searchInput.fill(numericFragment);
    await res;

    await expect(propertiesPage.row(name)).toHaveCount(1);
  });

  test('a non-matching search shows the "No data found" empty state @regression @critical', async ({ page }) => {
    const propertiesPage = await openProperties(page);

    const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
    await propertiesPage.searchInput.fill('zzzznotfound');
    await res;

    await expect(propertiesPage.noDataHeading).toBeVisible();
    await expect(propertiesPage.noDataText).toBeVisible();
    await expect(propertiesPage.showingText).not.toBeVisible();
  });

  test('clearing the search box restores the full unfiltered list @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
    await propertiesPage.searchInput.fill(name);
    await searchRes;
    await expect(propertiesPage.resetButton).toBeVisible();

    // Confirmed live: clearing back to the unfiltered page-1 query can be
    // served from client-side cache rather than always issuing a fresh
    // network request (same caching behaviour documented for the Reset
    // button in Landlords' equivalent test) — so this asserts the resulting
    // UI state rather than requiring a network round-trip.
    await propertiesPage.searchInput.fill('');

    await expect(propertiesPage.resetButton).not.toBeVisible();
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('Reset button clears the search and restores the unfiltered page-1 list @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
    await propertiesPage.searchInput.fill(name);
    await searchRes;
    await expect(propertiesPage.resetButton).toBeVisible();

    await propertiesPage.resetButton.click();

    await expect(propertiesPage.searchInput).toHaveValue('');
    await expect(propertiesPage.resetButton).not.toBeVisible();
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('search state does not survive a reload @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const res = page.waitForResponse((r) => r.url().includes(`search=${name}`));
    await propertiesPage.searchInput.fill(name);
    await res;
    expect(page.url()).not.toContain('search');

    await page.reload();
    await expect(propertiesPage.rows.first()).toBeVisible();
    await expect(propertiesPage.searchInput).toHaveValue('');
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
    expect(page.url()).not.toContain('search');
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

async function openLandlords(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const landlordsPage = new LandlordsPage(page);
  await landlordsPage.goto();
  await expect(landlordsPage.rows.first()).toBeVisible();
  return landlordsPage;
}

test.describe('Landlords - Search', () => {
  test('exact name, partial name, and email all match the same landlord @smoke @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name, apiName, email } = landlords.populatedLandlord;

    await test.step('exact name', async () => {
      const res = page.waitForResponse((r) => r.url().includes(`/admin/landlords?page=1&limit=20&search=${apiName}`));
      await landlordsPage.searchInput.fill(apiName);
      await res;
      await expect(landlordsPage.row(name)).toHaveCount(1);
      await expect(landlordsPage.showingText).toHaveText(/^Showing 1–1 of 1$/);
      await expect(landlordsPage.pageIndicator).toHaveText('Page 1 of 1');
      await expect(landlordsPage.previousButton).toBeDisabled();
      await expect(landlordsPage.nextButton).toBeDisabled();
    });

    await test.step('partial name', async () => {
      const partial = apiName.slice(0, 3);
      const res = page.waitForResponse((r) => r.url().includes(`search=${partial}`));
      await landlordsPage.searchInput.fill(partial);
      await res;
      await expect(landlordsPage.row(name)).toHaveCount(1);
    });

    await test.step('full email', async () => {
      const res = page.waitForResponse((r) => r.url().includes('search='));
      await landlordsPage.searchInput.fill(email);
      await res;
      await expect(landlordsPage.row(name)).toHaveCount(1);
      await expect(landlordsPage.emailCell(name)).toHaveText(email);
    });
  });

  // Backend trims/lower-cases the search term server-side; the raw
  // (untrimmed, uppercased) value is still sent as-is in the request.
  // Confirmed live.
  test('search is case-insensitive and tolerates leading/trailing whitespace @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name, apiName } = landlords.populatedLandlord;
    const noisyTerm = `  ${apiName.toUpperCase()}  `;

    const res = page.waitForResponse((r) => r.url().includes('/admin/landlords') && r.url().includes('search='));
    await landlordsPage.searchInput.fill(noisyTerm);
    await res;

    await expect(landlordsPage.row(name)).toHaveCount(1);
  });

  test('script-like search input is treated as inert text, not executed @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const payload = '<script>alert(1)</script>';
    const res = page.waitForResponse((r) => r.url().includes('/admin/landlords') && r.url().includes('search='));
    await landlordsPage.searchInput.fill(payload);
    await res;

    await expect(landlordsPage.searchInput).toHaveValue(payload);
    await expect(landlordsPage.noDataHeading).toBeVisible();
    expect(dialogFired, 'A script-like search value must never trigger a JS dialog').toBe(false);
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('a numeric fragment matches a landlord whose name contains it @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.disposableActiveLandlord; // "Maaz Landlord 398"
    const fragment = name.match(/\d+/)[0];

    const res = page.waitForResponse((r) => r.url().includes(`search=${fragment}`));
    await landlordsPage.searchInput.fill(fragment);
    await res;

    await expect(landlordsPage.row(name)).toHaveCount(1);
  });

  test('a non-matching search shows the "No data found" empty state @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
    await landlordsPage.searchInput.fill('zzzznotfound');
    await res;

    await expect(landlordsPage.noDataHeading).toBeVisible();
    await expect(landlordsPage.noDataText).toBeVisible();
    await expect(landlordsPage.showingText).not.toBeVisible();
  });

  test('Reset clears the search and restores the unfiltered page-1 list @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { apiName } = landlords.populatedLandlord;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${apiName}`));
    await landlordsPage.searchInput.fill(apiName);
    await searchRes;
    await expect(landlordsPage.resetButton).toBeVisible();

    // Confirmed live: Reset restores the already-cached unfiltered page-1
    // list locally and does not issue a new network request, so this
    // asserts on the resulting UI state rather than a network round-trip.
    await landlordsPage.resetButton.click();

    await expect(landlordsPage.searchInput).toHaveValue('');
    await expect(landlordsPage.resetButton).not.toBeVisible();
    await expect(landlordsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('searching from page 2 resets pagination back to page 1 @regression @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    await landlordsPage.nextButton.click();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    const { apiName } = landlords.populatedLandlord;
    const res = page.waitForResponse((r) => r.url().includes('/admin/landlords?page=1&limit=20') && r.url().includes(`search=${apiName}`));
    await landlordsPage.searchInput.fill(apiName);
    const searchReq = await res;

    expect(searchReq.url()).toContain('page=1');
    await expect(landlordsPage.pageIndicator).toHaveText('Page 1 of 1');
  });

  test('search state does not survive a reload @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { apiName } = landlords.populatedLandlord;

    const res = page.waitForResponse((r) => r.url().includes(`search=${apiName}`));
    await landlordsPage.searchInput.fill(apiName);
    await res;
    expect(page.url()).not.toContain('search');

    await page.reload();
    await expect(landlordsPage.rows.first()).toBeVisible();
    await expect(landlordsPage.searchInput).toHaveValue('');
    await expect(landlordsPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
    expect(page.url()).not.toContain('search');
  });
});

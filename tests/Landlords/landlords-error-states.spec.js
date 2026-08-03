import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import { LandlordDetailsPage } from '../../src/pages/LandlordDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Landlords - Error, Empty & Loading States', () => {
  // Confirmed real gap (see
  // Bugs/Landlords/landlords-details-invalid-id-generic-error.md): a
  // non-existent (but well-formed) id currently fires the underlying
  // request twice and falls back to a generic "Something went wrong"
  // screen instead of a clear "not found" message. This asserts the
  // CORRECT expected behaviour (one request, a distinct not-found message)
  // and is left failing intentionally until that's implemented, per the
  // project's known-issue convention (see
  // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no account
  // state is touched, so no cleanup is needed even while this fails.
  test('a non-existent landlord id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/landlords/${landlords.nonExistentId}`)) requestUrls.push(req.url());
    });

    const details = new LandlordDetailsPage(page);
    await details.goto(landlords.nonExistentId);

    await expect(details.loadingHeading).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('retrying a non-existent landlord id does not duplicate the request @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new LandlordDetailsPage(page);
    await details.goto(landlords.nonExistentId);
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/landlords/${landlords.nonExistentId}`)) requestUrls.push(req.url());
    });

    await details.retryButton.click();

    await expect(page).toHaveURL(new RegExp(`/landlords/${landlords.nonExistentId}$`));
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('a landlord with 0 properties/tenants shows both empty sections and matching summary counts @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = landlords.suspendedZeroCountLandlord;
    const details = new LandlordDetailsPage(page);
    await details.goto(id);

    await expect(details.summaryCardCount('Properties')).toHaveText('0');
    await expect(details.summaryCardCount('Tenants')).toHaveText('0');
    await expect(details.noPropertiesHeading).toBeVisible();
    await expect(details.noTenantsHeading).toBeVisible();
  });

  test('no console errors across load, search, pagination, view, and suspend/unsuspend @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await loginOnly(page);
    const landlordsPage = new LandlordsPage(page);
    await landlordsPage.goto();
    await expect(landlordsPage.rows.first()).toBeVisible();

    const { apiName, name: populatedName } = landlords.populatedLandlord;
    await landlordsPage.searchInput.fill(apiName);
    await expect(landlordsPage.row(populatedName)).toHaveCount(1);
    await landlordsPage.resetButton.click();
    await expect(landlordsPage.rows.first()).toBeVisible();

    await landlordsPage.nextButton.click();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
    await landlordsPage.previousButton.click();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);

    const details = await landlordsPage.viewLandlord(populatedName);
    await expect(details.nameHeading).toHaveText(populatedName);
    await details.backButton.click();
    await expect(page).toHaveURL(/\/landlords$/);

    const { name: disposableName } = landlords.disposableActiveLandlord5;
    await landlordsPage.suspendButton(disposableName).click();
    await expect(landlordsPage.statusCell(disposableName)).toHaveText('Suspended');
    await landlordsPage.unsuspendButton(disposableName).click();
    await expect(landlordsPage.statusCell(disposableName)).toHaveText('Active');

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });

  test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
    // Fresh context with no stored session, unlike every other test here.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/landlords');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('table')).not.toBeVisible();

    const { id } = landlords.populatedLandlord;
    await page.goto(`/landlords/${id}`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText(landlords.populatedLandlord.email)).not.toBeVisible();

    await context.close();
  });
});

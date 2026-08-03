import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantsPage } from '../../src/pages/TenantsPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Tenants - Error, Empty & Loading States', () => {
  // Confirmed real gap, same shared root cause as
  // Bugs/Landlords/landlords-details-invalid-id-generic-error.md: a
  // non-existent (but well-formed) id fires the underlying request twice and
  // falls back to a generic "Something went wrong" screen instead of a clear
  // "not found" message. This asserts the CORRECT expected behaviour (one
  // request, a distinct not-found message) and is left failing intentionally
  // until that's implemented, per the project's known-issue convention (see
  // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no account
  // state is touched, so no cleanup is needed even while this fails.
  test('a non-existent tenant id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/tenants/${tenants.nonExistentId}`)) requestUrls.push(req.url());
    });

    const details = new TenantDetailsPage(page);
    await details.goto(tenants.nonExistentId);

    await expect(details.loadingHeading).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('retrying a non-existent tenant id does not duplicate the request @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.nonExistentId);
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/tenants/${tenants.nonExistentId}`)) requestUrls.push(req.url());
    });

    await details.retryButton.click();

    await expect(page).toHaveURL(new RegExp(`/tenants/${tenants.nonExistentId}$`));
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('a tenant with no documents and no pets shows both empty states together @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.sparseTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.sparseTenant.name);

    await expect(details.documentSubsection('Identity Document')).toHaveText('—');
    await expect(details.documentSubsection('Renters Insurance')).toHaveText('—');
    await expect(details.noPetsText).toBeVisible();
  });

  test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
    // Fresh context with no stored session, unlike every other test here.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/tenants');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('table')).not.toBeVisible();

    const { id } = tenants.richProfileTenant;
    await page.goto(`/tenants/${id}`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText(tenants.richProfileTenant.email)).not.toBeVisible();

    await context.close();
  });

  // Exercises listing load, search, status filter, pagination, view, and the
  // Documents preview dialog together. The dialog's "Missing Description"
  // console warning (see tenants-detail-documents.spec.js) is confirmed
  // benign and is the only expected console output — explicitly allowed for
  // here rather than asserting zero warnings outright.
  test('no unexpected console errors across load, search, filter, pagination, view, and document preview @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const consoleWarnings = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await loginOnly(page);
    const tenantsPage = new TenantsPage(page);
    await tenantsPage.goto();
    await expect(tenantsPage.rows.first()).toBeVisible();

    const { email } = tenants.sparseTenant;
    await tenantsPage.searchInput.fill(email);
    await expect(tenantsPage.rows).toHaveCount(1);
    await tenantsPage.resetButton.click();
    await expect(tenantsPage.rows.first()).toBeVisible();

    await tenantsPage.statusSelect.selectOption('ACTIVE');
    await expect(tenantsPage.rows.first()).toBeVisible();
    await tenantsPage.resetButton.click();
    await expect(tenantsPage.rows.first()).toBeVisible();

    await tenantsPage.nextButton.click();
    await expect(tenantsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
    await tenantsPage.previousButton.click();
    await expect(tenantsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);

    // Search first — "Maaz Tenant" is a substring of several disposable
    // tenants' names too, so viewing by name alone would be ambiguous.
    await tenantsPage.searchInput.fill(tenants.richProfileTenant.email);
    await expect(tenantsPage.rows).toHaveCount(1);
    const details = await tenantsPage.viewTenant(tenants.richProfileTenant.name);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);
    await details.documentButton('IMG_0692.png').click();
    await expect(details.dialog).toBeVisible();
    await details.dialogCloseButton.click();
    await expect(details.dialog).not.toBeVisible();
    await details.backButton.click();
    await expect(page).toHaveURL(/\/tenants$/);

    const unexpectedWarnings = consoleWarnings.filter((w) => !w.includes('Missing `Description`'));

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(unexpectedWarnings, `Unexpected console warnings: ${unexpectedWarnings.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
});

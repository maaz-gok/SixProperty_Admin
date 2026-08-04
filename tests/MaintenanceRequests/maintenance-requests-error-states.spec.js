import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Maintenance Requests - Error, Empty & Loading States', () => {
  // Confirmed real gap, same shared root cause as
  // Bugs/Landlords/landlords-details-invalid-id-generic-error.md: a
  // non-existent (but well-formed) id fires the detail request twice and
  // falls back to a generic "Something went wrong" screen instead of a
  // clear "not found" message. This asserts the CORRECT expected behaviour
  // and is left failing intentionally until fixed, per the project's
  // known-issue convention. Read-only — no state is touched.
  test('a non-existent request id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${requests.nonExistentId}`)) requestUrls.push(req.url());
    });

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(requests.nonExistentId);

    await expect(details.loadingHeading).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('a malformed request id shows the same "not found" gap, not a distinct 400 path @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${requests.malformedId}`)) requestUrls.push(req.url());
    });

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(requests.malformedId);

    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('retrying a non-existent request id does not duplicate the request @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(requests.nonExistentId);
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${requests.nonExistentId}`)) requestUrls.push(req.url());
    });

    await details.retryButton.click();

    await expect(page).toHaveURL(new RegExp(`/maintenance-requests/${requests.nonExistentId}$`));
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
    // Fresh context with no stored session, unlike every other test here.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/maintenance-requests');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('table')).not.toBeVisible();

    const { id, title } = requests.resolvedNoAttachments;
    await page.goto(`/maintenance-requests/${id}`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: title })).not.toBeVisible();

    await context.close();
  });
});

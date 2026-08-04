import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Properties - Error, Empty & Loading States', () => {
  // Confirmed real gap, same root cause as
  // Bugs/Landlords/landlords-details-invalid-id-generic-error.md
  // (reproduced live for Properties too — see specs/properties-management.md
  // Feature Area 8, Scenario 8.6): a non-existent (but well-formed) id
  // currently fires the underlying request twice and falls back to a
  // generic "Something went wrong" screen instead of a clear "not found"
  // message. This asserts the CORRECT expected behaviour (one request, a
  // distinct not-found message) and is left failing intentionally until
  // that's implemented, per the project's known-issue convention (see
  // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no state is
  // touched, so no cleanup is needed even while this fails.
  test('a non-existent property id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/properties/${properties.nonExistentId}`)) requestUrls.push(req.url());
    });

    const details = new PropertyDetailsPage(page);
    await details.goto(properties.nonExistentId);

    await expect(details.loadingHeading).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  // Same shared bug reproduces identically for a syntactically malformed id
  // (not a valid ObjectId shape) — confirmed live there is no separate
  // 400-style path. See specs/properties-management.md's "Confirmed live
  // structure" notes.
  test('a malformed property id shows the same "not found" gap, not a distinct 400 path @regression', async ({ page }) => {
    await loginOnly(page);

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/properties/${properties.malformedId}`)) requestUrls.push(req.url());
    });

    const details = new PropertyDetailsPage(page);
    await details.goto(properties.malformedId);

    await expect(
      page.getByRole('heading', { name: /not found/i }),
      'Expected a distinct "not found" message, not the generic "Something went wrong" error'
    ).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('retrying a non-existent property id does not duplicate the request @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new PropertyDetailsPage(page);
    await details.goto(properties.nonExistentId);
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/properties/${properties.nonExistentId}`)) requestUrls.push(req.url());
    });

    await details.retryButton.click();

    await expect(page).toHaveURL(new RegExp(`/properties/${properties.nonExistentId}$`));
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
    expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
    // Fresh context with no stored session, unlike every other test here.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/properties');
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('table')).not.toBeVisible();

    const { id, address } = properties.populatedProperty;
    await page.goto(`/properties/${id}`);
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText(address)).not.toBeVisible();

    await context.close();
  });
});

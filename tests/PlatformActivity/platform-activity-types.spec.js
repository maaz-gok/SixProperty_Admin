import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import activity from '../data/platform-activity.json' with { type: 'json' };

async function openActivity(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const activityPage = new PlatformActivityPage(page);
  await activityPage.goto();
  await expect(activityPage.rows.first()).toBeVisible();
  return activityPage;
}

async function findRowByPaging(page, activityPage, messageSubstring, maxPages = 15) {
  for (let i = 0; i < maxPages; i += 1) {
    if (await activityPage.row(messageSubstring).count() > 0) {
      return activityPage.row(messageSubstring);
    }
    if (!(await activityPage.nextButton.isEnabled())) break;
    const res = page.waitForResponse((r) => r.url().includes('/admin/activity/feed'));
    await activityPage.nextButton.click();
    await res;
  }
  return activityPage.row(messageSubstring);
}

test.describe('Platform Activity - Activity Types', () => {
  test('"Sign Up" badge renders identically for tenant, landlord, and admin sign-ups @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    // Assert on each row immediately after finding it, before searching
    // for the next one — `findRowByPaging` may navigate forward (the admin
    // fixture lives on page 8), and a Playwright locator is a live query,
    // not a snapshot: once the page has moved on, an earlier row's locator
    // silently re-resolves against the new page and finds nothing.
    const tenantRow = await findRowByPaging(page, activityPage, activity.signUpTenantExample.message);
    await expect(tenantRow.getByRole('cell').nth(0)).toHaveText('Sign Up');
    await expect(tenantRow.getByRole('cell').nth(1)).toHaveText('New tenant');

    const landlordRow = await findRowByPaging(page, activityPage, activity.signUpLandlordExample.message);
    await expect(landlordRow.getByRole('cell').nth(0)).toHaveText('Sign Up');
    await expect(landlordRow.getByRole('cell').nth(1)).toHaveText('New landlord');

    // Confirmed live: the Title column, not the Type badge, is what
    // differentiates tenant/landlord/admin sign-ups.
    const adminRow = await findRowByPaging(page, activityPage, activity.adminSignupGrammarBug.message);
    await expect(adminRow.getByRole('cell').nth(0)).toHaveText('Sign Up');
    await expect(adminRow.getByRole('cell').nth(1)).toHaveText('New admin');
  });

  test('"Rent Paid" badge and dollar-amount formatting @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message } = activity.rentPaidExample;
    const row = await findRowByPaging(page, activityPage, message);

    await expect(row.getByRole('cell').nth(0)).toHaveText('Rent Paid');
    await expect(row.getByRole('cell').nth(1)).toHaveText('Rent paid');
    await expect(row.getByRole('cell').nth(3)).toHaveText(/paid \$\d+ in rent\.$/);
  });

  // Confirmed live: the API's `type: "maintenance_request"` renders as
  // exactly "Maintenance" — NOT "Maintenance Request", which a naive
  // split-and-titlecase transform of the enum would produce. This
  // precisely pins the confirmed (non-obvious) label.
  test('"Maintenance" badge text is exactly "Maintenance", not "Maintenance Request" @regression @critical', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message } = activity.maintenanceRequestExample;
    const row = await findRowByPaging(page, activityPage, message);

    await expect(row.getByRole('cell').nth(0)).toHaveText('Maintenance');
  });

  test('each activity type has a visually distinct badge colour @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    // Read each row's badge colour immediately after finding it, before
    // paging forward to find the next one — same live-locator staleness
    // reason as the test above.
    const signUpRow = await findRowByPaging(page, activityPage, activity.signUpTenantExample.message);
    const signUpColour = await signUpRow.getByRole('cell').nth(0).locator('span, div').first().evaluate((el) => getComputedStyle(el).backgroundColor);

    const rentPaidRow = await findRowByPaging(page, activityPage, activity.rentPaidExample.message);
    const rentPaidColour = await rentPaidRow.getByRole('cell').nth(0).locator('span, div').first().evaluate((el) => getComputedStyle(el).backgroundColor);

    const maintenanceRow = await findRowByPaging(page, activityPage, activity.maintenanceRequestExample.message);
    const maintenanceColour = await maintenanceRow.getByRole('cell').nth(0).locator('span, div').first().evaluate((el) => getComputedStyle(el).backgroundColor);

    const colours = [signUpColour, rentPaidColour, maintenanceColour];
    const uniqueColours = new Set(colours);
    expect(uniqueColours.size, `Expected 3 distinct badge colours, got: ${colours.join(', ')}`).toBe(3);
  });

  test('no unrecognized activity type appears in the current dataset @regression', async ({ page }) => {
    await openActivity(page);

    const token = await page.evaluate(() => JSON.parse(localStorage.getItem('token')));
    const knownTypes = new Set();
    let currentPage = 1;
    let totalPages = 1;
    do {
      const res = await page.request.get(`https://api.six-property.clienturl.net/admin/activity/feed?page=${currentPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      body.data.items.forEach((i) => knownTypes.add(i.type));
      totalPages = body.data.pagination.totalPages;
      currentPage += 1;
    } while (currentPage <= totalPages);

    const allowed = new Set(['user_signup', 'rent_paid', 'maintenance_request']);
    for (const t of knownTypes) {
      expect(allowed.has(t), `Unrecognized activity type found: ${t}`).toBe(true);
    }
  });
});

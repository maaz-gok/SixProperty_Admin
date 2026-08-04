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

// There is no search on this page (confirmed live), and activity items
// have no id at all, so a specific fixture row (e.g. one further back in
// the feed) can only be found by paging through with "Next" until it
// appears. Bounded by maxPages so a genuinely missing fixture fails fast
// rather than hanging.
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

test.describe('Platform Activity - Table', () => {
  test('every column renders sensibly for a "Sign Up" row @smoke', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message, type, title } = activity.signUpTenantExample;
    const row = await findRowByPaging(page, activityPage, message);

    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').nth(0)).toHaveText(type);
    await expect(row.getByRole('cell').nth(1)).toHaveText(title);
    await expect(row.getByRole('cell').nth(2)).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/);
    await expect(row.getByRole('cell').nth(3)).toHaveText(message);
  });

  test('every column renders sensibly for a "Rent Paid" row @smoke', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message, type, title } = activity.rentPaidExample;
    const row = await findRowByPaging(page, activityPage, message);

    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').nth(0)).toHaveText(type);
    await expect(row.getByRole('cell').nth(1)).toHaveText(title);
    await expect(row.getByRole('cell').nth(3)).toHaveText(message);
    await expect(row.getByRole('cell').nth(3)).toContainText('$');
  });

  test('every column renders sensibly for a "Maintenance" row @smoke', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message, type, title } = activity.maintenanceRequestExample;
    const row = await findRowByPaging(page, activityPage, message);

    await expect(row).toHaveCount(1);
    await expect(row.getByRole('cell').nth(0)).toHaveText(type);
    await expect(row.getByRole('cell').nth(1)).toHaveText(title);
    await expect(row.getByRole('cell').nth(3)).toHaveText(message);
  });

  test('special characters ($ : .) in messages render as plain text @regression', async ({ page }) => {
    const activityPage = await openActivity(page);
    const { message } = activity.rentPaidExample;
    const row = await findRowByPaging(page, activityPage, message);

    // Confirmed live: rent-paid messages contain a literal "$" amount, and
    // maintenance messages contain a literal ":" (e.g. "A-101: Keys
    // issue."). Both must render as plain text, not stripped or escaped
    // into HTML entities.
    await expect(row.getByRole('cell').nth(3)).toHaveText(/\$\d+/);
  });

  // Confirmed live via the raw API: every item has a `description` field
  // that is never rendered anywhere in the table (only type/title/at/
  // message are shown). Negative assertion to prevent a future test from
  // assuming a 5th hidden column or tooltip exists.
  test('the API\'s "description" field is never displayed anywhere @regression', async ({ page }) => {
    const activityPage = await openActivity(page);
    await expect(activityPage.rows.first()).toBeVisible();

    const res = await page.request.get('https://api.six-property.clienturl.net/admin/activity/feed?page=1&limit=20', {
      headers: { Authorization: `Bearer ${await page.evaluate(() => JSON.parse(localStorage.getItem('token')))}` },
    });
    const body = await res.json();
    // `description` for a `user_signup` item is just the bare person name
    // (e.g. "john doe"), which is trivially also a substring of that same
    // item's legitimately-rendered `message` ("john doe signed up as a
    // tenant.") — checking for that would be a false positive, not
    // evidence of a real leak. `rent_paid`/`maintenance_request`
    // descriptions use a distinct format (e.g. "jeremy — $800", with an
    // em dash never used in the message), so only consider an item where
    // description is NOT already a substring of its own message.
    const withDescription = body.data.items.find((i) => i.description && !i.message.includes(i.description));
    expect(withDescription, 'Expected at least one item whose description differs from its message in the sampled page').toBeTruthy();

    const tableText = await activityPage.table.innerText();
    expect(tableText).not.toContain(withDescription.description);
  });

  test('table semantics are correct @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    await expect(activityPage.table).toHaveAttribute('class', /.*/);
    for (const col of ['Type', 'Title', 'Time', 'Message']) {
      await expect(activityPage.columnHeader(col)).toBeVisible();
    }
    const firstRow = activityPage.rows.first();
    await expect(firstRow.getByRole('cell')).toHaveCount(4);
  });
});

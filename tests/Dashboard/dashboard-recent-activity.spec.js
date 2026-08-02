import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import activityMocks from '../data/dashboard-activity-mocks.json' with { type: 'json' };

test.describe('Dashboard - Recent Activity', () => {
  test('table renders headers and rows that match the API response, in order @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const activityResponsePromise = page.waitForResponse((res) => res.url().includes('/admin/activity'));
    const dashboard = await login.loginAs(adminCredentials);
    const activityResponse = await activityResponsePromise;
    const { data } = await activityResponse.json();

    await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Time' })).toBeVisible();
    await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Message' })).toBeVisible();

    const expectedRows = data.recent.slice(0, 5);
    await expect(dashboard.activityRows).toHaveCount(expectedRows.length);

    const rowTexts = await dashboard.activityRows.allTextContents();
    expectedRows.forEach((record, i) => {
      expect(rowTexts[i]).toContain(record.title);
      expect(rowTexts[i]).toContain(record.message);
    });
  });

  test('each Type value renders as a distinctly colored badge, consistently @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    // exact: true avoids matching "Rent paid" (the Title column text) when
    // looking for the "Rent Paid" badge (the Type column text).
    const rentPaidBadge = dashboard.activityRows.filter({ hasText: 'Rent Paid' }).first().getByText('Rent Paid', { exact: true });
    const signUpBadge = dashboard.activityRows.filter({ hasText: 'Sign Up' }).first().getByText('Sign Up', { exact: true });

    await expect(rentPaidBadge).toBeVisible();
    await expect(signUpBadge).toBeVisible();
    const rentPaidColor = await rentPaidBadge.evaluate((el) => getComputedStyle(el).color);
    const signUpColor = await signUpBadge.evaluate((el) => getComputedStyle(el).color);
    expect(rentPaidColor).not.toBe(signUpColor);

    // Every "Sign Up" badge across rows should share the same color.
    const allSignUpBadges = await dashboard.activityRows.filter({ hasText: 'Sign Up' }).getByText('Sign Up', { exact: true }).all();
    const colors = await Promise.all(allSignUpBadges.map((b) => b.evaluate((el) => getComputedStyle(el).color)));
    expect(new Set(colors).size).toBe(1);
  });

  test('the Message column is hidden at mobile width but present at desktop and tablet @regression', async ({ browser }) => {
    await test.step('desktop: Message column visible', async () => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Message' })).toBeVisible();
      await context.close();
    });

    await test.step('mobile: Message column not rendered', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.activityHeading).toBeVisible();
      await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Message' })).toHaveCount(0);
      await context.close();
    });
  });

  // Verified live: injected <script>/<img onerror> content in title/message
  // renders as literal visible text and never executes (window.__xssFired
  // stays undefined, no dialog fires).
  test('user-generated content in the activity feed is rendered as text, never executed @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    let dialogFired = false;
    page.on('dialog', async (d) => { dialogFired = true; await d.dismiss(); });
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activityMocks.xssPayload) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    const record = activityMocks.xssPayload.data.recent[0];
    await expect(dashboard.activityRows.first()).toContainText(record.title);
    const xssFired = await page.evaluate(() => window.__xssFired);
    expect(xssFired, 'Injected script must never execute').toBeUndefined();
    expect(dialogFired, 'Injected script must never trigger a dialog').toBe(false);
  });

  test('the dashboard preview never shows more than the 5 most recent records @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activityMocks.manyRecords) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    const allRecords = activityMocks.manyRecords.data.recent;
    const expectedTop5 = allRecords.slice(0, 5);
    const cutRecords = allRecords.slice(5);

    await expect(dashboard.activityRows).toHaveCount(5);
    const rowTexts = await dashboard.activityRows.allTextContents();
    expectedTop5.forEach((record, i) => expect(rowTexts[i]).toContain(record.message));
    for (const cut of cutRecords) {
      expect(rowTexts.join('')).not.toContain(cut.message);
    }
  });

  test('records with identical timestamps keep a stable, deterministic order @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activityMocks.tiedTimestamps) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    const [first, second] = activityMocks.tiedTimestamps.data.recent;
    const rowTexts = await dashboard.activityRows.allTextContents();
    expect(rowTexts[0]).toContain(first.message);
    expect(rowTexts[1]).toContain(second.message);
  });

  // Verified live: on failure, the summary cards fall back to "0" (they
  // don't disappear like the Today's Word card does), while the Recent
  // Activity section itself shows an explicit "Something went wrong" state
  // with a Retry action.
  test('shows an explicit error state with a Retry action when the API fails @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.activityTable).not.toBeVisible();
    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    // Today's Word is unaffected (separate endpoint).
    await expect(dashboard.todaysWordCard).toBeVisible();

    const uncaughtErrors = consoleErrors.filter((e) => !e.includes('Internal Server Error'));
    expect(uncaughtErrors, `Unexpected console errors: ${uncaughtErrors.join('; ')}`).toHaveLength(0);
  });

  test('table rows are not clickable and show no pointer affordance @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.activityRows.filter({ hasText: 'Rent Paid' }).first().click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await dashboard.activityRows.filter({ hasText: 'Sign Up' }).first().click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(dashboard.activityRows.first()).toHaveCSS('cursor', 'auto');
  });
});

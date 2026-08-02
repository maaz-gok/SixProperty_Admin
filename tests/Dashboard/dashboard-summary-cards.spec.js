import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import activityMocks from '../data/dashboard-activity-mocks.json' with { type: 'json' };

const CARD_LABELS = ['Landlords', 'Tenants', 'Properties', 'Open Requests', 'Resolved Requests', 'Suspended Users'];

test.describe('Dashboard - Summary Cards', () => {
  test('all six cards render with an icon, label, and numeric count @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    for (const label of CARD_LABELS) {
      const card = dashboard.summaryCard(label);
      await expect(card).toBeVisible();
      await expect(dashboard.summaryCardBox(label).locator('svg')).toBeVisible();
      // Cards show an em-dash placeholder until /admin/activity resolves
      // (see the loading-state test below); wait past it before reading.
      await expect(dashboard.summaryCardCount(label)).not.toHaveText('—');
      const countText = await dashboard.summaryCardCount(label).innerText();
      expect(Number.isInteger(Number(countText.replace(/,/g, ''))), `"${label}" count should be numeric, got "${countText}"`).toBe(true);
      expect(Number(countText.replace(/,/g, ''))).toBeGreaterThanOrEqual(0);
    }
  });

  test('all six cards share consistent height @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const heights = [];
    for (const label of CARD_LABELS) {
      const box = await dashboard.summaryCardBox(label).boundingBox();
      heights.push(box.height);
    }
    const [first, ...rest] = heights;
    for (const h of rest) {
      expect(Math.abs(h - first)).toBeLessThanOrEqual(1);
    }
  });

  test('cards arrange 2-per-row on desktop and stack 1-per-row on mobile @regression', async ({ browser }) => {
    await test.step('desktop: 2 per row', async () => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.heading).toBeVisible();

      const landlordsBox = await dashboard.summaryCardBox('Landlords').boundingBox();
      const tenantsBox = await dashboard.summaryCardBox('Tenants').boundingBox();
      expect(Math.abs(landlordsBox.y - tenantsBox.y)).toBeLessThanOrEqual(2);
      await context.close();
    });

    await test.step('mobile: 1 per row', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const login = new LoginPage(page);
      await login.goto();
      const dashboard = await login.loginAs(adminCredentials);
      await expect(dashboard.heading).toBeVisible();

      const landlordsBox = await dashboard.summaryCardBox('Landlords').boundingBox();
      const tenantsBox = await dashboard.summaryCardBox('Tenants').boundingBox();
      expect(tenantsBox.y).toBeGreaterThan(landlordsBox.y + landlordsBox.height - 2);
      await context.close();
    });
  });

  test('cards are not clickable and show no pointer affordance @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await dashboard.summaryCard('Landlords').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await dashboard.summaryCard('Open Requests').click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(dashboard.summaryCardBox('Landlords')).toHaveCSS('cursor', 'auto');
  });

  test('large counts render fully with thousands separators and no overflow @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activityMocks.largeCounts) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    const { summary } = activityMocks.largeCounts.data;
    await expect(dashboard.summaryCardCount('Landlords')).toHaveText(summary.landlords.toLocaleString('en-US'));

    const box = await dashboard.summaryCardBox('Landlords').boundingBox();
    const hasOverflow = await dashboard.summaryCardBox('Landlords').evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(hasOverflow, 'Card should not overflow its own bounds with a large formatted number').toBe(false);
    expect(box.width).toBeGreaterThan(0);
  });

  // A missing field in `summary` is the only realistic "partial failure" here
  // since all 6 cards + Recent Activity share one API call (GET
  // /admin/activity) — there is no separate per-card endpoint to fail
  // independently. Verified live: a missing field renders as "0", not
  // "undefined" or a blank card.
  test('a missing summary field renders as 0 rather than breaking the card @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(activityMocks.partialSummary) })
    );
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.summaryCard('Suspended Users')).toBeVisible();
    await expect(dashboard.summaryCardCount('Suspended Users')).toHaveText('0');
    await expect(dashboard.summaryCardCount('Landlords')).toHaveText('86');
  });

  // Verified live: while /admin/activity is in flight, each card shows an
  // em dash (U+2014) placeholder rather than "0" or blank, and the Recent
  // Activity section shows an explicit "Loading" state.
  test('cards show a placeholder, not a flash of 0, while data is loading @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/admin/activity', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    for (const label of CARD_LABELS) {
      await expect(dashboard.summaryCardCount(label)).toHaveText('—');
    }
    await expect(dashboard.summaryCardCount('Landlords')).toHaveText('86', { timeout: 5000 });
  });
});

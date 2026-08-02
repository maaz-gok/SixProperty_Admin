import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import wordMocks from '../data/dashboard-word-mocks.json' with { type: 'json' };

test.describe("Dashboard - Today's Word Card", () => {
  test('card displays the word and date exactly as returned by the API @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const wordResponsePromise = page.waitForResponse((res) => res.url().includes('/game/admin/word'));
    const dashboard = await login.loginAs(adminCredentials);
    const wordResponse = await wordResponsePromise;
    const { data } = await wordResponse.json();

    await expect(dashboard.todaysWordCard).toBeVisible();
    await expect(dashboard.todaysWordCard.getByText("Today's Wordle Word")).toBeVisible();
    await expect(dashboard.wordTiles).toHaveCount(data.length);

    const tileText = await dashboard.wordTiles.allTextContents();
    expect(tileText.join('').toUpperCase()).toBe(data.word.toUpperCase());

    const expectedDate = new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    await expect(dashboard.todaysWordCard).toContainText(expectedDate);
  });

  test('card remains readable at desktop, tablet, and mobile widths @regression', async ({ browser }) => {
    for (const [name, viewport] of Object.entries({
      desktop: { width: 1280, height: 800 },
      tablet: { width: 820, height: 1180 },
      mobile: { width: 390, height: 844 },
    })) {
      await test.step(name, async () => {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        const login = new LoginPage(page);
        await login.goto();
        const dashboard = await login.loginAs(adminCredentials);
        await expect(dashboard.todaysWordCard).toBeVisible();
        await expect(dashboard.wordTiles).toHaveCount(5);
        for (const tile of await dashboard.wordTiles.all()) {
          await expect(tile).toBeInViewport();
        }
        await context.close();
      });
    }
  });

  // Verified live: on failure the card is silently omitted from the DOM
  // entirely rather than showing an inline error/empty state. That's a real
  // UX gap (a failed widget disappears with no user-visible indication) —
  // flagged for the report rather than asserted as "correct" behaviour.
  test('card is omitted (not shown with a broken state) and the rest of the dashboard is unaffected when the word API fails @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/game/admin/word', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.wordTiles).toHaveCount(0);
    // The rest of the dashboard is unaffected since summary cards / activity
    // come from a separate endpoint (/admin/activity).
    await expect(dashboard.summaryCard('Landlords')).toBeVisible();
    await expect(dashboard.activityRows.first()).toBeVisible();

    const uncaughtErrors = consoleErrors.filter((e) => !e.includes('Internal Server Error'));
    expect(uncaughtErrors, `Unexpected console errors: ${uncaughtErrors.join('; ')}`).toHaveLength(0);
  });

  test('displays exactly the date returned by the API, not a client-computed date @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/game/admin/word', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wordMocks.duplicateLetters) })
    );

    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    const expectedDate = new Date(wordMocks.duplicateLetters.data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    await expect(dashboard.todaysWordCard).toContainText(expectedDate);
  });

  test('renders every tile independently for a word with duplicate letters @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/game/admin/word', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wordMocks.duplicateLetters) })
    );

    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(adminCredentials.password);
    await login.submit();
    const dashboard = new DashboardPage(page);
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.wordTiles).toHaveCount(wordMocks.duplicateLetters.data.length);
    const tileText = await dashboard.wordTiles.allTextContents();
    expect(tileText.join('').toUpperCase()).toBe(wordMocks.duplicateLetters.data.word.toUpperCase());
  });
});

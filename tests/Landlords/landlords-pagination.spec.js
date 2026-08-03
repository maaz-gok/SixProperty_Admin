import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

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

test.describe('Landlords - Pagination', () => {
  test('Previous/Next behave correctly across all pages and data changes each time @smoke @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    await expect(landlordsPage.previousButton).toBeDisabled();
    await expect(landlordsPage.nextButton).toBeEnabled();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 1 of (\d+)$/);

    const page1Names = await landlordsPage.nameCells.allTextContents();

    // Advance through every page, confirming the row data changes each time
    // and "Next" eventually disables on the last page.
    const seenPages = [page1Names];
    let guard = 0;
    while (await landlordsPage.nextButton.isEnabled() && guard < 20) {
      const beforeIndicator = await landlordsPage.pageIndicator.textContent();
      const before = await landlordsPage.nameCells.allTextContents();
      await landlordsPage.nextButton.click();
      // Wait for the page indicator itself to change before reading row
      // data — the old rows stay visible/mounted while the next page's
      // data is still in flight, so "rows visible" alone doesn't prove
      // the table has actually updated.
      await expect(landlordsPage.pageIndicator).not.toHaveText(beforeIndicator);
      const after = await landlordsPage.nameCells.allTextContents();
      expect(after).not.toEqual(before);
      seenPages.push(after);
      guard += 1;
    }

    await expect(landlordsPage.nextButton).toBeDisabled();
    await expect(landlordsPage.previousButton).toBeEnabled();
    await expect(landlordsPage.showingText).toHaveText(/^Showing \d+–\d+ of \d+$/);

    // Walk back to page 1 and confirm the original data is restored exactly.
    for (let i = seenPages.length - 1; i > 0; i -= 1) {
      const beforeIndicator = await landlordsPage.pageIndicator.textContent();
      await landlordsPage.previousButton.click();
      await expect(landlordsPage.pageIndicator).not.toHaveText(beforeIndicator);
    }
    await expect(landlordsPage.previousButton).toBeDisabled();
    const restoredPage1Names = await landlordsPage.nameCells.allTextContents();
    expect(restoredPage1Names).toEqual(page1Names);
  });

  test('reloading mid-pagination resets to page 1 @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    await landlordsPage.nextButton.click();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    await page.reload();
    await expect(landlordsPage.rows.first()).toBeVisible();
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    await expect(landlordsPage.previousButton).toBeDisabled();
  });
});

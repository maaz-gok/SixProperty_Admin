import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

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

test.describe('Platform Activity - Accessibility', () => {
  test('Previous and Next pagination buttons are keyboard-operable @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    await activityPage.nextButton.focus();
    await expect(activityPage.nextButton).toBeFocused();
    const res = page.waitForResponse((r) => r.url().includes('page=2'));
    await page.keyboard.press('Enter');
    await res;

    await expect(activityPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
  });

  test('table semantics and column headers are screen-reader friendly @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    for (const col of ['Type', 'Title', 'Time', 'Message']) {
      const header = activityPage.columnHeader(col);
      await expect(header).toBeVisible();
      await expect(header).toHaveAccessibleName(col);
    }
    await expect(activityPage.rows.first().getByRole('cell')).toHaveCount(4);
  });

  test('pagination buttons expose their disabled state to assistive technology, not just visually @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    // On page 1, Previous must be disabled — confirmed both visually and
    // via the accessibility-relevant `disabled` attribute, not merely a
    // greyed-out CSS class.
    await expect(activityPage.previousButton).toBeDisabled();
    await expect(activityPage.previousButton).toHaveAttribute('disabled', '');
  });
});

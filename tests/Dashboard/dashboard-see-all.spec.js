import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - See All Button', () => {
  test('is visible with a pointer cursor and navigates to Platform Activity via click and keyboard @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.seeAllLink).toBeVisible();
    await expect(dashboard.seeAllLink).toHaveCSS('cursor', 'pointer');

    await dashboard.seeAllLink.click();
    await expect(page).toHaveURL(/\/activity$/);

    await dashboard.goto();
    await dashboard.seeAllLink.focus();
    await expect(dashboard.seeAllLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/activity$/);
  });
});

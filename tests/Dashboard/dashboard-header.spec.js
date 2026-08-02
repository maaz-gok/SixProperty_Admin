import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Header', () => {
  test('title, description, and top-right avatar block are all present @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.description).toBeVisible();
    await expect(dashboard.headerAvatarName).toBeVisible();
    await expect(dashboard.headerAvatarName).toHaveText('Admin');

    // Heading/description sit above the Today's Word card in reading order.
    const headingBox = await dashboard.heading.boundingBox();
    const cardBox = await dashboard.todaysWordCard.boundingBox();
    expect(headingBox.y).toBeLessThan(cardBox.y);
  });

  test('the admin email remains accessible even when visually truncated @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    // profileLink's accessible name includes the full, untruncated email
    // regardless of how the visible text is clipped with CSS ellipsis. The
    // email contains a literal "+", which must be escaped before use in a
    // RegExp (it's otherwise interpreted as a quantifier).
    const escapedEmail = adminCredentials.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(dashboard.profileLink).toHaveAccessibleName(new RegExp(escapedEmail));
  });
});

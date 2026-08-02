import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Dashboard - Extreme Viewport & Zoom', () => {
  // Playwright has no direct "browser zoom" API; a proportionally reduced
  // viewport produces the same CSS reflow constraints as zooming in, which
  // is what this scenario is actually checking (WCAG 1.4.10 reflow).
  // Verified live: 640px width is below this app's mobile breakpoint (the
  // same collapsed-by-default sidebar behaviour seen at 390px in
  // dashboard-sidebar-collapse.spec.js), so sidebar links are legitimately
  // off-screen here — that's correct responsive behaviour, not a reflow
  // failure, and isn't asserted as visible.
  test('remains usable at a 200%-zoom-equivalent viewport @regression', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 640, height: 400 } });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);

    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.headerSidebarToggle).toBeVisible();
    await expect(dashboard.headerSidebarToggle).toBeEnabled();
    await expect(dashboard.seeAllLink).toBeVisible();
    await expect(dashboard.summaryCard('Landlords')).toBeVisible();

    await dashboard.headerSidebarToggle.click();
    await expect(dashboard.landlordsLink).toBeInViewport();
    await context.close();
  });

  test('mobile landscape orientation renders without horizontal overflow @regression', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 844, height: 390 } });
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.summaryCard('Landlords')).toBeVisible();
    await expect(dashboard.activityRows.first()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Verified live (3x repeated) at 844x390: the Message column IS present
    // here, unlike portrait mobile (390x844) where it's dropped — the extra
    // width in landscape is enough to keep it, consistent with 7.3's note
    // that landscape may restore it.
    await expect(dashboard.activityTable.getByRole('columnheader', { name: 'Message' })).toBeVisible();

    await context.close();
  });
});

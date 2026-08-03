import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import { LandlordDetailsPage } from '../../src/pages/LandlordDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

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

test.describe('Landlords - Accessibility', () => {
  // Confirmed live: "View" is an icon-only button whose accessible name
  // comes from `aria-label="View"` (no visible text), so getByRole still
  // resolves it correctly. Scoped to the first row's actions rather than
  // every row, mirroring DashboardPage's sidebar-only tab-order test — no
  // dialogs exist anywhere in this flow to trap focus (see
  // Bugs/Landlords/landlords-suspend-no-confirmation.md).
  test('search box and the first row\'s actions are reachable in a logical tab order @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.populatedLandlord;

    await landlordsPage.searchInput.focus();
    await expect(landlordsPage.searchInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(landlordsPage.viewButton(name)).toBeFocused();

    await page.keyboard.press('Tab');
    // Whichever action button the first row has (Suspend or Unsuspend).
    const isSuspended = await landlordsPage.statusCell(name).innerText().then((t) => t === 'Suspended');
    const secondButton = isSuspended ? landlordsPage.unsuspendButton(name) : landlordsPage.suspendButton(name);
    await expect(secondButton).toBeFocused();
  });

  test('pagination Previous/Next are reachable and operable via keyboard @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    // "Previous" is disabled (unfocusable) on page 1, so this focuses "Next"
    // first, advances a page with it, then confirms "Previous" (now enabled)
    // is reachable too.
    await landlordsPage.nextButton.focus();
    await expect(landlordsPage.nextButton).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(landlordsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    await landlordsPage.previousButton.focus();
    await expect(landlordsPage.previousButton).toBeFocused();
  });

  test('listing and details tables expose correct table/row/columnheader/cell roles @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);

    await expect(landlordsPage.table).toBeVisible();
    await expect(landlordsPage.table.getByRole('columnheader')).toHaveCount(7);
    expect(await landlordsPage.rows.count()).toBeGreaterThan(0);
    await expect(landlordsPage.rows.first().getByRole('cell')).toHaveCount(7);

    const { id } = landlords.populatedLandlord;
    const details = new LandlordDetailsPage(page);
    await details.goto(id);

    await expect(details.propertiesTable.getByRole('columnheader')).toHaveCount(5);
    await expect(details.tenantsTable.getByRole('columnheader')).toHaveCount(7);
    expect(await details.propertiesRows.count()).toBeGreaterThan(0);
    expect(await details.tenantsRows.count()).toBeGreaterThan(0);
  });

  // No Playwright built-in contrast checker exists; this computes the WCAG
  // relative-luminance contrast ratio from the badges' actual computed
  // styles (foreground color over their semi-transparent background,
  // composited over the page's white background). Confirmed live: both
  // badges currently clear the WCAG AA threshold (4.5:1) for normal text.
  test('Active/Suspended status badges meet WCAG AA text contrast (4.5:1) @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name: activeName } = landlords.disposableActiveLandlord;
    const { name: suspendedName } = landlords.suspendedZeroCountLandlord;

    const ratios = await page.evaluate(({ activeSel, suspendedSel }) => {
      function relativeLuminance([r, g, b]) {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const channel = c / 255;
          return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function contrastRatio(fg, bg) {
        const l1 = relativeLuminance(fg) + 0.05;
        const l2 = relativeLuminance(bg) + 0.05;
        return l1 > l2 ? l1 / l2 : l2 / l1;
      }
      function ratioFor(badgeText) {
        const badge = Array.from(document.querySelectorAll('span')).find((s) => s.textContent.trim() === badgeText);
        const cs = getComputedStyle(badge);
        const [r, g, b, a] = cs.color.match(/[\d.]+/g).map(Number);
        // Alpha of the badge's own background composited over the page's white background.
        const bgAlphaMatch = cs.backgroundColor.match(/[\d.]+/g);
        const bgAlpha = bgAlphaMatch.length === 4 ? Number(bgAlphaMatch[3]) : 1;
        const compositedBg = [r, g, b].map((c) => bgAlpha * c + (1 - bgAlpha) * 255);
        return contrastRatio([r, g, b], compositedBg);
      }
      return { active: ratioFor('Active'), suspended: ratioFor('Suspended') };
    }, { activeSel: activeName, suspendedSel: suspendedName });

    expect(ratios.active, `Active badge contrast ratio was ${ratios.active}`).toBeGreaterThanOrEqual(4.5);
    expect(ratios.suspended, `Suspended badge contrast ratio was ${ratios.suspended}`).toBeGreaterThanOrEqual(4.5);
  });
});

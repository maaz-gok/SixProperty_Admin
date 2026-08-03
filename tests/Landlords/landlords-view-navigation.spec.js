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

test.describe('Landlords - View & Navigation', () => {
  test('View navigates to the correct landlord\'s details page @smoke @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name, id } = landlords.populatedLandlord;

    const details = await landlordsPage.viewLandlord(name);

    await expect(page).toHaveURL(new RegExp(`/landlords/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
    await expect(details.subtitle).toBeVisible();
  });

  test('browser Back/Forward moves correctly between listing and details @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const landlordsPage = await openLandlords(page);
    const { name } = landlords.populatedLandlord;
    const details = await landlordsPage.viewLandlord(name);
    await expect(details.nameHeading).toHaveText(name);

    await page.goBack();
    await expect(page).toHaveURL(/\/landlords$/);

    await page.goForward();
    await expect(details.nameHeading).toHaveText(name);
    await expect(details.subtitle).toBeVisible();

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('the in-app Back button returns to the listing @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.populatedLandlord;
    const details = await landlordsPage.viewLandlord(name);
    await expect(details.nameHeading).toHaveText(name);

    await details.backButton.click();
    await expect(page).toHaveURL(/\/landlords$/);
  });

  test('direct URL access to a valid landlord fires exactly one request and renders correctly @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { name, id } = landlords.populatedLandlord;
    const requests = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/landlords/${id}`)) requests.push(req.url());
    });

    const details = new LandlordDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);

    expect(requests, `Expected exactly one request for a valid id, got: ${requests.join(', ')}`).toHaveLength(1);
  });

  test('reloading the details page re-renders the same landlord @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { name, id } = landlords.populatedLandlord;
    const details = new LandlordDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/landlords/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
  });
});

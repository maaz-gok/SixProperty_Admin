import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import properties from '../data/properties.json' with { type: 'json' };

async function openProperties(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const propertiesPage = new PropertiesPage(page);
  await propertiesPage.goto();
  await expect(propertiesPage.rows.first()).toBeVisible();
  return propertiesPage;
}

test.describe('Properties - Back Navigation & Browser Behaviour', () => {
  test('in-app Back button returns to the listing @smoke', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const details = await propertiesPage.viewProperty(name);
    await details.backButton.click();

    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.rows.first()).toBeVisible();
  });

  test('browser Back and Forward round-trip between listing and details @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;
    const details = await propertiesPage.viewProperty(name);
    await expect(details.nameHeading).toHaveText(name);

    await page.goBack();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.rows.first()).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/properties\/.+/);
    await expect(details.nameHeading).toHaveText(name);

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('search box is empty after returning to the listing via Back @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
    await propertiesPage.searchInput.fill(name);
    await searchRes;

    const details = await propertiesPage.viewProperty(name);
    await details.backButton.click();

    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.searchInput).toHaveValue('');
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('direct deep link to a valid property id renders correctly with exactly one request @smoke', async ({ page }) => {
    const { id, name, address } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/properties/${id}`)) requestUrls.push(req.url());
    });

    const details = new PropertyDetailsPage(page);
    await details.goto(id);

    await expect(details.nameHeading).toHaveText(name);
    await expect(details.addressSubtitle).toHaveText(address);
    expect(requestUrls).toHaveLength(1);
  });

  test('refresh on the details page re-renders identical data @regression', async ({ page }) => {
    const { id, name } = properties.populatedProperty;
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const details = new PropertyDetailsPage(page);
    await details.goto(id);
    await expect(details.nameHeading).toHaveText(name);

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/properties/${id}$`));
    await expect(details.nameHeading).toHaveText(name);
  });

  test('refresh on the listing page re-renders the unfiltered page-1 list @regression', async ({ page }) => {
    const propertiesPage = await openProperties(page);

    await page.reload();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(propertiesPage.rows.first()).toBeVisible();
    await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  });

  test('no console errors across load, search, view, and back navigation @regression @critical', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const propertiesPage = await openProperties(page);
    const { name } = properties.populatedProperty;

    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
    await propertiesPage.searchInput.fill(name);
    await searchRes;
    await expect(propertiesPage.row(name)).toHaveCount(1);

    await propertiesPage.resetButton.click();
    await expect(propertiesPage.rows.first()).toBeVisible();

    const details = await propertiesPage.viewProperty(name);
    await expect(details.nameHeading).toHaveText(name);
    await details.backButton.click();
    await expect(page).toHaveURL(/\/properties$/);

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Maintenance Requests - Details Page', () => {
  test('View navigates to the correct request\'s details page @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const { title, id } = requests.resolvedNoAttachments;
    const details = await requestsPage.viewRequest(title);

    await expect(page).toHaveURL(new RegExp(`/maintenance-requests/${id}$`));
    await expect(details.titleHeading).toHaveText(title);
  });

  test('header renders title, property subtitle, and Back button @smoke', async ({ page }) => {
    await loginOnly(page);
    const { id, title, property } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.titleHeading).toHaveText(title);
    await expect(details.propertySubtitle).toHaveText(property);
    await expect(details.backButton).toBeVisible();
  });

  test('the 3 badges show Status, Priority, and Category in that order @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const { id, status, priority, category } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.statusBadge).toHaveText(status);
    await expect(details.priorityBadge).toHaveText(priority);
    await expect(details.categoryBadge).toHaveText(category);
  });

  test('Request Information section renders all 11 fields correctly @smoke @critical', async ({ page }) => {
    await loginOnly(page);
    const { id, property, address, unit, landlord, landlordEmail, tenant, tenantEmail, tenantPhone, allowEntry } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.infoValue('Property')).toHaveText(property);
    await expect(details.infoValue('Address')).toHaveText(address);
    await expect(details.infoValue('Unit')).toHaveText(unit);
    await expect(details.infoValue('Landlord')).toHaveText(landlord);
    await expect(details.infoValue('Landlord Email')).toHaveText(landlordEmail);
    await expect(details.infoValue('Tenant')).toHaveText(tenant);
    await expect(details.infoValue('Tenant Email')).toHaveText(tenantEmail);
    await expect(details.infoValue('Tenant Phone')).toHaveText(tenantPhone);
    await expect(details.infoValue('Allow Entry')).toHaveText(allowEntry);
    await expect(details.infoValue('Created')).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/);
    await expect(details.infoValue('Resolved')).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/);
  });

  test('Allow Entry correctly shows "No" when entry is not allowed @regression', async ({ page }) => {
    await loginOnly(page);
    const { id, allowEntry } = requests.openEmptyState;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.infoValue('Allow Entry')).toHaveText(allowEntry);
  });

  test('Resolved field shows an em dash for an unresolved request @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.openEmptyState;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.infoValue('Resolved')).toHaveText('—');
  });

  test('Description renders long-form text without truncation @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.resolvedNoAttachments;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.descriptionText).toContainText('keys became stuck in the front door');
    await expect(details.descriptionText).toContainText('Regular maintenance, cleaning the lock');
  });

  test('missing description renders an em dash, not blank @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.openEmptyState;
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);

    await expect(details.descriptionText).toHaveText('—');
  });

  test('exactly one details request fires for a valid id @regression', async ({ page }) => {
    await loginOnly(page);
    const { id } = requests.resolvedNoAttachments;

    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes(`/admin/requests/${id}`)) requestUrls.push(req.url());
    });

    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    await expect(details.titleHeading).toBeVisible();

    expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

// The Status/Priority/Category enums use underscores for multi-word values
// (e.g. "IN_PROGRESS"), which the UI renders with a space ("In Progress").
// Splitting on both spaces and underscores handles both single- and
// multi-word enum values correctly.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCase(value) {
  return value.split(/[\s_]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

test.describe('Maintenance Requests - Data Consistency', () => {
  test('listing table matches the List API field-for-field @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const listResponse = page.waitForResponse((r) => r.url().includes('/admin/requests?page=1&limit=20'));
    await dashboard.maintenanceRequestsLink.click();
    const res = await listResponse;
    const body = await res.json();
    const items = body.data.items;

    const requestsPage = new MaintenanceRequestsPage(page);
    await expect(requestsPage.rows.first()).toBeVisible();

    const total = body.data.pagination.totalItems;
    await expect(requestsPage.showingText).toContainText(`of ${total}`);

    // Group by title+property since duplicate titles exist (e.g. "Test"),
    // same technique used in properties-data-consistency.spec.js for
    // duplicate-named rows.
    const groups = new Map();
    for (const item of items) {
      const key = JSON.stringify([item.title, item.property.name]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    for (const [key, group] of groups) {
      const [title, propertyName] = JSON.parse(key);
      await test.step(`row(s) for ${title} (${propertyName})`, async () => {
        // Plain `hasText`/exact-name cell filters aren't enough on their
        // own: "Apex Height" is a substring of "Apex Heights", "Issue" of
        // "Issue 2", and — confirmed live just now — an exact-text cell
        // match on a title like "High" also matches the *Priority* column
        // of an unrelated "High Voltage" row, since that row's priority
        // happens to also render the literal text "High". Scoping the
        // match to the specific column (1st cell = title, 2nd = property)
        // via :nth-child avoids all of these cross-row/cross-column
        // collisions at once.
        const matchingRows = requestsPage.rows
          .filter({ has: page.locator('td:nth-child(1)', { hasText: new RegExp(`^${escapeRegExp(title)}$`) }) })
          .filter({ has: page.locator('td:nth-child(2)', { hasText: new RegExp(`^${escapeRegExp(propertyName)}$`) }) });
        await expect(matchingRows).toHaveCount(group.length);

        const expectedStatuses = group.map((i) => titleCase(i.status.toLowerCase())).sort();
        const rowCount = await matchingRows.count();
        const actualStatuses = [];
        for (let i = 0; i < rowCount; i += 1) {
          actualStatuses.push(await matchingRows.nth(i).getByRole('cell').nth(5).textContent());
        }
        expect(actualStatuses.sort()).toEqual(expectedStatuses);
      });
    }
  });

  test('details page matches the Detail API field-for-field, including nested objects @smoke @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const { id } = requests.resolvedNoAttachments;
    const detailResponse = page.waitForResponse((r) => r.url().includes(`/admin/requests/${id}`));
    const details = new MaintenanceRequestDetailsPage(page);
    await details.goto(id);
    const res = await detailResponse;
    const body = await res.json();
    const data = body.data;

    await expect(details.titleHeading).toHaveText(data.title);
    await expect(details.propertySubtitle).toHaveText(data.property.name);
    await expect(details.statusBadge).toHaveText(titleCase(data.status.toLowerCase()));
    await expect(details.priorityBadge).toHaveText(titleCase(data.priority.toLowerCase()));
    await expect(details.categoryBadge).toHaveText(titleCase(data.category.toLowerCase()));

    await expect(details.infoValue('Property')).toHaveText(data.property.name);
    await expect(details.infoValue('Address')).toHaveText(data.property.address);
    await expect(details.infoValue('Unit')).toHaveText(data.property.unitName);
    // Landlord name is stored lower-case in the API but title-cased for display.
    await expect(details.infoValue('Landlord')).toHaveText(titleCase(data.landlord.name));
    await expect(details.infoValue('Landlord Email')).toHaveText(data.landlord.email);
    await expect(details.infoValue('Tenant Email')).toHaveText(data.tenant.email);
    await expect(details.infoValue('Tenant Phone')).toHaveText(data.tenant.phone);
    await expect(details.infoValue('Allow Entry')).toHaveText(data.allowEntry ? 'Yes' : 'No');

    expect(data.attachments).toHaveLength(0);
    await expect(details.noAttachmentsText).toBeVisible();

    await expect(details.notesItems).toHaveCount(data.notes.length);
    for (let i = 0; i < data.notes.length; i += 1) {
      await expect(details.notesItems.nth(i)).toContainText(data.notes[i].text);
    }
  });

  test('status-filtered results match the Filter API field-for-field @regression @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    const filterResponse = page.waitForResponse((r) => r.url().includes('status=IN_PROGRESS'));
    await requestsPage.selectStatus('In Progress');
    const res = await filterResponse;
    const body = await res.json();
    const items = body.data.items;

    await expect(requestsPage.rows).toHaveCount(items.length);
    for (const item of items) {
      await expect(requestsPage.row(item.title).first()).toContainText(item.property.name);
    }
  });
});

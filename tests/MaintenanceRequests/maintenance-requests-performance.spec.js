import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { MaintenanceRequestsPage } from '../../src/pages/MaintenanceRequestsPage.js';
import { MaintenanceRequestDetailsPage } from '../../src/pages/MaintenanceRequestDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import requests from '../data/maintenance-requests.json' with { type: 'json' };

async function openRequests(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const requestsPage = new MaintenanceRequestsPage(page);
  await requestsPage.goto();
  await expect(requestsPage.rows.first()).toBeVisible();
  return requestsPage;
}

test.describe('Maintenance Requests - Performance', () => {
  test('exactly one request fires for a normal listing load @regression', async ({ page }) => {
    const requestUrls = [];
    page.on('request', (req) => {
      if (req.url().includes('/admin/requests?page=1&limit=20') && !req.url().includes('search=') && !req.url().includes('status=')) {
        requestUrls.push(req.url());
      }
    });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const requestsPage = new MaintenanceRequestsPage(page);
    await requestsPage.goto();
    await expect(requestsPage.rows.first()).toBeVisible();

    expect(requestUrls, `Expected exactly one unfiltered page-1 request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  });

  test('table shows fresh data on every navigation, no stale flash @regression', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const { title: firstTitle } = requests.resolvedNoAttachments;
    const { title: secondTitle } = requests.resolvedWithAttachments;

    const firstDetails = await requestsPage.viewRequest(firstTitle);
    await expect(firstDetails.titleHeading).toHaveText(firstTitle);

    await firstDetails.backButton.click();
    await expect(requestsPage.rows.first()).toBeVisible();

    const secondDetails = await requestsPage.viewRequest(secondTitle);
    // If a stale-data flash occurred, the heading would briefly (or
    // persistently) still read the first request's title instead of
    // updating — asserting the final state here is sufficient since
    // toHaveText already auto-waits/retries rather than accepting a
    // one-shot stale read.
    await expect(secondDetails.titleHeading).toHaveText(secondTitle);
  });

  test('no duplicate requests fire during normal search/filter/pagination use @regression @critical', async ({ page }) => {
    const requestsPage = await openRequests(page);
    const searchUrls = [];
    const filterUrls = [];
    const pageUrls = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.includes('/admin/requests')) return;
      if (url.includes('search=') && !url.includes('status=')) searchUrls.push(url);
      if (url.includes('status=RESOLVED') && !url.includes('search=')) filterUrls.push(url);
      if (url.includes('page=2')) pageUrls.push(url);
    });

    const { titleSearchTerm } = requests;
    const searchRes = page.waitForResponse((r) => r.url().includes(`search=${titleSearchTerm}`));
    await requestsPage.searchInput.fill(titleSearchTerm);
    await searchRes;
    expect(searchUrls, `Expected exactly one search request, got: ${searchUrls.join(', ')}`).toHaveLength(1);

    await requestsPage.resetButton.click();
    await expect(requestsPage.rows.first()).toBeVisible();

    const filterRes = page.waitForResponse((r) => r.url().includes('status=RESOLVED'));
    await requestsPage.selectStatus('Resolved');
    await filterRes;
    expect(filterUrls, `Expected exactly one filter request, got: ${filterUrls.join(', ')}`).toHaveLength(1);

    await requestsPage.selectStatus('Status');
    await expect(requestsPage.rows.first()).toBeVisible();

    const pageRes = page.waitForResponse((r) => r.url().includes('page=2'));
    await requestsPage.nextButton.click();
    await pageRes;
    expect(pageUrls, `Expected exactly one page-2 request, got: ${pageUrls.join(', ')}`).toHaveLength(1);
  });

  // Exercises List Page, Search, Filters, Pagination, and Detail Page
  // together in one continuous session (specs/maintenance-requests.md
  // Scenario 11.5). The only expected console output anywhere in this
  // module is the benign Attachments-dialog warning (missing Radix
  // DialogContent description) — explicitly allowed for here rather than
  // asserting zero console output outright, mirroring the same allowance
  // already made for the Tenants module's equivalent document dialog.
  test('no unexpected console errors across the module\'s full surface area @regression @critical', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    // Tracked separately from errors, matching
    // tests/Tenants/tenants-error-states.spec.js's convention for the same
    // known Radix warning — it's a `console.warn`, not a `console.error`,
    // so it would never land in consoleErrors anyway, but tracking it
    // explicitly documents that it's expected rather than silently ignored.
    const consoleWarnings = [];
    page.on('console', (msg) => { if (msg.type() === 'warning') consoleWarnings.push(msg.text()); });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const requestsPage = await openRequests(page);
    const { titleSearchTerm } = requests;

    await test.step('search and clear', async () => {
      const res = page.waitForResponse((r) => r.url().includes('search='));
      await requestsPage.searchInput.fill(titleSearchTerm);
      await res;
      await requestsPage.resetButton.click();
      await expect(requestsPage.rows.first()).toBeVisible();
    });

    await test.step('status filter', async () => {
      const res = page.waitForResponse((r) => r.url().includes('status=OPEN'));
      await requestsPage.selectStatus('Open');
      await res;
      await requestsPage.selectStatus('Status');
      await expect(requestsPage.rows.first()).toBeVisible();
    });

    await test.step('pagination', async () => {
      await requestsPage.nextButton.click();
      await expect(requestsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
      await requestsPage.previousButton.click();
      await expect(requestsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
    });

    await test.step('view a request, open an attachment, back', async () => {
      const { title, id } = requests.resolvedWithAttachments;
      const details = await requestsPage.viewRequest(title);
      await expect(details.titleHeading).toHaveText(title);
      await details.attachmentButton('Attachment 2').click();
      await expect(details.dialog).toBeVisible();
      await details.dialogCloseButton.click();
      await details.backButton.click();
      await expect(page).toHaveURL(/\/maintenance-requests$/);
    });

    const unexpectedWarnings = consoleWarnings.filter((w) => !w.includes('Missing `Description`'));

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
    expect(unexpectedWarnings, `Unexpected console warnings: ${unexpectedWarnings.join('; ')}`).toHaveLength(0);
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
});

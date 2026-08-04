# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Tenants/tenants-error-states.spec.js >> Tenants - Error, Empty & Loading States >> retrying a non-existent tenant id does not duplicate the request @regression
- Location: tests/Tenants/tenants-error-states.spec.js:45:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /not found/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /not found/i })

```

```yaml
- region "Notifications alt+T"
- text: 6P SIX Property Admin Panel Navigation
- list:
  - listitem:
    - link "Dashboard":
      - /url: /dashboard
- text: Management
- list:
  - listitem:
    - link "Landlords":
      - /url: /landlords
  - listitem:
    - link "Tenants":
      - /url: /tenants
  - listitem:
    - link "Properties":
      - /url: /properties
- text: Monitoring
- list:
  - listitem:
    - link "Maintenance Requests":
      - /url: /maintenance-requests
  - listitem:
    - link "Platform Activity":
      - /url: /activity
- list:
  - listitem:
    - link "Admin mudassir+admin@geeksofkolachi.com":
      - /url: /profile
  - listitem:
    - button "Sign Out"
- button "Toggle Sidebar"
- main:
  - button "Toggle Sidebar"
  - text: A Admin admin
  - main:
    - heading "Something went wrong" [level=3]
    - paragraph: We encountered an error. Please try again.
    - button "Retry"
```

# Test source

```ts
  1   | import { test, expect } from '../../src/fixtures/base.js';
  2   | import { LoginPage } from '../../src/pages/LoginPage.js';
  3   | import { TenantsPage } from '../../src/pages/TenantsPage.js';
  4   | import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
  5   | import adminCredentials from '../data/credentials.json' with { type: 'json' };
  6   | import tenants from '../data/tenants.json' with { type: 'json' };
  7   | 
  8   | async function loginOnly(page) {
  9   |   const login = new LoginPage(page);
  10  |   await login.goto();
  11  |   const dashboard = await login.loginAs(adminCredentials);
  12  |   await expect(dashboard.heading).toBeVisible();
  13  | }
  14  | 
  15  | test.describe('Tenants - Error, Empty & Loading States', () => {
  16  |   // Confirmed real gap, same shared root cause as
  17  |   // Bugs/Landlords/landlords-details-invalid-id-generic-error.md: a
  18  |   // non-existent (but well-formed) id fires the underlying request twice and
  19  |   // falls back to a generic "Something went wrong" screen instead of a clear
  20  |   // "not found" message. This asserts the CORRECT expected behaviour (one
  21  |   // request, a distinct not-found message) and is left failing intentionally
  22  |   // until that's implemented, per the project's known-issue convention (see
  23  |   // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no account
  24  |   // state is touched, so no cleanup is needed even while this fails.
  25  |   test('a non-existent tenant id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
  26  |     await loginOnly(page);
  27  | 
  28  |     const requestUrls = [];
  29  |     page.on('request', (req) => {
  30  |       if (req.url().includes(`/admin/tenants/${tenants.nonExistentId}`)) requestUrls.push(req.url());
  31  |     });
  32  | 
  33  |     const details = new TenantDetailsPage(page);
  34  |     await details.goto(tenants.nonExistentId);
  35  | 
  36  |     await expect(details.loadingHeading).toBeVisible();
  37  |     await expect(
  38  |       page.getByRole('heading', { name: /not found/i }),
  39  |       'Expected a distinct "not found" message, not the generic "Something went wrong" error'
  40  |     ).toBeVisible({ timeout: 10000 });
  41  | 
  42  |     expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  43  |   });
  44  | 
  45  |   test('retrying a non-existent tenant id does not duplicate the request @regression', async ({ page }) => {
  46  |     await loginOnly(page);
  47  |     const details = new TenantDetailsPage(page);
  48  |     await details.goto(tenants.nonExistentId);
> 49  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  50  | 
  51  |     const requestUrls = [];
  52  |     page.on('request', (req) => {
  53  |       if (req.url().includes(`/admin/tenants/${tenants.nonExistentId}`)) requestUrls.push(req.url());
  54  |     });
  55  | 
  56  |     await details.retryButton.click();
  57  | 
  58  |     await expect(page).toHaveURL(new RegExp(`/tenants/${tenants.nonExistentId}$`));
  59  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
  60  |     expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  61  |   });
  62  | 
  63  |   test('a tenant with no documents and no pets shows both empty states together @regression', async ({ page }) => {
  64  |     await loginOnly(page);
  65  |     const details = new TenantDetailsPage(page);
  66  |     await details.goto(tenants.sparseTenant.id);
  67  |     await expect(details.nameHeading).toHaveText(tenants.sparseTenant.name);
  68  | 
  69  |     await expect(details.documentSubsection('Identity Document')).toHaveText('—');
  70  |     await expect(details.documentSubsection('Renters Insurance')).toHaveText('—');
  71  |     await expect(details.noPetsText).toBeVisible();
  72  |   });
  73  | 
  74  |   test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
  75  |     // Fresh context with no stored session, unlike every other test here.
  76  |     const context = await browser.newContext();
  77  |     const page = await context.newPage();
  78  | 
  79  |     await page.goto('/tenants');
  80  |     await expect(page).toHaveURL(/\/sign-in/);
  81  |     await expect(page.getByRole('table')).not.toBeVisible();
  82  | 
  83  |     const { id } = tenants.richProfileTenant;
  84  |     await page.goto(`/tenants/${id}`);
  85  |     await expect(page).toHaveURL(/\/sign-in/);
  86  |     await expect(page.getByText(tenants.richProfileTenant.email)).not.toBeVisible();
  87  | 
  88  |     await context.close();
  89  |   });
  90  | 
  91  |   // Exercises listing load, search, status filter, pagination, view, and the
  92  |   // Documents preview dialog together. The dialog's "Missing Description"
  93  |   // console warning (see tenants-detail-documents.spec.js) is confirmed
  94  |   // benign and is the only expected console output — explicitly allowed for
  95  |   // here rather than asserting zero warnings outright.
  96  |   test('no unexpected console errors across load, search, filter, pagination, view, and document preview @regression', async ({ page }) => {
  97  |     const consoleErrors = [];
  98  |     page.on('console', (msg) => {
  99  |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  100 |     });
  101 |     const consoleWarnings = [];
  102 |     page.on('console', (msg) => {
  103 |       if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  104 |     });
  105 |     const pageErrors = [];
  106 |     page.on('pageerror', (err) => pageErrors.push(err.message));
  107 | 
  108 |     await loginOnly(page);
  109 |     const tenantsPage = new TenantsPage(page);
  110 |     await tenantsPage.goto();
  111 |     await expect(tenantsPage.rows.first()).toBeVisible();
  112 | 
  113 |     const { email } = tenants.sparseTenant;
  114 |     await tenantsPage.searchInput.fill(email);
  115 |     await expect(tenantsPage.rows).toHaveCount(1);
  116 |     await tenantsPage.resetButton.click();
  117 |     await expect(tenantsPage.rows.first()).toBeVisible();
  118 | 
  119 |     await tenantsPage.statusSelect.selectOption('ACTIVE');
  120 |     await expect(tenantsPage.rows.first()).toBeVisible();
  121 |     await tenantsPage.resetButton.click();
  122 |     await expect(tenantsPage.rows.first()).toBeVisible();
  123 | 
  124 |     await tenantsPage.nextButton.click();
  125 |     await expect(tenantsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
  126 |     await tenantsPage.previousButton.click();
  127 |     await expect(tenantsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
  128 | 
  129 |     // Search first — "Maaz Tenant" is a substring of several disposable
  130 |     // tenants' names too, so viewing by name alone would be ambiguous.
  131 |     await tenantsPage.searchInput.fill(tenants.richProfileTenant.email);
  132 |     await expect(tenantsPage.rows).toHaveCount(1);
  133 |     const details = await tenantsPage.viewTenant(tenants.richProfileTenant.name);
  134 |     await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);
  135 |     await details.documentButton('IMG_0692.png').click();
  136 |     await expect(details.dialog).toBeVisible();
  137 |     await details.dialogCloseButton.click();
  138 |     await expect(details.dialog).not.toBeVisible();
  139 |     await details.backButton.click();
  140 |     await expect(page).toHaveURL(/\/tenants$/);
  141 | 
  142 |     const unexpectedWarnings = consoleWarnings.filter((w) => !w.includes('Missing `Description`'));
  143 | 
  144 |     expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  145 |     expect(unexpectedWarnings, `Unexpected console warnings: ${unexpectedWarnings.join('; ')}`).toHaveLength(0);
  146 |     expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  147 |   });
  148 | });
  149 | 
```
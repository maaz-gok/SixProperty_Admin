# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Landlords/landlords-error-states.spec.js >> Landlords - Error, Empty & Loading States >> a non-existent landlord id shows a clear "not found" message after exactly one request @regression
- Location: tests/Landlords/landlords-error-states.spec.js:26:7

# Error details

```
Error: Expected a distinct "not found" message, not the generic "Something went wrong" error

expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /not found/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expected a distinct "not found" message, not the generic "Something went wrong" error with timeout 10000ms
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
  3   | import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
  4   | import { LandlordDetailsPage } from '../../src/pages/LandlordDetailsPage.js';
  5   | import adminCredentials from '../data/credentials.json' with { type: 'json' };
  6   | import landlords from '../data/landlords.json' with { type: 'json' };
  7   | 
  8   | async function loginOnly(page) {
  9   |   const login = new LoginPage(page);
  10  |   await login.goto();
  11  |   const dashboard = await login.loginAs(adminCredentials);
  12  |   await expect(dashboard.heading).toBeVisible();
  13  | }
  14  | 
  15  | test.describe('Landlords - Error, Empty & Loading States', () => {
  16  |   // Confirmed real gap (see
  17  |   // Bugs/Landlords/landlords-details-invalid-id-generic-error.md): a
  18  |   // non-existent (but well-formed) id currently fires the underlying
  19  |   // request twice and falls back to a generic "Something went wrong"
  20  |   // screen instead of a clear "not found" message. This asserts the
  21  |   // CORRECT expected behaviour (one request, a distinct not-found message)
  22  |   // and is left failing intentionally until that's implemented, per the
  23  |   // project's known-issue convention (see
  24  |   // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no account
  25  |   // state is touched, so no cleanup is needed even while this fails.
  26  |   test('a non-existent landlord id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
  27  |     await loginOnly(page);
  28  | 
  29  |     const requestUrls = [];
  30  |     page.on('request', (req) => {
  31  |       if (req.url().includes(`/admin/landlords/${landlords.nonExistentId}`)) requestUrls.push(req.url());
  32  |     });
  33  | 
  34  |     const details = new LandlordDetailsPage(page);
  35  |     await details.goto(landlords.nonExistentId);
  36  | 
  37  |     await expect(details.loadingHeading).toBeVisible();
  38  |     await expect(
  39  |       page.getByRole('heading', { name: /not found/i }),
  40  |       'Expected a distinct "not found" message, not the generic "Something went wrong" error'
> 41  |     ).toBeVisible({ timeout: 10000 });
      |       ^ Error: Expected a distinct "not found" message, not the generic "Something went wrong" error
  42  | 
  43  |     expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  44  |   });
  45  | 
  46  |   test('retrying a non-existent landlord id does not duplicate the request @regression', async ({ page }) => {
  47  |     await loginOnly(page);
  48  |     const details = new LandlordDetailsPage(page);
  49  |     await details.goto(landlords.nonExistentId);
  50  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
  51  | 
  52  |     const requestUrls = [];
  53  |     page.on('request', (req) => {
  54  |       if (req.url().includes(`/admin/landlords/${landlords.nonExistentId}`)) requestUrls.push(req.url());
  55  |     });
  56  | 
  57  |     await details.retryButton.click();
  58  | 
  59  |     await expect(page).toHaveURL(new RegExp(`/landlords/${landlords.nonExistentId}$`));
  60  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
  61  |     expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  62  |   });
  63  | 
  64  |   test('a landlord with 0 properties/tenants shows both empty sections and matching summary counts @regression', async ({ page }) => {
  65  |     await loginOnly(page);
  66  |     const { id } = landlords.suspendedZeroCountLandlord;
  67  |     const details = new LandlordDetailsPage(page);
  68  |     await details.goto(id);
  69  | 
  70  |     await expect(details.summaryCardCount('Properties')).toHaveText('0');
  71  |     await expect(details.summaryCardCount('Tenants')).toHaveText('0');
  72  |     await expect(details.noPropertiesHeading).toBeVisible();
  73  |     await expect(details.noTenantsHeading).toBeVisible();
  74  |   });
  75  | 
  76  |   test('no console errors across load, search, pagination, view, and suspend/unsuspend @regression', async ({ page }) => {
  77  |     const consoleErrors = [];
  78  |     page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  79  |     const pageErrors = [];
  80  |     page.on('pageerror', (err) => pageErrors.push(err.message));
  81  | 
  82  |     await loginOnly(page);
  83  |     const landlordsPage = new LandlordsPage(page);
  84  |     await landlordsPage.goto();
  85  |     await expect(landlordsPage.rows.first()).toBeVisible();
  86  | 
  87  |     const { apiName, name: populatedName } = landlords.populatedLandlord;
  88  |     await landlordsPage.searchInput.fill(apiName);
  89  |     await expect(landlordsPage.row(populatedName)).toHaveCount(1);
  90  |     await landlordsPage.resetButton.click();
  91  |     await expect(landlordsPage.rows.first()).toBeVisible();
  92  | 
  93  |     await landlordsPage.nextButton.click();
  94  |     await expect(landlordsPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);
  95  |     await landlordsPage.previousButton.click();
  96  |     await expect(landlordsPage.pageIndicator).toHaveText(/^Page 1 of \d+$/);
  97  | 
  98  |     const details = await landlordsPage.viewLandlord(populatedName);
  99  |     await expect(details.nameHeading).toHaveText(populatedName);
  100 |     await details.backButton.click();
  101 |     await expect(page).toHaveURL(/\/landlords$/);
  102 | 
  103 |     const { name: disposableName } = landlords.disposableActiveLandlord5;
  104 |     await landlordsPage.suspendButton(disposableName).click();
  105 |     await expect(landlordsPage.statusCell(disposableName)).toHaveText('Suspended');
  106 |     await landlordsPage.unsuspendButton(disposableName).click();
  107 |     await expect(landlordsPage.statusCell(disposableName)).toHaveText('Active');
  108 | 
  109 |     expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  110 |     expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  111 |   });
  112 | 
  113 |   test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
  114 |     // Fresh context with no stored session, unlike every other test here.
  115 |     const context = await browser.newContext();
  116 |     const page = await context.newPage();
  117 | 
  118 |     await page.goto('/landlords');
  119 |     await expect(page).toHaveURL(/\/sign-in/);
  120 |     await expect(page.getByRole('table')).not.toBeVisible();
  121 | 
  122 |     const { id } = landlords.populatedLandlord;
  123 |     await page.goto(`/landlords/${id}`);
  124 |     await expect(page).toHaveURL(/\/sign-in/);
  125 |     await expect(page.getByText(landlords.populatedLandlord.email)).not.toBeVisible();
  126 | 
  127 |     await context.close();
  128 |   });
  129 | });
  130 | 
```
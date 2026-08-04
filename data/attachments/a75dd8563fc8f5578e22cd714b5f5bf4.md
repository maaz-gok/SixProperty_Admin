# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Properties/properties-error-states.spec.js >> Properties - Error, Empty & Loading States >> retrying a non-existent property id does not duplicate the request @regression
- Location: tests/Properties/properties-error-states.spec.js:68:7

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
  3   | import { PropertyDetailsPage } from '../../src/pages/PropertyDetailsPage.js';
  4   | import adminCredentials from '../data/credentials.json' with { type: 'json' };
  5   | import properties from '../data/properties.json' with { type: 'json' };
  6   | 
  7   | async function loginOnly(page) {
  8   |   const login = new LoginPage(page);
  9   |   await login.goto();
  10  |   const dashboard = await login.loginAs(adminCredentials);
  11  |   await expect(dashboard.heading).toBeVisible();
  12  | }
  13  | 
  14  | test.describe('Properties - Error, Empty & Loading States', () => {
  15  |   // Confirmed real gap, same root cause as
  16  |   // Bugs/Landlords/landlords-details-invalid-id-generic-error.md
  17  |   // (reproduced live for Properties too — see specs/properties-management.md
  18  |   // Feature Area 8, Scenario 8.6): a non-existent (but well-formed) id
  19  |   // currently fires the underlying request twice and falls back to a
  20  |   // generic "Something went wrong" screen instead of a clear "not found"
  21  |   // message. This asserts the CORRECT expected behaviour (one request, a
  22  |   // distinct not-found message) and is left failing intentionally until
  23  |   // that's implemented, per the project's known-issue convention (see
  24  |   // tests/Dashboard/dashboard-sign-out.spec.js). Read-only — no state is
  25  |   // touched, so no cleanup is needed even while this fails.
  26  |   test('a non-existent property id shows a clear "not found" message after exactly one request @regression', async ({ page }) => {
  27  |     await loginOnly(page);
  28  | 
  29  |     const requestUrls = [];
  30  |     page.on('request', (req) => {
  31  |       if (req.url().includes(`/admin/properties/${properties.nonExistentId}`)) requestUrls.push(req.url());
  32  |     });
  33  | 
  34  |     const details = new PropertyDetailsPage(page);
  35  |     await details.goto(properties.nonExistentId);
  36  | 
  37  |     await expect(details.loadingHeading).toBeVisible();
  38  |     await expect(
  39  |       page.getByRole('heading', { name: /not found/i }),
  40  |       'Expected a distinct "not found" message, not the generic "Something went wrong" error'
  41  |     ).toBeVisible({ timeout: 10000 });
  42  | 
  43  |     expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  44  |   });
  45  | 
  46  |   // Same shared bug reproduces identically for a syntactically malformed id
  47  |   // (not a valid ObjectId shape) — confirmed live there is no separate
  48  |   // 400-style path. See specs/properties-management.md's "Confirmed live
  49  |   // structure" notes.
  50  |   test('a malformed property id shows the same "not found" gap, not a distinct 400 path @regression', async ({ page }) => {
  51  |     await loginOnly(page);
  52  | 
  53  |     const requestUrls = [];
  54  |     page.on('request', (req) => {
  55  |       if (req.url().includes(`/admin/properties/${properties.malformedId}`)) requestUrls.push(req.url());
  56  |     });
  57  | 
  58  |     const details = new PropertyDetailsPage(page);
  59  |     await details.goto(properties.malformedId);
  60  | 
  61  |     await expect(
  62  |       page.getByRole('heading', { name: /not found/i }),
  63  |       'Expected a distinct "not found" message, not the generic "Something went wrong" error'
  64  |     ).toBeVisible({ timeout: 10000 });
  65  |     expect(requestUrls, `Expected exactly one request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  66  |   });
  67  | 
  68  |   test('retrying a non-existent property id does not duplicate the request @regression', async ({ page }) => {
  69  |     await loginOnly(page);
  70  |     const details = new PropertyDetailsPage(page);
  71  |     await details.goto(properties.nonExistentId);
> 72  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  73  | 
  74  |     const requestUrls = [];
  75  |     page.on('request', (req) => {
  76  |       if (req.url().includes(`/admin/properties/${properties.nonExistentId}`)) requestUrls.push(req.url());
  77  |     });
  78  | 
  79  |     await details.retryButton.click();
  80  | 
  81  |     await expect(page).toHaveURL(new RegExp(`/properties/${properties.nonExistentId}$`));
  82  |     await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible({ timeout: 10000 });
  83  |     expect(requestUrls, `Expected exactly one retry request, got: ${requestUrls.join(', ')}`).toHaveLength(1);
  84  |   });
  85  | 
  86  |   test('an unauthenticated request for the listing or a details page redirects to sign-in @regression', async ({ browser }) => {
  87  |     // Fresh context with no stored session, unlike every other test here.
  88  |     const context = await browser.newContext();
  89  |     const page = await context.newPage();
  90  | 
  91  |     await page.goto('/properties');
  92  |     await expect(page).toHaveURL(/\/sign-in/);
  93  |     await expect(page.getByRole('table')).not.toBeVisible();
  94  | 
  95  |     const { id, address } = properties.populatedProperty;
  96  |     await page.goto(`/properties/${id}`);
  97  |     await expect(page).toHaveURL(/\/sign-in/);
  98  |     await expect(page.getByText(address)).not.toBeVisible();
  99  | 
  100 |     await context.close();
  101 |   });
  102 | });
  103 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Properties/properties-search.spec.js >> Properties - Search >> search is case-insensitive and tolerates leading/trailing whitespace @regression
- Location: tests/Properties/properties-search.spec.js:67:7

# Error details

```
Error: Search should trim whitespace before matching, same as Landlords/Tenants

expect(locator).toHaveCount(expected) failed

Locator:  getByRole('table').locator('tbody').getByRole('row').filter({ hasText: 'Grove' })
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Search should trim whitespace before matching, same as Landlords/Tenants with timeout 5000ms
  - waiting for getByRole('table').locator('tbody').getByRole('row').filter({ hasText: 'Grove' })
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - region "Notifications alt+T"
  - generic [ref=f1e4]:
    - generic [ref=f1e7]:
      - generic [ref=f1e9]:
        - generic [ref=f1e10]: 6P
        - generic [ref=f1e12]:
          - generic [ref=f1e13]: SIX Property
          - generic [ref=f1e14]: Admin Panel
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - generic [ref=f1e17]: Navigation
          - list [ref=f1e19]:
            - listitem [ref=f1e20]:
              - link "Dashboard" [ref=f1e21] [cursor=pointer]:
                - /url: /dashboard
        - generic [ref=f1e28]:
          - generic [ref=f1e29]: Management
          - list [ref=f1e31]:
            - listitem [ref=f1e32]:
              - link "Landlords" [ref=f1e33] [cursor=pointer]:
                - /url: /landlords
            - listitem [ref=f1e40]:
              - link "Tenants" [ref=f1e41] [cursor=pointer]:
                - /url: /tenants
            - listitem [ref=f1e48]:
              - link "Properties" [ref=f1e49] [cursor=pointer]:
                - /url: /properties
        - generic [ref=f1e55]:
          - generic [ref=f1e56]: Monitoring
          - list [ref=f1e58]:
            - listitem [ref=f1e59]:
              - link "Maintenance Requests" [ref=f1e60] [cursor=pointer]:
                - /url: /maintenance-requests
            - listitem [ref=f1e64]:
              - link "Platform Activity" [ref=f1e65] [cursor=pointer]:
                - /url: /activity
      - list [ref=f1e70]:
        - listitem [ref=f1e71]:
          - link "Admin mudassir+admin@geeksofkolachi.com" [ref=f1e72] [cursor=pointer]:
            - /url: /profile
            - generic [ref=f1e76]:
              - generic [ref=f1e77]: Admin
              - generic [ref=f1e78]: mudassir+admin@geeksofkolachi.com
        - listitem [ref=f1e79]:
          - button "Sign Out" [ref=f1e80]
      - button "Toggle Sidebar" [ref=f1e85]
    - main [ref=f1e86]:
      - generic [ref=f1e87]:
        - button "Toggle Sidebar" [ref=f1e88]
        - generic [ref=f1e90]:
          - generic [ref=f1e91]: A
          - generic [ref=f1e92]:
            - generic [ref=f1e93]: Admin
            - generic [ref=f1e94]: admin
      - main [ref=f1e95]:
        - generic [ref=f1e97]:
          - generic [ref=f1e100]:
            - heading "Manage Properties" [level=3] [ref=f1e101]
            - paragraph [ref=f1e102]: Review and manage listed properties.
          - generic [ref=f1e103]:
            - generic [ref=f1e104]:
              - searchbox "Search by name or address" [active] [ref=f1e109]: GROVE
              - button "Reset" [ref=f1e111]
            - generic [ref=f1e114]:
              - heading "No data found" [level=3] [ref=f1e119]
              - paragraph [ref=f1e120]: There is no data to display at the moment.
```

# Test source

```ts
  1   | import { test, expect } from '../../src/fixtures/base.js';
  2   | import { LoginPage } from '../../src/pages/LoginPage.js';
  3   | import { PropertiesPage } from '../../src/pages/PropertiesPage.js';
  4   | import adminCredentials from '../data/credentials.json' with { type: 'json' };
  5   | import properties from '../data/properties.json' with { type: 'json' };
  6   | 
  7   | async function openProperties(page) {
  8   |   const login = new LoginPage(page);
  9   |   await login.goto();
  10  |   const dashboard = await login.loginAs(adminCredentials);
  11  |   await expect(dashboard.heading).toBeVisible();
  12  |   const propertiesPage = new PropertiesPage(page);
  13  |   await propertiesPage.goto();
  14  |   await expect(propertiesPage.rows.first()).toBeVisible();
  15  |   return propertiesPage;
  16  | }
  17  | 
  18  | test.describe('Properties - Search', () => {
  19  |   test('exact name, partial name, and address all match the same property @smoke @critical', async ({ page }) => {
  20  |     const propertiesPage = await openProperties(page);
  21  |     const { name, address } = properties.populatedProperty;
  22  | 
  23  |     await test.step('exact name', async () => {
  24  |       const res = page.waitForResponse((r) => r.url().includes(`/admin/properties?page=1&limit=20&search=${name}`));
  25  |       await propertiesPage.searchInput.fill(name);
  26  |       await res;
  27  |       await expect(propertiesPage.row(name)).toHaveCount(1);
  28  |       await expect(propertiesPage.showingText).toHaveText(/^Showing 1–1 of 1$/);
  29  |       await expect(propertiesPage.pageIndicator).toHaveText('Page 1 of 1');
  30  |       await expect(propertiesPage.previousButton).toBeDisabled();
  31  |       await expect(propertiesPage.nextButton).toBeDisabled();
  32  |     });
  33  | 
  34  |     await test.step('partial name', async () => {
  35  |       const partial = name.slice(0, 3);
  36  |       const res = page.waitForResponse((r) => r.url().includes(`search=${partial}`));
  37  |       await propertiesPage.searchInput.fill(partial);
  38  |       await res;
  39  |       await expect(propertiesPage.row(name)).toHaveCount(1);
  40  |     });
  41  | 
  42  |     await test.step('address fragment (distinct from the name term above, to avoid a cached-query no-op)', async () => {
  43  |       // Confirmed live: re-searching an exact term already fetched earlier
  44  |       // in the same session (e.g. "Grove" again) does not always issue a
  45  |       // fresh network request — the app appears to serve an identical query
  46  |       // from client-side cache. Using a fragment that only appears in the
  47  |       // address (not the name) sidesteps that and still proves address-body
  48  |       // matching independently of the name-matching already covered above.
  49  |       const fragment = address.split(' ').pop(); // "18431" — unique to the address, not the name
  50  |       const res = page.waitForResponse((r) => r.url().includes(`search=${fragment}`));
  51  |       await propertiesPage.searchInput.fill(fragment);
  52  |       await res;
  53  |       await expect(propertiesPage.row(name)).toHaveCount(1);
  54  |       await expect(propertiesPage.addressCell(name)).toHaveText(address);
  55  |     });
  56  |   });
  57  | 
  58  |   // Confirmed real gap (see
  59  |   // Bugs/Properties/properties-search-does-not-trim-whitespace.md): unlike
  60  |   // the Landlords/Tenants search (which trims and lower-cases server-side),
  61  |   // Properties search does NOT trim leading/trailing whitespace — a term
  62  |   // with padding spaces returns zero results even though the same term
  63  |   // without padding matches correctly. Case-insensitivity alone works fine
  64  |   // (confirmed independently). This asserts the CORRECT expected behaviour
  65  |   // and is left failing intentionally until fixed, per the project's
  66  |   // known-issue convention (see tests/Dashboard/dashboard-sign-out.spec.js).
  67  |   test('search is case-insensitive and tolerates leading/trailing whitespace @regression', async ({ page }) => {
  68  |     const propertiesPage = await openProperties(page);
  69  |     const { name } = properties.populatedProperty;
  70  |     const noisyTerm = `  ${name.toUpperCase()}  `;
  71  | 
  72  |     const res = page.waitForResponse((r) => r.url().includes('/admin/properties') && r.url().includes('search='));
  73  |     await propertiesPage.searchInput.fill(noisyTerm);
  74  |     await res;
  75  | 
> 76  |     await expect(propertiesPage.row(name), 'Search should trim whitespace before matching, same as Landlords/Tenants').toHaveCount(1);
      |                                                                                                                        ^ Error: Search should trim whitespace before matching, same as Landlords/Tenants
  77  |   });
  78  | 
  79  |   test('script-like search input is treated as inert text, not executed @regression', async ({ page }) => {
  80  |     const propertiesPage = await openProperties(page);
  81  |     let dialogFired = false;
  82  |     page.on('dialog', () => { dialogFired = true; });
  83  |     const consoleErrors = [];
  84  |     page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  85  | 
  86  |     const payload = '<script>alert(1)</script>';
  87  |     const res = page.waitForResponse((r) => r.url().includes('/admin/properties') && r.url().includes('search='));
  88  |     await propertiesPage.searchInput.fill(payload);
  89  |     await res;
  90  | 
  91  |     await expect(propertiesPage.searchInput).toHaveValue(payload);
  92  |     await expect(propertiesPage.noDataHeading).toBeVisible();
  93  |     expect(dialogFired, 'A script-like search value must never trigger a JS dialog').toBe(false);
  94  |     expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  95  |   });
  96  | 
  97  |   test('a numeric address fragment matches the correct property @regression', async ({ page }) => {
  98  |     const propertiesPage = await openProperties(page);
  99  |     const { name, address } = properties.populatedProperty;
  100 |     const numericFragment = address.match(/\d+/)[0]; // "307"
  101 | 
  102 |     const res = page.waitForResponse((r) => r.url().includes(`search=${numericFragment}`));
  103 |     await propertiesPage.searchInput.fill(numericFragment);
  104 |     await res;
  105 | 
  106 |     await expect(propertiesPage.row(name)).toHaveCount(1);
  107 |   });
  108 | 
  109 |   test('a non-matching search shows the "No data found" empty state @regression @critical', async ({ page }) => {
  110 |     const propertiesPage = await openProperties(page);
  111 | 
  112 |     const res = page.waitForResponse((r) => r.url().includes('search=zzzznotfound'));
  113 |     await propertiesPage.searchInput.fill('zzzznotfound');
  114 |     await res;
  115 | 
  116 |     await expect(propertiesPage.noDataHeading).toBeVisible();
  117 |     await expect(propertiesPage.noDataText).toBeVisible();
  118 |     await expect(propertiesPage.showingText).not.toBeVisible();
  119 |   });
  120 | 
  121 |   test('clearing the search box restores the full unfiltered list @regression', async ({ page }) => {
  122 |     const propertiesPage = await openProperties(page);
  123 |     const { name } = properties.populatedProperty;
  124 | 
  125 |     const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
  126 |     await propertiesPage.searchInput.fill(name);
  127 |     await searchRes;
  128 |     await expect(propertiesPage.resetButton).toBeVisible();
  129 | 
  130 |     // Confirmed live: clearing back to the unfiltered page-1 query can be
  131 |     // served from client-side cache rather than always issuing a fresh
  132 |     // network request (same caching behaviour documented for the Reset
  133 |     // button in Landlords' equivalent test) — so this asserts the resulting
  134 |     // UI state rather than requiring a network round-trip.
  135 |     await propertiesPage.searchInput.fill('');
  136 | 
  137 |     await expect(propertiesPage.resetButton).not.toBeVisible();
  138 |     await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  139 |   });
  140 | 
  141 |   test('Reset button clears the search and restores the unfiltered page-1 list @regression', async ({ page }) => {
  142 |     const propertiesPage = await openProperties(page);
  143 |     const { name } = properties.populatedProperty;
  144 | 
  145 |     const searchRes = page.waitForResponse((r) => r.url().includes(`search=${name}`));
  146 |     await propertiesPage.searchInput.fill(name);
  147 |     await searchRes;
  148 |     await expect(propertiesPage.resetButton).toBeVisible();
  149 | 
  150 |     await propertiesPage.resetButton.click();
  151 | 
  152 |     await expect(propertiesPage.searchInput).toHaveValue('');
  153 |     await expect(propertiesPage.resetButton).not.toBeVisible();
  154 |     await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  155 |   });
  156 | 
  157 |   test('search state does not survive a reload @regression', async ({ page }) => {
  158 |     const propertiesPage = await openProperties(page);
  159 |     const { name } = properties.populatedProperty;
  160 | 
  161 |     const res = page.waitForResponse((r) => r.url().includes(`search=${name}`));
  162 |     await propertiesPage.searchInput.fill(name);
  163 |     await res;
  164 |     expect(page.url()).not.toContain('search');
  165 | 
  166 |     await page.reload();
  167 |     await expect(propertiesPage.rows.first()).toBeVisible();
  168 |     await expect(propertiesPage.searchInput).toHaveValue('');
  169 |     await expect(propertiesPage.showingText).toHaveText(/^Showing 1–20 of \d+$/);
  170 |     expect(page.url()).not.toContain('search');
  171 |   });
  172 | });
  173 | 
```
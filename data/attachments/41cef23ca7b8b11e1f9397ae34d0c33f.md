# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Landlords/landlords-responsive.spec.js >> Landlords - Responsive Layout >> details page (768px): the page itself should not scroll horizontally @regression
- Location: tests/Landlords/landlords-responsive.spec.js:124:7

# Error details

```
Error: The whole page should not need to scroll horizontally at this width

expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
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
          - generic [ref=f1e98]:
            - generic [ref=f1e99]:
              - generic [ref=f1e100]: J
              - generic [ref=f1e101]:
                - heading "Jeremy" [level=3] [ref=f1e102]
                - paragraph [ref=f1e103]: Landlord Details
            - button "Back" [ref=f1e105]
          - generic [ref=f1e106]:
            - generic [ref=f1e114]:
              - paragraph [ref=f1e115]: Properties
              - paragraph [ref=f1e116]: "1"
            - generic [ref=f1e125]:
              - paragraph [ref=f1e126]: Tenants
              - paragraph [ref=f1e127]: "1"
          - generic [ref=f1e128]:
            - generic [ref=f1e129]:
              - generic [ref=f1e130]: Landlord Information
              - generic [ref=f1e131]: Active
            - generic [ref=f1e133]:
              - generic [ref=f1e134]:
                - term [ref=f1e135]: Email
                - definition [ref=f1e136]: nostaw22@gmail.com
              - generic [ref=f1e137]:
                - term [ref=f1e138]: Address
                - definition [ref=f1e139]: 307 Grove Street, Honesdale, PA, USA
              - generic [ref=f1e140]:
                - term [ref=f1e141]: Date of Birth
                - definition [ref=f1e142]: 06/27/1988
              - generic [ref=f1e143]:
                - term [ref=f1e144]: Joined
                - definition [ref=f1e145]: Jul 27, 2026
              - generic [ref=f1e146]:
                - term [ref=f1e147]: Role
                - definition [ref=f1e148]: LANDLORD
              - generic [ref=f1e149]:
                - term [ref=f1e150]: Email Verified
                - definition [ref=f1e151]: "Yes"
              - generic [ref=f1e152]:
                - term [ref=f1e153]: Provider
                - definition [ref=f1e154]: CUSTOM
          - generic [ref=f1e155]:
            - heading "Properties" [level=4] [ref=f1e156]
            - table [ref=f1e160]:
              - rowgroup [ref=f1e161]:
                - row [ref=f1e162]:
                  - columnheader "Property" [ref=f1e163]
                  - columnheader "Address" [ref=f1e164]
                  - columnheader "Unit" [ref=f1e165]
                  - columnheader "Tenants" [ref=f1e166]
                  - columnheader "Created" [ref=f1e167]
              - rowgroup [ref=f1e168]:
                - row [ref=f1e169]:
                  - cell "Grove" [ref=f1e170]
                  - cell "307 Grove Street Honesdale, PA 18431" [ref=f1e171]
                  - cell "1-2" [ref=f1e172]
                  - cell "1" [ref=f1e173]
                  - cell "Jul 27, 2026" [ref=f1e174]
          - generic [ref=f1e175]:
            - heading "Tenants" [level=4] [ref=f1e176]
            - table [ref=f1e180]:
              - rowgroup [ref=f1e181]:
                - row [ref=f1e182]:
                  - columnheader "Name" [ref=f1e183]
                  - columnheader "Email" [ref=f1e184]
                  - columnheader "Phone" [ref=f1e185]
                  - columnheader "Property" [ref=f1e186]
                  - columnheader "Unit" [ref=f1e187]
                  - columnheader "Rent" [ref=f1e188]
                  - columnheader "Status" [ref=f1e189]
              - rowgroup [ref=f1e190]:
                - row [ref=f1e191]:
                  - cell "Jeremy" [ref=f1e192]
                  - cell "jwatson@thesixpm.com" [ref=f1e193]
                  - cell "5703525162" [ref=f1e194]
                  - cell "Grove" [ref=f1e195]
                  - cell "1-2" [ref=f1e196]
                  - cell "$800" [ref=f1e197]
                  - cell "Active" [ref=f1e198]
```

# Test source

```ts
  29  | }
  30  | 
  31  | test.describe('Landlords - Responsive Layout', () => {
  32  |   test('desktop (1280px): all 7 columns fully visible, no page-level horizontal overflow @regression', async ({ browser }) => {
  33  |     const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 1280, height: 800 });
  34  | 
  35  |     for (const col of ['Name', 'Email', 'Properties', 'Tenants', 'Status', 'Joined', 'Actions']) {
  36  |       await expect(landlordsPage.columnHeader(col)).toBeInViewport({ ratio: 0.95 });
  37  |     }
  38  |     expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
  39  |     await context.close();
  40  |   });
  41  | 
  42  |   // Confirmed real gap (see
  43  |   // Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md): the
  44  |   // sidebar currently stays expanded at this width and the main content
  45  |   // area does not shrink to fit, so the *entire page* scrolls horizontally
  46  |   // instead of just the table. This asserts the CORRECT expected behaviour
  47  |   // (no real page-level overflow at this width) and is left failing
  48  |   // intentionally until that's fixed, per the project's known-issue
  49  |   // convention (see tests/Dashboard/dashboard-sign-out.spec.js).
  50  |   test('tablet (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
  51  |     const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 768, height: 1024 });
  52  | 
  53  |     // These column-visibility facts hold regardless of whether the scroll
  54  |     // needed to reach them is page-level (buggy) or table-level (correct).
  55  |     await expect(landlordsPage.columnHeader('Name')).toBeInViewport({ ratio: 0.95 });
  56  |     await expect(landlordsPage.columnHeader('Email')).toBeInViewport({ ratio: 0.95 });
  57  |     for (const col of ['Properties', 'Tenants', 'Status', 'Joined', 'Actions']) {
  58  |       await expect(landlordsPage.columnHeader(col)).not.toBeInViewport({ ratio: 0.95 });
  59  |     }
  60  | 
  61  |     expect(
  62  |       await hasRealPageHorizontalOverflow(page),
  63  |       'The whole page should not need to scroll horizontally at this width — only the table should, if anything'
  64  |     ).toBe(false);
  65  |     await context.close();
  66  |   });
  67  | 
  68  |   // Confirmed live: Name's column is narrow enough to fit fully at this
  69  |   // width, but Email is wide enough that only part of it fits (its right
  70  |   // edge falls well past the 390px viewport) — it's visible, just not
  71  |   // fully readable without scrolling. Properties/Actions are hidden entirely.
  72  |   test('mobile (390px): only Name is fully visible, Email is partially clipped, sidebar fully collapsed @regression', async ({ browser }) => {
  73  |     const { context, page, landlordsPage } = await openLandlordsAt(browser, { width: 390, height: 844 });
  74  | 
  75  |     await expect(landlordsPage.columnHeader('Name')).toBeInViewport({ ratio: 0.95 });
  76  |     await expect(landlordsPage.columnHeader('Email')).toBeInViewport(); // partially, not fully
  77  |     await expect(landlordsPage.columnHeader('Email')).not.toBeInViewport({ ratio: 0.95 });
  78  |     await expect(landlordsPage.columnHeader('Properties')).not.toBeInViewport();
  79  |     await expect(landlordsPage.columnHeader('Actions')).not.toBeInViewport();
  80  | 
  81  |     // Sidebar collapses fully rather than to an icon rail, so the table's
  82  |     // own scroll container (rather than the whole page) properly absorbs
  83  |     // the overflow at this width.
  84  |     await expect(landlordsPage.landlordsNavLink).not.toBeVisible();
  85  |     expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
  86  | 
  87  |     const { name } = landlords.populatedLandlord;
  88  |     await landlordsPage.viewButton(name).scrollIntoViewIfNeeded();
  89  |     await expect(landlordsPage.viewButton(name)).toBeInViewport();
  90  |     await context.close();
  91  |   });
  92  | 
  93  |   async function openDetailsAt(browser, viewport) {
  94  |     const context = await browser.newContext({ viewport });
  95  |     const page = await context.newPage();
  96  |     const login = new LoginPage(page);
  97  |     await login.goto();
  98  |     const dashboard = await login.loginAs(adminCredentials);
  99  |     await expect(dashboard.heading).toBeVisible();
  100 | 
  101 |     const { id, name } = landlords.populatedLandlord;
  102 |     const details = new LandlordDetailsPage(page);
  103 |     await details.goto(id);
  104 |     await expect(details.nameHeading).toHaveText(name);
  105 |     await expect(details.summaryCard('Properties')).toBeVisible();
  106 |     await expect(details.summaryCard('Tenants')).toBeVisible();
  107 |     await expect(details.infoValue('Email')).toBeVisible();
  108 |     await expect(details.propertiesTableHeading).toBeVisible();
  109 |     await expect(details.tenantsTableHeading).toBeVisible();
  110 |     return { context, page };
  111 |   }
  112 | 
  113 |   test('details page (1280px): no real horizontal overflow @regression', async ({ browser }) => {
  114 |     const { context, page } = await openDetailsAt(browser, { width: 1280, height: 800 });
  115 |     expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
  116 |     await context.close();
  117 |   });
  118 | 
  119 |   // Same known gap as the listing page at this width (see
  120 |   // Bugs/Landlords/landlords-tablet-page-scrolls-horizontally.md). Asserts
  121 |   // the CORRECT expected behaviour and is left failing intentionally until
  122 |   // fixed, per the project's known-issue convention (see
  123 |   // tests/Dashboard/dashboard-sign-out.spec.js).
  124 |   test('details page (768px): the page itself should not scroll horizontally @regression', async ({ browser }) => {
  125 |     const { context, page } = await openDetailsAt(browser, { width: 768, height: 1024 });
  126 |     expect(
  127 |       await hasRealPageHorizontalOverflow(page),
  128 |       'The whole page should not need to scroll horizontally at this width'
> 129 |     ).toBe(false);
      |       ^ Error: The whole page should not need to scroll horizontally at this width
  130 |     await context.close();
  131 |   });
  132 | 
  133 |   test('details page (390px): no real horizontal overflow @regression', async ({ browser }) => {
  134 |     const { context, page } = await openDetailsAt(browser, { width: 390, height: 844 });
  135 |     expect(await hasRealPageHorizontalOverflow(page)).toBe(false);
  136 |     await context.close();
  137 |   });
  138 | });
  139 | 
```
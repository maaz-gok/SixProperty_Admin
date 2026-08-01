# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Auth/admin-login-page-load.spec.js >> Admin Login - Branding >> login logo matches the reference brand asset (Resources/Correct_Logo.png) @regression
- Location: tests/Auth/admin-login-page-load.spec.js:58:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByText('SIX PM', { exact: true })
Expected: "S:PM"
Received: "SIX PM"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByText('SIX PM', { exact: true })
    14 × locator resolved to <span class="text-xl font-light tracking-[0.35em] text-foreground">SIX PM</span>
       - unexpected value "SIX PM"

```

```yaml
- text: SIX PM
```

# Test source

```ts
  1   | import { test, expect } from '../../src/fixtures/base.js';
  2   | import { LoginPage } from '../../src/pages/LoginPage.js';
  3   | 
  4   | test.describe('Admin Login - Page Load', () => {
  5   |   test('login page loads with no console or network errors @smoke', async ({ page }) => {
  6   |     const consoleErrors = [];
  7   |     const failedRequests = [];
  8   |     page.on('console', (msg) => {
  9   |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  10  |     });
  11  |     page.on('response', (res) => {
  12  |       if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  13  |     });
  14  | 
  15  |     const login = new LoginPage(page);
  16  |     await login.goto();
  17  | 
  18  |     await expect(page).toHaveURL(/\/sign-in$/);
  19  |     await expect(login.emailInput).toBeVisible();
  20  |     await expect(login.passwordInput).toBeVisible();
  21  |     await expect(login.loginButton).toBeVisible();
  22  |     expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  23  |     expect(failedRequests, `Unexpected failed requests: ${failedRequests.join('; ')}`).toHaveLength(0);
  24  |   });
  25  | 
  26  |   test('baseline form layout renders without breaking @regression', async ({ page }) => {
  27  |     const login = new LoginPage(page);
  28  |     await login.goto();
  29  | 
  30  |     await expect(login.heading).toBeVisible();
  31  |     await expect(login.emailInput).toBeVisible();
  32  |     await expect(login.passwordInput).toBeVisible();
  33  |     await expect(login.forgotPasswordLink).toBeVisible();
  34  |     await expect(login.loginButton).toBeVisible();
  35  | 
  36  |     const viewportWidth = page.viewportSize().width;
  37  |     const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  38  |     expect(scrollWidth, 'Page should not cause horizontal scrolling').toBeLessThanOrEqual(viewportWidth);
  39  |   });
  40  | 
  41  |   test('direct navigation and reload keep the login page stable @regression', async ({ page }) => {
  42  |     await test.step('direct navigation resolves to sign-in', async () => {
  43  |       const login = new LoginPage(page);
  44  |       await login.goto();
  45  |       await expect(page).toHaveURL(/\/sign-in$/);
  46  |     });
  47  | 
  48  |     await test.step('reload preserves the login page state', async () => {
  49  |       await page.reload({ waitUntil: 'domcontentloaded' });
  50  |       await expect(page).toHaveURL(/\/sign-in$/);
  51  |       const login = new LoginPage(page);
  52  |       await expect(login.loginButton).toBeVisible();
  53  |     });
  54  |   });
  55  | });
  56  | 
  57  | test.describe('Admin Login - Branding', () => {
  58  |   test('login logo matches the reference brand asset (Resources/Correct_Logo.png) @regression', async ({ page }) => {
  59  |     // Resources/Correct_Logo.png renders the wordmark "S:PM". The rendered
  60  |     // login logo is expected to match; a mismatch is a real UI bug (see
  61  |     // specs/admin-login.md 18.1 and Bugs/ for the filed report).
  62  |     const login = new LoginPage(page);
  63  |     await login.goto();
  64  | 
  65  |     await expect(login.logo).toBeVisible();
> 66  |     await expect(login.logo).toHaveText('S:PM');
      |                              ^ Error: expect(locator).toHaveText(expected) failed
  67  |   });
  68  | 
  69  |   test('logo remains visible and legible across viewport sizes @regression', async ({ page }) => {
  70  |     const login = new LoginPage(page);
  71  |     await login.goto();
  72  | 
  73  |     for (const size of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  74  |       await test.step(`viewport ${size.width}x${size.height}`, async () => {
  75  |         await page.setViewportSize(size);
  76  |         await expect(login.logo).toBeVisible();
  77  |         const fontSize = await login.logo.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  78  |         expect(fontSize, 'Logo text should not collapse to an unreadable size').toBeGreaterThan(8);
  79  |       });
  80  |     }
  81  |   });
  82  | });
  83  | 
  84  | test.describe('Admin Login - Performance Observations', () => {
  85  |   test('page load timing stays within a generous baseline @regression', async ({ page }) => {
  86  |     const login = new LoginPage(page);
  87  |     await login.goto();
  88  |     await page.waitForLoadState('load');
  89  | 
  90  |     const timing = await page.evaluate(() => {
  91  |       const [nav] = performance.getEntriesByType('navigation');
  92  |       return { loadTime: nav.loadEventEnd - nav.startTime, domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime };
  93  |     });
  94  |     console.log('[perf] load event:', timing.loadTime, 'ms | DOMContentLoaded:', timing.domContentLoaded, 'ms');
  95  | 
  96  |     // Generous, non-strict regression guard — this scenario is observational
  97  |     // per specs/admin-login.md 16.1, not a tight performance budget.
  98  |     expect(timing.loadTime).toBeLessThan(8000);
  99  |   });
  100 | });
  101 | 
```
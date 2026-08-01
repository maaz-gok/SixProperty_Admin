# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Auth/admin-login-a11y-responsive.spec.js >> Admin Login - Accessibility >> email and password fields have a programmatically associated accessible label @regression
- Location: tests/Auth/admin-login-a11y-responsive.spec.js:47:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Email')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel('Email')

```

```yaml
- region "Notifications alt+T"
- text: SIX PM
- heading "Welcome Back" [level=1]
- text: Email
- textbox "john.david@gmail.com"
- text: Password
- textbox "Enter your password"
- button
- link "Forgot Password?":
  - /url: /forgot-password
  - button "Forgot Password?"
- button "Log In"
```

# Test source

```ts
  1   | import { test, expect } from '../../src/fixtures/base.js';
  2   | import { LoginPage } from '../../src/pages/LoginPage.js';
  3   | import wrongCredentials from '../data/wrong-credentials.json' with { type: 'json' };
  4   | import adminCredentials from '../data/credentials.json' with { type: 'json' };
  5   | 
  6   | test.describe('Admin Login - Keyboard Accessibility', () => {
  7   |   test('the full login flow is completable using only the keyboard @critical', async ({ page }) => {
  8   |     const login = new LoginPage(page);
  9   |     await login.goto();
  10  | 
  11  |     await page.locator('body').click({ position: { x: 5, y: 5 } });
  12  |     await page.keyboard.press('Tab');
  13  |     await expect(login.emailInput).toBeFocused();
  14  |     await page.keyboard.type(adminCredentials.email);
  15  | 
  16  |     await page.keyboard.press('Tab');
  17  |     await expect(login.passwordInput).toBeFocused();
  18  |     await page.keyboard.type(adminCredentials.password);
  19  |     await page.keyboard.press('Enter');
  20  | 
  21  |     await expect(page).toHaveURL(/\/dashboard$/);
  22  |   });
  23  | 
  24  |   test('focus indicators remain visible through the whole tab sequence @regression', async ({ page }) => {
  25  |     const login = new LoginPage(page);
  26  |     await login.goto();
  27  | 
  28  |     const controls = [login.emailInput, login.passwordInput, login.passwordVisibilityToggle, login.forgotPasswordLink, login.loginButton];
  29  |     for (const control of controls) {
  30  |       await control.focus();
  31  |       await expect(control).toBeFocused();
  32  |       const outline = await control.evaluate((el) => {
  33  |         const style = getComputedStyle(el);
  34  |         return `${style.outlineStyle} ${style.outlineWidth} ${style.boxShadow}`;
  35  |       });
  36  |       expect(outline).not.toBe('none 0px none');
  37  |     }
  38  |   });
  39  | });
  40  | 
  41  | test.describe('Admin Login - Accessibility', () => {
  42  |   // Confirmed real gap: the visible <label> elements for Email and Password
  43  |   // are not programmatically associated (no for/id, no wrapping, no
  44  |   // aria-labelledby), so getByLabel() cannot resolve either field, and
  45  |   // neither field exposes a required/aria-required state. Filed as a bug
  46  |   // (see Bugs/) — left failing intentionally rather than weakened.
  47  |   test('email and password fields have a programmatically associated accessible label @regression', async ({ page }) => {
  48  |     const login = new LoginPage(page);
  49  |     await login.goto();
  50  | 
> 51  |     await expect(page.getByLabel('Email')).toBeVisible();
      |                                            ^ Error: expect(locator).toBeVisible() failed
  52  |     await expect(page.getByLabel('Password')).toBeVisible();
  53  |   });
  54  | 
  55  |   test('required fields expose their required state to assistive tech @regression', async ({ page }) => {
  56  |     const login = new LoginPage(page);
  57  |     await login.goto();
  58  | 
  59  |     const emailRequired = await login.emailInput.evaluate(
  60  |       (el) => el.required || el.getAttribute('aria-required') === 'true'
  61  |     );
  62  |     const passwordRequired = await login.passwordInput.evaluate(
  63  |       (el) => el.required || el.getAttribute('aria-required') === 'true'
  64  |     );
  65  |     expect(emailRequired, 'Email field should expose a required state').toBe(true);
  66  |     expect(passwordRequired, 'Password field should expose a required state').toBe(true);
  67  |   });
  68  | });
  69  | 
  70  | test.describe('Admin Login - Responsive Layout', () => {
  71  |   const viewports = [
  72  |     { name: 'desktop', width: 1440, height: 900 },
  73  |     { name: 'tablet-portrait', width: 768, height: 1024 },
  74  |     { name: 'tablet-landscape', width: 1024, height: 768 },
  75  |     { name: 'mobile-portrait', width: 390, height: 844 },
  76  |     { name: 'mobile-landscape', width: 844, height: 390 },
  77  |   ];
  78  | 
  79  |   for (const viewport of viewports) {
  80  |     test(`form stays within the viewport with no overflow (${viewport.name}) @regression`, async ({ page }) => {
  81  |       await page.setViewportSize({ width: viewport.width, height: viewport.height });
  82  |       const login = new LoginPage(page);
  83  |       await login.goto();
  84  | 
  85  |       await expect(login.emailInput).toBeVisible();
  86  |       await expect(login.passwordInput).toBeVisible();
  87  |       await expect(login.loginButton).toBeVisible();
  88  | 
  89  |       const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  90  |       expect(scrollWidth, `Horizontal overflow at ${viewport.name}`).toBeLessThanOrEqual(viewport.width);
  91  |     });
  92  |   }
  93  | 
  94  |   test('interactive elements meet a minimum touch target size on mobile @regression', async ({ page }) => {
  95  |     await page.setViewportSize({ width: 390, height: 844 });
  96  |     const login = new LoginPage(page);
  97  |     await login.goto();
  98  | 
  99  |     // WCAG 2.5.8 (AA) minimum target size is 24x24 CSS px. The Forgot
  100 |     // Password link measures ~20px tall on mobile — a real gap, filed as a
  101 |     // bug (see Bugs/) — left failing intentionally rather than weakened.
  102 |     for (const [name, control] of Object.entries({
  103 |       email: login.emailInput,
  104 |       password: login.passwordInput,
  105 |       loginButton: login.loginButton,
  106 |       forgotPasswordLink: login.forgotPasswordLink,
  107 |     })) {
  108 |       const box = await control.boundingBox();
  109 |       expect(box.height, `${name} height below 24px minimum`).toBeGreaterThanOrEqual(24);
  110 |     }
  111 |   });
  112 | });
  113 | 
```
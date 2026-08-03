# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Auth/admin-forgot-password-known-issues.spec.js >> Admin Forgot Password - Known Issue Verification >> an invalid email shows the app's own feedback even on a fresh, untouched form @regression
- Location: tests/Auth/admin-forgot-password-known-issues.spec.js:34:7

# Error details

```
Error: The app's own styled error should render on the very first submit, not only after an earlier failed attempt has touched the field

expect(locator).toBeVisible() failed

Locator: getByText(/\*Email is required|\*Please enter a valid email address/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - The app's own styled error should render on the very first submit, not only after an earlier failed attempt has touched the field with timeout 5000ms
  - waiting for getByText(/\*Email is required|\*Please enter a valid email address/)

```

```yaml
- region "Notifications alt+T"
- text: SIX PM
- heading "Forgot Your Password?" [level=1]
- paragraph: Enter your email to receive a code for password reset.
- text: Email
- textbox "john.david@gmail.com": not-an-email.com
- button "Send code"
- text: Already have an account? Log in
- link "here":
  - /url: /sign-in
```

# Test source

```ts
  1  | import { test, expect } from '../../src/fixtures/base.js';
  2  | import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
  3  | import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };
  4  | 
  5  | test.describe('Admin Forgot Password - Known Issue Verification', () => {
  6  |   // Confirmed real gap: submitting a non-existent email surfaces "Unable to
  7  |   // find the user." instead of the generic "OTP has been sent" toast shown
  8  |   // for a real account, so the endpoint leaks which admin emails exist.
  9  |   // Filed as a bug (see Bugs/) — left failing intentionally rather than
  10 |   // weakened.
  11 |   test('an unknown email does not reveal account existence @regression', async ({ page }) => {
  12 |     const forgotPassword = new ForgotPasswordPage(page);
  13 |     await forgotPassword.goto();
  14 |     await forgotPassword.fillEmail(forgotPasswordData.unknownEmail);
  15 |     await forgotPassword.submit();
  16 | 
  17 |     await expect(
  18 |       page.getByText('Unable to find the user.'),
  19 |       'Response for an unknown email should not differ from a known one'
  20 |     ).not.toBeVisible();
  21 |   });
  22 | 
  23 |   // Confirmed real gap: the form is missing `noValidate`, so on a genuinely
  24 |   // fresh page load, an invalid email triggers the browser's own native
  25 |   // HTML5 validation tooltip instead of the app's styled "*Please enter a
  26 |   // valid email address" message — React's submit handler never runs,
  27 |   // because the browser blocks native submission first. The app's own
  28 |   // message only starts rendering once the field has been "touched" by an
  29 |   // earlier failed submit (e.g. an empty-field submit, which passes native
  30 |   // validation trivially and reaches React). See
  31 |   // Bugs/ForgotPassword/admin-forgot-password-silent-format-validation.md
  32 |   // for screenshots of both states. Left failing intentionally rather than
  33 |   // weakened.
  34 |   test('an invalid email shows the app\'s own feedback even on a fresh, untouched form @regression', async ({ page }) => {
  35 |     const forgotPassword = new ForgotPasswordPage(page);
  36 |     await forgotPassword.goto();
  37 |     await forgotPassword.fillEmail(forgotPasswordData.invalidEmailFormat);
  38 | 
  39 |     // The native tooltip itself lives outside the page's DOM/accessibility
  40 |     // tree (Playwright can't assert on it directly), but the underlying
  41 |     // native constraint-validation state IS exposed via the input element —
  42 |     // confirming the browser considers the field invalid before submission
  43 |     // is even attempted.
  44 |     await expect(forgotPassword.emailInput.evaluate((el) => el.validity.valid)).resolves.toBe(false);
  45 | 
  46 |     await forgotPassword.submit();
  47 | 
  48 |     await expect(
  49 |       forgotPassword.emailError,
  50 |       'The app\'s own styled error should render on the very first submit, not only after an earlier failed attempt has touched the field'
> 51 |     ).toBeVisible();
     |       ^ Error: The app's own styled error should render on the very first submit, not only after an earlier failed attempt has touched the field
  52 |   });
  53 | });
  54 | 
```
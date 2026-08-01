import { test, expect } from '../../src/fixtures/base.js';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };

test.describe('Admin Forgot Password - Form Components', () => {
  test('all form components are present and accessible @smoke', async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();

    await expect(forgotPassword.logo).toBeVisible();
    await expect(forgotPassword.heading).toBeVisible();
    await expect(forgotPassword.instructions).toBeVisible();
    await expect(forgotPassword.emailInput).toBeVisible();
    await expect(forgotPassword.sendCodeButton).toBeVisible();
    await expect(forgotPassword.loginLink).toBeVisible();
  });

  test('"Log in here" returns to sign-in @regression', async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.loginLink.click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

test.describe('Admin Forgot Password - Email Validation', () => {
  test('empty email shows a required validation error and sends no request @critical', async ({ page }) => {
    const forgotPasswordRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/forgot-password')) forgotPasswordRequests.push(req.url());
    });

    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.submit();

    await expect(forgotPassword.emailError).toBeVisible();
    expect(forgotPasswordRequests, 'No request should reach the forgot-password endpoint from an empty form').toHaveLength(0);
  });

  test('invalid email format is blocked once the field has been touched @critical', async ({ page }) => {
    const forgotPasswordRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/forgot-password')) forgotPasswordRequests.push(req.url());
    });

    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();

    // The format check only starts rendering feedback after the field has
    // been "touched" by an earlier failed submit — see the known-issue test
    // in admin-forgot-password-known-issues.spec.js for the fresh-page gap.
    await test.step('touch the field via an empty submit', async () => {
      await forgotPassword.submit();
      await expect(forgotPassword.emailError).toBeVisible();
    });

    await forgotPassword.fillEmail(forgotPasswordData.invalidEmailFormat);
    await forgotPassword.submit();

    await expect(forgotPassword.emailError).toBeVisible();
    expect(forgotPasswordRequests, 'No request should reach the forgot-password endpoint for a malformed email').toHaveLength(0);
  });
});

test.describe('Admin Forgot Password - Successful Request', () => {
  test('a valid account email navigates to OTP verification @smoke', async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    const verifyOtp = await forgotPassword.requestCode(forgotPasswordData.testAccount.email);

    await expect(page).toHaveURL(/\/verify-otp$/);
    await expect(verifyOtp.heading).toBeVisible();
  });
});

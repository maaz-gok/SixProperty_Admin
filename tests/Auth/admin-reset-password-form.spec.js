import { test, expect } from '../../src/fixtures/base.js';
import { ResetPasswordPage } from '../../src/pages/ResetPasswordPage.js';
import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };

test.describe('Admin Reset Password - Form Components', () => {
  test('all form components are present and accessible @smoke', async ({ page }) => {
    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.goto();

    await expect(resetPassword.logo).toBeVisible();
    await expect(resetPassword.heading).toBeVisible();
    await expect(resetPassword.instructions).toBeVisible();
    await expect(resetPassword.newPasswordInput).toBeVisible();
    await expect(resetPassword.newPasswordToggle).toBeVisible();
    await expect(resetPassword.confirmPasswordInput).toBeVisible();
    await expect(resetPassword.confirmPasswordToggle).toBeVisible();
    await expect(resetPassword.resetButton).toBeVisible();
    await expect(resetPassword.loginLink).toBeVisible();
  });
});

test.describe('Admin Reset Password - Validation', () => {
  // These checks only exercise client-side validation, which never reaches
  // the network — see specs/forgot-password.md Scenario 7.1's Observation
  // for why an actual submission is deliberately not automated here.
  test('empty submission shows required validation on both fields @critical', async ({ page }) => {
    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.goto();
    await resetPassword.submit();

    await expect(resetPassword.newPasswordError).toBeVisible();
    await expect(resetPassword.confirmPasswordError).toBeVisible();
  });

  test('mismatched passwords are blocked before submission @critical', async ({ page }) => {
    const resetRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/reset-password')) resetRequests.push(req.url());
    });

    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.goto();
    await resetPassword.fillNewPassword(forgotPasswordData.mismatchedPasswords.newPassword);
    await resetPassword.fillConfirmPassword(forgotPasswordData.mismatchedPasswords.confirmPassword);
    await resetPassword.submit();

    await expect(resetPassword.confirmPasswordError).toBeVisible();
    expect(resetRequests, 'No request should reach a reset-password endpoint while passwords mismatch').toHaveLength(0);
  });
});

test.describe('Admin Reset Password - Password Visibility Toggles', () => {
  test('each field is masked by default and its toggle is independent @regression', async ({ page }) => {
    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.goto();
    await resetPassword.fillNewPassword('Sup3rSecret!');
    await resetPassword.fillConfirmPassword('Sup3rSecret!');

    await expect(resetPassword.newPasswordInput).toHaveAttribute('type', 'password');
    await expect(resetPassword.confirmPasswordInput).toHaveAttribute('type', 'password');

    await resetPassword.newPasswordToggle.click();
    await expect(resetPassword.newPasswordInput).toHaveAttribute('type', 'text');
    await expect(resetPassword.confirmPasswordInput, 'Toggling New Password should not affect Confirm Password').toHaveAttribute('type', 'password');

    await resetPassword.confirmPasswordToggle.click();
    await expect(resetPassword.confirmPasswordInput).toHaveAttribute('type', 'text');
  });
});

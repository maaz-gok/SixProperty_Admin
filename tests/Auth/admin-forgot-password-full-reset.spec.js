import { test, expect } from '../../src/fixtures/base.js';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { fetchOtpFromGmail } from '../../src/utils/gmail-otp.js';
import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };

const { email, password: originalPassword } = forgotPasswordData.testAccount;
const otpInboxQuery = `to:${email}`;
const TEMP_PASSWORD = 'TempReset@2026!';

/** Runs one full request-code -> real-OTP -> reset-password cycle, setting the dedicated test account's password to `newPassword`. */
async function resetPasswordTo(page, newPassword) {
  const sentAfterMs = Date.now();
  const forgotPassword = new ForgotPasswordPage(page);
  await forgotPassword.goto();
  const verifyOtp = await forgotPassword.requestCode(email);

  const otp = await fetchOtpFromGmail(otpInboxQuery, { sentAfterMs, timeoutMs: 60_000, pollIntervalMs: 4_000 });
  const resetPassword = await verifyOtp.verify(otp);
  const success = await resetPassword.resetPassword(newPassword);
  await expect(success.heading).toBeVisible();
}

test.describe('Admin Forgot Password - Full Reset Cycle', () => {
  // This test actually changes tests/data/forgot-password.json's dedicated
  // test account's real password (twice — to a temp value, then back), and
  // must never run alongside another test that also requests a code for
  // the same account — the server only keeps one OTP active per account,
  // so a concurrent request would invalidate this test's in-flight code.
  // Run this file on its own (not mixed into a full parallel `npx
  // playwright test`) to guarantee that — see specs/forgot-password.md,
  // "Not covered", for the full reasoning.
  test.describe.configure({ mode: 'serial' });

  test('a full reset actually changes the password, the new password logs in, and it can be reset back @flaky-risk', async ({ page }) => {
    test.setTimeout(180_000);

    await test.step('reset password to a temporary value', () => resetPasswordTo(page, TEMP_PASSWORD));

    let dashboard;
    await test.step('log in with the new password', async () => {
      const login = new LoginPage(page);
      await login.goto();
      dashboard = await login.loginAs({ email, password: TEMP_PASSWORD });
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    await test.step('sign out', async () => {
      await dashboard.signOutButton.click();
      await expect(page).toHaveURL(/\/sign-in$/);
    });

    await test.step('reset password back to the original value', () => resetPasswordTo(page, originalPassword));

    await test.step('log in again with the original password to confirm restoration', async () => {
      const login = new LoginPage(page);
      await login.goto();
      await login.loginAs({ email, password: originalPassword });
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });
});

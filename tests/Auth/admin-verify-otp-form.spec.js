import { test, expect } from '../../src/fixtures/base.js';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
import { fetchOtpFromGmail } from '../../src/utils/gmail-otp.js';
import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };

const otpInboxQuery = `to:${forgotPasswordData.testAccount.email}`;

// Every test in this file requests a code for the same dedicated
// forgot-password test account (see tests/data/forgot-password.json), and
// the server only keeps one OTP active per account at a time — running them
// in parallel lets a later request silently invalidate an earlier test's
// in-flight code. Serial execution avoids that self-collision.
test.describe.configure({ mode: 'serial' });

/** Requests a fresh code for the test account and lands on a live /verify-otp page. */
async function goToVerifyOtp(page) {
  const forgotPassword = new ForgotPasswordPage(page);
  await forgotPassword.goto();
  return forgotPassword.requestCode(forgotPasswordData.testAccount.email);
}

test.describe('Admin Verify OTP - Form Components', () => {
  test('all form components are present and the submit button starts disabled @smoke', async ({ page }) => {
    const verifyOtp = await goToVerifyOtp(page);

    await expect(verifyOtp.logo).toBeVisible();
    await expect(verifyOtp.heading).toBeVisible();
    await expect(verifyOtp.otpInput).toBeVisible();
    await expect(verifyOtp.verifyButton).toBeVisible();
    await expect(verifyOtp.verifyButton).toBeDisabled();
    await expect(verifyOtp.resendButton).toBeVisible();
  });
});

test.describe('Admin Verify OTP - Validation', () => {
  test('an incomplete code keeps the submit button disabled @regression', async ({ page }) => {
    // The "OTP must be 6 digits" inline text only renders after the field
    // has been through a prior submit-and-revalidate cycle (submit 6
    // digits, then delete some) — see specs/forgot-password.md Scenario
    // 4.2. On a fresh page it's absent, which is fine: the disabled button
    // is the real-time signal, since an incomplete code can never actually
    // be submitted.
    const verifyOtp = await goToVerifyOtp(page);
    await verifyOtp.fillOtp(forgotPasswordData.incompleteOtp);

    await expect(verifyOtp.verifyButton).toBeDisabled();
  });

  test('a well-formed but incorrect code shows an attempts-remaining error @critical', async ({ page }) => {
    const verifyOtp = await goToVerifyOtp(page);

    await test.step('submit a wrong code', async () => {
      await verifyOtp.fillOtp(forgotPasswordData.wrongOtp);
      await verifyOtp.submit();
    });

    await expect(page.getByText(/Invalid OTP\. \d+ attempt\(s\) remaining\./)).toBeVisible();
    await expect(page).toHaveURL(/\/verify-otp$/);
  });
});

test.describe('Admin Verify OTP - Resend', () => {
  test('resend re-triggers the send-code flow @regression', async ({ page }) => {
    const verifyOtp = await goToVerifyOtp(page);
    await verifyOtp.resend();

    await expect(page.getByText('OTP has been sent to your email.')).toBeVisible();
  });
});

test.describe('Admin Verify OTP - Real OTP', () => {
  test('the real emailed code verifies successfully and reaches Reset Password @smoke @flaky-risk', async ({ page }) => {
    // Depends on live Gmail delivery via CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN
    // (src/utils/gmail-otp.js) rather than pure UI interaction, so it gets
    // more headroom than the default test timeout.
    test.setTimeout(90_000);

    // Captured immediately before the request that triggers the email, so
    // the fetch below can pick out this run's OTP specifically (see
    // src/utils/gmail-otp.js for why a plain "most recent" or "unseen id"
    // check isn't precise enough on its own).
    const sentAfterMs = Date.now();

    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    const verifyOtp = await forgotPassword.requestCode(forgotPasswordData.testAccount.email);

    const otp = await test.step('fetch the real OTP from Gmail', () =>
      fetchOtpFromGmail(otpInboxQuery, { sentAfterMs, timeoutMs: 60_000, pollIntervalMs: 4_000 })
    );

    const resetPassword = await verifyOtp.verify(otp);

    await expect(page).toHaveURL(/\/reset-password$/);
    await expect(resetPassword.heading).toBeVisible();
  });
});

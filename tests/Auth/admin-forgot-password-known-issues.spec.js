import { test, expect } from '../../src/fixtures/base.js';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
import forgotPasswordData from '../data/forgot-password.json' with { type: 'json' };

test.describe('Admin Forgot Password - Known Issue Verification', () => {
  // Confirmed real gap: submitting a non-existent email surfaces "Unable to
  // find the user." instead of the generic "OTP has been sent" toast shown
  // for a real account, so the endpoint leaks which admin emails exist.
  // Filed as a bug (see Bugs/) — left failing intentionally rather than
  // weakened.
  test('an unknown email does not reveal account existence @regression', async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.fillEmail(forgotPasswordData.unknownEmail);
    await forgotPassword.submit();

    await expect(
      page.getByText('Unable to find the user.'),
      'Response for an unknown email should not differ from a known one'
    ).not.toBeVisible();
  });

  // Confirmed real gap: the form is missing `noValidate`, so on a genuinely
  // fresh page load, an invalid email triggers the browser's own native
  // HTML5 validation tooltip instead of the app's styled "*Please enter a
  // valid email address" message — React's submit handler never runs,
  // because the browser blocks native submission first. The app's own
  // message only starts rendering once the field has been "touched" by an
  // earlier failed submit (e.g. an empty-field submit, which passes native
  // validation trivially and reaches React). See
  // Bugs/ForgotPassword/admin-forgot-password-silent-format-validation.md
  // for screenshots of both states. Left failing intentionally rather than
  // weakened.
  test('an invalid email shows the app\'s own feedback even on a fresh, untouched form @regression', async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.fillEmail(forgotPasswordData.invalidEmailFormat);

    // The native tooltip itself lives outside the page's DOM/accessibility
    // tree (Playwright can't assert on it directly), but the underlying
    // native constraint-validation state IS exposed via the input element —
    // confirming the browser considers the field invalid before submission
    // is even attempted.
    await expect(forgotPassword.emailInput.evaluate((el) => el.validity.valid)).resolves.toBe(false);

    await forgotPassword.submit();

    await expect(
      forgotPassword.emailError,
      'The app\'s own styled error should render on the very first submit, not only after an earlier failed attempt has touched the field'
    ).toBeVisible();
  });
});

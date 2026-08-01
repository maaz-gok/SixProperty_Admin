import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';

test.describe('Admin Login - Known Issue Verification', () => {
  test('the "Welcome Back" heading does not turn red when a validation error is shown @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const colorBefore = await login.heading.evaluate((el) => getComputedStyle(el).color);
    await login.submit();
    await expect(login.emailError).toBeVisible();
    const colorAfter = await login.heading.evaluate((el) => getComputedStyle(el).color);

    expect(colorAfter, 'Heading color should be unaffected by validation errors').toBe(colorBefore);
    expect(colorAfter, 'Heading should never render as red').not.toMatch(/rgb\(2[0-4]\d, 0?\d{1,2}, 0?\d{1,2}\)/);
  });

  // Confirmed real gap: the Email/Password field labels themselves turn red
  // via a `data-[error=true]:text-destructive` rule — per product decision,
  // only the "*...is required" message should be red, not the label. Filed
  // as a bug (see Bugs/) — left failing intentionally rather than weakened.
  test('field labels do not turn red on validation error @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const emailColorBefore = await login.emailLabel.evaluate((el) => getComputedStyle(el).color);
    const passwordColorBefore = await login.passwordLabel.evaluate((el) => getComputedStyle(el).color);

    await login.submit();
    await expect(login.emailError).toBeVisible();
    await expect(login.passwordError).toBeVisible();

    const emailColorAfter = await login.emailLabel.evaluate((el) => getComputedStyle(el).color);
    const passwordColorAfter = await login.passwordLabel.evaluate((el) => getComputedStyle(el).color);

    expect(emailColorAfter, 'Email label color should be unaffected by validation errors').toBe(emailColorBefore);
    expect(passwordColorAfter, 'Password label color should be unaffected by validation errors').toBe(passwordColorBefore);
  });

  // Confirmed real gap: the password-visibility toggle, the Login button, and
  // the inner "Forgot Password?" button all resolve to `cursor: default`
  // instead of `pointer`. Filed as a bug (see Bugs/) — left failing
  // intentionally rather than weakened.
  test('every interactive login control shows a pointer cursor on hover @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('placeholder');

    const forgotPasswordInnerButton = login.forgotPasswordLink.getByRole('button');

    for (const [name, control] of Object.entries({
      passwordVisibilityToggle: login.passwordVisibilityToggle,
      loginButton: login.loginButton,
      forgotPasswordInnerButton,
    })) {
      const cursor = await control.evaluate((el) => getComputedStyle(el).cursor);
      expect(cursor, `${name} should show a pointer cursor on hover`).toBe('pointer');
    }
  });
});

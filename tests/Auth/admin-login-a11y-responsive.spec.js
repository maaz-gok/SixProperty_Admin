import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import wrongCredentials from '../data/wrong-credentials.json' with { type: 'json' };

test.describe('Admin Login - Keyboard Accessibility', () => {
  test('the full login flow is completable using only the keyboard @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Tab');
    await expect(login.emailInput).toBeFocused();
    await page.keyboard.type(process.env.ADMIN_EMAIL);

    await page.keyboard.press('Tab');
    await expect(login.passwordInput).toBeFocused();
    await page.keyboard.type(process.env.ADMIN_PASSWORD);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('focus indicators remain visible through the whole tab sequence @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const controls = [login.emailInput, login.passwordInput, login.passwordVisibilityToggle, login.forgotPasswordLink, login.loginButton];
    for (const control of controls) {
      await control.focus();
      await expect(control).toBeFocused();
      const outline = await control.evaluate((el) => {
        const style = getComputedStyle(el);
        return `${style.outlineStyle} ${style.outlineWidth} ${style.boxShadow}`;
      });
      expect(outline).not.toBe('none 0px none');
    }
  });
});

test.describe('Admin Login - Accessibility', () => {
  // Confirmed real gap: the visible <label> elements for Email and Password
  // are not programmatically associated (no for/id, no wrapping, no
  // aria-labelledby), so getByLabel() cannot resolve either field, and
  // neither field exposes a required/aria-required state. Filed as a bug
  // (see Bugs/) — left failing intentionally rather than weakened.
  test('email and password fields have a programmatically associated accessible label @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('required fields expose their required state to assistive tech @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const emailRequired = await login.emailInput.evaluate(
      (el) => el.required || el.getAttribute('aria-required') === 'true'
    );
    const passwordRequired = await login.passwordInput.evaluate(
      (el) => el.required || el.getAttribute('aria-required') === 'true'
    );
    expect(emailRequired, 'Email field should expose a required state').toBe(true);
    expect(passwordRequired, 'Password field should expose a required state').toBe(true);
  });
});

test.describe('Admin Login - Responsive Layout', () => {
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'mobile-portrait', width: 390, height: 844 },
    { name: 'mobile-landscape', width: 844, height: 390 },
  ];

  for (const viewport of viewports) {
    test(`form stays within the viewport with no overflow (${viewport.name}) @regression`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const login = new LoginPage(page);
      await login.goto();

      await expect(login.emailInput).toBeVisible();
      await expect(login.passwordInput).toBeVisible();
      await expect(login.loginButton).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `Horizontal overflow at ${viewport.name}`).toBeLessThanOrEqual(viewport.width);
    });
  }

  test('interactive elements meet a minimum touch target size on mobile @regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const login = new LoginPage(page);
    await login.goto();

    // WCAG 2.5.8 (AA) minimum target size is 24x24 CSS px. The Forgot
    // Password link measures ~20px tall on mobile — a real gap, filed as a
    // bug (see Bugs/) — left failing intentionally rather than weakened.
    for (const [name, control] of Object.entries({
      email: login.emailInput,
      password: login.passwordInput,
      loginButton: login.loginButton,
      forgotPasswordLink: login.forgotPasswordLink,
    })) {
      const box = await control.boundingBox();
      expect(box.height, `${name} height below 24px minimum`).toBeGreaterThanOrEqual(24);
    }
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import invalidEmails from '../data/invalid-emails.json' with { type: 'json' };
import securityPayloads from '../data/security-payloads.json' with { type: 'json' };
import edgeCases from '../data/edge-case-inputs.json' with { type: 'json' };

test.describe('Admin Login - Form Components', () => {
  test('all form components are present and accessible @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.logo).toBeVisible();
    await expect(login.heading).toBeVisible();
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.passwordVisibilityToggle).toBeVisible();
    await expect(login.forgotPasswordLink).toBeVisible();
    await expect(login.loginButton).toBeVisible();
  });

  test('focus states are visibly distinct for every interactive control @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    for (const control of [login.emailInput, login.passwordInput, login.passwordVisibilityToggle, login.forgotPasswordLink, login.loginButton]) {
      await control.focus();
      const outline = await control.evaluate((el) => {
        const style = getComputedStyle(el);
        return `${style.outlineStyle} ${style.outlineWidth} ${style.boxShadow}`;
      });
      expect(outline, 'Focused control should have a visible outline or box-shadow').not.toBe('none 0px none');
    }
  });

  test('tab order moves through the form in a logical sequence @regression', async ({ page, browserName }) => {
    // WebKit's default Tab order (matching real Safari) only includes form
    // fields, not <a>/<button> elements, unless "Full Keyboard Access" is
    // on — so the toggle/link/button are unreachable via Tab here. That's
    // expected WebKit behavior, not an app bug; Chromium/Firefox cover the
    // full sequence.
    test.skip(browserName === 'webkit', 'WebKit excludes links/buttons from the default Tab order');

    const login = new LoginPage(page);
    await login.goto();

    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Tab');
    await expect(login.emailInput).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(login.passwordInput).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(login.passwordVisibilityToggle).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(login.forgotPasswordLink).toBeFocused();
    // The "Forgot Password?" control renders as an <a> wrapping a nested
    // <button> with the same label — both are natively focusable, so Tab
    // stops on it twice before reaching Log In. Confirmed via live trace;
    // worth flagging to the team as a redundant focus stop.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(login.loginButton).toBeFocused();
  });
});

test.describe('Admin Login - Email Field', () => {
  test('empty email shows a required validation error on submit @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('anyPassword123');
    await login.submit();
    await expect(login.emailError).toBeVisible();
  });

  test('invalid email formats are blocked before submission @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    for (const [caseName, value] of Object.entries({
      missingAt: invalidEmails.missingAt,
      missingDomain: invalidEmails.missingDomain,
      doubleAt: invalidEmails.doubleAt,
    })) {
      await test.step(caseName, async () => {
        await login.fillEmail(value);
        const isValid = await login.emailInput.evaluate((el) => el.validity.valid);
        expect(isValid, `"${value}" should be rejected as an invalid email format`).toBe(false);
      });
    }
  });

  test('valid email formats (case-insensitive) are accepted @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    for (const [caseName, value] of Object.entries({
      uppercase: invalidEmails.validUppercase,
      lowercase: invalidEmails.validLowercase,
    })) {
      await test.step(caseName, async () => {
        await login.fillEmail(value);
        const isValid = await login.emailInput.evaluate((el) => el.validity.valid);
        expect(isValid, `"${value}" should be accepted as a valid email format`).toBe(true);
      });
    }
  });

  test('unicode and emoji input does not crash the field @regression', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const login = new LoginPage(page);
    await login.goto();

    await login.fillEmail(edgeCases.unicodeEmail);
    await expect(login.emailInput).toHaveValue(edgeCases.unicodeEmail);
    await login.fillEmail(edgeCases.emojiEmail);
    await expect(login.emailInput).toHaveValue(edgeCases.emojiEmail);

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('a very long email is capped at the field maxlength and does not break the layout @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.emailInput).toHaveAttribute('maxlength', '50');

    await login.fillEmail(edgeCases.veryLongEmail);
    await expect(login.emailInput).toHaveValue(edgeCases.veryLongEmail.slice(0, 50));
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize().width);
  });

  test('SQL injection and XSS payloads are rejected by the email format constraint @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    for (const payload of [...securityPayloads.sqlInjection, ...securityPayloads.xss]) {
      await test.step(`payload: ${payload.slice(0, 30)}`, async () => {
        await login.fillEmail(payload);
        const isValid = await login.emailInput.evaluate((el) => el.validity.valid);
        expect(isValid, 'Injection payload should not satisfy the email format constraint').toBe(false);
      });
    }
  });

  test('pasted email value is accepted identically to typed input @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.evaluate((el, value) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, invalidEmails.validLowercase);
    await expect(login.emailInput).toHaveValue(invalidEmails.validLowercase);
  });
});

test.describe('Admin Login - Password Field', () => {
  test('password is masked by default @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('Sup3rSecret!');
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
  });

  test('empty password shows a required validation error on submit @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(invalidEmails.validLowercase);
    await login.submit();
    await expect(login.passwordError).toBeVisible();
  });

  test('leading/trailing spaces are preserved and long values are capped at maxlength @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.passwordInput).toHaveAttribute('maxlength', '50');

    await login.fillPassword(edgeCases.passwordWithLeadingSpace);
    await expect(login.passwordInput).toHaveValue(edgeCases.passwordWithLeadingSpace);

    await login.fillPassword(edgeCases.veryLongPassword);
    await expect(login.passwordInput).toHaveValue(edgeCases.veryLongPassword.slice(0, 50));
  });

  test('keyboard editing (type, select-all, delete) behaves as expected @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // macOS binds select-all to Cmd+A (Meta), not Ctrl+A; CI runners on
    // Linux use Ctrl+A. Match whichever OS is actually running the browser.
    const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';

    await login.passwordInput.pressSequentially('Sup3rSecret!');
    await expect(login.passwordInput).toHaveValue('Sup3rSecret!');
    await login.passwordInput.press(selectAll);
    await login.passwordInput.press('Backspace');
    await expect(login.passwordInput).toHaveValue('');
  });
});

test.describe('Admin Login - Password Visibility Toggle', () => {
  test('toggle switches the password field between masked and visible @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('Sup3rSecret!');

    await expect(login.passwordInput).toHaveAttribute('type', 'password');
    await login.togglePasswordVisibility();
    await expect(login.passwordInput).toHaveAttribute('type', 'text');
    await login.togglePasswordVisibility();
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
  });

  test('typed characters remain visible while toggled on @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('Sup3r');
    await login.togglePasswordVisibility();
    await login.passwordInput.click();
    await login.passwordInput.press('End');
    await login.passwordInput.pressSequentially('Secret!');
    await expect(login.passwordInput).toHaveValue('Sup3rSecret!');
    await expect(login.passwordInput).toHaveAttribute('type', 'text');
  });

  test('toggle is keyboard-operable via Enter and Space @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillPassword('Sup3rSecret!');

    await login.passwordVisibilityToggle.focus();
    await page.keyboard.press('Enter');
    await expect(login.passwordInput).toHaveAttribute('type', 'text');
    await page.keyboard.press('Space');
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Admin Login - Forgot Password', () => {
  test('link navigates to the forgot-password route @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('link is keyboard-operable and back navigation returns to sign-in @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.forgotPasswordLink.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/forgot-password$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});

import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { DashboardPage } from '../../src/pages/DashboardPage.js';
import wrongCredentials from '../data/wrong-credentials.json' with { type: 'json' };
import adminCredentials from '../data/credentials.json' with { type: 'json' };

test.describe('Admin Login - Login Button', () => {
  test('button stays clickable on an empty form and surfaces validation instead of a disabled state @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.loginButton).toBeEnabled();
    await login.submit();
    await expect(login.emailError).toBeVisible();
    await expect(login.passwordError).toBeVisible();
  });

  test('submits identically via click and via Enter key @smoke', async ({ page }) => {
    const login = new LoginPage(page);

    await test.step('submit via click', async () => {
      await login.goto();
      await login.fillEmail(wrongCredentials.wrongEmail.email);
      await login.fillPassword(wrongCredentials.wrongEmail.password);
      await login.submit();
      await expect(login.errorBanner).toBeVisible();
    });

    await test.step('submit via Enter key', async () => {
      await login.goto();
      await login.fillEmail(wrongCredentials.wrongEmail.email);
      await login.fillPassword(wrongCredentials.wrongEmail.password);
      await login.submitWithEnter();
      await expect(login.errorBanner).toBeVisible();
    });
  });

  test('button text reads exactly "Log In" @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.loginButton).toHaveText('Log In');
  });
});

test.describe('Admin Login - Validation Messages', () => {
  test('required-field messages show the correct text on empty submit @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submit();
    await expect(login.emailError).toHaveText('*Email is required');
    await expect(login.passwordError).toHaveText('*Password is required');
  });

  test('a corrected field clears its own error on the next submit attempt @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.submit();
    await expect(login.emailError).toBeVisible();
    await expect(login.passwordError).toBeVisible();

    await login.fillEmail(wrongCredentials.wrongEmail.email);
    await login.submit();
    await expect(login.emailError).not.toBeVisible();
    await expect(login.passwordError).toBeVisible();
  });
});

test.describe('Admin Login - Successful Login', () => {
  test('valid credentials redirect to the Dashboard @smoke', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.heading).toBeVisible();
    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });
});

test.describe('Admin Login - Failed Login', () => {
  test('wrong email shows a generic authentication error @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(wrongCredentials.wrongEmail.email);
    await login.fillPassword(wrongCredentials.wrongEmail.password);
    await login.submit();
    await expect(login.errorBanner).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('wrong password shows the same generic authentication error @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(adminCredentials.email);
    await login.fillPassword(wrongCredentials.wrongPassword.password);
    await login.submit();
    await expect(login.errorBanner).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('both wrong shows the same generic authentication error (no user enumeration) @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail(wrongCredentials.bothWrong.email);
    await login.fillPassword(wrongCredentials.bothWrong.password);
    await login.submit();
    await expect(login.errorBanner).toBeVisible();
  });

  test('a 5xx from the login API shows a user-facing error and leaves the form usable @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/auth/admin/login', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    await login.fillEmail(wrongCredentials.wrongEmail.email);
    await login.fillPassword(wrongCredentials.wrongEmail.password);
    await login.submit();

    await expect(page.getByText('Internal Server Error')).toBeVisible();
    await expect(login.loginButton).toBeEnabled();
  });

  test('a failed network request shows an error and does not hang the form @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.route('**/auth/admin/login', (route) => route.abort('failed'));

    await login.fillEmail(wrongCredentials.wrongEmail.email);
    await login.fillPassword(wrongCredentials.wrongEmail.password);
    await login.submit();

    await expect(page.getByText('Something went wrong.')).toBeVisible();
    await expect(login.loginButton).toBeEnabled();
  });

  // The Login button never disables during a pending request, so whether a
  // rapid double-click produces one or two requests depends on timing —
  // observed ~1-in-5 under parallel load. Genuinely intermittent, not a
  // flaky assertion: flagging rather than weakening it (see Bugs/).
  test('rapid double-click sends only one login request @flaky-risk', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const loginRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/admin/login')) loginRequests.push(req);
    });

    await login.fillEmail(wrongCredentials.wrongEmail.email);
    await login.fillPassword(wrongCredentials.wrongEmail.password);
    await Promise.all([login.loginButton.click(), login.loginButton.click()]);
    await page.waitForTimeout(1000);

    expect(loginRequests.length, 'Only one login request should be sent per submission').toBe(1);
  });
});

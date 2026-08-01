import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import securityPayloads from '../data/security-payloads.json' with { type: 'json' };

test.describe('Admin Login - Security', () => {
  test('no login request is sent while the form is in an invalid state @critical', async ({ page }) => {
    const loginRequests = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/admin/login')) loginRequests.push(req.url());
    });

    const login = new LoginPage(page);
    await login.goto();

    await test.step('empty form, click submit', async () => {
      await login.submit();
    });

    await test.step('invalid-format email, click submit', async () => {
      await login.fillEmail('not-an-email');
      await login.fillPassword('somePassword123');
      await login.submit();
    });

    await test.step('invalid-format email, submit via Enter', async () => {
      await login.submitWithEnter();
    });

    expect(loginRequests, 'No request should reach the login endpoint from an invalid form state').toHaveLength(0);
  });

  test('unauthenticated direct navigation to the Dashboard redirects to sign-in @critical', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('after logout, direct navigation and browser back both redirect to sign-in @critical', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    await expect(page).toHaveURL(/\/dashboard$/);

    await dashboard.signOutButton.click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('the password value is never written to the console @regression', async ({ page }) => {
    const password = 'Sup3rSecret!UniqueMarker';
    const consoleText = [];
    page.on('console', (msg) => consoleText.push(msg.text()));

    const login = new LoginPage(page);
    await login.goto();
    await login.fillEmail('wrong@example.com');
    await login.fillPassword(password);
    await login.submit();
    await page.waitForTimeout(500);

    const leaked = consoleText.some((text) => text.includes(password));
    expect(leaked, 'Password value should never appear in console output').toBe(false);
  });

  test('no credential or token value appears in the URL after login @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    await expect(page).toHaveURL(/\/dashboard$/);

    expect(page.url()).not.toContain(process.env.ADMIN_PASSWORD);
    expect(page.url()).not.toContain(encodeURIComponent(process.env.ADMIN_EMAIL));
  });

  test('XSS payloads submitted through the password field are never executed @critical', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    const login = new LoginPage(page);
    await login.goto();

    for (const payload of securityPayloads.xss) {
      await login.fillEmail('wrong@example.com');
      await login.fillPassword(payload);
      await login.submit();
      await page.waitForTimeout(300);
    }

    expect(dialogFired, 'No script from a submitted payload should execute').toBe(false);
  });
});

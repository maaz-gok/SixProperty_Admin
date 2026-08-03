import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { LandlordsPage } from '../../src/pages/LandlordsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import landlords from '../data/landlords.json' with { type: 'json' };

async function openLandlords(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const landlordsPage = new LandlordsPage(page);
  await landlordsPage.goto();
  await expect(landlordsPage.rows.first()).toBeVisible();
  return landlordsPage;
}

// IMPORTANT: nostaw22@gmail.com ("Jeremy") is a real client email, never a
// test account — every test below uses a disposable "Maaz Landlord ###"
// account instead, and restores its original status when done.
test.describe('Landlords - Suspend & Unsuspend', () => {
  // Confirmed real gap: clicking "Suspend" fires the request immediately
  // with no confirmation step of any kind. Filed as a bug (see
  // Bugs/Landlords/landlords-suspend-no-confirmation.md). This asserts the
  // CORRECT expected behaviour (a confirmation dialog must gate the action,
  // and the status must not change until it's accepted) and is left failing
  // intentionally until that's implemented, per the project's known-issue
  // convention (see tests/Dashboard/dashboard-sign-out.spec.js). The click
  // itself still fires the real request today regardless of this
  // assertion, so cleanup runs in a `finally` block to guarantee the
  // account is restored to Active even while this test is failing.
  test('Suspend requires confirmation before the account\'s status actually changes @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.disposableActiveLandlord;

    try {
      await landlordsPage.suspendButton(name).click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        landlordsPage.statusCell(name),
        'Status must not change until the confirmation dialog is accepted'
      ).toHaveText('Active');
    } finally {
      if (await landlordsPage.unsuspendButton(name).isVisible().catch(() => false)) {
        await landlordsPage.unsuspendButton(name).click();
        await expect(landlordsPage.statusCell(name)).toHaveText('Active');
      }
    }
  });

  test('Unsuspend requires confirmation before the account\'s status actually changes @critical', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.suspendedZeroCountLandlord;
    await expect(landlordsPage.statusCell(name)).toHaveText('Suspended');

    try {
      await landlordsPage.unsuspendButton(name).click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        landlordsPage.statusCell(name),
        'Status must not change until the confirmation dialog is accepted'
      ).toHaveText('Suspended');
    } finally {
      // This account's baseline fixture state is Suspended.
      if (await landlordsPage.suspendButton(name).isVisible().catch(() => false)) {
        await landlordsPage.suspendButton(name).click();
        await expect(landlordsPage.statusCell(name)).toHaveText('Suspended');
      }
    }
  });

  // Confirmed live with a delayed request: the button disables itself right
  // after the first click, before the request resolves. A true instant
  // dblclick() (two native click events a few ms apart, faster than a real
  // user's second click) can still slip a second request through, but a
  // realistic rapid re-click — the scenario this test targets — cannot,
  // because Playwright (like a real user's pointer) refuses to interact
  // with an already-disabled button.
  test('the Suspend button disables immediately, so a rapid second click cannot send a duplicate request @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.disposableActiveLandlord2;

    await page.route('**/admin/users/*/suspend', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });
    const suspendRequests = [];
    page.on('request', (req) => {
      if (req.method() === 'PATCH' && /\/admin\/users\/.+\/suspend$/.test(req.url())) suspendRequests.push(req.url());
    });

    const suspendButton = landlordsPage.suspendButton(name);
    await suspendButton.click();
    await expect(suspendButton).toBeDisabled();
    await expect(suspendButton.click({ timeout: 1000 })).rejects.toThrow();

    await expect(landlordsPage.statusCell(name)).toHaveText('Suspended', { timeout: 5000 });
    expect(suspendRequests, `Expected exactly one suspend request, got: ${suspendRequests.join(', ')}`).toHaveLength(1);

    // Cleanup: restore original Active status.
    await landlordsPage.unsuspendButton(name).click();
    await expect(landlordsPage.statusCell(name)).toHaveText('Active');
  });

  test('a failed suspend request leaves the row unchanged @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.disposableActiveLandlord3;

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.route('**/admin/users/*/suspend', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal server error', status: 500 }) })
    );

    await landlordsPage.suspendButton(name).click();

    // Row must not optimistically flip to Suspended on a failed request.
    await expect(landlordsPage.statusCell(name)).toHaveText('Active');
    await expect(landlordsPage.suspendButton(name)).toBeVisible();
    expect(pageErrors, `Unexpected unhandled page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });

  test('a suspended status persists after reloading the listing @regression', async ({ page }) => {
    const landlordsPage = await openLandlords(page);
    const { name } = landlords.disposableActiveLandlord4;

    await landlordsPage.suspendButton(name).click();
    await expect(landlordsPage.statusCell(name)).toHaveText('Suspended');

    await page.reload();
    await expect(landlordsPage.rows.first()).toBeVisible();
    await expect(landlordsPage.statusCell(name)).toHaveText('Suspended');
    await expect(landlordsPage.unsuspendButton(name)).toBeVisible();

    // Cleanup: restore original Active status.
    await landlordsPage.unsuspendButton(name).click();
    await expect(landlordsPage.statusCell(name)).toHaveText('Active');
  });
});

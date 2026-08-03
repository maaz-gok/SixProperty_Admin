import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { TenantDetailsPage } from '../../src/pages/TenantDetailsPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };
import tenants from '../data/tenants.json' with { type: 'json' };

async function loginOnly(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
}

test.describe('Tenants - Detail Documents Section', () => {
  test('renders one button per uploaded file, grouped by document type @smoke', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    const identitySection = details.documentSubsection('Identity Document');
    await expect(identitySection.getByRole('button')).toHaveCount(2);
    await expect(details.documentButton('IMG_0692.png')).toBeVisible();
    await expect(details.documentButton('healux-scores.pdf')).toBeVisible();

    const insuranceSection = details.documentSubsection('Renters Insurance');
    await expect(insuranceSection.getByRole('button')).toHaveCount(1);
  });

  test('clicking a document opens a preview dialog with a working "Open in new tab" link @smoke @critical', async ({ page }) => {
    // Confirmed benign: opening this dialog always logs a React/Radix
    // "Missing Description" console warning — allowed here, not asserted
    // as an error, per the plan's note that this is expected noise, not a bug.
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.richProfileTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.richProfileTenant.name);

    await test.step('image document', async () => {
      await details.documentButton('IMG_0692.png').click();
      await expect(details.dialog).toBeVisible();
      await expect(details.dialogHeading).toHaveText('IMG_0692.png');
      await expect(details.dialogImage).toBeVisible();
      await expect(details.dialogOpenInNewTabLink).toHaveAttribute('href', /^https:\/\/.*IMG_0692\.png/);
      await details.dialogCloseButton.click();
      await expect(details.dialog).not.toBeVisible();
    });

    await test.step('PDF document', async () => {
      await details.documentButton('healux-scores.pdf').click();
      await expect(details.dialog).toBeVisible();
      await expect(details.dialogHeading).toHaveText('healux-scores.pdf');
      await expect(details.dialogIframe).toBeVisible();
      await expect(details.dialogOpenInNewTabLink).toHaveAttribute('href', /^https:\/\/.*healux-scores\.pdf/);
    });
  });

  test('missing documents render "—", not a broken or missing button @regression', async ({ page }) => {
    await loginOnly(page);
    const details = new TenantDetailsPage(page);
    await details.goto(tenants.sparseTenant.id);
    await expect(details.nameHeading).toHaveText(tenants.sparseTenant.name);

    await expect(details.documentSubsection('Identity Document')).toHaveText('—');
    await expect(details.documentSubsection('Renters Insurance')).toHaveText('—');
  });
});

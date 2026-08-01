import { BasePage } from './BasePage.js';
import { PasswordResetSuccessPage } from './PasswordResetSuccessPage.js';

export class ResetPasswordPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Reset Password' });
    this.logo = page.getByText('SIX PM', { exact: true });
    this.instructions = page.getByText('Setup new password.');
    this.newPasswordInput = page.getByPlaceholder('Enter your new password', { exact: true });
    this.confirmPasswordInput = page.getByPlaceholder('Re-enter your new password');
    this.newPasswordToggle = this.newPasswordInput.locator('xpath=..').getByRole('button');
    this.confirmPasswordToggle = this.confirmPasswordInput.locator('xpath=..').getByRole('button');
    this.newPasswordError = this.newPasswordInput.locator('xpath=../..').getByText(/\*Password is required/);
    this.confirmPasswordError = this.confirmPasswordInput.locator('xpath=../..').getByText(/\*Password is required|\*Passwords must match/);
    this.resetButton = page.getByRole('button', { name: 'Reset Password' });
    this.loginLink = page.getByRole('link', { name: 'here' });
  }

  async goto() {
    await this.page.goto('/reset-password');
    await this.waitForReady();
  }

  async fillNewPassword(value) {
    await this.newPasswordInput.fill(value);
  }

  async fillConfirmPassword(value) {
    await this.confirmPasswordInput.fill(value);
  }

  async submit() {
    await this.resetButton.click();
  }

  /** Fills both fields and submits, returning the next page object on success. */
  async resetPassword(newPassword) {
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(newPassword);
    await this.submit();
    return new PasswordResetSuccessPage(this.page);
  }
}

import { BasePage } from './BasePage.js';
import { LoginPage } from './LoginPage.js';

export class PasswordResetSuccessPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Your Password Successfully Changed' });
    this.logo = page.getByText('SIX PM', { exact: true });
    this.instructions = page.getByText('Sign in to your account with your new password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/password-reset-success');
    await this.waitForReady();
  }

  /** Clicks through to Login and returns the next page object. */
  async continueToLogin() {
    await this.signInButton.click();
    return new LoginPage(this.page);
  }
}

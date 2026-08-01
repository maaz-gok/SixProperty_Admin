import { BasePage } from './BasePage.js';
import { VerifyOtpPage } from './VerifyOtpPage.js';

export class ForgotPasswordPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Forgot Your Password?' });
    this.logo = page.getByText('SIX PM', { exact: true });
    this.instructions = page.getByText('Enter your email to receive a code for password reset.');
    this.emailInput = page.getByPlaceholder('john.david@gmail.com');
    this.emailError = page.getByText(/\*Email is required|\*Please enter a valid email address/);
    this.sendCodeButton = page.getByRole('button', { name: 'Send code' });
    this.loginLink = page.getByRole('link', { name: 'here' });
  }

  async goto() {
    await this.page.goto('/forgot-password');
    await this.waitForReady();
  }

  async fillEmail(value) {
    await this.emailInput.fill(value);
  }

  async submit() {
    await this.sendCodeButton.click();
  }

  /** Submits the email and returns the next page object on success. */
  async requestCode(email) {
    await this.fillEmail(email);
    await this.submit();
    return new VerifyOtpPage(this.page);
  }
}

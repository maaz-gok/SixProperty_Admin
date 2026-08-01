import { BasePage } from './BasePage.js';
import { ResetPasswordPage } from './ResetPasswordPage.js';

export class VerifyOtpPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Verify OTP' });
    this.logo = page.getByText('SIX PM', { exact: true });
    this.otpInput = page.getByRole('textbox', { name: 'OTP' });
    this.otpError = page.getByText('OTP must be 6 digits');
    this.verifyButton = page.getByRole('button', { name: 'Verify OTP' });
    this.resendButton = page.getByRole('button', { name: 'Click here' });
  }

  async goto() {
    await this.page.goto('/verify-otp');
    await this.waitForReady();
  }

  async fillOtp(value) {
    // The digit boxes are driven by a single hidden input; `fill()` sets the
    // whole value in one DOM mutation and the segmented UI doesn't sync
    // correctly from that, so digits must be entered one at a time.
    await this.otpInput.pressSequentially(value);
  }

  async submit() {
    await this.verifyButton.click();
  }

  async resend() {
    await this.resendButton.click();
  }

  /** Submits the OTP and returns the next page object on success. */
  async verify(code) {
    await this.fillOtp(code);
    await this.submit();
    return new ResetPasswordPage(this.page);
  }
}

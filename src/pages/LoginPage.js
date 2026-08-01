import { BasePage } from './BasePage.js';
import { DashboardPage } from './DashboardPage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Welcome Back' });
    this.logo = page.getByText('SIX PM', { exact: true });
    this.emailInput = page.getByPlaceholder('john.david@gmail.com');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.emailLabel = page.getByText('Email', { exact: true });
    this.passwordLabel = page.getByText('Password', { exact: true });
    // The visibility toggle is an icon-only <button> with no accessible name,
    // label, or test-id (see specs/admin-login.md 13.1 a11y gap). Scoped to the
    // password input's immediate parent, where it is the only button present.
    this.passwordVisibilityToggle = this.passwordInput.locator('xpath=..').getByRole('button');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.errorBanner = page.getByText('Incorrect email or password.');
    this.emailError = page.getByText('*Email is required');
    this.passwordError = page.getByText('*Password is required');
  }

  async goto() {
    await this.page.goto('/sign-in');
    await this.waitForReady();
  }

  async fillEmail(value) {
    await this.emailInput.fill(value);
  }

  async fillPassword(value) {
    await this.passwordInput.fill(value);
  }

  async togglePasswordVisibility() {
    await this.passwordVisibilityToggle.click();
  }

  async submit() {
    await this.loginButton.click();
  }

  async submitWithEnter() {
    await this.passwordInput.press('Enter');
  }

  /** Fills both fields and submits, returning the next page object on success. */
  async loginAs({ email, password }) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    return new DashboardPage(this.page);
  }
}

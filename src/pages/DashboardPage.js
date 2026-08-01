import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 3 });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForReady();
  }
}

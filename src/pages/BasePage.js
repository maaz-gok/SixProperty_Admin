export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    throw new Error('Method "goto()" must be implemented in subclass');
  }

  async waitForReady() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLocalStorageItem(key) {
    return this.page.evaluate((k) => {
      const raw = window.localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    }, key);
  }
}
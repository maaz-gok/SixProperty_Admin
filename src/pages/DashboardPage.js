import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 3 });
    this.description = page.getByText('Overview of platform activity and key metrics.');

    // Sidebar navigation (grouped under "Navigation" / "Management" / "Monitoring" headings)
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.landlordsLink = page.getByRole('link', { name: 'Landlords' });
    this.tenantsLink = page.getByRole('link', { name: 'Tenants' });
    this.propertiesLink = page.getByRole('link', { name: 'Properties' });
    this.maintenanceRequestsLink = page.getByRole('link', { name: 'Maintenance Requests' });
    this.platformActivityLink = page.getByRole('link', { name: 'Platform Activity' });

    // Sidebar bottom section
    // Known bug (specs/dashboard.md 9.2): this link points to /profile but the
    // route redirects to /sign-in without clearing the session. Kept as the
    // real accessible name so the regression test asserts the actual (buggy)
    // navigation outcome rather than an assumed one.
    this.profileLink = page.getByRole('link', { name: /^Admin .+@.+/ });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });

    // Sidebar toggle has two click targets sharing the accessible name "Toggle
    // Sidebar": the real header trigger (data-slot="sidebar-trigger", in the
    // tab order) and a decorative resize "rail" inside the sidebar itself
    // (data-sidebar="rail", tabindex="-1", mouse/touch-only). Scoped by
    // landmark/attribute since role+name alone is ambiguous between the two.
    this.headerSidebarToggle = page.locator('header').getByRole('button', { name: 'Toggle Sidebar' });
    this.sidebarRailToggle = page.locator('[data-sidebar="rail"]');

    // Header (top-right avatar block, distinct from the sidebar's own avatar block)
    this.headerAvatarName = page.locator('header').getByText('Admin', { exact: true });

    // Today's Word card
    // No role/label/test-id on the card container; the visible text includes
    // a dynamic date, so it can't be matched by static getByText alone.
    // Depths confirmed live against the real DOM (see specs/dashboard.md
    // methodology note). Mirrors the `.locator('xpath=..')` precedent already
    // used in LoginPage.js.
    const wordTitle = page.getByText("Today's Wordle Word");
    this.todaysWordCard = wordTitle.locator('xpath=../../../..');
    this.wordTiles = wordTitle.locator('xpath=../../following-sibling::*[1]/*');

    // Recent Activity
    this.activityHeading = page.getByRole('heading', { name: 'Recent Activity', level: 4 });
    this.activityTable = page.getByRole('table');
    this.activityRows = this.activityTable.locator('tbody').getByRole('row');
    this.seeAllLink = page.getByRole('link', { name: 'See all' });

    // Summary cards — anchored to the Recent Activity section's preceding
    // sibling rather than counting from the heading. Confirmed live: when
    // the Today's Word API fails, that card is removed from the DOM
    // entirely (not replaced with an inline error state), which shifts
    // fixed sibling indices. The summary grid is always immediately before
    // the Recent Activity <section>, regardless of whether the word card
    // rendered, so anchoring there is resilient to that failure mode.
    this.summaryCardsSection = this.activityHeading.locator('xpath=../../preceding-sibling::*[1]');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.waitForReady();
  }

  /**
   * Returns the summary card's text wrapper (label + count) for a given
   * label (e.g. "Landlords"). No role/label/test-id on card containers; the
   * count is dynamic so it can't be included in a static getByText match.
   * Scoped to `summaryCardsSection` because labels like "Landlords" and
   * "Properties" also appear as sidebar link names elsewhere on the page
   * (confirmed live: an unscoped page-wide getByText resolves to 2
   * elements). Depth confirmed live: the label `<p>`'s immediate parent
   * contains both the label and count `<p>` elements. Mirrors the
   * `.locator('xpath=..')` precedent in LoginPage.js.
   */
  summaryCard(label) {
    return this.summaryCardsSection.getByText(label, { exact: true }).locator('xpath=..');
  }

  /** Returns the count `<p>` for a given summary card label. */
  summaryCardCount(label) {
    return this.summaryCard(label).locator('p').nth(1);
  }

  /** Returns the full visual card box (icon + text) for a given label, one level above `summaryCard()`. */
  summaryCardBox(label) {
    return this.summaryCard(label).locator('xpath=..');
  }
}

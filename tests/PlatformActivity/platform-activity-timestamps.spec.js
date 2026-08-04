import { test, expect } from '../../src/fixtures/base.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PlatformActivityPage } from '../../src/pages/PlatformActivityPage.js';
import adminCredentials from '../data/credentials.json' with { type: 'json' };

async function openActivity(page) {
  const login = new LoginPage(page);
  await login.goto();
  const dashboard = await login.loginAs(adminCredentials);
  await expect(dashboard.heading).toBeVisible();
  const activityPage = new PlatformActivityPage(page);
  await activityPage.goto();
  await expect(activityPage.rows.first()).toBeVisible();
  return activityPage;
}

function parseDisplayedTimestamp(text) {
  // "Aug 4, 2026, 03:04 PM" — parseable by the Date constructor directly.
  return new Date(text);
}

test.describe('Platform Activity - Timestamp Validation', () => {
  test('timestamps render in the confirmed date+time format @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    const count = await activityPage.rows.count();
    for (let i = 0; i < Math.min(count, 5); i += 1) {
      const timeText = await activityPage.rows.nth(i).getByRole('cell').nth(2).textContent();
      expect(timeText).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/);
    }
  });

  test('rows are sorted newest-first within a page @smoke @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    const count = await activityPage.rows.count();
    const timestamps = [];
    for (let i = 0; i < count; i += 1) {
      const text = await activityPage.rows.nth(i).getByRole('cell').nth(2).textContent();
      timestamps.push(parseDisplayedTimestamp(text).getTime());
    }

    for (let i = 1; i < timestamps.length; i += 1) {
      expect(timestamps[i - 1], `Row ${i - 1} should be same time or newer than row ${i}`).toBeGreaterThanOrEqual(timestamps[i]);
    }
  });

  test('chronological ordering holds across the page 1/page 2 boundary @regression @critical', async ({ page }) => {
    const activityPage = await openActivity(page);

    const lastOnPage1 = await activityPage.rows.last().getByRole('cell').nth(2).textContent();
    const lastTimestamp = parseDisplayedTimestamp(lastOnPage1).getTime();

    const res = page.waitForResponse((r) => r.url().includes('page=2'));
    await activityPage.nextButton.click();
    await res;
    await expect(activityPage.pageIndicator).toHaveText(/^Page 2 of \d+$/);

    const firstOnPage2 = await activityPage.rows.first().getByRole('cell').nth(2).textContent();
    const firstTimestamp = parseDisplayedTimestamp(firstOnPage2).getTime();

    expect(lastTimestamp, "Page 1's last item should be same time or newer than page 2's first item").toBeGreaterThanOrEqual(firstTimestamp);
  });

  // Confirmed live: no relative-time formatting ("2 hours ago") is used
  // anywhere — both a same-day item and one from weeks earlier use the
  // identical absolute date+time format.
  test('recent and older activity both use the same absolute date+time format, never relative time @regression', async ({ page }) => {
    const activityPage = await openActivity(page);

    const recentText = await activityPage.rows.first().getByRole('cell').nth(2).textContent();
    // Walk to the last page to find an older item.
    let guard = 0;
    while (await activityPage.nextButton.isEnabled() && guard < 10) {
      const res = page.waitForResponse((r) => r.url().includes('/admin/activity/feed'));
      await activityPage.nextButton.click();
      await res;
      guard += 1;
    }
    const olderText = await activityPage.rows.last().getByRole('cell').nth(2).textContent();

    const format = /^[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{2}:\d{2} (AM|PM)$/;
    expect(recentText).toMatch(format);
    expect(olderText).toMatch(format);
    expect(recentText).not.toMatch(/ago|just now|yesterday/i);
    expect(olderText).not.toMatch(/ago|just now|yesterday/i);
  });

  test('displayed timestamps trace directly to the API\'s "at" field @regression', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const dashboard = await login.loginAs(adminCredentials);
    await expect(dashboard.heading).toBeVisible();

    const feedResponse = page.waitForResponse((r) => r.url().includes('/admin/activity/feed?page=1&limit=20'));
    await dashboard.platformActivityLink.click();
    const res = await feedResponse;
    const body = await res.json();

    const activityPage = new PlatformActivityPage(page);
    await expect(activityPage.rows.first()).toBeVisible();

    const item = body.data.items[0];
    const actualText = await activityPage.rows.first().getByRole('cell').nth(2).textContent();
    // The displayed format only shows hours:minutes (confirmed live, e.g.
    // "Aug 4, 2026, 03:04 PM"), so a round-trip parse always lands on :00
    // seconds — compare at minute granularity rather than exact
    // millisecond equality, which would always fail even for correct data.
    const displayedMinute = Math.floor(parseDisplayedTimestamp(actualText).getTime() / 60000);
    const apiMinute = Math.floor(new Date(item.at).getTime() / 60000);
    expect(displayedMinute).toBe(apiMinute);
  });
});

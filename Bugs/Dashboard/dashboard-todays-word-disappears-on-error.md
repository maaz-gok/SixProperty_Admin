# Bug Report Template

## Title

"Today's Wordle Word" card silently disappears if its data fails to load

## Summary

The dashboard normally shows a small card called "Today's Wordle Word" near the top, with that day's letters. If the request for this data fails, the card doesn't show an error or a "couldn't load" message — it just vanishes completely, as if it was never meant to be there.

## Description

### Steps to Reproduce

1. Sign in to the Admin Dashboard and note the "Today's Wordle Word" card near the top, showing the day's letters.
2. Open the browser's DevTools (F12 or right-click → Inspect), go to the Network tab, find the request to `game/admin/word`, right-click it, and choose "Block request URL" (in Chrome) — this makes that one request fail on purpose so we can see what happens when it doesn't load.
3. Refresh the page.

### Actual Result

The "Today's Wordle Word" card is completely gone. The page jumps straight from the "Overview of platform activity and key metrics." description down to the Landlords/Tenants/Properties cards, with no gap, message, or hint that something failed to load.

### Expected Result

If the word data can't be loaded, the card should still appear in its usual place, but show something like "Unable to load today's word" or a retry option — the same way the Recent Activity section already does when its data fails.

## Severity

Low

## Priority

P3

## Screenshot Reference

- `evidence/todays-word-normal.png` — the dashboard with the "Today's Wordle Word" card showing normally (letters C, A, N, O, E).
- `evidence/todays-word-missing.png` — the same part of the dashboard after the word data fails to load; the card is gone entirely.
- `evidence/todays-word-disappears.webm` — screen recording showing the card present with real letters, then the page reloading after the word data fails to load, and the card being gone with no error shown.
- `evidence/todays-word-devtools-block-network.png` — DevTools Network tab showing the `word` request manually blocked (via "Block request URL"), confirming the manual reproduction steps above.

## Automated Coverage

There is an automated check for this in the test suite (`tests/Dashboard/dashboard-todays-word.spec.js`).

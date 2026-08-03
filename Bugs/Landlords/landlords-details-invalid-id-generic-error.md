# Bug Report Template

## Title

Opening a landlord page that doesn't exist shows a confusing error instead of "not found"

## Summary

If you open a landlord's page using a link that doesn't actually belong to any real landlord, the page sits there loading for several seconds, checks twice for the same thing, and then just shows a general "Something went wrong" message — instead of simply saying the landlord wasn't found.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel.
2. Open a landlord details page using a made-up ID that doesn't belong to any real landlord (for example `/landlords/000000000000000000000000`).
3. Watch what happens on the page.

### Actual Result

- The page shows "Loading — Please wait while we load your data..." for several seconds.
- It quietly checks twice for the same landlord, instead of just once.
- After the wait, it gives up and shows a plain error message: "Something went wrong. We encountered an error. Please try again." with a "Retry" button.
- This message looks exactly like a real technical problem — there's no way to tell that the actual issue is simply "this landlord doesn't exist."

### Expected Result

- The page should quickly recognize that the landlord doesn't exist, without checking twice.
- It should show a clear, simple message like "Landlord not found" — not the same generic error used for real technical problems.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/invalid-id-stuck-loading.png` — the page stuck loading shortly after opening the made-up link.
- `evidence/invalid-id-generic-error.png` — the generic error message the page eventually shows.

# Bug Report

## Title

Entire page becomes faded after Suspend/Unsuspend action

## Summary

After clicking **Suspend** or **Unsuspend**, the whole page briefly becomes faded while the success toast is displayed.

## Steps to Reproduce

1. Login to the Admin Panel.
2. Navigate to **Landlords**.
3. Click **Suspend** or **Unsuspend** for any landlord.
4. Observe the page while the success toast is visible.

## Actual Result

The entire page becomes faded for a few seconds. All Suspend/Unsuspend buttons, status badges, and other UI elements appear dimmed until the success toast disappears.

## Expected Result

Only the selected landlord's action should be processed. The rest of the page should remain unchanged without any fading or dimming effect.

## Severity

Medium

## Priority

P2

## Screenshot

- `evidence/screen-fades-during-toast.png`

## Notes

Check whether this is only a visual issue or if the other buttons are temporarily disabled while the success message is displayed.
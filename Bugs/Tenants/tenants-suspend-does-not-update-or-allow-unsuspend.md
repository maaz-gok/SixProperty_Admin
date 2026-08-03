# Bug Report Template

## Title

Suspending a tenant works in the background, but the row never shows it — and there's no way to undo it

## Summary

Clicking "Suspend" does suspend the tenant's account, and a correct "User suspended successfully." toast appears — but the row itself never updates. It still shows "Active" and "Suspend", even after refreshing. Since the button never becomes "Unsuspend", there's no way to reverse it from this screen.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel and go to the Tenants page.
2. Click "Suspend" on any tenant.
3. Check the row's Status and button, both right after and after a refresh.

### Actual Result

The success toast appears correctly, but the row still shows "Active" / "Suspend" — immediately after, and even after a full page reload. The suspend genuinely went through on the backend; it's just never reflected on screen. Since the button never becomes "Unsuspend", there's no way to undo it here.

### Expected Result

After suspending, the row should show "Suspended" and an "Unsuspend" button, the same way it already works on the Landlords page — with a way to reverse it.

## Severity

High

## Priority

P1

## Screenshot Reference

- `evidence/suspend-before.png` — the row before clicking Suspend.
- `evidence/suspend-after-still-active.png` — the same row right after: still "Active" / "Suspend".

## Video Reference

- `evidence/suspend-succeeds-but-row-never-updates.webm` — full walkthrough: suspend a tenant, success toast appears, row stays unchanged, reload, still unchanged; then restores the account via a direct API call since no "Unsuspend" button is reachable.

## Notes

Worse than a missing-confirmation issue (see the Landlords equivalent): here the action happens, succeeds, and is confirmed by toast, but the row gives no indication and can't be undone from this screen.

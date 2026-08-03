# Bug Report Template

## Title

Suspending a landlord happens instantly with no "Are you sure?" step

## Summary

When an admin clicks "Suspend" (or "Unsuspend") next to a landlord's name, it happens right away. There is no pop-up asking "Are you sure you want to do this?" before it happens.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel and go to the Landlords page.
2. Find any landlord whose status is "Active".
3. Click the "Suspend" button next to their name.

### Actual Result

Nothing asks for confirmation. As soon as you click, the landlord's account is suspended straight away. The status changes to "Suspended", the button changes to say "Unsuspend", and a small message pops up saying "User suspended successfully." The same thing happens the other way around when clicking "Unsuspend" — it also happens instantly with no confirmation.

### Expected Result

Suspending someone's account is a big deal — it can stop them from logging in and may affect their tenants too. Before it happens, the admin should see a pop-up asking them to confirm, with a clear way to say "yes, do it" or "no, cancel."

## Severity

High

## Priority

P1

## Screenshot Reference

- `evidence/suspend-before-click.png` — the page before clicking Suspend.
- `evidence/suspend-immediately-after-no-dialog.png` — the page right after clicking: no pop-up ever showed up, and the account is already suspended.

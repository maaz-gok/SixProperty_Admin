# Bug Report Template

## Title

An admin sign-up activity message has a small grammar mistake: "as a admin" instead of "as an admin"

## Summary

On the Platform Activity page, when an admin account signs up, the activity feed shows a message that reads "Admin signed up as a admin." It should say "as an admin" instead — "a admin" isn't correct English. The same message for tenants and landlords reads fine ("signed up as a tenant.", "signed up as a landlord.") since "a" is correct before those words; it's specifically the word "admin" that needs "an" instead of "a".

## Description

### Steps to Reproduce

1. Log in to the Admin Panel.
2. Go to the Platform Activity page.
3. Find an activity row where the Type is "Sign Up" and the message mentions "admin" (there's one from an admin account signing up).

### Actual Result

The message reads: "Admin signed up as a admin."

### Expected Result

The message should read: "Admin signed up as an admin."

## Severity

Trivial

## Priority

Low

## Screenshot Reference

- `evidence/activity-admin-signup-grammar-bug.png` — the row on the Platform Activity page (page 8 of the feed) is outlined in red, with the exact mistake "a admin" highlighted in yellow.

## Reference

Logged on the Kanban board — Task ID: `6a71dfdad37031c99c6c2d2e` (Project ID: `6a0456b0e3160f4cd53329fb`), status "To Do", priority Low.

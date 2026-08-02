# Bug Report Template

## Title

Clicking your own name in the sidebar logs you out instead of opening your profile

## Summary

At the bottom of the sidebar, your name and email are shown as a clickable link. Clicking it should probably take you to a profile or account page, but instead it sends you straight back to the sign-in screen, as if you had signed out.

## Description

### Steps to Reproduce

1. Sign in to the Admin Dashboard.
2. Look at the bottom-left of the sidebar — you'll see your name (e.g. "Admin") and email shown as a link.
3. Click on that name/email link.

### Actual Result

You are immediately redirected to the sign-in page, the same as if you had clicked "Sign Out".

### Expected Result

Clicking your name should either open a profile/account settings page, or the element shouldn't look and behave like a clickable link if there's no profile page to go to yet.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/profile-link-redirect-before.png` — the dashboard with the clickable name/email link visible in the sidebar.
- `evidence/profile-link-redirect-after.png` — the sign-in page that appears right after clicking that link.

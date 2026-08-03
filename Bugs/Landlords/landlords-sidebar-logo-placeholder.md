# Bug Report Template

## Title

Sidebar shows a plain "6P" box instead of the real company logo

## Summary

At the top of the sidebar, where the company logo should be, there is just a plain purple box with the letters "6P" in it, next to the words "SIX Property" and "Admin Panel". This is not the real logo — it looks like a placeholder that was never replaced. This is the same kind of issue already found on the Login page, which also shows plain text instead of the real logo.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel.
2. Look at the top-left corner of the sidebar (this shows up on every page, including Dashboard, Landlords, Tenants, and Properties).

### Actual Result

A purple square with "6P" written in it is shown, next to the text "SIX Property" and "Admin Panel".

### Expected Result

The real company logo image should be shown here instead of a text placeholder, matching the approved brand logo (the same one expected on the Login page — see `Bugs/Login/admin-login-logo-mismatch.md`).

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/sidebar-logo-placeholder.png` — the sidebar today, showing the "6P" placeholder instead of a real logo.
- `Bugs/Login/evidence/logo-mismatch-expected.png` — the correct logo provided by the team, for comparison.

# Bug Report Template

## Title

Keyboard users have to press Tab twice to get past "Forgot Password?"

## Summary

When moving through the login form using only the keyboard (pressing the Tab key), the "Forgot Password?" link is stopped on twice in a row, instead of once, before reaching the "Log In" button. This is likely because it's built as two nested clickable pieces instead of one.

## Description

### Steps to Reproduce

1. Open the Login page.
2. Click somewhere blank on the page, then press the Tab key repeatedly to move through the form.
3. Notice how many times "Forgot Password?" gets highlighted before moving to the "Log In" button.

### Actual Result

"Forgot Password?" gets highlighted twice in a row before the "Log In" button is reached.

### Expected Result

"Forgot Password?" should only be highlighted once before moving on to the "Log In" button.

## Severity

Low

## Priority

P3

## Screenshot Reference

`evidence/duplicate-forgot-password-focus-stop.webm` — a short recording pressing Tab through the whole form, with a live on-screen note showing "Forgot Password?" getting highlighted twice in a row.

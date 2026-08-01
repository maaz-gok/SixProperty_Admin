# Bug Report Template

## Title

"Email" and "Password" titles turn red when the form is submitted empty (they shouldn't)

## Summary

When you click "Log In" without filling anything in, the words "Email" and "Password" themselves turn red, not just the small warning message underneath them ("*Email is required" / "*Password is required"). Only the warning message should turn red — the "Email" and "Password" titles should stay looking normal.

## Description

### Steps to Reproduce

1. Open the Login page.
2. Click "Log In" without typing anything into the Email or Password boxes.
3. Look at the color of the "Email" and "Password" words themselves (not the small warning text below them).

### Actual Result

Both "Email" and "Password" turn red, along with the warning messages underneath them.

### Expected Result

"Email" and "Password" should keep their normal color. Only the small warning message ("*Email is required" / "*Password is required") should turn red.

## Severity

Low

## Priority

P3

## Screenshot Reference

- `evidence/field-label-turns-red-before.png` — the form before submitting
- `evidence/field-label-turns-red-after.png` — after submitting empty, showing "Email" and "Password" turned red

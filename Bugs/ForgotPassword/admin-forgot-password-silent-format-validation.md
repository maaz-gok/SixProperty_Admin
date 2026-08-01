# Bug Report Template

## Title

Forgot Password shows a confusing browser pop-up instead of its own warning message

## Summary

When you type a wrong-looking email on a brand new page and click "Send code", the page doesn't show its own warning message. Instead, your browser shows its own small grey pop-up, which looks and reads differently depending on which browser you're using, and is easy to miss. The page's own warning message only shows up if you had already tried submitting the form once before.

## Description

### Steps to Reproduce

1. Open the Login page and click "Forgot Password?" to load a brand new page.
2. Type a wrong-looking email like `not-an-email.com` into the box.
3. Click "Send code" and look closely at what appears.
4. Reload the page. This time, click "Send code" with the box empty first (you'll see a "required" warning).
5. Now type the same wrong-looking email again.

### Actual Result

On the very first try, a small grey pop-up appears from the browser itself, not from the page. It looks different in every browser and can be easy to miss. The page's own red warning message only appears after you've already tried submitting the form once before — from then on, it shows up right away as you type.

### Expected Result

The page should show its own clear red warning message the very first time, on any browser, instead of relying on the browser's own generic pop-up.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/silent-validation-fresh-native-tooltip.png` — what shows up on a brand new page: the browser's own pop-up.
- `evidence/silent-validation-touched-app-error.png` — what shows up after the box has already been submitted once: the page's own red warning.
- `evidence/silent-validation-native-tooltip-vs-app-error.webm` — a short recording showing both, one after another.

## Automated Coverage

There is an automated check for this in the test suite (`tests/Auth/admin-forgot-password-known-issues.spec.js`). It is set to fail on purpose until this is fixed.

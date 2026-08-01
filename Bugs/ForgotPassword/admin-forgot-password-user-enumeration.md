# Bug Report Template

## Title

Forgot Password reveals whether an email belongs to a real account

## Summary

When you try to reset a password, the page shows a different message depending on whether the email you typed belongs to a real account or not. This means anyone could use this page to check which email addresses have an admin account — without knowing any passwords.

## Description

### Steps to Reproduce

1. Open the Login page and click "Forgot Password?".
2. Type an email that does not belong to any admin account and click "Send code".
3. Note the message that appears.
4. Now type a real admin account's email and click "Send code" again.
5. Compare the two messages.

### Actual Result

- An email with no account shows: "Unable to find the user."
- A real account's email shows: "OTP has been sent to your email."

These two messages are clearly different, so it's easy to work out which emails belong to real admin accounts just by trying them here.

### Expected Result

Both cases should show the exact same message, so nobody can tell whether an email belongs to a real account just by using this page.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/user-enumeration-unknown-email.png` — the message shown for an email with no account.
- `evidence/user-enumeration-known-email.png` — the message shown for a real account's email, for comparison.

## Automated Coverage

There is an automated check for this in the test suite (`tests/Auth/admin-forgot-password-known-issues.spec.js`). It is set to fail on purpose until this is fixed.

# Bug Report Template

## Title

A tenant in the list is actually linked to the admin's own account

## Summary

The tenant "Ahmed Khan" (`mudassir+909@geeksofkolachi.com`) looks like a normal tenant, but its account is actually the logged-in admin's own account. The app handles this safely (see below) — the only problem is that this link exists at all.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel and go to the Tenants page.
2. Search for `mudassir+909@geeksofkolachi.com` ("Ahmed Khan").
3. Click "Suspend" on that row.

### Actual Result

A red error toast correctly appears: "Admin users cannot be suspended." Response body:

```json
{"message":"Admin users cannot be suspended.","status":400,"data":null}
```

The admin's account is not suspended. But this reveals that the tenant record's `user` field is set to the admin's own user ID — this "tenant" is not a tenant account at all.

### Expected Result

A tenant record should never be able to link to an admin's account. Likely a data setup/migration mistake, not something that should reach a real tenant list.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/tenant-linked-to-admin-account-before.png` — the "Ahmed Khan" row before clicking Suspend.

## Notes

Confirmed no side effects: admin account stays active, error toast displays correctly, no session disruption. The only fix needed is the data-integrity issue.

# Manual Test Cases — Admin Login

Plain-English versions of every automated test in `tests/Auth/`, written so anyone can run them by hand without technical knowledge. Each file below lines up with one automated test file, so results can be cross-checked either way.

| File | Covers | Test cases |
|---|---|---|
| [01-Page-Load-And-Branding.md](01-Page-Load-And-Branding.md) | Page loading, logo, page speed | TC-01 to TC-06 |
| [02-Login-Form-Fields.md](02-Login-Form-Fields.md) | Email box, password box, show/hide password, Forgot Password link | TC-07 to TC-25 |
| [03-Login-Button-And-Submission.md](03-Login-Button-And-Submission.md) | Log In button, warning messages, successful/failed login | TC-26 to TC-37 |
| [04-Keyboard-Accessibility-And-Responsive.md](04-Keyboard-Accessibility-And-Responsive.md) | Keyboard-only use, screen reader friendliness, phone/tablet screens | TC-38 to TC-47 |
| [05-Security.md](05-Security.md) | Login protection, session/logout behavior, data privacy | TC-48 to TC-53 |
| [06-Known-Visual-Issues.md](06-Known-Visual-Issues.md) | Re-checking previously reported visual bugs | TC-54 to TC-56 |

**Total: 56 test cases.**

Cases marked with ⚠️ **Known issue** point to a matching bug report in `Bugs/Login/` — expect those to fail until fixed. Cases marked with ✅ currently pass and are just being watched in case the issue comes back.

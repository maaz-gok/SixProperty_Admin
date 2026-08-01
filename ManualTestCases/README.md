# Manual Test Cases — Admin Login

Plain-English versions of every automated test in `tests/Auth/`, written so anyone can run them by hand without technical knowledge. Each file below lines up with one automated test file, so results can be cross-checked either way.

| File | Covers | Test cases |
|---|---|---|
| [Login/01-Page-Load-And-Branding.md](Login/01-Page-Load-And-Branding.md) | Page loading, logo, page speed | TC-01 to TC-06 |
| [Login/02-Login-Form-Fields.md](Login/02-Login-Form-Fields.md) | Email box, password box, show/hide password, Forgot Password link | TC-07 to TC-25 |
| [Login/03-Login-Button-And-Submission.md](Login/03-Login-Button-And-Submission.md) | Log In button, warning messages, successful/failed login | TC-26 to TC-37 |
| [Login/04-Keyboard-Accessibility-And-Responsive.md](Login/04-Keyboard-Accessibility-And-Responsive.md) | Keyboard-only use, screen reader friendliness, phone/tablet screens | TC-38 to TC-47 |
| [Login/05-Security.md](Login/05-Security.md) | Login protection, session/logout behavior, data privacy | TC-48 to TC-53 |
| [Login/06-Known-Visual-Issues.md](Login/06-Known-Visual-Issues.md) | Re-checking previously reported visual bugs | TC-54 to TC-56 |
| [ForgotPassword/01-Request-Code.md](ForgotPassword/01-Request-Code.md) | The "Forgot Your Password?" page — email box, sending a code | TC-57 to TC-61 |
| [ForgotPassword/02-Verify-OTP.md](ForgotPassword/02-Verify-OTP.md) | The "Verify OTP" page — code box, wrong codes, resend, real code | TC-62 to TC-66 |
| [ForgotPassword/03-Reset-Password.md](ForgotPassword/03-Reset-Password.md) | The "Reset Password" page — new password, confirm password, show/hide | TC-67 to TC-70 |
| [ForgotPassword/04-Known-Issues.md](ForgotPassword/04-Known-Issues.md) | Newly-found problems with the Forgot Password flow | TC-72 to TC-73 |
| [ForgotPassword/05-Full-Reset-Cycle.md](ForgotPassword/05-Full-Reset-Cycle.md) | The whole journey for real — changing the password and setting it back | TC-74 |

**Total: 74 test cases.**

Cases marked with ⚠️ **Known issue** point to a matching bug report in `Bugs/Login/` or `Bugs/ForgotPassword/` — expect those to fail until fixed. Cases marked with ✅ currently pass and are just being watched in case the issue comes back.

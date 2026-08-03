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
| [Dashboard/01-Initial-Load.md](Dashboard/01-Initial-Load.md) | Loading the Dashboard right after login, reloading, odd web addresses | TC-75 to TC-78 |
| [Dashboard/02-Sidebar-Navigation.md](Dashboard/02-Sidebar-Navigation.md) | Every sidebar link, the active-page highlight, keyboard order, Back/Forward | TC-79 to TC-88 |
| [Dashboard/03-Sidebar-Collapse.md](Dashboard/03-Sidebar-Collapse.md) | Collapsing/expanding the sidebar, default state per screen size | TC-89 to TC-92 |
| [Dashboard/04-Header.md](Dashboard/04-Header.md) | Page title, description, and the top-right admin badge | TC-93 to TC-94 |
| [Dashboard/05-Todays-Word.md](Dashboard/05-Todays-Word.md) | The "Today's Wordle Word" card and its edge cases | TC-95 to TC-99 |
| [Dashboard/06-Summary-Cards.md](Dashboard/06-Summary-Cards.md) | The six summary cards (Landlords, Tenants, etc.) | TC-100 to TC-106 |
| [Dashboard/07-Recent-Activity.md](Dashboard/07-Recent-Activity.md) | The Recent Activity table, its data, and error states | TC-107 to TC-114 |
| [Dashboard/08-See-All.md](Dashboard/08-See-All.md) | The "See all" link to Platform Activity | TC-115 |
| [Dashboard/09-User-Section.md](Dashboard/09-User-Section.md) | The bottom profile/Sign Out section | TC-116 to TC-118 |
| [Dashboard/10-Sign-Out-And-Session.md](Dashboard/10-Sign-Out-And-Session.md) | Signing out and what happens to the session afterward | TC-119 to TC-120 |
| [Dashboard/11-Auth-Guard.md](Dashboard/11-Auth-Guard.md) | Access control — reaching the Dashboard without logging in | TC-121 to TC-122 |
| [Dashboard/12-Multi-Session.md](Dashboard/12-Multi-Session.md) | Being logged in across multiple tabs/browsers at once | TC-123 to TC-124 |
| [Dashboard/13-Responsive-Extremes.md](Dashboard/13-Responsive-Extremes.md) | Heavy zoom and phone landscape orientation | TC-125 to TC-126 |
| [Landlords/01-Initial-Load.md](Landlords/01-Initial-Load.md) | Loading the Landlords list, direct address/reload, table row formatting, column titles | TC-127 to TC-130 |
| [Landlords/02-Search.md](Landlords/02-Search.md) | Searching by name/email, case/spacing, odd input, no-results, Reset, paging + search | TC-131 to TC-138 |
| [Landlords/03-Pagination.md](Landlords/03-Pagination.md) | Previous/Next through the full list, refreshing mid-way | TC-139 to TC-140 |
| [Landlords/04-View-And-Navigation.md](Landlords/04-View-And-Navigation.md) | Opening a landlord's page, Back/Forward, direct address, refresh | TC-141 to TC-145 |
| [Landlords/05-Suspend-And-Unsuspend.md](Landlords/05-Suspend-And-Unsuspend.md) | Suspending/unsuspending a landlord and its known confirmation gap | TC-146 to TC-150 |
| [Landlords/06-Data-Consistency.md](Landlords/06-Data-Consistency.md) | Checking the list and details page against the real underlying data | TC-151 to TC-152 |
| [Landlords/07-Responsive.md](Landlords/07-Responsive.md) | Desktop/tablet/phone layouts for the list and a landlord's page | TC-153 to TC-158 |
| [Landlords/08-Accessibility.md](Landlords/08-Accessibility.md) | Keyboard-only use, screen reader friendliness, color contrast | TC-159 to TC-162 |
| [Landlords/09-Error-Empty-Loading-States.md](Landlords/09-Error-Empty-Loading-States.md) | Non-existent landlord pages, empty sections, console errors, logged-out access | TC-163 to TC-167 |

**Total: 167 test cases.**

Cases marked with ⚠️ **Known issue** point to a matching bug report in `Bugs/Login/`, `Bugs/ForgotPassword/`, `Bugs/Dashboard/`, or `Bugs/Landlords/` — expect those to fail until fixed. Cases marked with ✅ currently pass and are just being watched in case the issue comes back.

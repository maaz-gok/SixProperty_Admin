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
| [Tenants/01-Initial-Load.md](Tenants/01-Initial-Load.md) | Loading the Tenants list, direct address/reload | TC-168 to TC-169 |
| [Tenants/02-Table-Validation.md](Tenants/02-Table-Validation.md) | Row formatting, duplicate emails, long/short values | TC-170 to TC-172 |
| [Tenants/03-Search.md](Tenants/03-Search.md) | Searching by name/email, case/spacing, odd input, no-results/Reset | TC-173 to TC-176 |
| [Tenants/04-Status-Filter.md](Tenants/04-Status-Filter.md) | Active/Invited/Pending filter, combined with search, Reset | TC-177 to TC-179 |
| [Tenants/05-Pagination.md](Tenants/05-Pagination.md) | Previous/Next through the full list, filtered page counts | TC-180 to TC-181 |
| [Tenants/06-View-And-Navigation.md](Tenants/06-View-And-Navigation.md) | Opening a tenant's page, Back/Forward, direct address, refresh | TC-182 to TC-186 |
| [Tenants/07-Suspend-And-Unsuspend.md](Tenants/07-Suspend-And-Unsuspend.md) | Suspending a tenant, its known confirmation and row-update gaps, the admin-linked account | TC-187 to TC-190 |
| [Tenants/08-Detail-Header-Info.md](Tenants/08-Detail-Header-Info.md) | Header photo/initials, Tenant Information fields | TC-191 to TC-193 |
| [Tenants/09-Detail-Profile.md](Tenants/09-Detail-Profile.md) | Profile section fields, populated vs. empty | TC-194 to TC-195 |
| [Tenants/10-Detail-Documents.md](Tenants/10-Detail-Documents.md) | Document buttons, preview dialog, missing documents | TC-196 to TC-198 |
| [Tenants/11-Detail-Pets.md](Tenants/11-Detail-Pets.md) | Zero/one/multiple pet cards | TC-199 to TC-201 |
| [Tenants/12-Data-Consistency.md](Tenants/12-Data-Consistency.md) | Checking the list and details page against the real underlying data | TC-202 to TC-203 |
| [Tenants/13-Responsive.md](Tenants/13-Responsive.md) | Desktop/tablet/phone layouts for the list and a tenant's page | TC-204 to TC-209 |
| [Tenants/14-Accessibility.md](Tenants/14-Accessibility.md) | Keyboard-only use, screen reader friendliness | TC-210 to TC-212 |
| [Tenants/15-Error-Empty-Loading-States.md](Tenants/15-Error-Empty-Loading-States.md) | Non-existent tenant pages, empty sections, console errors, logged-out access | TC-213 to TC-217 |
| [Properties/01-Initial-Load.md](Properties/01-Initial-Load.md) | Loading the Properties list, direct address/reload, moving to another page and back | TC-218 to TC-220 |
| [Properties/02-Table-Validation.md](Properties/02-Table-Validation.md) | Row formatting, missing Unit, duplicate property names, column titles | TC-221 to TC-224 |
| [Properties/03-Search.md](Properties/03-Search.md) | Searching by name/address, case/spacing, odd input, no-results, Reset | TC-225 to TC-232 |
| [Properties/04-Details-Page.md](Properties/04-Details-Page.md) | Opening a property's page, summary numbers, Property Information, Tenants table | TC-233 to TC-241 |
| [Properties/05-Navigation.md](Properties/05-Navigation.md) | Back/Forward, direct address, refresh, console errors | TC-242 to TC-248 |
| [Properties/06-Pagination.md](Properties/06-Pagination.md) | Previous/Next with the current single page of properties | TC-249 |
| [Properties/07-Error-Empty-Loading-States.md](Properties/07-Error-Empty-Loading-States.md) | Non-existent property pages, logged-out access | TC-250 to TC-253 |
| [Properties/08-Data-Consistency.md](Properties/08-Data-Consistency.md) | Checking the list and details page against the real underlying data | TC-254 to TC-255 |
| [Properties/09-Responsive.md](Properties/09-Responsive.md) | Desktop/tablet/phone layouts for the list and a property's page | TC-256 to TC-259 |
| [MaintenanceRequests/01-Initial-Load.md](MaintenanceRequests/01-Initial-Load.md) | Loading the list, status dropdown options, row formatting, direct address/reload | TC-260 to TC-264 |
| [MaintenanceRequests/02-Search.md](MaintenanceRequests/02-Search.md) | Searching by title/tenant, case/spacing, odd input, no-results, Reset | TC-265 to TC-273 |
| [MaintenanceRequests/03-Status-Filter.md](MaintenanceRequests/03-Status-Filter.md) | Open/In Progress/Resolved filters, combined with search, Reset | TC-274 to TC-281 |
| [MaintenanceRequests/04-Pagination.md](MaintenanceRequests/04-Pagination.md) | Previous/Next through the full list, filtered page counts | TC-282 to TC-288 |
| [MaintenanceRequests/05-Details-Page.md](MaintenanceRequests/05-Details-Page.md) | Opening a request's page, the 3 badges, Request Information, description | TC-289 to TC-297 |
| [MaintenanceRequests/06-Attachments-And-Notes.md](MaintenanceRequests/06-Attachments-And-Notes.md) | Attachment previews (photo/video), notes order, empty states | TC-298 to TC-306 |
| [MaintenanceRequests/07-Navigation.md](MaintenanceRequests/07-Navigation.md) | Back/Forward, direct address, refresh, console errors | TC-307 to TC-312 |
| [MaintenanceRequests/08-Data-Consistency.md](MaintenanceRequests/08-Data-Consistency.md) | Checking the list and details page against the real underlying data | TC-313 to TC-315 |
| [MaintenanceRequests/09-Responsive.md](MaintenanceRequests/09-Responsive.md) | Desktop/tablet/phone layouts for the list and a request's page | TC-316 to TC-320 |
| [MaintenanceRequests/10-Error-Empty-Loading-States.md](MaintenanceRequests/10-Error-Empty-Loading-States.md) | Non-existent request pages, logged-out access | TC-321 to TC-324 |
| [MaintenanceRequests/11-Performance.md](MaintenanceRequests/11-Performance.md) | Single server checks, no duplicate requests, full console sweep | TC-325 to TC-328 |
| [PlatformActivity/01-Initial-Load.md](PlatformActivity/01-Initial-Load.md) | Loading the activity feed, no search/filter exists, direct address/reload | TC-329 to TC-334 |
| [PlatformActivity/02-Activity-Table.md](PlatformActivity/02-Activity-Table.md) | Row formatting for each activity kind, special characters, table structure | TC-335 to TC-340 |
| [PlatformActivity/03-Activity-Types.md](PlatformActivity/03-Activity-Types.md) | Sign Up/Rent Paid/Maintenance badges, colours, no unexpected types | TC-341 to TC-345 |
| [PlatformActivity/04-Timestamp-Validation.md](PlatformActivity/04-Timestamp-Validation.md) | Date/time format, newest-first ordering, no relative time | TC-346 to TC-350 |
| [PlatformActivity/05-Pagination.md](PlatformActivity/05-Pagination.md) | Previous/Next through the full feed, last page, refresh | TC-351 to TC-357 |
| [PlatformActivity/06-Data-Consistency.md](PlatformActivity/06-Data-Consistency.md) | Checking the feed against the real underlying data | TC-358 to TC-361 |
| [PlatformActivity/07-Responsive.md](PlatformActivity/07-Responsive.md) | Desktop/tablet/phone layouts (confirmed clean at every width) | TC-362 to TC-364 |
| [PlatformActivity/08-Accessibility.md](PlatformActivity/08-Accessibility.md) | Keyboard-only use, screen reader friendliness | TC-365 to TC-367 |
| [PlatformActivity/09-Error-Empty-Loading-States.md](PlatformActivity/09-Error-Empty-Loading-States.md) | Empty feed, server errors, missing fields (requires network-faking tools) | TC-368 to TC-372 |
| [PlatformActivity/10-Performance.md](PlatformActivity/10-Performance.md) | Single server checks, no duplicate requests, no console errors | TC-373 to TC-376 |

**Total: 376 test cases.**

Cases marked with ⚠️ **Known issue** point to a matching bug report in `Bugs/Login/`, `Bugs/ForgotPassword/`, `Bugs/Dashboard/`, `Bugs/Landlords/`, `Bugs/Tenants/`, `Bugs/Properties/`, `Bugs/MaintenanceRequests/`, or `Bugs/PlatformActivity/` — expect those to fail until fixed. Cases marked with ✅ currently pass and are just being watched in case the issue comes back.

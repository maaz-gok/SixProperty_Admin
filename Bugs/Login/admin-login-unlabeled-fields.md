# Bug Report Template

## Title

Email and Password boxes are not properly connected to their labels (affects screen readers)

## Summary

The words "Email" and "Password" appear above their input boxes, but behind the scenes they are not actually linked to those boxes. This means a person using a screen reader (a tool for people with visual impairments) won't be told which box is for email and which is for password, and won't be told that the boxes are required to fill in.

## Description

### Steps to Reproduce

1. Open the Login page.
2. Turn on a screen reader (or use an accessibility checking tool) and move focus to the Email box.
3. Do the same for the Password box.

### Actual Result

The screen reader does not announce "Email" or "Password" as the name of the box, and does not say the box is required.

### Expected Result

The screen reader should clearly announce "Email" when focused on the email box, "Password" when focused on the password box, and should say that both are required fields.

## Severity

Medium

## Priority

P2

## Screenshot Reference

`evidence/unlabeled-fields.png` — the Email and Password boxes marked in red, showing the actual check results: whether each box is properly linked to its label, and whether it's marked as required.

## Suggested Fix (for Developers)

**The issue:** "Email" and "Password" are just plain text (`<span>`), not real `<label>` tags. So a screen reader has no idea what the box next to them is for.

**The fix:** Use a real `<label>` tag, and connect it to the input using matching `for` and `id`. Also add `required` so screen readers announce it as a required field.

### Before (current)

```html
<div class="form-field">
  <span class="label">Email</span>
  <input type="text" class="input" placeholder="Enter your email" />
</div>

<div class="form-field">
  <span class="label">Password</span>
  <input type="password" class="input" placeholder="Enter your password" />
</div>
```

### After — plain HTML (works regardless of framework)

```html
<div class="form-field">
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    class="input"
    placeholder="Enter your email"
    required
    aria-required="true"
  />
</div>

<div class="form-field">
  <label for="password">Password</label>
  <input
    type="password"
    id="password"
    name="password"
    class="input"
    placeholder="Enter your password"
    required
    aria-required="true"
  />
</div>
```

What changed:

- `<span>` → `<label for="...">`. A `<span>` is just styled text — a screen reader doesn't treat it as a label no matter how it looks.
- `for="email"` must exactly match `id="email"` on the input right below it. That's what makes the screen reader say "Email" when you land on that box — without it, it just says "edit text" with no name.
- `required` tells the screen reader this field can't be left empty.

### If it's React or Next.js (JSX)

Same fix — just one syntax change: `for` is a reserved word in JS, so JSX calls it `htmlFor` instead.

```jsx
<div className="form-field">
  <label htmlFor="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    className="input"
    placeholder="Enter your email"
    required
    aria-required="true"
  />
</div>

<div className="form-field">
  <label htmlFor="password">Password</label>
  <input
    type="password"
    id="password"
    name="password"
    className="input"
    placeholder="Enter your password"
    required
    aria-required="true"
  />
</div>
```

One thing to watch: if this login form could ever show up twice on the same page (like inside a popup), a hardcoded `id="email"` would clash between the two copies. On React 18+, `React.useId()` gives each copy its own unique id automatically:

```jsx
const emailId = React.useId();
// ...
<label htmlFor={emailId}>Email</label>
<input id={emailId} type="email" ... />
```

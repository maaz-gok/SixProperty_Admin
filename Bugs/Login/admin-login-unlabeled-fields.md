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

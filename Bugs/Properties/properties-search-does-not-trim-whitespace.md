# Bug Report Template

## Title

Searching for a property doesn't work if there's an extra space before or after the word

## Summary

On the Properties page, if you search for a property name with an extra space at the start or end (like typing `"  Grove"` instead of `"Grove"`), the search finds nothing — even though the property is really there. Typing in the wrong CAPS/lowercase is fine and still works. It's only the extra space that breaks it. The same search box on the Landlords and Tenants pages doesn't have this problem — it ignores extra spaces just fine.

## Description

### Steps to Reproduce

1. Log in to the Admin Panel.
2. Go to the Properties page.
3. Type `GROVE` in the search box (all capital letters, no extra spaces).
4. You'll see it correctly finds the "Grove" property — so capital letters aren't the problem.
5. Clear the search box. This time type `  Grove` with two spaces in front of it.
6. You'll see "No data found" — even though "Grove" is a real property.
7. The same thing happens if the extra space is at the end, or on both sides.

### Actual Result

If your search has an extra space at the beginning or end, it won't find a property that's actually there. Typing the wrong capitalization is not a problem — only the extra space is.

### Expected Result

The search should ignore extra spaces at the start or end, just like it works on the Landlords and Tenants pages already. If someone accidentally adds a space before or after what they type (easy to do by accident, especially when copy-pasting), they should still see the correct result.

## Severity

Low

## Priority

P3

## Screenshot Reference

- `evidence/search-uppercase-no-space-works.png` — searching `GROVE` (wrong case, no extra spaces) correctly finds the "Grove" property.
- `evidence/search-with-extra-spaces-fails.png` — searching the same word with extra spaces typed before and after it shows "No data found" instead. The search box looks the same at a glance because spaces don't show up visually — but the extra spaces are really there, and they're what breaks it.

## Reference

Logged on the Kanban board — Task ID: `6a719baed37031c99c696aca` (Project ID: `6a0456b0e3160f4cd53329fb`), status "To Do", priority Medium.

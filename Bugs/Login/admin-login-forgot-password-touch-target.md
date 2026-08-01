# Bug Report Template

## Title

"Forgot Password?" link is too small to tap comfortably on mobile

## Summary

On a mobile phone screen, the "Forgot Password?" link is quite short in height, making it harder to tap accurately compared to standard guidelines for tappable items.

## Description

### Steps to Reproduce

1. Open the Login page on a mobile phone (or resize a browser window to a mobile size).
2. Try tapping the "Forgot Password?" link.

### Actual Result

The tappable area of the link is noticeably shorter than other buttons on the page, making it easy to miss when tapping.

### Expected Result

The link should have a taller tappable area, similar in size to other buttons on the page, so it's easy to tap accurately.

## Severity

Low

## Priority

P3

## Screenshot Reference

- `evidence/forgot-password-touch-target.png` — taken on a mobile-sized screen, showing the "Forgot Password?" link's actual tappable height (20px) next to the "Log In" button's height (40px) for comparison.
- `evidence/forgot-password-touch-target-console.png` — manually verified at 390x844 via DevTools console (`getBoundingClientRect().height`): the link measures 19.5px, below the WCAG 2.5.8 minimum of 24px.

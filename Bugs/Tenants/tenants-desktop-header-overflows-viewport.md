# Bug Report Template

## Title

At 1280px wide, the header's user info overflows the viewport, scrolling the whole page sideways

## Summary

On the Tenants page at 1280px browser width, the "Admin" name/role block in the top-right of the header sits slightly wider than the screen. This forces the entire page to scroll sideways by ~60px, even though the table itself fits with no overflow of its own. The same header component causes a smaller (~27px) version of this on the Landlords page.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel.
2. Set the browser window to exactly 1280px wide.
3. Open the Tenants page.
4. Scroll the page all the way right.

### Actual Result

The whole page gains a horizontal scrollbar. Scrolling right cuts off the sidebar and search box, revealing empty space to the right of the "Admin" block in the header — the header content itself is wider than the viewport (measured: header right edge at ~1341px against a 1280px window).

### Expected Result

At this width, the header should fit fully inside the viewport with no page-level horizontal scroll.

## Severity

Low

## Priority

P3

## Screenshot Reference

- `evidence/desktop-header-overflow-scroll-left.png` — normal view, scrolled left.
- `evidence/desktop-header-overflow-scroll-right.png` — same page scrolled right, showing the extra space past the header.

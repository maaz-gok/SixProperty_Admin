# Bug Report Template

## Title

At tablet width, the whole page scrolls sideways instead of just the table

## Summary

On a tablet-sized screen (around 768px wide), the sidebar menu stays fully open and the page does not make room for it. Because of this, the entire page — including the search box and page heading, not just the table — has to be scrolled sideways to see the rest of the landlord list. This happens on both the Landlords list page and a single landlord's details page.

## Description

### Steps to Reproduce

1. Sign in to the Admin Panel.
2. Resize the browser window (or use a tablet-sized device) to about 768px wide.
3. Open the Landlords page.
4. Try to scroll right to see the Properties/Tenants/Status/Joined/Actions columns.
5. Repeat by opening any single landlord's details page at the same width.

### Actual Result

The whole page scrolls sideways, not just the table. When you scroll right, the search box and page heading get cut off too, and the table's Name column disappears behind the sidebar. The sidebar menu itself does not shrink or collapse to make room, even though there clearly isn't enough space for it plus the full table.

### Expected Result

At this screen width, either the sidebar should collapse (like it already does on a phone-sized screen), or only the table itself should scroll sideways while everything else — heading, search box, sidebar — stays in place and fully visible.

## Severity

Medium

## Priority

P2

## Screenshot Reference

- `evidence/tablet-page-scroll-left.png` — the page at 768px wide, scrolled all the way left (normal view).
- `evidence/tablet-page-scroll-right.png` — the same page scrolled right: the heading and search box are cut off, and the table's Name column has disappeared, while the sidebar hasn't moved or collapsed at all.

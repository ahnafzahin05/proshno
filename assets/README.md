# Proshno logo assets

These are editable SVG assets intended for the Proshno web project.

## Files
- `proshno-symbol.svg` — standalone transparent symbol, brand green + restrained gold dot
- `proshno-symbol-dark.svg` — standalone symbol for dark surfaces
- `proshno-symbol-ink.svg` / `proshno-symbol-white.svg` — one-color standalone symbols
- `proshno-app-icon.svg` / `proshno-app-icon-dark.svg` — square app/favicon treatments
- `proshno-lockup.svg` — horizontal logo for light surfaces
- `proshno-lockup-dark.svg` — horizontal logo for dark surfaces
- `proshno-lockup-dark-transparent.svg` — dark-theme horizontal logo without a background, used with the mobile hero glow
- `proshno-lockup-one-color.svg` — one-color horizontal lockup

## Palette
- Brand green: `#28634F`
- Warm off-white: `#F7F8F4`
- Dark ink: `#26332E`
- Muted gold: `#8A6327` (dot accent only)
- Dark surface: `#1B2420`
- Dark-mode sage: `#91C6A9`
- Dark-mode text: `#E6ECE7`

## Web integration in this project

The assets are used directly from this directory; no copying or build step is needed.

```jsx
<a href="#/" aria-label="Proshno home">
  <img src="assets/proshno-lockup.svg" alt="" />
</a>
```

For a favicon, add this to the document head:

```html
<link rel="icon" type="image/svg+xml" href="assets/proshno-app-icon.svg" />
```

The shared sidebar uses `proshno-lockup.svg` in light mode and `proshno-lockup-dark.svg` in dark mode. Responsive compact sidebars use `proshno-symbol.svg` or `proshno-symbol-dark.svg`. The standalone symbols have transparent backgrounds.

## Notes
- The wordmark uses `Source Serif 4` with Georgia as a fallback. For consistent rendering,
  load Source Serif 4 in the project or convert the wordmark text to outlines in a vector editor.
- SVGs are scalable and can be recolored by editing their fill values.
- Review the mark at 16, 20, 24, 32, and 48 px before shipping. If the question-shaped counter
  feels too tight at 16 px, use the one-color app icon at 24 px and above.

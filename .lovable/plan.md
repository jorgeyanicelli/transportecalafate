## Plan: Update App Color Scheme to Transporte Calafate Brand Colors

### Goal
Replace the existing teal/cyan "calafate" palette and the supporting "glacier" / "sunset" palettes with the official Transporte Calafate brand colors: dark blue, accent orange, and secondary blue.

### Brand Color Mapping

| Role | Hex | Tailwind Shade |
|------|-----|----------------|
| Primary dark blue (navbar, headings, footer bg) | #1e3a6e | calafate-900 |
| Secondary blue (links, hovers) | #2d6a9f | calafate-700 |
| Accent orange (CTA buttons, highlights) | #f07820 | calafate-600 |
| Lighter orange (button hovers) | #f59240 | calafate-500 |

### Full Calafate Palette (coherent brand scale)

```
calafate-50:  #f0f4f8   (very light blue backgrounds)
calafate-100: #d6e0ed   (light blue, footer text on dark bg)
calafate-200: #b0c2db   (borders)
calafate-300: #8aa3c9   (icons, muted accents)
calafate-400: #5f85b3   (subdued text)
calafate-500: #f59240   (lighter orange — exact)
calafate-600: #f07820   (accent orange — exact)
calafate-700: #2d6a9f   (secondary blue — exact)
calafate-800: #244a7a   (dark blue dividers)
calafate-900: #1e3a6e   (primary dark blue — exact)
calafate-950: #152a50   (very dark blue)
```

### Files to Update

1. **tailwind.config.ts**
   - Replace entire `calafate` color object with the brand palette above.
   - Remove `glacier` and `sunset` color objects entirely.

2. **src/components/Navbar.tsx**
   - Logo: `className="h-25"` → `className="h-16"`
   - Nav link hover: `hover:text-calafate-600` → `hover:text-calafate-700` (secondary blue)
   - Button: `bg-calafate-600 hover:bg-calafate-700` → `bg-calafate-600 hover:bg-calafate-500`

3. **src/components/HeroSection.tsx**
   - CTA button: `bg-sunset-500 hover:bg-sunset-600` → `bg-calafate-600 hover:bg-calafate-500`

4. **src/components/FeatureCard.tsx**
   - Icon circle bg: `bg-glacier-100` → `bg-calafate-100`
   - Icon color: `text-glacier-600` → `text-calafate-600` (orange accent)

5. **src/components/Footer.tsx**
   - Social icon hover: `hover:text-glacier-300` → `hover:text-calafate-300`
   - Contact icons: `text-glacier-300` → `text-calafate-300`

6. **src/components/ReservationForm.tsx**
   - "Continuar" button: `bg-calafate-600 hover:bg-calafate-700` → `bg-calafate-600 hover:bg-calafate-500`
   - "Confirmar Reserva" button: same change

7. **src/pages/NotFound.tsx**
   - Button: `bg-calafate-600 hover:bg-calafate-700` → `bg-calafate-600 hover:bg-calafate-500`

### What Will NOT Change
- Component logic, structure, props, or behavior.
- Any `calafate-50/100/200/300/400/800/900/950` class names already used in components (their underlying hex values will update automatically via Tailwind config).
- The `hero-pattern` and `calafate-background` CSS classes in index.css (they reference image assets, not color tokens).

### Verification
After editing, confirm the preview shows:
- Navbar with dark blue link hovers and orange CTA button.
- Footer with dark blue background.
- Feature icons with orange color on light blue circles.
- No visual breakage from removed `glacier` or `sunset` palettes.
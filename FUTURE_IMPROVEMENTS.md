# Future Improvements — Outbound Cost Calculator

Backlog of enhancements to pick up incrementally. Ordered by impact.

---

## Illustrative Animations (High Impact)

The current SVG illustrations are static geometric wireframes. The original vision was for **animated illustrations** that respond to user selections — objects moving, data flowing, visual storytelling.

**Options:**
- **Animated SVGs** — Add CSS keyframe animations to the existing inline SVGs (nodes pulsing, bars growing, particles drifting). Cheapest path, ~2-3 hours.
- **Lottie animations** — Create or source Lottie JSON files for richer motion (email launching sequences, funnel animations, data node networks). Use `lottie-react`. More polished, ~4-6 hours.
- **Nano Bananas + CSS motion** — Generate custom illustration frames on nanobananas.ai, then animate them with CSS transforms. Best visual quality but requires manual Nano Bananas usage.
- **Selection-responsive visuals** — Illustrations that change based on what the user selects (e.g., picking "DFY Infrastructure" shows rockets launching vs "Branded Domains" shows domain cards stacking). Most ambitious, ~8-10 hours.

## Stitch MCP Integration

The Stitch MCP server was configured (`.claude/settings.local.json`) but never loaded due to a Windows compatibility issue. When resolved:
- Generate full-page design concepts via `build_site`
- Extract refined design tokens from Stitch output
- Use as visual reference for further polish passes

## Additional Animation Polish

- **Animated tab indicators** — Sliding highlight on MonthType toggle (Pilot/Normal) using Framer Motion `layoutId`
- **Segmented control** — Campaign strategy count buttons (1/2/3) with sliding active indicator
- **Number count-up on scroll** — ResultsGallery metric numbers animate from 0 to value when scrolled into view
- **Parallax on hero** — Subtle parallax scroll effect on the header ambient glow blobs
- **Checkbox path animation** — Add-on checkboxes use `motion.path` with `pathLength` animation for the checkmark
- **Confetti on order success** — Tiny crimson particle burst when order succeeds (lightweight, no library)

## Visual Enhancements

- **Noise texture overlay** — The `.glass-noise` CSS class exists but isn't applied anywhere yet. Add to hero and breakdown panel for subtle grain.
- **Hover depth on cards** — Slight translateY + shadow increase on SectionCard hover
- **Progress indicator** — Vertical progress bar on the left showing how far through the configuration the user is
- **Dark/light ambient shift** — Body background subtly shifts glow position based on scroll position

## Email Template

- **Image header** — Add a branded hero banner image to the email (generate with Nano Bananas)
- **Responsive email** — Current template works but could be more polished on mobile email clients
- **Track opens** — Add a tracking pixel for email open analytics

## Performance

- **Image optimization** — Convert campaign result PNGs to WebP, add `next/image` with lazy loading
- **Bundle analysis** — Review Framer Motion tree-shaking, ensure only used features are bundled
- **Font subsetting** — Geist fonts may include unused glyphs

# BoneVista design system

## Product direction

Premium anatomy studio with a black, white and gold palette. The landing page leads with an animated gold skull and editorial serif headlines; the embedded workspace keeps the anatomy viewport as the primary surface. Gold marks interactive and selected states; semantic green/amber/red are reserved for status and warnings.

## Foundations

- **Canvas:** `#050505`; surface: `#0b0b0b`; elevated: `#131312`; hover: `#1c1a16`.
- **Gold ramp:** `#fbf3d5` · `#f1d78a` · `#d4af37` (accent) · `#a8832a` · `#6b5219`. Use `--gradient-gold` for primary buttons and `--gradient-gold-text` for highlighted words.
- **Text:** `#f6f3eb`; secondary: `#b5ae9f`; muted: `#7b7568`.
- **Borders:** hairline `rgba(255,255,255,.07)`; emphasis `rgba(212,175,55,.28)`.
- **Light theme:** ivory `#f8f6f0` canvas with deep gold `#9c7a24` accent.
- **Typography:** Cormorant Garamond for display headings (italic for gold emphasis); Inter for interface text; JetBrains Mono for labels, eyebrows and telemetry.
- **Shape:** 10–22 px radii on cards; pill-shaped primary buttons.

## Motion

- Entrance reveals use `--ease-premium` (`cubic-bezier(.22,.8,.24,1)`) and run once per element.
- Animate only `transform` and `opacity`; never animate filters, shadows or layout.
- Ambient motion (skull line draw, scan beam, marquee) is CSS-only and disabled under `prefers-reduced-motion`.

## Performance rules

- One WebGL canvas per visible feature. 3D scenes pause (`frameloop="never"`) when scrolled off screen.
- Heavy modules (three.js scenes, muscle and neuro explorers, PDF export) are lazy-loaded.
- Per-frame values (camera telemetry, counters) are written to the DOM through refs, not React state.

## Interaction rules

- Keep image-derived patient results separate from the generalized atlas.
- Every visible control must alter the actual scene, navigation, or upload state.
- Clearly label reference anatomy, local-only storage, and unavailable inference.
- Preserve visible keyboard focus and accessible names on icon-only controls.
- On narrow screens, stack the structure list and details below the viewport.

# BoneVista design system

## Product direction

Medical research workstation with a quiet, high-contrast interface. Keep the anatomy viewport as the primary surface. Use restrained teal for active controls and status; use amber only for limitations and unavailable capabilities. The BoneVision screenshots are broad visual references, not a layout or brand to copy.

## Foundations

- **Canvas:** `#080d10`; side rail: `#0b1114`; panels: `#0d1418`.
- **Primary accent:** `#7da2ff`; selected surface: `#18243d`.
- **Text:** `#e8eceb`; secondary: `#819092`; muted: `#657274`.
- **Borders:** `#1e2a2d`; warning: muted amber with a visible explanatory label.
- **Typography:** Manrope for display headings; DM Sans for interface text; DM Mono for technical labels and status.
- **Spacing:** 4 px base; common gaps 8, 12, 20, 28 px.
- **Shape:** small 3–5 px panel radii; avoid ornamental pill cards.

## Interaction rules

- Keep image-derived patient results separate from the generalized atlas.
- Every visible control must alter the actual scene, navigation, or upload state.
- Clearly label reference anatomy, local-only storage, and unavailable inference.
- Preserve visible keyboard focus and accessible names on icon-only controls.
- On narrow screens, stack the structure list and details below the viewport.
- Use transitions for state feedback only; no ambient motion beyond the load indicator.


